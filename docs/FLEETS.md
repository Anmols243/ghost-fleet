> **STATUS 2026-11-15: background analysis.** The shipped product is the Fire Trend Audit (docs/AUDIT_SPEC.md). Fleet material appears in the app only as the S-NPP cessation case study.

# Fleet comparison for 2026

Run `.venv/Scripts/python.exe scripts/fleets.py` after harmonization.
Inputs: `data/processed/standardized.parquet` and
`data/processed/2026/calendar_full.json`. Outputs in `data/processed`:
`fleets_2026.json` (46 daily records per fleet) and `fleet_diff.json`.

Fleet definitions:

- terra2000: Terra MODIS.
- terra_aqua2002: Terra and Aqua MODIS.
- viirs2012: Terra, Aqua, and historical S-NPP.
- full2026: Terra, Aqua, NOAA-20, NOAA-21; excludes S-NPP.
- post_snpp2026: same sensors as full2026, annotated snpp_ended=2026-11-03.

MODIS-only fleets retain their real MODIS detections plus modern NOAA-20/21
detections that survive p=0.5 degradation. Only that fleet's MODIS observations
are supplied to the seasonal pass-window reconstruction. S-NPP is not a modern
VIIRS supplement. VIIRS-era fleets use only their own sensors' real detections.
All selections are limited to October 1–November 15, 2026 UTC, and use the shared
event builder for unique daily cells with separate FRP maxima.

Every fleet copies the same daily median/p90 values from the existing 2026
full calendar, which uses the other seasons as its reference. critical_days
counts dates where that fleet's events strictly exceed this common p90.
Zero critical days is a valid result. No fleet-specific thresholds are fitted.

pct_of_full divides by the full2026 fleet total, excluding S-NPP; this differs
from the earlier all-input full calendar, which includes historical S-NPP.
peak_day uses the earliest date on ties, or null if the fleet has no events.
peak_shift is full2026 peak date minus terra2000 peak date, in signed days.
Percentages are null when the full2026 denominator is zero.

The fixture-ordering regression uses a deliberately ordered sensor fixture.
Actual fleet totals are not required to be monotonic: sensor sets are not all
nested, and the viirs2012 fleet exchanges NOAA-20/21 for S-NPP.
