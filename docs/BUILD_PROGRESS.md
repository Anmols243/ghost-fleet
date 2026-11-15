# Build progress

Living record seeded from docs/TEAM_BRIEF.md. Last reconciled: 2026-11-14 19:43:34 IST.
Commit times below are IST. Model/effort labels are copied from the brief;
they are historical labels, not newly verified execution settings.

| Phase | Task | Date/time IST | Model + effort | Tests / verification | Commit SHA | Status |
|---|---|---|---|---|---|---|
| P0' | Repo seed: LICENSE, AGENTS.md, .gitignore, METHOD.md | 2026-11-14 15:37:46 | / | Seed documents present; current suite green | 0b2ef43, e2d174f, 84dab3c, 1b356bc | DONE |
| P1 | Structure, .venv, dependencies, git identity | 2026-11-14 15:56:56 | Sol / Low | Dependency imports/pip check passed; no tests existed then; current suite green | 07512ec | DONE |
| P2 | Fetch FIRMS data; NRT/SP correction | 2026-11-14 16:30:21 | Sol / Medium | Four tests passed after fix; current suite green | 9f0ab0a, 7b07403 | DONE |
| P3 | Standardized frame, events, full calendars | 2026-11-14 16:39:02 | Sol / Medium | Eight tests passed at completion; current suite green | f6dbe4e | DONE |
| P4 | Empirical detectability | 2026-11-14 16:44:36 | Sol / Medium | Nine tests passed at completion; current suite green | 83b01d6 | DONE |
| P5 | Degrade and same-eyes sensitivity calendars | 2026-11-14 19:09:19 | Astra / High | Thirteen tests passed; all season gates passed; current suite green | c6896d3 | DONE |
| P6 | Fleet calendars and fleet_diff | 2026-11-14 19:14:36 | Sol / Medium | Sixteen tests passed; current suite green | a68a353 | DONE |
| P7 | Adversarial audit and method limitations | 2026-11-14 19:20:06 | Astra / Medium | Sixteen tests passed before audit report; documentation committed | bcfbc79 | DONE |
| P8 | Fill pitch/demo brackets from output files | 2026-11-14 19:43:34 IST | Sol / Low | Source values and local S-NPP/NOAA-21 facts verified; text edits pending | / | BLOCKED - docs/PITCH.md and docs/DEMO_SCRIPT.md are absent after pull; diff approval and commit still pending |
| P9 | Frontend: five views and static deployment | / | / | Not run | / | NOT STARTED |
| P10 | Demo, project page, submission | / | / | Not run | / | NOT STARTED |

## Current reconciliation

The P0' through P7 commits resolve locally. The pull is merge commit e32f7d2.
P8 is tracked through the latest request but is not complete: the source text
files are missing. No output figures were inserted into invented replacement
text. The owner's requirement to show the P8 diff and wait before committing
those edits remains active.

Verification at this reconciliation: `.venv/Scripts/python.exe -m pytest -q`
passed all 16 tests; `git diff --check` passed. These fresh checks validate the
current checkout, not a checkout of every historical commit.

## 2026-11-15 ~07:00 IST — Astra post-copy-pack scorecard (reported by user, read back by Arlo)

Current score 17/25 — Impact 4, Creativity 4, Validity 3, Relevance 4, Presentation 2. The 20/25 commitment stands if all 8 gates pass; the remaining gap is demonstrated execution and comprehension, not more data or another idea. Hackathon/résumé readiness per Astra: not yet — it turns on a finished demo passing Gate 7. Build consequences (staging: one result shown as a change; Gate 7 as critical path; evidence download + Method checks are score-bearing) are recorded as binding amendments in docs/BUILD_BRIEF.md.

## Archive extension / audit freeze gate

2026-11-15 07:39:00 IST - Codex (GPT-6.1 Sol; effort not exposed). Status: BLOCKED.
Pulled origin/main through 7710753 and read AUDIT_SPEC, BUILD_BRIEF, and
audit_reference.py. Archive fetch source selection added test-first; 17 tests pass.
2001 fetch: 1,365 raw rows; unchanged harmonize.standardize retains 1,205.
Against the supplied standardized reference 1,365, deviation is -11.72%,
outside 1.5%. Stopped at the first failing season as requested. The reference
exactly equals raw rows; reference filtering stage requires clarification.
Evidence: data/processed/extension_verification.json. Full VM count table
for intervening archive seasons is also missing from the available message.
No freeze, commit, or push performed. Existing standardized.parquet and
frontend/audit.json were not overwritten. Changes remain uncommitted in
fetch_firms.py, its regression tests, and this log; raw 2001 chunks and
manifest entries are retained. Commit SHA: none (gate failed).

## Archive extension resumed; FREEZE blocked by preset gate

2026-11-15 07:55:00 IST - Codex, GPT-6.1 Sol (effort not exposed).
The owner corrected the references to post-confidence counts. All 26 seasons
2001-2026 match exactly: 1,601,319 raw and 1,482,163 standardized; retained
2020-2026 manifest entries unchanged. Harmonization rerun with only SEASONS
expanded, no grid/confidence/aggregation changes. Audit reference port uses
union build_events and unrounded diff_pp. Review findings about mutable
references were fixed by pinning the VM reference independently.
STOP: P1 recorded-change gate fails: W 13,581 -> 75,396 gives +455.15794%,
versus VM +452.5%, difference +2.65794 pp >2 pp. Counts themselves differ
+0.444% and +0.928%, within 1.5%. No tolerance was altered.
No freeze, commit, or push. frontend/audit.json remains provisional and
unchanged. Downloaded archives and extended processed data are retained.
README wording corrected locally but its requested separate commit is pending.
Verification artifacts: extension_verification.json and audit_preset_verification.json
in data/processed. Commit SHA: none. Status: BLOCKED - preset tolerance failed.

## Ratio-gate decision received; derived-C boundary

2026-11-15 08:00:09 IST - Arlo accepted P1 amplification, repo pipeline canonical.
Gate updated locally to 1.5% totals and 1.5% relative W/U ratios. P1 totals
+0.44/+0.93%, W ratio approximately +0.48%, change +2.66 pp: accepted.
Full preset candidate saved in data/processed/audit_preset_candidate.json.
P1 W 13581/75396, U 13581/14303, C 0/61093; changes 455.2/5.3%, gap449.8pp.
P2 W 54291/108035, U 54291/60491, C 0/47544; changes99.0/11.4%, gap87.6pp.
P3 W=U 18031/14296, C0/0; changes -20.7/-20.7%, gap0pp.
All W/U totals and ratios pass; P2 derived C_b is +1.607% relative to46792,
above the still-specified 1.5% totals gate. Await clarification whether that
gate applies only to independently aggregated W/U or also derived C.
No commit/freeze/push; app remains provisional. Status: BLOCKED.

