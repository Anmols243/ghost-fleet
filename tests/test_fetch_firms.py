from datetime import date
import pytest

from scripts import fetch_firms


def test_chunk_ranges_cover_season_without_gaps():
    assert list(fetch_firms.chunk_ranges(date(2020, 10, 1), date(2020, 11, 15))) == [
        (date(2020, 10, 1), date(2020, 10, 10)),
        (date(2020, 10, 11), date(2020, 10, 20)),
        (date(2020, 10, 21), date(2020, 10, 30)),
        (date(2020, 10, 31), date(2020, 11, 9)),
        (date(2020, 11, 10), date(2020, 11, 15)),
    ]


def test_validate_rejects_error_body():
    with pytest.raises(ValueError, match="Invalid MAP_KEY"):
        fetch_firms.validate("Invalid MAP_KEY: request denied")


def test_validate_accepts_csv_header():
    fetch_firms.validate("latitude,longitude,frp\n30,75,4\n")


def test_sources_for_season_uses_nrt_only_for_current_season():
    assert fetch_firms.sources_for_season(2026, current_year=2026) == (
        "MODIS_NRT", "VIIRS_NOAA20_NRT", "VIIRS_SNPP_NRT"
    )
    for season in range(2020, 2026):
        assert fetch_firms.sources_for_season(season, current_year=2026) == (
            "MODIS_SP", "VIIRS_NOAA20_SP", "VIIRS_SNPP_SP"
        )
    assert fetch_firms.sources_for_season(2026, current_year=2027) == (
        "MODIS_SP", "VIIRS_NOAA20_SP", "VIIRS_SNPP_SP"
    )
