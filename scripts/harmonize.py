"""Standardize FIRMS detections and merge them into daily spatial events."""

import math
import json
from pathlib import Path

import numpy as np
import pandas as pd

SEASONS = tuple(range(2001, 2027))
ROOT = Path(__file__).resolve().parents[1]


def standardize(raw):
    """Normalize FIRMS columns, retain raw confidence, apply confidence rules."""
    satellite = raw.satellite.astype("string").str.strip().str.upper()
    instrument = raw.instrument.astype("string").str.strip().str.upper()
    sensors = satellite.map({
        "TERRA": "MODIS_TERRA", "AQUA": "MODIS_AQUA",
        "N": "VIIRS_SNPP", "N20": "VIIRS_NOAA20", "N21": "VIIRS_NOAA21",
    })
    if sensors.isna().any():
        raise ValueError("Unknown FIRMS satellite")
    modis = sensors.str.startswith("MODIS_")
    if ((modis & instrument.ne("MODIS")) | (~modis & instrument.ne("VIIRS"))).any():
        raise ValueError("Satellite and instrument disagree")
    confidence = raw.confidence.astype("string")
    keep = (modis & pd.to_numeric(confidence, errors="coerce").ge(50)) | (
        ~modis & confidence.isin(["n", "h"])
    )
    selected = raw.loc[keep]
    time = selected.acq_time.astype("string").str.zfill(4)
    if not time.str.fullmatch(r"(?:[01][0-9]|2[0-3])[0-5][0-9]").all():
        raise ValueError("Invalid FIRMS acquisition time")
    result = pd.DataFrame({
        "date": pd.to_datetime(selected.acq_date, utc=True).dt.normalize(),
        "lat": pd.to_numeric(selected.latitude),
        "lon": pd.to_numeric(selected.longitude),
        "frp": pd.to_numeric(selected.frp),
        "sensor": sensors.loc[keep],
        "confidence_raw": confidence.loc[keep],
        "daynight": selected.daynight.astype("string"),
        "acq_time": time.str[:2] + ":" + time.str[2:],
    })
    if not result.daynight.isin(["D", "N"]).all():
        raise ValueError("Invalid FIRMS day/night label")
    return result.reset_index(drop=True)


def build_events(frame):
    """Merge a cell-day; keep separate MODIS/VIIRS FRP maxima in MW.

    Fixed equirectangular grid, SW origin (73.8, 27.6), reference latitude
    30.1 degrees. Each cell is 1 km at that latitude (about 0.97–1.03 km
    wide across the study bbox). Cell indices use floor, not rounding.
    Multi-valued sensor and day/night labels are sorted and pipe-delimited.
    """
    frame = frame.copy()
    km_per_degree = math.pi * 6371.0088 / 180
    frame["cell_x"] = np.floor(
        (frame.lon - 73.8) * km_per_degree * math.cos(math.radians(30.1))
    ).astype("int64")
    frame["cell_y"] = np.floor((frame.lat - 27.6) * km_per_degree).astype("int64")
    modis = frame.sensor.str.startswith("MODIS_")
    frame["frp_modis"] = frame.frp.where(modis)
    frame["frp_viirs"] = frame.frp.where(~modis)
    return frame.groupby(["date", "cell_x", "cell_y"], as_index=False).agg(
        sensors_seen=("sensor", lambda values: "|".join(sorted(set(values)))),
        frp_modis=("frp_modis", "max"),
        frp_viirs=("frp_viirs", "max"),
        daynight=("daynight", lambda values: "|".join(sorted(set(values)))),
        first_acq=("acq_time", "min"),
    )


def build_calendar(events, season, *, seasons=SEASONS):
    """46 UTC days; linear p90 and median use only the other seasons."""
    others = [year for year in seasons if year != season]
    if not others or season not in seasons:
        raise ValueError("Calendar requires a target and at least one other season")
    counts = events.groupby("date").size()
    daily = {}
    for year in seasons:
        dates = pd.date_range(f"{year}-10-01", f"{year}-11-15", tz="UTC")
        daily[year] = counts.reindex(dates, fill_value=0).to_numpy()
    reference = np.array([daily[year] for year in others])
    medians = np.median(reference, axis=0)
    p90 = np.quantile(reference, 0.9, axis=0, method="linear")
    return [
        {"date": day.strftime("%Y-%m-%d"), "day_index": index + 1,
         "events": int(daily[season][index]), "median": float(medians[index]),
         "p90": float(p90[index]), "critical": bool(daily[season][index] > p90[index])}
        for index, day in enumerate(
            pd.date_range(f"{season}-10-01", f"{season}-11-15", tz="UTC")
        )
    ]


def main():
    files = sorted((ROOT / "data" / "raw").glob("*.csv"))
    if not files:
        raise ValueError("No raw CSVs found")
    raw = pd.concat([pd.read_csv(path, dtype="string") for path in files], ignore_index=True)
    standardized = standardize(raw)
    output = ROOT / "data" / "processed"
    output.mkdir(parents=True, exist_ok=True)
    standardized.to_parquet(output / "standardized.parquet", index=False)
    events = build_events(standardized)
    summary = []
    for season in SEASONS:
        folder = output / str(season)
        folder.mkdir(parents=True, exist_ok=True)
        season_events = events[events.date.dt.year.eq(season)].copy()
        season_events["date"] = season_events.date.dt.strftime("%Y-%m-%d")
        season_events.to_csv(folder / "harmonized_events.csv", index=False)
        calendar = build_calendar(events, season)
        payload = {
            "season": season, "timezone": "UTC",
            "baseline_seasons": [year for year in SEASONS if year != season],
            "snpp_historical_only": True, "days": calendar,
        }
        (folder / "calendar_full.json").write_text(
            json.dumps(payload, indent=2) + "\n", encoding="utf-8"
        )
        summary.append({"season": season, "events": len(season_events)})
    (output / "season_totals.json").write_text(
        json.dumps(summary, indent=2) + "\n", encoding="utf-8"
    )
    print(json.dumps(summary, indent=2))


if __name__ == "__main__":
    main()
