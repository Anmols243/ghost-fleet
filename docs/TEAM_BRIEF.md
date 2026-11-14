# Ghost Fleet — Team Brief

**Tagline:** Dead satellites, honest calendars.
**Challenge:** NASA Space Apps 2026 — "Harmonization of MODIS and
VIIRS Hot Spots". Team MONOLITH-builders (Anmol Singh + Shabeeh).
**Submission deadline:** Sun 15 Nov, our target 20:00 (hard close
23:59 local). Repo: https://github.com/Anmols243/ghost-fleet

## The idea in one paragraph

Every fire calendar built from satellite data lies after 2012 — not
because burning exploded, but because the satellite got better eyes.
VIIRS (2012) sees fires roughly 3–4x smaller than MODIS (2000) could,
so any naive long-term trend mixes real change with instrument
change. Every other team in this challenge "harmonizes" by scaling
the past UP with correction ratios — inventing fires no satellite
ever saw. **We do the opposite: we degrade today's VIIRS data DOWN
to MODIS-equivalent sensitivity** — keep only detections that fall
inside a reconstructed MODIS pass window AND clear the published
MODIS detection limit for their day/night class — producing a record
where 2026 and 2020 are honestly comparable. On top of that, a
**fleet simulator** lets anyone re-watch the 2026 Punjab+Haryana
season (Oct 1–Nov 15) through five satellite fleets: Terra-only
2000, Terra+Aqua 2002, +VIIRS S-NPP 2012, the full 2026 fleet, and
the 2026 fleet after Suomi NPP died mid-season (its last detection
in our data: **2 Nov 2026**, then zero, while NOAA-20 kept watching).

This is an **after-the-season audit tool**, not a monitoring product
— FIRMS already does live monitoring free. Our user is the person
who must sign off on whether burning rose or fell: a CAQM reviewer,
a researcher, a journalist checking a claim.

## The science (kept honest)

- Detection limits: Sofiev & Kouznetsov 2026 (Geoscientific Model
  Development) — published MODIS/VIIRS observation operators. MODIS
  limit ≈ 3.7 MW (night) / 5.7 MW (day) at nadir; VIIRS sees down to
  ~0.5 MW. We cite it; we do not claim to have invented the physics.
  What is new is the product: no team in this challenge degrades,
  and no public tool re-renders a season through historical fleets.
- Pass windows are reconstructed per season from that season's own
  MODIS acquisition-time clusters (±45 min) — never fixed clock
  times, because Aqua's overpass has drifted from ~13:30 toward
  ~16:00 over Punjab.
- FRP is **never summed across sensors** (per-sensor-group maxima
  only). Confidence rule: MODIS ≥ 50; VIIRS nominal+high only.
- Sensitivity band: results also computed at p=0.25 / p=0.75
  detection probability (limits ×0.6 / ×1.6), labelled approximation.
- Known limitations are printed in docs/METHOD.md and
  docs/PIPELINE_AUDIT.md — read them before demoing. Highlights:
  NOAA-21 is configured but absent from the pulled data (full2026
  is effectively MODIS + NOAA-20 — disclosed); empirical MODIS
  co-detection of VIIRS cell-days is 0–9% by day (strict same-cell
  same-day pairing; footprint mismatch and inter-pass fire lifetime
  are the likely contributors — stated as likely, not proven).

## The numbers (final — from the committed pipeline, do not invent others)

2026 season, Punjab+Haryana bbox (73.8, 27.6, 77.6, 32.6):

| View / fleet | Events | vs full |
|---|---:|---:|
| Full harmonized season | 14,296 events | — |
| Same-eyes (degraded, p=0.5) | 5,097 | **64.3% lost** |
| Fleet terra2000 | 64 | artefact — do not headline |
| Fleet terra_aqua2002 | 5,030 | 43.66% of full (**56.3% lost**) |
| Fleet viirs2012 | 8,169 | 70.91% of full |
| Fleet full2026 | 11,521 | 100% |
| S-NPP | last detection 2 Nov 2026, then 0 | NOAA-20 continues |

Peak day is **2026-11-08 in every meaningful view** — it does not
move. Critical days = 0 in all 2026 views under the common baseline
(2020–25 seasons dwarf 2026) — recorded, not pitched.

### Dead lines — never pitch these (the data killed them)
- "Terra 2000 loses 99.5%" — artefact of Terra's decline (Terra raw
  detections fell 1,151 in 2020 → 31 in 2025) + morning-pass timing.
- "The peak day moves" — false; Nov 8 everywhere.
- "Critical days flipped" — unmeasurable as defined (see above).

