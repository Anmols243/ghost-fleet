'use strict';
// Run: node --test frontend/tests/system.test.js
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const m = /<section id="system"[\s\S]*?<\/section>/.exec(html);
const section = m ? m[0] : '';
const text = section.replace(/<[^>]+>/g, ' ');

test('system section exists with its nav link after Method checks', () => {
  assert.ok(section.length > 0);
  assert.match(html, /<a href="#method">[^<]*<\/a>\s*<a href="#system">B\. System<\/a>/);
});

test('section carries the audit.json freeze hash, and it is the real hash', () => {
  const raw = fs.readFileSync(path.join(__dirname, '..', 'audit.json'));
  const lf = Buffer.from(raw.toString('latin1').split('\r').join(''), 'latin1');
  const real = crypto.createHash('sha256').update(lf).digest('hex');
  assert.ok(section.includes(real), 'hash in section equals sha256 of the LF audit.json');
});

test('section carries the two dataset totals, and they match audit.json', () => {
  const a = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'audit.json'), 'utf8'));
  const fmt = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  assert.ok(section.includes(fmt(a.dataset_counts.retrieved_detections)));
  assert.ok(section.includes(fmt(a.dataset_counts.standardized_verified_detections)));
  assert.ok(section.includes('1,601,380') && section.includes('1,482,211'));
});

test('no number outside the allowed list appears in the section', () => {
  const allowed = new Set(['1,601,380', '1,482,211', '26', '2001', '2025', '2026', '1', '5', '50', '105', '45', '60', '9,568', '2026']);
  const stripped = text.replace(/[0-9a-f]{64}/g, ' ').replace(/sha256/g, ' ');
  const found = (stripped.match(/\d[\d,]*/g) || []).map((s) => s.replace(/,$/, ''));
  found.forEach((n) => assert.ok(allowed.has(n), 'unexpected number ' + n));
});

test('wording law holds in the section', () => {
  assert.doesNotMatch(text, /MODIS-equivalent|harmoni[sz]ed|homogenised|continuous record|same-eyes|satellite died|agreement|corrected|true fire|caus/i);
});

test('no script, fetch, stylesheet or image inside the section; links only to this repo', () => {
  assert.doesNotMatch(section, /<script|<img|<link|<iframe|fetch\(/i);
  const hrefs = section.match(/href="[^"]*"/g) || [];
  assert.ok(hrefs.length >= 6, 'each pipeline step links to its source');
  hrefs.forEach((h) => assert.match(h, /^href="https:\/\/github\.com\/Anmols243\/ghost-fleet\/blob\/main\/(backend\/scripts|frontend)\/[\w.]+"$/));
});

test('linked source files exist in the repo', () => {
  const repo = path.join(__dirname, '..', '..');
  (section.match(/blob\/main\/([\w./]+)"/g) || []).forEach((m2) => {
    const rel = m2.replace(/^blob\/main\//, '').replace(/"$/, '');
    assert.ok(fs.existsSync(path.join(repo, rel)), rel);
  });
});

test('stage counts derive from audit.json, cell-days equal an independent sum', () => {
  const app = require('../app.js');
  const a = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'audit.json'), 'utf8'));
  const c = app.systemCounts(a);
  assert.equal(c.retrieved, a.dataset_counts.retrieved_detections);
  assert.equal(c.retained, a.dataset_counts.standardized_verified_detections);
  const order = ['MODIS_TERRA', 'MODIS_AQUA', 'VIIRS_SNPP', 'VIIRS_NOAA20'];
  let sum = 0;
  for (const yr of Object.keys(a.sensors_present)) {
    const key = order.filter((x) => a.sensors_present[yr].includes(x)).join('+');
    for (const v of a.daily[yr][key]) if (v !== null) sum += v;
  }
  assert.equal(c.cellDays, sum);
  assert.equal(c.seasons, Object.keys(a.sensors_present).length);
  assert.equal(c.presets, a.presets.length);
  const bad = JSON.parse(JSON.stringify(a)); bad.dataset_counts = null;
  assert.equal(app.systemCounts(bad), null);
});