## FREEZE - repo pipeline canonical

2026-11-15 10:31:11 IST - Codex, GPT-6.1 Sol (effort not exposed).
Arlo explicitly approved the ratio gate and derived-C clarification in chat.
W/U totals and W/U change-ratios: 1.5% relative. C identity exact, with
|C_repo-C_ref| <=1.5% of repo W. P1 totals +0.44/+0.93%, W ratio +0.48%,
change +2.66 pp: accepted amplification, not an input mismatch.
P2 C_b deviation752 =0.70% of W_b: passes. All measured totals and ratios pass.
All26 standardized totals match VM exactly, 1,601,319 retrieved and
1,482,163 after disclosed confidence rules. All22 tests green; every daily
subset independently reproduced; common cell grid and FRP maxima preserved.
Only harmonize season configuration was expanded, not measurement logic.
Status: FREEZE verified, committing; the exact freeze SHA follows in a
separate entry after Git assigns it. This supersedes the blocked entries above.

| Preset | W A/B | U A/B | C A/B | change W | change U | diff pp |
|---|---|---|---|---|---|---|
| viirs_transition | 13581/75396 | 13581/14303 | 0/61093 | +455.2% | +5.3% | 449.8 |
| noaa20_transition | 54291/108035 | 54291/60491 | 0/47544 | +99.0% | +11.4% | 87.6 |
| snpp_cessation | 18031/14296 | 18031/14296 | 0/0 | -20.7% | -20.7% | 0.0 |

### Locked acceptance lines

Recorded change, Punjab + Haryana, 2011 → 2012: all included satellites, +455.2%; Terra+Aqua, +5.3%; difference, 449.8 percentage points. Neither percentage is a corrected estimate of fire activity, and the difference is not a causal attribution. Actual-fire change is not measured.

Recorded change, Punjab + Haryana, 2017 → 2018: all included satellites, +99.0%; Terra+Aqua+Suomi NPP, +11.4%; difference, 87.6 percentage points. Neither percentage is a corrected estimate of fire activity, and the difference is not a causal attribution. Actual-fire change is not measured.

Recorded change, Punjab + Haryana, 2025 → 2026: all included satellites, −20.7%; Terra+Aqua+Suomi NPP+NOAA-20, −20.7%. The two views coincide because the same four satellites are included in both seasons, so the decomposition cannot show the interruption. The included-satellite record is interrupted: S-NPP contributions run 1 Oct – 2 Nov, and zero from 3 Nov, while NOAA-20 continues. Actual-fire change is not measured.

### Changed numerical strings and template locations

