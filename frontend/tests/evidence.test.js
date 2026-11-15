'use strict';
// Run: node --test frontend/tests/evidence.test.js
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const app = require('../app.js');

const audit = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'audit.json'), 'utf8'));
const clone = (o) => JSON.parse(JSON.stringify(o));

// Parse the generated CSV text the way a consumer would (skip # comment lines).
function parseCsv(text) {
  const lines = text.split('\n').filter((l) => l.length && l[0] !== '#');
  const head = lines[0].split(',');
  const rows = lines.slice(1).map((l) => l.split(','));
  return { head, rows };
}
const sumCol = (csv, name) => {
  const i = csv.head.indexOf(name);
  assert.ok(i >= 0, 'column ' + name);
  return csv.rows.reduce((s, r) => s + (r[i] === '' ? 0 : Number(r[i])), 0);
};

for (const p of audit.presets) {
  test(p.id + ': CSV column sums equal preset totals', () => {
    const s = app.presetSeries(p, audit.daily);
    assert.ok(s, 'series');
    const csv = parseCsv(app.buildCsv(p, s));
    assert.deepEqual(csv.head.slice(0, 7), ['date', 'W_a', 'U_a', 'C_a', 'W_b', 'U_b', 'C_b']);
    assert.equal(sumCol(csv, 'W_a'), p.W_a);
    assert.equal(sumCol(csv, 'U_a'), p.U_a);
    assert.equal(sumCol(csv, 'C_a'), p.C_a);
    assert.equal(sumCol(csv, 'W_b'), p.W_b);
    assert.equal(sumCol(csv, 'U_b'), p.U_b);
    assert.equal(sumCol(csv, 'C_b'), p.C_b);
    assert.equal(csv.rows.length, p.comparison_end_mm_dd ? 45 : 46);
    csv.rows.forEach((r) => assert.equal(Number(r[1]) - Number(r[2]), Number(r[3]), 'C = W - U per day'));
  });

  test(p.id + ': report holds the exact FINDING string, totals and contract', () => {
    const md = app.buildReport(p, audit);
    const finding = app.buildConclusion(p, audit.coverage, audit.daily);
    assert.ok(md.includes(finding), 'finding string');
    [p.W_a, p.W_b, p.U_a, p.U_b, p.C_a, p.C_b].forEach((n) => assert.ok(md.includes(app.fmtInt(n)), 'total ' + n));
    assert.ok(md.includes('Zero means no detections in these retrieved records.'));
    assert.ok(md.includes(audit.retrieval_timestamp_scope));
    assert.ok(md.includes(app.COPY.noaa21));
    assert.ok(md.includes('Actual-fire change: not measured'));
    assert.ok(md.includes('FRP is never summed across sensors'));
    assert.doesNotMatch(md, /agreement|MODIS-equivalent|harmoni[sz]ed|homogenised|continuous record|same-eyes|satellite died/i);
  });
}

test('P3 series: 45 days, both Nov 15 values explained, unavailable is never zero', () => {
  const p = audit.presets.find((x) => x.id === 'snpp_cessation');
  const s = app.presetSeries(p, audit.daily);
  assert.equal(s.n, 45);
  assert.equal(s.days.length, 46);
  assert.equal(s.days[45].a.state, 'excluded');
  assert.equal(s.days[45].b.state, 'unverified');
  assert.equal(s.days[45].b.W, null);
  const md = app.buildReport(p, audit);
  assert.match(md, /2025 Nov 15[^\n]*excluded from this comparison/);
  assert.match(md, /2026 Nov 15[^\n]*unverified[^\n]*not yet retrieved/);
  const csv = app.buildCsv(p, s);
  assert.ok(!/^11-15,/m.test(csv), 'Nov 15 row is not in the CSV');
});

