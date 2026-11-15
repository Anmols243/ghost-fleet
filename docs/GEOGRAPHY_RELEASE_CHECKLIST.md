# Geographic extension: deployed-candidate checklist (sections 8 and 9)

Status: PREPARED by the builder. Not run against the deployed URL as a release check. Release is NOT authorized by this file: SHIP/ABORT stays PENDING Arlo's independent reproduction and sign-off (docs/INDIA_EXTENSION_PROMPT.md section 8).

Candidate under test: https://ghost-fleet-chads2.vercel.app/ at the commit recorded in docs/BUILD_PROGRESS.md.

## A. Data identity (run first)

| Check | Expected | How |
|---|---|---|
| Deployed india.json | sha256 84ec208e58718fcabeab40d974273f9a401b948dadc582e585861ad529a46b41, equal to the file Arlo approves | `curl -s <url>/india.json | sha256sum` |
| Deployed audit.json | faee77abdc0570326ebe43567cbb1ead19d184646565945a0cd460faf44555ae | same |
| Deployed india-grid.json | sha256 233154ac55becd3486e6f271e3243720479216893d2c8fcaad80b3f1e29ee39c; each season sums to the full-rectangle W | same |
| geography.js DATA_SHA256 / MANIFEST_SHA256 | 84ec208e... / 3303b52c... | grep the deployed file |
| Pull manifest (git blob) | 3303b52cfd5e4614c25fe7dd305acebd73fe1761cb0a61710b75a534c53ac550 | `git show HEAD:extensions/india/data/manifests/pull.json | sha256sum` |
| Freeze 2 files (git blobs) | ledger.json 5fb06216..., timing.json 3c658ea3..., transitions.json 3e8e372d..., ledger.csv d9083232... | `git show HEAD:frontend/<f> | sha256sum` |

## B. Selections x cases (desktop 1280 wide and mobile 390 wide)

Each cell: select the rectangle (button and map click), then each preset tab, in both fleet views. Tick D (desktop) and M (mobile). For every cell confirm: the heading, the conclusion below, W/U/C table totals equal the row, one outline highlighted, `aria-pressed="true"` on one button only, no hero snapshot banner under a regional label, report and CSV downloads contain the same conclusion and totals.

| Rectangle | Case | W a>b | U a>b | C a>b | D | M |
|---|---|---|---|---|---|---|
| hero | P1 2011 vs 2012 | 13581 > 75396 | 13581 > 14303 | 0 > 61093 | [ ] | [ ] |
| hero | P2 2017 vs 2018 | 54291 > 108035 | 54291 > 60491 | 0 > 47544 | [ ] | [ ] |
| hero | P3 2025 vs 2026 | 17712 > 14341 | 17712 > 14341 | 0 > 0 | [ ] | [ ] |
| full_extent | P1 2011 vs 2012 | 15193 > 92653 | 15193 > 15795 | 0 > 76858 | [ ] | [ ] |
| full_extent | P2 2017 vs 2018 | 80169 > 158958 | 80169 > 89735 | 0 > 69223 | [ ] | [ ] |
| full_extent | P3 2025 vs 2026 | 75716 > 70378 | 75716 > 70378 | 0 > 0 | [ ] | [ ] |
| northwest | P1 2011 vs 2012 | 14210 > 83343 | 14210 > 15037 | 0 > 68306 | [ ] | [ ] |
| northwest | P2 2017 vs 2018 | 68054 > 133729 | 68054 > 74326 | 0 > 59403 | [ ] | [ ] |
| northwest | P3 2025 vs 2026 | 50761 > 41586 | 50761 > 41586 | 0 > 0 | [ ] | [ ] |
| northeast | P1 2011 vs 2012 | 142 > 1096 | 142 > 124 | 0 > 972 | [ ] | [ ] |
| northeast | P2 2017 vs 2018 | 819 > 1906 | 819 > 1044 | 0 > 862 | [ ] | [ ] |
| northeast | P3 2025 vs 2026 | 1706 > 2817 | 1706 > 2817 | 0 > 0 | [ ] | [ ] |
| central | P1 2011 vs 2012 | 395 > 4551 | 395 > 304 | 0 > 4247 | [ ] | [ ] |
| central | P2 2017 vs 2018 | 8110 > 15906 | 8110 > 10069 | 0 > 5837 | [ ] | [ ] |
| central | P3 2025 vs 2026 | 17234 > 18828 | 17234 > 18828 | 0 > 0 | [ ] | [ ] |
| western | P1 2011 vs 2012 | 249 > 1663 | 249 > 165 | 0 > 1498 | [ ] | [ ] |
| western | P2 2017 vs 2018 | 1627 > 2604 | 1627 > 1564 | 0 > 1040 | [ ] | [ ] |
| western | P3 2025 vs 2026 | 1979 > 2588 | 1979 > 2588 | 0 > 0 | [ ] | [ ] |
| peninsular | P1 2011 vs 2012 | 173 > 1695 | 173 > 147 | 0 > 1548 | [ ] | [ ] |
| peninsular | P2 2017 vs 2018 | 1233 > 3311 | 1233 > 1933 | 0 > 1378 | [ ] | [ ] |
| peninsular | P3 2025 vs 2026 | 3348 > 3519 | 3348 > 3519 | 0 > 0 | [ ] | [ ] |

