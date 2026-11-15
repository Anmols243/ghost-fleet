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
  const allowed = new Set(['1,601,380', '1,482,211', '26', '2001', '2025', '2026', '1', '5', '50', '9,568', '24', '2026']);
  const stripped = text.replace(/[0-9a-f]{64}/g, ' ').replace(/sha256/g, ' ');
  const found = (stripped.match(/\d[\d,]*/g) || []).map((s) => s.replace(/,$/, ''));
  found.forEach((n) => assert.ok(allowed.has(n), 'unexpected number ' + n));
});

test('wording law holds in the section', () => {
  assert.doesNotMatch(text, /MODIS-equivalent|harmoni[sz]ed|homogenised|continuous record|same-eyes|satellite died|agreement|corrected|true fire|caus/i);
});

test('static: no script, fetch, link or image inside the section', () => {
  assert.doesNotMatch(section, /<script|<img|<link|<iframe|fetch\(|http/i);
});
