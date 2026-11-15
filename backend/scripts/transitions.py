"""All adjacent-season comparisons, from the independently versioned ledger."""
import json
from datetime import date, timedelta

if __package__:
    from .audit import compare_periods
    from .ledger import SEASON_TOTALS
    from .appendix_common import AUDIT, FRONTEND, provenance, read_audit, selection_name, write_json
else:
    from audit import compare_periods
    from ledger import SEASON_TOTALS
    from appendix_common import AUDIT, FRONTEND, provenance, read_audit, selection_name, write_json

BOUNDARY = ('A zero selection gap does not establish comparability: '
            'this calculation cannot expose changes within the shared fleet.')
# Independent acceptance display values from FREEZE2_BUILD_PACK section 4.
REFERENCE_CHANGES = [653.3, 8.4, -8.6, 66.2, -33.2, 44.5, -8.0, -6.9, -1.7,
                     13.1, 455.2, -8.8, 12.4, -15.3, 37.9, -39.8, 99.0,
                     -25.4, 59.4, 6.9, -38.5, -33.3, -59.4, -21.3, -19.0]


def build_transitions(ledger, audit):
    rows = []
    years = sorted(map(int, audit['sensors_present']))
    for a, b in zip(years, years[1:]):
        if b != a + 1:
            raise ValueError('Adjacent-season table cannot skip a season')
        shared = [s for s in audit['sensors_present'][str(a)]
                  if s in audit['sensors_present'][str(b)]]
        end = min(audit['coverage'][str(year)]['cutoff'][5:] for year in [a, b])
        row = {'a': a, 'b': b, 'shared': shared,
               'shared_label': selection_name(shared), 'comparison_start_mm_dd': '10-01',
               'comparison_end_mm_dd': end}
        for tag, year in [('a', a), ('b', b)]:
            start = date(year, 10, 1)
            end_date = date.fromisoformat(f'{year}-{end}')
            dates = {(start + timedelta(days=i)).isoformat()
                     for i in range((end_date - start).days + 1)}
            for role, sensors in [('W', audit['sensors_present'][str(year)]), ('U', shared)]:
                records = [r for r in ledger['rows'] if r['date'].startswith(str(year))
                           and r['satellite_selection'] == selection_name(sensors)
                           and '10-01' <= r['date'][5:] <= end]
                if (len(records) != len(dates) or {r['date'] for r in records} != dates
                        or any(r['coverage_status'] != 'verified'
                               or type(r['recorded_cell_days']) is not int
                               or r['recorded_cell_days'] < 0 for r in records)):
                    raise ValueError(f'Incomplete verified ledger: {year} {role}')
                row[role + '_' + tag] = sum(r['recorded_cell_days'] for r in records)
            row['C_' + tag] = row['W_' + tag] - row['U_' + tag]
        row['days'] = len(records)
        row.update(compare_periods(row['W_a'], row['W_b'], row['U_a'], row['U_b']))
        row['note'] = ('Small base: 2001 W = 1,192 recorded cell-days.' if a == 2001 else
                       'Interruption case; common verified cutoff in both periods.' if b == 2026 else '')
        rows.append(row)
    return {'schema': 'adjacent-transitions v1', 'rows': rows, 'boundary': BOUNDARY,
            'selection_rule': 'All adjacent-season pairs; no stitched continuous series.',
            'window_rule': 'Intersection of both verified seasonal windows; percentages use '
                           'unrounded integer counts; difference computed before rounding.',
            'unit': 'recorded cell-days', 'coverage': audit['coverage']}


def validate_transitions(data):
    if len(data['rows']) != 25:
        raise ValueError('Transition reference mismatch: expected all 25 adjacent pairs')
    for i, row in enumerate(data['rows']):
        a, b = 2001 + i, 2002 + i
        wa, wb = (17712, 14341) if b == 2026 else (SEASON_TOTALS[a], SEASON_TOTALS[b])
        ub, u_change, gap, cb = {
            2002: (2031, 70.4, 582.9, 6948),
            2012: (14303, 5.3, 449.8, 61093),
            2018: (60491, 11.4, 87.6, 47544),
        }.get(b, (wb, REFERENCE_CHANGES[i], 0.0, 0))
        expected = {'a': a, 'b': b, 'W_a': wa, 'W_b': wb, 'U_a': wa, 'U_b': ub,
                    'change_W_pct': REFERENCE_CHANGES[i], 'change_U_pct': u_change,
                    'diff_pp': gap, 'C_a': 0, 'C_b': cb,
                    'days': 45 if b == 2026 else 46,
                    'comparison_end_mm_dd': '11-14' if b == 2026 else '11-15'}
        for key, value in expected.items():
            if row[key] != value:
                raise ValueError(f'Transition reference mismatch: {a}->{b} {key}: '
                                 f'{row[key]} != {value}')


def main():
    ledger_path = FRONTEND / 'ledger.json'
    data = build_transitions(json.loads(ledger_path.read_text(encoding='utf-8')), read_audit())
    validate_transitions(data)
    data['sources'] = provenance(__file__, [ledger_path, AUDIT,
        FRONTEND.parent / 'backend/scripts/audit.py', FRONTEND.parent / 'backend/scripts/ledger.py'])
    write_json('transitions.json', data)
    for row in data['rows']:
        print(row['a'], row['b'], row['W_a'], row['W_b'], row['change_W_pct'],
              row['U_a'], row['U_b'], row['change_U_pct'], row['diff_pp'], row['C_b'], row['days'])


if __name__ == '__main__':
    main()
