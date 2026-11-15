"""Frozen input provenance and deterministic writing for optional appendices."""
import hashlib
import json
from pathlib import Path

BASE = Path(__file__).resolve().parents[1]
FRONTEND = BASE.parent / 'frontend'
PARQUET = BASE / 'data/processed/standardized.parquet'
AUDIT = FRONTEND / 'audit.json'
LABELS = {'MODIS_TERRA': 'Terra', 'MODIS_AQUA': 'Aqua',
          'VIIRS_SNPP': 'Suomi NPP', 'VIIRS_NOAA20': 'NOAA-20'}


def selection_name(sensors):
    return '+'.join(LABELS[sensor] for sensor in sensors)


def read_audit():
    return json.loads(AUDIT.read_text(encoding='utf-8'))


def provenance(generator, inputs):
    paths = [Path(__file__), Path(generator), *inputs]
    hashes = {}
    for path in paths:
        raw = path.read_bytes()
        if path.suffix in {'.py', '.json', '.md'}:
            raw = raw.replace(b'\r\n', b'\n')
        hashes[path.relative_to(BASE.parent).as_posix()] = hashlib.sha256(raw).hexdigest()
    return {'sha256': hashes, 'hash_convention': 'LF for text; exact bytes for binary',
            'reproduce': f'cd backend && python scripts/{Path(generator).name}'}


def write_json(name, data):
    # Binary write prevents platform newline conversion: reproducible on Windows/Unix.
    (FRONTEND / name).write_bytes((json.dumps(data, indent=2, ensure_ascii=False,
                                             allow_nan=False) + '\n').encode('utf-8'))
