"""Port of audit_reference.py: union cell-days and U/C/W accounting."""
import itertools
import json
from pathlib import Path
import pandas as pd
if __package__:
    from .harmonize import build_events
else:
    from harmonize import build_events
BASE = Path(__file__).resolve().parents[1]

# Fixed VM references from AUDIT_SPEC / BUILD_BRIEF at 7710753; never read generated output.
REFERENCE = json.loads('{"window": "Oct 1 - Nov 15 (46 days)", "grid": "~1km cell-days", "presets": [{"id": "viirs_transition", "a": 2011, "b": 2012, "label": "2011 vs 2012 - VIIRS S-NPP joins the record", "W_a": 13521, "U_a": 13521, "C_a": 0, "fleet_a": ["MODIS_TERRA", "MODIS_AQUA"], "W_b": 74703, "U_b": 14255, "C_b": 60448, "fleet_b": ["MODIS_TERRA", "MODIS_AQUA", "VIIRS_SNPP"], "shared": ["MODIS_TERRA", "MODIS_AQUA"], "change_W_pct": 452.5, "change_U_pct": 5.4, "diff_pp": 447.1}, {"id": "noaa20_transition", "a": 2017, "b": 2018, "label": "2017 vs 2018 - VIIRS NOAA-20 joins the record", "W_a": 54060, "U_a": 54060, "C_a": 0, "fleet_a": ["MODIS_TERRA", "MODIS_AQUA", "VIIRS_SNPP"], "W_b": 106893, "U_b": 60101, "C_b": 46792, "fleet_b": ["MODIS_TERRA", "MODIS_AQUA", "VIIRS_SNPP", "VIIRS_NOAA20"], "shared": ["MODIS_TERRA", "MODIS_AQUA", "VIIRS_SNPP"], "change_W_pct": 97.7, "change_U_pct": 11.2, "diff_pp": 86.6}, {"id": "snpp_cessation", "a": 2025, "b": 2026, "label": "2025 vs 2026 - S-NPP data delivery ceases mid-season (2 Nov 2026)", "W_a": 17950, "U_a": 17950, "C_a": 0, "fleet_a": ["MODIS_TERRA", "MODIS_AQUA", "VIIRS_SNPP", "VIIRS_NOAA20"], "W_b": 14263, "U_b": 14263, "C_b": 0, "fleet_b": ["MODIS_TERRA", "MODIS_AQUA", "VIIRS_SNPP", "VIIRS_NOAA20"], "shared": ["MODIS_TERRA", "MODIS_AQUA", "VIIRS_SNPP", "VIIRS_NOAA20"], "change_W_pct": -20.5, "change_U_pct": -20.5, "diff_pp": 0.0}], "method_checks": {"benchmark_2021": {"season": 2021, "split": "2021-10-24", "train_days": 23, "test_days": 23, "ratio_fitted_on_train": 0.1072, "predictors": {"raw_viirs": {"mae": 4119.3, "rmse": 4712.3, "bias": 4119.3, "total_actual": 13216, "total_pred": 107959.0, "total_err_pct": 716.9}, "ratio": {"mae": 323.1, "rmse": 427.9, "bias": -71.5, "total_actual": 13216, "total_pred": 11571.1, "total_err_pct": -12.4}, "degraded": {"mae": 1162.2, "rmse": 1509.1, "bias": 1161.5, "total_actual": 13216, "total_pred": 39931.0, "total_err_pct": 202.1}}, "spatial_blocks_0.1deg": {"raw_viirs": {"modis_blocks": 5253, "pred_blocks": 13589, "hit_rate": 0.97}, "degraded": {"modis_blocks": 5253, "pred_blocks": 8212, "hit_rate": 0.845}}, "note": "Degraded excludes native MODIS (the target). Degraded can only predict MODIS events arising from fires VIIRS also saw; ratio scales counts incl. unseen-fire mass. VM implementation; Codex totals differ ~0.2-0.9%."}, "sensor_addition": {"ratio_a_fit_2012_2017": 0.2055, "mean_E": {"E_R": 0.52, "E_S": 0.216, "E_C": 0.086}, "J_R_range": [2.145, 5.441], "J_S_range": [0.105, 1.77], "seasons": [{"season": 2012, "M": 14255, "V_snpp": 62977, "R": 74703, "S": 30957, "J_R": 4.24, "J_S": 1.172, "C": null, "J_C": null}, {"season": 2013, "M": 12372, "V_snpp": 57952, "R": 68164, "S": 26922, "J_R": 4.51, "J_S": 1.176, "C": null, "J_C": null, "E_R": 0.27, "E_S": 0.004}, {"season": 2014, "M": 14588, "V_snpp": 64816, "R": 76807, "S": 34398, "J_R": 4.265, "J_S": 1.358, "C": null, "J_C": null, "E_R": 0.245, "E_S": 0.182}, {"season": 2015, "M": 10140, "V_snpp": 56550, "R": 64961, "S": 28091, "J_R": 5.406, "J_S": 1.77, "C": null, "J_C": null, "E_R": 1.141, "E_S": 0.412}, {"season": 2016, "M": 15553, "V_snpp": 76931, "R": 89475, "S": 41560, "J_R": 4.753, "J_S": 1.672, "C": null, "J_C": null, "E_R": 0.653, "E_S": 0.098}, {"season": 2017, "M": 8393, "V_snpp": 47150, "R": 54060, "S": 21521, "J_R": 5.441, "J_S": 1.564, "C": null, "J_C": null, "E_R": 0.688, "E_S": 0.108}, {"season": 2018, "M": 10937, "V_snpp": 50916, "R": 60101, "S": 25399, "J_R": 4.495, "J_S": 1.322, "C": 10464.7, "J_C": -0.043, "E_R": 0.946, "E_S": 0.242}, {"season": 2019, "M": 8433, "V_snpp": 39183, "R": 46067, "S": 19760, "J_R": 4.463, "J_S": 1.343, "C": 8053.3, "J_C": -0.045, "E_R": 0.032, "E_S": 0.021, "E_C": 0.002}, {"season": 2020, "M": 14408, "V_snpp": 61751, "R": 73514, "S": 31346, "J_R": 4.102, "J_S": 1.176, "C": 12691.6, "J_C": -0.119, "E_R": 0.361, "E_S": 0.167, "E_C": 0.074}, {"season": 2021, "M": 15155, "V_snpp": 67715, "R": 79928, "S": 36785, "J_R": 4.274, "J_S": 1.427, "C": 13917.4, "J_C": -0.082, "E_R": 0.172, "E_S": 0.251, "E_C": 0.037}, {"season": 2022, "M": 8755, "V_snpp": 39489, "R": 46738, "S": 20549, "J_R": 4.338, "J_S": 1.347, "C": 8116.1, "J_C": -0.073, "E_R": 0.064, "E_S": 0.08, "E_C": 0.009}, {"season": 2023, "M": 6517, "V_snpp": 25269, "R": 30909, "S": 12372, "J_R": 3.743, "J_S": 0.898, "C": 5193.5, "J_C": -0.203, "E_R": 0.595, "E_S": 0.449, "E_C": 0.13}, {"season": 2024, "M": 3173, "V_snpp": 9533, "R": 12501, "S": 4031, "J_R": 2.94, "J_S": 0.27, "C": 1959.3, "J_C": -0.383, "E_R": 0.803, "E_S": 0.628, "E_C": 0.18}, {"season": 2025, "M": 3506, "V_snpp": 7602, "R": 11027, "S": 3874, "J_R": 2.145, "J_S": 0.105, "C": 1562.4, "J_C": -0.554, "E_R": 0.795, "E_S": 0.165, "E_C": 0.171}]}, "intro": "These checks measure how far each proposed correction can be trusted. None is used as a measurement in this app."}}')


