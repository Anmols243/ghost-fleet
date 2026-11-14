# Harmonization

Run `.venv/Scripts/python.exe scripts/harmonize.py` from the repository.
Inputs are all CSVs in `data/raw`; keep only the intended source products there.
Outputs are `data/processed/standardized.parquet`, `season_totals.json`, and
`data/processed/<season>/{harmonized_events.csv,calendar_full.json}` for 2020–2026.

Standardized dates are UTC midnight timestamps. Acquisition times are UTC HH:MM.
MODIS satellites Terra/Aqua are split; VIIRS N/N20/N21 map to S-NPP/NOAA-20/21.
Only MODIS confidence >=50 and VIIRS confidence n/h survive. Raw confidence
strings are retained. S-NPP is historical-only, including its 2026 NRT input;
its last detection in this pull is 2026-11-02. Calendars carry this label.

Events use a fixed equirectangular grid with southwest origin (73.8, 27.6),
reference latitude 30.1°, and spherical Earth radius 6371.0088 km. Integer
cell_x/cell_y are floor indices at 1 km spacing. Cells are approximately
0.97–1.03 km wide across the bbox. Nearby points on opposite cell boundaries
remain separate. This grid must also be used by future degradation processing.

One UTC cell-day is one event. sensors_seen and daynight are sorted, unique,
pipe-delimited labels; D|N preserves mixed observations. first_acq is the earliest
UTC HH:MM in that cell-day. frp_modis and frp_viirs are independent maxima in MW;
an absent family has a null maximum. No FRP is summed, and no counts are scaled.

Each calendar includes all 46 days from October 1 through November 15, with
1-based day_index. Missing event days have count zero. Median and linear p90
are calculated for that index across the other six seasons, including their
zero days. critical uses a strict events > p90 comparison. These are raw
multi-sensor event calendars, not detectability-adjusted trends. No cloud,
sensor availability, or S-NPP cessation correction is applied. Incomplete API
coverage can therefore appear as a zero day; it does not prove no fires.
