import pandas as pd
from scripts.india_audit import build_comparison, select_rectangle, check_hero_compatibility
from scripts.harmonize import build_events


def test_rectangle_edges_and_negative_grid_indices_before_union():
    frame = pd.DataFrame({
        'date': pd.to_datetime(['2011-10-01', '2012-10-01', '2012-10-01', '2012-10-01'], utc=True),
        'lat': [27.6, 27.6, 27.59995, 27.6],
        'lon': [73.8, 73.8, 73.79995, 74.],
        'sensor': ['MODIS_TERRA', 'MODIS_TERRA', 'VIIRS_SNPP', 'VIIRS_SNPP'],
        'frp': [1., 2., 3., 100.], 'daynight': ['D'] * 4, 'acq_time': ['05:00'] * 4,
    })
    bounds = [73.79995, 27.59995, 73.8, 27.6]
    selected = select_rectangle(frame, bounds)
    assert len(selected) == 3
    cells = build_events(selected)
    assert (-1, -1) in set(zip(cells.cell_x, cells.cell_y))
    preset = {'id': 'fixture', 'a': 2011, 'b': 2012, 'fleet_a': ['MODIS_TERRA'],
              'fleet_b': ['MODIS_TERRA', 'VIIRS_SNPP'], 'shared': ['MODIS_TERRA']}
    result = build_comparison(frame, bounds, preset)
    assert [result[k] for k in ['W_a', 'W_b', 'U_a', 'U_b', 'C_a', 'C_b']] == [1, 2, 1, 1, 0, 1]
    assert result['change_W_pct'] == 100.0
    assert result['change_U_pct'] == 0.0
    assert result['diff_pp'] == 100.0
    assert len(result['periods']['a']['dates']) == 46
    assert result['periods']['b']['daily']['C'][0] == 1


def test_zero_shared_baseline_is_null_while_nonzero_full_baseline_is_defined():
    frame = pd.DataFrame({
        'date': pd.to_datetime(['2011-10-01', '2012-10-01'], utc=True),
        'lat': [30.] * 2, 'lon': [75.] * 2, 'frp': [1.] * 2,
        'sensor': ['VIIRS_SNPP', 'MODIS_TERRA'], 'daynight': ['D'] * 2, 'acq_time': ['05:00'] * 2,
    })
    preset = {'id': 'fixture', 'a': 2011, 'b': 2012,
              'fleet_a': ['MODIS_TERRA', 'VIIRS_SNPP'],
              'fleet_b': ['MODIS_TERRA', 'VIIRS_NOAA20'], 'shared': ['MODIS_TERRA']}
    result = build_comparison(frame, [73.8, 27.6, 77.6, 32.6], preset)
    assert result['change_W_pct'] == 0.0
    assert result['change_U_pct'] is None and result['diff_pp'] is None
    assert 'baseline' in result['qualification'] and 'unavailable' in result['qualification']
    result = build_comparison(frame, [0., 0., 1., 1.], preset)
    assert result['W_a'] == result['U_a'] == 0
    assert all(result[k] is None for k in ['change_W_pct', 'change_U_pct', 'diff_pp'])


def test_hero_gate_rejects_daily_mismatch_even_when_totals_match():
    preset = {'id': 'fixture', 'a': 2011, 'b': 2012, 'fleet_a': ['MODIS_TERRA'],
              'fleet_b': ['MODIS_TERRA', 'VIIRS_SNPP'], 'shared': ['MODIS_TERRA'],
              'W_a': 1, 'U_a': 1, 'C_a': 0, 'W_b': 2, 'U_b': 1, 'C_b': 1,
              'change_W_pct': 100., 'change_U_pct': 0., 'diff_pp': 100.}
    frozen = {'presets': [preset], 'daily': {'2011': {'MODIS_TERRA': [1] + [0] * 45},
        '2012': {'MODIS_TERRA': [1] + [0] * 45, 'MODIS_TERRA+VIIRS_SNPP': [2] + [0] * 45}}}
    actual = dict(preset, periods={})
    for tag, year in [('a', 2011), ('b', 2012)]:
        actual['periods'][tag] = {'dates': pd.date_range(f'{year}-10-01', f'{year}-11-15').strftime('%Y-%m-%d').tolist(),
                                  'interval': [f'{year}-10-01', f'{year}-11-15'],
                                  'daily': {'W': [preset['W_'+tag]] + [0] * 45,
                                            'U': [1] + [0] * 45, 'C': [preset['C_'+tag]] + [0] * 45}}
    assert check_hero_compatibility([actual], frozen)['passed']
    actual['periods']['b']['daily']['W'][:2] = [0, 2]
    report = check_hero_compatibility([actual], frozen)
    assert not report['passed']
    assert any(m['field'] == 'daily_W_b' for m in report['mismatches'])
