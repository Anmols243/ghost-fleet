# Method — Ghost Fleet
## Why degrade?
A trend crossing a sensor change mixes burning change with instrument change. Ratio-scaling the past up invents detections that never happened. Degrading the sensitive record to the less sensitive instrument only ever removes real detections.
## Detectability model
Primary: Sofiev & Kouznetsov (2026), Geoscientific Model Development — MODIS C6.1 detection limit 3.7 MW (nadir, clear, night), ~5.7 MW day nadir, up to ~40 MW day swath edge; VIIRS smallest reliably detected fire 0.5 MW (night); detection probability for strong fires 78% MODIS / 88% VIIRS. Empirical check: fraction of VIIRS cell-days MODIS also saw, by FRP band and day/night.
## Degradation rules
1. Keep VIIRS detections whose acq_time falls in a MODIS pass window that day; windows reconstructed per season from MODIS acq_time clusters (split >60 min gaps, widen ±45 min). Aqua drifts — never fixed clock times.
2. Keep detections with FRP above the MODIS limit for their day/night class at p=0.5; sensitivity at p=0.25 (limit x0.6) and p=0.75 (x1.6), disclosed approximation.
3. Survivors join the same ~1 km daily grid as harmonization.
## Fleets
terra2000 (Terra MODIS), terra_aqua2002 (+Aqua), viirs2012 (+VIIRS S-NPP), full2026 (MODIS + VIIRS NOAA-20/21), post_snpp2026 (full2026, S-NPP data ended 2026-11-02, seam flagged).
## Limits
Degradation models detectability, not cloud. MODIS-equivalent is a comparison device, not burned area (that is MCD64A1). FRP never summed across sensors.
