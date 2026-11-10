# FlameLens — NASA Fire-Safety Intelligence Dashboard

This is the project handoff for Quoder. Start with `QUODER_BOOTSTRAP_PROMPT.md`, then `START_HERE.txt`, the five specifications in `documents/`, and `data/README_DATA_MAP.md`.

The eight supplied NASA CSVs are physically segregated under `data/source_data/` by their primary use. The source tables are preserved unchanged. Per-model input/target/readiness rules are documented in `data/model_readmes/` and machine-readable audit files in `data/audit/`.

Additional NASA sources—including PSI-98, PSI-101, PSI-60, PSI-62, LUCI, FM², PSI-10, PSI-117 and DAFT/DAFT-2—are documented in `data/additional_official_sources/`. Their local file status is explicit: source notes are not substitutes for data files, and missing datasets have not been fabricated.

No trained ML weights or 3D GLB/FBX binaries were supplied. See `MODEL_ARTIFACT_STATUS.txt` and `assets/models/DOWNLOAD_STATUS.txt`.
