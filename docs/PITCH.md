> **SUPERSEDED 2026-11-15.** This pitch describes the pre-pivot concept. The project is now Ghost Fleet — Fire Trend Audit. Canonical: docs/AUDIT_SPEC.md · Build: docs/BUILD_BRIEF.md · Copy: docs/COPY_PACK.md. Kept for provenance.

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
detection limits — validated against the actual 2000–2011 overlap."
- Field / policy: "We throw away the fires Terra couldn't see, so
the comparison is fair."
- Demo closer: "Now watch the same season through Terra in 2000 —
that's the honest calendar."

## Failure modes (Q&A ammunition)

- "Why not use every satellite at full sensitivity?" → Because
then the instrument, not the fire, drives the trend.
- "What if VIIRS never launched?" → Show the Terra+Aqua view.
- "How do you know the degradation is right?" → We tested it
against real overlap years: 2000–2011 Terra+Aqua vs VIIRS.
- "Can the app show daily detail?" → The data is daily; the app
can be extended in the rebuild.
- "Is it peer-reviewed science?" → No, it's a demo record built
on published detection limits; see the limits page.

## Closing (one line for the judges)

"Dead satellites, honest calendars."

## Hard rules

- No invented numbers. Only numbers from `fleet_diff.json` and
`season_peaks.json` go in the demo.
- Peak day does not move between full, same-eyes and Terra+Aqua views
(2026-11-08); never use the old "peak moves" claim.
- Never say "99.5%": Terra 2000 is not comparable to 2026 at full
sensitivity — the honest gap is Terra+Aqua 57% or same-eyes 65%.
- If a judge asks about the data, point to the method page.

Q: "What can't it do?"
A: "It can't tell you burned area — that's MCD64A1's job — and it
can't see through cloud. The limits are printed on the method page,
with the sensitivity range, because a tool that grades other people's
numbers has to show its own."
