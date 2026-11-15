'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const {parseHTML} = require('linkedom');
const crypto = require('node:crypto').webcrypto;

async function mounted(mode = 'valid', readyHook) {
  const {window, document} = parseHTML(fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8'));
  const blobs = new Map(), requests = [];
  let currentMode = mode;
  window.matchMedia = () => ({matches: true});
  window.IntersectionObserver = undefined;
  const URL = {createObjectURL(blob) { const id = 'blob:test-' + blobs.size; blobs.set(id, blob); return id; }, revokeObjectURL() {}};
  const context = vm.createContext({window, document, console, Blob, URL, crypto, TextEncoder,
    setTimeout, clearTimeout, fetch: async url => {
      requests.push(url);
      if (url === 'india.json' && currentMode === 'missing') return {ok: false};
      const text = url === 'india.json' && currentMode === 'malformed' ? '{broken' :
        fs.readFileSync(path.join(__dirname, '..', url), 'utf8');
      return {ok: true, text: async () => text, json: async () => JSON.parse(text)};
    }});
  for (const file of ['app.js', 'geography.js']) {
    vm.runInContext(fs.readFileSync(path.join(__dirname, '..', file), 'utf8'), context, {filename: file});
    if (file === 'app.js' && readyHook) readyHook(window.GhostFleetUI);
  }
  async function settle(predicate) {
    for (let i = 0; i < 200; i++) {
      if (predicate && predicate()) return;
      await new Promise(resolve => setTimeout(resolve, 2));
    }
  }
  await settle(() => document.querySelectorAll('[data-region-id]').length === 7 ||
    Boolean(document.querySelector('#geography-status')?.textContent) ||
    document.querySelector('#app').textContent.includes('Could not load audit.json'));
  return {window, document, blobs, requests, setMode: value => { currentMode = value; },
    flush: async predicate => settle(predicate) };
}

test('seven keyboard-native choices default to exact hero, then all regions reuse layout and own downloads', async () => {
  const env = await mounted();
  const {document, window} = env;
  const original = document.querySelector('.finding-text').textContent;
  const originalReportLink = document.querySelector('#evidence a');
  const originalReport = await env.blobs.get(originalReportLink.getAttribute('href')).text();
  const buttons = [...document.querySelectorAll('[data-region-id]')];
  assert.equal(buttons.length, 7);
  assert.equal(buttons.filter(b => b.getAttribute('aria-pressed') === 'true')[0].getAttribute('data-region-id'), 'hero');
  assert.ok(buttons.every(b => b.tagName === 'BUTTON' && b.getAttribute('type') === 'button'));
  for (const id of ['full_extent', 'northwest', 'northeast', 'central', 'western', 'peninsular']) {
    document.querySelector('[data-region-id="'+id+'"]').dispatchEvent(new window.Event('click'));
    assert.equal(document.querySelectorAll('.finding-text').length, 1, 'same shared renderer layout');
    assert.doesNotMatch(document.querySelector('.finding-text').textContent, /Punjab|recorded cell-days run/);
    assert.equal(document.querySelectorAll('.snapshot').length, 0);
    const report = await env.blobs.get(document.querySelector('#evidence a').getAttribute('href')).text();
    assert.ok(report.includes(document.querySelector('.finding-text').textContent));
    assert.match(document.querySelector('#h-comparison').textContent, /rectangle/);
  }
  document.querySelector('[data-region-id="hero"]').dispatchEvent(new window.Event('click'));
  assert.equal(document.querySelector('.finding-text').textContent, original);
  const report = await env.blobs.get(document.querySelector('#evidence a').getAttribute('href')).text();
  assert.equal(report, originalReport);
});

test('missing/malformed extension leaves hero workflow and evidence intact', async () => {
  const app = require('../app.js');
  const hero = JSON.parse(fs.readFileSync(path.join(__dirname, '../audit.json'), 'utf8'));
  for (const mode of ['missing', 'malformed']) {
    const env = await mounted(mode);
    assert.equal(env.document.querySelectorAll('[data-region-id]').length, 0);
    assert.equal(env.document.querySelector('#geography-panel').hidden, true);
    assert.equal(env.document.querySelector('.finding-text').textContent,
      app.buildConclusion(hero.presets[0], hero.coverage, hero.daily));
    assert.ok(env.document.querySelector('#evidence a'));
    assert.ok(env.requests.every(url => ['audit.json', 'india.json'].includes(url)));
  }
});

test('refresh failure while selected visibly resets hero and prevents mislabelled values', async () => {
  const env = await mounted();
  const {document, window} = env;
  const heroFinding = document.querySelector('.finding-text').textContent;
  document.querySelector('[data-region-id="central"]').dispatchEvent(new window.Event('click'));
  assert.match(document.querySelector('#h-comparison').textContent, /Central rectangle/);
  env.setMode('missing');
  document.querySelector('#geography-refresh').dispatchEvent(new window.Event('click'));
  await env.flush(() => document.querySelector('#geography-panel').hidden);
  assert.equal(document.querySelector('#geography-panel').hidden, true);
  assert.equal(document.querySelector('.finding-text').textContent, heroFinding);
  assert.equal(document.querySelector('#h-comparison').textContent, '1.0 / COMPARISON');
  assert.match(document.querySelector('#geography-status').textContent, /Reset to.*hero/);
  assert.equal(document.querySelector('#geography-status').hidden, false);
  assert.equal(document.querySelector('#docket').hidden, false);
});

test('an optional ready callback exception cannot fail hero initialization', async () => {
  const env = await mounted('valid', ui => ui.onReady(() => { throw new Error('optional failure'); }));
  assert.ok(env.document.querySelector('.finding-text'));
  assert.doesNotMatch(env.document.querySelector('#app').textContent, /Could not load audit.json/);
});

const click = (window, el) => el.dispatchEvent(new window.Event('click'));

test('every region x preset x fleet view renders its own conclusion, no S-NPP snapshot, matching report', async () => {
  const env = await mounted();
  const {document, window} = env;
  for (const id of ['full_extent', 'northwest', 'northeast', 'central', 'western', 'peninsular']) {
    click(window, document.querySelector('[data-region-id="' + id + '"]'));
    const label = document.querySelector('[data-region-id="' + id + '"]').textContent;
    for (let t = 0; t < 3; t++) {
      click(window, document.querySelectorAll('.tab')[t]);
      for (let v = 0; v < 2; v++) {
        click(window, document.querySelectorAll('.switch-btn')[v]);
        const finding = document.querySelector('.finding-text').textContent;
        assert.ok(finding.startsWith('Recorded change, ' + label + ','), id + ' ' + t + ' ' + v);
        assert.doesNotMatch(finding, /recorded cell-days run|NOAA-20 continues/);
        assert.equal(document.querySelectorAll('.snapshot').length, 0);
        assert.ok(document.querySelector('.result-title').textContent.startsWith(label));
        const report = await env.blobs.get(document.querySelector('#evidence a').getAttribute('href')).text();
        assert.ok(report.includes(finding));
        const csvLink = document.querySelectorAll('#evidence a')[1];
        const csv = await env.blobs.get(csvLink.getAttribute('href')).text();
        assert.ok(csv.includes(finding));
      }
    }
    click(window, document.querySelectorAll('.tab')[0]);
  }
});

test('map clicks pick the smallest containing rectangle with one highlight and pressed state', async () => {
  const env = await mounted();
  const {document, window} = env;
  const geo = require('../geography.js');
  const svg = document.querySelector('#geography-map');
  svg.getBoundingClientRect = () => ({left: 0, top: 0, width: 630, height: 660});
  const at = (lon, lat) => { const [x, y] = geo.project(lon, lat); const e = new window.Event('click'); e.clientX = x; e.clientY = y; svg.dispatchEvent(e); };
  for (const [lon, lat, id] of [[75.5, 30, 'hero'], [80, 28, 'northwest'], [95, 10, 'full_extent'], [78, 12, 'peninsular'], [93, 25, 'northeast']]) {
    at(lon, lat);
    assert.equal(document.querySelectorAll('.geo-extent.is-selected').length, 1);
    assert.equal(document.querySelector('.geo-extent.is-selected').getAttribute('data-extent-id'), id);
    const pressed = [...document.querySelectorAll('[data-region-id]')].filter(b => b.getAttribute('aria-pressed') === 'true');
    assert.deepEqual(pressed.map(b => b.getAttribute('data-region-id')), [id]);
  }
  assert.equal(document.querySelectorAll('.geo-extent').length, 7);
  assert.equal(document.querySelectorAll('#geography-map clipPath, #geography-map mask').length, 0);
});

test('a region render error after a preset switch visibly resets to the hero, never a mislabelled view', async () => {
  const app = require('../app.js');
  const hero = JSON.parse(fs.readFileSync(path.join(__dirname, '../audit.json'), 'utf8'));
  const env = await mounted();
  const {document, window} = env;
  click(window, document.querySelector('[data-region-id="central"]'));
  window.GhostFleetUI.api.presetSeries = () => { throw new Error('injected'); };
  click(window, document.querySelectorAll('.tab')[1]);
  assert.equal(document.querySelector('#h-comparison').textContent, '1.0 / COMPARISON');
  assert.equal(document.querySelector('.finding-text').textContent,
    app.buildConclusion(hero.presets[1], hero.coverage, hero.daily));
  assert.equal(document.querySelector('#geography-status').hidden, false);
  assert.equal(document.querySelector('#docket').hidden, false);
});

test('inline outline path is the local licensed GeoJSON through the same projection', () => {
  const geo = require('../geography.js');
  const g = JSON.parse(fs.readFileSync(path.join(__dirname, '../assets/india-outline.geojson'), 'utf8'));
  const ring = (g.features ? g.features[0] : g).geometry.coordinates[0];
  const d = ring.map((c, i) => { const [x, y] = geo.project(c[0], c[1]); return (i ? 'L' : 'M') + x.toFixed(3) + ',' + y.toFixed(3); }).join(' ');
  const html = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');
  const inline = /id="geography-outline"[^>]*\sd="([^"]+)"/.exec(html)[1];
  assert.equal(inline.replace(/ Z$/, ''), d);
  assert.ok(fs.readFileSync(path.join(__dirname, '../assets/INDIA_OUTLINE_LICENSE.md'), 'utf8').includes('Natural Earth'));
});
