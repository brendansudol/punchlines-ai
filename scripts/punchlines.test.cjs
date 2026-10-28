const assert = require('node:assert/strict');
const test = require('node:test');
const { buildPunchlineRequest, parsePunchlines, getPunchlineModel, EXAMPLES } = require('./load-punchlines.cjs');

const setup = 'My fridge hired a life coach.';
const lines = ['It now charges by the shelf.', 'The leftovers are working on themselves.', 'It told the freezer to let it go.'];
const completion = (punchlines = lines, overrides = {}) => ({
  choices: [{ finish_reason: 'stop', message: { content: JSON.stringify({ punchlines }) }, ...overrides }]
});

test('validates all three punchlines before saving', () => {
  assert.deepEqual(parsePunchlines(completion(lines.map((s) => ` ${s} `)), setup), lines);
  for (const bad of [[], lines.slice(0, 2), [...lines, 'Extra'], ['', ...lines.slice(1)], [7, ...lines.slice(1)], [lines[0], lines[0].toUpperCase(), lines[2]], [setup + ' Again.', ...lines.slice(1)]]) {
    assert.throws(() => parsePunchlines(completion(bad), setup));
  }
});

test('rejects truncated, refused and malformed responses', () => {
  for (const finish_reason of ['length', 'content_filter', 'tool_calls']) {
    assert.throws(() => parsePunchlines(completion(lines, { finish_reason }), setup));
  }
  assert.throws(() => parsePunchlines(completion(lines, { message: { content: null, refusal: 'No' } }), setup));
  assert.throws(() => parsePunchlines(completion(lines, { message: { content: 'not JSON' } }), setup));
  assert.throws(() => parsePunchlines({ choices: [] }, setup));
  assert.throws(() => parsePunchlines({ choices: [...completion().choices, ...completion().choices] }, setup));
});

test('invalid configuration never silently chooses another model', () => {
  assert.equal(getPunchlineModel(undefined), 'gpt-6.1-terra');
  assert.equal(getPunchlineModel('gpt-6.1-sol'), 'gpt-6.1-sol');
  assert.throws(() => getPunchlineModel('retired-model'));
});

test('setup formatting preserves existing punctuation and adds a missing period', () => {
  const content = (setup) => buildPunchlineRequest(setup, 'gpt-6.1-terra').messages[1].content;
  assert.equal(content('  My fridge hired a life coach  '), 'My fridge hired a life coach.');
  for (const ending of ['.', '!', '?', '"', '”', '…']) {
    const setup = `My fridge hired a life coach${ending}`;
    assert.equal(content(setup), setup);
  }
});

test('model settings, output contract and cache prefix are compatible', () => {
  for (const model of ['gpt-6.1-sol', 'gpt-6.1-terra']) {
    const request = buildPunchlineRequest(setup, model);
    assert.equal(request.model, model);
    assert.equal(request.response_format.json_schema.schema.properties.punchlines.minItems, 3);
    assert.equal(request.response_format.json_schema.schema.properties.punchlines.maxItems, 3);
    assert.equal(request.reasoning_effort, model === 'gpt-6.1-sol' ? 'low' : 'none');
    assert.equal('temperature' in request, model === 'gpt-6.1-terra');
    assert.equal('n' in request, false);
    assert.equal('max_tokens' in request, false);
    assert.equal(request.store, false);
    assert.deepEqual(request.messages[0], buildPunchlineRequest('A different setup.', model).messages[0]);
    assert.equal(request.messages[1].content, setup);
  }
  assert.equal(EXAMPLES.length, 80);
  assert.equal(new Set(EXAMPLES.map((e) => e.sourceRow)).size, 80);
});
