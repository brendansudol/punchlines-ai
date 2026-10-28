// Live verification: uses a temporary account, then deletes only its test records.
// NODE_PATH may point at an existing Playwright installation; no browser auth state is saved.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { chromium } = require('playwright');
const { createClient } = require('@supabase/supabase-js');
const { Redis } = require('@upstash/redis');

const baseURL = process.argv[2] || 'http://localhost:3005';
const label = process.argv[3] || 'local';
const evidenceDir = path.resolve(__dirname, '../evaluation/interim-2026-10-28');
const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
const auth = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
const redis = Redis.fromEnv();
const report = { baseURL, timestamp: new Date().toISOString(), checks: [], pageErrors: [] };
let userId, browser;
const keys = new Set();
const check = (name, details) => { report.checks.push({ name, ...details }); console.log(name); };
const rateKey = () => { const key = `@upstash/ratelimit:${userId}:${Math.floor(Date.now() / 21600000)}`; keys.add(key); return key; };

(async () => {
  try {
    browser = await chromium.launch({ channel: 'chrome', headless: true });
    const context = await browser.newContext({ viewport: { width: 1280, height: 950 } });
    const email = `punchlines-preview-${crypto.randomUUID()}@example.invalid`;
    const password = crypto.randomBytes(24).toString('base64url');
    const created = await admin.auth.admin.createUser({ email, password, email_confirm: true });
    if (created.error) throw new Error(`Test account creation failed: ${created.error.message}`);
    userId = created.data.user.id;
    report.testUserId = userId;
    const signedIn = await auth.auth.signInWithPassword({ email, password });
    if (signedIn.error) throw new Error(`Test sign-in failed: ${signedIn.error.message}`);
    const session = signedIn.data.session;
    const projectRef = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname.split('.')[0];
    await context.addCookies([{
      name: `sb-${projectRef}-auth-token`,
      value: encodeURIComponent(JSON.stringify([session.access_token, session.refresh_token, null, null, session.user.factors ?? null])),
      url: baseURL, sameSite: 'Lax'
    }]);
    const page = await context.newPage();
    page.on('pageerror', (e) => report.pageErrors.push(e.message));
    await page.goto(baseURL, { waitUntil: 'networkidle' });
    await page.getByRole('textbox', { name: 'Joke setup' }).waitFor();
    assert.ok(!(await page.getByRole('link', { name: 'Sign in', exact: true }).count()));
    check('Home renders with temporary authenticated account');

    let generationRequests = 0;
    page.on('request', (request) => { if (request.url().endsWith('/api/generate-punchlines')) generationRequests++; });
    const setup = 'My toaster now requires a performance review before breakfast.';
    await page.getByRole('textbox', { name: 'Joke setup' }).fill(setup);
    const generated = page.waitForResponse((r) => r.url().endsWith('/api/generate-punchlines'));
    await page.getByRole('button', { name: 'Generate punchlines', exact: true }).click();
    assert.equal(await page.getByRole('button', { name: 'Generating punchlines' }).isDisabled(), true);
    const nextSetup = 'My calendar has started charging overtime.';
    await page.getByRole('textbox', { name: 'Joke setup' }).fill(nextSetup);
    await page.keyboard.press('Enter');
    const response = await generated;
    const data = await response.json();
    assert.equal(response.status(), 200);
    assert.equal(data.status, 'success');
    assert.equal(data.results.length, 3);
    assert.equal(data.prompt, setup);
    assert.equal(await page.getByRole('textbox', { name: 'Joke setup' }).inputValue(), nextSetup);
    assert.ok(data.id);
    assert.equal(generationRequests, 1);
    rateKey();
    await page.getByRole('button', { name: 'Save punchline 1' }).waitFor({ timeout: 30000 });
    for (const text of data.results) assert.ok(await page.getByText(text, { exact: false }).count());
    const persisted = await admin.from('generated_jokes').select('setup,results,user_id').eq('id', data.id).single();
    assert.equal(persisted.error, null);
    assert.equal(persisted.data.user_id, userId);
    assert.deepEqual(persisted.data.results, data.results);
    check('Real generation → three rendered punchlines → database persistence', { generatedId: data.id, results: data.results, remaining: data.remaining });
    check('Input stays editable while loading; duplicate submission is blocked and results retain the submitted setup');
    await page.screenshot({ path: path.join(evidenceDir, `${label}-results.png`), fullPage: true });

    const saved = page.waitForResponse((r) => r.url().endsWith('/api/save-punchline'));
    await page.getByRole('button', { name: 'Save punchline 1' }).click();
    const savedData = await (await saved).json();
    assert.equal(savedData.status, 'success');
    const savedId = savedData.data.id;
    await page.goto(`${baseURL}/saved`);
    await page.getByText('My saved jokes', { exact: true }).waitFor();
    assert.ok(await page.getByText(data.results[0], { exact: true }).count());
    await page.goto(`${baseURL}/p/${savedId}`);
    await page.getByText(data.results[0], { exact: true }).waitFor();
    check('Favorite saved, listed on /saved, and displayed on its share page', { savedId });

    await page.goto(baseURL);
    const field = page.getByRole('textbox', { name: 'Joke setup' });
    await field.fill('hi');
    await page.getByRole('button', { name: 'Generate punchlines', exact: true }).click();
    await page.getByRole('alert').filter({ hasText: 'longer joke' }).waitFor();
    assert.equal(await page.getByRole('button', { name: 'Generate punchlines', exact: true }).isEnabled(), true);
    check('Validation error is visible and input recovers');

    // Seed only the disposable user's counter at the last permitted request.
    await redis.set(rateKey(), 7, { ex: 21600 });
    await field.fill('My kettle wants a promotion to coffee machine.');
    const lastAllowed = page.waitForResponse((r) => r.url().endsWith('/api/generate-punchlines'));
    await page.getByRole('button', { name: 'Generate punchlines', exact: true }).click();
    const last = await (await lastAllowed).json();
    assert.equal(last.status, 'success'); assert.equal(last.remaining, 0);
    await page.getByRole('button', { name: 'Generate punchlines', exact: true }).waitFor();
    const blocked = page.waitForResponse((r) => r.url().endsWith('/api/generate-punchlines'));
    await page.getByRole('button', { name: 'Generate punchlines', exact: true }).click();
    const blockResponse = await blocked;
    assert.equal(blockResponse.status(), 429);
    assert.equal((await blockResponse.json()).reason, 'rate-limit-user');
    await page.getByRole('alert').filter({ hasText: 'daily joke limit' }).waitFor();
    await page.screenshot({ path: path.join(evidenceDir, `${label}-rate-limit.png`), fullPage: true });
    check('Eighth free request succeeds; next request returns 429 and a visible limit message');

    // Controlled browser response verifies the provider-outage UI, separately from real API tests.
    await page.route('**/api/generate-punchlines', (route) => route.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ status: 'error', reason: 'unknown' }) }));
    await page.getByRole('button', { name: 'Generate punchlines', exact: true }).click();
    await page.getByRole('alert').filter({ hasText: 'problem generating' }).waitFor();
    assert.equal(await field.isEnabled(), true);
    check('Controlled 500 shows recoverable error state');
    assert.deepEqual(report.pageErrors, []);
    report.status = 'passed';
  } catch (error) {
    report.status = 'failed'; report.error = String(error.message);
    console.error(report.error);
    process.exitCode = 1;
  } finally {
    if (browser) await browser.close();
    if (userId) {
      for (const table of ['saved_jokes', 'generated_jokes']) {
        const { error } = await admin.from(table).delete().eq('user_id', userId);
        if (error) { report.cleanupError = `${table}: ${error.message}`; process.exitCode = 1; }
      }
      const profile = await admin.from('users').delete().eq('id', userId);
      if (profile.error) { report.cleanupError = profile.error.message; process.exitCode = 1; }
      const { error } = await admin.auth.admin.deleteUser(userId);
      if (error) { report.cleanupError = error.message; process.exitCode = 1; }
      for (const key of keys) await redis.del(key);
      report.cleanup = report.cleanupError ? 'failed' : 'temporary account, generated/saved records and rate counters removed';
    }
    fs.writeFileSync(path.join(evidenceDir, `${label}-verification.json`), JSON.stringify(report, null, 2) + '\n');
    console.log(JSON.stringify({ status: report.status, cleanup: report.cleanup }));
  }
})();
