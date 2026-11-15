import pandas as pd
import json
from pathlib import Path

from scripts.timing import build_timing


def test_daytime_timing_uses_retained_rows_only_and_respects_cutoff():
    frame = pd.DataFrame({
        'date': pd.to_datetime(['2026-10-01'] * 3 + ['2026-10-02'] * 2
                               + ['2026-11-15', '2026-09-30'], utc=True),
        'sensor': ['MODIS_AQUA'] * 7,
        'daynight': ['D', 'D', 'N', 'D', 'D', 'D', 'D'],
        'acq_time': ['08:00', '08:10', '23:59', '08:20', '08:30', '23:59', '23:59'],
    })
    audit = {'coverage': {'2026': {'cutoff': '2026-11-14'}}}
    data = build_timing(frame, audit)
    aqua = next(r for r in data['rows'] if r['satellite'] == 'MODIS_AQUA')
    assert aqua['median_minutes_utc'] == 495
    assert aqua['q1_minutes_utc'] == 487.5
    assert aqua['q3_minutes_utc'] == 502.5
    assert aqua['median_utc'] == '08:15:00'
    assert aqua['n'] == 4
    assert aqua['represented_days'] == 2
    terra = next(r for r in data['rows'] if r['satellite'] == 'MODIS_TERRA')
    for field in ['median_utc', 'q1_utc', 'q3_utc', 'n', 'represented_days']:
        assert terra[field] is None


def test_frozen_timing_matches_pack_reference_tolerances():
    path = Path(__file__).resolve().parents[2] / 'frontend/timing.json'
    rows = json.loads(path.read_text(encoding='utf-8'))['rows']
    values = {(r['season'], r['satellite']): r for r in rows}
    for year in range(2002, 2023):
        assert 488 <= values[year, 'MODIS_AQUA']['median_minutes_utc'] <= 498
    aqua = {2020: (497, 485, 504), 2023: (517, 509, 524),
            2024: (544, 530, 550), 2025: (582, 572, 594),
            2026: (630, 621, 636)}
    for year, expected in aqua.items():
        row = values[year, 'MODIS_AQUA']
        tolerance = 6 if year == 2026 else 3
        for key, reference in zip(['median', 'q1', 'q3'], expected):
            assert abs(row[key + '_minutes_utc'] - reference) <= tolerance
    assert values[2020, 'MODIS_AQUA']['n'] == 13504
    assert values[2020, 'MODIS_AQUA']['represented_days'] == 44
    for year, median, n in [(2022, 336, 396), (2023, 324, 104),
                             (2024, 304, 49), (2025, 274, 23), (2026, 250, 55)]:
        row = values[year, 'MODIS_TERRA']
        assert abs(row['median_minutes_utc'] - median) <= (6 if year == 2026 else 3)
        assert row['n'] == n
