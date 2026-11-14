# Ghost Fleet — agent laws
- Read docs/METHOD.md and the task in the plan before writing code.
- Use skills: $tdd for every implementation task, $diagnosing-bugs for any failure, $verification-before-completion before claiming done, $code-review before every commit. State which skill you used.
- One task at a time. Failing test first, then code, then run the full suite. Commit only when green. Never push on a failing suite.
- Never commit .env or any API key. FIRMS MAP_KEY comes from .env only.
- Degrade-only: never scale historical counts up. FRP is never summed across sensors. All dates UTC. S-NPP is historical/labelled only.
- Confidence rule: MODIS >= 50, VIIRS in {n, h}.
- If a requirement is ambiguous, stop and ask. Do not invent numbers: every headline figure must come from pipeline output files.

## Standing progress-log law

Seed-table reference: the Build phases section of `docs/TEAM_BRIEF.md`.

**Progress-log protocol (binding on any agent working in this repo,
including Codex):** maintain `docs/BUILD_PROGRESS.md`. If it does not
exist, create it seeded from the table above. After EVERY completed
task — before or with its commit — update the file: phase, task,
date/time IST, model + effort used, tests result, commit SHA, and
status (DONE / IN PROGRESS / BLOCKED + reason). Never mark a phase
DONE without a commit SHA and a green test run. The brief's table is
a snapshot; BUILD_PROGRESS.md is the living record.
