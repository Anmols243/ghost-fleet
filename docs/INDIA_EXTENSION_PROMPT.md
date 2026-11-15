# Additive geographic extension build prompt (Astra-improved, 2026-11-15 ~20:14 IST)

Implement an optional geographic extension to Ghost Fleet — Fire Trend Audit.
This is an owner-authorized override of the earlier geographic-expansion and
navigation-map cuts. It does not authorize changes to the frozen hero
measurements, language law or evidence requirements.

The release must remain usable and submittable without this extension.

## 1. Read, record and isolate

Read AGENTS.md, CLAUDE.md, AUDIT_SPEC.md, BUILD_BRIEF.md, COPY_PACK.md,
FREEZE2_BUILD_PACK.md, SUBMISSION_CHECKLIST.md and the relevant progress
entries before coding.

Record a new amendment covering:

- The owner's geographic-extension and navigation-map override.
- The separately versioned frontend/india.json.
- The geographic labels and measurement definitions below.
- The independent release checks.
- The 22:30 IST abort deadline.

The current Punjab–Haryana release safe-submits at 21:00 IST first. Include
Freeze 2 appendices only if their independent sign-off and deployment
verification are complete. Do not delay that submission for this extension.

Keep the existing product as the default and preserve a deployable rollback
commit.

Record before/after SHA-256 hashes for audit.json, ledger.json, timing.json,
transitions.json and ledger.csv, where present. Preserve the canonical input
data used to generate them. Do not overwrite those files or rerun existing
generators against newly downloaded data.

Put new raw inputs, manifests, standardized records and outputs in a separate
extension-specific location. They must never enter an existing wildcard
ingestion path accidentally.

Prefer a new generator that reuses established functions over refactoring the
production pipeline tonight. Any necessary parameterization must preserve
existing behaviour and pass its regression checks.

## 2. Geographic contract

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

## 3. Pull contract and provenance

Retrieve only seasons 2011, 2012, 2017, 2018, 2025 and 2026, within the full
rectangle.

Use the canon's source schedule and confidence rules:

- Archive seasons: applicable SP products.
- 2026: NRT products.
- MODIS confidence ≥50.
- VIIRS nominal/high.
- NOAA-21 remains excluded and visibly disclosed.

P1/P2 use October 1–November 15. P3 uses October 1–November 14 in BOTH 2025
and 2026. November 15, 2026 remains unverified/null and excluded, even if a
later request returns partial records for that date.

Use explicit request dates and DAY_RANGE ≤5. Read MAP_KEY from .env only.
Redact it from errors, logs, manifests and public files.

Before a large pull, check source/date availability and applicable
missing-data information. Use bounded retries and respect API transaction
limits. Do not switch products silently if a source is unavailable.

Save a manifest for every requested chunk:

- Source/product and requested bounds.
- Inclusive requested dates.
- Retrieval timestamp.
- Response validation status.
- Row count and content hash.
- Available coverage/missing-data information.
- Any retry or unresolved anomaly.

Validate headers, sensor identities, coordinate bounds and dates. Reject
error bodies returned with HTTP 200. Use non-overlapping date chunks. Prevent
retry-related duplicate ingestion without inventing a new scientific
deduplication rule.

Distinguish:

- Successful retrieval of the requested product interval.
- Known missing product data.
- Zero returned detections.
- Unknown completeness.

Never describe successful retrieval as proof of cloud-free or uninterrupted
observation.

An unresolved missing chunk, unexpected empty response, unavailable required
source or known incompleteness inside a required comparison window blocks
this extension. Do not silently shorten a region's window or remove a sensor
to obtain a result.

## 4. Sensor selections and calculations

Declare satellite selections before inspecting regional outcomes.

Use the frozen comparisons' named satellite sets for each corresponding year.
Do not remove a satellite from a regional selection merely because that
rectangle has zero retained detections from it.

A missing source is different from a successfully retrieved source with zero
detections. Represent that distinction in metadata. Record this selection
policy explicitly for the new layer.

For each rectangle and comparison:

- W: union of cell-days across the period's declared included satellites.
- U: union across the declared shared satellite set.
- C: W − U.
- Changes: calculate from integer totals.
- Gap: subtract unrounded changes.
- Round only for presentation.

Do not sum single-sensor counts to obtain a union. Do not sum the regional
totals to obtain the full-rectangle total.

If a baseline denominator is zero, the percentage and dependent gap are
unavailable/null. Never emit Infinity, NaN or a fabricated zero percentage.
Keep absolute counts visible. Use the appropriate small-gap qualification when
applicable; never label a small gap "agreement."

