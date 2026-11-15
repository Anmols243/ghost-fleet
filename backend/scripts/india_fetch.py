"""Isolated FIRMS geographic-extension retrieval; frozen generators are untouched."""
import csv
import io
import re
import hashlib
import time
import json
from pathlib import Path
from html.parser import HTMLParser
from datetime import date, datetime, timedelta, timezone

BBOX = (68.0, 6.5, 97.5, 37.5)
YEARS = [2011, 2012, 2017, 2018, 2025, 2026]
COMPARISONS = {2011: 'viirs_transition', 2012: 'viirs_transition',
               2017: 'noaa20_transition', 2018: 'noaa20_transition',
               2025: 'snpp_cessation', 2026: 'snpp_cessation'}


class OutageRows(HTMLParser):
    def __init__(self):
        super().__init__()
        self.rows, self.row, self.cell = [], None, None

    def handle_starttag(self, tag, attrs):
        if tag == 'tr': self.row = []
        if tag in ('td', 'th'): self.cell = []

    def handle_data(self, data):
        if self.cell is not None: self.cell.append(data)

    def handle_endtag(self, tag):
        if tag in ('td', 'th') and self.cell is not None:
            if self.row is not None: self.row.append(' '.join(''.join(self.cell).split()))
            self.cell = None
        if tag == 'tr' and self.row:
            self.rows.append(self.row)
            self.row = None


def parse_outages(html, satellite, url):
    parser = OutageRows()
    parser.feed(html)
    result = []
    for row in parser.rows:
        if len(row) < 5 or row[0] == 'Year-Day': continue
        tokens = re.findall(r'\d{4}-\d{3}', row[0])
        if not tokens:
            raise ValueError('Unparsed outage date row: ' + str(row))
        first, last = [datetime.strptime(x, '%Y-%j').date() for x in (tokens[0], tokens[-1])]
        applicable = [y for y in YEARS if first <= date(y, 11, 14 if y >= 2025 else 15)
                      and last >= date(y, 10, 1)
                      and (satellite != 'SNPP' or y >= 2012)
                      and (satellite != 'NOAA20' or y >= 2018)]
        if not applicable: continue
        start_time = row[2] if re.fullmatch(r'\d{2}:\d{2}:\d{2}', row[2]) else None
        end_time = row[3] if re.fullmatch(r'\d{2}:\d{2}:\d{2}', row[3]) else None
        result.append({'satellite': satellite, 'start_date': first.isoformat(), 'end_date': last.isoformat(),
                       'start_utc': f'{first}T{start_time}Z' if start_time else None,
                       'end_utc': f'{last}T{end_time}Z' if end_time else None,
                       'raw_interval': row[:4], 'comment': row[4], 'log_url': url,
                       'seasons': applicable, 'comparison_ids': sorted({COMPARISONS[y] for y in applicable}),
                       'classification': 'known missing product data',
                       'regional_impact': 'not quantified; global production log, not a regional completeness claim'})
    return result


def request_plan():
    result = []
    for year in YEARS:
        products = ['MODIS'] + (['VIIRS_SNPP'] if year >= 2012 else []) + (['VIIRS_NOAA20'] if year >= 2018 else [])
        for family in products:
            end = date(year, 11, 2 if year == 2026 and family == 'VIIRS_SNPP' else 14 if year >= 2025 else 15)
            start = date(year, 10, 1)
            while start <= end:
                stop = min(end, start + timedelta(days=4))
                result.append({'season': year, 'source': family + ('_NRT' if year == 2026 else '_SP'),
                               'start': start.isoformat(), 'end': stop.isoformat()})
                start = stop + timedelta(days=1)
    return result


def availability_checks(available, plan):
    checks = []
    for year, source in sorted({(r['season'], r['source']) for r in plan}):
        start = f'{year}-10-01'
        end = f'{year}-11-' + ('02' if year == 2026 and source == 'VIIRS_SNPP_NRT' else '14' if year >= 2025 else '15')
        record = available.get(source)
        if not record or record['max_date'] < start or record['min_date'] > end:
            raise ValueError(f'Required source absent for whole season: {year} {source}')
        partial = record['min_date'] > start or record['max_date'] < end
        checks.append({'season': year, 'source': source, 'min_date': record['min_date'],
                       'max_date': record['max_date'], 'status':
                       'partial advertised coverage; known missing product data' if partial else
                       'date-range available; completeness not asserted'})
    return checks


