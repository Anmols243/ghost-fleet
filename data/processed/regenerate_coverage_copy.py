import json
import re
from pathlib import Path
from scripts.audit import conclusion

r = json.loads(Path('frontend/audit.json').read_text())
p3 = r['presets'][2]
assert p3['comparison_end_mm_dd'] == '11-14'
line = conclusion(p3)
for filename in ['docs/BUILD_BRIEF.md', 'docs/AUDIT_SPEC.md', 'docs/COPY_PACK.md', 'README.md']:
    p = Path(filename)
    s = p.read_text(encoding='utf-8').replace('20.7%', f"{abs(p3['change_W_pct']):.1f}%")
    if filename.endswith('BUILD_BRIEF.md'):
        s = re.sub(r'P3: "Recorded change[^\n]+"', lambda m: 'P3: "' + line + '"', s)
        a, b = s.index('The daily per-sensor'), s.index('## 6.')
        s = s[:a] + '''The daily per-sensor series are single-sensor recorded cell-days, never
"detections". A cell-day may be recorded by multiple sensors: never stack
these series as components of W. W is the union, not their sum.
S-NPP recorded cell-days are present through Nov 2 and zero from Nov 3.
Nov 15, 2026 is unverified / not yet retrieved, represented as null, and
excluded from totals. P3 uses Oct 1-Nov 14 for both 2025 and 2026.

''' + s[b:]
        s = s.replace('Mean steadiness E stands: raw 0.520, degraded 0.216, ratio\n0.086.',
                      'Common-interval mean E: raw 0.403, degraded 0.252, ratio 0.086.\nFormula: mean |J[t] - J[t-1]| over transitions 2018->2019 through\n2024->2025. These are archived reference-implementation results, not\nrerun on canonical data; the earlier mixed-period E summary is superseded.')
    if filename.endswith('AUDIT_SPEC.md'):
        a, b = s.index('P3 snpp_cessation'), s.index('P3 is the within-season')
        s = s[:a] + f"P3 snpp_cessation - 2025 vs 2026, Oct 1-Nov 14 in BOTH periods:\n  W: {p3['W_a']:,} -> {p3['W_b']:,} ({p3['change_W_pct']:+.1f}%)\n  U: {p3['U_a']:,} -> {p3['U_b']:,} ({p3['change_U_pct']:+.1f}%)\n  C: 0 -> 0; difference 0 pp.\n\n" + s[b:]
        a = s.index('## Data contract')
        s = s[:a] + '''## Coverage and comparison interval

Verified common cutoff: Nov 14. P3 compares Oct 1-Nov 14 in BOTH 2025 and
2026. Nov 15, 2026 is unverified / not yet retrieved, excluded from all
2026 totals and P3; its daily values are null, never ordinary zeros.
2025 daily arrays retain Nov 15 for other uses, but P3 omits it.
Retrieval timestamp, requested interval, per-season cutoff/status/product/
sources, grid specification and bbox are in frontend/audit.json.
The 2026 NRT snapshot remains provisional; complete-looking retrieved
counts do not prove orbital or cloud completeness.

''' + s[a:]
        s = s.replace('mean year-to-year steadiness of the addition excess E — raw 0.520,\n   degraded 0.216, ratio control 0.086;',
                      'common-interval mean E = mean |Delta J| over transitions 2018->2019\n   through 2024->2025: raw 0.403, degraded 0.252, ratio 0.086; archived\n   reference-implementation results, not rerun on canonical data;')
        s = s.replace('two implementations differ ~1% on event totals (cell rounding).',
                      'equal seasonal row counts in both implementations, not a record-level\n   exact match; event-total divergence is an archived sensitivity note,\n   with cause unknown, not proven to be cell rounding.')
    if filename.endswith('COPY_PACK.md'):
        a = s.index('"Recorded change', s.index('### 4c.'))
        b = s.index('### 4d.', a)
        s = s[:a] + '"' + line + '"\n\n' + s[b:]
        a = s.index('```json') + len('```json')
        b = s.index('```', a)
        copy = json.loads(s[a:b])
        copy['conclusion_templates']['interruption'] = line
        s = s[:a] + '\n' + json.dumps(copy, ensure_ascii=False, indent=2) + '\n' + s[b:]
    if filename == 'README.md':
        a = s.index('- 26 seasons,')
        b = s.index('\n', a)
        c = r['dataset_counts']
        s = s[:a] + f"- 26 seasons, 2001-2026; {c['retrieved_detections']:,} detections retrieved; {c['standardized_verified_detections']:,} retained after confidence rules and the verified cutoff. The 2026 interval ends Nov 14; Nov 15 is unverified and excluded." + s[b:]
        s += '\nCoverage: P3 compares Oct 1-Nov 14 in both periods: ' + f"{p3['W_a']:,} -> {p3['W_b']:,} recorded cell-days ({p3['change_W_pct']:+.1f}%, relative to the 2025 common-interval count)." + ' Nov 15, 2026 is unverified / not yet retrieved (null, excluded). Actual-fire change is not measured.\n'
    p.write_text(s, encoding='utf-8')
Path('data/processed/frozen_acceptance_lines.json').write_text(
    json.dumps({p['id']: conclusion(p) for p in r['presets']}, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print('Coverage copy regenerated.')
