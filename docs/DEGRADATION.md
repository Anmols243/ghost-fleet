> **STATUS 2026-11-15: Method-checks exhibit.** This degradation method was tested against held-out 2021 data and FAILED its benchmark (docs/AUDIT_SPEC.md). It is not used as a measurement in the app. Kept as evidence.

# Degradation outputs — calendar_sameeyes.json

Run `.venv/Scripts/python.exe scripts/degrade.py` after harmonization.
Input is `data/processed/standardized.parquet`; outputs are
`data/processed/<season>/calendar_sameeyes.json` for 2020–2026.

For each season separately, pool unique UTC acquisition minutes from its
confidence-filtered MODIS Terra and Aqua detections. Sort and split where the
gap is strictly greater than 60 minutes. Each cluster's first and last minutes
are expanded by 45 minutes. Bounds are inclusive. Midnight crossings are
represented as separate intervals within 00:00–23:59. These seasonal windows
are repeated on every UTC date in that season, including dates without a MODIS
fire detection. They estimate pass timing from detections; they are not a
day-specific orbital coverage product. No fixed clock-time windows are used.
A season with no MODIS times has no windows and retains no VIIRS rows.

Keep every real MODIS input row. Keep a VIIRS row only if its acquisition time
is inside a window from its own season and its FRP meets the day/night limit:
5.7 MW by day, 3.7 MW by night at p=0.5. The threshold is inclusive. S-NPP remains
historical-only. No counts are scaled up and no detections are synthesized.

Run `harmonize.build_events` on these original MODIS rows and surviving VIIRS
rows, preserving the exact grid and separate FRP maxima. Calendar baselines
use the other seasons' same-eyes events, with all 46 dates present.

Sensitivity scenarios use the identical windows and MODIS rows, with limits
multiplied by 0.6 (p=0.25), 1 (p=0.5), or 1.6 (p=0.75). Their event totals and
actual thresholds are recorded and explicitly labelled an approximation;
the p labels are not calibrated probabilities. This models detectability,
not cloud, burned area, or complete observational coverage.

Every scenario's season total must be <= the full event total. The command
checks both freshly built full events and existing full-calendar totals before
writing any calendars. A failure raises an error and requires diagnosis.
