'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const geo = require('../geography.js');
const data = JSON.parse(fs.readFileSync(path.join(__dirname, '../india.json'), 'utf8'));
const hero = JSON.parse(fs.readFileSync(path.join(__dirname, '../audit.json'), 'utf8'));

test('candidate validation checks schema, provenance, geography and exact hero daily values', () => {
  assert.equal(geo.validateData(data, hero), true);
  for (const mutate of [
    d => { d.schema = 'unsupported'; },
    d => { d.metadata.provenance.sha256_exact_bytes['extensions/india/data/manifests/pull.json'] = '0'.repeat(64); },
    d => { d.rectangles[1].bounds[0] = 0; },
    d => { d.rectangles[0].comparisons[0].periods.a.daily.W[0] += 1; }
  ]) {
    const bad = JSON.parse(JSON.stringify(data)); mutate(bad);
    assert.throws(() => geo.validateData(bad, hero));
  }
});

test('all regional conclusions and evidence use their own label, totals and daily arrays', () => {
  for (const region of data.rectangles.filter(r => r.id !== 'hero')) {
    for (const p of region.comparisons) {
      const conclusion = geo.regionalConclusion(region, p);
      const evidence = geo.regionalEvidence(data, region, p);
      assert.ok(conclusion.includes(region.label));
      assert.doesNotMatch(conclusion, /Punjab|last detection|recorded cell-days run|while NOAA-20 continues/);
      assert.ok(conclusion.endsWith('Actual-fire change is not measured.'));
      assert.ok(evidence.report.includes(conclusion) && evidence.csv.includes(conclusion));
      const meta = JSON.parse(evidence.csv.split('\n').find(l => l.startsWith('# metadata: ')).slice(12));
      assert.deepEqual(meta.bounds, region.bounds);
      assert.ok(meta.geography_warning.includes('do not partition India'));
      assert.deepEqual(meta.grid.origin_lon_lat, [73.8, 27.6]);
      assert.ok(meta.provenance && meta.periods.a.product && meta.periods.b.cutoff);
      const lines = evidence.csv.split('\n').filter(l => l && !l.startsWith('#')).slice(1);
      assert.equal(lines.length, p.periods.a.dates.length);
      const totals = lines.map(l => l.split(',').slice(2, 8).map(Number)).reduce((a, row) => a.map((v, i) => v + row[i]), [0,0,0,0,0,0]);
      assert.deepEqual(totals, [p.W_a,p.U_a,p.C_a,p.W_b,p.U_b,p.C_b]);
    }
  }
});

test('map projection is shared and hit-testing selects smallest containing rectangle', () => {
  assert.deepEqual(geo.project(68, 37.5), [20, 20]);
  assert.deepEqual(geo.project(97.5, 6.5), [610, 640]);
  assert.equal(geo.hitTest(75, 30, data.rectangles), 'hero');
  assert.equal(geo.hitTest(80, 30, data.rectangles), 'northwest');
  assert.equal(geo.hitTest(70, 10, data.rectangles), 'full_extent');
  assert.equal(geo.hitTest(60, 10, data.rectangles), null);
});

test('pending/missing/malformed data never exposes choices; selected-region failure resets visibly to hero', async () => {
  const events = [];
  let load = () => Promise.resolve(data);
  const controller = geo.createController({ hero, load: () => load(),
    apply: region => events.push(['apply', region ? region.id : 'hero']),
    choices: enabled => events.push(['choices', enabled]), notice: text => events.push(['notice', text]) });
  assert.equal(controller.selected(), 'hero');
  assert.equal(events.length, 0, 'constructing extension does not initialize or delay hero');
  await controller.refresh();
  controller.select('central');
  assert.equal(controller.selected(), 'central');
  load = () => Promise.reject(new Error('404'));
  await controller.refresh();
  assert.equal(controller.selected(), 'hero');
  assert.deepEqual(events.slice(-3).map(e => e[0]), ['choices', 'apply', 'notice']);
  assert.deepEqual(events.at(-2), ['apply', 'hero']);
  assert.match(events.at(-1)[1], /Reset to.*hero/i);
  for (const invalid of [null, {}, {schema: 'unsupported'}]) {
    load = () => Promise.resolve(invalid);
    await controller.refresh();
    assert.deepEqual(events.at(-3), ['choices', false]);
  }
  load = () => new Promise(() => {});
  controller.refresh();
  assert.equal(controller.selected(), 'hero', 'unsettled optional fetch does not block hero');
});

test('trusted loader rejects HTTP errors and mismatched data hash', async () => {
  const crypto = require('node:crypto').webcrypto;
  const text = fs.readFileSync(path.join(__dirname, '../india.json'), 'utf8');
  const good = await geo.loadTrusted(async () => ({ok: true, text: async () => text}), crypto);
  assert.equal(good.rectangles.length, 7);
  await assert.rejects(geo.loadTrusted(async () => ({ok: false}), crypto));
  await assert.rejects(geo.loadTrusted(async () => ({ok: true, text: async () => text.replace('central', 'invalid')}), crypto));
});

test('region adapter reuses the comparison series layout while preserving excluded/unverified dates', () => {
  const app = require('../app.js');
  const region = data.rectangles.find(r => r.id === 'central');
  const context = geo.regionContext(data, region, app);
  assert.deepEqual(context.audit.bbox, region.bounds);
  for (const p of context.audit.presets) {
    const series = context.series(p);
    assert.ok(series);
    assert.equal(series.n, p.id === 'snpp_cessation' ? 45 : 46);
    assert.match(context.conclusion(p), /Central rectangle/);
    assert.doesNotMatch(context.conclusion(p), /Punjab|recorded cell-days run/);
    if (p.id === 'snpp_cessation') {
      assert.equal(series.days[45].a.state, 'excluded');
      assert.equal(series.days[45].b.state, 'unverified');
      assert.equal(series.days[45].a.W, null);
      assert.equal(series.days[45].b.W, null);
    }
  }
});

test('hero entry initializes without requesting or awaiting geographic data', () => {
  const requests = [], listeners = {};
  const window = {};
  const document = { readyState: 'loading', addEventListener: (name, callback) => { listeners[name] = callback; },
    getElementById: () => ({textContent: ''}) };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../app.js'), 'utf8'), {
    window, document, fetch: url => { requests.push(url); return new Promise(() => {}); }
  });
  assert.equal(typeof window.GhostFleetUI.onReady, 'function');
  listeners.DOMContentLoaded();
  assert.deepEqual(requests, ['audit.json']);
  assert.equal(window.GhostFleetUI.getHero(), null);
});

test('regional conclusions use readable dates and the hero minus sign', () => {
  for (const region of data.rectangles) {
    if (region.id === 'hero') continue;
    for (const p of region.comparisons) {
      const text = geo.regionalConclusion(region, p);
      assert.match(text, /Interval: Oct 1 through Nov 1[45] in both periods\./);
      assert.doesNotMatch(text, /\d{2}-\d{2} through/);
      assert.doesNotMatch(text, /, -\d|\(-|: -\d/, 'no hyphen-minus before a number');
    }
  }
  const ne = data.rectangles.find((r) => r.id === 'northeast');
  assert.match(geo.regionalConclusion(ne, ne.comparisons[0]), /Terra\+Aqua, \u221212\.7%/);
});
