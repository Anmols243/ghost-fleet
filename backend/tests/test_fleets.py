import pandas as pd

from scripts import fleets


def fixture():
    return pd.DataFrame({
        "date": pd.to_datetime(["2026-10-01"] * 5, utc=True),
        "sensor": ["MODIS_TERRA", "MODIS_AQUA", "VIIRS_SNPP", "VIIRS_NOAA20", "VIIRS_NOAA21"],
        "lat": [30.0] * 5, "lon": [75.0, 75.02, 75.04, 75.06, 75.08],
        "frp": [1.0] * 5, "daynight": ["D"] * 5,
        "acq_time": ["13:30"] * 5, "confidence_raw": ["90", "90", "h", "h", "h"],
    })


def baseline():
    return [
        {"date": day.strftime("%Y-%m-%d"), "day_index": i + 1,
         "events": 99, "median": 1.0, "p90": 2.0, "critical": True}
        for i, day in enumerate(pd.date_range("2026-10-01", "2026-11-15"))
    ]


def test_fixture_fleet_totals_are_ordered_and_share_one_baseline():
    rendered, diff = fleets.build_fleets(fixture(), baseline())
    assert [f["total"] for f in diff["fleets"].values()] == [1, 2, 3, 4, 4]
    assert [f["pct_of_full"] for f in diff["fleets"].values()] == [25, 50, 75, 100, 100]
    assert [f["critical_days"] for f in diff["fleets"].values()] == [0, 0, 1, 1, 1]
    assert diff["peak_shift"]["days"] == 0
    for fleet in rendered["fleets"].values():
        assert len(fleet["days"]) == 46
        assert [d["p90"] for d in fleet["days"]] == [2.0] * 46
        assert fleet["days"][-1]["events"] == 0


def test_post_snpp_excludes_snpp_and_has_cessation_annotation():
    data = fixture()
    extra = data[data.sensor.eq("VIIRS_SNPP")].copy()
    extra["date"] = pd.Timestamp("2026-11-04", tz="UTC")
    data = pd.concat([data, extra], ignore_index=True)
    selected = fleets.fleet_detections(data, "post_snpp2026")
    assert set(selected.sensor) == {"MODIS_TERRA", "MODIS_AQUA", "VIIRS_NOAA20", "VIIRS_NOAA21"}
    rendered, diff = fleets.build_fleets(data, baseline())
    assert rendered["fleets"]["post_snpp2026"]["annotations"] == {"snpp_ended": "2026-11-03"}
    assert diff["fleets"]["post_snpp2026"] == diff["fleets"]["full2026"]


def test_modis_fleet_uses_only_its_own_pass_windows_and_modern_viirs():
    data = fixture()
    data.loc[data.sensor.eq("MODIS_AQUA"), "acq_time"] = "16:00"
    data.loc[data.sensor.str.startswith("VIIRS_"), "acq_time"] = "16:00"
    data.loc[data.sensor.str.startswith("VIIRS_"), "frp"] = 10.0
    assert fleets.fleet_detections(data, "terra2000").sensor.tolist() == ["MODIS_TERRA"]
    assert fleets.fleet_detections(data, "terra_aqua2002").sensor.tolist() == [
        "MODIS_TERRA", "MODIS_AQUA", "VIIRS_NOAA20", "VIIRS_NOAA21"
    ]
