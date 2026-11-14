"""Download raw FIRMS standard-product CSVs for the study seasons."""

from datetime import date, timedelta
import csv
import io
import json
import logging
from pathlib import Path
from urllib.request import urlopen

from dotenv import dotenv_values

ROOT = Path(__file__).resolve().parents[1]
BBOX = "73.8,27.6,77.6,32.6"
SOURCES = ("MODIS_SP", "VIIRS_NOAA20_SP", "VIIRS_SNPP_SP")


def validate(body):
    """Reject HTTP-200 error text as well as missing CSV headers."""
    if not body.splitlines() or "latitude,longitude" not in body.splitlines()[0]:
        raise ValueError(f"Invalid FIRMS CSV: {body[:300]}")


def chunk_ranges(start, end, days=10):
    """Yield inclusive, contiguous ranges of at most days days."""
    if days < 1 or end < start:
        raise ValueError("Invalid date range or chunk size")
    while start <= end:
        stop = min(start + timedelta(days=days - 1), end)
        yield start, stop
        start = stop + timedelta(days=1)


def main():
    key = dotenv_values(ROOT / ".env").get("FIRMS_MAP_KEY")
    if not key:
        raise ValueError("Set FIRMS_MAP_KEY in the repository .env file")
    output = ROOT / "data" / "raw"
    output.mkdir(parents=True, exist_ok=True)
    manifest = []
    for year in range(2020, 2027):
        for source in SOURCES:
            for start, end in chunk_ranges(date(year, 10, 1), date(year, 11, 15)):
                rows = []
                header = None
                for first, last in chunk_ranges(start, end, days=5):
                    days = (last - first).days + 1
                    url = f"https://firms.modaps.eosdis.nasa.gov/api/area/csv/{key}/{source}/{BBOX}/{days}/{first}"
                    try:
                        with urlopen(url, timeout=120) as response:
                            body = response.read().decode("utf-8-sig")
                        # Redact before validation so error excerpts cannot disclose the key.
                        validate(body.replace(key, "<REDACTED>"))
                    except Exception as error:
                        raise RuntimeError(
                            f"{source} {first}..{last}: {str(error).replace(key, '<REDACTED>')}"
                        ) from None
                    reader = csv.reader(io.StringIO(body))
                    current_header = next(reader)
                    if header is not None and current_header != header:
                        raise ValueError(f"Inconsistent CSV headers for {source} {start}")
                    header = current_header
                    rows.extend(row for row in reader if row)
                filename = f"{source}_{start}_{end}.csv"
                with (output / filename).open("w", encoding="utf-8", newline="") as handle:
                    writer = csv.writer(handle)
                    writer.writerow(header)
                    writer.writerows(rows)
                manifest.append({
                    "source": source, "season": year,
                    "start": str(start), "end": str(end), "bbox": BBOX,
                    "historical_only": source == "VIIRS_SNPP_SP",
                    "rows": len(rows), "file": filename,
                })
                temporary = output / "manifest.json.tmp"
                temporary.write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")
                temporary.replace(output / "manifest.json")
                logging.info("%s %s..%s: %s rows", source, start, end, len(rows))
                if not rows:
                    logging.warning("Zero rows: %s %s..%s", source, start, end)


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO, format="%(levelname)s %(message)s")
    main()