def compare_periods(W_a, W_b, U_a, U_b):
    change_w = 100 * (W_b / W_a - 1)
    change_u = 100 * (U_b / U_a - 1)
    return {"change_W_pct": round(change_w, 1),
            "change_U_pct": round(change_u, 1),
            "diff_pp": round(change_w - change_u, 1)}


def conclusion(row):
    labels = {"MODIS_TERRA": "Terra", "MODIS_AQUA": "Aqua", "VIIRS_SNPP": "Suomi NPP", "VIIRS_NOAA20": "NOAA-20"}
    shared = "+".join(labels[s] for s in row["shared"])
    w = f"{row['change_W_pct']:+.1f}".replace("-", "\u2212")
    u = f"{row['change_U_pct']:+.1f}".replace("-", "\u2212")
    line = f"Recorded change, Punjab + Haryana, {row['a']} \u2192 {row['b']}: all included satellites, {w}%; {shared}, {u}%"
    if row["id"] == "snpp_cessation":
        return line + ". Both periods cover Oct 1 through Nov 14; Nov 15 is excluded from this comparison, and 2026 Nov 15 is unverified, not yet retrieved. The two views coincide because the same four satellites are included in both seasons, so the decomposition cannot show the interruption. The included-satellite record is interrupted: S-NPP recorded cell-days run 1 Oct \u2013 2 Nov, and zero from 3 Nov, while NOAA-20 continues. Actual-fire change is not measured."
    return line + f"; difference, {row['diff_pp']:.1f} percentage points. Neither percentage is a corrected estimate of fire activity, and the difference is not a causal attribution. Actual-fire change is not measured."
