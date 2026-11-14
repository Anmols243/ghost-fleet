# Empirical MODIS co-detection

Run `.venv/Scripts/python.exe scripts/detectability.py` after harmonization.
Input: `data/processed/standardized.parquet` (already confidence-filtered).
Output: `data/processed/detectability.json`.

Each denominator is unique VIIRS cell-days within one day/night stratum, pooled
across seasons and VIIRS satellites. Repeated detections and multiple VIIRS
satellites in the same cell-day do not increase the denominator. The maximum
VIIRS FRP within that stratum selects its band. Bounds are lower-inclusive and
upper-exclusive: 0–0.5, 0.5–1, 1–3.7, 3.7–10, 10–40, and 40+ MW.
Zero FRP is included in the first band. FRP is never summed.

Cell indices come from `harmonize.build_events` without a separate grid
implementation. MODIS seen means either Terra or Aqua detected that cell on
the same UTC date, regardless of acquisition time or day/night label. A cell-day
with both daytime and nighttime VIIRS detections appears once in each stratum.
The two strata therefore must not be added to infer unique daily events.

All 12 band/stratum combinations are emitted with denominator, numerator and
modis_seen_share. Empty bins have zero counts and a null share. S-NPP remains
historical-only. No cloud or overpass adjustment, calibration, smoothing or
monotonicity enforcement is applied. These co-detection shares are not the
published strong-fire detection probabilities. Published constants and their
source label are recorded separately, as specified in docs/METHOD.md.