test('P1 series carries a status column; every row is recorded', () => {
  const p = audit.presets[0];
  const csv = parseCsv(app.buildCsv(p, app.presetSeries(p, audit.daily)));
  assert.deepEqual(csv.head.slice(7), ['status_a', 'status_b']);
  csv.rows.forEach((r) => { assert.equal(r[7], 'recorded'); assert.equal(r[8], 'recorded'); });
});

test('series refuse totals that do not reproduce the preset (no fabricated numbers)', () => {
  const p = audit.presets[0];
  const d = clone(audit.daily);
  d[String(p.b)].MODIS_TERRA[3] += 1;
  d[String(p.b)]['MODIS_TERRA+MODIS_AQUA'][3] += 1;
  d[String(p.b)]['MODIS_TERRA+MODIS_AQUA+VIIRS_SNPP'][3] += 1;
  assert.equal(app.presetSeries(p, d), null);
  assert.equal(app.presetSeries(p, null), null);
  const q = clone(p); q.W_a = null;
  assert.equal(app.presetSeries(q, audit.daily), null);
});

test('null inside the comparison interval makes the series unavailable, not zero', () => {
  const p = audit.presets[0];
  const d = clone(audit.daily);
  d[String(p.b)]['MODIS_TERRA+MODIS_AQUA+VIIRS_SNPP'][10] = null;
  assert.equal(app.presetSeries(p, d), null);
});

test('evidence is unavailable when the conclusion is unavailable', () => {
  const p = audit.presets[0];
  const a = clone(audit);
  a.coverage['2012'].unverified_dates = ['2012-11-01'];
  assert.equal(app.buildEvidence(p, a), null);
  assert.ok(app.buildEvidence(p, audit));
});

test('heat colour scale is shared: same value, same colour; max from both W series', () => {
  const p = audit.presets[0];
  const s = app.presetSeries(p, audit.daily);
  assert.equal(s.max, Math.max.apply(null, s.days.map((d) => Math.max(d.a.W || 0, d.b.W || 0))));
  assert.equal(app.heatColor(0, s.max), app.heatColor(0, 999));
  assert.notEqual(app.heatColor(1, s.max), app.heatColor(s.max, s.max));
  assert.equal(app.heatColor(null, s.max), null);
});

test('cumulative curves end at the preset totals', () => {
  for (const p of audit.presets) {
    const s = app.presetSeries(p, audit.daily);
    const c = app.cumulative(s);
    assert.equal(c.W_a[c.W_a.length - 1], p.W_a);
    assert.equal(c.U_b[c.U_b.length - 1], p.U_b);
    assert.equal(c.W_b[c.W_b.length - 1] - c.U_b[c.U_b.length - 1], p.C_b);
  }
});

test('method checks are rendered from data only, superseded values never appear', () => {
  const m = app.methodFacts(audit.method_checks, audit.coverage);
  const txt = JSON.stringify(m);
  assert.ok(txt.includes('0.403') && txt.includes('0.252') && txt.includes('0.086'));
  assert.ok(!/0\.520|0\.216/.test(txt));
  assert.equal(m.addition.rawRange, '+215% to +544%');
  assert.equal(m.addition.degRange, '+11% to +177%');
  assert.equal(m.benchmark.failed, true);
  assert.equal(app.methodFacts(null, audit.coverage), null);
  const bad = clone(audit.method_checks); delete bad.benchmark_2021.predictors.ratio;
  assert.equal(app.methodFacts(bad, audit.coverage), null);
});

test('strata and single-sensor facts derive from data', () => {
  const st = app.strata(audit.sensors_present);
  const snpp = st.find((r) => r.code === 'VIIRS_SNPP');
  assert.equal(snpp.from, 2012);
  assert.equal(snpp.to, 2026);
  const n21 = st.find((r) => r.code === 'VIIRS_NOAA21');
  assert.equal(n21.from, null);
  const cs = app.caseFacts(audit);
  assert.equal(cs.year, 2026);
  assert.equal(cs.cessation.last.day, 2);
  assert.equal(cs.cessation.lastIdx, 32);
});
