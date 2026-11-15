"""Recorded cell-day heat grid for the geographic locator (frontend/india-grid.json).

Reads the pinned extension snapshot (extensions/india/data/raw/, verified chunk by
chunk against extensions/india/data/manifests/pull.json), standardizes it with the
canonical backend/scripts/harmonize.standardize, filters to the full study rectangle,
builds canonical ~1 km cell-day unions (harmonize.build_events) for each season's
frozen all-included satellite selection and comparison window, and counts those
cell-days per 0.5 degree display bin (assigned by 1 km cell centre).

Gate: for every season the bin counts must sum exactly to the full-rectangle W in
frontend/india.json. Any mismatch stops without writing. Nothing in backend/ or the
frozen frontend files is modified. Run from the repo root: python extensions/india/india_grid.py
"""
import hashlib, json, math, sys
from collections import Counter
from pathlib import Path

import pandas as pd

REPO = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(REPO / 'backend/scripts'))
from harmonize import build_events, standardize  # noqa: E402

BIN = 0.5
WEST, SOUTH, EAST, NORTH = 68.0, 6.5, 97.5, 37.5
KM_PER_DEG = math.pi * 6371.0088 / 180


def sha256(data):
    return hashlib.sha256(data).hexdigest()


def main():
    root = REPO / 'extensions/india/data'
    manifest_bytes = (root / 'manifests/pull.json').read_bytes()
    manifest = json.loads(manifest_bytes)
    india = json.loads((REPO / 'frontend/india.json').read_text(encoding='utf-8'))
    full = next(r for r in india['rectangles'] if r['id'] == 'full_extent')
    if full['bounds'] != [WEST, SOUTH, EAST, NORTH]:
        raise SystemExit('Full rectangle bounds differ from india.json')

    frames = []
    for chunk in manifest['chunks']:
        payload = (root / 'raw' / chunk['file']).read_bytes()
        if sha256(payload) != chunk['sha256']:
            raise SystemExit('Raw chunk differs from the pinned snapshot: ' + chunk['file'])
        raw = pd.read_csv(root / 'raw' / chunk['file'], dtype='string')
        if len(raw) != chunk['rows']:
            raise SystemExit('Row count differs: ' + chunk['file'])
        frames.append(standardize(raw))
    frame = pd.concat(frames, ignore_index=True)
    frame = frame[frame.lon.between(WEST, EAST, inclusive='both') & frame.lat.between(SOUTH, NORTH, inclusive='both')]

    seasons, checks = {}, []
    for comparison in full['comparisons']:
        for tag in ['a', 'b']:
            period = comparison['periods'][tag]
            year, fleet = comparison[tag], comparison['fleet_' + tag]
            start, end = (pd.Timestamp(d, tz='UTC') for d in period['interval'])
            rows = frame[frame.date.between(start, end, inclusive='both') & frame.sensor.isin(fleet)]
            events = build_events(rows)
            lon = 73.8 + (events.cell_x + 0.5) / (KM_PER_DEG * math.cos(math.radians(30.1)))
            lat = 27.6 + (events.cell_y + 0.5) / KM_PER_DEG
            col = ((lon - WEST) // BIN).astype('int64').clip(0, int((EAST - WEST) / BIN) - 1)
            row = ((NORTH - lat) // BIN).astype('int64').clip(0, int((NORTH - SOUTH) / BIN) - 1)
            counts = Counter(zip(col.tolist(), row.tolist()))
            total = int(sum(counts.values()))
            expected = comparison['W_' + tag]
            checks.append({'season': year, 'comparison': comparison['id'], 'bin_sum': total,
                           'india_json_full_extent_W': expected, 'equal': total == expected})
            if total != expected:
                raise SystemExit(f'STOP: {year} bin sum {total} != india.json full_extent W {expected}')
            seasons[str(year)] = {'satellites': fleet, 'interval': period['interval'], 'total': total,
                                  'cells': sorted([c, r, n] for (c, r), n in counts.items())}

    peak = max(n for s in seasons.values() for _, _, n in s['cells'])
    result = {
        'schema': 'india-grid v1',
        'status': 'Display layer derived from the pinned extension snapshot; bin sums equal india.json full-rectangle W exactly.',
        'unit': 'recorded cell-days (canonical ~1 km cell-day unions) per 0.5-degree display bin',
        'selection': 'Each season uses its frozen all-included satellite selection and its comparison window.',
        'binning': '1 km cell-days assigned to 0.5-degree bins by cell centre; origin 68.0E, 37.5N; bins are not equal-area.',
        'caveat': 'Counts, not density. Bin area shrinks with latitude. Colour shows recorded cell-days, not actual fire activity. Empty bins have no detections in these retrieved records.',
        'bin_deg': BIN, 'bounds': [WEST, SOUTH, EAST, NORTH],
        'cols': int((EAST - WEST) / BIN), 'rows': int((NORTH - SOUTH) / BIN),
        'scale': {'type': 'log', 'min': 1, 'max': peak, 'shared_across_seasons': True},
        'seasons': seasons,
        'verification': checks,
        'provenance': {'pull_manifest_sha256': sha256(manifest_bytes.replace(b'\r\n', b'\n')),
                       'india_json_sha256': sha256((REPO / 'frontend/india.json').read_bytes().replace(b'\r\n', b'\n')),
                       'generator_sha256': sha256(Path(__file__).read_bytes().replace(b'\r\n', b'\n')),
                       'raw_chunks_verified': len(manifest['chunks'])},
    }
    out = REPO / 'frontend/india-grid.json'
    out.write_bytes((json.dumps(result, separators=(',', ':'), ensure_ascii=False, allow_nan=False) + '\n').encode())
    print('PASS', {c['season']: c['bin_sum'] for c in checks}, 'peak', peak, 'bytes', out.stat().st_size)


if __name__ == '__main__':
    main()
