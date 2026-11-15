'use strict';
// Run: node --test frontend/tests/nav.test.js
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const app = require('../app.js');

const audit = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'audit.json'), 'utf8'));
const src = fs.readFileSync(path.join(__dirname, '..', 'app.js'), 'utf8');

test('mini-result and headline share one rendered string', () => {
  for (const p of audit.presets) {
    assert.equal(app.headlineText(p, 'all'), app.fmtPct(app.pctChange(p.W_a, p.W_b)) + '%');
    assert.equal(app.headlineText(p, 'shared'), app.fmtPct(app.pctChange(p.U_a, p.U_b)) + '%');
  }
  // both call sites go through headlineText, nothing retyped
  assert.match(src, /class: 'headline'[^\n]*text: headlineText\(p, view\)/);
  assert.match(src, /class: 'mini-v', text: headlineText\(p, view\)/);
});

test('second download button runs the same action as the rail button', () => {
  assert.match(src, /btn\.addEventListener\('click', function \(\) \{ state\.download\(\); \}\);/);
  assert.match(src, /dl2\.addEventListener\('click', function \(\) \{ if \(state\.download\) state\.download\(\); \}\);/);
  assert.match(src, /class: 'download download-2', text: COPY\.download/);
});

test('W/U/C explainer is built from the table labels only', () => {
  const p = audit.presets[0];
  const l = app.selectionLabels(p);
  assert.equal(app.wucLine(p), l.W + ' · ' + l.U + ' · ' + l.C);
  assert.equal(l.U, 'U: Terra+Aqua (same named satellites)');
  assert.match(src, /row\(selectionLabels\(p\)\.W,/);
});

test('added helper strings keep the wording law', () => {
  const added = app.COPY.steps.concat([app.COPY.switchHelp, app.COPY.miniLink]).join(' ');
  assert.doesNotMatch(added, /fire|burn|correct|true|real|caus|agreement|same-eyes/i);
});