- README.md:13: 2011 → 2012, the season Suomi NPP joined: all included satellites **+455.2%**; Terra + Aqua only **+5.3%**; difference **449.8 percentage points**. Neither percentage is a corrected estimate of fire activity, and the difference is not a causal attribution.
- README.md:30: - 26 seasons, 2001–2026; 1,601,319 detections retrieved; 1,482,163 after the team's disclosed confidence rules (VIIRS nominal+high; MODIS confidence ≥ 50).
- docs/AUDIT_SPEC.md:62: Gate: W/U totals and W/U ratios within 1.5% relative; C = W - U exactly and
- docs/AUDIT_SPEC.md:63: its reference deviation <=1.5% of that period's repo W (BUILD_BRIEF section 1).
- docs/AUDIT_SPEC.md:65: P1 viirs_transition - 2011 vs 2012:
- docs/AUDIT_SPEC.md:66:   W: 13,581 -> 75,396 (+455.2%)
- docs/AUDIT_SPEC.md:67:   U: 13,581 -> 14,303 (+5.3%)
- docs/AUDIT_SPEC.md:68:   C: 0 -> 61,093; difference 449.8 pp.
- docs/AUDIT_SPEC.md:70: P2 noaa20_transition - 2017 vs 2018:
- docs/AUDIT_SPEC.md:71:   W: 54,291 -> 108,035 (+99.0%)
- docs/AUDIT_SPEC.md:72:   U: 54,291 -> 60,491 (+11.4%)
- docs/AUDIT_SPEC.md:73:   C: 0 -> 47,544; difference 87.6 pp.
- docs/AUDIT_SPEC.md:75: P3 snpp_cessation - 2025 vs 2026:
- docs/AUDIT_SPEC.md:76:   W: 18,031 -> 14,296 (-20.7%)
- docs/AUDIT_SPEC.md:77:   U: 18,031 -> 14,296 (-20.7%)
- docs/AUDIT_SPEC.md:78:   C: 0 -> 0; difference 0.0 pp.
- docs/AUDIT_SPEC.md:80: P3 is the within-season interruption case: S-NPP is in both seasonal
- docs/AUDIT_SPEC.md:82: interruption; S-NPP detections end on 2 Nov and are zero from 3 Nov.
- docs/BUILD_BRIEF.md:8: ## 1. Data - frozen repo values and calibrated validation gate
- docs/BUILD_BRIEF.md:10: - The app reads ONE file: frontend/audit.json, schema "audit-app v1";
- docs/BUILD_BRIEF.md:13: - W and U are measured quantities: each total must be within 1.5% relative.
- docs/BUILD_BRIEF.md:14: - Ratios W_b/W_a and U_b/U_a must each be within 1.5% relative.
- docs/BUILD_BRIEF.md:16:   |C_repo - C_ref| <= 1.5% of that period's repo W.
- docs/BUILD_BRIEF.md:18:   Arlo accepted the 2026-11-15 amplification case: P1 totals +0.44/+0.93%,
- docs/BUILD_BRIEF.md:19:   W ratio +0.48%, change +2.66 pp. P2 C_b differs by 752, 0.70% of repo W_b.
- docs/BUILD_BRIEF.md:41: ## 4. Conclusion lines - frozen acceptance tests
- docs/BUILD_BRIEF.md:44: round only for display. Build shared_label from the preset's shared satellites
- docs/BUILD_BRIEF.md:45: using Terra / Aqua / Suomi NPP / NOAA-20 joined by "+".
- docs/BUILD_BRIEF.md:48: P1: "Recorded change, Punjab + Haryana, 2011 → 2012: all included satellites, +455.2%; Terra+Aqua, +5.3%; difference, 449.8 percentage points. Neither percentage is a corrected estimate of fire activity, and the difference is not a causal attribution. Actual-fire change is not measured."
- docs/BUILD_BRIEF.md:50: P2: "Recorded change, Punjab + Haryana, 2017 → 2018: all included satellites, +99.0%; Terra+Aqua+Suomi NPP, +11.4%; difference, 87.6 percentage points. Neither percentage is a corrected estimate of fire activity, and the difference is not a causal attribution. Actual-fire change is not measured."
- docs/BUILD_BRIEF.md:52: P3: "Recorded change, Punjab + Haryana, 2025 → 2026: all included satellites, −20.7%; Terra+Aqua+Suomi NPP+NOAA-20, −20.7%. The two views coincide because the same four satellites are included in both seasons, so the decomposition cannot show the interruption. The included-satellite record is interrupted: S-NPP contributions run 1 Oct – 2 Nov, and zero from 3 Nov, while NOAA-20 continues. Actual-fire change is not measured."
- docs/BUILD_BRIEF.md:89: 1. **One result, staged as a change.** Never present +455.2% and
- docs/BUILD_BRIEF.md:90:    +5.3% as two rival headlines. The comparison is ONE result whose
- docs/BUILD_BRIEF.md:102:    believing actual fires rose 455.2%. If the demo needs a document
- docs/COPY_PACK.md:37: | 00–03 | "The recorded count rose 455.2%." |
- docs/COPY_PACK.md:38: | 03–07 | "Using only Terra and Aqua, it rose 5.3%." |
- docs/COPY_PACK.md:39: | 07–10 | "The difference is 449.8 percentage points." |
- docs/COPY_PACK.md:53: - **S1.** "All included satellites: +455.2% detections"
- docs/COPY_PACK.md:54: - **S2.** "Terra + Aqua: +5.3% detections" — subline: "Not a corrected fire count"
- docs/COPY_PACK.md:55: - **S3.** "Selection gap: 449.8 percentage points" — subline: "No causal attribution"
- docs/COPY_PACK.md:68: {w}%; {shared_label}, {u}%; difference, {d} percentage points. Neither
- docs/COPY_PACK.md:75: {w}%; {shared_label}, {u}%; difference, {d} percentage points. A small
- docs/COPY_PACK.md:84: "Recorded change, Punjab + Haryana, 2025 → 2026: all included satellites, −20.7%; Terra+Aqua+Suomi NPP+NOAA-20, −20.7%. The two views coincide because the same four satellites are included in both seasons, so the decomposition cannot show the interruption. The included-satellite record is interrupted: S-NPP contributions run 1 Oct – 2 Nov, and zero from 3 Nov, while NOAA-20 continues. Actual-fire change is not measured."
- docs/COPY_PACK.md:112: | 1 | "Fires rose 455.2% in 2012" | Every percentage is labelled "detections" / "recorded change"; conclusion line ends "Actual-fire change is not measured." |
- docs/COPY_PACK.md:113: | 2 | "The real rise was only 5.3%" | Shared panel carries the permanent warning: "This percentage is not a corrected fire count." S2 subline repeats it. |
- docs/COPY_PACK.md:114: | 3 | "Satellites caused 449.8 points of fake fires" | S3 subline: "No causal attribution"; conclusion template: "the difference is not a causal attribution." |
- docs/COPY_PACK.md:117: | 6 | "2026 fires fell 20.7%" | P3 uses the interruption template: the record is interrupted mid-season; 2026 is labelled a data snapshot everywhere. |
- docs/COPY_PACK.md:121: | 10 | "449.8 is the error in the official count" | The gap is a difference between two selections of the same retrieved records; no official count is estimated or corrected anywhere. |
- docs/COPY_PACK.md:147: 455.2% or that 5.3% is the true/corrected change; the follow-up answer
- docs/COPY_PACK.md:150: Fail: treating 5.3% as the true or corrected fire change (automatic
- docs/COPY_PACK.md:151: fail); or reporting 455.2% as a change in actual fires; or being unable
- docs/COPY_PACK.md:168:       "t": "00-03",
- docs/COPY_PACK.md:169:       "line": "The recorded count rose 455.2%."
- docs/COPY_PACK.md:172:       "t": "03-07",
- docs/COPY_PACK.md:173:       "line": "Using only Terra and Aqua, it rose 5.3%."
- docs/COPY_PACK.md:176:       "t": "07-10",
- docs/COPY_PACK.md:177:       "line": "The difference is 449.8 percentage points."
- docs/COPY_PACK.md:180:       "t": "10-15",
- docs/COPY_PACK.md:184:       "t": "15-19",
- docs/COPY_PACK.md:188:       "t": "19-24",
- docs/COPY_PACK.md:189:       "line": "In the current season, S-NPP data delivery ceased on 2 November, while NOAA-20 continued."
- docs/COPY_PACK.md:192:       "t": "24-29",
- docs/COPY_PACK.md:196:       "t": "29-30",
- docs/COPY_PACK.md:202:       "n": 1,
- docs/COPY_PACK.md:203:       "headline": "All included satellites: +455.2% detections"
- docs/COPY_PACK.md:206:       "n": 2,
- docs/COPY_PACK.md:207:       "headline": "Terra + Aqua: +5.3% detections",
- docs/COPY_PACK.md:211:       "n": 3,
- docs/COPY_PACK.md:212:       "headline": "Selection gap: 449.8 percentage points",
- docs/COPY_PACK.md:216:       "n": 4,
- docs/COPY_PACK.md:220:       "n": 5,
- docs/COPY_PACK.md:221:       "headline": "S-NPP delivery ended 2 Nov 2026"
- docs/COPY_PACK.md:225:     "gap_ge_10pp": "Recorded change, Punjab + Haryana, {a} → {b}: all included satellites, {w}%; {shared_label}, {u}%; difference, {d} percentage points. Neither percentage is a corrected estimate of fire activity, and the difference is not a causal attribution. Actual-fire change is not measured.",
- docs/COPY_PACK.md:226:     "gap_lt_10pp": "Recorded change, Punjab + Haryana, {a} → {b}: all included satellites, {w}%; {shared_label}, {u}%; difference, {d} percentage points. A small selection gap does not prove that either percentage measures actual fire activity. Neither percentage is a corrected estimate of fire activity. Actual-fire change is not measured.",
- docs/COPY_PACK.md:227:     "interruption": "Recorded change, Punjab + Haryana, 2025 → 2026: all included satellites, −20.7%; Terra+Aqua+Suomi NPP+NOAA-20, −20.7%. The two views coincide because the same four satellites are included in both seasons, so the decomposition cannot show the interruption. The included-satellite record is interrupted: S-NPP contributions run 1 Oct – 2 Nov, and zero from 3 Nov, while NOAA-20 continues. Actual-fire change is not measured.",
- docs/COPY_PACK.md:240:       "NOAA-20",
- docs/COPY_PACK.md:241:       "NOAA-21"
- docs/COPY_PACK.md:244:   "test_notes": "Gate 7 scorecard fields: pass/fail, verbatim quote, time_to_answer. Automatic fail: treating 5.3% as the true or corrected fire change. Question: 'What does that number not tell us about the actual fires?' Expected substance: actual-fire change is not measured. Why not ask the app's own reviewer?"

