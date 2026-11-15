# Build brief — binding decisions & amendments (2026-11-15)

This brief closes every open hole in the building plan. It is binding
alongside docs/AUDIT_SPEC.md (design + gates) and docs/COPY_PACK.md
(final copy). Where this brief amends either, this brief wins for the
build; record any conflict in docs/BUILD_PROGRESS.md.

## 1. Data — schema frozen, values reference until freeze

- The app reads ONE file: `frontend/audit.json` (schema "audit-app v1":
  sensors_present, presets, daily, method_checks). Nothing else.
- A REFERENCE version (VM implementation) is committed at that path so
  the frontend can be built immediately. Its values are provisional.
- Freeze: Codex regenerates the same schema from THIS repo's pipeline
  (port of the VM audit logic), diffs presets against AUDIT_SPEC
  references (tolerance: totals 1.5%, changes 2 pp), replaces
  frontend/audit.json wholesale in one commit marked FREEZE in
  BUILD_PROGRESS.md, and records the frozen preset values there.
- After the freeze commit, NO number in the app, page, or demo may come
  from anywhere except the frozen file.

## 2. Deploy — decided

- Host: Vercel. Project root directory: `frontend/`. No build command,
  no framework; output is the static folder as-is.
- Deploy the empty shell FIRST, before building views; write the public
  URL into BUILD_PROGRESS.md in the same hour.
- Fallback if Vercel blocks: GitHub Pages via the static-upload Actions
  workflow on the same `frontend/` folder. Do not redesign for either.

## 3. Tech — zero dependencies

- Vanilla JS + inline SVG only. No CDN, no webfonts, no analytics, no
  external requests of any kind. The app must work from a local file
  server and offline once loaded.
- Layout: one stacked column of panels at every width. Mobile is the
  same stack — there is no separate mobile design pass.

## 4. Conclusion lines — acceptance tests

Gaps are computed from the UNROUNDED integer counts in audit.json;
percentages round only at render. (Example: P2's gap is 86.6 pp from
counts, not 86.5 from subtracting rounded labels.)
COPY_PACK templates are amended: the shared fleet is rendered as
{shared_label} = the preset's shared satellites joined with "+", using
chip names Terra / Aqua / Suomi NPP / NOAA-20 — never hardcoded.
Expected lines from the REFERENCE values (regenerate and re-lock after
freeze; the app output must match the locked lines character-for-
character for all three presets):

P1: "Recorded change, Punjab + Haryana, 2011 → 2012: all included
satellites, +452.5%; Terra+Aqua, +5.4%; difference, 447.1 percentage
points. Neither percentage is a corrected estimate of fire activity,
and the difference is not a causal attribution. Actual-fire change is
not measured."
P2: "Recorded change, Punjab + Haryana, 2017 → 2018: all included
satellites, +97.7%; Terra+Aqua+Suomi NPP, +11.2%; difference, 86.6
percentage points. Neither percentage is a corrected estimate of fire
activity, and the difference is not a causal attribution. Actual-fire
change is not measured."
P3 (interruption template, corrected): "Recorded change, Punjab +
Haryana, 2025 → 2026: all included satellites, −20.5%; Terra+Aqua+
Suomi NPP+NOAA-20, −20.5%. The two views coincide because the same
four satellites are included in both seasons, so the decomposition
cannot show the interruption. The included-satellite record is
interrupted: S-NPP contributions run 1 Oct – 2 Nov, and zero from
3 Nov, while NOAA-20 continues. Actual-fire change is not measured."

## 5. P3 case-study labelling

The daily per-sensor series are single-sensor DETECTION counts. Label
them "S-NPP detections" (etc.), never "events contributed by S-NPP" —
a cell-day in the S-NPP series may also appear in another sensor's.
The cessation fact is about detections: present Oct 1 – Nov 2, zero
from Nov 3.

## 6. Method checks — framing line + corrected ranges

Panel intro (addition beyond COPY_PACK, approved by Arlo 2026-11-15):
"These checks measure how far each proposed correction can be
trusted. None is used as a measurement in this app."
Amendment to AUDIT_SPEC's sensor-addition summary: the addition
excess ranges across 2012–2025 are raw +215% to +544% and degraded
+11% to +177% (the spec's earlier ranges were read from partial
output). Mean steadiness E stands: raw 0.520, degraded 0.216, ratio
0.086.

## 7. Who touches what

- `frontend/` — Shabeeh only. `scripts/`, `data/`, `docs/` — Anmol /
  Codex / Arlo. Pull before every push; plain push only; no force
  pushes today; one topic per commit.
- The conclusion line is rendered by rule from audit.json, never
  hand-typed into HTML. The shared warning under the shared-satellite
  panel is always visible, never dismissible (per COPY_PACK).

## Amendments — Astra post-copy-pack findings (2026-11-15, ~06:50 IST)

Source: Astra's replies to the user after the copy pack. Current score
17/25; the 20/25 commitment for all 8 gates is unchanged; no gate and
no copy was changed. These amendments change STAGING and PRIORITY
only — AUDIT_SPEC gates and COPY_PACK copy stand.

1. **One result, staged as a change.** Never present +452.5% and
   +5.4% as two rival headlines. The comparison is ONE result whose
   value depends on the fleet selection: open on all included
   satellites, then switch the same comparison — same panel, same
   colour scale — to the same named satellites and let the figure
   change. In the demo, the fleet chips visibly change between the
   two numbers (per COPY_PACK narration timing). In the slides,
   S1 → S2 is a transition of one comparison, not two claims. The
   paired calendars and the U/C/W table remain as evidence below
   the headline.
2. **The exceptional test (quality bar above the gates).** A
   genuinely unprepared viewer who watches only the 30-second demo —
   no README, no project page — must be unable to walk away
   believing actual fires rose 452.5%. If the demo needs a document
   to explain it, the demo has failed.
3. **Gate 7 is the critical path.** Astra scores Presentation 2/5
   and ties submission and résumé readiness to a finished demo
   passing Gate 7. Run Gate 7 as soon as the compare view is
   clickable — do not wait for Method checks or the download. Demo
   capture happens AFTER Gate 7 fixes, not before.
4. **Validity points are in the evidence, not the argument.**
   Validity is 3/5 pending demonstrated implementation: the evidence
   download reproducing the screen exactly, and the Method checks
   panel, are score-bearing — never cut them to save time. If time
   compresses, cut in this order: the P3 panel's chart first (keep
   the cessation line and the daily counts), never the download or
   Method checks.