## Repo structure

```
scripts/   fetch_firms.py, harmonize.py, detectability.py,
           degrade.py, fleets.py   (pipeline, TDD, all committed)
tests/     16 tests, all green
docs/      METHOD.md (method + limitations), PIPELINE_AUDIT.md
           (adversarial audit), PITCH.md, DEMO_SCRIPT.md
data/processed/   the JSON contract below (frontend reads ONLY these)
```

Pipeline: FIRMS area API → standardized detections → cell-day
events (~1 km grid) → 46-day calendars → detectability curve →
degraded same-eyes calendars → fleet renders + fleet_diff.
Data traps already solved, do not rediscover: API max 5 days per
request; archive seasons use *_SP products, current season *_NRT
(NRT is empty for history, SP has not ingested 2026).

## Data contract (what the frontend consumes)

All under `data/processed/` — **every number on screen comes from
these files; nothing is hand-typed into the UI.**

- `<season>/calendar_full.json` — {season, view, days[46]{date,
  events, median, p90, critical}, total, peak_day}
- `<season>/calendar_sameeyes.json` — same shape + sensitivity block
- `fleets_2026.json` — five fleets, 46 days each
- `fleet_diff.json` — per-fleet total, pct_of_full, peak_day,
  critical_days; the ONLY source for headline percentages
- `detectability.json` — MODIS-seen share by FRP band × day/night,
  with published constants alongside

## Frontend — your build, Shabeeh

Static site only (no backend, no login — judging requires public
access without a gate). Five views:

1. **Calendar** — 46-day grid per season, full view; colour scale
   fixed across all views and seasons.
2. **Same-eyes view** — identical layout and IDENTICAL colour scale
   (the comparison is the product).
3. **Fleet simulator** — one switch, five fleets, 2026 calendar
   re-renders; S-NPP seam annotated at 3 Nov.
4. **Diff view** — per-fleet totals / % of full from fleet_diff.json,
   sensitivity band shown, dead lines absent.
5. **Method view** — renders the method + limitations honestly
   (from docs/METHOD.md content).

Rules: no number in the UI that is not in a JSON; no chart library
lock-in needed — plain JS/DOM is fine; deploy static (GitHub Pages /
Vercel / Netlify), verify signed-out in a private window.

## Sunday plan

- Morning: frontend build against the JSONs; P8 numbers already in
  docs/PITCH.md.
- Demo: ≤30-second video per docs/DEMO_SCRIPT.md — full calendar →
  fleet switch to Terra+Aqua → S-NPP seam. (Or ≤7-slide deck.)
- Project page: description from PITCH.md 60-second version +
  AI-use disclosure (built with AI coding assistants; method and
  numbers human-verified against a second independent
  implementation).
- **Submit by 20:00.** Hard close 23:59 — we do not use it.

## Who does what

- Anmol — pipeline (done), numbers, project page, submission.
- Shabeeh — frontend, deploy, demo recording.
- Both — read METHOD.md + PIPELINE_AUDIT.md before answering any
  judge question. If a judge asks for a number, it comes from
  fleet_diff.json or it doesn't get said.
## Build phases — the progress-log protocol

The build runs as numbered phases:

| Phase | What |
|---|---|
| P0′ | Repo seed: LICENSE (MIT), AGENTS.md, .gitignore, METHOD.md |
| P1 | Structure, .venv, deps, git identity |
| P2 | Fetch — FIRMS pull, 105 chunks, 2020–2026 |
| P3 | Harmonize — standardized frame + cell-day events + calendars |
| P4 | Detectability — empirical MODIS co-detection vs published constants |
| P5 | Degrade — pass windows + FRP limits + sensitivity band |
| P6 | Fleets + fleet_diff |
| P7 | Adversarial audit ($code-review + $verification-before-completion) |
| P8 | Fill PITCH.md / DEMO_SCRIPT.md brackets from fleet_diff |
| P9 | Frontend (Shabeeh) — 5 views, static deploy |
| P10 | Demo video + project page + submission by Sun 20:00 |

**Progress-log protocol (binding on any agent working in this repo,
including Codex):** maintain `docs/BUILD_PROGRESS.md`. If it does not
exist, create it seeded from the table above. After EVERY completed
task — before or with its commit — update the file: phase, task,
date/time IST, model + effort used, tests result, commit SHA, and
status (DONE / IN PROGRESS / BLOCKED + reason). Never mark a phase
DONE without a commit SHA and a green test run. The brief's table is
a snapshot; BUILD_PROGRESS.md is the living record.
