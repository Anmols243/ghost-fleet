from scripts.audit import compare_periods
import pandas as pd
from scripts import audit


def test_unrounded_gap_fixes_p2_reference_rounding_artifact():
    result = compare_periods(54060, 106893, 54060, 60101)
    assert result == {"change_W_pct": 97.7, "change_U_pct": 11.2, "diff_pp": 86.6}


def test_p2_acceptance_line_uses_unrounded_gap():
    row = dict(audit.REFERENCE["presets"][1])
    row.update(compare_periods(row["W_a"], row["W_b"], row["U_a"], row["U_b"]))
    assert audit.conclusion(row) == (
        "Recorded change, Punjab + Haryana, 2017 \u2192 2018: all included satellites, +97.7%; "
        "Terra+Aqua+Suomi NPP, +11.2%; difference, 86.6 percentage points. "
        "Neither percentage is a corrected estimate of fire activity, and the difference "
        "is not a causal attribution. Actual-fire change is not measured."
    )


def test_union_accounting_does_not_add_overlapping_sensor_events():
    rows = []
    for year, sensors in [(2011, ["MODIS_TERRA", "MODIS_AQUA"]),
                          (2012, ["MODIS_TERRA", "MODIS_AQUA", "VIIRS_SNPP"])]:
        for sensor in sensors:
            rows.append({"date": pd.Timestamp(f"{year}-10-01", tz="UTC"),
                         "lat": 30., "lon": 75., "sensor": sensor, "frp": 10.,
                         "acq_time": "06:00", "daynight": "D"})
    daily, present = audit.aggregate(pd.DataFrame(rows), seasons=[2011, 2012])
    assert daily["2012"]["+".join(present["2012"])] == [1] + [0] * 45
    assert daily["2012"]["MODIS_TERRA+VIIRS_SNPP"] == [1] + [0] * 45


def test_ratio_gate_accepts_large_change_amplification():
    expected = dict(audit.REFERENCE["presets"][0])
    actual = dict(expected, W_a=13581, W_b=75396, U_a=13581, U_b=14300,
                  C_b=61096)
    audit.validate_presets([actual] + audit.REFERENCE["presets"][1:])


def test_derived_c_gate_uses_full_w_scale_and_exact_identity():
    import pytest
    rows = [dict(row) for row in audit.REFERENCE["presets"]]
    rows[1].update(W_a=54291, U_a=54291, W_b=108035, U_b=60491, C_b=47544)
    audit.validate_presets(rows)
    rows[1]["C_b"] += 1
    with pytest.raises(ValueError, match="identity"):
        audit.validate_presets(rows)


def test_p3_excludes_nov15_in_both_periods_and_nulls_unverified_day():
    present = {str(y): ["MODIS_TERRA"] for y in (2011, 2012, 2017, 2018, 2025, 2026)}
    daily = {y: {"MODIS_TERRA": [100] + [0] * 44 + [1000]} for y in present}
    daily["2026"]["MODIS_TERRA"] = [80] + [0] * 44 + [None]
    row = audit.build_presets(daily, present)[2]
    assert (row["W_a"], row["W_b"], row["U_a"], row["U_b"]) == (100, 80, 100, 80)
    assert row["change_W_pct"] == -20.0
    assert "Nov 14" in audit.conclusion(row)


def test_2026_aggregation_uses_null_for_nov15():
    frame = pd.DataFrame({
        "date": pd.to_datetime(["2026-11-14", "2026-11-15"], utc=True),
        "sensor": ["MODIS_TERRA"] * 2, "lat": [30.] * 2, "lon": [75.] * 2,
        "frp": [10.] * 2, "acq_time": ["06:00"] * 2, "daynight": ["D"] * 2,
    })
    daily, _ = audit.aggregate(frame, seasons=[2026])
    assert daily["2026"]["MODIS_TERRA"] == [0] * 44 + [1, None]