SENSORS = ["MODIS_TERRA", "MODIS_AQUA", "VIIRS_SNPP", "VIIRS_NOAA20"]
PRESETS = [
    {"id": "viirs_transition", "a": 2011, "b": 2012,
     "label": "2011 vs 2012 - VIIRS S-NPP joins the record"},
    {"id": "noaa20_transition", "a": 2017, "b": 2018,
     "label": "2017 vs 2018 - VIIRS NOAA-20 joins the record"},
    {"id": "snpp_cessation", "a": 2025, "b": 2026,
     "label": "2025 vs 2026 - S-NPP data delivery ceases mid-season (2 Nov 2026)"},
]


def aggregate(df, seasons=range(2001, 2027)):
    daily, present = {}, {}
    for season in seasons:
        d = df[df.date.dt.year.eq(season)]
        if season == 2026:
            d = d[d.date.le("2026-11-14")]
        dates = pd.date_range(f"{season}-10-01", f"{season}-11-15", tz="UTC")
        have = [s for s in SENSORS if d.sensor.eq(s).any()]
        present[str(season)] = have
        daily[str(season)] = {}
        for r in range(1, len(have) + 1):
            for subset in itertools.combinations(have, r):
                ev = build_events(d[d.sensor.isin(subset)])
                counts = ev.groupby("date").size()
                daily[str(season)]["+".join(subset)] = [
                    None if season == 2026 and dt.day == 15 and dt.month == 11 else int(counts.get(dt, 0))
                    for dt in dates
                ]
        print(season, have, flush=True)
    return daily, present


def build_presets(daily, present):
    presets = []
    for p in PRESETS:
        shared = [s for s in present[str(p["a"])] if s in present[str(p["b"])]]
        row = dict(p)
        length = 45 if p["id"] == "snpp_cessation" else 46
        if length == 45:
            row["comparison_end_mm_dd"] = "11-14"
            row["comparison_interval"] = "Oct 1 - Nov 14 in both periods"
        for tag, season in (("a", p["a"]), ("b", p["b"])):
            row["W_" + tag] = sum(daily[str(season)]["+".join(present[str(season)])][:length])
            row["U_" + tag] = sum(daily[str(season)]["+".join(shared)][:length])
            row["C_" + tag] = row["W_" + tag] - row["U_" + tag]
            row["fleet_" + tag] = present[str(season)]
        row["shared"] = shared
        row.update(compare_periods(row["W_a"], row["W_b"], row["U_a"], row["U_b"]))
        presets.append(row)
    return presets


def validate_presets(presets):
    reference = REFERENCE
    differences = []
    expected_by_id = {row["id"]: row for row in reference["presets"]}
    if len(presets) != 3 or {row["id"] for row in presets} != set(expected_by_id):
        raise ValueError("STOP: expected exactly the three canonical presets")
    for actual in presets:
        expected = expected_by_id[actual["id"]]
        if actual["id"] == "snpp_cessation" and actual.get("comparison_end_mm_dd") == "11-14":
            # The archived VM reference covers Nov 15; it is not a comparable
            # numerical benchmark for the newly approved common interval.
            for tag in ("a", "b"):
                if not (0 < actual["U_" + tag] <= actual["W_" + tag] and
                        actual["C_" + tag] == actual["W_" + tag] - actual["U_" + tag]):
                    raise ValueError("STOP: common-interval P3 identity failed")
            differences.append({"preset": actual["id"], "scope": "Oct 1 - Nov 14",
                                "check": "common-interval identity; old Nov 15 VM totals not comparable"})
            continue
        for key in ("W_a", "W_b", "U_a", "U_b"):
            error = abs(actual[key] / expected[key] - 1) * 100 if expected[key] else (0 if not actual[key] else float("inf"))
            differences.append({"preset": actual["id"], "field": key, "actual": actual[key], "reference": expected[key], "error_pct": error})
            if error > 1.5:
                raise ValueError(f"STOP: {actual['id']} {key}: {actual[key]} vs {expected[key]} ({error:.3f}%)")
        for tag in ("a", "b"):
            if actual["C_" + tag] != actual["W_" + tag] - actual["U_" + tag]:
                raise ValueError("STOP: C identity must equal W - U")
            error = 100 * abs(actual["C_" + tag] - expected["C_" + tag]) / actual["W_" + tag]
            differences.append({"preset": actual["id"], "field": "C_" + tag,
                                "actual": actual["C_" + tag], "reference": expected["C_" + tag],
                                "error_pct_of_W": error})
            if error > 1.5:
                raise ValueError("STOP: C difference exceeds 1.5% of W")
        for family in ("W", "U"):
            ratio = actual[family + "_b"] / actual[family + "_a"]
            ref_ratio = expected[family + "_b"] / expected[family + "_a"]
            error = abs(ratio / ref_ratio - 1) * 100
            differences.append({"preset": actual["id"], "field": family + "_ratio",
                                "actual": ratio, "reference": ref_ratio, "error_pct": error})
            if error > 1.5:
                raise ValueError(f"STOP: {actual['id']} {family} ratio exceeds 1.5% relative")
    return differences


