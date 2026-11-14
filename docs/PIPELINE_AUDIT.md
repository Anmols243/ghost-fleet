# Whole-pipeline audit

Scope: `git diff 07512ec...a68a353`, plus current ignored raw/processed outputs.
Spec: the P2–P6 contracts and this audit request. Standards: AGENTS.md,
METHOD.md and the module method documents. No implementation fixes were made.

## Standards findings
1. Medium: product purity is not enforced on reruns. Fetch replaces manifest
   entries by filename; NRT and SP filenames differ, and harmonization reads all
   raw CSVs. Current files pass, but a later product switch can mix a season.
2. Medium: S-NPP cessation is labelled but not enforced. Standardization accepts
   otherwise valid post-cutoff rows. Current raw, standardized and harmonized
   event outputs contain zero such detections. post_snpp2026 excludes S-NPP.

No cross-sensor FRP summation was found: event aggregation takes independent
MODIS/VIIRS maxima. Other sums count events, matches, or calendar entries.
No additional concrete code-smell finding was raised.

## Spec findings
1. High: missing product-purity enforcement on reruns (same issue as above).
2. Medium: missing S-NPP cutoff enforcement (same issue as above).
3. Medium: the supplied 0.1–10.6% empirical range is not reproduced by the local
   detectability artifact. Actual day bins span 0–9.081%; night bins span
   0.404–100%, with only three cell-days in the 100% bin.
4. Limitation: NOAA-21 is defined in fleets but was not among the requested
   fetch sources; no NOAA-21 detections exist in this pull. full2026 currently
   represents MODIS + NOAA-20, excluding S-NPP.
5. Unverified external claim: the VM divergence range 0.2–0.9% has no local
   independent comparison artifact. METHOD records it as owner-reported with
   cause unknown, not an independently verified accuracy bound.

Standards: 2 findings, highest medium. Spec: 3 defects/discrepancies plus
2 limitations, highest high (product mixing on reruns).

## Numerical provenance inventory
No project README, demo or pitch text is present. Reviewed all five existing
method documents plus METHOD.md; no unsupported empirical headline was found
there before this audit. The numbers fall into these categories:

| Claim family | Provenance |
| --- | --- |
| Detection thresholds, strong-fire probabilities | External literature, linked in METHOD; also serialized in detectability.json. Serialization does not independently validate a published constant. |
| Grid origin, reference latitude, Earth radius, ~1 km width | Explicit algorithm inputs in harmonize.py; 0.97–1.03 km is a rounded geometric approximation, not a measured fire result. |
| Confidence, dates, 46 days, p90, chunk sizes, windows, multipliers | Contract/algorithm parameters and calendar arithmetic, not empirical headlines. |
| S-NPP final observed date | standardized.parquet; verified against raw and harmonized event CSVs. |
| Fleet totals, percentages, peak shift, critical days | fleet_diff.json and fleets_2026.json; full2026 denominator intentionally excludes S-NPP. |
| Detectability shares | detectability.json, including each bin's numerator/denominator. |
| 2026 sensitivity explanation | audit_evidence.json and 2026/calendar_sameeyes.json. |
| VM divergence and supplied 0.1–10.6% range | External statements supplied by the owner; no local source artifact. |

## Explicit documentation changes
METHOD.md now explains likely co-detection-gap causes, distinguishes the
published probability from empirical matching, records the local range,
explains the nearly flat 2026 band in one sentence, and states the VM limitation
with its provenance caveat. It also discloses the two missing guards and absent
NOAA-21 coverage. No thresholds, grid, observations, or computed shares changed.

## Verification
Evidence: `data/processed/audit_evidence.json`. All current raw files are SP-only
for 2020–2025 and NRT-only for 2026. No late S-NPP rows were found in raw data,
standardized data, or event CSVs. Degraded results select original rows only;
fleet selectors exclude S-NPP for full2026/post_snpp2026.
Full suite: `python -m pytest -q` — 16 passed. `git diff --check` passed.
