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
    disclosure: 'We tested one proposed MODIS-sensitivity correction in the 2021 season. It failed the benchmark. The current app does not use that correction as a trusted measurement. It retains it in Method checks as a tested and failed method.',
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
    return { lastIdx: last, last: dateOf(last), zeroFrom: dateOf(last + 1), end: dateOf(endIdx) };
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

  /* ---------- series, scale, evidence, method facts (pure, testable) ---------- */
  var ORDER = ['MODIS_TERRA', 'MODIS_AQUA', 'VIIRS_SNPP', 'VIIRS_NOAA20'];
  function subsetKey(fleet) {
    if (!Array.isArray(fleet)) return '';
    return ORDER.filter(function (c) { return fleet.indexOf(c) >= 0; }).join('+');
  }
  function pad2(n) { return n < 10 ? '0' + n : String(n); }
  function mmdd(i) { var d = dateOf(i); return pad2(d.mm) + '-' + pad2(d.day); }

  // Daily W/U/C per period from the single frozen daily block. Null unless every
  // number inside the comparison interval is a count and the sums reproduce the
  // preset totals exactly. Days past the interval are 'excluded' (value exists) or
  // 'unverified' (null, never zero) and never enter a sum.
  function presetSeries(p, daily) {
    if (!presetValid(p) || !daily || typeof daily !== 'object') return null;
    var endIdx = p.comparison_end_mm_dd ? idxOf(p.comparison_end_mm_dd) : 45;
    if (endIdx < 0 || endIdx > 45) return null;
    var tot = { a: { W: 0, U: 0, C: 0 }, b: { W: 0, U: 0, C: 0 } };
    var arr = {};
    var ok = ['a', 'b'].every(function (side) {
      var d = daily[String(p[side])];
      var w = d && d[subsetKey(p['fleet_' + side])], u = d && d[subsetKey(p.shared)];
      if (!Array.isArray(w) || !Array.isArray(u) || w.length < 46 || u.length < 46) return false;
      arr[side] = { w: w, u: u };
      return true;
    });
    if (!ok) return null;
    var days = [], max = 0;
    for (var i = 0; i < 46; i++) {
      var day = { i: i, label: dateOf(i), key: mmdd(i) };
      for (var s = 0; s < 2; s++) {
        var side = s ? 'b' : 'a';
        var W = arr[side].w[i], U = arr[side].u[i];
        if (i <= endIdx) {
          if (!isCount(W) || !isCount(U) || U > W) return null;
          day[side] = { state: 'recorded', W: W, U: U, C: W - U };
          tot[side].W += W; tot[side].U += U; tot[side].C += W - U;
          if (W > max) max = W;
        } else if (W === null || U === null) {
          day[side] = { state: 'unverified', W: null, U: null, C: null };
        } else if (isCount(W) && isCount(U) && U <= W) {
          day[side] = { state: 'excluded', W: W, U: U, C: W - U };
        } else return null;
      }
      days.push(day);
    }
    if (tot.a.W !== p.W_a || tot.a.U !== p.U_a || tot.a.C !== p.C_a ||
        tot.b.W !== p.W_b || tot.b.U !== p.U_b || tot.b.C !== p.C_b) return null;
    return { n: endIdx + 1, endIdx: endIdx, days: days, max: max };
  }

  function cumulative(s) {
    var out = { W_a: [], U_a: [], W_b: [], U_b: [] }, r = { W_a: 0, U_a: 0, W_b: 0, U_b: 0 };
    for (var i = 0; i < s.n; i++) {
      r.W_a += s.days[i].a.W; r.U_a += s.days[i].a.U; r.W_b += s.days[i].b.W; r.U_b += s.days[i].b.U;
      Object.keys(out).forEach(function (k) { out[k].push(r[k]); });
    }
    return out;
  }

  // Sequential single-hue ramp: paper, pale amber, orange, vermilion, deep maroon-ink.
  var RAMP = [[245, 241, 232], [246, 217, 160], [242, 154, 63], [232, 73, 15], [59, 15, 10]];
  function heatT(v, max) { return !(max > 0) || v <= 0 ? 0 : Math.min(1, Math.sqrt(v / max)); }
  function heatColor(v, max) {
    if (typeof v !== 'number' || !isFinite(v)) return null;
    var t = heatT(v, max) * (RAMP.length - 1), k = Math.min(RAMP.length - 2, Math.floor(t)), f = t - k;
    var c = RAMP[k].map(function (x, j) { return Math.round(x + (RAMP[k + 1][j] - x) * f); });
    return 'rgb(' + c.join(',') + ')';
  }
  function heatDark(v, max) { return heatT(v, max) > 0.55; }

  function strata(sp) {
    var years = Object.keys(sp).map(Number).sort(function (x, y) { return x - y; });
    return ORDER.concat(['VIIRS_NOAA21']).map(function (code) {
      var ys = years.filter(function (y) { return (sp[String(y)] || []).indexOf(code) >= 0; });
      return { code: code, label: label(code), from: ys.length ? ys[0] : null, to: ys.length ? ys[ys.length - 1] : null };
    });
  }

  function caseFacts(a) {
    var years = Object.keys(a.sensors_present).map(Number).sort(function (x, y) { return x - y; });
    var p = null;
    (a.presets || []).forEach(function (q) { if (q.comparison_end_mm_dd && !p) p = q; });
    var f = p ? snppFacts(p, a.daily) : null;
    return { year: p ? p.b : years[years.length - 1], preset: p, cessation: f };
  }

  function fmtNum(x, d) {
    var parts = Math.abs(x).toFixed(d).split('.');
    return (x < 0 ? MINUS : '') + fmtInt(parts[0]) + (parts[1] ? '.' + parts[1] : '');
  }

  function methodFacts(mc, coverage) {
    function num(x) { return typeof x === 'number' && isFinite(x); }
    function rng(r) { return '+' + Math.round(r[0] * 100) + '% to +' + Math.round(r[1] * 100) + '%'; }
    try {
      var b = mc.benchmark_2021, pr = b.predictors, sa = mc.sensor_addition, me = sa.mean_E;
      var names = [['raw_viirs', 'Raw VIIRS counts'], ['ratio', 'Ratio scaling'], ['degraded', 'Degradation (experimental)']];
      var rows = names.map(function (n) {
        var q = pr[n[0]];
        if (!num(q.mae) || !num(q.total_err_pct)) throw new Error('bad predictor');
        return { name: n[1], mae: fmtNum(q.mae, 1), err: fmtPct(q.total_err_pct) + '%' };
      });
      if (!num(pr.raw_viirs.total_actual) || !num(b.test_days) || typeof b.split !== 'string') throw new Error('bad benchmark');
      if (!num(me.E_R) || !num(me.E_S) || !num(me.E_C)) throw new Error('bad mean_E');
      [sa.J_R_range, sa.J_S_range].forEach(function (r) { if (!Array.isArray(r) || !num(r[0]) || !num(r[1])) throw new Error('bad range'); });
      if (typeof mc.intro !== 'string' || typeof sa.provenance !== 'string' || typeof b.provenance !== 'string' ||
          typeof sa.mean_E_interval !== 'string' || typeof sa.mean_E_formula !== 'string') throw new Error('bad text');
      return {
        intro: mc.intro,
        benchmark: { split: b.split, testDays: b.test_days, totalActual: fmtInt(pr.raw_viirs.total_actual), rows: rows,
          failed: pr.degraded.mae > pr.ratio.mae, provenance: b.provenance },
        addition: { interval: sa.mean_E_interval.replace(/->/g, '→'), formula: sa.mean_E_formula,
          raw: me.E_R.toFixed(3), degraded: me.E_S.toFixed(3), ratio: me.E_C.toFixed(3),
          rawRange: rng(sa.J_R_range), degRange: rng(sa.J_S_range), provenance: sa.provenance }
      };
    } catch (e) { return null; }
  }

  function seasonText(a, yr) {
    var c = a.coverage && a.coverage[String(yr)];
    if (!c || !Array.isArray(c.sources) || !Array.isArray(c.unverified_dates) || typeof c.status !== 'string' ||
        typeof c.cutoff !== 'string' || typeof c.product !== 'string') return null;
    var prov = c.product === 'NRT' ? ' Provisional (near real time).' : '';
    return c.status + '; cutoff ' + c.cutoff + '; product ' + c.product + '; sources ' + c.sources.join(', ') + '.' + prov +
      (c.unverified_dates.length ? ' Unverified, not yet retrieved: ' + c.unverified_dates.join(', ') + ' (null, excluded from totals).' : '');
  }

  function limitations(a) {
    var cov = a.coverage && typeof a.coverage === 'object' ? a.coverage : {};
    var years = Object.keys(cov).map(Number).sort(function (x, y) { return x - y; });
    var last = years[years.length - 1], c = cov[String(last)];
    if (c && (!Array.isArray(c.unverified_dates) || typeof c.status !== 'string')) c = null;
    var out = ['NOAA-21 is configured but absent from the retrieved records. ' + COPY.noaa21 + '.'];
    if (c) out.push('Season ' + last + ' is ' + c.product + ' data and provisional: ' + c.status + '; cutoff ' + c.cutoff +
      (c.unverified_dates.length ? '; ' + c.unverified_dates.join(', ') + ' is null' + (typeof c.unverified_representation === 'string' ? ' (' + c.unverified_representation + ')' : '') : '') + '.');
    out.push('Grid-convention sensitivity is archived: event totals differ slightly between two implementations, the cause is unknown and is not proven to be cell rounding. Season row counts are equal in both, which is not a record-level exact match.');
    out.push('Zero means no detections in these retrieved records. It is not a statement that no fire occurred.');
    out.push('FRP is never summed across sensors. Single-sensor daily series overlap and are never stacked as components of W: W is the union of cell-days, not their sum.');
    return out;
  }

  function buildCsv(p, s) {
    var L = [
      '# Ghost Fleet - Fire Trend Audit: daily recorded cell-days for ' + p.label,
      '# Columns ending _a are the ' + p.a + ' season; columns ending _b are the ' + p.b + ' season. date is MM-DD (UTC day).',
      '# W = all included satellites. U = satellites present in both periods (' + sharedLabel(p.shared, ' + ') + '). C = W - U. Unit: recorded cell-days.',
      '# Zero means no detections in these retrieved records. status is recorded for every row listed; an unverified day is empty, never zero.',
      '# Days outside the comparison interval are not listed. Actual-fire change: not measured.',
      'date,W_a,U_a,C_a,W_b,U_b,C_b,status_a,status_b'
    ];
    function f(v) { return v === null ? '' : String(v); }
    for (var i = 0; i < s.n; i++) {
      var d = s.days[i];
      L.push([d.key, f(d.a.W), f(d.a.U), f(d.a.C), f(d.b.W), f(d.b.U), f(d.b.C), d.a.state, d.b.state].join(','));
    }
    return L.join('\n') + '\n';
  }

  function buildReport(p, a) {
    var finding = buildConclusion(p, a.coverage, a.daily);
    var s = presetSeries(p, a.daily);
    if (finding === COPY.unavailable || !s) return null;
    var tA = seasonText(a, p.a), tB = seasonText(a, p.b);
    if (!tA || !tB) return null;
    var w = pctChange(p.W_a, p.W_b), u = pctChange(p.U_a, p.U_b), g = a.grid_spec, bb = a.bbox;
    var ts = a.retrieved_at_utc ? new Date(a.retrieved_at_utc) : null;
    var tsTxt = ts && !isNaN(ts) ? ts.toISOString().slice(0, 16).replace('T', ' ') + ' UTC' : 'unavailable';
    var sl = sharedLabel(p.shared, ' + ');
    function row(n, A, B) { return '| ' + n + ' | ' + fmtInt(A) + ' | ' + fmtInt(B) + ' | ' + fmtPct(pctChange(A, B)) + '% |'; }
    var L = [
      '# Ghost Fleet - Fire Trend Audit: comparison evidence', '',
      'Preset: ' + p.label + ' (' + p.id + ')', '',
      '## Finding', '', finding, '',
      '## Comparison', '',
      '- Periods: ' + p.a + ' and ' + p.b + ' (' + p.a + ' is the base for every percentage).',
      '- Comparison interval: ' + (p.comparison_interval || ('Full window, ' + a.window)) + '.',
      '- All included satellites, ' + p.a + ': ' + sharedLabel(p.fleet_a, ' + ') + '.',
      '- All included satellites, ' + p.b + ': ' + sharedLabel(p.fleet_b, ' + ') + '.',
      '- Satellites present in both periods (same named satellites): ' + sl + '.', '',
      '| Selection | ' + p.a + ' | ' + p.b + ' | Change |', '| --- | ---: | ---: | ---: |',
      row('W: all included satellites', p.W_a, p.W_b),
      row('U: ' + sl + ' (same named satellites)', p.U_a, p.U_b),
      '| C = W - U: recorded only by satellites not present in both periods | ' + fmtInt(p.C_a) + ' | ' + fmtInt(p.C_b) + ' | not a percentage |', '',
      '- Recorded change, all included satellites: ' + fmtPct(w) + '%, recorded cell-days relative to the ' + p.a + ' count of ' + fmtInt(p.W_a) + '.',
      '- Recorded change, ' + sl + ': ' + fmtPct(u) + '%, recorded cell-days relative to the ' + p.a + ' count of ' + fmtInt(p.U_a) + '.',
      '- Difference: ' + fmtDiff(w - u) + ' percentage points. This is a selection difference, not a causal attribution.',
      '- Neither percentage is a corrected fire count. Actual-fire change is not measured.', '',
      '## Definitions', '',
      '- W: cell-days with a detection by any included satellite in the period.',
      '- U: cell-days with a detection by the satellites present in both periods.',
      '- C = W - U, computed per day and in total.',
      '- Zero means no detections in these retrieved records.',
      '- Daily values are in the companion CSV. Its column sums equal the totals above.', '',
      '## Measurement contract', '',
      '- Study area: bounding box ' + bb[0] + '-' + bb[2] + ' E, ' + bb[1] + '-' + bb[3] + ' N. A rectangle, not an administrative boundary.',
      '- Grid: ' + a.grid + '; ' + g.type + ', origin ' + g.origin_lon_lat[0] + ' E ' + g.origin_lon_lat[1] + ' N, reference latitude ' + g.reference_latitude +
        ', Earth radius ' + g.earth_radius_km + ' km, cell ' + g.cell_km + ' km, ' + g.index + ' index. Days are UTC dates.',
      '- Confidence rule: MODIS confidence 50 or above; VIIRS nominal and high only.',
      '- Requested interval: ' + a.window + '.',
      '- Retrieved: ' + tsTxt + '. Scope: ' + a.retrieval_timestamp_scope + '.',
      '- Season ' + p.a + ': ' + tA,
      '- Season ' + p.b + ': ' + tB,
      '- ' + COPY.noaa21 + '.', '',
      '## Missing-day treatment', ''
    ];
    if (p.comparison_end_mm_dd) {
      var x = dateOf(s.endIdx + 1), xt = x.mon + ' ' + x.day;
      L.push('- ' + p.a + ' ' + xt + ' exists in the retrieved records but is excluded from this comparison, because it lies outside the interval.');
      L.push('- ' + p.b + ' ' + xt + ' is unverified, not yet retrieved. It is null in audit.json, excluded from every total, and is not a zero.');
      L.push('- The CSV therefore lists ' + s.n + ' days.');
      var snap = snapshotStatement(p, a.daily);
      if (snap) { L.push('', '## Data snapshot', '', COPY.snapshotBanner, snap); }
    } else {
      L.push('- No day is excluded. All ' + s.n + ' days of the window are recorded in both periods.');
    }
    L.push('', '## Limitations', '');
    limitations(a).forEach(function (t) { L.push('- ' + t); });
    L.push('', COPY.footer, '');
    return L.join('\n');
  }

  function buildEvidence(p, a) {
    var report = buildReport(p, a), s = presetSeries(p, a.daily);
    if (!report || !s) return null;
    return { base: 'ghost-fleet-' + p.id + '-' + p.a + '-' + p.b, report: report, csv: buildCsv(p, s) };
  }

  var api = {
    buildConclusion: buildConclusion, snapshotStatement: snapshotStatement, pctChange: pctChange, fmtPct: fmtPct, fmtDiff: fmtDiff,
    fmtInt: fmtInt, presetValid: presetValid, coverageComplete: coverageComplete,
    label: label, sharedLabel: sharedLabel, COPY: COPY,
    presetSeries: presetSeries, cumulative: cumulative, heatColor: heatColor, heatDark: heatDark, strata: strata, caseFacts: caseFacts,
    methodFacts: methodFacts, limitations: limitations, seasonText: seasonText, buildCsv: buildCsv, buildReport: buildReport,
    buildEvidence: buildEvidence, subsetKey: subsetKey, fmtNum: fmtNum
  };
  if (typeof module !== 'undefined' && module.exports) { module.exports = api; }
  if (typeof document === 'undefined') return;

  /* ---------- DOM ---------- */
  var state = { audit: null, preset: 0, view: 'all', lastPct: null };
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
    var t = seasonText(a, yr);
    if (!t) return null;
    return h('div', { class: 'cov-row' }, h('dt', { text: 'Season ' + yr }), h('dd', { text: t }));
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

  /* ---------- figures ---------- */
  var SVGNS = 'http://www.w3.org/2000/svg';
  function sv(tag, attrs) {
    var el = document.createElementNS(SVGNS, tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      if (k === 'text') el.textContent = attrs[k]; else el.setAttribute(k, attrs[k]);
    });
    for (var i = 2; i < arguments.length; i++) if (arguments[i]) el.appendChild(arguments[i]);
    return el;
  }
  var WEEKDAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  function dayText(yr, d, side, isAll) {
    var x = d[side], when = yr + ' ' + d.label.mon + ' ' + d.label.day;
    if (x.state === 'unverified') return when + ': unverified, not yet retrieved (null, not a zero).';
    if (x.state === 'excluded') return when + ': excluded from this comparison (outside the interval). Retrieved value, not counted: ' +
      fmtInt(x.W) + ' recorded cell-days for all included satellites.';
    return when + ': ' + fmtInt(isAll ? x.W : x.U) + ' recorded cell-days (' + (isAll ? 'all included satellites' : 'same named satellites') +
      '). All included ' + fmtInt(x.W) + ', same named ' + fmtInt(x.U) + ', recorded only by other satellites ' + fmtInt(x.C) + '.';
  }

  function calendar(p, s, side, isAll, readout) {
    var yr = p[side];
    var off = (new Date(Date.UTC(yr, 9, 1)).getUTCDay() + 6) % 7;
    var grid = h('div', { class: 'cal', role: 'group', 'aria-label': 'Calendar ' + yr + ', ' + (isAll ? 'all included satellites' : 'same named satellites') });
    WEEKDAYS.forEach(function (w) { grid.appendChild(h('span', { class: 'cal-wd', 'aria-hidden': 'true', text: w })); });
    for (var k = 0; k < off; k++) grid.appendChild(h('span', { class: 'cal-pad', 'aria-hidden': 'true' }));
    s.days.forEach(function (d) {
      var x = d[side], txt = dayText(yr, d, side, isAll);
      var cell = h('button', { type: 'button', class: 'cell', tabindex: '-1', title: txt, 'aria-label': txt });
      var num = h('span', { class: 'cell-n', text: String(d.label.day) });
      if (x.state === 'recorded') {
        var v = isAll ? x.W : x.U;
        cell.style.background = heatColor(v, s.max);
        if (heatDark(v, s.max)) cell.classList.add('cell-dark');
        cell.appendChild(num);
        if (x.C > 0 && x.W > 0) {
          var g = h('span', { class: isAll ? 'ghost' : 'ghost-out' });
          g.style.height = (x.C / x.W * 100).toFixed(2) + '%';
          cell.appendChild(g);
        }
      } else if (x.state === 'unverified') {
        cell.classList.add('cell-unv');
        cell.appendChild(num); cell.appendChild(h('span', { class: 'cell-mark', text: '?' }));
      } else {
        cell.classList.add('cell-excl');
        cell.appendChild(num); cell.appendChild(h('span', { class: 'cell-mark', text: '×' }));
      }
      cell.addEventListener('click', function () { readout.textContent = txt; });
      var m = d.label.day === 1 ? h('span', { class: 'cell-mon', text: d.label.mon }) : null;
      if (m) cell.appendChild(m);
      grid.appendChild(cell);
    });
    return h('div', { class: 'cal-block' }, h('p', { class: 'cal-head', text: String(yr) }), grid);
  }

  function legend(s, isAll, hasUnv, hasExcl) {
    var bar = h('span', { class: 'lg-bar', 'aria-hidden': 'true' });
    var stops = [];
    for (var k = 0; k <= 8; k++) stops.push(heatColor(s.max * Math.pow(k / 8, 2), s.max) + ' ' + (k / 8 * 100) + '%');
    bar.style.background = 'linear-gradient(90deg,' + stops.join(',') + ')';
    var L = h('div', { class: 'legend' },
      h('div', { class: 'lg-scale' }, h('span', { text: '0' }), bar, h('span', { text: fmtInt(s.max) })),
      h('p', { text: 'Colour is recorded cell-days per day, square-root scale from 0 to ' + fmtInt(s.max) + '. The scale is identical for both periods and both views.' }),
      h('p', { class: 'lg-row' }, h('span', { class: isAll ? 'lg-sw lg-ghost' : 'lg-sw lg-out', 'aria-hidden': 'true' }),
        h('span', { text: isAll ? 'Hatched share of a cell = recorded only by satellites not present in both periods.' :
          'Dashed empty share of a cell = recorded only by satellites not present in both periods (not counted in this view).' })),
      h('p', { text: 'Zero = no detections in these retrieved records.' }));
    if (hasUnv) L.appendChild(h('p', { class: 'lg-row' }, h('span', { class: 'lg-sw lg-unv', 'aria-hidden': 'true', text: '?' }),
      h('span', { text: '▨ unverified, not yet retrieved (null, not a zero).' })));
    if (hasExcl) L.appendChild(h('p', { class: 'lg-row' }, h('span', { class: 'lg-sw lg-excl', 'aria-hidden': 'true', text: '×' }),
      h('span', { text: 'excluded from this comparison (outside the interval).' })));
    return L;
  }

  function dailyTable(p, s) {
    var head = h('tr', null, h('th', { scope: 'col', text: 'Date' }));
    [p.a, p.b].forEach(function (yr) {
      ['W', 'U', 'C'].forEach(function (k) { head.appendChild(h('th', { scope: 'col', class: 'num', text: k + ' ' + yr })); });
    });
    var body = h('tbody');
    s.days.forEach(function (d) {
      var tr = h('tr', null, h('th', { scope: 'row', text: d.label.mon + ' ' + d.label.day }));
      ['a', 'b'].forEach(function (side) {
        var x = d[side];
        if (x.state === 'recorded') ['W', 'U', 'C'].forEach(function (k) { tr.appendChild(h('td', { class: 'num', text: fmtInt(x[k]) })); });
        else tr.appendChild(h('td', { colspan: '3', class: 'muted', text: x.state === 'unverified' ? 'unverified, not yet retrieved' : 'excluded from this comparison' }));
      });
      body.appendChild(tr);
    });
    return h('details', { class: 'daily' }, h('summary', { text: 'Daily values as a table (same numbers as the calendars)' }),
      h('div', { class: 'daily-scroll' }, h('table', { class: 'ruled' },
        h('caption', { text: 'Recorded cell-days per day. W all included satellites, U same named satellites, C = W - U.' }),
        h('thead', null, head), body)));
  }

  function fig1(p, s, isAll) {
    var readout = h('p', { class: 'readout', 'aria-live': 'polite', text: 'Select a day in a calendar to read its value here.' });
    var hasUnv = false, hasExcl = false;
    s.days.forEach(function (d) { ['a', 'b'].forEach(function (k) {
      if (d[k].state === 'unverified') hasUnv = true;
      if (d[k].state === 'excluded') hasExcl = true;
    }); });
    return h('figure', { class: 'fig' },
      h('figcaption', { text: 'Fig. 1 - Daily recorded cell-days, ' + p.a + ' and ' + p.b + ' (' + (isAll ? 'all included satellites' : 'same named satellites') + ')' }),
      h('div', { class: 'cal-pair' }, calendar(p, s, 'a', isAll, readout), calendar(p, s, 'b', isAll, readout)),
      readout, legend(s, isAll, hasUnv, hasExcl), dailyTable(p, s));
  }

  function fig2(p, s, isAll) {
    var c = cumulative(s), n = s.n;
    var VW = 360, VH = 250, L = 46, R = 14, T = 14, B = 34, pw = VW - L - R, ph = VH - T - B;
    var ymax = Math.max(c.W_a[n - 1], c.W_b[n - 1]);
    function X(i) { return L + (n > 1 ? i / (n - 1) : 0) * pw; }
    function Y(v) { return T + ph - (ymax > 0 ? v / ymax : 0) * ph; }
    function path(arr) { return arr.map(function (v, i) { return (i ? 'L' : 'M') + X(i).toFixed(1) + ' ' + Y(v).toFixed(1); }).join(' '); }
    function gap(W, U) {
      var f = W.map(function (v, i) { return (i ? 'L' : 'M') + X(i).toFixed(1) + ' ' + Y(v).toFixed(1); }).join(' ');
      var b = U.map(function (v, i) { return 'L' + X(n - 1 - i).toFixed(1) + ' ' + Y(U[n - 1 - i]).toFixed(1); }).join(' ');
      return f + ' ' + b + ' Z';
    }
    var svg = sv('svg', { viewBox: '0 0 ' + VW + ' ' + VH, class: 'chart', role: 'img',
      'aria-label': 'Cumulative recorded cell-days. ' + p.a + ': all included ' + fmtInt(p.W_a) + ', same named ' + fmtInt(p.U_a) +
        '. ' + p.b + ': all included ' + fmtInt(p.W_b) + ', same named ' + fmtInt(p.U_b) + '. C in ' + p.b + ' is ' + fmtInt(p.C_b) + '.' });
    [0, 0.5, 1].forEach(function (f) {
      var y = Y(ymax * f);
      svg.appendChild(sv('line', { x1: L, x2: VW - R, y1: y, y2: y, class: 'ax-grid' }));
      svg.appendChild(sv('text', { x: L - 5, y: y + 4, class: 'ax-t', 'text-anchor': 'end', text: fmtInt(Math.round(ymax * f)) }));
    });
    var ticks = [0, 14, 31, n - 1].filter(function (i, k, a) { return i <= n - 1 && a.indexOf(i) === k; });
    ticks.forEach(function (i) {
      var d = s.days[i].label;
      svg.appendChild(sv('text', { x: X(i), y: VH - B + 16, class: 'ax-t', 'text-anchor': i === 0 ? 'start' : (i === n - 1 ? 'end' : 'middle'), text: d.mon + ' ' + d.day }));
    });
    svg.appendChild(sv('line', { x1: L, x2: VW - R, y1: T + ph, y2: T + ph, class: 'ax-base' }));
    if (p.C_a > 0) svg.appendChild(sv('path', { d: gap(c.W_a, c.U_a), class: 'gap-fill' }));
    if (p.C_b > 0) svg.appendChild(sv('path', { d: gap(c.W_b, c.U_b), class: 'gap-fill' }));
    var lines = [['W_a', 'ln-a', true], ['U_a', 'ln-a ln-u', false], ['W_b', 'ln-b', true], ['U_b', 'ln-b ln-u', false]];
    lines.forEach(function (l) {
      var sel = (l[2] === isAll);
      svg.appendChild(sv('path', { d: path(c[l[0]]), class: 'ln ' + l[1] + (sel ? ' ln-sel' : ' ln-off') }));
    });
    if (p.C_b > 0) {
      var mid = (Y(c.W_b[n - 1]) + Y(c.U_b[n - 1])) / 2;
      svg.appendChild(sv('text', { x: VW - R - 6, y: mid + 4, class: 'ax-c', 'text-anchor': 'end', text: 'C = ' + fmtInt(p.C_b) }));
    }
    var coincide = p.C_a === 0 && p.C_b === 0;
    var key = h('ul', { class: 'curve-key' },
      h('li', null, h('span', { class: 'k-sw k-bs' }), ' ' + p.b + ': all included satellites, W (solid)'),
      h('li', null, h('span', { class: 'k-sw k-bd' }), ' ' + p.b + ': same named satellites, U (dashed)'),
      h('li', null, h('span', { class: 'k-sw k-as' }), ' ' + p.a + ': all included satellites, W (solid grey)'),
      h('li', null, h('span', { class: 'k-sw k-ad' }), ' ' + p.a + ': same named satellites, U (dashed grey)'),
      h('li', null, h('span', { class: 'k-sw k-gap' }), ' C = W - U, recorded only by satellites not present in both periods' + (coincide ? ' (zero in both periods here, so W and U coincide)' : '')));
    return h('figure', { class: 'fig' },
      h('figcaption', { text: 'Fig. 2 - Cumulative recorded cell-days over the comparison interval' }),
      svg, key,
      h('p', { class: 'fig-note', text: 'Same axes in both views; the selected view is drawn heavier. Curves end at the table totals.' }));
  }

  function renderCase(a) {
    var body = document.getElementById('case-body');
    var cf = caseFacts(a), yr = String(cf.year), d = a.daily[yr];
    clear(body);
    document.getElementById('case-h').textContent = 'S-NPP data delivery, ' + cf.year;
    var snap = cf.preset ? snapshotStatement(cf.preset, a.daily) : null;
    body.appendChild(h('p', { class: 'claim', text: (snap || 'The S-NPP interruption cannot be stated from the retrieved records.') }));

    // strata
    var rows = strata(a.sensors_present);
    var years = Object.keys(a.sensors_present).map(Number).sort(function (x, y) { return x - y; });
    var y0 = years[0], y1 = years[years.length - 1], span = y1 - y0 + 1;
    var st = h('div', { class: 'strata' },
      h('p', { class: 'fig-cap', text: 'Fig. 3 - Satellites present in each season, ' + y0 + ' to ' + y1 }),
      h('div', { class: 'st-axis', 'aria-hidden': 'true' }, h('span', { text: String(y0) }), h('span', { text: String(Math.round((y0 + y1) / 2)) }), h('span', { text: String(y1) })));
    rows.forEach(function (r) {
      var track = h('div', { class: 'st-track', 'aria-hidden': 'true' });
      var note;
      if (r.from === null) {
        track.appendChild(h('span', { class: 'st-bar st-empty', style: 'left:0;width:100%' }));
        note = COPY.noaa21;
      } else {
        track.appendChild(h('span', { class: 'st-bar', style: 'left:' + ((r.from - y0) / span * 100).toFixed(2) + '%;width:' + ((r.to - r.from + 1) / span * 100).toFixed(2) + '%' }));
        note = r.from + ' to ' + r.to;
        if (r.code === 'VIIRS_SNPP' && cf.cessation) note += '; data delivery ceased ' + cf.cessation.last.day + ' ' + cf.cessation.last.mon + ' ' + cf.year;
      }
      st.appendChild(h('div', { class: 'st-row' }, h('p', { class: 'st-name' }, h('strong', { text: r.label }), ' ' + note), track));
    });
    body.appendChild(st);

    // single-sensor daily strips
    var codes = ORDER.filter(function (c) { return Array.isArray(d && d[c]); });
    var ymax = 0;
    codes.forEach(function (c) { d[c].forEach(function (v) { if (typeof v === 'number' && v > ymax) ymax = v; }); });
    var wrap = h('figure', { class: 'fig' },
      h('figcaption', { text: 'Fig. 4 - Single-sensor daily series, ' + cf.year }),
      h('p', { class: 'fig-note', text: 'Daily ' + a.daily_unit + '. Same vertical scale in all four strips, 0 to ' + fmtInt(ymax) + '.' }));
    codes.forEach(function (c) {
      var VW = 360, VH = 70, L = 4, R = 4, T = 6, B = 16, pw = VW - L - R, ph = VH - T - B, bw = pw / 46;
      var arr = d[c];
      var svg = sv('svg', { viewBox: '0 0 ' + VW + ' ' + VH, class: 'strip', role: 'img',
        'aria-label': label(c) + ' single-sensor recorded cell-days per day, ' + cf.year + (cf.cessation && c === 'VIIRS_SNPP' ? '; zero from ' + cf.cessation.zeroFrom.day + ' ' + cf.cessation.zeroFrom.mon : '') });
      svg.appendChild(sv('line', { x1: L, x2: VW - R, y1: T + ph, y2: T + ph, class: 'ax-base' }));
      arr.forEach(function (v, i) {
        if (typeof v !== 'number') {
          svg.appendChild(sv('text', { x: L + i * bw + bw / 2, y: T + ph - 3, class: 'ax-t', 'text-anchor': 'middle', text: '?' }));
          return;
        }
        var hh = ymax > 0 ? v / ymax * ph : 0;
        if (v > 0) svg.appendChild(sv('rect', { x: (L + i * bw + 0.6).toFixed(2), y: (T + ph - hh).toFixed(2), width: Math.max(1, bw - 1.2).toFixed(2), height: hh.toFixed(2), class: 'bar' }));
      });
      if (cf.cessation) {
        var xl = L + (cf.cessation.lastIdx + 1) * bw;
        svg.appendChild(sv('line', { x1: xl, x2: xl, y1: 0, y2: T + ph, class: 'cess' }));
        if (c === 'VIIRS_SNPP') svg.appendChild(sv('text', { x: xl - 4, y: 14, class: 'ax-c', 'text-anchor': 'end', text: 'data delivery ceased ' + cf.cessation.last.day + ' ' + cf.cessation.last.mon }));
      }
      svg.appendChild(sv('text', { x: L, y: VH - 3, class: 'ax-t', text: 'Oct 1' }));
      svg.appendChild(sv('text', { x: VW - R, y: VH - 3, class: 'ax-t', 'text-anchor': 'end', text: 'Nov 15' }));
      wrap.appendChild(h('div', { class: 'strip-wrap' }, h('p', { class: 'strip-name', text: label(c) }), svg));
    });
    wrap.appendChild(h('p', { class: 'fig-note', text: 'Dashed line: between the last day with S-NPP recorded cell-days and the first day with zero. ? = unverified, not yet retrieved (null, not a zero).' }));
    body.appendChild(wrap);
  }

  function renderMethod(a) {
    var body = document.getElementById('method-body');
    clear(body);
    var m = methodFacts(a.method_checks, a.coverage);
    if (!m) {
      body.appendChild(h('div', { class: 'state state-error', role: 'alert' },
        h('p', { class: 'kicker', text: 'DATA UNAVAILABLE' }),
        h('p', { text: 'Method checks cannot be rendered from the retrieved audit.json. No values are shown.' })));
      return;
    }
    body.appendChild(h('p', { class: 'claim', text: m.intro }));
    var b = m.benchmark;
    var tb1 = h('tbody');
    b.rows.forEach(function (r) {
      tb1.appendChild(h('tr', null, h('th', { scope: 'row', text: r.name }), h('td', { class: 'num', text: r.mae }), h('td', { class: 'num', text: r.err })));
    });
    var t1 = h('table', { class: 'ruled' },
      h('caption', { text: 'Held out: ' + b.testDays + ' days from ' + b.split + '; actual total ' + b.totalActual + ' MODIS events. MAE = mean absolute error of the daily prediction.' }),
      h('thead', null, h('tr', null, h('th', { scope: 'col', text: 'Predictor' }), h('th', { scope: 'col', class: 'num', text: 'MAE' }), h('th', { scope: 'col', class: 'num', text: 'Total error' }))),
      tb1);
    body.appendChild(h('div', { class: 'table-wrap' }, h('h3', { class: 'mc-h', text: '(a) 2021 benchmark' }), t1,
      b.failed ? h('p', { class: 'stamp', text: 'DEGRADATION: FAILED - retained as experimental only' }) : null,
      h('p', { text: COPY.disclosure }),
      h('p', { class: 'fig-note', text: b.provenance + '.' })));
    var s = m.addition;
    var t2 = h('table', { class: 'ruled' },
      h('caption', { text: 'Sensor-addition test, 2012 to 2025 (S-NPP only, frozen rules). Mean ' + s.formula + '; ' + s.interval + '.' }),
      h('thead', null, h('tr', null, h('th', { scope: 'col', text: 'Series' }), h('th', { scope: 'col', class: 'num', text: 'Mean |change in J|' }))),
      h('tbody', null,
        h('tr', null, h('th', { scope: 'row', text: 'Raw' }), h('td', { class: 'num', text: s.raw })),
        h('tr', null, h('th', { scope: 'row', text: 'Degraded' }), h('td', { class: 'num', text: s.degraded })),
        h('tr', null, h('th', { scope: 'row', text: 'Ratio-scaled' }), h('td', { class: 'num', text: s.ratio }))));
    body.appendChild(h('div', { class: 'table-wrap' }, h('h3', { class: 'mc-h', text: '(b) Sensor-addition test' }), t2,
      h('p', { text: 'The level J stays large for all series: raw ' + s.rawRange + ', degraded ' + s.degRange + '. Steadier is not accurate.' }),
      h('p', { class: 'fig-note', text: s.provenance + '.' })));
    var ul = h('ul', { class: 'lim' });
    limitations(a).forEach(function (t) { ul.appendChild(h('li', { text: t })); });
    body.appendChild(h('div', { class: 'table-wrap' }, h('h3', { class: 'mc-h', text: '(c) Known limitations' }), ul));
  }

  /* ---------- downloads ---------- */
  var urls = [];
  function blobUrl(text, mime) {
    var u = URL.createObjectURL(new Blob([text], { type: mime }));
    urls.push(u);
    return u;
  }
  function revokeAll() { urls.forEach(function (u) { URL.revokeObjectURL(u); }); urls = []; }
  function saveFile(name, href) {
    var a = h('a', { href: href, download: name });
    document.body.appendChild(a); a.click(); a.remove();
  }
  function downloadBlock(p, a) {
    revokeAll();
    var ev = buildEvidence(p, a);
    if (!ev) {
      return h('div', { class: 'dl-wrap', id: 'evidence' },
        h('button', { type: 'button', class: 'download', disabled: true, 'aria-describedby': 'dl-note', text: COPY.download }),
        h('p', { id: 'dl-note', class: 'dl-note', text: 'Evidence is unavailable because this comparison is unavailable. Nothing is generated.' }));
    }
    var rUrl = blobUrl(ev.report, 'text/markdown;charset=utf-8'), cUrl = blobUrl(ev.csv, 'text/csv;charset=utf-8');
    var rName = ev.base + '-report.md', cName = ev.base + '-daily.csv';
    var btn = h('button', { type: 'button', class: 'download', 'aria-describedby': 'dl-note', text: COPY.download });
    btn.addEventListener('click', function () {
      saveFile(rName, rUrl);
      setTimeout(function () { saveFile(cName, cUrl); }, 300);
    });
    return h('div', { class: 'dl-wrap', id: 'evidence' }, btn,
      h('p', { id: 'dl-note', class: 'dl-note' }, 'Two files: a readable report (.md) and a daily CSV. Also available one at a time: ',
        h('a', { href: rUrl, download: rName, text: 'report (.md)' }), ' and ',
        h('a', { href: cUrl, download: cName, text: 'daily values (.csv)' }), '. Both are generated in this browser from the numbers on screen.'));
  }

  function compBars(p, isAll) {
    var mx = Math.max(p.W_a, p.W_b);
    function row(yr, W, U, C) {
      var kids = [h('span', { class: 'bar-yr', text: String(yr) }),
        h('span', { class: 'bar-track', 'aria-hidden': 'true' },
          h('span', { class: 'bar-u', style: 'width:' + (mx > 0 ? U / mx * 100 : 0).toFixed(2) + '%' }),
          C > 0 ? h('span', { class: isAll ? 'bar-c' : 'bar-c bar-c-out', style: 'width:' + (mx > 0 ? C / mx * 100 : 0).toFixed(2) + '%' }) : null),
        h('span', { class: 'bar-n', text: fmtInt(isAll ? W : U) })];
      return h('div', { class: 'bar-row' }, kids[0], kids[1], kids[2]);
    }
    return h('div', { class: 'bars', role: 'img',
      'aria-label': 'Recorded cell-days, ' + (isAll ? 'all included satellites' : 'same named satellites') + ': ' + p.a + ' ' + fmtInt(isAll ? p.W_a : p.U_a) + ', ' + p.b + ' ' + fmtInt(isAll ? p.W_b : p.U_b) + '. Same scale in both views.' },
      row(p.a, p.W_a, p.U_a, p.C_a), row(p.b, p.W_b, p.U_b, p.C_b));
  }

  function countTo(el, from, to) {
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce || from === null || to === null || from === to || !window.requestAnimationFrame) return;
    var final = fmtPct(to) + '%', t0 = null, dur = 520;
    function step(ts) {
      if (t0 === null) t0 = ts;
      var k = Math.min(1, (ts - t0) / dur), e = 1 - Math.pow(1 - k, 3);
      el.textContent = k < 1 ? fmtPct(from + (to - from) * e) + '%' : final;
      if (k < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  function presetTabs(a) {
    var tabs = h('div', { class: 'tabs', role: 'group', 'aria-label': 'Preset comparison' });
    a.presets.forEach(function (pp, i) {
      var b = h('button', { type: 'button', class: 'tab', 'aria-pressed': String(i === state.preset),
        text: (PRESET_TABS[pp.id] || pp.id) + (typeof pp.a === 'number' && typeof pp.b === 'number' ? ' (' + pp.a + '→' + pp.b + ')' : '') });
      b.addEventListener('click', function () { state.preset = i; render(); });
      tabs.appendChild(b);
    });
    return tabs;
  }

  function render() {
    var a = state.audit, p = a.presets[state.preset], view = state.view;
    var panel = document.getElementById('compare');
    clear(panel);
    panel.className = 'console';
    var rail = h('aside', { class: 'rail', 'aria-label': 'Comparison controls' });
    var stage = h('div', { class: 'stage' });
    panel.appendChild(rail); panel.appendChild(stage);

    if (!presetValid(p)) {
      rail.appendChild(presetTabs(a));
      stage.appendChild(h('div', { class: 'state state-error', role: 'alert' },
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
    var tabs = presetTabs(a);

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
      compBars(p, isAll),
      !isAll ? h('p', { class: 'warning', role: 'note', text: COPY.warning }) : null);
    countTo(result.querySelector('.headline'), state.lastPct, pct);
    state.lastPct = pct;

    var chips = h('div', { class: 'chips' },
      chipRow(String(p.a), p.fleet_a, p.shared, view),
      chipRow(String(p.b), p.fleet_b, p.shared, view),
      p.b === 2026 ? h('p', { class: 'chip-note', text: COPY.noaa21 }) : null);

    var snapStmt = snapshotStatement(p, a.daily);
    var snapshot = p.comparison_end_mm_dd ? h('section', { class: 'snapshot', 'aria-labelledby': 'snap-h' },
      h('p', { class: 'kicker', id: 'snap-h', text: 'DATA SNAPSHOT' }),
      h('p', { class: 'banner', text: COPY.snapshotBanner }),
      h('p', { text: snapStmt || 'S-NPP cessation details unavailable from the retrieved records.' })) : null;

    var series = presetSeries(p, a.daily);
    var figs = series ? [fig1(p, series, isAll), fig2(p, series, isAll)] :
      [h('div', { class: 'state state-error', role: 'alert' }, h('p', { class: 'kicker', text: 'FIGURES UNAVAILABLE' }),
        h('p', { text: 'The daily series do not reproduce the preset totals, so no calendar or curve is drawn.' }))];

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

    var dlWrap = downloadBlock(p, a);

    rail.appendChild(tabs);
    rail.appendChild(sw);
    rail.appendChild(chips);
    rail.appendChild(dlWrap);
    rail.appendChild(h('p', { class: 'footer-line', text: COPY.footer }));
    stage.appendChild(result);
    stage.appendChild(finding);
    if (snapshot) stage.appendChild(snapshot);
    figs.forEach(function (f) { stage.appendChild(f); });
    stage.appendChild(h('div', { class: 'table-wrap' }, table));
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
        renderCase(a);
        renderMethod(a);
      })
      .catch(function (e) {
        showError('Could not load audit.json (' + e.message + ').');
        ['case-body', 'method-body'].forEach(function (id) {
          var el = document.getElementById(id);
          if (el) { clear(el); el.appendChild(h('p', { class: 'state state-error', role: 'alert', text: 'DATA UNAVAILABLE. audit.json could not be loaded, so no figures are shown.' })); }
        });
      });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