The original VM numbers remain only in the immutable validation reference,
reference regression fixtures, historical reference implementation, and prior
progress entries. Canonical app copy is regenerated everywhere.

## FREEZE commit recorded - DONE

2026-11-15 10:32:07 IST - Frozen commit: `b9bb718cd15d69014c32e9fd1cfef0b24fa7f752`.
Status: DONE for archive extension, canonical audit freeze, gate amendments,
and all dependent numerical copy. Tests: 22 passed; independent subset checks,
acceptance lines, JSON copy consistency, and staged credential/scope checks passed.
Code review: standards and spec passed under the explicit Arlo gate decision.
All 26 standardized season totals match VM exactly. The full preset table,
locked acceptance lines, gate rationale, and file/line inventory are above.
App: frontend/audit.json, status FROZEN - repo pipeline.
No raw CSV or .env committed. Push: authorized, normal push pending this log commit.

## Gate 2 coverage and provenance corrections

2026-11-15 10:59:35 IST - Codex, GPT-6.1 Sol (effort not exposed).
The original acceptance criterion failed; revised comparison metrics were adopted after examining the failure.
Cross-check claim: equal seasonal row counts in both implementations;
not a record-level exact match. Grid-divergence cause remains unknown;
the VM comparison is archived as a sensitivity note, not a proven explanation.

Re-pulled all three 2026 NRT sources for Nov10-15 using fetch_firms.py.
Nov14 raw MODIS 0->41, NOAA20 103->122; cell-days89->134.
Neighbouring Nov12/13 counts100/325 bracket134. This supports a complete-looking
retrieved snapshot, not a guarantee of orbital or cloud completeness.
Common verified cutoff Nov14; one partial Nov15 MODIS row is unverified and
excluded. Daily Nov15 values are null, never ordinary zero. Canonical
2026 standardized rows16241, events14341. Only2026 was restandardized/rebuilt.
P3 common Oct1-Nov14:2025 W=U17712,2026 W=U14341,C=0; change
-19.032294489611566%, display -19.0%, not the approximate -19.3% expectation.
P1/P2 frozen objects and every historical daily series are unchanged.
JSON includes retrieval timestamp/scope, interval, coverage/cutoffs, product
and source lists, grid/bbox. E means .403/.252/.086 refer to transitions
2018->2019 through2024->2025, mean |Delta J|; archived reference-implementation
results, not rerun on canonical data. Single-sensor series are recorded
cell-days and must never be stacked as components of W.
Legacy2026 method-check calendars were labelled archived; Nov15 values
set null. No legacy method code changed. All dependent current copy updated.
Evidence: coverage_retrieval.json and coverage_verification.json.
Tests:24passed; P1/P2 invariance, cutoff, identities and acceptance copy verified.
Status: verified, committing; actual correction SHA recorded in following entry.

Locked P3 acceptance line:

Recorded change, Punjab + Haryana, 2025 → 2026: all included satellites, −19.0%; Terra+Aqua+Suomi NPP+NOAA-20, −19.0%. Both periods cover Oct 1 through Nov 14; Nov 15 is excluded from this comparison, and 2026 Nov 15 is unverified, not yet retrieved. The two views coincide because the same four satellites are included in both seasons, so the decomposition cannot show the interruption. The included-satellite record is interrupted: S-NPP recorded cell-days run 1 Oct – 2 Nov, and zero from 3 Nov, while NOAA-20 continues. Actual-fire change is not measured.

### Coverage correction commit recorded

2026-11-15 11:00:47 IST - Correction SHA: `a7d9cc141ebc96fb130c74b32c2f11f67a19adae`.
Status: DONE. 24 tests passed; standards/spec reviews passed after correcting
the stale J ranges to match the archived amended values. P1/P2 unchanged.
Common-interval P3 W=U:17,712->14,341 (-19.0%), C0/0.
Evidence and acceptance line recorded above. Normal push authorized.

## Project-page draft and frozen-value sweep

2026-11-15 11:07:04 IST - Codex, GPT-6.1 Sol (effort not exposed).
PROJECT_PAGE uses approved passages verbatim, frozen preset counts and
qualifications, approximately1km pipeline cells, and1601380retrieved/1482211retained.
Sweep changed only docs/AUDIT_SPEC.md:39 (1601319->1601380).
README and COPY_PACK needed no changes; validation spatial blocks untouched.
Approved text/banned-phrase/frozen-total checks passed. Full suite:24passed.
Status: verified, committing. Commit locator: git log -1 -- docs/PROJECT_PAGE.md.

## Gate 7 usability kit prepared

2026-11-15 11:09:59 IST - Codex, GPT-6.1 Sol (effort not exposed).
Created docs/GATE7.md with COPY_PACK section7 script/rules verbatim,
setup/timer/evidence-download checks, two tester scorecard rows and fail/retest
protocol. Kit status NOT RUN: Gate7 is not passed and demo capture remains
blocked until two qualifying unaided first-exposure non-builder passes.
Verification: source block exact; full suite24passed. Commit locator:
git log -1 -- docs/GATE7.md. Status: kit prepared; usability run NOT STARTED.

## Repo restructure: backend/ and frontend/ split

2026-11-15 IST - Claude Code. Moved scripts/, tests/, data/, requirements.txt
and audit_reference.py (now backend/scripts/audit_reference.py) under backend/.
Removed empty backend/app. audit.py now writes ../frontend/audit.json from
backend/. Added backend/.env (gitignored) and backend/.env.example. Updated
.gitignore and path references in README, CLAUDE, AGENTS and docs; historical
entries in this log and TEAM_BRIEF keep old paths. Tests: 24 passed, run from
backend/ with python -m pytest -q. Commit locator: git log -1 -- backend/scripts/audit.py.
Status: DONE. Not pushed.

## Frontend Phase 1 (shape): shell, conclusion renderer, coverage strip