hero rows must render the frozen section 4 conclusions byte-for-byte, with the original hero downloads (docs/BUILD_BRIEF.md section 4).

## C. Expected regional conclusions (exact strings)

- full_extent / P1 2011 vs 2012:
  > Recorded change, India & surrounding area — full rectangle, 2011 → 2012: all included satellites, +509.8% (base 15193 recorded cell-days); Terra+Aqua, +4.0% (base 15193 recorded cell-days). Interval: Oct 1 through Nov 15 in both periods. Difference: 505.9 percentage points. Requires qualification: neither percentage is a corrected fire estimate, and the difference is not a causal attribution. Actual-fire change is not measured.
- full_extent / P2 2017 vs 2018:
  > Recorded change, India & surrounding area — full rectangle, 2017 → 2018: all included satellites, +98.3% (base 80169 recorded cell-days); Terra+Aqua+Suomi NPP, +11.9% (base 80169 recorded cell-days). Interval: Oct 1 through Nov 15 in both periods. Difference: 86.3 percentage points. Requires qualification: neither percentage is a corrected fire estimate, and the difference is not a causal attribution. Actual-fire change is not measured.
- full_extent / P3 2025 vs 2026:
  > Recorded change, India & surrounding area — full rectangle, 2025 → 2026: all included satellites, −7.1% (base 75716 recorded cell-days); Terra+Aqua+Suomi NPP+NOAA-20, −7.1% (base 75716 recorded cell-days). Interval: Oct 1 through Nov 14 in both periods. Difference: 0.0 percentage points. A small or zero selection gap does not establish comparability: this calculation cannot expose changes within the shared fleet. Actual-fire change is not measured.
- northwest / P1 2011 vs 2012:
  > Recorded change, Northwest / Indo-Gangetic study rectangle, 2011 → 2012: all included satellites, +486.5% (base 14210 recorded cell-days); Terra+Aqua, +5.8% (base 14210 recorded cell-days). Interval: Oct 1 through Nov 15 in both periods. Difference: 480.7 percentage points. Requires qualification: neither percentage is a corrected fire estimate, and the difference is not a causal attribution. Actual-fire change is not measured.
- northwest / P2 2017 vs 2018:
  > Recorded change, Northwest / Indo-Gangetic study rectangle, 2017 → 2018: all included satellites, +96.5% (base 68054 recorded cell-days); Terra+Aqua+Suomi NPP, +9.2% (base 68054 recorded cell-days). Interval: Oct 1 through Nov 15 in both periods. Difference: 87.3 percentage points. Requires qualification: neither percentage is a corrected fire estimate, and the difference is not a causal attribution. Actual-fire change is not measured.
