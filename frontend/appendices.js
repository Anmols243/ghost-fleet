/* Optional observed-data appendices. Never imported by the preset workflow. */
(function () {
  'use strict';
  var FILES = [{ file: 'ledger.json', schema: 'observation-ledger v1', id: 'ledger',
    title: 'Daily observation ledger' },
    { file: 'timing.json', schema: 'acquisition-timing v1', id: 'timing',
      title: 'Acquisition-time appendix' }];

  function loadAppendices(fetcher, files, render) {
    return Promise.all(files.map(async function (item) {
      try {
        var response = await fetcher(item.file);
        if (!response.ok) throw new Error('Appendix unavailable');
        var data = await response.json();
        if (!data || data.schema !== item.schema || !Array.isArray(data.rows)) {
          throw new Error('Appendix schema unavailable');
        }
        render(item.file, data, item);
        return true;
      } catch (_) { return false; }
    }));
  }

  function element(tag, text) {
    var node = document.createElement(tag);
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function table(headers, rows, missingLabel) {
    var wrap = element('div');
    wrap.className = 'table-wrap appendix-table';
    var result = element('table');
    var head = element('thead'), tr = element('tr');
    headers.forEach(function (label) {
      var th = element('th', label); th.scope = 'col'; tr.appendChild(th);
    });
    head.appendChild(tr); result.appendChild(head);
    var body = element('tbody');
    rows.forEach(function (row) {
      var line = element('tr');
      row.forEach(function (value) {
        line.appendChild(element('td', value === null ?
          (missingLabel || 'unverified / not yet retrieved') : String(value)));
      });
      body.appendChild(line);
    });
    result.appendChild(body); wrap.appendChild(result);
    return wrap;
  }

  function download(section, file, label) {
    var link = element('a', label);
    link.href = file; link.download = file;
    var p = element('p'); p.appendChild(link); section.appendChild(p);
  }

  function renderLedger(section, data) {
    section.appendChild(element('p', data.definition));
    var meta = data.metadata;
    section.appendChild(element('p', meta.grid + '; bounding rectangle ' + meta.bbox.join(', ') +
      '; NASA FIRMS. Confidence: MODIS >=50; VIIRS nominal + high. Verified through ' +
      data.verified_cutoff_2026 + '.'));
    section.appendChild(element('p', meta.dataset_counts.retrieved_detections.toLocaleString('en-US') +
      ' retrieved / ' + meta.dataset_counts.standardized_verified_detections.toLocaleString('en-US') +
      ' retained. Verified describes these retrieved records, not orbital or cloud completeness.'));
    download(section, 'ledger.csv', 'Download the observed-data ledger (CSV)');
    var details = element('details');
    details.appendChild(element('summary', 'Inspect the daily observation rows'));
    var fields = ['date', 'satellite_selection', 'recorded_cell_days', 'coverage_status',
      'product', 'comparison_inclusion'];
    details.appendChild(table(fields, data.rows.map(function (r) {
      return fields.map(function (f) { return r[f]; });
    })));
    section.appendChild(details);
  }

  function renderTiming(section, data) {
    section.appendChild(element('p', data.caption));
    section.appendChild(element('p', data.statistic));
    section.appendChild(element('p', 'Small samples matter: n is shown for each satellite and season. '
      + 'All times are UTC; the seasonal window starts Oct 1 and ends at the displayed cutoff.'));
    section.appendChild(table(['Season', 'Satellite', 'Cutoff', 'Median UTC', 'Q1 UTC', 'Q3 UTC',
      'n (retained daytime detections)', 'Represented days'], data.rows.map(function (r) {
      return [r.season, r.satellite, r.cutoff, r.median_utc, r.q1_utc, r.q3_utc,
        r.n, r.represented_days];
    }), 'no retained daytime observations'));
  }

  function render(file, data, item) {
    // Construct off-DOM: malformed data cannot leave a partial section visible.
    var section = element('section'); section.id = item.id;
    section.appendChild(element('h2', item.title));
    if (item.id === 'ledger') renderLedger(section, data);
    else if (item.id === 'timing') renderTiming(section, data);
    download(section, file, 'Download appendix data (JSON)');
    section.appendChild(element('p', 'Actual-fire change is not measured.'));
    document.querySelector('main').appendChild(section);
    var nav = document.querySelector('.nav-in');
    if (nav) { var link = element('a', item.title); link.href = '#' + item.id; nav.appendChild(link); }
  }

  if (typeof module !== 'undefined' && module.exports) module.exports = { loadAppendices: loadAppendices };
  if (typeof document !== 'undefined') {
    loadAppendices(function (file) { return fetch(file, { cache: 'no-cache' }); }, FILES, render);
  }
})();
