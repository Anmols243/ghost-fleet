import pandas as pd

from scripts import detectability


def test_eight_cell_day_fixture_has_hand_computed_shares():
    # Eight distinct cells: FRP, VIIRS day/night, MODIS seen that UTC day.
    cases = [
        (0.25, "D", False), (0.5, "D", True),
        (1.0, "D", True), (3.7, "D", False),
        (10.0, "N", True), (40.0, "N", True),
        (45.0, "N", False), (0.5, "N", False),
    ]
    rows = []
    for index, (frp, daynight, seen) in enumerate(cases):
        row = {
            "date": "2020-10-01", "lat": 30.0001, "lon": 75.001 + index * 0.02,
            "frp": frp, "sensor": "VIIRS_SNPP", "confidence_raw": "n",
            "daynight": daynight, "acq_time": "06:00",
        }
        rows.append(row)
        if seen:
            # MODIS may see the cell at a different time/daynight class.
            rows.append(dict(row, sensor="MODIS_TERRA", frp=99.0,
                             confidence_raw="90", daynight="N", acq_time="19:00"))
        if index == 1:
            # Another satellite/detection must not inflate the denominator;
            # maximum VIIRS FRP selects 0.5–1 rather than the weaker band.
            rows.append(dict(row, sensor="VIIRS_NOAA20", frp=0.2))
        if index == 6:
            # MODIS on a different date is not a match.
            rows.append(dict(row, sensor="MODIS_AQUA", date="2020-10-02", frp=100.0))
    frame = pd.DataFrame(rows)
    frame["date"] = pd.to_datetime(frame.date, utc=True)
    result = detectability.build_detectability(frame)
    observed = {
        (b["frp_band"], b["daynight"]):
        (b["viirs_cell_days"], b["modis_seen_cell_days"], b["modis_seen_share"])
        for b in result["bins"]
    }
    assert observed == {
        ("0-0.5", "D"): (1, 0, 0.0), ("0-0.5", "N"): (0, 0, None),
        ("0.5-1", "D"): (1, 1, 1.0), ("0.5-1", "N"): (1, 0, 0.0),
        ("1-3.7", "D"): (1, 1, 1.0), ("1-3.7", "N"): (0, 0, None),
        ("3.7-10", "D"): (1, 0, 0.0), ("3.7-10", "N"): (0, 0, None),
        ("10-40", "D"): (0, 0, None), ("10-40", "N"): (1, 1, 1.0),
        ("40+", "D"): (0, 0, None), ("40+", "N"): (2, 1, 0.5),
    }