Include daily W/U/C arrays, explicit dates, comparison intervals, selections,
coverage and provenance in india.json — not only headline totals. Preserve
missing values.

Label this feature:

"Geographic extension: three predefined comparisons across six selected
seasons."

Do not describe it as a continuous record, a six-season trend or an
all-region adjacent-year atlas.

## 5. Mandatory hero compatibility gate

Recompute the Punjab–Haryana subset entirely from the new full-rectangle pull.

Require exact reproduction of:

- Daily W and U arrays over each hero comparison's included dates.
- Daily and total C.
- All three presets' W/U/C totals.
- Unrounded-derived displayed changes and gaps.
- Sensor selections and comparison windows.

Expected totals:

- P1: W 13,581→75,396; U 13,581→14,303; C 0→61,093.
- P2: W 54,291→108,035; U 54,291→60,491; C 0→47,544.
- P3: W=U 17,712→14,341; C=0, October 1–November 14.
- P1 gap remains 449.8 pp.

Any mismatch stops this extension. Diagnose and record whether it arises from
input revisions, retrieval differences, filtering or implementation. Do not
loosen tolerances, replace new-pull records with frozen records, or overwrite
the hero.

The UI continues to load the hero from its original files even after
compatibility succeeds. The duplicate hero result in india.json is
verification evidence, not a replacement data source.

## 6. Navigation map and interface

Build a static inline-SVG locator map with selectable rectangular extents.

Use a documented, appropriately licensed geographic outline stored locally,
with source attribution. Do not invent an India outline from memory. Project
the outline and rectangles through the same coordinate transform.

The map is navigation only:

- Uniform unselected outlines.
- One selected-state highlight.
- No count-based colouring, choropleth legend, proportional symbols or
  density claims.
- No clipping of analytical rectangles to the India outline.

Clearly identify the outline as geographic context, not the counting mask.

Keep the full-extent boundary from intercepting every click. Handle
nested/overlapping rectangles deterministically, including the hero within
the northwest rectangle. Provide an equivalent labelled dropdown or buttons
with keyboard access; the map must not be the only selector.

Default to the unchanged hero. Selecting another region updates its label,
bounds, counts, satellite selections, interval, qualification and downloads
together. Returning to the hero restores its exact existing output.

Do not reuse hardcoded Punjab–Haryana conclusion text for other regions.
Generate region-specific conclusions from reviewed templates while preserving
all qualifications and rounding rules. Keep the original hero acceptance
strings unchanged.

Do not reuse a Punjab–Haryana S-NPP last-detection statement as evidence for
another region. Either generate and independently verify region-specific
snapshot facts or omit that regional narrative. P3's common-window comparison
remains available without inventing a cessation date.

Keep the existing ledger, timing appendix, transition atlas and validation
benchmark explicitly scoped to Punjab–Haryana. Region selection must not
imply those results were recomputed nationally.

The extension must not supply new facts to the frozen demo.

## 7. Isolation and failure behaviour

Do not make hero initialization await india.json.

If india.json is missing, malformed, unsupported, inconsistent with its
manifest or fails validation:

- Do not expose extension choices.
- Preserve the fully functioning hero and its downloads.

If failure occurs while a non-hero region is selected, reset visibly to the
hero; never display hero values beneath a regional label.

No external runtime requests, map tiles, framework or backend service. Only
the additional same-origin static data file is allowed.

Provide region-specific report and daily CSV downloads. Include bounds,
non-administrative geography warning, selections, unit, fixed-grid
definition, products, cutoff, retrieval provenance, missing-data treatment
and the exact displayed conclusion.

## 8. Independent release verification

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

## 9. Abort gate and completion

By 22:30 IST, the extension must be:

- Retrieved and computed.
- Independently reproduced and explicitly approved.
- Deployed.
- Verified on the deployed URL.

"Tests running," "push complete," or "deployment queued" does not pass.

If any required check remains incomplete at 22:30, ship no geographic
extension. Restore the verified safe release and record the abort reason. Do
not extend the deadline or weaken a check to rescue the feature.

Update BUILD_PROGRESS with the owner override, amendment, manifest summary,
independent result, hashes, commits, deployed URL and final SHIP/ABORT
decision.

Report the automated Gate 7 substitution accurately. Do not claim the
original human-comprehension criterion or Astra's original full seal has been
satisfied.

Deliver the verified additive release if it passes; otherwise deliver the
intact safe submission and a concise failure record.
