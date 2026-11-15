"""Acquisition-time appendix: retained MODIS daytime observations, UTC."""
import pandas as pd

if __package__:
    from .appendix_common import AUDIT, PARQUET, provenance, read_audit, write_json
else:
    from appendix_common import AUDIT, PARQUET, provenance, read_audit, write_json

CAPTION = ('The timing of retained daytime detections changes across this record. '
           'This summary does not measure orbital drift or the effect of drift on counts.')


def clock_time(minutes):
    if minutes is None:
        return None
    seconds = round(minutes * 60)
    return f'{seconds // 3600:02d}:{seconds % 3600 // 60:02d}:{seconds % 60:02d}'


def build_timing(frame, audit):
    rows = []
    for year, coverage in audit['coverage'].items():
        season = int(year)
        period = frame[frame.date.ge(f'{year}-10-01') & frame.date.le(coverage['cutoff'])
                       & frame.daynight.eq('D')]
        for sensor in ['MODIS_AQUA', 'MODIS_TERRA']:
            observations = period[period.sensor.eq(sensor)]
            if observations.empty:
                q1 = median = q3 = n = days = None
            else:
                times = pd.to_datetime(observations.acq_time, format='%H:%M', errors='raise')
                minutes = times.dt.hour * 60 + times.dt.minute
                q1, median, q3 = [float(minutes.quantile(q)) for q in [.25, .5, .75]]
                n, days = len(observations), int(observations.date.dt.normalize().nunique())
            rows.append({'season': season, 'satellite': sensor,
                         'start': f'{year}-10-01', 'cutoff': coverage['cutoff'],
                         'median_minutes_utc': median, 'q1_minutes_utc': q1,
                         'q3_minutes_utc': q3, 'median_utc': clock_time(median),
                         'q1_utc': clock_time(q1), 'q3_utc': clock_time(q3),
                         'n': n, 'represented_days': days})
    return {'schema': 'acquisition-timing v1', 'caption': CAPTION, 'rows': rows,
            'statistic': 'Retained daytime (D) detections per MODIS satellite per season; '
                         'UTC minute-of-day median and linear-interpolated quartiles. '
                         'Missing observations are null; detection-weighted, not pass-weighted.',
            'coverage': audit['coverage']}


def main():
    timing = build_timing(pd.read_parquet(PARQUET), read_audit())
    timing['sources'] = provenance(__file__, [PARQUET, AUDIT])
    write_json('timing.json', timing)
    for row in timing['rows']:
        print(row['season'], row['satellite'], row['median_utc'],
              row['q1_utc'], row['q3_utc'], row['n'], row['represented_days'])


if __name__ == '__main__':
    main()
