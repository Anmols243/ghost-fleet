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
- Every number shown anywhere comes from backend/data/processed/*.json —
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
backend/scripts/ pipeline (fetch, harmonize, detectability, degrade,
fleets) · backend/tests/ · docs/ · backend/data/processed/ = the JSON contract the
frontend reads.

## PIVOT 2026-11-15 — Fire Trend Audit (read @docs/AUDIT_SPEC.md FIRST)

AUDIT_SPEC.md is the plan of record and supersedes TEAM_BRIEF.md where
they conflict. The product is an audit of observation-dependent counts:
all-satellite change vs shared-satellite change, decomposed W = U + C.
Degradation FAILED its 2021 benchmark (MAE 1,162 vs ratio 323) — it is
experimental Method-checks material only, never a trusted measurement.
Language law: never "MODIS-equivalent", "harmonised", "continuous
record", "same-eyes" (outside qualified Method-checks context), or any
claim about change in actual burning. Say "shared satellites" and
"S-NPP data delivery ceased". Every percentage shows its denominator.
Frontend renders only the frozen audit.json. Scope freeze at 12:00 IST.

## CONTEXT PACK 2026-11-15 — read these FIRST, in order

@docs/AUDIT_SPEC.md
@docs/BUILD_BRIEF.md
@docs/COPY_PACK.md

AUDIT_SPEC is the plan of record; BUILD_BRIEF holds the binding build decisions (data freeze, deploy, acceptance lines); COPY_PACK is final copy — use it unchanged. TEAM_BRIEF.md and METHOD.md are pre-pivot history except METHOD's measurement contract (grid, window, confidence rules), which stays in force.

OLD CODE: do not delete and do not extend the pre-pivot machinery. fetch_firms.py + harmonize.py are load-bearing. degrade.py, fleets.py, detectability.py and docs/DEGRADATION.md, FLEETS.md, PIPELINE_AUDIT.md are Method-checks evidence — the degradation method FAILED its held-out 2021 benchmark and is never a measurement. PITCH.md, DEMO_SCRIPT.md, TEAM_BRIEF.md are superseded framing. The only new pipeline code is backend/scripts/audit.py producing frontend/audit.json, the app's only data file.