- northwest / P3 2025 vs 2026:
  > Recorded change, Northwest / Indo-Gangetic study rectangle, 2025 → 2026: all included satellites, −18.1% (base 50761 recorded cell-days); Terra+Aqua+Suomi NPP+NOAA-20, −18.1% (base 50761 recorded cell-days). Interval: Oct 1 through Nov 14 in both periods. Difference: 0.0 percentage points. A small or zero selection gap does not establish comparability: this calculation cannot expose changes within the shared fleet. Actual-fire change is not measured.
- northeast / P1 2011 vs 2012:
  > Recorded change, Northeast study rectangle, 2011 → 2012: all included satellites, +671.8% (base 142 recorded cell-days); Terra+Aqua, −12.7% (base 142 recorded cell-days). Interval: Oct 1 through Nov 15 in both periods. Difference: 684.5 percentage points. Requires qualification: neither percentage is a corrected fire estimate, and the difference is not a causal attribution. Actual-fire change is not measured.
- northeast / P2 2017 vs 2018:
  > Recorded change, Northeast study rectangle, 2017 → 2018: all included satellites, +132.7% (base 819 recorded cell-days); Terra+Aqua+Suomi NPP, +27.5% (base 819 recorded cell-days). Interval: Oct 1 through Nov 15 in both periods. Difference: 105.3 percentage points. Requires qualification: neither percentage is a corrected fire estimate, and the difference is not a causal attribution. Actual-fire change is not measured.
- northeast / P3 2025 vs 2026:
  > Recorded change, Northeast study rectangle, 2025 → 2026: all included satellites, +65.1% (base 1706 recorded cell-days); Terra+Aqua+Suomi NPP+NOAA-20, +65.1% (base 1706 recorded cell-days). Interval: Oct 1 through Nov 14 in both periods. Difference: 0.0 percentage points. A small or zero selection gap does not establish comparability: this calculation cannot expose changes within the shared fleet. Actual-fire change is not measured.
- central / P1 2011 vs 2012:
  > Recorded change, Central rectangle, 2011 → 2012: all included satellites, +1052.2% (base 395 recorded cell-days); Terra+Aqua, −23.0% (base 395 recorded cell-days). Interval: Oct 1 through Nov 15 in both periods. Difference: 1075.2 percentage points. Requires qualification: neither percentage is a corrected fire estimate, and the difference is not a causal attribution. Actual-fire change is not measured.
- central / P2 2017 vs 2018:
  > Recorded change, Central rectangle, 2017 → 2018: all included satellites, +96.1% (base 8110 recorded cell-days); Terra+Aqua+Suomi NPP, +24.2% (base 8110 recorded cell-days). Interval: Oct 1 through Nov 15 in both periods. Difference: 72.0 percentage points. Requires qualification: neither percentage is a corrected fire estimate, and the difference is not a causal attribution. Actual-fire change is not measured.
- central / P3 2025 vs 2026:
  > Recorded change, Central rectangle, 2025 → 2026: all included satellites, +9.2% (base 17234 recorded cell-days); Terra+Aqua+Suomi NPP+NOAA-20, +9.2% (base 17234 recorded cell-days). Interval: Oct 1 through Nov 14 in both periods. Difference: 0.0 percentage points. A small or zero selection gap does not establish comparability: this calculation cannot expose changes within the shared fleet. Actual-fire change is not measured.
- western / P1 2011 vs 2012:
  > Recorded change, Western rectangle, 2011 → 2012: all included satellites, +567.9% (base 249 recorded cell-days); Terra+Aqua, −33.7% (base 249 recorded cell-days). Interval: Oct 1 through Nov 15 in both periods. Difference: 601.6 percentage points. Requires qualification: neither percentage is a corrected fire estimate, and the difference is not a causal attribution. Actual-fire change is not measured.
- western / P2 2017 vs 2018:
  > Recorded change, Western rectangle, 2017 → 2018: all included satellites, +60.0% (base 1627 recorded cell-days); Terra+Aqua+Suomi NPP, −3.9% (base 1627 recorded cell-days). Interval: Oct 1 through Nov 15 in both periods. Difference: 63.9 percentage points. Requires qualification: neither percentage is a corrected fire estimate, and the difference is not a causal attribution. Actual-fire change is not measured.
