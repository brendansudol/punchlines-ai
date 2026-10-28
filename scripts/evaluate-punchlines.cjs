const fs = require('node:fs');
const path = require('node:path');
const OpenAI = require('openai').default;
const { buildPunchlineRequest, parsePunchlines, EXAMPLES, PROMPT_VERSION } = require('./load-punchlines.cjs');

const dir = path.resolve(__dirname, '../evaluation/interim-2026-10-28');
const setups = JSON.parse(fs.readFileSync(path.join(dir, 'setups.json'), 'utf8'));
const model = process.argv[2];
const count = Number(process.argv[3] || 80);
const limit = Number(process.argv[4] || setups.length);
if (!['gpt-6.1-sol', 'gpt-6.1-terra'].includes(model)) throw new Error('Pass an evaluated model ID');
const bank = count > 80 ? JSON.parse(fs.readFileSync(path.join(dir, 'extended-examples.json'), 'utf8')) : EXAMPLES;
if (bank.length < count) throw new Error('Not enough reviewed examples');
const file = path.join(dir, `${model}-${count}.jsonl`);
const previous = fs.existsSync(file) ? fs.readFileSync(file, 'utf8').trim().split('\n').filter(Boolean).map(JSON.parse) : [];
const pending = setups.slice(0, limit).filter((s) => !previous.some((r) => r.id === s.id));
const client = new OpenAI({ maxRetries: 0, timeout: 45000 });

async function run(item) {
  const start = performance.now();
  let record = { ...item, model, exampleCount: count, promptVersion: PROMPT_VERSION, timestamp: new Date().toISOString() };
  try {
    const response = await client.chat.completions.create(buildPunchlineRequest(item.setup, model, bank.slice(0, count)));
    record = { ...record, latencyMs: Math.round(performance.now() - start), responseModel: response.model,
      usage: response.usage, finishReason: response.choices[0]?.finish_reason,
      rawContent: response.choices[0]?.message.content, requestId: response._request_id };
    record.punchlines = parsePunchlines(response, item.setup);
  } catch (error) {
    record = { ...record, latencyMs: Math.round(performance.now() - start), error: {
      name: error.name, status: error.status, code: error.code,
      message: String(error.message).replaceAll(process.env.OPENAI_API_KEY || 'NO_KEY', '[REDACTED]')
    } };
  }
  fs.appendFileSync(file, `${JSON.stringify(record)}\n`);
  console.log(JSON.stringify({ model, count, id: item.id, latencyMs: record.latencyMs, ok: !!record.punchlines, error: record.error }));
  return !record.error;
}

(async () => {
  // First request checks compatibility and establishes the shared prompt cache.
  if (pending.length && !(await run(pending.shift()))) process.exitCode = 1;
  else await Promise.all(Array.from({ length: 2 }, async () => {
    while (pending.length) await run(pending.shift());
  }));
})();
