/* Optional geographic extension. Only india.json is fetched; hero never awaits it. */
(function () {
  'use strict';
  var DATA_SHA256 = '84ec208e58718fcabeab40d974273f9a401b948dadc582e585861ad529a46b41';
  var MANIFEST_SHA256 = '3303b52cfd5e4614c25fe7dd305acebd73fe1761cb0a61710b75a534c53ac550';
  var CONTRACT = [
    ['hero', 'Punjab–Haryana — frozen study rectangle', [73.8, 27.6, 77.6, 32.6]],
    ['full_extent', 'India & surrounding area — full rectangle', [68, 6.5, 97.5, 37.5]],
    ['northwest', 'Northwest / Indo-Gangetic study rectangle', [68, 24, 88.5, 37.5]],
    ['northeast', 'Northeast study rectangle', [88.5, 21.5, 97.5, 30]],
    ['central', 'Central rectangle', [74, 17.5, 88.5, 24]],
    ['western', 'Western rectangle', [68, 17.5, 74, 24]],
    ['peninsular', 'Peninsular study rectangle', [72.5, 6.5, 88.5, 17.5]]
  ];
  function equal(a, b) { return JSON.stringify(a) === JSON.stringify(b); }
  function count(x) { return Number.isSafeInteger(x) && x >= 0; }
  function change(a, b) { return a === 0 ? null : 100 * (b / a - 1); }
  function rounded(x) { return x === null ? null : Number(x.toFixed(1)); }
  function dates(year, n) {
    return Array.from({ length: n }, function (_, i) {
      return new Date(Date.UTC(year, 9, 1 + i)).toISOString().slice(0, 10);
    });
  }
  function validateData(data, hero) {
    function need(ok) { if (!ok) throw new Error('Geographic data failed validation'); }
    need(data && data.schema === 'india-audit v1' && data.hero_compatibility.passed === true);
    need(data.metadata.provenance.sha256_exact_bytes['extensions/india/data/manifests/pull.json'] === MANIFEST_SHA256);
    need(equal(data.metadata.grid, hero.grid_spec));
    need(Array.isArray(data.rectangles) && data.rectangles.length === CONTRACT.length);
    data.rectangles.forEach(function (region, i) {
      need(region.id === CONTRACT[i][0] && region.label === CONTRACT[i][1] && equal(region.bounds, CONTRACT[i][2]));
      need(region.comparisons.length === hero.presets.length);
      region.comparisons.forEach(function (p, j) {
        var original = hero.presets[j], n = original.id === 'snpp_cessation' ? 45 : 46;
        ['id', 'a', 'b', 'fleet_a', 'fleet_b', 'shared'].forEach(function (k) { need(equal(p[k], original[k])); });
        ['a', 'b'].forEach(function (tag) {
          var period = p.periods[tag], daily = period.daily;
          need(equal(period.dates, dates(p[tag], n)) && equal(period.interval, [period.dates[0], period.dates[n - 1]]));
          need(equal(period.satellites, p['fleet_' + tag]) && equal(period.shared, p.shared));
          need(period.coverage.product === (p[tag] === 2026 ? 'NRT' : 'SP'));
          ['W', 'U', 'C'].forEach(function (role) {
            need(count(p[role + '_' + tag]) && daily[role].length === n && daily[role].every(count));
            need(daily[role].reduce(function (a, b) { return a + b; }, 0) === p[role + '_' + tag]);
          });
          need(daily.W.every(function (w, k) { return w === daily.U[k] + daily.C[k]; }));
          if (region.id === 'hero') {
            var wd = hero.daily[String(p[tag])][original['fleet_' + tag].join('+')].slice(0, n);
            var ud = hero.daily[String(p[tag])][original.shared.join('+')].slice(0, n);
            need(equal(daily.W, wd) && equal(daily.U, ud));
          }
        });
        var w = change(p.W_a, p.W_b), u = change(p.U_a, p.U_b);
        need(p.change_W_pct === rounded(w) && p.change_U_pct === rounded(u));
        need(p.diff_pp === (w === null || u === null ? null : rounded(w - u)));
      });
    });
    return true;
  }
  var LABELS = { MODIS_TERRA: 'Terra', MODIS_AQUA: 'Aqua', VIIRS_SNPP: 'Suomi NPP', VIIRS_NOAA20: 'NOAA-20' };
  var MINUS = '−', MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  // Signed one-decimal number in the hero style: U+2212 for negatives, no sign on zero.
  function signed(x, plus) { var t = Math.abs(x).toFixed(1); return t === '0.0' ? t : (x < 0 ? MINUS : plus) + t; }
  function pct(x) { return x === null ? 'unavailable (zero baseline)' : signed(x, '+') + '%'; }
  function day(iso) { return MONTHS[Number(iso.slice(5, 7)) - 1] + ' ' + Number(iso.slice(8, 10)); }
  function regionalConclusion(region, p) {
    var w = change(p.W_a, p.W_b), u = change(p.U_a, p.U_b);
    var interval = day(p.periods.a.interval[0]) + ' through ' + day(p.periods.a.interval[1]) + ' in both periods';
    var text = 'Recorded change, ' + region.label + ', ' + p.a + ' → ' + p.b +
      ': all included satellites, ' + pct(rounded(w)) + ' (base ' + p.W_a +
      ' recorded cell-days); ' + p.shared.map(s => LABELS[s]).join('+') + ', ' + pct(rounded(u)) +
      ' (base ' + p.U_a + ' recorded cell-days). Interval: ' + interval + '. ';
    text += w === null || u === null ? 'The dependent selection gap is unavailable. ' :
      'Difference: ' + signed(rounded(w - u), '') + ' percentage points. ';
    text += w !== null && u !== null && Math.abs(w - u) >= 10 ?
      'Requires qualification: neither percentage is a corrected fire estimate, and the difference is not a causal attribution. ' :
      'A small or zero selection gap does not establish comparability: this calculation cannot expose changes within the shared fleet. ';
    return text + 'Actual-fire change is not measured.';
  }
  function regionalEvidence(data, region, p) {
    var conclusion = regionalConclusion(region, p), m = data.metadata;
    var metadata = {
      region: region.label, bounds: region.bounds, geography_warning: m.qualification,
      unit: m.unit, grid: m.grid, grid_disclosure: m.grid_disclosure,
      confidence_rules: m.confidence_rules, noaa21: m.noaa21,
      selections: { a: p.fleet_a, b: p.fleet_b, shared: p.shared },
      periods: {}, missing_data_treatment: m.coverage,
      unverified_excluded: m.unverified_excluded,
      known_missing_outages: m.outage_disclosures_by_comparison[p.id],
      global_product_cessation: m.expected_cessation.map(function (s) {
        return { effective_from_utc: s.effective_from_utc, notice_issued: s.notice_issued,
          evidence: s.evidence, classification: s.classification };
      }), provenance: m.provenance, conclusion: conclusion
    };
    ['a', 'b'].forEach(function (tag) {
      var period = p.periods[tag];
      metadata.periods[tag] = { interval: period.interval, cutoff: period.interval[1],
        product: period.coverage.product, coverage: period.coverage };
    });
    var serialized = JSON.stringify(metadata);
    var csv = ['# Ghost Fleet regional comparison evidence', '# ' + conclusion,
      '# metadata: ' + serialized, 'date_a,date_b,W_a,U_a,C_a,W_b,U_b,C_b,status_a,status_b'];
    p.periods.a.dates.forEach(function (date, i) {
      csv.push([date, p.periods.b.dates[i], p.periods.a.daily.W[i], p.periods.a.daily.U[i],
        p.periods.a.daily.C[i], p.periods.b.daily.W[i], p.periods.b.daily.U[i],
        p.periods.b.daily.C[i], 'recorded', 'recorded'].join(','));
    });
    var report = '# Ghost Fleet — regional comparison evidence\n\n' + conclusion + '\n\n' +
      m.qualification + '\n\nRecorded cell-days: W ' + p.W_a + ' → ' + p.W_b + '; U ' + p.U_a +
      ' → ' + p.U_b + '; C ' + p.C_a + ' → ' + p.C_b + '.\n\n' +
      'Zero is no recorded cell-days in these retrieved records. Known missing intervals remain disclosed; completeness is unknown.\n\n' +
      'Measurement and provenance metadata:\n```json\n' + JSON.stringify(metadata, null, 2) + '\n```\n';
    return { base: 'ghost-fleet-' + region.id + '-' + p.id, report: report, csv: csv.join('\n') + '\n' };
  }
  // Linear locator transform; it is not the analytical grid/projection.
  function project(lon, lat) { return [20 + (lon - 68) * 20, 20 + (37.5 - lat) * 20]; }
  function hitTest(lon, lat, rectangles) {
    var containing = rectangles.filter(function (r) {
      return lon >= r.bounds[0] && lon <= r.bounds[2] && lat >= r.bounds[1] && lat <= r.bounds[3];
    });
    containing.sort(function (a, b) {
      function area(r) { return (r.bounds[2] - r.bounds[0]) * (r.bounds[3] - r.bounds[1]); }
      return area(a) - area(b) || a.id.localeCompare(b.id);
    });
    return containing.length ? containing[0].id : null;
  }
  function createController(options) {
    var data = null, selected = 'hero', generation = 0;
    function fail() {
      data = null; selected = 'hero';
      options.choices(false);
      options.apply(null);
      options.notice('Geographic data unavailable. Reset to the frozen Punjab–Haryana hero; its comparison and downloads remain available.');
    }
    function select(id) {
      try {
        if (id !== 'hero') validateData(data, options.hero);
        var region = id === 'hero' ? null : data.rectangles.find(r => r.id === id);
        if (id !== 'hero' && !region) throw new Error('Unknown rectangle');
        options.apply(region, data);
        selected = id;
        options.choices(Boolean(data), data, selected);
        options.notice('');
      } catch (_) { fail(); }
    }
    async function refresh() {
      var current = ++generation;
      try {
        var candidate = await options.load();
        if (current !== generation) return;
        validateData(candidate, options.hero);
        data = candidate;
        if (selected !== 'hero') select(selected);
        else { options.choices(true, data, selected); options.notice(''); }
      } catch (_) { if (current === generation) fail(); }
    }
    return { select: select, refresh: refresh, fail: fail, selected: function () { return selected; } };
  }
  async function loadTrusted(fetcher, cryptoApi) {
    var response = await fetcher('india.json', { cache: 'no-cache' });
    if (!response.ok) throw new Error('Geographic data unavailable');
    var text = (await response.text()).replace(/\r\n/g, '\n');
    var digest = await cryptoApi.subtle.digest('SHA-256', new TextEncoder().encode(text));
    var hash = Array.from(new Uint8Array(digest)).map(x => x.toString(16).padStart(2, '0')).join('');
    if (hash !== DATA_SHA256) throw new Error('Geographic snapshot hash mismatch');
    return JSON.parse(text);
  }
  function regionContext(data, region, app) {
    var m = data.metadata;
    var audit = { presets: [], daily: {}, coverage: {}, sensors_present: {}, bbox: region.bounds,
      grid_spec: m.grid, grid: 'Canonical fixed ~1 km grid; physical dimensions vary with latitude',
      window: 'Oct 1–Nov 15; comparison-specific cutoff shown below',
      retrieved_at_utc: m.provenance.retrieval_timestamps_utc.slice().sort().at(-1),
      retrieval_timestamp_scope: 'isolated full-rectangle pull; completeness unknown' };
    region.comparisons.forEach(function (original) {
      var p = Object.assign({}, original, { label: region.label + ': ' + original.a + ' → ' + original.b,
        comparison_interval: 'Oct 1 - Nov ' + Number(original.periods.a.interval[1].slice(-2)) + ' in both periods' });
      if (original.periods.a.dates.length === 45) p.comparison_end_mm_dd = '11-14';
      audit.presets.push(p);
      ['a', 'b'].forEach(function (tag) {
        var period = p.periods[tag], year = String(p[tag]);
        audit.daily[year] = {};
        function padded(values) { return values.concat(Array(46 - values.length).fill(null)); }
        audit.daily[year][app.subsetKey(p['fleet_' + tag])] = padded(period.daily.W);
        audit.daily[year][app.subsetKey(p.shared)] = padded(period.daily.U);
        audit.sensors_present[year] = p['fleet_' + tag];
        audit.coverage[year] = { status: period.coverage.status + '; known missing product data disclosed',
          cutoff: period.interval[1], product: period.coverage.product,
          sources: Array.from(new Set(p['fleet_' + tag].map(function (sensor) {
            return (sensor.startsWith('MODIS') ? 'MODIS' : sensor) + '_' + period.coverage.product;
          }))), unverified_dates: p[tag] === 2026 ? ['2026-11-15'] : [] };
      });
    });
    return { audit: audit, label: region.label, bounds: region.bounds,
      conclusion: function (p) { return regionalConclusion(region, p); },
      evidence: function (p) { return regionalEvidence(data, region, p); },
      series: function (p) {
        var series = app.presetSeries(p, audit.daily);
        if (series && series.n < 46) {
          for (var i = series.n; i < 46; i++) series.days[i].a.state = 'excluded';
        }
        return series;
      } };
  }
  var api = { validateData: validateData, CONTRACT: CONTRACT, DATA_SHA256: DATA_SHA256,
    regionalConclusion: regionalConclusion, regionalEvidence: regionalEvidence,
    project: project, hitTest: hitTest, createController: createController, loadTrusted: loadTrusted,
    regionContext: regionContext };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (typeof document !== 'undefined' && window.GhostFleetUI) {
    window.GhostFleetUI.onReady(function (hero) {
      var bridge = window.GhostFleetUI;
      var panel = document.getElementById('geography-panel');
      var status = document.getElementById('geography-status');
      var svg = document.getElementById('geography-map');
      var choices = document.getElementById('geography-choices');
      var extents = document.getElementById('geography-extents');
      var currentData = null;
      function element(tag, text) {
        var node = document.createElement(tag);
        if (text !== undefined) node.textContent = text;
        return node;
      }
      var controller = createController({ hero: hero,
        load: function () { return loadTrusted(fetch, crypto); },
        apply: function (region, data) { bridge.selectGeography(region ? regionContext(data, region, bridge.api) : null); },
        notice: function (text) { status.textContent = text; status.hidden = !text; },
        choices: function (enabled, data, selected) {
          panel.hidden = !enabled;
          if (!enabled) { currentData = null; choices.replaceChildren(); extents.replaceChildren(); return; }
          currentData = data;
          choices.replaceChildren(); extents.replaceChildren();
          document.getElementById('geography-feature').textContent = data.metadata.feature_label;
          document.getElementById('geography-qualification').textContent = data.metadata.qualification;
          data.rectangles.forEach(function (region) {
            var button = element('button', region.label);
            button.type = 'button'; button.setAttribute('type', 'button');
            button.setAttribute('data-region-id', region.id);
            button.setAttribute('aria-pressed', String(region.id === selected));
            button.addEventListener('click', function () { controller.select(region.id); });
            choices.appendChild(button);
            var top = project(region.bounds[0], region.bounds[3]), bottom = project(region.bounds[2], region.bounds[1]);
            var rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            rect.setAttribute('x', top[0]); rect.setAttribute('y', top[1]);
            rect.setAttribute('width', bottom[0] - top[0]); rect.setAttribute('height', bottom[1] - top[1]);
            rect.setAttribute('class', 'geo-extent' + (selected === region.id ? ' is-selected' : ''));
            rect.setAttribute('data-extent-id', region.id);
            var title = document.createElementNS('http://www.w3.org/2000/svg', 'title'); title.textContent = region.label;
            rect.appendChild(title); extents.appendChild(rect);
          });
          var region = data.rectangles.find(r => r.id === selected);
          document.getElementById('geography-current').textContent = region.label +
            ' · bounds [west, south, east, north]: ' + region.bounds.join(', ');
        }
      });
      bridge.onRegionError = function () { controller.fail(); };
      svg.addEventListener('click', function (event) {
        if (!currentData) return;
        var box = svg.getBoundingClientRect();
        if (!box.width || !box.height) return;
        var x = (event.clientX - box.left) / box.width * 630;
        var y = (event.clientY - box.top) / box.height * 660;
        var id = hitTest(68 + (x - 20) / 20, 37.5 - (y - 20) / 20, currentData.rectangles);
        if (id) controller.select(id);
      });
      document.getElementById('geography-refresh').addEventListener('click', function () { controller.refresh(); });
      controller.refresh();
    });
  }
})();
