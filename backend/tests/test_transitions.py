import pandas as pd
import json
from pathlib import Path
import pytest

from scripts.transitions import build_transitions, validate_transitions


def test_transition_counts_use_both_verified_windows_not_full_season_totals():
    rows = []
    for year in [2025, 2026]:
        for i, date in enumerate(pd.date_range(f'{year}-10-01', f'{year}-11-15')):
            rows.append({'date': date.strftime('%Y-%m-%d'), 'satellite_selection': 'Terra',
                         'recorded_cell_days': (100 if year == 2025 else 81) if i == 0
                         else (80 if year == 2025 else None) if i == 45 else 0,
                         'coverage_status': 'unverified' if year == 2026 and i == 45 else 'verified'})
    audit = {'sensors_present': {'2025': ['MODIS_TERRA'], '2026': ['MODIS_TERRA']},
             'coverage': {'2025': {'cutoff': '2025-11-15'},
                          '2026': {'cutoff': '2026-11-14'}}}
    row = build_transitions({'rows': rows}, audit)['rows'][0]
    assert row['W_a'] == row['U_a'] == 100
    assert row['W_b'] == row['U_b'] == 81
    assert row['change_W_pct'] == row['change_U_pct'] == -19.0
    assert row['C_a'] == row['C_b'] == row['diff_pp'] == 0
    assert row['comparison_end_mm_dd'] == '11-14'
    assert row['days'] == 45


@pytest.mark.parametrize('damage', ['missing', 'unverified'])
def test_transition_refuses_an_incomplete_ledger_inside_common_window(damage):
    frontend = Path(__file__).resolve().parents[2] / 'frontend'
    ledger = json.loads((frontend / 'ledger.json').read_text(encoding='utf-8'))
    audit = json.loads((frontend / 'audit.json').read_text(encoding='utf-8'))
    if damage == 'missing':
        ledger['rows'].pop(0)
    else:
        ledger['rows'][0]['coverage_status'] = 'unverified'
    with pytest.raises(ValueError, match='Incomplete verified ledger'):
        build_transitions(ledger, audit)


def test_all_transitions_match_exact_pack_table_and_reject_changed_counts():
    path = Path(__file__).resolve().parents[2] / 'frontend/transitions.json'
    data = json.loads(path.read_text(encoding='utf-8'))
    validate_transitions(data)
    assert len(data['rows']) == 25
    assert [r['a'] for r in data['rows']] == list(range(2001, 2026))
    assert data['rows'][10]['diff_pp'] == 449.8  # subtracting rounded % gives 449.9
    assert data['rows'][16]['diff_pp'] == 87.6
    data['rows'][0]['W_b'] += 1
    with pytest.raises(ValueError, match='Transition reference mismatch'):
        validate_transitions(data)
