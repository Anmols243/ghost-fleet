'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { loadAppendices } = require('../appendices.js');

test('optional appendix failures never prevent another appendix rendering', async () => {
  const rendered = [];
  const files = [
    { file: 'missing.json', schema: 'missing v1' },
    { file: 'ledger.json', schema: 'observation-ledger v1' }
  ];
  const fetcher = async (file) => {
    if (file === 'missing.json') throw new Error('not deployed');
    return { ok: true, json: async () => ({ schema: 'observation-ledger v1', rows: [] }) };
  };
  const result = await loadAppendices(fetcher, files, (file) => rendered.push(file));
  assert.deepEqual(rendered, ['ledger.json']);
  assert.deepEqual(result, [false, true]);
});

test('malformed schema and renderer exceptions are isolated from successful loads', async () => {
  const files = ['bad', 'render-fails', 'good'].map(file => ({ file, schema: 'v1' }));
  const rendered = [];
  const result = await loadAppendices(async file => ({ ok: true,
    json: async () => ({ schema: file === 'bad' ? 'unknown' : 'v1', rows: [] })
  }), files, file => {
    if (file === 'render-fails') throw new Error('malformed row');
    rendered.push(file);
  });
  assert.deepEqual(result, [false, false, true]);
  assert.deepEqual(rendered, ['good']);
});

async function renderedAppendices() {
  // Minimal DOM seam: executes the actual browser entry and renderer, no copies.
  function node(tag) {
    return { tag, children: [], textContent: '', appendChild(child) { this.children.push(child); } };
  }
  const main = node('main'), nav = node('nav');
  const pending = [];
  const document = { createElement: node, querySelector: selector => selector === 'main' ? main : nav };
  const fetch = file => {
    const response = Promise.resolve({ ok: true, json: async () =>
      JSON.parse(fs.readFileSync(path.join(__dirname, '..', file), 'utf8')) });
    pending.push(response);
    return response;
  };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '..', 'appendices.js'), 'utf8'),
    { document, fetch });
  await Promise.all(pending);
  await new Promise(resolve => setImmediate(resolve));
  return main;
}

test('loaded timing appendix shows the binding caption and a visible n column', async () => {
  const main = await renderedAppendices();
  const timing = main.children.find(section => section.id === 'timing');
  assert.ok(timing, 'timing section renders when its file loads');
  function text(node) { return node.textContent + ' ' + node.children.map(text).join(' '); }
  const output = text(timing);
  assert.ok(output.includes('The timing of retained daytime detections changes across this record. This summary does not measure orbital drift or the effect of drift on counts.'));
  assert.match(output, /n \(retained daytime detections\)/);
  assert.match(output, /4969/);
  assert.match(output, /no retained daytime observations/);
});

test('loaded transition table shows all pairs, counts, boundary and common cutoff', async () => {
  const main = await renderedAppendices();
  const section = main.children.find(item => item.id === 'transitions');
  assert.ok(section, 'transition section renders when its own file loads');
  function text(node) { return node.textContent + ' ' + node.children.map(text).join(' '); }
  const output = text(section);
  assert.ok(output.includes('A zero selection gap does not establish comparability: this calculation cannot expose changes within the shared fleet.'));
  assert.match(output, /Small base: 2001 W = 1,192/);
  assert.match(output, /2025 → 2026/);
  assert.match(output, /Oct 1–Nov 14 \(45 days\)/);
  assert.match(output, /17712/);
  assert.match(output, /14341/);
  assert.match(output, /W change \(% of W_a\)/);
  assert.equal((output.match(/20\d\d → 20\d\d/g) || []).length, 25);
});