2026-11-15 10:49 IST - Claude Code, Sonnet 5.5 (medium effort), per the build plan.
Added frontend/index.html, app.css, app.js and tests/conclusion.test.js.
Header, docket bar, coverage strip, preset tabs, one staged headline with
fleet switch, chips, snapshot section (P3), U/C/W table, FINDING, permanent
shared warning, footer. Fig. 1/Fig. 2, case study, method checks and the
download are labelled placeholders for Phase 2. Conclusion lines are rendered
by rule and byte-match the three frozen strings.
Checks: node --test frontend/tests/conclusion.test.js 11 passed; audit.json
sha256 unchanged (faee77abdc0570326ebe43567cbb1ead19d184646565945a0cd460faf44555ae (committed LF blob; the CRLF working copy hashes differently));
hardcoded-number grep empty; banned-word grep empty; no external requests;
3 presets x 2 views render with no console errors; 360px no horizontal scroll.
Code review (low) findings fixed: snapshot dates derived from data, load-time
field validation extended, false "1 Oct" start guarded, dead parameter removed.
Commit locator: git log -1 -- frontend/app.js. Status: DONE. Not pushed. Not deployed.

## Frontend Phase 2 (craft): figures, case study, method checks, downloads

2026-11-15 IST - Claude Code, Sonnet 5.5 (medium effort), per the build plan.
Added Fig. 1 paired calendars (shared square-root heat scale, ghost-cell hatching,
unverified and excluded cells distinct without colour, legend, click readout, daily
table), Fig. 2 cumulative curves with the C gap, section 2.0 case study (fleet strata,
single-sensor daily strips, cessation line, all derived from audit.json), Appendix A
method checks rendered from method_checks, and the evidence download (report .md and
daily CSV, pure generator, same state as the screen).
Checks: node --test frontend/tests/conclusion.test.js and evidence.test.js 26 passed
(CSV column sums equal preset W/U/C for all 3 presets, P3 has 45 rows, report holds the
exact FINDING string, malformed data gives no numbers). Blob files fetched in the
browser and parsed: sums and FINDING match the screen for P1, P2, P3. Malformed
scratch copy (null W_b, missing predictor, tampered daily) and a missing audit.json
show error states with no fabricated numbers. audit.json sha256 unchanged
(faee77abdc0570326ebe43567cbb1ead19d184646565945a0cd460faf44555ae (committed LF blob; the CRLF working copy hashes differently)). Banned-word,
hardcoded-number and external-request greps clean. 360px: no horizontal scroll.
Code review (low): 4 findings (unguarded coverage fields), fixed.
Commit locator: git log -1 -- frontend/app.js. Status: DONE. Not pushed. Not deployed.

## Frontend Phase 3 (harden): deployed app verified

2026-11-15 IST - Claude Code, Sonnet 5.5 (medium effort) with three Haiku sweep subagents.
Deployed URL: https://ghost-fleet-chads2.vercel.app/ (Root Directory frontend/, no build).
Deployed commit: 1350181 (live app.js and audit.json hashes equal the repo blobs).
audit.json sha256 (committed LF blob, verified with git show HEAD:frontend/audit.json):
faee77abdc0570326ebe43567cbb1ead19d184646565945a0cd460faf44555ae, unchanged. Earlier
entries had the CRLF working-copy hash; corrected above.
Sweeps: language-law grep clean (only negated uses of "corrected"; the frozen tagline
"Dead satellites, honest calendars." is kept as specified, flagged for Anmol); external
requests: only local css/js, relative audit.json fetch, footer anchors; number
cross-check: three conclusion lines byte-match, 26/26 node tests pass.
Deployed browser run (agent-browser, signed-out) at 1280px and 390px: 3 presets x both
fleet views show +455.2/+5.3, +99.0/+11.4, -19.0/-19.0 with denominators; warning shown
in the shared view; 3 figures, download button enabled (report + CSV links), method
checks and 4 case-study strips render; scrollWidth equals clientWidth; footer line present.
Hostile readings: "fires rose 455.2%" and "real rise was 5.3%" are met by the denominator
line "recorded cell-days", the permanent warning and the FINDING tail; "caused 449.8
points" by "selection difference, not a causal attribution"; "app corrects the record" by
the approved claim and "Neither percentage is a corrected estimate"; "2026 fires fell
19.0%" by the P3 interruption template and snapshot banner; "S-NPP died" by "data delivery
ceased" (no "died" anywhere). No copy changes were needed.
Not done by the build: Gate 7 usability (human only), the under-2-minute timing, phone
hardware check. URL filled in PROJECT_PAGE.md and GATE7.md; SUBMISSION_CHECKLIST Gates 1,
2, 5 updated as frontend verified. Status: DONE. Not pushed.

## Frontend Phase 4 (polish): dossier styling

2026-11-15 IST - Claude Code, Sonnet 5.5 (medium effort), /impeccable polish, CSS only.
Rewrote frontend/app.css inside the frozen design system (same palette, system fonts,
no gradients except the hatch pattern that already marks ghost cells). No copy, number,
or markup changes (index.html and app.js untouched). Changes: report-cover masthead with
heavy bar, ink docket as ruled field cells, vermilion numbered sections under 4px rules,
coverage as a ruled form, index-style preset tabs and a segmented fleet switch, result
panel with the headline number beside its denominator definition, caution-stripe shared
warning, mono tabular-nums table with slashed zeros, caption-bar figures, calendar rhythm
and legend box, FINDING sealed box with an ink tab, ink colophon footer, short fade/lift
on headline, calendars and curves when the selection changes (disabled under
prefers-reduced-motion), themed selection, caret, scrollbar and accent colour, removed the
thick coloured side borders, print stylesheet.
Checks: 26/26 node tests pass; banned-word, hardcoded-number and external-url greps clean;
audit.json committed blob sha256 faee77ab... unchanged; 1280px and 390px screenshots
reviewed (P1, P3, shared view); no horizontal scroll at 390px.
Not verified: the print stylesheet (print media emulation did not take effect in the
browser tool, so it was written but not seen); no real-device check.
Status: DONE. Not pushed. Not deployed (Vercel redeploys on push).

## Frontend Phase 4b (app console): owner-requested redesign of the layout

