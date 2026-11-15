# Ghost Fleet — final copy pack

## 0. What this pack is

Astra-produced final copy for **Ghost Fleet — Fire Trend Audit**, generated
after the adopted design, frozen presets, and build contract were reviewed.
All numbers below come from the canonical frozen frontend/audit.json.
If a frozen preset value changes, every dependent string in this pack must
be regenerated; do not edit a number in one place only.

Approved project claim (verbatim):

> Ghost Fleet — Fire Trend Audit compares active-fire cell-days between Punjab–Haryana burning seasons using the same geographic mask, grid, date rules, and confidence criteria. It shows the recorded change for all included satellites, the change for satellites present in both periods, and the difference between them. It does not estimate the change in actual burning.

Approved validation disclosure (verbatim):

> We tested one proposed MODIS-sensitivity correction in the 2021 season. It failed the benchmark. The current app does not use that correction as a trusted measurement. It retains it in Method checks as a tested and failed method.

---

## 1. Build contract (binding on the implementation)

- The conclusion line is not a user-editable field.
- The shared warning is always shown, not dismissible.
- The download button label is exactly "Download the comparison evidence".
- P3 uses the interruption template, not the standard decomposition template.
- The footer line "Actual-fire change: not measured" appears on every slide
  and on the compare view.
- Snapshot banner: "2026 data snapshot — S-NPP data delivery ceased 2 Nov."

---

## 2. 30-second demo narration (56 words, timed)

| Time | Narration |
|---|---|
| 00–03 | "The recorded count rose 455.2%." |
| 03–07 | "Using only Terra and Aqua, it rose 5.3%." |
| 07–10 | "The difference is 449.8 percentage points." |
| 10–15 | "This is a change in the satellites included — not a corrected fire count." |
| 15–19 | "Check the satellites, the daily calendars and the method checks." |
| 19–24 | "In the current season, S-NPP data delivery ceased on 2 November, while NOAA-20 continued." |
| 24–29 | "Download the comparison evidence — counts, satellites and definitions." |
| 29–30 | (silent hold on the conclusion line) |

Rules: no title card; do not use a "correction" arrow visual; the narration
above is read as written.

---

## 3. Five-slide deck headlines

- **S1.** "All included satellites: +455.2% detections"
- **S2.** "Terra + Aqua: +5.3% detections" — subline: "Not a corrected fire count"
- **S3.** "Selection gap: 449.8 percentage points" — subline: "No causal attribution"
- **S4.** "Inspect counts, satellites and method checks"
- **S5.** "S-NPP delivery ended 2 Nov 2026"

Footer on every slide: "Actual-fire change: not measured"

---

## 4. Conclusion templates

### 4a. Gap ≥ 10 percentage points

"Recorded change, Punjab + Haryana, {a} → {b}: all included satellites,
{w}%; {shared_label}, {u}%; difference, {d} percentage points. Neither
percentage is a corrected estimate of fire activity, and the difference
is not a causal attribution. Actual-fire change is not measured."

### 4b. Gap < 10 percentage points

"Recorded change, Punjab + Haryana, {a} → {b}: all included satellites,
{w}%; {shared_label}, {u}%; difference, {d} percentage points. A small
selection gap does not prove that either percentage measures actual fire
activity. Neither percentage is a corrected estimate of fire activity.
Actual-fire change is not measured."

Never use the word "agreement" for a small gap.

### 4c. Interruption (P3)

"Recorded change, Punjab + Haryana, 2025 → 2026: all included satellites, −19.0%; Terra+Aqua+Suomi NPP+NOAA-20, −19.0%. Both periods cover Oct 1 through Nov 14; Nov 15 is excluded from this comparison, and 2026 Nov 15 is unverified, not yet retrieved. The two views coincide because the same four satellites are included in both seasons, so the decomposition cannot show the interruption. The included-satellite record is interrupted: S-NPP recorded cell-days run 1 Oct – 2 Nov, and zero from 3 Nov, while NOAA-20 continues. Actual-fire change is not measured."

### 4d. Comparison unavailable

"Comparison unavailable for the selected seasons. At least one selected
season has an incomplete satellite pull in the retrieved records.
Actual-fire change is not measured."

---

## 5. Microcopy pack

- Shared-satellite panel title: "Same named satellites — Terra + Aqua"
- Permanent warning under the shared-satellite panel (always visible):
  "This percentage is not a corrected fire count. It uses only the
  satellites present in both periods."
- Button: "Download the comparison evidence"
- Snapshot banner: "2026 data snapshot — S-NPP data delivery ceased 2 Nov."
- NOAA-21 chip (when the 2026 fleet is shown): "No NOAA-21 data are in
  the comparison"
- Fleet chips (exact labels): Terra · Aqua · Suomi NPP · NOAA-20 · NOAA-21

---

## 6. Hostile-reading table (wrong headline → defeating wording)

