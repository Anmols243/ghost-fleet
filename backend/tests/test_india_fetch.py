from datetime import date
import pytest
from scripts.india_fetch import validate_csv, parse_outages, request_plan, retrieve_chunk, pull_requests, availability_checks, resolve_preflight, refresh_chunk_disclosures


def test_response_validator_accepts_valid_sensor_and_rejects_error_and_bad_rows():
    header = 'latitude,longitude,acq_date,satellite,instrument,confidence,frp,daynight,acq_time\n'
    row = '30,75,2026-10-01,N20,VIIRS,n,3,D,0800\n'
    assert validate_csv(header + row, 'VIIRS_NOAA20_NRT', date(2026, 10, 1), date(2026, 10, 5)) == 1
    for bad in ['Invalid map key', header + row.replace(',N20,', ',N,'),
                header + row.replace('30,75,', '30,100,'),
                header + row.replace('2026-10-01', '2026-10-06')]:
        with pytest.raises(ValueError):
            validate_csv(bad, 'VIIRS_NOAA20_NRT', date(2026, 10, 1), date(2026, 10, 5))


def test_outage_intersection_keeps_overlap_and_excludes_outside_window():
    html = '<table><tr><th>Year-Day</th></tr>'
    html += '<tr><td>2026-285 - 2026-286</td><td>October 12-13</td><td>22:00:00</td><td>11:48:00</td><td>Gap</td></tr>'
    html += '<tr><td>2026-271</td><td>September 28</td><td>10:00:00</td><td>12:00:00</td><td>Gap</td></tr></table>'
    result = parse_outages(html, 'SNPP', 'https://example.test/log')
    assert len(result) == 1
    assert result[0]['start_utc'] == '2026-10-12T22:00:00Z'
    assert result[0]['end_utc'] == '2026-10-13T11:48:00Z'
    assert result[0]['comparison_ids'] == ['snpp_cessation']


def test_plan_has_nonoverlapping_five_day_requests_and_expected_cessation():
    plan = request_plan()
    assert len(plan) == 132
    for year in [2011, 2012, 2017, 2018, 2025, 2026]:
        for source in {p['source'] for p in plan if p['season'] == year}:
            rows = [p for p in plan if p['season'] == year and p['source'] == source]
            assert rows[0]['start'] == f'{year}-10-01'
            for a, b in zip(rows, rows[1:]):
                assert (date.fromisoformat(b['start']) - date.fromisoformat(a['end'])).days == 1
            for p in rows:
                assert 1 <= (date.fromisoformat(p['end']) - date.fromisoformat(p['start'])).days + 1 <= 5
            assert rows[-1]['end'] == (f'{year}-11-02' if year == 2026 and source == 'VIIRS_SNPP_NRT'
                                      else f'{year}-11-14' if year >= 2025 else f'{year}-11-15')


def test_chunk_records_unexpected_empty_and_redacts_transport_errors():
    request = request_plan()[0]
    header = b'latitude,longitude,acq_date,satellite,instrument,confidence,frp,daynight,acq_time\n'
    entry, body = retrieve_chunk(request, 'secret-value', lambda url: header)
    assert entry['status'] == 'BLOCKED'
    assert entry['rows'] == 0
    assert entry['unresolved_anomaly'] == 'unexpected empty response'
    assert body is None
    calls = []
    def unavailable(url):
        calls.append(url)
        raise OSError('https://example.test/secret-value')
    entry, body = retrieve_chunk(request, 'secret-value', unavailable, pause=lambda delay: None)
    assert len(calls) == 3
    assert 'secret-value' not in str(entry)
    assert entry['unresolved_anomaly'] == 'unretrievable chunk'


