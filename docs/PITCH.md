# Ghost Fleet — Pitch Scripts

Numbers in [brackets] come from `fleet_diff.json` only, on Sunday.
Never pitch a number the pipeline didn't produce.

## 30 seconds (the submission demo — hard cap)

_Corrected 14 Nov from the VM pre-read on the real pull — do not use
the old version: the peak day does **not** move (2026-11-08 in full,
same-eyes and Terra+Aqua views), and "Terra 2000 loses 99.5%" is a
morning-pass / sensor-decline artefact (63 events). Honest headline
is Terra+Aqua 43% of full (57% lost), or same-eyes 65% lost._

"Every fire calendar lies after 2012 — not because burning exploded,
but because the satellite got better eyes.

This is the 2026 Punjab season as today's fleet saw it: [N] fires,
peak day [date].

Now the same fields, the same fires, through Terra and Aqua's eyes
from 2002. [X]% of the season disappears — and twelve days ago,
Suomi NPP died mid-season: its last detection was 2 November, while
NOAA-20 kept watching.

Ghost Fleet holds the eyes constant, so two seasons are honestly
comparable for the first time. The difference between these calendars
is the camera. The rest is fire."

## 60 seconds (live pitch / Q&A opener)

"Every November, India argues about Punjab's fires. The government
says burning fell. Critics say it didn't. Both sides quote satellite
counts — and both can be wrong, because the instrument changed three
times: a far more sensitive sensor arrived in 2012, burning shifted
to the evening, past the satellite passes, and twelve days ago,
Suomi NPP died in the middle of the season.

Every other calendar harmonizes by scaling the past up — inventing
fires no satellite ever saw. We do the opposite. Using published
detection-limit science, we degrade today's data to yesterday's
satellite, and we let you re-watch any season through five different
fleets, from Terra in 2000 to the fleet that lost a satellite
mid-season this year.

For the officer who has to sign the season report, that's the
difference between defending a number and knowing which part of it
is fire — and which part is just a better camera."

## One-liners (pick per audience)

- Judges: "We don't correct the past to match the present. We blind
  the present to match the past — the only honest way to compare."
- Scientists: "A harmonized fire record built by degrading VIIRS to
  MODIS-equivalent sensitivity, using Sofiev & Kouznetsov's published
  observation operators, validated against our own paired-day data."
- Anyone: "Dead satellites, honest calendars."

## Judge questions — rehearsed answers

Q: "Aren't you throwing data away?"
A: "For a snapshot, the full record is right there. For a 20-year
trend, comparing different instruments is the error. We show both
views and the difference — throwing away the *illusion* of precision,
not the data."

Q: "Why not just use a correction ratio like everyone else?"
A: "A ratio invents detections that never happened and hides them in
an average. Degrading only removes real detections, so every number
on screen traces to an actual FIRMS record — and our sensitivity band
shows exactly where the model is unsure."

Q: "Hasn't this been done?"
A: "The detection-limit physics is published — Sofiev & Kouznetsov,
2026 — and we cite it and validate against it. What's never been
built is the product: no team in this challenge degrades, and no
public tool lets a non-scientist re-run a season through historical
fleets."

Q: "Who actually uses this?"
A: "Not the fire officer during the season — FIRMS and FSI alerts
already serve them, free. Our user is the person who signs off after
the season: the CAQM reviewer or researcher who must say whether
burning rose or fell, and today has no honest way to say it."

Q: "What can't it do?"
A: "It can't tell you burned area — that's MCD64A1's job — and it
can't see through cloud. The limits are printed on the method page,
with the sensitivity range, because a tool that grades other people's
numbers has to show its own."