| # | Wrong headline a reader could take | Wording that defeats it |
|---|---|---|
| 1 | "Fires rose 455.2% in 2012" | Every percentage is labelled "detections" / "recorded change"; conclusion line ends "Actual-fire change is not measured." |
| 2 | "The real rise was only 5.3%" | Shared panel carries the permanent warning: "This percentage is not a corrected fire count." S2 subline repeats it. |
| 3 | "Satellites caused 449.8 points of fake fires" | S3 subline: "No causal attribution"; conclusion template: "the difference is not a causal attribution." |
| 4 | "The app corrects the fire record" | Approved claim: "It does not estimate the change in actual burning." No corrected number exists anywhere in the app. |
| 5 | "Terra+Aqua is the true series" | Panel title says "Same named satellites", a selection description, not a truth claim; warning repeats not-a-corrected-count. |
| 6 | "2026 fires fell 19.0%" | P3 uses the interruption template: the record is interrupted mid-season; 2026 is labelled a data snapshot everywhere. |
| 7 | "S-NPP died / was switched off" | Copy says only "data delivery ceased" / "delivery ended", a statement about the data record. |
| 8 | "A small gap means the trend is real" | Template 4b: "A small selection gap does not prove that either percentage measures actual fire activity." The word "agreement" is banned. |
| 9 | "Zero fires on that day" | Zero is defined in the measurement contract as "no detections in these retrieved records", never as no fires. |
| 10 | "449.8 is the error in the official count" | The gap is a difference between two selections of the same retrieved records; no official count is estimated or corrected anywhere. |

---

## 7. Gate 7 usability test script (verbatim)

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

---

## 8. Copy JSON (same strings, machine-readable)

```json
{
  "project": "Ghost Fleet — Fire Trend Audit",
  "footer": "Actual-fire change: not measured",
  "demo_narration": [
    {
      "t": "00-03",
      "line": "The recorded count rose 455.2%."
    },
    {
      "t": "03-07",
      "line": "Using only Terra and Aqua, it rose 5.3%."
    },
    {
      "t": "07-10",
      "line": "The difference is 449.8 percentage points."
    },
    {
      "t": "10-15",
      "line": "This is a change in the satellites included — not a corrected fire count."
    },
    {
      "t": "15-19",
      "line": "Check the satellites, the daily calendars and the method checks."
    },
    {
      "t": "19-24",
      "line": "In the current season, S-NPP data delivery ceased on 2 November, while NOAA-20 continued."
    },
    {
      "t": "24-29",
      "line": "Download the comparison evidence — counts, satellites and definitions."
    },
    {
      "t": "29-30",
      "line": ""
    }
  ],
  "slides": [
    {
      "n": 1,
      "headline": "All included satellites: +455.2% detections"
    },
    {
      "n": 2,
      "headline": "Terra + Aqua: +5.3% detections",
      "subline": "Not a corrected fire count"
    },
    {
      "n": 3,
      "headline": "Selection gap: 449.8 percentage points",
      "subline": "No causal attribution"
    },
    {
      "n": 4,
      "headline": "Inspect counts, satellites and method checks"
    },
    {
      "n": 5,
      "headline": "S-NPP delivery ended 2 Nov 2026"
    }
  ],
  "conclusion_templates": {
    "gap_ge_10pp": "Recorded change, Punjab + Haryana, {a} → {b}: all included satellites, {w}%; {shared_label}, {u}%; difference, {d} percentage points. Neither percentage is a corrected estimate of fire activity, and the difference is not a causal attribution. Actual-fire change is not measured.",
    "gap_lt_10pp": "Recorded change, Punjab + Haryana, {a} → {b}: all included satellites, {w}%; {shared_label}, {u}%; difference, {d} percentage points. A small selection gap does not prove that either percentage measures actual fire activity. Neither percentage is a corrected estimate of fire activity. Actual-fire change is not measured.",
    "interruption": "Recorded change, Punjab + Haryana, 2025 → 2026: all included satellites, −19.0%; Terra+Aqua+Suomi NPP+NOAA-20, −19.0%. Both periods cover Oct 1 through Nov 14; Nov 15 is excluded from this comparison, and 2026 Nov 15 is unverified, not yet retrieved. The two views coincide because the same four satellites are included in both seasons, so the decomposition cannot show the interruption. The included-satellite record is interrupted: S-NPP recorded cell-days run 1 Oct – 2 Nov, and zero from 3 Nov, while NOAA-20 continues. Actual-fire change is not measured.",
    "unavailable": "Comparison unavailable for the selected seasons. At least one selected season has an incomplete satellite pull in the retrieved records. Actual-fire change is not measured."
  },
  "microcopy": {
    "shared_panel_title": "Same named satellites — Terra + Aqua",
    "shared_warning": "This percentage is not a corrected fire count. It uses only the satellites present in both periods.",
    "download_button": "Download the comparison evidence",
    "snapshot_banner": "2026 data snapshot — S-NPP data delivery ceased 2 Nov.",
    "noaa21_chip": "No NOAA-21 data are in the comparison",
    "fleet_chips": [
      "Terra",
      "Aqua",
      "Suomi NPP",
      "NOAA-20",
      "NOAA-21"
    ]
  },
  "test_notes": "Gate 7 scorecard fields: pass/fail, verbatim quote, time_to_answer. Automatic fail: treating 5.3% as the true or corrected fire change. Question: 'What does that number not tell us about the actual fires?' Expected substance: actual-fire change is not measured. Why not ask the app's own reviewer?"
}
```