2026-11-15 IST - Claude Code, Sonnet 5.5. Owner asked for a more app-like look. This
relaxes the build plan's "one stacked column / no structure change" for desktop only
(mobile stays one column). No copy, number or language-law change.
Changes: sticky app bar with section nav; ink status docket with a live LED; dark desk
with paper sheets; two-column console on desktop (sticky left rail: preset cards, fleet
switch, chips, download, footer line; right stage: headline, composition bars of W/U/C
for both periods on one scale, FINDING as an inverted ink block, snapshot, figures, table);
headline counts to the new value on fleet or preset switch (off under reduced motion);
coverage as a 3-column field grid; case-study strips in two columns. Mobile order: preset
tabs, fleet switch, result, chips, download.
Checks: 26/26 node tests; banned-word, hardcoded-number and external-url greps clean;
deployed-equivalent local run: 3 presets x both views show the frozen values, P3 CSV has
45 rows, download enabled, no horizontal scroll at 1440px and 390px; committed audit.json
blob hash faee77ab... unchanged (app.js, index.html, app.css only).
Not verified: print stylesheet against the new layout, real device. Status: DONE. Not pushed.

## Frontend: Appendix B, the system behind the audit

2026-11-15 IST - Claude Code. Added one static section (id="system", nav "B. System"
after Method checks) to frontend/index.html with the pipeline steps and six stage-fact
lines exactly as supplied; CSS for the section in app.css. No fetch, no interaction, no
change to the comparison, case study, method checks or audit.json.
Checks: node tests 32/32 (26 existing + 6 new in frontend/tests/system.test.js: section
present with nav link, freeze hash equals sha256 of the LF audit.json, both totals match
audit.json dataset_counts, no number outside the supplied list, wording law, static only).
Banned-word grep clean. 360px: scrollWidth 360/360. Status: DONE.

## Frontend: Appendix B shows the pipeline at work

2026-11-15 IST - Claude Code (Opus 5.5). Owner-approved. Each Appendix B pipeline step now
links to its source file on GitHub (backend/scripts/fetch_firms.py, harmonize.py,
audit.py, frontend/audit.json, frontend/app.js) and shows a count rendered from
audit.json: 1,601,380 retrieved, 1,482,211 retained, all-satellite recorded cell-days
summed over the 26 seasons, preset count, schema. Added a "Reproduce it" command block
(commands read from the scripts' entry points and backend/.env.example). Links to the repo
outside the footer are a deliberate, owner-approved exception to the build plan's
footer-only rule; they fetch nothing on load.
Checks: node tests 34/34 (8 in system.test.js: hrefs only to this repo, linked files exist,
cell-days equal an independent sum, null data gives no counts). Banned-word grep clean;
360px scrollWidth 360/360. Backend not modified. Status: DONE. Not pushed.

## Frontend Phase 5 (navigation and first read): OWNER-REQUESTED

2026-11-15 IST - Claude Code (Opus 5.5). Usability only; no section 4 string, conclusion
rendering, number, download logic or audit.json change.
Added: orientation strip above the coverage block (step highlight: start on step 1, step 2
after a preset is picked, step 3 after the fleet switch is used); helper line under the
fleet switch; sticky mini-result under the app bar once the headline scrolls away (preset
name, active fleet label, headline string from the same headlineText() the headline uses,
link to the FINDING); second download button at the end of the comparison calling the same
action as the rail button; scroll-spy on the app bar nav (smooth scroll was already on and
is off under reduced motion; the mini bar has no transition under reduced motion); one-line
W/U/C explainer under the headline joined from the table's own selection labels (table now
uses the same selectionLabels()).
Added strings, verbatim, for owner review:
  "1 · Pick a period" / "2 · Compare both fleets" / "3 · Download the evidence" (owner text)
  "Switching changes only which satellites are counted: all included satellites, or only the satellites present in both periods."
  "Go to the finding"
  W/U/C explainer separator " · " (labels themselves are the existing table labels)
Checks: node tests 38/38 (4 new in nav.test.js: shared headline string, same download
action, explainer from table labels, added strings keep the wording law). Banned-word and
hardcoded-number greps clean; audit.json blob faee77ab... untouched. Smoke at 1280 and
390: steps advance 1 to 2 to 3, mini bar shows +455.2% when the headline is off screen and
hides when back, mini top equals app bar bottom (62/62, 71/71, no overlap), two download
buttons with the same label enabled, scroll-spy marks Method checks, no horizontal scroll.
Reduced motion verified from the CSS rules only, not by emulation. Status: DONE. Not pushed.

## Frontend: owner design feedback (download note links, footer)

2026-11-15 IST - Claude Code (Opus 5.5). OWNER-REQUESTED. Download-note links now underline
in their own text colour instead of vermilion. Removed the footer AI-assistance line from
the app; the AI-use disclosure remains in docs/PROJECT_PAGE.md (Gate 8 lists it for the
submission). Node tests 38/38. Status: DONE. Not pushed.

## Frontend: fix rail clipped under the mini-result bar

2026-11-15 IST - Claude Code (Opus 5.5). Owner-reported. The sticky rail now offsets by the
app bar height plus the mini-result height (CSS variables set from JS), so the rail starts
below the mini bar (1900px check: mini bottom 111, rail top 127). Anchor scroll padding uses
the same offset. Node tests 38/38. Status: DONE. Not pushed.

## Gate 7 — automated usability run (automated agents; human gate still open)

- When: 2026-11-15 19:02–19:04 IST. App: https://ghost-fleet-chads2.vercel.app/ at HEAD 31831f2; audit.json sha256 faee77abdc0570326ebe43567cbb1ead19d184646565945a0cd460faf44555ae (unchanged).
- Protocol: docs/GATE7.md task and follow-up question, verbatim. Testers: two independent automated agents, cold, objective-only briefs, no project context, no pass criteria disclosed, working the rendered page in a real browser. These are NOT human testers; this entry does not mark human Gate 7 as passed. Elapsed times are agent-run durations, not human task times.
- Tester A (~1 min agent run): task complete; evidence report downloaded (ghost-fleet-viirs_transition-2011-2012-report.md); unaided. Verdict: PASS.
  - Paragraph (verbatim): “For Punjab–Haryana, October 1–November 15, recorded active-fire cell-days rose from 13,581 in 2011 to 75,396 in 2012, a +455.2% change when all included satellites are counted, but that headline is qualified by the fleet change: using only the same named satellites present in both years, MODIS Terra and Aqua, the total rose only from 13,581 to 14,303, or +5.3%, and 61,093 of the 2012 cell-days were recorded only by satellites not present in both periods — principally Suomi NPP VIIRS, which was added in 2012 — a 449.8-percentage-point selection difference that the site describes as a selection difference, not a causal attribution, and it states that the actual-fire change was not measured, so the +455.2% figure does not estimate the change in actual burning.”
  - Follow-up (verbatim): “It does not tell us how much actual burning changed — whether fires increased, decreased, or stayed the same in area, number, intensity, or duration — because it counts recorded satellite detections (cell-days) under a changed observing fleet, and the site states that actual-fire change was not measured; the +5.3% same-satellite figure is also a recorded-detection change, not a measure of actual fires.”
  - Deciding quote: “the +5.3% same-satellite figure is also a recorded-detection change, not a measure of actual fires.”
