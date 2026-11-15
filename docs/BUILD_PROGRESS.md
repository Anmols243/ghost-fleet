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
