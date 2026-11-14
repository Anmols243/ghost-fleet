"""Measure same-cell-day MODIS co-detection of standardized VIIRS fires."""

import json
from pathlib import Path

import numpy as np
import pandas as pd

if __package__:
    from .harmonize import build_events
else:
    from harmonize import build_events


BANDS = ("0-0.5", "0.5-1", "1-3.7", "3.7-10", "10-40", "40+")
EDGES = (0, 0.5, 1, 3.7, 10, 40, float("inf"))
ROOT = Path(__file__).resolve().parents[1]


def build_detectability(frame):
    """Band unique VIIRS cell-days by their maximum FRP within D or N.

    A mixed D/N cell-day contributes once to each stratum. A MODIS match
    can be at any acquisition time that same UTC day. The existing event
    builder supplies the exact harmonization grid and unsummed maxima.
    """
    viirs = frame[frame.sensor.str.startswith("VIIRS_")]
    if not np.isfinite(viirs.frp).all() or viirs.frp.lt(0).any():
        raise ValueError("VIIRS FRP must be finite and nonnegative")
    keys = ["date", "cell_x", "cell_y"]
    modis = build_events(frame[frame.sensor.str.startswith("MODIS_")])[keys]
    modis["modis_seen"] = True
    bins = []
    for daynight in ("D", "N"):
        cells = build_events(viirs[viirs.daynight.eq(daynight)])
        cells = cells.merge(modis, on=keys, how="left", validate="one_to_one")
        cells["frp_band"] = pd.cut(cells.frp_viirs, EDGES, labels=BANDS, right=False)
        for band in BANDS:
            selected = cells[cells.frp_band.eq(band)]
            total = len(selected)
            seen = int(selected.modis_seen.eq(True).sum())
            bins.append({
                "frp_band": band, "daynight": daynight,
                "viirs_cell_days": total, "modis_seen_cell_days": seen,
                "modis_seen_share": seen / total if total else None,
            })
    return {
        "published_constants": {
            "modis_limit_night_mw": 3.7, "modis_limit_day_mw": 5.7,
            "modis_limit_edge_mw": 40.0, "viirs_min_mw": 0.5,
            "strong_fire_detection_probability": {"MODIS": 0.78, "VIIRS": 0.88},
            "source": "Sofiev & Kouznetsov 2026, GMD",
        },
        "method": {
            "grid": "harmonize.build_events: fixed ~1 km grid",
            "frp_band_intervals": "lower inclusive, upper exclusive; 40+ includes 40",
            "frp_statistic": "maximum VIIRS FRP per cell-day within day/night stratum",
            "match": "any MODIS detection in the same cell and UTC day",
            "mixed_daynight": "cell-days with both D and N contribute once to each stratum",
            "empty_bins": "null share; not zero",
            "snpp_historical_only": True,
            "limitations": "Co-detection share is not a calibrated detection probability; no overpass or cloud adjustment.",
        },
        "bins": bins,
    }


def main():
    folder = ROOT / "data" / "processed"
    result = build_detectability(pd.read_parquet(folder / "standardized.parquet"))
    (folder / "detectability.json").write_text(
        json.dumps(result, indent=2, allow_nan=False) + "\n", encoding="utf-8"
    )
    for daynight in ("D", "N"):
        rows = [row for row in result["bins"] if row["daynight"] == daynight]
        print(daynight, [(row["frp_band"], row["modis_seen_share"]) for row in rows])


if __name__ == "__main__":
    main()
