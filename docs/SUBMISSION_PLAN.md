# Ghost Fleet — Submission-Night Execution Plan

Written 2026-11-15 ~19:25 IST. Governs everything from now to the 23:59 IST
close. Sources: the verified Space Apps form check (19:19 IST), the Astra
plan-review round (~18:44 IST), docs/COPY_PACK.md, docs/PROJECT_PAGE.md,
docs/FREEZE2_BUILD_PACK.md. Where this plan and an older document disagree
about tonight's sequence, this plan wins; the frozen numbers and the language
law never change.

## Verified state at plan time

- App live: https://ghost-fleet-chads2.vercel.app/ — audit.json frozen,
  sha256 faee77abdc0570326ebe43567cbb1ead19d184646565945a0cd460faf44555ae.
- Repo HEAD includes a0226e0 (automated Gate 7-protocol run recorded).
- Gate 7: automated run 2/2 PASS, recorded in BUILD_PROGRESS. Human Gate 7
  NOT RUN — still open; tonight's sequence does not depend on it.
- Demo voiceover ready: demo_voiceover_30s.mp3 (29.2 s, frozen narration).
- Project tab: EMPTY — nothing saved, nothing submitted (verified 19:19 IST).

## Submission mechanics (verified on the site, signed in, read-only)

- Saving is not submitting. "Save Progress" makes content publicly viewable
  immediately; judging requires the "Submit for Judging" click.
- Before the deadline the project can be edited and re-submitted freely:
  "Only your final click on 'Submit for Judging' will be reviewed by judges."
- Hard close: Sunday 2026-11-15, 23:59 IST (Local Event Delhi timezone).
  After it: submission is final, no edits, no exceptions.
- Consequence: the 21:00 submission below is a rollback point, not a point
  of no return. The 23:15 re-submit, if any, is the judged version.

## Timeline

| Time (IST) | Step | Owner |
|---|---|---|
| 19:30–20:15 | Demo capture: real screen capture of the live app per COPY_PACK §2 shot list, frozen narration laid over it. No generated visuals on data screens. Assemble in Clipchamp. | Shabeeh |
| By 20:30 | Demo hosted: upload the ≤30 s video to a public host (YouTube or Drive) with a link that needs no password, permission, or registration. Output of this step: the DEMO LINK. Fallback if capture/assembly is not done by 20:45: the 5-slide deck from COPY_PACK §3, hosted the same way. | Shabeeh |
| 19:30–22:00 | Freeze 2 build, in parallel, from the build pack: contract amendment commit first, then Addition A (daily observation ledger), then Addition B (acquisition-time appendix), then Addition C (transition table) only if A+B are finished and reproduced. Every addition independently reproduced against the pack's §4 acceptance values before integration. | Shabeeh / Codex; reproduction check: Arlo |
| 22:00 | FREEZE 2 FREEZE. Unfinished or unreproduced additions are excluded; the 21:00 submission stands as the final version. | — |
| 21:00 | SAFE SUBMIT: fill every field (field map below), tick both checkboxes, Save Progress, then Submit for Judging. Verify the submitted notification, the public project page, and certificate access on the profile. Record submission time + repo HEAD in BUILD_PROGRESS (rollback anchor). | Anmol |
| 21:00–23:00 | Freeze 2 integration window (only for reproduced additions): push, Vercel auto-deploys, PROJECT_PAGE edits per build pack §5, BUILD_PROGRESS entries per repo protocol. If a push breaks the app: revert to the rollback anchor before doing anything else. | Shabeeh / Arlo |
| 23:15 | FINAL SUBMIT: if any field content changed since 21:00, update, Save Progress, Submit for Judging — this click is the judged version. If nothing changed, the 21:00 submission stands; do not re-click needlessly. | Anmol |
| 23:30 | Verification pass, signed out: project page public and complete; app live with audit.json hash unchanged; demo link plays and is ≤30 s (or deck ≤7 slides); repo public. | Arlo |
| 23:30–23:59 | Buffer. Failures only. No new content. | — |
| After close | Astra seal round with the evidence index (SUBMISSION_CHECKLIST + a0226e0 + submission confirmation). Non-blocking; the missed 18:00 seal timing is already on record. Housekeeping: delete the VM scaffold .env. | Arlo |

## Form field map (exact contents)

- **Project Name:** Ghost Fleet — Fire Trend Audit
- **Summary** (limit 1,500 characters; draft below is ~950):

  "Ghost Fleet — Fire Trend Audit compares active-fire cell-days between
  Punjab–Haryana burning seasons using the same geographic mask, grid, date
  rules, and confidence criteria. It shows the recorded change for all
  included satellites, the change for satellites present in both periods,
  and the difference between them. It does not estimate the change in
  actual burning.

  In 2011→2012 the recorded count rose +455.2% with all satellites, but only
  +5.3% using Terra and Aqua, the satellites present in both periods — a
  449.8-percentage-point difference created by the arrival of Suomi NPP
  VIIRS. In 2025→2026, S-NPP data delivery ceased on 2 November mid-season
  while NOAA-20 continued. A proposed correction method was tested and
  failed its benchmark; it is published in the app as a method check, not
  used as a measurement. All counts are reproducible from the public
  repository."

- **Project Demonstration:** the DEMO LINK from the 20:30 step.
- **Project:** https://ghost-fleet-chads2.vercel.app/
- **Project Details:** the body of docs/PROJECT_PAGE.md (What it does
  through Links and team), unchanged. The sentence "the calendar published
  here uses only the satellites present in both periods" must NOT appear
  anywhere — the app publishes both views and the difference.
- **Use of Super Intelligence (SI):**

  "AI assistants (Claude Code, Codex, and ChatGPT design and verdict
  reviews) were used to build the software and draft text, and an AI voice
  (ElevenLabs) narrates the demo. All data processing is deterministic code
  in the public repository. No AI/ML model is part of the product's
  measurements, and no generative AI produced or altered any data or
  result shown."

- **NASA Data:** Link Text: "NASA FIRMS — Fire Information for Resource
  Management System"; Link Url: https://firms.modaps.eosdis.nasa.gov/
  (verify the URL loads at fill time; FIRMS is the app's sole data source).
- **Space Agency Partner & Other Data:** none — leave empty.
- **Checkboxes:** tick BOTH "Agree to Terms and Conditions" and "Confirm
  All Work is Original" explicitly. (At check time the verification section
  showed a "Complete" badge with both boxes apparently unticked — do not
  rely on the badge; tick them.)

## Hard rules for the night

- Frozen canon only: no new numbers anywhere; audit.json is never modified.
- Language law holds in every field: no corrected counts, no causal claims,
  no "MODIS-equivalent", no "same eyes".
- BUILD_PROGRESS protocol holds: nothing marked DONE without a commit SHA
  and a green run.
- If any step's verification fails, the last verified state is the
  submission. A smaller true submission beats a larger broken one.