def validate_csv(body, source, start, end):
    if not body.splitlines() or 'latitude,longitude' not in body.splitlines()[0]:
        raise ValueError('Not FIRMS CSV: ' + body[:300])
    reader = csv.DictReader(io.StringIO(body))
    required = {'latitude', 'longitude', 'acq_date', 'satellite', 'instrument',
                'confidence', 'frp', 'daynight', 'acq_time'}
    if not required.issubset(reader.fieldnames or []):
        raise ValueError('Missing required CSV fields')
    allowed = {'MODIS': {'TERRA', 'AQUA'}, 'VIIRS_SNPP': {'N'}, 'VIIRS_NOAA20': {'N20'}}
    family = source.rsplit('_', 1)[0]
    count = 0
    for row in reader:
        if (row['satellite'].strip().upper() not in allowed[family]
                or row['instrument'].strip().upper() != ('MODIS' if family == 'MODIS' else 'VIIRS')):
            raise ValueError('Unexpected satellite/instrument')
        lat, lon = float(row['latitude']), float(row['longitude'])
        if not (BBOX[0] <= lon <= BBOX[2] and BBOX[1] <= lat <= BBOX[3]):
            raise ValueError('Coordinates outside requested bounds')
        if not start <= date.fromisoformat(row['acq_date']) <= end:
            raise ValueError('Date outside requested interval')
        count += 1
    return count


def retrieve_chunk(request, key, get, pause=time.sleep):
    start, end = date.fromisoformat(request['start']), date.fromisoformat(request['end'])
    days = (end - start).days + 1
    if not 1 <= days <= 5: raise ValueError('Request exceeds five days')
    entry = dict(request, bbox=list(BBOX), product=request['source'].rsplit('_', 1)[1],
                 retrieved_at_utc=datetime.now(timezone.utc).isoformat(), attempts=[],
                 status='BLOCKED', response_validation='not received', rows=None,
                 sha256=None, unresolved_anomaly=None)
    url = f'https://firms.modaps.eosdis.nasa.gov/api/area/csv/{key}/{request["source"]}/' + ','.join(map(str, BBOX)) + f'/{days}/{start}'
    body = None
    for attempt in range(1, 4):
        try:
            body = get(url).decode('utf-8-sig').replace(key, '<REDACTED>')
            entry['attempts'].append({'attempt': attempt, 'result': 'received'})
            break
        except Exception as error:
            entry['attempts'].append({'attempt': attempt, 'error': str(error).replace(key, '<REDACTED>')})
            if attempt < 3: pause(attempt * 2)
    if body is None:
        entry['unresolved_anomaly'] = 'unretrievable chunk'
        return entry, None
    try:
        entry['rows'] = validate_csv(body, request['source'], start, end)
        entry['response_validation'] = 'headers, satellite/instrument, bounds and dates passed'
    except Exception as error:
        entry['response_validation'] = str(error).replace(key, '<REDACTED>')
        entry['unresolved_anomaly'] = 'invalid response / unretrievable valid chunk'
        return entry, None
    if entry['rows'] == 0:
        entry['unresolved_anomaly'] = 'unexpected empty response'
        return entry, None
    payload = body.encode('utf-8')
    entry.update(status='retrieved', sha256=hashlib.sha256(payload).hexdigest())
    return entry, payload


def save_manifest(path, value):
    temporary = path.with_suffix('.tmp')
    temporary.write_bytes((json.dumps(value, indent=2, ensure_ascii=True, allow_nan=False) + '\n').encode())
    temporary.replace(path)


def matching_outages(request, outages):
    families = {'TERRA': 'MODIS_', 'AQUA': 'MODIS_', 'SNPP': 'VIIRS_SNPP_', 'NOAA20': 'VIIRS_NOAA20_'}
    return [i for i, o in enumerate(outages) if request['season'] in o['seasons']
            and request['source'].startswith(families[o['satellite']])
            and o['start_date'] <= request['end'] and o['end_date'] >= request['start']]


def refresh_chunk_disclosures(manifest):
    for chunk in manifest['chunks']:
        chunk['outage_disclosure_ids'] = matching_outages(chunk, manifest.get('outages', []))


def resolve_preflight(preflight, checks, outages, ruling):
    if not any(r.get('type') == ruling['type'] for r in preflight.get('owner_resolutions', [])):
        preflight.setdefault('owner_resolutions', []).append(ruling)
        preflight.setdefault('history', []).append(ruling)
    preflight.setdefault('historical_second_stop_findings', preflight.get('anomalies', []))
    preflight.update(status='READY_WITH_KNOWN_MISSING_DISCLOSURES', active_blockers=[], anomalies=[],
                     current_availability_checks=checks, known_missing_outages=outages,
                     previous_stop_snapshot='preflight.stop-2.json')
    preflight['credential_handling'] = 'Local .env only; keyed requests redacted. Earlier pre-key stops are preserved in snapshots.'
    for row in preflight.get('required_source_seasons', []):
        check = next(c for c in checks if c['season'] == row['season'] and c['source'] == row['source'])
        row['availability_check'] = check['status']
        row['completeness'] = 'unknown; known missing product data disclosed, not a blocker'
    preflight['summary'] = {
        'availability_completion': 'All required source/season advertised date ranges checked.',
        'known_missing': 'Expected S-NPP cessation and intersecting MODAPS production outages disclosed; non-blocking owner ruling.',
        'unknown_completeness': 'Availability ranges and retrieval do not establish uninterrupted or cloud-free observations.',
        'zero_detections': 'No empty response is classified as zero fire activity.'}