def main():
    path = BASE.parent / "frontend" / "audit.json"
    reference = json.loads(json.dumps(REFERENCE))
    df = pd.read_parquet(BASE / "data/processed/standardized.parquet")
    daily, present = aggregate(df)
    presets = build_presets(daily, present)
    differences = validate_presets(presets)
    checks = reference["method_checks"]
    checks["sensor_addition"]["mean_E"] = {"E_R": .403, "E_S": .252, "E_C": .086}
    checks["sensor_addition"]["mean_E_interval"] = "2018->2019 through 2024->2025"
    checks["sensor_addition"]["mean_E_formula"] = "mean(abs(J[t] - J[t-1])) over successive seasons"
    checks["sensor_addition"]["provenance"] = "Archived reference-implementation results; not rerun on canonical data"
    checks["benchmark_2021"]["provenance"] = "Archived reference-implementation results; not rerun on canonical data"
    checks["sensor_addition"]["J_R_range"] = [2.15, 5.44]
    checks["sensor_addition"]["J_S_range"] = [.11, 1.77]
    out = {"schema": "audit-app v1", "status": "FROZEN - repo pipeline",
           "window": reference["window"], "grid": reference["grid"],
           "sensors_present": present, "presets": presets, "daily": daily,
           "method_checks": checks}
    retrieval = json.loads((BASE / "data/processed/coverage_retrieval.json").read_text())
    manifest = json.loads((BASE / "data/raw/manifest.json").read_text())
    out["retrieved_at_utc"] = retrieval["retrieved_at_utc"]
    out["retrieval_timestamp_scope"] = "2026 Nov 10-15 NRT re-pull; earlier retrieval timestamps unavailable"
    out["requested_interval"] = {"start_mm_dd": "10-01", "end_mm_dd": "11-15", "days": 46}
    out["bbox"] = [73.8, 27.6, 77.6, 32.6]
    out["dataset_counts"] = {"retrieved_detections": sum(e["rows"] for e in manifest),
                             "standardized_verified_detections": len(df)}
    out["daily_unit"] = "recorded cell-days; single-sensor series overlap and must never be stacked as components of W"
    out["grid_spec"] = {"type": "equirectangular", "origin_lon_lat": [73.8, 27.6],
                        "reference_latitude": 30.1, "earth_radius_km": 6371.0088, "cell_km": 1, "index": "floor"}
    out["coverage"] = {
        str(year): {"status": "verified through cutoff; NRT provisional" if year == 2026 else "archived retrieved records",
                    "cutoff": f"{year}-11-14" if year == 2026 else f"{year}-11-15",
                    "unverified_dates": ["2026-11-15"] if year == 2026 else [],
                    "unverified_representation": "null; not yet retrieved; excluded from totals",
                    "sources": sorted({e["source"] for e in manifest if e["season"] == year}),
                    "product": "NRT" if year == 2026 else "SP"}
        for year in range(2001, 2027)
    }
    path.write_text(json.dumps(out, ensure_ascii=False, allow_nan=False) + "\n", encoding="utf-8")
    (BASE / "data/processed/audit_preset_verification.json").write_text(json.dumps(differences, indent=2) + "\n")
    print(json.dumps(presets, indent=2), flush=True)


if __name__ == "__main__":
    main()