- western / P3 2025 vs 2026:
  > Recorded change, Western rectangle, 2025 → 2026: all included satellites, +30.8% (base 1979 recorded cell-days); Terra+Aqua+Suomi NPP+NOAA-20, +30.8% (base 1979 recorded cell-days). Interval: Oct 1 through Nov 14 in both periods. Difference: 0.0 percentage points. A small or zero selection gap does not establish comparability: this calculation cannot expose changes within the shared fleet. Actual-fire change is not measured.
- peninsular / P1 2011 vs 2012:
  > Recorded change, Peninsular study rectangle, 2011 → 2012: all included satellites, +879.8% (base 173 recorded cell-days); Terra+Aqua, −15.0% (base 173 recorded cell-days). Interval: Oct 1 through Nov 15 in both periods. Difference: 894.8 percentage points. Requires qualification: neither percentage is a corrected fire estimate, and the difference is not a causal attribution. Actual-fire change is not measured.
- peninsular / P2 2017 vs 2018:
  > Recorded change, Peninsular study rectangle, 2017 → 2018: all included satellites, +168.5% (base 1233 recorded cell-days); Terra+Aqua+Suomi NPP, +56.8% (base 1233 recorded cell-days). Interval: Oct 1 through Nov 15 in both periods. Difference: 111.8 percentage points. Requires qualification: neither percentage is a corrected fire estimate, and the difference is not a causal attribution. Actual-fire change is not measured.
- peninsular / P3 2025 vs 2026:
  > Recorded change, Peninsular study rectangle, 2025 → 2026: all included satellites, +5.1% (base 3348 recorded cell-days); Terra+Aqua+Suomi NPP+NOAA-20, +5.1% (base 3348 recorded cell-days). Interval: Oct 1 through Nov 14 in both periods. Difference: 0.0 percentage points. A small or zero selection gap does not establish comparability: this calculation cannot expose changes within the shared fleet. Actual-fire change is not measured.

## D. Map, keyboard, captions

- [ ] Tab reaches every rectangle button in order; Enter and Space select; focus ring visible on the dark desk.
- [ ] Map click selects the smallest containing rectangle (overlaps resolve by area, ties by id); click outside every rectangle keeps the current selection.
- [ ] Seven extents drawn, one highlighted; no clipPath or mask; outline labelled as context, not the counting mask.
- [ ] Heat grid: six season buttons, 2026 shown first; caption total equals the full-rectangle W for that season; legend reads 1 cell-day to the peak per bin; grid missing or invalid leaves the plain locator.
- [ ] Qualification sentence shown beside the selector and present in every regional report.
- [ ] Feature label reads "Geographic extension: three predefined comparisons across six selected seasons."
- [ ] Case study, Appendix A and Appendix B keep their "Frozen study rectangle only" scope notes under every regional selection.
- [ ] Mobile 390 wide: no horizontal page scroll; buttons wrap; map scales.

## E. Failure injection (local server, then deployed if possible)

- [ ] india.json missing (404): hero renders, status line shown, no regional buttons active, no console error left uncaught.
- [ ] india.json malformed (truncated JSON): same result.
- [ ] india.json with altered bytes (hash mismatch): rejected; hero intact.
- [ ] Regional render error after selection (covered by frontend/tests/geography-dom.test.js): resets to hero of the current preset.

## F. Network and console

- [ ] Network panel: only same-origin relative requests (index.html, app.css, app.js, geography.js, appendices.js, audit.json, india.json, appendix JSON, assets). No external application request.
- [ ] Console: no uncaught errors across all section B cells.

## G. Sign-off

| Field | Value |
|---|---|
| Arlo independent reproduction (input hashes, checker version, output hash) | PENDING |
| Arlo explicit sign-off | PENDING |
| Tested commit | PENDING |
| Deployed URL and deployed india.json hash | PENDING |
| Verified by / time IST | PENDING |
| Decision (SHIP / ABORT + reason) | PENDING |
