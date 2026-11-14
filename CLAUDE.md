# Ghost Fleet — project context (auto-loaded by Claude Code)

Dead satellites, honest calendars. NASA Space Apps 2026, challenge
"Harmonization of MODIS and VIIRS Hot Spots". Team MONOLITH-builders.
Submission: Sun 15 Nov, target 20:00 IST (hard close 23:59).

Read these before doing anything:
@docs/TEAM_BRIEF.md
@docs/METHOD.md
@docs/PIPELINE_AUDIT.md

## What this is
We degrade modern VIIRS fire data DOWN to MODIS-equivalent
sensitivity (reconstructed MODIS pass windows + published detection
limits, Sofiev & Kouznetsov 2026) instead of scaling the past up,
and re-render the 2026 Punjab+Haryana season (Oct 1–Nov 15) through
five satellite fleets. Backend pipeline is DONE (phases P0′–P7,
see TEAM_BRIEF). Remaining: P9 frontend, P10 demo + submission.

## Hard rules
- Every number shown anywhere comes from data/processed/*.json —
  never hand-type a number into UI or text. Headline percentages
  come only from fleet_diff.json.
- FRP is never summed across sensors. S-NPP is historical-only:
  its last detection is 2026-11-02; nothing from S-NPP may appear
  after that date.
- Colour scale is IDENTICAL between the full calendar and the
  same-eyes view.
- Never pitch the dead lines listed in TEAM_BRIEF (Terra 99.5%,
  peak-day move, critical-day flips — the data killed all three).
- Static frontend only. No backend, no login gate.
- After every completed task, update docs/BUILD_PROGRESS.md
  (phase, IST timestamp, tests, commit SHA, status) — see the
  progress-log protocol in TEAM_BRIEF.

## Layout
scripts/ pipeline (fetch, harmonize, detectability, degrade,
fleets) · tests/ · docs/ · data/processed/ = the JSON contract the
frontend reads.
