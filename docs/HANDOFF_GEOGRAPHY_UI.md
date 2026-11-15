# Handoff: geographic UI, sections 6 and 7

Prepared 2026-11-15 21:42 IST. User requested a handoff at the context limit.
Workspace: `D:\Projects\ghost-fleet`, PowerShell. Model: GPT-6.1 Sol;
runtime effort is not exposed. **UI work is uncommitted, not code-reviewed,
not pushed and not deployed. Preserve it.**

## Resume objective and governing rules

Finish the user's sections 6/7 request in `docs/INDIA_EXTENSION_PROMPT.md`:
licensed local outline + inline-SVG navigation, seven accessible rectangle choices,
same comparison layout with regional conclusions/evidence, exact unchanged hero,
explicit Punjab–Haryana scope on existing appendices, isolated optional failures.
Final requested report: status, test counts, commit SHA and rechecked hero hashes.

Read the latest user-provided AGENTS instructions and canonical docs in order:
AUDIT_SPEC, BUILD_BRIEF, COPY_PACK, METHOD, INDIA_EXTENSION_PROMPT. The owner's
geographic override permits this feature despite the older geographic cuts.
Use tdd, diagnosing-bugs for failures, code-review before every commit and
verification-before-completion. The code-review skill requires Standards and Spec
review agents. No commit until full suites are green; update BUILD_PROGRESS with
IST time, model/effort, tests and actual task SHA. Do not commit credentials/raw CSVs.

**22:30 IST abort deadline:** all independent approval, deployment and deployed
verification gates must pass to ship the geographic extension. Local tests alone
are not a release approval. Preserve the safe hero. No Arlo sign-off is recorded.
Do not claim deployment or the original human Gate 7 has passed.

## Committed data prerequisites (already done)

- HEAD before UI work: `73dd04c` (progress record).
- `f897b17`: generator `backend/scripts/india_audit.py`, exact hero gate, all 21
  comparisons in `frontend/india.json`, identical isolated output and compatibility report.
- `ee9bbba` / `dfeb7f4`: section 3 pull and progress record. 132 chunks, 692393 raw
  rows; 634171 standardized rows. New inputs stay under `extensions/india/data/`.
- Both earlier stop records and owner resolutions are preserved. Expected S-NPP
  cessation and all 102 logged outages are disclosed, non-blocking states.
- Hero matched exactly in 73 checks; independent supplementary agent math/set
  recomputation matched 21 comparisons / 5943 assertions. This is not Arlo approval.
- Do not rerun data generators unnecessarily: candidate hashes are pinned in UI.

## Current uncommitted implementation

Modified tracked files:

- `.gitignore`: adds `node_modules/` exclusion.
- `frontend/app.js`: optional `window.GhostFleetUI` bridge, separate original hero
  and regional state, shared comparison renderer with regional conclusion/evidence/
  series hooks. Hero pure helpers/conclusion templates stay unchanged. Regional
  view hides the hero claim/docket and omits the hero S-NPP snapshot. Returning
  to hero uses its original audit and evidence. Optional ready callbacks are caught
  independently so they cannot trigger the hero's audit-load error handler.
- `frontend/index.html`: initially hidden geographic selector and inline locator SVG;
  attribution and context/not-mask description; labelled buttons are generated only
  after valid data. Case study/method/system panels explicitly scoped to hero.
- `frontend/app.css`: locator/selector responsive styles, fixed unselected outlines,
  one selected outline; no count-driven styling, no clips/masks.
- `frontend/appendices.js`: explicitly labels loaded appendices Punjab–Haryana-only.

New untracked files that belong to this work:

- `frontend/geography.js`: optional module, pinned data SHA and pull-manifest SHA;
  validates schema, geography, named sets, coverage, daily/totals, percentages and
  exact hero data. Fetches only same-origin india.json, verifies canonical-LF SHA256.
  Regional adapter reuses existing calendars/curves/table renderer. It builds its
  own regional conclusions and report/CSV metadata, never hero last-detection text.
  Controller defaults to hero, exposes no choices on bad data, catches failures,
  hides choices and visibly resets hero after a selected-region refresh failure.
  Refresh button is wired; no periodic external requests.
- `frontend/assets/india-outline.geojson`: extracted IND feature, unchanged geometry.
- `frontend/assets/INDIA_OUTLINE_LICENSE.md`: Natural Earth public-domain attribution,
  pinned source URL/commit and input/output hashes.
- `frontend/package.json`, `frontend/package-lock.json`: **development-only** LinkeDOM
  0.18.15 for real DOM tests. No runtime dependency/framework/CDN was added.
- `frontend/tests/geography.test.js`: 7 pure/controller/bridge tests.
- `frontend/tests/geography-dom.test.js`: 4 tests running actual HTML/app/geography
  through LinkeDOM. Network and Blob URLs are test seams, not real requests.

Do NOT stage/delete the unrelated, pre-existing untracked root `data/` folder.
`frontend/node_modules/` is ignored. No UI files are staged as of handoff.

## Geometry and interaction details

- Natural Earth official repository commit:
  `ca96624a56bd078437bca8184e78163e5039ad19`.
- Source URL and licence are recorded in assets/INDIA_OUTLINE_LICENSE.md.
- Extracted feature SHA256:
  `98235f4c2e8b667bfff18e6041ee64907c14bfb327cf72c8083773df572707c6`.
