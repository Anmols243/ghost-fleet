'use strict';
// Run: node --test frontend/tests/
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const app = require('../app.js');

const audit = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'audit.json'), 'utf8'));
const byId = (id) => audit.presets.find((p) => p.id === id);
const conclude = (id, cov = audit.coverage, daily = audit.daily) =>
  app.buildConclusion(byId(id), cov, daily);

const P1 = 'Recorded change, Punjab + Haryana, 2011 → 2012: all included satellites, +455.2%; Terra+Aqua, +5.3%; difference, 449.8 percentage points. Neither percentage is a corrected estimate of fire activity, and the difference is not a causal attribution. Actual-fire change is not measured.';
const P2 = 'Recorded change, Punjab + Haryana, 2017 → 2018: all included satellites, +99.0%; Terra+Aqua+Suomi NPP, +11.4%; difference, 87.6 percentage points. Neither percentage is a corrected estimate of fire activity, and the difference is not a causal attribution. Actual-fire change is not measured.';
const P3 = 'Recorded change, Punjab + Haryana, 2025 → 2026: all included satellites, −19.0%; Terra+Aqua+Suomi NPP+NOAA-20, −19.0%. Both periods cover Oct 1 through Nov 14; Nov 15 is excluded from this comparison, and 2026 Nov 15 is unverified, not yet retrieved. The two views coincide because the same four satellites are included in both seasons, so the decomposition cannot show the interruption. The included-satellite record is interrupted: S-NPP recorded cell-days run 1 Oct – 2 Nov, and zero from 3 Nov, while NOAA-20 continues. Actual-fire change is not measured.';
const UNAVAILABLE = 'Comparison unavailable for the selected seasons. At least one selected season has an incomplete satellite pull in the retrieved records. Actual-fire change is not measured.';

test('P1 conclusion byte-matches build plan', () => {
  assert.equal(conclude('viirs_transition'), P1);
});
test('P2 conclusion byte-matches build plan', () => {
  assert.equal(conclude('noaa20_transition'), P2);
});
test('P3 interruption conclusion byte-matches build plan', () => {
  assert.equal(conclude('snpp_cessation'), P3);
});

test('unavailable template when a season has unverified dates inside the comparison', () => {
  const cov = JSON.parse(JSON.stringify(audit.coverage));
  cov['2012'].unverified_dates = ['2012-11-01'];
  assert.equal(conclude('viirs_transition', cov), UNAVAILABLE);
});
test('unavailable template when coverage entry is missing', () => {
  const cov = JSON.parse(JSON.stringify(audit.coverage));
  delete cov['2011'];
  assert.equal(conclude('viirs_transition', cov), UNAVAILABLE);
});
test('unavailable template when counts are malformed (no fabricated numbers)', () => {
  const p = JSON.parse(JSON.stringify(byId('viirs_transition')));
  p.W_b = null;
  assert.equal(app.buildConclusion(p, audit.coverage, audit.daily), UNAVAILABLE);
});
test('interruption without daily series is unavailable, never guessed', () => {
  assert.equal(app.buildConclusion(byId('snpp_cessation'), audit.coverage, null), UNAVAILABLE);
});

test('small gap uses the small-gap template and never says agreement', () => {
  const p = JSON.parse(JSON.stringify(byId('viirs_transition')));
  p.W_b = 14000; p.U_b = 14000; p.C_b = 0;
  const s = app.buildConclusion(p, audit.coverage, audit.daily);
  assert.match(s, /A small selection gap does not prove that either percentage measures actual fire activity\. Neither percentage is a corrected estimate of fire activity\. Actual-fire change is not measured\.$/);
  assert.doesNotMatch(s, /agreement/i);
});

test('computed percentages match the frozen preset fields', () => {
  for (const p of audit.presets) {
    const w = app.pctChange(p.W_a, p.W_b);
    const u = app.pctChange(p.U_a, p.U_b);
    assert.ok(Math.abs(w - p.change_W_pct) < 0.05, p.id + ' W');
    assert.ok(Math.abs(u - p.change_U_pct) < 0.05, p.id + ' U');
    assert.ok(Math.abs((w - u) - p.diff_pp) < 0.1, p.id + ' diff');
    assert.equal(p.W_a, p.U_a + p.C_a);
    assert.equal(p.W_b, p.U_b + p.C_b);
  }
});

test('snapshot statement is derived from data and byte-matches the build plan', () => {
  const want = 'The last S-NPP detection in this snapshot is dated 2 November; none appear afterward through the verified cutoff. NOAA-20 detections continue through 14 November.';
  assert.equal(app.snapshotStatement(byId('snpp_cessation'), audit.daily), want);
  assert.equal(app.snapshotStatement(byId('viirs_transition'), audit.daily), null);
});
test('interruption refuses a false 1 Oct start when S-NPP is zero on day one', () => {
  const d = JSON.parse(JSON.stringify(audit.daily));
  d['2026'].VIIRS_SNPP[0] = 0;
  assert.equal(app.buildConclusion(byId('snpp_cessation'), audit.coverage, d), UNAVAILABLE);
});
