"""Render five 2026 fleets against one fixed full-calendar p90 baseline."""

import json
from pathlib import Path

import pandas as pd

if __package__:
    from .degrade import degrade_detections, reconstruct_windows
    from .harmonize import build_events
else:
    from degrade import degrade_detections, reconstruct_windows
    from harmonize import build_events

MODIS = ("MODIS_TERRA", "MODIS_AQUA")
MODERN = ("VIIRS_NOAA20", "VIIRS_NOAA21")
FLEETS = {
    "terra2000": ("MODIS_TERRA",),
    "terra_aqua2002": MODIS,
    "viirs2012": MODIS + ("VIIRS_SNPP",),
    "full2026": MODIS + MODERN,
    "post_snpp2026": MODIS + MODERN,
}
ROOT = Path(__file__).resolve().parents[1]


def fleet_detections(frame, fleet):
    """Select real rows; MODIS-only fleets also receive degraded modern VIIRS."""
    season = frame[frame.date.between("2026-10-01", "2026-11-15")]
    sensors = FLEETS[fleet]
    if fleet in ("terra2000", "terra_aqua2002"):
        selected = season[season.sensor.isin(sensors + MODERN)]
        return degrade_detections(selected, p=0.5)
    return season[season.sensor.isin(sensors)].copy()


def build_fleets(frame, baseline):
    """Render all dates, sharing baseline medians/p90 without recomputation."""
    expected = pd.date_range("2026-10-01", "2026-11-15").strftime("%Y-%m-%d").tolist()
    if [day["date"] for day in baseline] != expected:
        raise ValueError("Expected all 46 ordered 2026 season baseline dates")
    rendered = {}
    stats = {}
    for name, sensors in FLEETS.items():
        detections = fleet_detections(frame, name)
        events = build_events(detections)
        counts = events.groupby(events.date.dt.strftime("%Y-%m-%d")).size()
        days = []
        for day in baseline:
            count = int(counts.get(day["date"], 0))
            days.append({
                "date": day["date"], "day_index": day["day_index"],
                "events": count, "median": day["median"], "p90": day["p90"],
                "critical": bool(count > day["p90"]),
            })
        annotation = {"snpp_ended": "2026-11-03"} if name == "post_snpp2026" else {}
        modis_only = name in ("terra2000", "terra_aqua2002")
        rendered[name] = {
            "sensors": list(sensors), "annotations": annotation,
            "rendering": "real MODIS + degraded NOAA-20/21, p=0.5" if modis_only else "real fleet detections",
            "sensors_seen": sorted(detections.sensor.unique().tolist()),
            "windows_minutes_utc": reconstruct_windows(detections[detections.sensor.isin(sensors)]).get(2026, []) if modis_only else None,
            "days": days,
        }
        peak = max(days, key=lambda day: day["events"])
        stats[name] = {
            "total": len(events), "pct_of_full": None,
            "peak_day": peak["date"] if len(events) else None,
            "critical_days": sum(day["critical"] for day in days),
        }
    full_total = stats["full2026"]["total"]
    for stat in stats.values():
        stat["pct_of_full"] = 100 * stat["total"] / full_total if full_total else None
    full_peak, terra_peak = stats["full2026"]["peak_day"], stats["terra2000"]["peak_day"]
    metadata = {
        "season": 2026, "timezone": "UTC", "snpp_historical_only": True,
        "critical_baseline": "2026/calendar_full.json; common p90 for all fleets",
        "pct_denominator": "full2026 fleet (MODIS + NOAA-20/21; excludes S-NPP)",
    }
    return (
        dict(metadata, fleets=rendered),
        dict(metadata, fleets=stats, peak_shift={
            "full_peak_day": full_peak, "terra2000_peak_day": terra_peak,
            "days": (pd.Timestamp(full_peak) - pd.Timestamp(terra_peak)).days if full_peak and terra_peak else None,
            "definition": "full2026 peak date minus terra2000 peak date; earliest date breaks ties",
        }),
    )


def main():
    output = ROOT / "data" / "processed"
    frame = pd.read_parquet(output / "standardized.parquet")
    baseline = json.loads((output / "2026" / "calendar_full.json").read_text(encoding="utf-8"))["days"]
    rendered, diff = build_fleets(frame, baseline)
    for filename, payload in (("fleets_2026.json", rendered), ("fleet_diff.json", diff)):
        (output / filename).write_text(json.dumps(payload, indent=2, allow_nan=False) + "\n", encoding="utf-8")
    print(json.dumps(diff, indent=2))


if __name__ == "__main__":
    main()