- Locator transform: x = 20 + (lon - 68)*20;
  y = 20 + (37.5 - lat)*20; viewBox `0 0 630 660`.
  This is navigation geometry, not the analytical grid.
- Outline path was generated from local GeoJSON with the same exported `project()`
  used for rectangles. Coordinates formatted with JS `toFixed(3)`.
- SVG children have pointer-events disabled; SVG itself handles clicks by inverse
  transform. `hitTest` chooses smallest containing rectangle, ties by ID. Hero wins
  within northwest; full rectangle only wins where no smaller extent contains point.
- Seven native labelled buttons with aria-pressed provide keyboard equivalent.
- Regional P3 pads layout outside 45 included days with null; 2025 Nov 15 is
  excluded/not in extension input, 2026 Nov 15 is unverified. No invented zeros.

## Fresh verification at handoff

At 21:42 IST, both commands completed successfully:

```powershell
# From repo root:
node --test frontend/tests/*.test.js
# 53 passed, 0 failed

# From backend/:
..\.venv\Scripts\python.exe -m pytest -q
# 45 passed
```

For a fresh checkout: `npm ci --prefix frontend` before Node tests.

Covered mechanically:

- Schema/provenance/region bounds and hero daily validation, data hash mismatch.
- Region-specific conclusions/evidence for all six non-hero regions × three presets;
  CSV sums reproduce all totals and exact displayed conclusion is in both files.
- Map projection and deterministic nested/full-extent hit testing.
- Missing/malformed/pending optional data, reset-after-selected-region failure.
- Adapter P3 excluded/unverified treatment.
- Hero initialization requests audit.json without awaiting/requesting india.json.
- DOM tests: seven native choices/default hero, all six non-hero P1 layouts/downloads,
  exact P1 hero report restoration, missing/malformed files, visible reset on refresh,
  and optional ready callback exception isolation.
- Existing frozen hero conclusion/evidence regression tests remain green.

The last fix: a DOM test proved a throwing optional ready callback could reach
the hero's `.catch` and erase its rendered finding. `notifyOptionalReady()` now
catches it; regression is green. Another test-harness race was fixed by awaiting
the actual async DOM condition, rather than a fixed number of setImmediate turns.

## Work left before completion

1. Review the full diff and fill remaining DOM acceptance coverage:
   - Exercise all three presets and both fleet views for every region in the
     real DOM, especially regional P3 snapshot absence and current report/CSV.
   - Verify map clicks (not only pure hitTest), one selected highlight, buttons'
     pressed state, projected SVG rectangles, and exact outline path vs local source.
   - Failure injection for schema unsupported, manifest/hash mismatch and renderer
     exception after selecting a region; initial and refresh paths.
   - Null/zero-baseline regional conclusion/evidence edge cases (pure logic).
2. Consider testing/guarding active-region preset/fleet re-render errors: controller
   catches region selection/refresh errors, but existing app preset/fleet callbacks
   currently call `render()` directly. Ensure a runtime region-render error there
   cannot strand a mislabeled view; add a failing test before any code fix.
3. Attempt real desktop/mobile visual/browser smoke if tools work. Earlier session's
   browser host was unavailable and native Brave window activation failed; no
   real-browser check of this UI has been done. LinkeDOM is mechanical DOM evidence,
   not layout/keyboard-browser/deployment proof. Do not claim visual checks passed.
4. Code-review skill: launch fresh Standards + Spec reviews of all UI changes and
   assets/licence/DOM tests. None has reviewed this UI yet. Fix findings with TDD.
5. Update BUILD_PROGRESS with this UI task, IST time, model/effort, final tests,
   SHA and status; commit only scoped changes when green. Existing workflow uses
   a task commit then a reviewed log-finalization commit to record its actual SHA.
6. Recheck all five frozen hashes and india data hash; run full suites again.
7. Report status + test counts + SHA + hashes. No push/deploy has been requested
   in this UI prompt; independent §8 approval/deployed checks are still required
   before a SHIP decision. Honour 22:30 abort gate.

## Frozen file hashes (exact checkout bytes, rechecked at handoff)

```text
audit.json
3b7d0234af40f8b7a12c2fd98e13762ea9efbee678d721d73f640bedc8f4746a
ledger.json
5fb062165d3b8943e04aab94c1d56ad1bef01ee67690f1ff1738ac9d70e16255
timing.json
3c658ea3a623265549fcafd9ce9049960de4692e0366bcb1c4dd56eef7330fd0
transitions.json
3e8e372d69c3ae915182d5d6c8fc7c8c6faeaf470362d68b0e0c84a95e936218
ledger.csv
d9083232d71b42763673febd4a6357f4b06c78de7b2db8b277fb4aa52483d8ef
india.json
84ec208e58718fcabeab40d974273f9a401b948dadc582e585861ad529a46b41
```

audit.json canonical LF/Git hash is
`faee77abdc0570326ebe43567cbb1ead19d184646565945a0cd460faf44555ae`.
The different exact-byte hash above is Windows CRLF only. The optional loader
normalizes CRLF before checking india.json against its pinned canonical LF hash.

No long-running local servers or generators were launched for this UI task.
No UI commit, review-agent work, push, deployment or independent release approval
is in progress. Earlier completed data-review agents need not be reused.
