# Build brief — binding decisions & amendments (2026-11-15)

This brief closes every open hole in the building plan. It is binding
alongside docs/AUDIT_SPEC.md (design + gates) and docs/COPY_PACK.md
(final copy). Where this brief amends either, this brief wins for the
build; record any conflict in docs/BUILD_PROGRESS.md.

## 1. Data - frozen repo values and calibrated validation gate

- The app reads ONE file: frontend/audit.json, schema "audit-app v1";
  status "FROZEN - repo pipeline". The repo pipeline is canonical.
- Compare to the pinned original VM reference, never to previous generated output.
- W and U are measured quantities: each total must be within 1.5% relative.
- Ratios W_b/W_a and U_b/U_a must each be within 1.5% relative.
- C is derived: verify C = W - U exactly per period, and
  |C_repo - C_ref| <= 1.5% of that period's repo W.
- Percentage-point tolerances are superseded: they mis-scale for large ratios.
  Arlo accepted the 2026-11-15 amplification case: P1 totals +0.44/+0.93%,
  W ratio +0.48%, change +2.66 pp. P2 C_b differs by 752, 0.70% of repo W_b.
- Freeze all app data together; record values, acceptance lines and the frozen
  commit SHA in BUILD_PROGRESS.md. All dependent number strings come from the
  frozen file and must change everywhere or nowhere.

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

## 4. Conclusion lines - frozen acceptance tests

Compute percentage changes and diff_pp from unrounded integer counts, then
round only for display. Build shared_label from the preset's shared satellites
using Terra / Aqua / Suomi NPP / NOAA-20 joined by "+".
The following lines are rendered from frontend/audit.json and locked verbatim:

P1: "Recorded change, Punjab + Haryana, 2011 → 2012: all included satellites, +455.2%; Terra+Aqua, +5.3%; difference, 449.8 percentage points. Neither percentage is a corrected estimate of fire activity, and the difference is not a causal attribution. Actual-fire change is not measured."

P2: "Recorded change, Punjab + Haryana, 2017 → 2018: all included satellites, +99.0%; Terra+Aqua+Suomi NPP, +11.4%; difference, 87.6 percentage points. Neither percentage is a corrected estimate of fire activity, and the difference is not a causal attribution. Actual-fire change is not measured."

P3: "Recorded change, Punjab + Haryana, 2025 → 2026: all included satellites, −19.0%; Terra+Aqua+Suomi NPP+NOAA-20, −19.0%. Both periods cover Oct 1 through Nov 14; Nov 15 is excluded from this comparison, and 2026 Nov 15 is unverified, not yet retrieved. The two views coincide because the same four satellites are included in both seasons, so the decomposition cannot show the interruption. The included-satellite record is interrupted: S-NPP recorded cell-days run 1 Oct – 2 Nov, and zero from 3 Nov, while NOAA-20 continues. Actual-fire change is not measured."

## 5. P3 case-study labelling

The daily per-sensor series are single-sensor recorded cell-days, never
"detections". A cell-day may be recorded by multiple sensors: never stack
these series as components of W. W is the union, not their sum.
S-NPP recorded cell-days are present through Nov 2 and zero from Nov 3.
Nov 15, 2026 is unverified / not yet retrieved, represented as null, and
excluded from totals. P3 uses Oct 1-Nov 14 for both 2025 and 2026.

## 6. Method checks — framing line + corrected ranges

Panel intro (addition beyond COPY_PACK, approved by Arlo 2026-11-15):
"These checks measure how far each proposed correction can be
trusted. None is used as a measurement in this app."
Amendment to AUDIT_SPEC's sensor-addition summary: the addition
excess ranges across 2012–2025 are raw +215% to +544% and degraded
+11% to +177% (the spec's earlier ranges were read from partial
output). Common-interval mean E: raw 0.403, degraded 0.252, ratio 0.086.
Formula: mean |J[t] - J[t-1]| over transitions 2018->2019 through
2024->2025. These are archived reference-implementation results, not
rerun on canonical data; the earlier mixed-period E summary is superseded.

## 7. Who touches what

- `frontend/` — Shabeeh only. `backend/`, `docs/` — Anmol /
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

1. **One result, staged as a change.** Never present +455.2% and
   +5.3% as two rival headlines. The comparison is ONE result whose
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
   believing actual fires rose 455.2%. If the demo needs a document
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

## Freeze 2 contract amendment (2026-11-15, before integration)

The three-preset hero contract remains frozen. Separately versioned optional
appendices are now authorized by docs/FREEZE2_BUILD_PACK.md: ledger.json,
timing.json and transitions.json, each with source hashes and a reproducible
generator. This supersedes the ONE-file restriction only for these appendices.
Their statistics and acceptance checks are defined in that pack before inspection;
independent acceptance values are attributed to Arlo, not a new independent run.
Each appendix renders only after its own file loads. Presets never depend on it.
Record the exact release checked in BUILD_PROGRESS.md. Freeze is 22:00 IST today:
anything not finished, reproduced and committed then is excluded.

Frozen audit.json: canonical LF sha256
faee77abdc0570326ebe43567cbb1ead19d184646565945a0cd460faf44555ae.
This Windows checkout uses CRLF: its byte sha256 is
3b7d0234af40f8b7a12c2fd98e13762ea9efbee678d721d73f640bedc8f4746a.
These identify the same Git content; preserve both the Git blob and checkout bytes.
No hero values, coverage rules or language law change. The owner-requested
appendix integration is an exception to section 7's frontend ownership boundary.

## Geographic-extension amendment - owner override (2026-11-15)

