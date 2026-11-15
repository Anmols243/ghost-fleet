'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
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