def test_pull_saves_each_chunk_stops_on_empty_and_resumes_without_duplicate_ingestion(tmp_path):
    plan = request_plan()[:3]
    responses = [b'latitude,longitude,acq_date,satellite,instrument,confidence,frp,daynight,acq_time\n'
                 b'30,75,2011-10-01,Terra,MODIS,80,3,D,0500\n',
                 b'latitude,longitude,acq_date,satellite,instrument,confidence,frp,daynight,acq_time\n']
    calls = []
    def get(url):
        calls.append(url)
        return responses[len(calls) - 1]
    manifest = {'chunks': [], 'status': 'READY'}
    pull_requests(plan, manifest, tmp_path, 'key', get, pause=lambda delay: None)
    assert manifest['status'] == 'BLOCKED'
    assert len(calls) == 2 and len(manifest['chunks']) == 2
    assert len(list((tmp_path / 'raw').glob('*.csv'))) == 1
    first = manifest['chunks'][0].copy()
    calls.clear()
    pull_requests(plan[:1], manifest, tmp_path, 'key', get, pause=lambda delay: None)
    assert calls == []
    assert manifest['chunks'][0] == first


def test_partial_advertised_availability_is_disclosed_not_a_stop():
    partial = {'MODIS_SP': {'min_date': '2011-10-03', 'max_date': '2011-11-15'}}
    checks = availability_checks(partial, request_plan()[:1])
    assert checks[0]['status'] == 'partial advertised coverage; known missing product data'
    with pytest.raises(ValueError, match='absent for whole season'):
        availability_checks({'MODIS_SP': {'min_date': '2011-01-01', 'max_date': '2011-09-30'}}, request_plan()[:1])


def test_resume_refreshes_disclosures_after_outage_insertion(tmp_path):
    request = request_plan()[0]
    body = b'latitude,longitude,acq_date,satellite,instrument,confidence,frp,daynight,acq_time\n30,75,2011-10-01,Terra,MODIS,80,3,D,0500\n'
    old = {'seasons': [2011], 'satellite': 'TERRA', 'start_date': '2011-10-02', 'end_date': '2011-10-02'}
    manifest = {'chunks': [], 'outages': [old]}
    pull_requests([request], manifest, tmp_path, 'key', lambda url: body, pause=lambda delay: None)
    manifest['outages'].insert(0, {'seasons': [2011], 'satellite': 'AQUA', 'start_date': '2011-10-03', 'end_date': '2011-10-03'})
    def no_network(url): raise AssertionError('Cached chunk must not be downloaded again')
    pull_requests([request], manifest, tmp_path, 'key', no_network, pause=lambda delay: None)
    assert manifest['chunks'][0]['outage_disclosure_ids'] == [0, 1]


def test_resolution_preserves_stop_history_but_refreshes_current_classification():
    old = {'history': [{'type': 'second_stop'}], 'anomalies': [{'code': 'old'}],
           'required_source_seasons': [{'season': 2026, 'source': 'MODIS_NRT', 'availability_check': 'blocked'}],
           'summary': {'known_missing': 'blocked'}}
    checks = [{'season': 2026, 'source': 'MODIS_NRT', 'status': 'date-range available; completeness not asserted'}]
    resolve_preflight(old, checks, [], {'type': 'owner_resolution_second_stop', 'blocking': False})
    assert old['history'][0]['type'] == 'second_stop'
    assert old['historical_second_stop_findings'] == [{'code': 'old'}]
    assert old['anomalies'] == [] and old['active_blockers'] == []
    assert old['required_source_seasons'][0]['availability_check'] == checks[0]['status']
    assert old['credential_handling'] == 'Local .env only; keyed requests redacted. Earlier pre-key stops are preserved in snapshots.'


def test_preparation_refreshes_every_cached_chunk_without_a_pull():
    request = request_plan()[0]
    manifest = {'chunks': [dict(request, outage_disclosure_ids=[0])],
                'outages': [{'seasons': [2011], 'satellite': 'SNPP', 'start_date': '2011-10-02', 'end_date': '2011-10-02'}]}
    refresh_chunk_disclosures(manifest)
    assert manifest['chunks'][0]['outage_disclosure_ids'] == []
