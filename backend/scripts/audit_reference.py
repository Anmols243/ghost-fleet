"""Fire Trend Audit dataset (Astra pivot, 2026-11-15).
For every season: daily cell-day event counts for every non-empty
sensor subset (union semantics via build_events on the subset).
Presets: U/C/W decomposition where U = shared-satellite events,
W = all-satellite events, C = W - U, per period; changes in %.
Output: data/processed/audit.json
"""
import itertools
import json
import sys
from pathlib import Path

import pandas as pd

sys.path.insert(0, str(Path(__file__).resolve().parent))
from harmonize import build_events, season_dates

BASE = Path(__file__).resolve().parent.parent
SENSORS = ["MODIS_TERRA", "MODIS_AQUA", "VIIRS_SNPP", "VIIRS_NOAA20"]
PRESETS = [
    {"id": "viirs_transition", "a": 2011, "b": 2012,
     "label": "2011 vs 2012 - VIIRS S-NPP joins the record"},
    {"id": "noaa20_transition", "a": 2017, "b": 2018,
     "label": "2017 vs 2018 - VIIRS NOAA-20 joins the record"},
    {"id": "snpp_cessation", "a": 2025, "b": 2026,
     "label": "2025 vs 2026 - S-NPP data delivery ceases mid-season (2 Nov 2026)"},
]


def main() -> None:
    df = pd.read_parquet(BASE / "data" / "processed" / "standardized.parquet")
    daily = {}
    present = {}
    for season in range(2001, 2027):
        d = df[df["date"].str.startswith(str(season))]
        dates = season_dates(season)
        have = [s for s in SENSORS if (d["sensor"] == s).any()]
        present[str(season)] = have
        daily[str(season)] = {}
        for r in range(1, len(have) + 1):
            for subset in itertools.combinations(have, r):
                ev = build_events(d[d["sensor"].isin(subset)])
                counts = ev.groupby("date").size()
                key = "+".join(subset)
                daily[str(season)][key] = [int(counts.get(dt, 0)) for dt in dates]
        print(season, have, flush=True)

    def total(season, sensors):
        return sum(daily[str(season)]["+".join(sensors)])

    presets = []
    for p in PRESETS:
        shared = [s for s in present[str(p["a"])] if s in present[str(p["b"])] ]
        row = dict(p)
        for tag, season in (("a", p["a"]), ("b", p["b"])):
            row["W_" + tag] = total(season, present[str(season)])
            row["U_" + tag] = total(season, shared)
            row["C_" + tag] = row["W_" + tag] - row["U_" + tag]
            row["fleet_" + tag] = present[str(season)]
        row["shared"] = shared
        row["change_W_pct"] = round(100 * (row["W_b"] / row["W_a"] - 1), 1)
        row["change_U_pct"] = round(100 * (row["U_b"] / row["U_a"] - 1), 1)
        row["diff_pp"] = round(row["change_W_pct"] - row["change_U_pct"], 1)
        presets.append(row)
        print(row, flush=True)

    out = {"grid": "~1km cell-days", "window": "Oct 1 - Nov 15 (46 days)",
           "sensors_present": present, "daily": daily, "presets": presets}
    (BASE / "data" / "processed" / "audit.json").write_text(json.dumps(out))
    print("audit.json written")


if __name__ == "__main__":
    main()
