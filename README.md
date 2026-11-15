# Ghost Fleet — Fire Trend Audit

**Dead satellites, honest calendars.**

Ghost Fleet — Fire Trend Audit compares active-fire cell-days between Punjab–Haryana burning seasons using the same geographic mask, grid, date rules, and confidence criteria. It shows the recorded change for all included satellites, the change for satellites present in both periods, and the difference between them. It does not estimate the change in actual burning.

## Why this exists

Recorded fire counts change when the observing fleet changes — a more sensitive satellite records fires the older fleet never saw. Headlines built on raw counts confuse a change in the instruments with a change in burning. This app separates the two arithmetically: for any two seasons, W (all included satellites) = U (satellites present in both periods) + C (the rest), exactly, per cell-day. It emits no corrected count.

## Headline result

2011 → 2012, the season Suomi NPP joined: all included satellites **+455.2%**; Terra + Aqua only **+5.3%**; difference **449.8 percentage points**. Neither percentage is a corrected estimate of fire activity, and the difference is not a causal attribution.

## Presets

- **P1 · VIIRS transition** — 2011 vs 2012 (Suomi NPP joins)
- **P2 · NOAA-20 transition** — 2017 vs 2018 (NOAA-20 joins)
- **P3 · S-NPP cessation** — 2025 vs 2026; S-NPP data delivery ceased on 2 Nov 2026 mid-season while NOAA-20 continued

## Method checks — what we tested and rejected

We tested one proposed MODIS-sensitivity correction in the 2021 season. It failed the benchmark. The current app does not use that correction as a trusted measurement. It retains it in Method checks as a tested and failed method.

The degradation rules, the held-out 2021 benchmark, and a 2012–2025 sensor-addition steadiness test all live in the app's Method checks panel and in this repo (docs/PIPELINE_AUDIT.md, docs/DEGRADATION.md, data in frontend/audit.json).

## Data

- Source: NASA FIRMS active-fire detections (MODIS Collection 6.1; VIIRS 375 m), Punjab + Haryana bounding box (73.8–77.6 E, 27.6–32.6 N), Oct 1 – Nov 15 each season.
- 26 seasons, 2001-2026; 1,601,380 detections retrieved; 1,482,211 retained after confidence rules and the verified cutoff. The 2026 interval ends Nov 14; Nov 15 is unverified and excluded.
- Products: standard processing (SP) for 2001–2025, near-real-time (NRT) for 2026 — the app labels 2026 a snapshot.
- Suomi NPP data delivery ceased 2 Nov 2026; its last detection in the retrieved records is that date. NOAA-21 data are not in the retrieved records and are not in any comparison.
- A zero means: no detections in these retrieved records. FRP is never summed across sensors.

## Start here (builders and agents)

Read in this order — this is the complete context, nothing else is required:

1. `docs/AUDIT_SPEC.md` — design, accounting identity, language law, frozen presets, the 8 gates (plan of record)
2. `docs/BUILD_BRIEF.md` — binding build decisions: data freeze protocol, deploy target, tech constraints, acceptance conclusion lines, who touches what
3. `docs/COPY_PACK.md` — final copy: narration, slides, conclusion templates, microcopy, Gate 7 test script. Use unchanged.
4. `docs/BUILD_PROGRESS.md` — live status log; update it after every completed task

`CLAUDE.md` and `AGENTS.md` import the same canon, so Claude Code and Codex load it automatically on opening the repo.

## Old code — disposition (do not delete, do not extend)

This repo began as a different product ("same-eyes" degradation). The pivot keeps its machinery as evidence:

- **Load-bearing, still used:** `scripts/fetch_firms.py`, `scripts/harmonize.py`, the harmonized event data, `docs/HARMONIZATION.md`, `docs/DETECTABILITY.md`, and the measurement contract in `docs/METHOD.md` (grid, season window, confidence rules).
- **Method-checks evidence:** `scripts/degrade.py`, `scripts/fleets.py`, `scripts/detectability.py`, `docs/DEGRADATION.md`, `docs/FLEETS.md`, `docs/PIPELINE_AUDIT.md`. The degradation method failed its held-out benchmark; it is exhibited, never used as a measurement.
- **Superseded framing (bannered, kept for provenance):** `docs/PITCH.md`, `docs/DEMO_SCRIPT.md`, `docs/TEAM_BRIEF.md`.
- **New pipeline code:** only the audit aggregation (`scripts/audit.py`, ported per AUDIT_SPEC), which produces the app's single data file, `frontend/audit.json`.
- **`frontend/`** is built fresh for the audit app per BUILD_BRIEF; anything pre-pivot in it is disposable.

## Running the app

Static site, zero dependencies: serve the `frontend/` folder with any static server (deployed on Vercel, root = `frontend/`). The app reads only `frontend/audit.json`.

## AI use

Built with AI assistance (Claude Code, Codex, and ChatGPT design/verdict reviews), disclosed here and on the project page per Space Apps rules. Every number in the app traces to the frozen `frontend/audit.json`.

## License

MIT — see LICENSE.

Coverage: P3 compares Oct 1-Nov 14 in both periods: 17,712 -> 14,341 recorded cell-days (-19.0%, relative to the 2025 common-interval count). Nov 15, 2026 is unverified / not yet retrieved (null, excluded). Actual-fire change is not measured.
