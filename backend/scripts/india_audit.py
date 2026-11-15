"""Additive rectangle audit using canonical standardization and event unions."""
import pandas as pd
from collections import Counter
import hashlib
import json
from pathlib import Path
from datetime import datetime, timezone

if __package__:
    from .harmonize import build_events, standardize
    from .audit import compare_periods
else:
    from harmonize import build_events, standardize
    from audit import compare_periods

RECTANGLES = [
    ('hero', 'Punjab–Haryana — frozen study rectangle', [73.8, 27.6, 77.6, 32.6]),
    ('full_extent', 'India & surrounding area — full rectangle', [68.0, 6.5, 97.5, 37.5]),
    ('northwest', 'Northwest / Indo-Gangetic study rectangle', [68.0, 24.0, 88.5, 37.5]),
    ('northeast', 'Northeast study rectangle', [88.5, 21.5, 97.5, 30.0]),
    ('central', 'Central rectangle', [74.0, 17.5, 88.5, 24.0]),
    ('western', 'Western rectangle', [68.0, 17.5, 74.0, 24.0]),
    ('peninsular', 'Peninsular study rectangle', [72.5, 6.5, 88.5, 17.5]),
]
QUALIFICATION = ('Study rectangles may include neighbouring countries and do not partition India. '
                 'The full-rectangle result is computed directly, not by adding regional results.')


def select_rectangle(frame, bounds):
    west, south, east, north = bounds
    return frame[frame.lon.between(west, east, inclusive='both')
                 & frame.lat.between(south, north, inclusive='both')]


def build_comparison(frame, bounds, preset):
    selected = select_rectangle(frame, bounds)
    result = {key: preset[key] for key in ['id', 'a', 'b', 'fleet_a', 'fleet_b', 'shared']}
    result['periods'] = {}
    end = preset.get('comparison_end_mm_dd', '11-14' if preset['id'] == 'snpp_cessation' else '11-15')
    for tag, year in [('a', preset['a']), ('b', preset['b'])]:
        dates = pd.date_range(f'{year}-10-01', f'{year}-{end}', tz='UTC')
        rows = selected[selected.date.between(dates[0], dates[-1], inclusive='both')]
        full = build_events(rows[rows.sensor.isin(preset['fleet_' + tag])])
        shared = full if set(preset['shared']) == set(preset['fleet_' + tag]) else build_events(rows[rows.sensor.isin(preset['shared'])])
        wkeys = set(full[['date', 'cell_x', 'cell_y']].itertuples(index=False, name=None))
        ukeys = set(shared[['date', 'cell_x', 'cell_y']].itertuples(index=False, name=None))
        if not ukeys.issubset(wkeys): raise ValueError('Shared events are not a subset of included events')
        ckeys = wkeys - ukeys
        cc = Counter(key[0] for key in ckeys)
        wc, uc = full.groupby('date').size(), shared.groupby('date').size()
        daily = {'W': [int(wc.get(d, 0)) for d in dates], 'U': [int(uc.get(d, 0)) for d in dates],
                 'C': [cc.get(d, 0) for d in dates]}
        for role in ['W', 'U', 'C']: result[role + '_' + tag] = sum(daily[role])
        result['periods'][tag] = {'season': year, 'dates': [d.strftime('%Y-%m-%d') for d in dates],
                                  'interval': [dates[0].strftime('%Y-%m-%d'), dates[-1].strftime('%Y-%m-%d')],
                                  'daily': daily, 'satellites': preset['fleet_' + tag], 'shared': preset['shared']}
    if result['W_a'] and result['U_a']:
        result.update(compare_periods(result['W_a'], result['W_b'], result['U_a'], result['U_b']))
    else:
        result['change_W_pct'] = round(100 * (result['W_b'] / result['W_a'] - 1), 1) if result['W_a'] else None
        result['change_U_pct'] = round(100 * (result['U_b'] / result['U_a'] - 1), 1) if result['U_a'] else None
        result['diff_pp'] = None
    if result['diff_pp'] is None:
        result['qualification'] = 'At least one baseline count is zero; its percentage and dependent gap are unavailable. Absolute counts remain reported. Actual-fire change is not measured.'
    elif abs(result['diff_pp']) >= 10:
        result['qualification'] = 'Requires qualification: these percentages compare different satellite selections. Neither is a corrected estimate of fire activity; the difference is not a causal attribution. Actual-fire change is not measured.'
    else:
        result['qualification'] = 'A small or zero selection gap does not establish comparability: this calculation cannot expose changes within the shared fleet. Actual-fire change is not measured.'
    result['denominators'] = {'change_W_pct': 'W_a: earlier all-included-satellite recorded cell-days',
                              'change_U_pct': 'U_a: earlier shared-satellite recorded cell-days',
                              'diff_pp': 'difference between unrounded percentage changes'}
    return result


