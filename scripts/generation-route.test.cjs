const assert = require('node:assert/strict');
const test = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');
const OpenAI = require('openai').default;
const promptHelpers = require('./load-punchlines.cjs');

function fixture() {
  const state = { calls: [], saves: [], limits: 0, limit: { success: true, remaining: 7 }, results: ['First ending.', 'Second ending.', 'Third ending.'] };
  class FakeOpenAI {
    static APIError = OpenAI.APIError;
    chat = { completions: { create: async (request) => {
      state.calls.push(request);
      if (state.providerError) throw state.providerError;
      return { choices: [{ finish_reason: state.finishReason || 'stop', message: { content: JSON.stringify({ punchlines: state.results }) } }] };
    } } };
  }
  class FakeRatelimit {
    static fixedWindow() {}
    async limit() { state.limits++; if (state.limitError) throw Error('redis offline'); return state.limit; }
  }
  const mocks = {
    '@supabase/auth-helpers-nextjs': { createRouteHandlerClient: () => ({ auth: { getUser: async () => ({ data: {} }) } }) },
    '@upstash/ratelimit': { Ratelimit: FakeRatelimit },
    '@upstash/redis': { Redis: { fromEnv: () => ({}) } },
    'next/headers': { cookies: () => ({}) },
    'next/server': { NextResponse: { json: (body, init) => Response.json(body, init) } },
    openai: FakeOpenAI,
    '@/lib/profanity': { profanity: { check: () => false } },
    '@/lib/punchlines': promptHelpers,
    '@/lib/rate-limit': { getIp: () => 'test-only', RATE_LIMIT_TOKENS: 8, RATE_LIMIT_WINDOW: '6 h' },
    '@/lib/supabase-admin': { addPunchlinesToDb: async (record) => {
      if (state.saveError) throw Error('db offline'); state.saves.push(record); return 'test-record';
    } }
  };
  const filename = path.resolve(__dirname, '../app/api/generate-punchlines/route.ts');
  const loaded = new Module(filename, module);
  loaded.require = (name) => {
    if (!(name in mocks)) throw Error(`Unexpected dependency: ${name}`);
    return mocks[name];
  };
  loaded._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true }
  }).outputText, filename);
  return { state, request: (body = { prompt: 'My printer joined a union.' }) => loaded.exports.POST(new Request('http://localhost/api/generate-punchlines', {
    method: 'POST', body: typeof body === 'string' ? body : JSON.stringify(body)
  })) };
}

test('invalid bodies fail before rate limiting or generation', async () => {
  const f = fixture();
  for (const body of ['{', null, {}, { prompt: 7 }, { prompt: '     ' }, { prompt: 'x'.repeat(151) }]) {
    assert.equal((await f.request(body)).status, 400);
  }
  assert.equal(f.state.limits, 0);
  assert.equal(f.state.calls.length, 0);
});

test('three validated outputs are persisted and returned in the existing contract', async () => {
  const f = fixture(); const response = await f.request(); const data = await response.json();
  assert.equal(response.status, 200);
  assert.equal(data.id, 'test-record');
  assert.equal(data.remaining, 7);
  assert.deepEqual(data.results, f.state.results);
  assert.deepEqual(f.state.saves[0].results, f.state.results);
  assert.equal(f.state.calls.length, 1);
});

test('rate limits block requests but store outages preserve generation', async (t) => {
  t.mock.method(console, 'error', () => {});
  const f = fixture(); f.state.limit.success = false;
  let response = await f.request(); assert.equal(response.status, 429);
  assert.equal((await response.json()).reason, 'rate-limit-user');
  assert.equal(f.state.calls.length, 0);
  f.state.limitError = true;
  response = await f.request(); assert.equal(response.status, 200);
  assert.equal((await response.json()).remaining, undefined);
  assert.equal(f.state.calls.length, 1);
});

test('provider rate limit and invalid completions never save or fall back', async (t) => {
  t.mock.method(console, 'error', () => {});
  const f = fixture();
  f.state.providerError = new OpenAI.APIError(429, { message: 'rate limited' }, 'rate limited', new Headers());
  let response = await f.request(); assert.equal(response.status, 429);
  assert.equal((await response.json()).reason, 'rate-limit-global');
  f.state.providerError = undefined; f.state.finishReason = 'length';
  response = await f.request(); assert.equal(response.status, 500);
  assert.equal(f.state.saves.length, 0);
  assert.equal(f.state.calls.length, 2);
});

test('the existing OPENAI_MODEL_ID setting selects the requested model', async () => {
  const previous = process.env.OPENAI_MODEL_ID;
  try {
    process.env.OPENAI_MODEL_ID = 'gpt-6.1-sol';
    const f = fixture();
    assert.equal((await f.request()).status, 200);
    assert.equal(f.state.calls[0].model, 'gpt-6.1-sol');
  } finally {
    if (previous === undefined) delete process.env.OPENAI_MODEL_ID;
    else process.env.OPENAI_MODEL_ID = previous;
  }
});

test('database failure preserves generated results without claiming they were saved', async (t) => {
  t.mock.method(console, 'error', () => {});
  const f = fixture(); f.state.saveError = true;
  const response = await f.request(); const data = await response.json();
  assert.equal(response.status, 200);
  assert.equal(data.id, undefined);
  assert.deepEqual(data.results, f.state.results);
});