Authority: docs/INDIA_EXTENSION_PROMPT.md sections 1-2 and 8-9, explicitly
requested by the owner. This overrides earlier geographic-expansion and
navigation-map cuts, and permits a new generator reusing established functions.
It does not override frozen hero measurements, language law or evidence rules.
The optional, separately versioned frontend/india.json must not gate hero startup.
Keep the original hero as default, with its existing sources and downloads.
A missing, malformed or invalid extension must leave the hero functional;
never display hero values under a regional label. Existing appendices remain
scoped to the frozen study rectangle.

The existing release safe-submits at 21:00 IST first; do not delay it for this
extension. Include Freeze 2 appendices only with independent sign-off and verified
deployment. Preserve rollback candidate f246dbe and its canonical inputs. This
amendment does not claim that deployment or submission has been verified.

Isolation: extensions/india/data/{raw,manifests,standardized,outputs}/ only for new
inputs and work products. None is inside backend/data/raw/*.csv, the current
wildcard ingestion path. Never repoint or rerun existing generators against new
inputs; never overwrite frontend/audit.json, ledger.json, timing.json,
transitions.json or ledger.csv. Record exact-byte before/after hashes in
BUILD_PROGRESS.md; canonical text hashes may additionally be recorded with
an explicit newline convention. Do not add extension pulls or keys to Git.
Only a validated published output may later become frontend/india.json.

Binding geographic labels, bounds, coordinate filtering and fixed-grid contract
(reproduced from prompt section 2; no generation is authorized by this setup task):


Coordinates are [west, south, east, north].

Implement these seven selector entries:

| ID | Visible label | Bounds |
|---|---|---|
| hero | Punjab–Haryana — frozen study rectangle | [73.8, 27.6, 77.6, 32.6] |
| full_extent | India & surrounding area — full rectangle | [68.0, 6.5, 97.5, 37.5] |
| northwest | Northwest / Indo-Gangetic study rectangle | [68.0, 24.0, 88.5, 37.5] |
| northeast | Northeast study rectangle | [88.5, 21.5, 97.5, 30.0] |
| central | Central rectangle | [74.0, 17.5, 88.5, 24.0] |
| western | Western rectangle | [68.0, 17.5, 74.0, 24.0] |
| peninsular | Peninsular study rectangle | [72.5, 6.5, 88.5, 17.5] |

These are analyst-selected rectangular extents, not administrative
boundaries, ecological classifications or a partition of India.

Show this qualification beside the geographic selector and include it in
downloads:

"Study rectangles may include neighbouring countries and do not partition
India. The full-rectangle result is computed directly, not by adding regional
results."

Never label the full-rectangle counts as India's national counts.

Define the coordinate inclusion predicate before generation and use it
identically in production and independent checks. Preserve the canonical hero
boundary convention. Document shared-edge membership; do not imply
disjointness.

Filter standardized detection coordinates to each rectangle BEFORE
constructing its cell-day unions. Do not select regions by clipping
already-aggregated cell centroids.

Keep the existing grid unchanged for every rectangle:

- Origin: longitude 73.8, latitude 27.6.
- Reference latitude: 30.1°.
- Earth radius and formulas: exactly as in the canonical pipeline.
- Cell indices: mathematical floor, including negative coordinates.

Do not re-anchor the grid at each rectangle's southwest corner or replace
floor with truncation. Do not substitute an equal-area projection tonight.

Disclose that this is the canonical fixed grid, approximately 1 km at its
reference latitude; physical cell dimensions vary across the expanded latitude
range. Do not report equal-area density comparisons between regions.

Binding independent and deployed release checks (prompt section 8):


Green builder tests alone do not authorize release.

Arlo independently reproduces the exact release from the pinned new input
snapshot without calling the production aggregation functions.

Required checks:

- Manifest covers every required source/chunk; no unresolved retrieval
  anomaly.
- Confidence filtering, date windows, rectangle membership and grid
  assignment agree.
- Every daily W/U/C value and total agrees exactly for all seven rectangles
  × three comparisons.
- All percentage and gap displays reproduce from unrounded counts.
- U is a subset of W at cell-day level; C is the actual set difference.
- Zero denominators and null observations remain unavailable.
- Hero compatibility passes exactly.
- Frozen hero and Freeze 2 file hashes are unchanged.
- Independent boundary fixtures cover points inside/outside/on rectangle
  edges, negative grid indices, overlapping sensor detections, missing chunks
  and legitimate zero counts.
- Full-rectangle results are recomputed directly, never assembled from
  subregions.

Record input hashes, generator/checker versions, output hash, tested commit
and Arlo's explicit sign-off.

Then verify the deployed candidate:

- All seven selections × all three cases on desktop and mobile.
- Correct captions, map selection, keyboard controls and no clipping.
- Correct exported reports and CSVs.
- Failure injection for missing/malformed india.json leaves the hero
  functional.
- No external application requests or uncaught errors.
- Deployed data hash matches the independently approved file.
- Frozen hero conclusions and downloads remain unchanged.

Abort gate: by 22:30 IST on 2026-11-15 the extension must be retrieved,
computed, independently reproduced, explicitly approved by Arlo, deployed and
verified at the deployed URL. Builder tests, a push or queued deployment alone
never pass. If any required check is incomplete, ship no extension, restore the
verified safe release and record ABORT plus reason. Do not extend the deadline
or weaken the checks. Record pinned input hashes, manifest summary, checker and
generator versions, output hash, tested commit, sign-off, URL and SHIP/ABORT.
No geographic results, availability checks or release approval are claimed here.
