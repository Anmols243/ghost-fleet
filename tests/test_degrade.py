import pandas as pd
import pytest

from scripts import degrade


def frame(rows):
    result = pd.DataFrame(rows, columns=["date", "sensor", "acq_time", "frp", "daynight"])
    result["date"] = pd.to_datetime(result.date, utc=True)
    result["lat"] = 30.0
    result["lon"] = [75.0 + i * 0.02 for i in range(len(result))]
    result["confidence_raw"] = "h"
    return result


def test_windows_follow_season_aqua_drift_and_split_only_over_60_minutes():
    data = frame([
        ("2020-10-01", "MODIS_AQUA", "13:30", 1, "D"),
        ("2020-10-02", "MODIS_AQUA", "14:30", 1, "D"),
        ("2020-10-03", "MODIS_TERRA", "17:00", 1, "D"),
        ("2026-10-01", "MODIS_AQUA", "16:00", 1, "D"),
        ("2026-10-01", "VIIRS_NOAA20", "10:00", 100, "D"),
    ])
    assert degrade.reconstruct_windows(data) == {
        2020: [(765, 915), (975, 1065)],
        2026: [(915, 1005)],
    }


def test_survival_requires_window_and_daynight_limit_preserving_modis():
    data = frame([
        ("2020-10-01", "MODIS_AQUA", "13:30", 0.1, "D"),
        ("2020-10-01", "VIIRS_SNPP", "12:44", 100, "D"),
        ("2020-10-01", "VIIRS_NOAA20", "13:30", 5.69, "D"),
        ("2020-10-01", "VIIRS_NOAA20", "12:45", 5.7, "D"),
        ("2020-10-02", "VIIRS_NOAA20", "14:15", 8, "D"),
        ("2020-10-01", "VIIRS_SNPP", "13:30", 3.7, "N"),
        ("2020-10-01", "VIIRS_SNPP", "13:30", 3.69, "N"),
        ("2020-10-01", "VIIRS_SNPP", "14:16", 100, "D"),
    ])
    result = degrade.degrade_detections(data)
    assert result.index.tolist() == [0, 3, 4, 5]
    pd.testing.assert_frame_equal(result, data.loc[[0, 3, 4, 5]])


def test_midnight_windows_and_season_without_modis():
    data = frame([
        ("2020-10-01", "MODIS_TERRA", "00:10", 1, "N"),
        ("2020-10-01", "VIIRS_SNPP", "23:30", 5, "N"),
        ("2020-10-01", "VIIRS_SNPP", "23:24", 5, "N"),
        ("2021-10-01", "VIIRS_SNPP", "00:10", 100, "N"),
    ])
    assert degrade.reconstruct_windows(data) == {2020: [(0, 55), (1405, 1439)], 2021: []}
    assert degrade.degrade_detections(data).index.tolist() == [0, 1]


def test_sensitivity_event_totals_and_degrade_only_gate():
    data = frame([
        ("2020-10-01", "MODIS_AQUA", "13:30", 1, "D"),
        ("2020-10-01", "VIIRS_NOAA20", "13:30", 4, "D"),
        ("2020-10-01", "VIIRS_SNPP", "13:30", 6, "D"),
        ("2020-10-01", "VIIRS_NOAA20", "13:30", 10, "D"),
        ("2020-10-01", "VIIRS_NOAA20", "10:00", 100, "D"),
    ])
    result = degrade.build_sameeyes(data, seasons=[2020, 2021])
    season = result[2020]
    assert season["full_total"] == 5
    assert season["sameeyes_total"] == 3
    assert season["sensitivity"]["approximation"] is True
    assert [s["total_events"] for s in season["sensitivity"]["scenarios"]] == [4, 3, 2]
    assert len(season["days"]) == 46
    assert sum(d["events"] for d in season["days"]) == 3
    assert result[2021]["sameeyes_total"] == 0
    with pytest.raises(ValueError, match="same-eyes exceeds full"):
        degrade.check_gate(2020, 6, 5)
