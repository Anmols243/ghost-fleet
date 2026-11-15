> **PARTLY SUPERSEDED 2026-11-15.** The measurement contract in this file (grid, season window, confidence rules) remains in force. The product framing is superseded by docs/AUDIT_SPEC.md; build decisions in docs/BUILD_BRIEF.md.

# Method — Ghost Fleet

## Why degrade?

A trend crossing a sensor change mixes burning change with instrument change. Ratio-scaling the past up invents detections that never happened. Degrading the sensitive record to the less sensitive instrument only ever removes real detections.

## Detectability model

Primary: Sofiev & Kouznetsov (2026), Geoscientific Model Development — MODIS C6.1 detection limit 3.7 MW (nadir, clear, night), ~5.7 MW day nadir, up to ~40 MW day swath edge; VIIRS smallest reliably detected fire 0.5 MW (night); detection probability for strong fires 78% MODIS / 88% VIIRS. Empirical check: fraction of VIIRS cell-days MODIS also saw, by FRP band and day/night.

## Degradation rules

1. Keep VIIRS detections whose acq_time falls in a MODIS pass window that day; windows reconstructed per season from MODIS acq_time clusters (split >60 min gaps, widen ±45 min). Aqua drifts — never fixed clock times.
2. Keep detections with FRP above the MODIS limit for their day/night class at p=0.5; sensitivity at p=0.25 (limit ×0.6) and p=0.75 (×1.6), disclosed approximation.
3. Survivors join the same ~1 km daily grid as harmonization.

## Fleets

terra2000 (Terra MODIS), terra_aqua2002 (+Aqua), viirs2012 (+VIIRS S-NPP), full2026 (MODIS + VIIRS NOAA-20/21), post_snpp2026 (full2026, S-NPP data ended 2026-11-02, seam flagged).

## Limits

Degradation models detectability, not cloud. MODIS-equivalent is a comparison device, not burned area (that is MCD64A1). FRP never summed across sensors.

## Empirical co-detection is a different quantity

The published 78% MODIS / 88% VIIRS figures are global-average detection
probabilities for powerful fires, not the probability of finding a MODIS
detection in the same grid cell and day as a VIIRS detection. See
[Sofiev & Kouznetsov 2026, GMD](https://gmd.copernicus.org/articles/19/10123/2026/).
The paper's abstract gives 0.5 MW as the smallest reliably detected VIIRS night
fire; its conclusion gives about 0.7 MW as the fitted night detection limit.
These are distinct descriptions; this project's specified 0.5 MW constant
has not been silently changed.

The most likely contributors to the empirical gap are strict same-cell/same-day
matching (nearby detections across a cell boundary are nonmatches), footprint
and geolocation mismatch between instruments, and short fire lifetimes or
changing intensity between overpasses. These are plausible explanations, not
causes isolated by this pipeline. Small fires in the VIIRS denominator, clouds,
and unequal coverage also make the two statistics non-comparable. We do not
rescale or smooth the empirical shares to approach the published probability.

The current [detectability output](../data/processed/detectability.json) spans
0–9.08% by day and about 0.40–100% by night; the 100% night bin is only 3/3
cell-days. The externally supplied 0.1–10.6% range is not reproduced by this
checkout and must not be used as its result without the originating artifact.

## Why the 2026 sensitivity band is nearly flat

The 2026 band is nearly flat because 4,957 real MODIS cell-days are retained at every threshold and only 382 of 11,187 VIIRS detections pass the reconstructed time windows before FRP filtering, so changing the threshold adds only 57–251 cell-days and yields totals of 5,014–5,208 (see [audit evidence](../data/processed/audit_evidence.json) and [2026 same-eyes output](../data/processed/2026/calendar_sameeyes.json)).

## Independent implementation limitation

The project owner reports an approximately 1% harmonization divergence versus
an independent VM implementation, with observed differences reported as bounded
at 0.2–0.9%; the cause is unknown. No VM output or comparison artifact is present
in this checkout, so that reported range has not been independently verified
here and is not an established error bound for future runs. Retain it as a
known limitation pending an archived comparison, not as a pipeline-derived
accuracy claim.

## Audit status and remaining guards

Current raw and standardized data and saved harmonized events contain no S-NPP
detections after 2026-11-02, and current raw products are SP-only for 2020–2025
and NRT-only for 2026 ([audit evidence](../data/processed/audit_evidence.json)).
However, standardization does not enforce the S-NPP cutoff, and a later fetch
can leave both product classes in a season because filenames differ; neither
is currently rejected by the raw-CSV ingestion step. These are open robustness
findings, not fixes made during this audit.

The full2026 fleet permits NOAA-21, but no NOAA-21 source has been downloaded:
its present results represent MODIS plus NOAA-20 only. Its denominator also
excludes S-NPP, unlike the all-input full calendar. Published constants and
chosen grid, date, confidence, and sensitivity parameters are inputs, not
empirical headline results; measured claims must link to output artifacts.