def pull_requests(plan, manifest, root, key, get, pause=time.sleep):
    (root / 'raw').mkdir(parents=True, exist_ok=True)
    (root / 'manifests').mkdir(parents=True, exist_ok=True)
    for request in plan:
        filename = f'{request["source"]}_{request["start"]}_{request["end"]}.csv'
        target = root / 'raw' / filename
        existing = next((r for r in manifest['chunks'] if r.get('file') == filename), None)
        if existing and existing['status'] == 'retrieved' and target.exists():
            payload = target.read_bytes()
            if hashlib.sha256(payload).hexdigest() == existing['sha256']:
                validate_csv(payload.decode(), request['source'], date.fromisoformat(request['start']), date.fromisoformat(request['end']))
                existing['outage_disclosure_ids'] = matching_outages(request, manifest.get('outages', []))
                continue
        entry, payload = retrieve_chunk(request, key, get, pause)
        entry['file'] = filename
        entry['coverage'] = 'retrieved product interval; completeness unknown; see known-missing disclosures'
        entry['outage_disclosure_ids'] = matching_outages(request, manifest.get('outages', []))
        if existing: entry['previous_record'] = existing
        manifest['chunks'] = [r for r in manifest['chunks'] if r.get('file') != filename] + [entry]
        if payload is not None:
            temporary = target.with_suffix('.tmp')
            temporary.write_bytes(payload)
            temporary.replace(target)
        manifest['status'] = 'PULLING' if payload is not None else 'BLOCKED'
        save_manifest(root / 'manifests/pull.json', manifest)
        print(request['source'], request['start'], request['end'], entry['rows'], entry['status'], flush=True)
        if payload is None: return
        pause(.2)
    manifest['status'] = 'RETRIEVED - completeness not asserted'
    save_manifest(root / 'manifests/pull.json', manifest)


