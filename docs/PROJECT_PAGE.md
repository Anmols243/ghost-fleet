# Ghost Fleet — Fire Trend Audit

**Dead satellites, honest calendars.**

## What it does

An analyst chooses two burning seasons and inspects the recorded change with all included satellites. They then compare it with the change using only satellites present in both periods. The app decomposes the recorded cell-days exactly as W = U + C: all-satellite events, shared-satellite events, and the remainder. The analyst can inspect the daily records, fleet lists and method checks and download the comparison evidence before deciding how to qualify a claim.

## Approved project claim

Ghost Fleet — Fire Trend Audit compares active-fire cell-days between
Punjab–Haryana burning seasons using the same geographic mask, grid, date
rules, and confidence criteria. It shows the recorded change for all
included satellites, the change for satellites present in both periods,
and the difference between them. It does not estimate the change in
actual burning.

## Headline results

### P1: 2011 to 2012

October 1-November 15 in both seasons. All included satellites (W): **13,581 to 75,396, +455.2%**, relative to the 2011 all-included-satellite count of 13,581. Shared satellites (Terra+Aqua; U): **13,581 to 14,303, +5.3%**, relative to the 2011 shared-satellite count of 13,581. C is **0 to 61,093 recorded cell-days**. The difference between these two percentage changes is **449.8 percentage points**.

Qualification: this is a difference between selections of the retrieved records, not a causal attribution. Neither selection estimates change in actual burning. Actual-fire change is not measured.

### P2: 2017 to 2018

October 1-November 15 in both seasons. All included satellites (W): **54,291 to 108,035, +99.0%**, relative to the 2017 all-included-satellite count of 54,291. Shared satellites (Terra+Aqua+Suomi NPP; U): **54,291 to 60,491, +11.4%**, relative to the 2017 shared-satellite count of 54,291. C is **0 to 47,544 recorded cell-days**. The difference between these two percentage changes is **87.6 percentage points**.

Qualification: this is a difference between selections of the retrieved records, not a causal attribution. Neither selection estimates change in actual burning. Actual-fire change is not measured.

### P3: 2025 to 2026

October 1-November 14 in both seasons. All included satellites (W): **17,712 to 14,341, -19.0%**, relative to the 2025 all-included-satellite count of 17,712. Shared satellites (Terra+Aqua+Suomi NPP+NOAA-20; U): **17,712 to 14,341, -19.0%**, relative to the 2025 shared-satellite count of 17,712. C is **0 to 0 recorded cell-days**.

Qualification: the two seasonal views coincide because the same satellites are included in both periods, so their decomposition cannot expose the within-season interruption. S-NPP data delivery ceased on November 2, 2026; its recorded cell-days are zero from November 3 while NOAA-20 continues. This snapshot exposes an interruption that users must consider when interpreting the seasonal record. November 15 is excluded from this comparison; in the 2026 daily series it is unverified, not yet retrieved, and represented as null. Actual-fire change is not measured.

## Validation disclosure

We tested one proposed MODIS-sensitivity correction in the 2021 season.
It failed the benchmark. The current app does not use that correction as
a trusted measurement. It retains it in Method checks as a tested and
failed method.

On the common interval, method-check steadiness is raw **0.403**, degraded **0.252**, ratio **0.086**: mean |ΔJ| over transitions **2018→2019 through 2024→2025**. These are archived reference-implementation results, not rerun on canonical data; steadiness does not establish accuracy.

## Data and method

NASA FIRMS supplies MODIS Collection 6.1 and VIIRS 375 m active-fire records, using standard-processing products for archive seasons and near-real-time products for 2026. The geographic selection is the bounding box **73.8–77.6°E / 27.6–32.6°N**, a box rather than an administrative mask. Events count unique UTC cell-days within each selected sensor union. The pipeline uses approximately 1 km cells, as defined in docs/METHOD.md and docs/HARMONIZATION.md.

The dataset covers **26 seasons, 2001–2026**. The refreshed frozen dataset contains **1,601,380 detections retrieved / 1,482,211 retained** after confidence rules and the verified cutoff.

Confidence rules retain VIIRS nominal and high confidence and MODIS confidence **≥50**. FRP is never summed across sensors. The full requested seasonal window is October 1–November 15; coverage metadata governs which dates are verified and included.

## Observed-data ledger

The daily observation ledger is a reusable observed-data export and a partial
response to the challenge brief. Download CSV or JSON from the app: date,
satellite selection, recorded cell-days, coverage status, product and comparison
inclusion. It preserves unverified days as null and does not stitch comparisons
into a continuous series.

## Acquisition-time appendix

The timing of retained daytime detections changes across this record. This summary does not measure orbital drift or the effect of drift on counts.

For Terra and Aqua separately, the appendix reports each season's UTC median,
interquartile range, retained daytime detection count n and represented days.
Missing observations stay null. The displayed window respects the verified cutoff;
sample size is visible beside each estimate. JSON is downloadable from the app.

## Limitations

A zero selection gap does not establish comparability: this calculation cannot expose changes within the shared fleet.

The adjacent-season appendix shows all adjacent pairs with absolute W/U counts
beside their percentage changes, using the common verified window for each pair.
Within-fleet changes in timing, sensitivity and condition are not controlled by
the selection accounting; retained-detection timing is shown separately. These
comparisons are not stitched into a continuous series. Actual-fire change is not measured.

- The 2026 NRT snapshot is provisional, with a verified cutoff of November 14. November 15 is unverified / not yet retrieved, excluded from totals and shown as null.
- NOAA-21 dates describe different things: FIRMS archive coverage is listed from March 2023; the original product announcement said January 2024. Entry into this retrieved comparison is absent: no NOAA-21 data were pulled. These dates do not define a fleet transition in this app.
- S-NPP data delivery ceased November 2, 2026. Its absence later in the season is a record interruption, not evidence of absent burning.
- Grid-convention sensitivity is archived in the repo. The cause of the difference between implementations remains unknown; equal seasonal row counts do not establish a record-level exact match.
- A zero means no recorded cell-days in these retrieved records, not that no fires occurred. Coverage and cloud effects limit interpretation.

## AI-use disclosure

AI assistants were used to build the software and draft text. All data processing is deterministic code in the repository. No AI/ML model is part of the product's measurements.

## Links and team

- App: https://ghost-fleet-chads2.vercel.app/
- Repository: https://github.com/Anmols243/ghost-fleet
- Team: MONOLITH-builders — Anmol Singh and Shabeeh Ahmad Khan
- Local Event: Delhi
- Challenge: "Harmonization of MODIS and VIIRS Hot Spots"
