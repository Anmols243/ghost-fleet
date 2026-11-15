/* Ghost Fleet, Fire Trend Audit. Vanilla JS, zero dependencies.
   Reads one file: audit.json. Every number on screen is rendered from it. */
(function () {
  'use strict';

  /* ---------- constants (labels and fixed copy, no data values) ---------- */
  var LABELS = {
    MODIS_TERRA: 'Terra',
    MODIS_AQUA: 'Aqua',
    VIIRS_SNPP: 'Suomi NPP',
    VIIRS_NOAA20: 'NOAA-20',
    VIIRS_NOAA21: 'NOAA-21'
  };
  var CHIP_ORDER = ['MODIS_TERRA', 'MODIS_AQUA', 'VIIRS_SNPP', 'VIIRS_NOAA20'];
  var PRESET_TABS = {
    viirs_transition: 'P1 VIIRS transition',
    noaa20_transition: 'P2 NOAA-20 transition',
    snpp_cessation: 'P3 S-NPP cessation'
  };
  var MONTHS = { 10: 'Oct', 11: 'Nov' };
  var NUMWORDS = { 2: 'two', 3: 'three', 4: 'four', 5: 'five' };
  var MINUS = '−';
  var TAIL = ' Actual-fire change is not measured.';

  var COPY = {
    claim: 'Ghost Fleet — Fire Trend Audit compares active-fire cell-days between Punjab–Haryana burning seasons using the same geographic mask, grid, date rules, and confidence criteria. It shows the recorded change for all included satellites, the change for satellites present in both periods, and the difference between them. It does not estimate the change in actual burning.',
    download: 'Download the comparison evidence',
    snapshotBanner: '2026 data snapshot — S-NPP data delivery ceased 2 Nov.',
    noaa21: 'No NOAA-21 data are in the comparison',
    warning: 'This percentage is not a corrected fire count. It uses only the satellites present in both periods.',
    footer: 'Actual-fire change: not measured',
    unavailable: 'Comparison unavailable for the selected seasons. At least one selected season has an incomplete satellite pull in the retrieved records. Actual-fire change is not measured.'
  };

  /* ---------- pure helpers ---------- */
  function isCount(n) { return typeof n === 'number' && isFinite(n) && n >= 0 && Math.floor(n) === n; }
  function label(code) { return LABELS[code] || code; }
  function sharedLabel(codes, sep) { return codes.map(label).join(sep || '+'); }

  // Percentage change from unrounded integer counts. Null when undefined.
  function pctChange(from, to) {
    if (!isCount(from) || !isCount(to) || from === 0) return null;
    return (to / from - 1) * 100;
  }
  function fmtPct(x) {
    var s = Math.abs(x).toFixed(1);
    if (s === '0.0') return '0.0';
    return (x < 0 ? MINUS : '+') + s;
  }
  function fmtDiff(x) { return Math.abs(x).toFixed(1); }
  function fmtInt(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ','); }

  // index 0 = Oct 1 ... index 45 = Nov 15
  function dateOf(i) {
    var m = i <= 30 ? 10 : 11;
    return { mon: MONTHS[m], day: i <= 30 ? i + 1 : i - 30, mm: m };
  }
  function idxOf(mmdd) {
    var m = /^(\d\d)-(\d\d)$/.exec(mmdd || '');
    if (!m) return -1;
    var mo = +m[1], d = +m[2];
    if (mo === 10) return d - 1;
    if (mo === 11) return d + 30;
    return -1;
  }

  // Preset must be internally consistent or nothing is rendered from it.
  function presetValid(p) {
    if (!p) return false;
    var ok = ['W_a', 'U_a', 'C_a', 'W_b', 'U_b', 'C_b'].every(function (k) { return isCount(p[k]); });
    if (!ok) return false;
    if (p.W_a !== p.U_a + p.C_a || p.W_b !== p.U_b + p.C_b) return false;
    if (!Array.isArray(p.shared) || !p.shared.length) return false;
    if (!Array.isArray(p.fleet_a) || !Array.isArray(p.fleet_b)) return false;
    return typeof p.a === 'number' && typeof p.b === 'number';
  }

  function coverageComplete(preset, coverage) {
    if (!coverage) return false;
    var endIdx = preset.comparison_end_mm_dd ? idxOf(preset.comparison_end_mm_dd) : 45;
    return [preset.a, preset.b].every(function (yr) {
      var c = coverage[String(yr)];
      if (!c || !Array.isArray(c.unverified_dates)) return false;
      return c.unverified_dates.every(function (d) {
        var i = idxOf(String(d).slice(5));
        return i > endIdx;
      });
    });
  }

  // Interruption facts come from the daily series, never typed in.
  function snppFacts(preset, daily) {
    var s = daily && daily[String(preset.b)] && daily[String(preset.b)].VIIRS_SNPP;
    var n = daily && daily[String(preset.b)] && daily[String(preset.b)].VIIRS_NOAA20;
    if (!Array.isArray(s) || !Array.isArray(n)) return null;
    var endIdx = idxOf(preset.comparison_end_mm_dd);
    if (endIdx < 0) return null;
    var last = -1, i;
    for (i = 0; i <= endIdx; i++) {
      if (s[i] === null || typeof s[i] !== 'number') return null;
      if (s[i] > 0) last = i;
    }
    if (last < 0 || last >= endIdx) return null;
    for (i = last + 1; i <= endIdx; i++) if (s[i] !== 0) return null;
    if (!(n[endIdx] > 0) || !(s[0] > 0)) return null;
    return { last: dateOf(last), zeroFrom: dateOf(last + 1), end: dateOf(endIdx) };
  }

  var MONTH_FULL = { Oct: 'October', Nov: 'November' };
  // Bounded snapshot statement, dates derived from the daily series.
  function snapshotStatement(preset, daily) {
    var f = preset && preset.comparison_end_mm_dd ? snppFacts(preset, daily) : null;
    if (!f) return null;
    return 'The last S-NPP detection in this snapshot is dated ' + f.last.day + ' ' + MONTH_FULL[f.last.mon] +
      '; none appear afterward through the verified cutoff. NOAA-20 detections continue through ' +
      f.end.day + ' ' + MONTH_FULL[f.end.mon] + '.';
  }

  function buildConclusion(preset, coverage, daily) {
    if (!presetValid(preset) || !coverageComplete(preset, coverage)) return COPY.unavailable;
    var w = pctChange(preset.W_a, preset.W_b);
    var u = pctChange(preset.U_a, preset.U_b);
    if (w === null || u === null) return COPY.unavailable;
    var diff = w - u;
    var head = 'Recorded change, Punjab + Haryana, ' + preset.a + ' → ' + preset.b +
      ': all included satellites, ' + fmtPct(w) + '%; ' + sharedLabel(preset.shared) + ', ' + fmtPct(u) + '%';

    if (preset.comparison_end_mm_dd) {
      var facts = snppFacts(preset, daily);
      var iv = /^(\w+ \d+) - (\w+ \d+) in both periods$/.exec(preset.comparison_interval || '');
      var word = NUMWORDS[preset.shared.length];
      var endIdx = idxOf(preset.comparison_end_mm_dd);
      if (!facts || !iv || !word || endIdx < 0 || endIdx >= 45) return COPY.unavailable;
      var after = dateOf(endIdx + 1);
      var afterTxt = after.mon + ' ' + after.day;
      return head + '. Both periods cover ' + iv[1].replace(/ - .*/, '') + ' through ' + iv[2] +
        '; ' + afterTxt + ' is excluded from this comparison, and ' + preset.b + ' ' + afterTxt +
        ' is unverified, not yet retrieved. The two views coincide because the same ' + word +
        ' satellites are included in both seasons, so the decomposition cannot show the interruption.' +
        ' The included-satellite record is interrupted: S-NPP recorded cell-days run 1 Oct – ' +
        facts.last.day + ' ' + facts.last.mon + ', and zero from ' + facts.zeroFrom.day + ' ' +
        facts.zeroFrom.mon + ', while NOAA-20 continues.' + TAIL;
    }

    var tail = TAIL;
    var core = head + '; difference, ' + fmtDiff(diff) + ' percentage points. ';
    if (Math.abs(diff) >= 10) {
      return core + 'Neither percentage is a corrected estimate of fire activity, and the difference is not a causal attribution.' + tail;
    }
    return core + 'A small selection gap does not prove that either percentage measures actual fire activity. ' +
      'Neither percentage is a corrected estimate of fire activity.' + tail;
  }

  var api = {
    buildConclusion: buildConclusion, snapshotStatement: snapshotStatement, pctChange: pctChange, fmtPct: fmtPct, fmtDiff: fmtDiff,
    fmtInt: fmtInt, presetValid: presetValid, coverageComplete: coverageComplete,
    label: label, sharedLabel: sharedLabel, COPY: COPY
  };
  if (typeof module !== 'undefined' && module.exports) { module.exports = api; }
  if (typeof document === 'undefined') return;

  /* ---------- DOM ---------- */
  var state = { audit: null, preset: 0, view: 'all' };
  var root;

  function h(tag, attrs) {
    var el = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      if (k === 'class') el.className = attrs[k];
      else if (k === 'text') el.textContent = attrs[k];
      else if (attrs[k] !== false && attrs[k] !== null && attrs[k] !== undefined) el.setAttribute(k, attrs[k] === true ? '' : attrs[k]);
    });
    for (var i = 2; i < arguments.length; i++) {
      var c = arguments[i];
      if (c === null || c === undefined || c === false) continue;
      el.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
    }
    return el;
  }
  function clear(el) { while (el.firstChild) el.removeChild(el.firstChild); }
  function kicker(text) { return h('p', { class: 'kicker', text: text }); }

  function showError(msg) {
    clear(root);
    root.appendChild(h('div', { class: 'state state-error', role: 'alert' },
      h('p', { class: 'kicker', text: 'DATA UNAVAILABLE' }),
      h('p', { text: msg + ' No figures are shown, and an empty result is not a count of zero.' })));
  }

  function docket(a) {
    var years = Object.keys(a.sensors_present).map(Number).sort(function (x, y) { return x - y; });
    var b = a.bbox;
    var items = [
      'DOCKET GF-' + years[years.length - 1],
      'SOURCE NASA FIRMS - MODIS C6.1 / VIIRS 375 m',
      'REGION PUNJAB-HARYANA ' + b[0] + '-' + b[2] + '°E, ' + b[1] + '-' + b[3] + '°N',
      years.length + ' SEASONS ' + years[0] + '-' + years[years.length - 1],
      fmtInt(a.dataset_counts.retrieved_detections) + ' DETECTIONS RETRIEVED / ' +
        fmtInt(a.dataset_counts.standardized_verified_detections) + ' RETAINED',
      'DATA FROZEN - ' + a.schema.replace('audit-app ', 'audit.json ')
    ];
    var el = document.querySelector('#docket .wrap');
    clear(el);
    items.forEach(function (t) { el.appendChild(h('span', { class: 'docket-item', text: t })); });
  }

  function seasonLine(a, yr) {
    var c = a.coverage[String(yr)];
    if (!c) return null;
    var prov = c.product === 'NRT' ? ' Provisional (near real time).' : '';
    return h('div', { class: 'cov-row' },
      h('dt', { text: 'Season ' + yr }),
      h('dd', { text: c.status + '; cutoff ' + c.cutoff + '; product ' + c.product + '; sources ' + c.sources.join(', ') + '.' + prov +
        (c.unverified_dates.length ? ' Unverified, not yet retrieved: ' + c.unverified_dates.join(', ') + ' (null, excluded from totals).' : '') }));
  }

  function coverageStrip(a, p) {
    var ts = a.retrieved_at_utc ? new Date(a.retrieved_at_utc) : null;
    var tsTxt = ts && !isNaN(ts) ? ts.toISOString().slice(0, 16).replace('T', ' ') + ' UTC' : 'unavailable';
    var g = a.grid_spec;
    var cmp = p.comparison_interval || ('Full window, ' + a.window);
    var dl = h('dl', { class: 'coverage-list' },
      h('div', { class: 'cov-row' }, h('dt', { text: 'Requested interval' }), h('dd', { text: a.window })),
      h('div', { class: 'cov-row' }, h('dt', { text: 'Comparison interval' }), h('dd', { text: cmp })),
      seasonLine(a, p.a), seasonLine(a, p.b),
      h('div', { class: 'cov-row' }, h('dt', { text: 'Retrieved' }),
        h('dd', { text: tsTxt + '. Scope: ' + a.retrieval_timestamp_scope + '.' })),
      h('div', { class: 'cov-row' }, h('dt', { text: 'Study area' }),
        h('dd', { text: 'Bounding box ' + a.bbox[0] + '-' + a.bbox[2] + '°E, ' + a.bbox[1] + '-' + a.bbox[3] +
          '°N. A rectangle, not an administrative boundary.' })),
      h('div', { class: 'cov-row' }, h('dt', { text: 'Grid' }),
        h('dd', { text: a.grid + '; ' + g.type + ', origin ' + g.origin_lon_lat[0] + '°E ' + g.origin_lon_lat[1] +
          '°N, reference latitude ' + g.reference_latitude + ', Earth radius ' + g.earth_radius_km + ' km, cell ' +
          g.cell_km + ' km, ' + g.index + ' index. Days are UTC dates.' })),
      h('div', { class: 'cov-row' }, h('dt', { text: 'Confidence rule' }),
        h('dd', { text: 'MODIS: confidence 50 or above. VIIRS: nominal and high only.' })),
      h('div', { class: 'cov-row' }, h('dt', { text: 'Zero' }),
        h('dd', { text: 'Zero means no detections in these retrieved records.' })),
      h('div', { class: 'cov-row' }, h('dt', { text: 'NOAA-21' }), h('dd', { text: COPY.noaa21 + '.' })));
    var el = document.getElementById('coverage');
    clear(el);
    el.appendChild(h('details', { class: 'coverage', open: true },
      h('summary', { text: 'Coverage and measurement contract' }), dl));
  }

  function chipRow(heading, fleet, shared, view) {
    var row = h('div', { class: 'chip-row' }, h('span', { class: 'chip-head', text: heading }));
    CHIP_ORDER.forEach(function (code) {
      var inFleet = fleet.indexOf(code) >= 0;
      var inShared = shared.indexOf(code) >= 0;
      var cls = 'chip' + (inFleet ? ' chip-on' : ' chip-off');
      if (view === 'shared' && inFleet && !inShared) cls += ' chip-dim';
      var note = !inFleet ? ' (not in this period)' : (view === 'shared' && !inShared ? ' (excluded from the same-named view)' : '');
      row.appendChild(h('span', { class: cls, text: label(code), title: label(code) + note, 'aria-label': label(code) + note }));
    });
    return row;
  }

  function render() {
    var a = state.audit, p = a.presets[state.preset], view = state.view;
    var panel = document.getElementById('compare');
    clear(panel);

    if (!presetValid(p)) {
      panel.appendChild(h('div', { class: 'state state-error', role: 'alert' },
        h('p', { class: 'kicker', text: 'COMPARISON UNAVAILABLE' }),
        h('p', { text: COPY.unavailable })));
      coverageStrip(a, p || {});
      return;
    }
    coverageStrip(a, p);

    var isAll = view === 'all';
    var sLabel = sharedLabel(p.shared, '+');
    var pct = isAll ? pctChange(p.W_a, p.W_b) : pctChange(p.U_a, p.U_b);
    var base = isAll ? p.W_a : p.U_a;
    var wp = pctChange(p.W_a, p.W_b), up = pctChange(p.U_a, p.U_b);
    var diff = wp !== null && up !== null ? wp - up : null;

    // preset tabs
    var tabs = h('div', { class: 'tabs', role: 'group', 'aria-label': 'Preset comparison' });
    a.presets.forEach(function (pp, i) {
      var b = h('button', { type: 'button', class: 'tab', 'aria-pressed': String(i === state.preset),
        text: (PRESET_TABS[pp.id] || pp.id) + ' (' + pp.a + '→' + pp.b + ')' });
      b.addEventListener('click', function () { state.preset = i; render(); });
      tabs.appendChild(b);
    });

    // fleet switch
    var sw = h('div', { class: 'switch', role: 'group', 'aria-label': 'Satellite selection' });
    [['all', 'All included satellites'], ['shared', 'Same named satellites']].forEach(function (o) {
      var b = h('button', { type: 'button', class: 'switch-btn', 'aria-pressed': String(view === o[0]), text: o[1] });
      b.addEventListener('click', function () { state.view = o[0]; render(); });
      sw.appendChild(b);
    });

    var resultTitle = isAll ? 'All included satellites' : 'Same named satellites — ' + sharedLabel(p.shared, ' + ');
    var denomWho = isAll ? 'all included satellites' : sLabel;
    var result = h('div', { class: 'result' },
      h('p', { class: 'result-title', text: resultTitle }),
      h('p', { class: 'headline', 'aria-live': 'polite', text: pct === null ? 'n/a' : fmtPct(pct) + '%' }),
      h('p', { class: 'denom', text: 'recorded cell-days, ' + denomWho + ', relative to the ' + p.a + ' count of ' + fmtInt(base) }),
      h('p', { class: 'result-sub', text: p.a + ' → ' + p.b + ': ' + fmtInt(base) + ' → ' + fmtInt(isAll ? p.W_b : p.U_b) + ' recorded cell-days' }),
      diff === null ? null : h('p', { class: 'gap', text: 'Difference between the two views: ' + fmtDiff(diff) + ' percentage points (selection difference, not a causal attribution).' }),
      !isAll ? h('p', { class: 'warning', role: 'note', text: COPY.warning }) : null);

    var chips = h('div', { class: 'chips' },
      chipRow(String(p.a), p.fleet_a, p.shared, view),
      chipRow(String(p.b), p.fleet_b, p.shared, view),
      p.b === 2026 ? h('p', { class: 'chip-note', text: COPY.noaa21 }) : null);

    var snapStmt = snapshotStatement(p, a.daily);
    var snapshot = p.comparison_end_mm_dd ? h('section', { class: 'snapshot', 'aria-labelledby': 'snap-h' },
      h('p', { class: 'kicker', id: 'snap-h', text: 'DATA SNAPSHOT' }),
      h('p', { class: 'banner', text: COPY.snapshotBanner }),
      h('p', { text: snapStmt || 'S-NPP cessation details unavailable from the retrieved records.' })) : null;

    function figFrame(t) {
      return h('figure', { class: 'fig placeholder' },
        h('figcaption', { text: t }),
        h('p', { class: 'ph-note', text: 'Figure arrives in the next build phase.' }));
    }

    // U/C/W table
    function ch(from, to) {
      var v = pctChange(from, to);
      if (v === null) return 'not defined (0 in ' + p.a + ')';
      return fmtPct(v) + '%';
    }
    function row(name, cls, A, B) {
      return h('tr', { class: cls },
        h('th', { scope: 'row', text: name }),
        h('td', { class: 'num', text: fmtInt(A) }),
        h('td', { class: 'num', text: fmtInt(B) }),
        h('td', { class: 'num', text: ch(A, B) }));
    }
    var table = h('table', { class: 'ruled' },
      h('caption', { text: 'Recorded cell-days by selection. Percent change is relative to the ' + p.a + ' value of the same row.' }),
      h('thead', null, h('tr', null,
        h('th', { scope: 'col', text: 'Selection' }),
        h('th', { scope: 'col', class: 'num', text: String(p.a) }),
        h('th', { scope: 'col', class: 'num', text: String(p.b) }),
        h('th', { scope: 'col', class: 'num', text: 'Change' }))),
      h('tbody', null,
        row('W: all included satellites', isAll ? 'hl' : '', p.W_a, p.W_b),
        row('U: ' + sLabel + ' (same named satellites)', isAll ? '' : 'hl', p.U_a, p.U_b),
        row('C = W - U: recorded only by satellites not present in both periods', 'accent', p.C_a, p.C_b)));

    var finding = h('section', { class: 'finding', 'aria-labelledby': 'finding-h' },
      h('p', { class: 'kicker', id: 'finding-h', text: 'FINDING' }),
      h('p', { class: 'finding-text', text: buildConclusion(p, a.coverage, a.daily) }));

    var dl = h('button', { type: 'button', class: 'download', disabled: true, 'aria-describedby': 'dl-note', text: COPY.download });
    var dlWrap = h('div', { class: 'dl-wrap', id: 'evidence' }, dl,
      h('p', { id: 'dl-note', class: 'dl-note', text: 'Download is enabled in the next build phase.' }));

    panel.appendChild(h('div', { class: 'controls' }, tabs, sw));
    panel.appendChild(result);
    panel.appendChild(chips);
    if (snapshot) panel.appendChild(snapshot);
    panel.appendChild(figFrame('Fig. 1 — Daily calendars'));
    panel.appendChild(figFrame('Fig. 2 — Cumulative cell-days'));
    panel.appendChild(h('div', { class: 'table-wrap' }, table));
    panel.appendChild(finding);
    panel.appendChild(dlWrap);
    panel.appendChild(h('p', { class: 'footer-line', text: COPY.footer }));
  }

  function init() {
    root = document.getElementById('app');
    document.getElementById('claim').textContent = COPY.claim;
    fetch('audit.json', { cache: 'no-cache' })
      .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .then(function (a) {
        var need = ['presets', 'coverage', 'sensors_present', 'daily', 'dataset_counts', 'bbox', 'grid_spec', 'window', 'grid', 'retrieval_timestamp_scope'];
        if (!a || a.schema !== 'audit-app v1' || !Array.isArray(a.presets) || need.some(function (k) { return !a[k]; })) {
          throw new Error('audit.json is missing required fields.');
        }
        state.audit = a;
        var loading = document.getElementById('loading');
        if (loading) loading.remove();
        docket(a);
        render();
      })
      .catch(function (e) { showError('Could not load audit.json (' + e.message + ').'); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
