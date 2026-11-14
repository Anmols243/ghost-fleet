import pandas as pd

from scripts import harmonize


def test_modis_and_viirs_merge_in_same_cell_day():
    frame = pd.DataFrame({
        "date": pd.to_datetime(["2020-10-01"] * 3, utc=True),
        "lat": [30.0001, 30.0002, 30.0001],
        "lon": [75.001, 75.002, 75.001],
        "frp": [10.0, 20.0, 12.0],
        "sensor": ["MODIS_TERRA", "VIIRS_NOAA20", "MODIS_AQUA"],
        "daynight": ["D", "N", "D"],
        "acq_time": ["05:30", "19:00", "07:15"],
    })
    events = harmonize.build_events(frame)
    assert len(events) == 1
    event = events.iloc[0]
    assert event.sensors_seen == "MODIS_AQUA|MODIS_TERRA|VIIRS_NOAA20"
    assert event.frp_modis == 12.0
    assert event.frp_viirs == 20.0
    assert event.daynight == "D|N"
    assert event.first_acq == "05:30"


def test_snpp_and_noaa20_merge_but_other_days_and_cells_stay_separate():
    frame = pd.DataFrame({
        "date": pd.to_datetime(["2020-10-01"] * 3 + ["2020-10-02"], utc=True),
        "lat": [30.0001, 30.0002, 30.1, 30.0001],
        "lon": [75.001] * 4,
        "frp": [8.0, 3.0, 4.0, 5.0],
        "sensor": ["VIIRS_SNPP", "VIIRS_NOAA20", "VIIRS_NOAA21", "VIIRS_SNPP"],
        "daynight": ["D"] * 4,
        "acq_time": ["06:00", "07:00", "08:00", "09:00"],
    })
    events = harmonize.build_events(frame)
    assert len(events) == 3
    merged = events[events.sensors_seen == "VIIRS_NOAA20|VIIRS_SNPP"].iloc[0]
    assert merged.frp_viirs == 8.0
    assert pd.isna(merged.frp_modis)


def test_standardize_drops_low_confidence_and_splits_satellites():
    raw = pd.DataFrame({
        "acq_date": ["2020-10-01"] * 7,
        "latitude": [30.0] * 7, "longitude": [75.0] * 7,
        "frp": [4.0] * 7,
        "satellite": ["Terra", "Aqua", "N", "N20", "N21", "Terra", "N"],
        "instrument": ["MODIS", "MODIS", "VIIRS", "VIIRS", "VIIRS", "MODIS", "VIIRS"],
        "confidence": ["50", "90", "n", "h", "n", "49", "l"],
        "daynight": ["D"] * 7,
        "acq_time": ["5", "530", "0715", "1900", "2359", "1200", "1200"],
    })
    result = harmonize.standardize(raw)
    assert list(result.columns) == [
        "date", "lat", "lon", "frp", "sensor", "confidence_raw", "daynight", "acq_time"
    ]
    assert result.sensor.tolist() == [
        "MODIS_TERRA", "MODIS_AQUA", "VIIRS_SNPP", "VIIRS_NOAA20", "VIIRS_NOAA21"
    ]
    assert result.confidence_raw.tolist() == ["50", "90", "n", "h", "n"]
    assert result.acq_time.tolist() == ["00:05", "05:30", "07:15", "19:00", "23:59"]
    assert str(result.date.dt.tz) == "UTC"


def test_calendar_has_46_days_and_baselines_exclude_target_season():
    events = pd.DataFrame({
        "date": pd.to_datetime(
            ["2020-10-01"] * 100 + ["2021-10-01"] * 2 + ["2022-10-01"] * 4,
            utc=True,
        )
    })
    calendar = harmonize.build_calendar(events, 2020, seasons=[2020, 2021, 2022])
    assert len(calendar) == 46
    assert calendar[0] == {
        "date": "2020-10-01", "day_index": 1, "events": 100,
        "median": 3.0, "p90": 3.8, "critical": True,
    }
    assert calendar[-1] == {
        "date": "2020-11-15", "day_index": 46, "events": 0,
        "median": 0.0, "p90": 0.0, "critical": False,
    }
    assert all(day["events"] == 0 for day in calendar[1:])