- Tester B (~2 min agent run): task complete; evidence report and daily CSV downloaded (ghost-fleet-viirs_transition-2011-2012-daily.csv); unaided. Verdict: PASS.
  - Paragraph (verbatim): “For Punjab + Haryana over October 1–November 15, recorded active-fire cell-days rose from 13,581 in 2011 to 75,396 in 2012 using all included satellites, a recorded increase of +455.2%, while counting only Terra + Aqua, the satellites present in both years, the total rose from 13,581 to 14,303, or +5.3%, leaving a 449.8-percentage-point difference and 61,093 cell-days recorded only by satellites not present in both periods, principally Suomi NPP VIIRS, which joined in 2012; the page states that neither percentage is a corrected estimate of fire activity, that the difference is not a causal attribution, and that actual-fire change is not measured.”
  - Follow-up (verbatim): “It does not tell us whether, or by how much, actual burning increased, decreased, or stayed the same, because it counts recorded satellite cell-days, not fires, area burned, or fire intensity, and the 2012 total includes a new VIIRS sensor on Suomi NPP that was absent in 2011, so most of the jump reflects added detection capacity rather than a measured change in burning on the ground.”
  - Deciding quote: “neither percentage is a corrected estimate of fire activity… actual-fire change is not measured.”
- Findings: neither tester made the automatic-fail misreading; both evidence files are downloadable (the main button surfaces one file at a time; the separate report/CSV links resolve it); the “?” markers in the 2026 charts were resolved by their caption without assistance; the page rendered fully for both testers.
- Status: automated run 2/2 PASS. Human Gate 7: NOT RUN — remains open per docs/GATE7.md and the seal terms.

## Freeze 2 - contract amendment

- Phase/task: Freeze 2 step 0, authorize isolated appendices before integration.
- Time: 2026-11-15 19:34 IST. Model: GPT-6.1 Sol; effort not exposed.
- Base release: f001216. Freeze deadline: 22:00 IST, 2026-11-15.
- Statistics/checks declared in FREEZE2_BUILD_PACK sections 1-4 before results inspected.
  Source hashes and generators required; optional loads cannot gate presets.
  Arlo's supplied acceptance values are independent reference results; comparing
  repo outputs against them is not a fresh independent execution.
- Hash clarification: pack hash faee77abdc0570326ebe43567cbb1ead19d184646565945a0cd460faf44555ae
  is canonical LF content. Windows CRLF checkout byte hash is
  3b7d0234af40f8b7a12c2fd98e13762ea9efbee678d721d73f640bedc8f4746a.
  Preserve both; no audit.json edits authorized.
- Tests: backend 24/24 and frontend 38/38 green. Initial root-cwd Python
  collection failed after directory relocation; diagnosing-bugs confirmed the
  documented backend cwd resolves imports, with no code changes.
- Status: DONE. Commit: 35f056c (24 Python + 38 frontend tests green).
- Interrupted submission-checklist draft remains preserved in stash; pulled main's
  checklist and progress history take precedence and were not overwritten.

## Freeze 2 A - daily observation ledger

- Amendment completion: 35f056c, DONE; backend 24/24 + frontend 38/38 green.
- Phase/task: A, observed-data export, reproducible union aggregation and isolated UI.
- Time: 2026-11-15 19:38 IST. Model: GPT-6.1 Sol; effort not exposed.
- Tests: TDD red missing generator, green single-cell union/null coverage; red
  missing shared selection, green common-window inclusion; optional-loader red
  missing module then green. Full suite: backend 27/27, frontend 40/40.
- Reproduction: cd backend; ../.venv/Scripts/python.exe scripts/ledger.py.
  1,334 rows; all 26 season W totals match pack section 4 exactly; every exported
  selection matches every frozen daily entry; all hero W/U totals match exactly.
  CSV nulls are empty fields accompanied by unverified status, never numeric zero.
- Sources: standardized parquet, frozen audit, harmonize and generator hashes in
  ledger.json. This run reuses Arlo's independent acceptance values; it is not a
  fresh independent execution by Arlo. Dataset remains the frozen retrieved sample.
- UI: separate optional load; CSV + JSON downloads; wide table scrolls locally.
- Audit: checkout byte hash 3b7d0234af40f8b7a12c2fd98e13762ea9efbee678d721d73f640bedc8f4746a unchanged;
  canonical LF hash faee77abdc0570326ebe43567cbb1ead19d184646565945a0cd460faf44555ae unchanged.
- Status: DONE. Commit: f6fac96 (27 Python + 40 frontend tests green).

- A review: standards 0 hard findings; spec 0 implementation findings.
  Native/browser smoke could not run (browser host unavailable; window activation
  failed). Automated loader isolation is verified; no visual check is claimed.

## Freeze 2 B - acquisition-time appendix

- A completion: f6fac96, DONE; backend 27/27 + frontend 40/40 green. All supplied
  ledger checks reproduced exactly from canonical standardized input.
- Phase/task: B, per-season daytime MODIS acquisition-time distributions.
- Time: 2026-11-15 19:42 IST. Model: GPT-6.1 Sol; effort not exposed.
- TDD: missing generator red, UTC median/quartile/n/day/cutoff fixture green;
  missing timing section red, actual renderer caption/n/missing-data check green.
- Full suite: backend 29/29, frontend 41/41 green. A mistargeted Node command from
  backend could not find frontend tests; rerunning from repo root passed.
- Pack checks: Aqua 2002-2022 medians all within 08:08-08:18; supplied later
  medians and quartiles within tolerance; 2020 Aqua n=13504 and days=44 exact.
  Terra 2022-2026 medians and n match the supplied exact rows. Earlier Terra
  medians range 05:48-06:00; the pack only gives an approximate early-era summary,
  not the full per-season reference table, so no unavailable exact match is claimed.
- 2026 Aqua refreshed repo: median 10:30, Q1 10:21, Q3 10:38, n=4969, days=33.
  Archived pre-correction reference: 10:30 [10:21-10:36], n=4940, days=32.
  These differences are disclosed; no smoothing or drift/count attribution.
- Binding caption copied verbatim. Sample size is a table column; no observations
  is null, not zero. Optional load and errors remain independent of presets.
- Reproduce: cd backend; ../.venv/Scripts/python.exe scripts/timing.py.
  timing.json records parquet, audit and generator source hashes.
- Audit: original byte and LF hashes unchanged. Existing system copy narrowed
  its one-file statement to comparison numbers, acknowledging optional sidecars.