def check_hero_compatibility(comparisons, audit):
    mismatches, checks = [], 0
    def compare(preset_id, field, actual, expected):
        nonlocal checks
        checks += 1
        if actual != expected:
            mismatches.append({'preset': preset_id, 'field': field, 'actual': actual, 'expected': expected})
    actual_by_id = {row['id']: row for row in comparisons}
    compare('all', 'preset_ids', sorted(actual_by_id), sorted(p['id'] for p in audit['presets']))
    for preset in audit['presets']:
        pid = preset['id']
        if pid not in actual_by_id: continue
        row = actual_by_id[pid]
        for field in ['a', 'b', 'W_a', 'W_b', 'U_a', 'U_b', 'C_a', 'C_b',
                      'fleet_a', 'fleet_b', 'shared', 'change_W_pct', 'change_U_pct', 'diff_pp']:
            compare(pid, field, row[field], preset[field])
        end = preset.get('comparison_end_mm_dd', '11-14' if pid == 'snpp_cessation' else '11-15')
        for tag, year in [('a', preset['a']), ('b', preset['b'])]:
            dates = pd.date_range(f'{year}-10-01', f'{year}-{end}').strftime('%Y-%m-%d').tolist()
            compare(pid, 'dates_' + tag, row['periods'][tag]['dates'], dates)
            compare(pid, 'interval_' + tag, row['periods'][tag]['interval'], [dates[0], dates[-1]])
            w = audit['daily'][str(year)]['+'.join(preset['fleet_' + tag])][:len(dates)]
            u = audit['daily'][str(year)]['+'.join(preset['shared'])][:len(dates)]
            for role, expected in [('W', w), ('U', u), ('C', [a-b for a, b in zip(w, u)])]:
                compare(pid, 'daily_' + role + '_' + tag, row['periods'][tag]['daily'][role], expected)
    return {'passed': not mismatches, 'checks': checks, 'mismatches': mismatches,
            'rule': 'Exact equality; no tolerance, substitution or frozen-row repair'}


