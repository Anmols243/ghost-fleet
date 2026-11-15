"""Observed-data ledger, using the frozen grid's union cell-day aggregation."""
import csv
import io
import pandas as pd

if __package__:
    from .harmonize import build_events
    from .appendix_common import (AUDIT, FRONTEND, PARQUET, provenance, read_audit,
                                 selection_name, write_json)
else:
    from harmonize import build_events
    from appendix_common import (AUDIT, FRONTEND, PARQUET, provenance, read_audit,
                                 selection_name, write_json)

FIELDS = ['date', 'satellite_selection', 'recorded_cell_days', 'coverage_status',
          'product', 'comparison_inclusion']
SEASON_TOTALS = dict(zip(range(2001, 2027), [
    1192, 8979, 9731, 8890, 14771, 9870, 14258, 13121, 12218, 12009,
    13581, 75396, 68754, 77260, 65425, 90197, 54291, 108035, 80634,
    128563, 137465, 84493, 56395, 22905, 18031, 14341]))


def comparisons(audit):
    """Declared selections: hero presets and every adjacent-season pair."""
    pairs = list(audit['presets'])
    years = sorted(map(int, audit['sensors_present']))
    for a, b in zip(years, years[1:]):
        if b == a + 1:
            shared = [s for s in audit['sensors_present'][str(a)]
                      if s in audit['sensors_present'][str(b)]]
            pairs.append({'id': f'{a}->{b}', 'a': a, 'b': b, 'shared': shared})
    return pairs


def build_ledger(frame, audit):
    rows = []
    pairs = comparisons(audit)
    for year, fleet in audit['sensors_present'].items():
        season = int(year)
        cutoff = audit['coverage'][year]['cutoff']
        retained = frame[frame.date.dt.year.eq(season) & frame.date.le(cutoff)]
        used = [p for p in pairs if season in (p['a'], p['b'])]
        selections = list(dict.fromkeys([tuple(fleet), *(tuple(p['shared']) for p in used)]))
        for sensors in selections:
            events = build_events(retained[retained.sensor.isin(sensors)])
            counts = events.groupby('date').size()
            for date in pd.date_range(f'{year}-10-01', f'{year}-11-15', tz='UTC'):
                day = date.strftime('%Y-%m-%d')
                verified = day <= cutoff
                inclusion = []
                for pair in used:
                    end = min(audit['coverage'][str(y)]['cutoff'][5:]
                              for y in (pair['a'], pair['b']))
                    if verified and day[5:] <= end:
                        if tuple(sensors) == tuple(fleet):
                            inclusion.append(pair['id'] + ' W')
                        if tuple(sensors) == tuple(pair['shared']):
                            inclusion.append(pair['id'] + ' U')
                rows.append(dict(zip(FIELDS, [
                    day, selection_name(sensors),
                    int(counts.get(date, 0)) if verified else None,
                    'verified' if verified else 'unverified',
                    audit['coverage'][year]['product'], '; '.join(inclusion) or 'none'])))
    return {
        'schema': 'observation-ledger v1', 'rows': rows,
        'metadata': {key: audit.get(key) for key in
                     ('grid', 'grid_spec', 'bbox', 'dataset_counts', 'coverage')},
        'definition': 'Observed-data ledger; a partial response to the brief. '
                      'Selections are unions of recorded cell-days, not a stitched series. '
                      'Verified refers to retrieved-record coverage, not cloud completeness.',
        'confidence': {'MODIS': '>=50', 'VIIRS': ['n', 'h']},
        'source': 'NASA FIRMS', 'bbox_definition': 'rectangle, not an administrative boundary',
        'verified_cutoff_2026': audit['coverage'].get('2026', {}).get('cutoff'),
    }


def validate_ledger(ledger, audit):
    """Exact pack section 4 totals and frozen daily series; fail before writing."""
    rows = ledger['rows']
    for year, fleet in audit['sensors_present'].items():
        full = [r for r in rows if r['date'].startswith(year)
                and r['satellite_selection'] == selection_name(fleet)]
        total = sum(r['recorded_cell_days'] or 0 for r in full)
        if total != SEASON_TOTALS[int(year)]:
            raise ValueError(f'Ledger season {year}: {total} != {SEASON_TOTALS[int(year)]}')
        for name in {r['satellite_selection'] for r in rows if r['date'].startswith(year)}:
            sensors = next(s for s in audit['daily'][year]
                           if selection_name(s.split('+')) == name)
            actual = [r['recorded_cell_days'] for r in rows
                      if r['date'].startswith(year) and r['satellite_selection'] == name]
            if actual != audit['daily'][year][sensors]:
                raise ValueError(f'Ledger daily mismatch: {year} {name}')
    for preset in audit['presets']:
        for tag, year in [('a', preset['a']), ('b', preset['b'])]:
            for role in ['W', 'U']:
                marker = preset['id'] + ' ' + role
                total = sum(r['recorded_cell_days'] for r in rows
                            if r['date'].startswith(str(year))
                            and marker in r['comparison_inclusion'].split('; '))
                if total != preset[f'{role}_{tag}']:
                    raise ValueError(f'Ledger preset mismatch: {preset["id"]} {role}_{tag}')


def main():
    audit = read_audit()
    ledger = build_ledger(pd.read_parquet(PARQUET), audit)
    validate_ledger(ledger, audit)
    ledger['sources'] = provenance(__file__, [PARQUET, AUDIT,
                                             FRONTEND.parent / 'backend/scripts/harmonize.py'])
    write_json('ledger.json', ledger)
    stream = io.StringIO(newline='')
    writer = csv.DictWriter(stream, fieldnames=FIELDS, lineterminator='\n')
    writer.writeheader()
    writer.writerows(ledger['rows'])
    (FRONTEND / 'ledger.csv').write_bytes(stream.getvalue().encode('utf-8'))
    print(f"Ledger: {len(ledger['rows'])} rows")


if __name__ == '__main__':
    main()