- Status: DONE. Commit: 58ad31f (29 Python + 41 frontend tests green).

- B review: standards 0 findings; spec 0 findings. Both reviewers separately
  recomputed the timing object in memory from canonical parquet/audit: every
  output field and all four provenance hashes match. This is agent reproduction,
  not a claim that Arlo has executed this new release.

## Freeze 2 C - every adjacent-season transition

- B completion: 58ad31f, DONE; backend 29/29 + frontend 41/41 green. B's supplied
  timing checks reproduced within tolerance and reviewers rebuilt every output field.
- Prerequisites: A f6fac96 and B 58ad31f green and committed before C began.
- Phase/task: C, all 25 adjacent-season pairs, no endpoint headline or pair stitching.
- Time: 2026-11-15 19:47 IST. Model: GPT-6.1 Sol; effort not exposed.
- TDD: missing generator red then common-window fixture green; incomplete ledger
  red then explicit rejection green; missing exact-reference guard red then green;
  missing rendered transition section red then all rows/boundary/window/counts green.
- Full suite: backend 33/33, frontend 42/42 green.
- All 25 section 4 rows match exactly: W/U counts, C, displayed changes and gaps.
  Differences use unrounded changes (P1 449.8, not subtraction of display values).
  Final row is Oct 1-Nov 14 in BOTH years, W=U 17712->14341, -19.0%, C=0, 45 days.
- The boundary sentence and 2001 small-base note are visible beside the table.
  Missing/unverified daily ledger entries inside a comparison fail generation.
- Project page: ledger/timing deliverables, exact timing caption and boundary,
  separate NOAA-21 coverage/announcement/pull-entry statements, and exact S-NPP
  snapshot qualification. No causal attribution or actual-fire estimate added.
- Reproduce: cd backend; ../.venv/Scripts/python.exe scripts/transitions.py.
  Separately versioned JSON records ledger, audit and generator dependency hashes.
- Audit: original checkout byte and canonical LF hashes unchanged.
- Status: DONE. Commit: 8bbc60c (33 Python + 42 frontend tests green).

- C review: standards 0 findings; spec 0 findings. Both reviewers independently
  summed frozen audit daily subsets directly, without calling the generator.
  All 25 rows, identities, unrounded gaps and common-window counts match exactly;
  all six source hashes match. This is agent cross-checking, not Arlo sign-off.

- Final reproducibility run (2026-11-15 19:50 IST): reran ledger, timing and
  transitions generators in order. All JSONs and ledger.csv byte-identical;
  audit.json checkout bytes untouched. No source or acceptance values tuned.

## Freeze 2 - release evidence index

- Phase/task: Freeze 2 implementation record, 2026-11-15 19:52 IST.
  Model: GPT-6.1 Sol; effort not exposed.
- Amendment: 35f056c. A: f6fac96. B: 58ad31f. C: 8bbc60c.
- Tested code/data release: 8bbc60c. Backend 33/33; frontend 42/42, green after
  byte-identical regeneration of all optional JSONs and ledger CSV.
- A: all supplied W totals and frozen subset daily counts match exactly.
  B: supplied precise timing checks pass; reviewers rebuilt the complete object.
  C: all 25 exact rows pass; reviewers independently summed frozen daily arrays.
- Source provenance: all sidecar source hashes checked; no secrets staged, no
  legacy pipeline logic edited. Existing untracked root data/ remains untouched.
- audit.json before/after (exact checkout bytes):
  3b7d0234af40f8b7a12c2fd98e13762ea9efbee678d721d73f640bedc8f4746a.
  Canonical LF/Git content before/after:
  faee77abdc0570326ebe43567cbb1ead19d184646565945a0cd460faf44555ae.
- Implementation status: DONE, all three additions green and committed before
  22:00 IST. No addition excluded for a failed supplied numeric check.
- Release checks still open: Arlo's sign-off on this exact release is not recorded;
  existing independent reference values and agent cross-checks are not claimed as
  his execution of this release. Browser smoke was unavailable in this session;
  automated DOM/loader and preset evidence tests passed. Public deployment of the
  new appendices has not been verified. Apply the 22:00 exclusion rule to anything
  still lacking the required release reproduction then; this entry is not that seal.
- Changes are local commits; no push requested for this Freeze 2 task.

## Freeze 2 - publication integration

- Time: 2026-11-15 19:56 IST. Model: GPT-6.1 Sol; effort not exposed.
- Phase/task: integrate origin/main before the owner-requested normal push.
- Fetched incoming commit c00510c (SUBMISSION_PLAN.md only), merged without
  rewriting the five local Freeze 2 task SHAs. Incoming plan preserved exactly.
- Tested implementation: 8bbc60c, carried through local record commit 738d5e0.
  Full post-merge checks: backend 33/33, frontend 42/42 green; audit bytes and
  canonical LF/Git content unchanged. No raw files or secrets staged.
- Review: spec 0 integration findings; standards 0 merge correctness findings.
  Inherited upstream copy at SUBMISSION_PLAN.md line 60 attributes the gap to
  a satellite arrival and lacks the required actual-fire concluding sentence.
  This pre-existing wording is recorded, not silently rewritten by a push task.
- Prior local-only note is superseded by the owner's explicit push request.
- Status: DONE. Merge commit: 549f0f9. Post-merge 33 Python / 42 frontend checks green.
  Publication is the requested next operation; no deployment or Arlo seal is claimed.

## Gate 7 — APPROVED on automated evidence (Arlo sign-off, 2026-11-15 ~19:58 IST)

- Basis: the automated Gate 7-protocol run recorded above (commit a0226e0): two independent cold automated agents, objective-only briefs, no project context, no pass criteria disclosed, working the rendered page — 2/2 PASS, both unaided, evidence downloads verified (report .md in both runs; daily CSV confirmed in Tester B's run), neither made the automatic-fail misreading. Deciding quotes are in that entry. An earlier rendered cold read (2026-11-15 ~18:23 IST) also passed in substance.
- Finding: the comprehension property Gate 7 exists to test is demonstrated on this evidence — an unprepared reader does not walk away believing actual fires rose 455.2%, and can state what the number does not measure.
- Deviation, stated plainly: docs/GATE7.md and the seal terms define Gate 7 as two human non-builders. No human run took place. This approval substitutes the automated evidence for the human run, on the team owner's instruction, with the substitution recorded here rather than concealed.
- Status: Gate 7 APPROVED (automated evidence) — Arlo, 2026-11-15. If a human run is performed later and fails, that result supersedes this approval.
