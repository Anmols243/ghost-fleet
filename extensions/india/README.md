# Isolated geographic-extension workspace

Contract: ../../docs/INDIA_EXTENSION_PROMPT.md and the geographic amendment in
../../docs/BUILD_BRIEF.md. No pipeline implementation or data pull in this task.

- data/raw/: extension-only response bodies.
- data/manifests/: request, validation, coverage and provenance manifests.
- data/standardized/: extension-only retained records.
- data/outputs/: generated candidates and verification artifacts.

These paths are outside every existing wildcard ingestion root. Do not copy new
records into backend/data/raw/ or the old root data/ directory. Keep canonical
inputs and all five frozen frontend exports untouched. Bulk data is ignored here;
only reviewed, validated public output may later be published as frontend/india.json.
Keys come from .env only, never from committed files. No release is approved by
this directory setup. See the prompt for the 22:30 IST abort gate.