def main():
    import argparse
    from urllib.request import urlopen
    from dotenv import dotenv_values
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--prepare-only', action='store_true')
    args = parser.parse_args()
    repo = Path(__file__).resolve().parents[2]
    root = repo / 'extensions/india/data'
    key = None
    for env in [repo / 'backend/.env', repo / '.env']:
        if env.exists():
            values = dotenv_values(env)
            key = values.get('MAP_KEY') or values.get('FIRMS_MAP_KEY')
            if key: break
    if not key: raise SystemExit('Map key unavailable in local .env')

    def get(url):
        with urlopen(url, timeout=90) as response:
            return response.read()

    def metadata(url):
        for attempt in range(3):
            try: return get(url).decode('utf-8-sig').replace(key, '<REDACTED>')
            except Exception as error:
                if attempt == 2: raise RuntimeError(str(error).replace(key, '<REDACTED>')) from None
                time.sleep(2 * (attempt + 1))

    try:
        availability = metadata('https://firms.modaps.eosdis.nasa.gov/api/data_availability/csv/' + key + '/ALL')
        available = {r['data_id']: r for r in csv.DictReader(io.StringIO(availability))}
        outages, logs = [], []
        for sensor, name in [('TERRA', 'terra'), ('AQUA', 'aqua'), ('SNPP', 'suomi_npp'), ('NOAA20', 'noaa_20')]:
            url = f'https://modaps.modaps.eosdis.nasa.gov/services/production/outages_{name}.html'
            body = metadata(url)
            path = root / 'manifests' / f'outages_{name}.html'
            path.write_bytes(body.encode())
            entries = parse_outages(body, sensor, url)
            outages.extend(entries)
            logs.append({'satellite': sensor, 'url': url, 'sha256': hashlib.sha256(body.encode()).hexdigest(),
                         'intersecting_entries': len(entries)})
        checks = availability_checks(available, request_plan())
        (root / 'manifests/availability.csv').write_bytes(availability.encode())
        preflight_path = root / 'manifests/preflight.json'
        preflight = json.loads(preflight_path.read_text())
        snapshot = root / 'manifests/preflight.stop-2.json'
        if not snapshot.exists(): snapshot.write_bytes(preflight_path.read_bytes())
        ruling = {'type': 'owner_resolution_second_stop', 'recorded_at_utc': datetime.now(timezone.utc).isoformat(),
                  'classification': 'MODAPS-logged outages are known missing product data; disclosed, non-blocking',
                  'reason': 'Owner ruling: same outage class in frozen hero; exact daily compatibility gate remains binding.',
                  'blocking': False, 'escalate_only': ['required source absent for whole season', 'unretrievable chunk', 'unexpected empty response']}
        resolve_preflight(preflight, checks, outages, ruling)
        save_manifest(preflight_path, preflight)
        manifest_path = root / 'manifests/pull.json'
        manifest = json.loads(manifest_path.read_text()) if manifest_path.exists() else {'chunks': []}
        current_generator_hash = hashlib.sha256(Path(__file__).read_bytes().replace(b'\r\n', b'\n')).hexdigest()
        original_generator_hash = manifest.get('retrieval_generator_sha256', manifest.get('generator_sha256', current_generator_hash))
        manifest.update(schema='india-pull v1', status='READY_WITH_DISCLOSURES', bbox=list(BBOX),
                        availability_checks=checks, outages=outages, outage_logs=logs,
                        known_missing_expected_cessation=preflight['known_missing_expected_states'],
                        comparison_windows={str(y): [f'{y}-10-01', f'{y}-11-'+('14' if y >= 2025 else '15')] for y in YEARS},
                        unverified_excluded_dates=['2026-11-15'], max_days_per_request=5,
                        generator_sha256=original_generator_hash,
                        retrieval_generator_sha256=original_generator_hash,
                        validation_generator_sha256=current_generator_hash,
                        prepared_at_utc=datetime.now(timezone.utc).isoformat(),
                        completeness='unknown; retrieved is not proof of cloud-free or uninterrupted observation')
        refresh_chunk_disclosures(manifest)
        save_manifest(manifest_path, manifest)
        print('Availability:', len(checks), 'source/season pairs; outages:', len(outages), 'by log:', logs, flush=True)
        if args.prepare_only: return
        pull_requests(request_plan(), manifest, root, key, get)
        manifest['summary'] = {
            'retrieved': {'chunks': sum(c['status'] == 'retrieved' for c in manifest['chunks']),
                          'rows_per_season': {str(y): sum(c['rows'] or 0 for c in manifest['chunks']
                              if c['season'] == y and c['status'] == 'retrieved') for y in YEARS}},
            'known_missing': {'modaps_entries': len(outages), 'expected_cessation': manifest['known_missing_expected_cessation']},
            'zero_detections': [c['file'] for c in manifest['chunks'] if c['rows'] == 0],
            'unknown_completeness': manifest['completeness'],
            'unresolved_anomalies': [c for c in manifest['chunks'] if c['unresolved_anomaly']]}
        save_manifest(manifest_path, manifest)
        preflight.update(status=manifest['status'], area_data_pull_started=bool(manifest['chunks']),
                         chunk_manifests_reference='pull.json#chunks',
                         chunk_manifests=[{'file': c['file'], 'manifest': 'pull.json'} for c in manifest['chunks']])
        preflight['summary']['retrieved'] = manifest['summary']['retrieved']
        for row in preflight['required_source_seasons']:
            chunks = [c for c in manifest['chunks'] if c['season'] == row['season'] and c['source'] == row['source']]
            row['chunk_requests'] = len(chunks)
            row['downloaded_rows'] = sum(c['rows'] or 0 for c in chunks if c['status'] == 'retrieved')
        save_manifest(preflight_path, preflight)
        candidate = {'schema': 'india-input-metadata v1', 'status': manifest['status'],
                     'metadata': {'outage_disclosures_by_comparison': {
                         comparison: [o for o in outages if comparison in o['comparison_ids']]
                         for comparison in sorted(set(COMPARISONS.values()))},
                         'expected_cessation': manifest['known_missing_expected_cessation'],
                         'availability_checks': checks, 'comparison_windows': manifest['comparison_windows'],
                         'bbox': list(BBOX), 'unverified_excluded_dates': ['2026-11-15'],
                         'completeness': manifest['completeness'],
                         'retrieval_summary': manifest['summary'], 'outage_logs': logs,
                         'pull_manifest_sha256': hashlib.sha256(manifest_path.read_bytes()).hexdigest(),
                         'publication': 'Candidate metadata only; aggregation and exact hero compatibility gate not yet run.'}}
        save_manifest(root / 'outputs/india.json', candidate)
        if manifest['status'] == 'BLOCKED': raise RuntimeError('Pull stopped: ' + str(manifest['chunks'][-1]))
    except Exception as error:
        raise SystemExit(str(error).replace(key, '<REDACTED>')) from None


if __name__ == '__main__':
    main()
