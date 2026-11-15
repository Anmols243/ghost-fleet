# Ghost Fleet — Fire Trend Audit: submission checklist

The 8 gates from docs/AUDIT_SPEC.md, with evidence pointers and status as of 2026-11-15 ~11:15 IST. This file is the evidence index for the 18:00 IST Astra seal round. Statuses are only what the cited evidence supports.

## Gate 1 — Complete public workflow
Gate: complete public workflow, no login, desktop + mobile, all 3 presets, comparison → evidence download unaided.
Status: PENDING FRONTEND. Evidence: frontend build in progress (frontend/ reads only the frozen frontend/audit.json).
Remains: deployed URL, unaided end-to-end run on desktop and mobile widths.

## Gate 2 — Measurement contract and coverage
Gate: measurement contract explicit and identical everywhere; incomplete pulls flagged; 2026 cutoff / NRT status / missing satellites visible; zero means "no detections in these retrieved records".
Status: BACKEND FIXED — commit a7d9cc1. audit.json carries retrieval timestamp, requested interval, per-season coverage status, source/product per season, grid and bounding box. Verified common cutoff for 2026 is Nov 14; Nov 15 is null (unverified) and excluded from all totals. NOAA-21 absence is disclosed in the data and copy.
Remains: frontend must render the metadata, cutoff, NRT status, NOAA-21 exclusion and the unverified day visibly, and include them in the evidence download.

## Gate 3 — Exact arithmetic
Gate: independent aggregation reproduces U, C, W for all presets; downloads match screen.
Status: PASSED (evidence side), 2026-11-15. Astra independently aggregated the committed parquet without the repo's functions: all 9,568 daily counts and every preset's W, U, C, changes and gaps reproduced exactly; 24 repo tests pass.
Remains: downloads-match-screen check against the finished frontend.

## Gate 4 — No implied causality
Gate: no implied causality anywhere in app, page or demo.
Status: COPY PASSED, UI PENDING. docs/COPY_PACK.md carries the hostile-reading pass and the fixed qualification lines; conclusion lines are rendered from the frozen templates in docs/BUILD_BRIEF.md §4.
Remains: review of the rendered UI and demo for causal phrasing or visuals (no "correction" arrows).

## Gate 5 — No hidden method outcome
Gate: the 2021 validation failure and the sensor-addition results are one click away; degradation labelled experimental.
Status: DATA READY, UI PENDING. audit.json method_checks contains the 2021 benchmark failure and the sensor-addition results on the common interval (mean |ΔJ|, transitions 2018→2019 … 2024→2025: raw 0.403, degraded 0.252, ratio control 0.086), labelled as archived reference-implementation results.
Remains: Method checks panel in the frontend, one click from the comparison, with the BUILD_BRIEF §6 framing line.

## Gate 6 — The audit reveals something
Gate: P1/P2 gaps ≥ 10 pp plus the P3 interruption, with the statement requiring qualification shown.
Status: PASSED (evidence side). Frozen values: P1 gap 449.8 pp (+455.2% all satellites vs +5.3% shared), P2 gap 87.6 pp (+99.0% vs +11.4%), P3 −19.0% on the Oct 1–Nov 14 common cutoff with the S-NPP interruption documented (last S-NPP detection in the snapshot: 2 Nov 2026).
Remains: the UI must show the qualification beside each result.

## Gate 7 — Usability
Gate: two non-builders each complete a preset task in ≤ 2 minutes and correctly state the app does NOT measure change in actual fires; answers + times recorded in docs/BUILD_PROGRESS.md.
Status: NOT RUN. Kit ready: docs/GATE7.md (commit e19da7f) — verbatim script, scorecard, fail/retest protocol.
Remains: deployed compare view + two testers. Demo capture does not start until Gate 7 passes.

## Gate 8 — Submission-ready by 18:00
Gate: app + project page + demo public; NASA sources, AI disclosure, limitations, repo link; every headline traces to frozen output.
Status: IN PROGRESS. Project page drafted: docs/PROJECT_PAGE.md (commit a74f083). Freeze: b9bb718, coverage correction a7d9cc1.
Remains: app URL filled into PROJECT_PAGE.md + GATE7.md, demo produced, signed-out public-access verification, submission.

## Run order, 16:00–18:00 IST
1. Fill the deployed app URL into docs/PROJECT_PAGE.md and docs/GATE7.md.
2. Run Gate 7 (docs/GATE7.md); record results in docs/BUILD_PROGRESS.md; fix failures before anything else.
3. Capture the demo from the live app (docs/COPY_PACK.md narration / slides, unchanged wording).
4. Signed-out public-access check: app, repo, project page, demo link.
5. Submit the project (team target 20:00; Project Tab hard close 23:59 local).
6. 18:00: Astra seal round with this checklist as the evidence index.