def sha256(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def write_json(path, data):
    temporary = path.with_suffix('.tmp')
    temporary.write_bytes((json.dumps(data, indent=2, ensure_ascii=False, allow_nan=False) + '\n').encode())
    temporary.replace(path)


def main():
    repo = Path(__file__).resolve().parents[2]
    root = repo / 'extensions/india/data'
    outputs = root / 'outputs'
    audit_path = repo / 'frontend/audit.json'
    audit = json.loads(audit_path.read_text(encoding='utf-8'))
    frozen_files = [repo / 'frontend' / n for n in ['audit.json', 'ledger.json', 'timing.json', 'transitions.json', 'ledger.csv']]
    before = {p.name: sha256(p) for p in frozen_files}
    manifest_path = root / 'manifests/pull.json'
    manifest = json.loads(manifest_path.read_text())
    if not manifest['status'].startswith('RETRIEVED'):
        raise SystemExit('Input pull has not succeeded; no generation')
    if __package__:
        from .india_fetch import request_plan
    else:
        from india_fetch import request_plan
    key = lambda c: (c['season'], c['source'], c['start'], c['end'])
    if len(manifest['chunks']) != len(request_plan()) or {key(c) for c in manifest['chunks']} != {key(c) for c in request_plan()}:
        raise SystemExit('Input snapshot does not match declared request plan')
    frames = []
    for chunk in manifest['chunks']:
        path = (root / 'raw' / chunk['file']).resolve()
        if path.parent != (root / 'raw').resolve() or chunk['status'] != 'retrieved' or sha256(path) != chunk['sha256']:
            raise SystemExit('Invalid or revised input chunk: ' + chunk['file'])
        raw = pd.read_csv(path, dtype='string')
        if len(raw) != chunk['rows']: raise SystemExit('Input row-count mismatch: ' + chunk['file'])
        frames.append(standardize(raw))
    frame = pd.concat(frames, ignore_index=True)
    del frames
    standardized_path = root / 'standardized/standardized.parquet'
    frame.to_parquet(standardized_path, index=False)
    sources = {p.relative_to(repo).as_posix(): sha256(p) for p in
               [manifest_path, audit_path, standardized_path, Path(__file__),
                repo / 'backend/scripts/harmonize.py', repo / 'backend/scripts/audit.py']}
    metadata = {'feature_label': 'Geographic extension: three predefined comparisons across six selected seasons.',
                'qualification': QUALIFICATION, 'coordinate_order': ['west', 'south', 'east', 'north'],
                'coordinate_predicate': 'west <= lon <= east AND south <= lat <= north; inclusive edges',
                'shared_edges': 'A detection may belong to multiple rectangles; rectangles are not disjoint.',
                'filtering': 'Filter standardized detection coordinates BEFORE canonical build_events unions.',
                'grid': audit['grid_spec'],
                'grid_disclosure': 'Canonical fixed grid, approximately 1 km at reference latitude; physical dimensions vary across latitude. No equal-area density comparison.',
                'selection_policy': 'Use frozen named satellite sets, including sensors with zero regional retained detections. Missing source differs from successful retrieval with zero detections.',
                'confidence_rules': {'MODIS': '>=50', 'VIIRS': ['n', 'h']},
                'unit': 'recorded cell-days', 'frp_rule': 'Separate maxima via canonical build_events; never sum FRP across sensors.',
                'products': {str(y): 'NRT' if y == 2026 else 'SP' for y in [2011, 2012, 2017, 2018, 2025, 2026]},
                'noaa21': 'Excluded; no NOAA-21 observations in this input snapshot.',
                'coverage': 'Retrieved records with disclosed known-missing product intervals; completeness unknown.',
                'outage_disclosures_by_comparison': {p['id']: [o for o in manifest['outages'] if p['id'] in o['comparison_ids']] for p in audit['presets']},
                'expected_cessation': manifest['known_missing_expected_cessation'],
                'unverified_excluded': [{'date': '2026-11-15', 'W': None, 'U': None, 'C': None, 'reason': 'unverified, not retrieved; excluded'}],
                'provenance': {'sha256_exact_bytes': sources, 'pull_manifest': manifest_path.relative_to(repo).as_posix(),
                               'raw_file_hashes': {c['file']: c['sha256'] for c in manifest['chunks']},
                               'retrieval_timestamps_utc': [c['retrieved_at_utc'] for c in manifest['chunks']],
                               'generated_at_utc': datetime.now(timezone.utc).isoformat()},
                'frozen_file_sha256_before': before}
    result = {'schema': 'india-audit v1', 'status': 'CANDIDATE - independent release approval pending',
              'metadata': metadata, 'rectangles': []}
    for rid, label, bounds in RECTANGLES:
        comparisons = []
        for preset in audit['presets']:
            comparison = build_comparison(frame, bounds, preset)
            for tag in ['a', 'b']:
                year = comparison[tag]
                comparison['periods'][tag]['coverage'] = {
                    'status': 'retrieved; known missing disclosed; completeness unknown',
                    'product': metadata['products'][str(year)],
                    'known_missing': [o for o in manifest['outages'] if year in o['seasons']],
                    'source_files': [c['file'] for c in manifest['chunks'] if c['season'] == year],
                    'expected_cessation': metadata['expected_cessation'] if year == 2026 else []}
            comparisons.append(comparison)
            print(rid, preset['id'], {k: comparison[k] for k in ['W_a','W_b','U_a','U_b','C_a','C_b','change_W_pct','change_U_pct','diff_pp']}, flush=True)
        result['rectangles'].append({'id': rid, 'label': label, 'bounds': bounds, 'comparisons': comparisons})
        if rid == 'hero':
            gate = check_hero_compatibility(comparisons, audit)
            result['hero_compatibility'] = gate
            write_json(outputs / 'compatibility.json', gate)
            if not gate['passed']:
                result['status'] = 'REJECTED - exact hero compatibility failed'
                metadata['frozen_file_sha256_after'] = {p.name: sha256(p) for p in frozen_files}
                write_json(outputs / 'india.rejected.json', result)
                raise SystemExit('STOP: exact hero mismatch; see compatibility.json. No india.json replacement.')
    metadata['frozen_file_sha256_after'] = {p.name: sha256(p) for p in frozen_files}
    if metadata['frozen_file_sha256_after'] != before: raise SystemExit('Frozen input changed during generation')
    write_json(outputs / 'india.json', result)
    write_json(repo / 'frontend/india.json', result)
    print('PASS: all comparisons generated; candidate sha256', sha256(outputs / 'india.json'), flush=True)


if __name__ == '__main__':
    main()
