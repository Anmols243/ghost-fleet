"""Degrade VIIRS detections using season-specific MODIS windows and limits."""

import json
from pathlib import Path

import pandas as pd

if __package__:
    from .harmonize import SEASONS, build_calendar, build_events
else:
    from harmonize import SEASONS, build_calendar, build_events

FACTORS = {0.25: 0.6, 0.5: 1.0, 0.75: 1.6}
ROOT = Path(__file__).resolve().parents[1]


def minutes(times):
    return times.str[:2].astype(int) * 60 + times.str[3:].astype(int)


def reconstruct_windows(frame):
    """Pool MODIS HH:MM by UTC season, split gaps >60, expand ends ±45.

    Bounds are inclusive minutes of the UTC day. Midnight crossings are
    represented as two intervals within 0..1439, never shifted dates.
    """
    windows = {}
    for year, season in frame.groupby(frame.date.dt.year):
        times = sorted(set(minutes(season.loc[season.sensor.str.startswith("MODIS_"), "acq_time"])))
        clusters = []
        for time in times:
            if not clusters or time - clusters[-1][-1] > 60:
                clusters.append([time])
            else:
                clusters[-1].append(time)
        intervals = []
        for cluster in clusters:
            start, end = cluster[0] - 45, cluster[-1] + 45
            intervals.append((max(0, start), min(1439, end)))
            if start < 0:
                intervals.append((1440 + start, 1439))
            if end > 1439:
                intervals.append((0, end - 1440))
        windows[int(year)] = sorted(intervals)
    return windows


def degrade_detections(frame, p=0.5):
    """Return only original MODIS rows plus VIIRS rows passing both gates."""
    if p not in FACTORS:
        raise ValueError("p must be 0.25, 0.5 or 0.75")
    inside = pd.Series(False, index=frame.index)
    time = minutes(frame.acq_time)
    for year, windows in reconstruct_windows(frame).items():
        season = frame.date.dt.year.eq(year)
        for start, end in windows:
            inside |= season & time.between(start, end)
    limits = frame.daynight.map({"N": 3.7, "D": 5.7}) * FACTORS[p]
    keep = frame.sensor.str.startswith("MODIS_") | (
        frame.sensor.str.startswith("VIIRS_") & inside & frame.frp.ge(limits)
    )
    return frame.loc[keep].copy()


def check_gate(season, sameeyes_total, full_total):
    if sameeyes_total > full_total:
        raise ValueError(
            f"Season {season}: same-eyes exceeds full ({sameeyes_total} > {full_total}); "
            "stop and diagnose before writing outputs"
        )


def build_sameeyes(frame, *, seasons=SEASONS):
    """Build calendars and sensitivity totals; gate all scenarios first."""
    full = build_events(frame)
    scenarios = {p: build_events(degrade_detections(frame, p)) for p in FACTORS}
    windows = reconstruct_windows(frame)
    result = {}
    for season in seasons:
        full_total = int(full.date.dt.year.eq(season).sum())
        sensitivity = []
        for p, events in scenarios.items():
            total = int(events.date.dt.year.eq(season).sum())
            check_gate(season, total, full_total)
            sensitivity.append({
                "p": p, "limit_multiplier": FACTORS[p],
                "night_limit_mw": 3.7 * FACTORS[p],
                "day_limit_mw": 5.7 * FACTORS[p], "total_events": total,
            })
        total = int(scenarios[0.5].date.dt.year.eq(season).sum())
        result[season] = {
            "season": season, "timezone": "UTC", "p": 0.5,
            "full_total": full_total, "sameeyes_total": total,
            "gate_passed": True, "snpp_historical_only": True,
            "baseline_seasons": [year for year in seasons if year != season],
            "windows_minutes_utc": windows.get(season, []),
            "window_method": "season-pooled MODIS times; gaps >60 min; widen ends +/-45 min; inclusive; repeated on each UTC day",
            "sensitivity": {
                "approximation": True,
                "description": "Threshold multipliers are a disclosed approximation, not calibrated detection probabilities.",
                "scenarios": sensitivity,
            },
            "days": build_calendar(scenarios[0.5], season, seasons=seasons),
        }
    return result


def main():
    output = ROOT / "data" / "processed"
    frame = pd.read_parquet(output / "standardized.parquet")
    result = build_sameeyes(frame)
    # Also check the saved full-calendar totals before publishing any output.
    for season, payload in result.items():
        calendar = json.loads((output / str(season) / "calendar_full.json").read_text(encoding="utf-8"))
        full_total = sum(day["events"] for day in calendar["days"])
        for scenario in payload["sensitivity"]["scenarios"]:
            check_gate(season, scenario["total_events"], full_total)
        if full_total != payload["full_total"]:
            raise ValueError(f"Season {season}: stale full calendar; rerun harmonization")
    for season, payload in result.items():
        path = output / str(season) / "calendar_sameeyes.json"
        path.write_text(json.dumps(payload, indent=2, allow_nan=False) + "\n", encoding="utf-8")
        print(season, "full", payload["full_total"], "same-eyes", payload["sameeyes_total"],
              "sensitivity", [s["total_events"] for s in payload["sensitivity"]["scenarios"]])


if __name__ == "__main__":
    main()
