import pandas as pd
import json
from pathlib import Path
import pytest

from scripts.ledger import build_ledger, validate_ledger


def test_ledger_union_counts_and_unverified_day_are_not_zero_filled():
    frame = pd.DataFrame({
        'date': pd.to_datetime(['2026-10-01'] * 2 + ['2026-11-15'], utc=True),
        'lat': [30.0001] * 3, 'lon': [75.001] * 3,
        'sensor': ['MODIS_TERRA', 'VIIRS_NOAA20', 'MODIS_TERRA'],
        'frp': [10., 20., 30.], 'daynight': ['D'] * 3,
        'acq_time': ['05:30', '08:00', '05:30'],
    })
    audit = {
        'sensors_present': {'2026': ['MODIS_TERRA', 'VIIRS_NOAA20']},
        'coverage': {'2026': {'cutoff': '2026-11-14', 'product': 'NRT'}},
        'presets': [],
    }
    rows = build_ledger(frame, audit)['rows']
    assert len(rows) == 46
    assert rows[0] == {
        'date': '2026-10-01', 'satellite_selection': 'Terra+NOAA-20',
        'recorded_cell_days': 1, 'coverage_status': 'verified',
        'product': 'NRT', 'comparison_inclusion': 'none',
    }
    assert rows[1]['recorded_cell_days'] == 0
    assert rows[-1]['recorded_cell_days'] is None
    assert rows[-1]['coverage_status'] == 'unverified'
    assert rows[-1]['comparison_inclusion'] == 'none'


def test_ledger_separates_shared_selection_and_common_window_inclusion():
    frame = pd.DataFrame({
        'date': pd.to_datetime(['2025-10-01', '2026-10-01'], utc=True),
        'lat': [30.] * 2, 'lon': [75.] * 2,
        'sensor': ['MODIS_TERRA', 'VIIRS_NOAA20'],
        'frp': [10.] * 2, 'daynight': ['D'] * 2, 'acq_time': ['05:00'] * 2,
    })
    audit = {
        'sensors_present': {'2025': ['MODIS_TERRA'],
                            '2026': ['MODIS_TERRA', 'VIIRS_NOAA20']},
        'coverage': {'2025': {'cutoff': '2025-11-15', 'product': 'SP'},
                     '2026': {'cutoff': '2026-11-14', 'product': 'NRT'}},
        'presets': [{'id': 'fixture', 'a': 2025, 'b': 2026,
                     'shared': ['MODIS_TERRA']}],
    }
    rows = build_ledger(frame, audit)['rows']
    shared = next(r for r in rows if r['date'] == '2026-10-01'
                  and r['satellite_selection'] == 'Terra')
    assert shared['recorded_cell_days'] == 0
    assert 'fixture U' in shared['comparison_inclusion']
    assert '2025->2026 U' in shared['comparison_inclusion']
    nov15 = next(r for r in rows if r['date'] == '2025-11-15')
    assert nov15['coverage_status'] == 'verified'
    assert nov15['comparison_inclusion'] == 'none'


def test_real_ledger_matches_all_frozen_daily_selections_and_spot_checks():
    frontend = Path(__file__).resolve().parents[2] / 'frontend'
    ledger = json.loads((frontend / 'ledger.json').read_text(encoding='utf-8'))
    audit = json.loads((frontend / 'audit.json').read_text(encoding='utf-8'))
    validate_ledger(ledger, audit)
    ledger['rows'][0]['recorded_cell_days'] += 1
    with pytest.raises(ValueError, match='Ledger season 2001'):
        validate_ledger(ledger, audit)
