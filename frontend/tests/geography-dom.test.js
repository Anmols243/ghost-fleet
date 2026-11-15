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
