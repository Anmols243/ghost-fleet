# Gate 7 usability test kit

Status: NOT RUN. No usability result is claimed by this kit.

## Purpose and pass condition

Two non-builders must each complete the 2011→2012 preset task unaided
in ≤ 2 minutes: find the recorded change, find its qualification, and
download the evidence. Each must correctly state that the app does not
measure change in actual fires. Treating +5.3% as the true/corrected fire
change is an automatic fail. Both testers must pass before Gate 7 passes.

Sources: COPY_PACK.md section 7 (verbatim below), AUDIT_SPEC.md gate 7,
and BUILD_BRIEF.md's Gate 7/demo-capture sequencing.

## Setup checklist

- [ ] Deployed app URL: [URL]
- [ ] Record tested version/commit and device/browser before the session.
- [ ] Open the deployed app's Compare view and preselect P1: 2011 vs 2012.
      Record the exact preselected route or selection path: [P1 PATH].
- [ ] Select two non-builders who have not seen the project before.
- [ ] Confirm the evidence download works; downloading and using the evidence
      is part of the task, not an optional follow-up.
- [ ] Prepare the scorecard and timer. Start timing at the tester's first click;
      record start and finish times and elapsed seconds. Stop the task at
      120 seconds. Ask the follow-up after completion or at that stop.
- [ ] Read the canonical script exactly. Do not coach, hint, or explain the
      result during the task. If intervention becomes necessary, record it
      and mark the attempt as failing the unaided requirement.
- [ ] Do not reveal the pass/fail criteria or expected interpretation to the
      tester beforehand. The instructions below are for the facilitator.

## Verbatim canonical script and rules

Opening (read aloud):

"This is a test of the app, not of you. Please think aloud. I won't
help unless you're completely stuck."

Task (hand over the device, app open on the compare view):

"Imagine you're an editor checking a claim that fire counts in Punjab
jumped in 2012. Using this app and the downloaded evidence, write a
one-paragraph report on what happened between the 2011 and 2012
seasons."

Follow-up question (after they finish, or at the 120-second stop):

"What does that number not tell us about the actual fires?"

Stop rule: 120 seconds maximum for the task.

Pass: the paragraph reports the recorded change and the shared-satellite
change as detections, and does NOT state or imply that actual fires rose
455.2% or that 5.3% is the true/corrected change; the follow-up answer
names that actual-fire change is not measured.

Fail: treating 5.3% as the true or corrected fire change (automatic
fail); or reporting 455.2% as a change in actual fires; or being unable
to complete the comparison within 120 seconds.

Scorecard fields (record in docs/BUILD_PROGRESS.md per tester):
pass/fail · a verbatim quote of their paragraph's key sentence · time
to answer.

## Scorecard

Copy the full report and follow-up answer exactly; do not summarize or
improve the tester's wording. Preserve failed attempts as well as retests.

Tested URL: [URL]
Version/commit: [COMMIT]
Session date and timezone: [DATE / TIMEZONE]
Device/browser: [DEVICE / BROWSER]
P1 preselection path: [P1 PATH]

| Tester | Name / relation; non-builder and first exposure confirmed | Start–finish time; elapsed seconds | Task completed Y/N; evidence downloaded Y/N; unaided Y/N | One-paragraph report, pasted verbatim | Follow-up answer, verbatim | Pass/fail + exact deciding quote |
|---|---|---|---|---|---|---|
| Tester A | [NAME / RELATION / CONFIRMATIONS] | [START / FINISH / ELAPSED] | [Y/N / Y/N / Y/N] | [PASTE REPORT] | [PASTE ANSWER] | [PASS/FAIL / QUOTE] |
| Tester B | [NAME / RELATION / CONFIRMATIONS] | [START / FINISH / ELAPSED] | [Y/N / Y/N / Y/N] | [PASTE REPORT] | [PASTE ANSWER] | [PASS/FAIL / QUOTE] |

Gate decision: [NOT RUN / FAIL / PASS]
Decision evidence: [BOTH TESTERS' RESULTS]

## Fail protocol and run record

Any fail means Gate 7 has not passed. Record the confusing element and the
exact quote or observed action that exposed it. Fix the app or copy first,
then retest with a fresh tester who has not seen the project. Keep the failed
scorecard and add a new row for each fresh tester; never overwrite evidence.

Demo capture does not start until Gate 7 passes. After the run, copy results
into docs/BUILD_PROGRESS.md: tested URL/version, date/time, tester relation,
start/finish and elapsed time, completion/download/assistance status, full
verbatim report and follow-up answer, pass/fail and deciding quote. For a
failure, also record the confusing element, fix commit, and fresh retest.
Do not mark Gate 7 DONE without the two qualifying passes.
