# Ghost Fleet — Fire Trend Audit: submission checklist

The 8 gates from docs/AUDIT_SPEC.md, with evidence pointers and status as of 2026-11-15 ~11:15 IST. This file is the evidence index for the 18:00 IST Astra seal round. Statuses are only what the cited evidence supports.

## Gate 1 — Complete public workflow
Gate: complete public workflow, no login, desktop + mobile, all 3 presets, comparison → evidence download unaided.
Status: FRONTEND VERIFIED (mechanical), human run pending. Evidence: deployed at https://ghost-fleet-chads2.vercel.app/ (serves commit 1350181; live app.js and audit.json hashes match the repo). Browser run on the deployed URL at 1280px and 390px: 3 presets x both fleet views render the frozen values, download button enabled with report and CSV, method checks and case study render, no horizontal scroll. See BUILD_PROGRESS Phase 3.
Remains: unaided human run signed-out on real devices, and the under-2-minute task timing (not measured by the build); both belong to Gate 7.

## Gate 2 — Measurement contract and coverage
Gate: measurement contract explicit and identical everywhere; incomplete pulls flagged; 2026 cutoff / NRT status / missing satellites visible; zero means "no detections in these retrieved records".
Status: FRONTEND VERIFIED (backend side: commit a7d9cc1). audit.json metadata is rendered in the coverage strip (requested vs comparison interval, per-season status, cutoff, product, sources, retrieval timestamp with scope, bounding box, grid, confidence rules, NOAA-21 note, zero definition) and repeated in the evidence report. Both Nov 15 cells in P3 are distinct from zero.
Remains: human review of the deployed page.

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
Status: FRONTEND VERIFIED. Appendix A (nav, one click) renders the framing line, the 2021 benchmark table with the failed-degradation stamp and the verbatim validation disclosure, and the sensor-addition results (0.403 / 0.252 / 0.086 common-interval values only, ranges, provenance), all from audit.json method_checks.
Remains: human review of the deployed page.

## Gate 6 — The audit reveals something
Gate: P1/P2 gaps ≥ 10 pp plus the P3 interruption, with the statement requiring qualification shown.
Status: PASSED (evidence side). Frozen values: P1 gap 449.8 pp (+455.2% all satellites vs +5.3% shared), P2 gap 87.6 pp (+99.0% vs +11.4%), P3 −19.0% on the Oct 1–Nov 14 common cutoff with the S-NPP interruption documented (last S-NPP detection in the snapshot: 2 Nov 2026).
Remains: the UI must show the qualification beside each result.

## Gate 7 — Usability
Gate: two non-builders each complete a preset task in ≤ 2 minutes and correctly state the app does NOT measure change in actual fires; answers + times recorded in docs/BUILD_PROGRESS.md.
Status: APPROVED on automated evidence (Arlo sign-off, 2026-11-15 ~19:58 IST; evidence: BUILD_PROGRESS commit a0226e0 and the approval entry that follows it). Two independent cold automated agents ran the verbatim docs/GATE7.md protocol on the rendered app: 2/2 PASS. Deviation recorded in BUILD_PROGRESS: the gate as defined specifies human non-builders; no human run took place; the approval substitutes automated evidence on the team owner's instruction.
Remains: nothing for tonight's sequence. A human run, if performed later, supersedes the approval if it fails.

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
