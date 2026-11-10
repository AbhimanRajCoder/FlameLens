# FlameLens data map — read this before using any CSV

This file is the authoritative map of the bundled data. The actual source CSVs are physically separated by their primary analytical category under `data/source_data/`. Each CSV appears in exactly one category folder; do not merge all files into a single training table.

## Data categories

| Folder | Category | Contents | Permitted initial use |
|---|---|---|---|
| `01_flame_extinction/` | Flame extinction | FLEX droplets; CFI-G normal gas flames; CFI-G inverse gas flames | Separate regime-specific branches. FLEX is the first candidate; CFI-G requires its own target audit. |
| `02_flame_spread/` | Flame spread / solid-fuel flammability | BASS-II; SAFFIRE-II; SAFFIRE-III | NASA experiment explorer and evidence comparison. No general predictor until comparable gravity-specific targets are verified. |
| `03_soot_smoke/` | Soot / smoke point | SPICE | Experiment explorer and input-condition index. A supervised target must be recovered from analysed SPICE products first. |
| `04_smoke_detection/` | Smoke / aerosol detection | SAME | Detection evidence explorer. Not a SPICE smoke-point training set. |

## Source files supplied in this pack

### Flame extinction

- `01_flame_extinction/PSI-69_FLEX/PSI-69_Experimental table_FLEX (1).csv`
- `01_flame_extinction/PSI-159_CFI-G_Normal/PSI-159_Experimental table_CFI-G_Normal Flames.csv`
- `01_flame_extinction/PSI-159_CFI-G_Inverse/PSI-159_Experimental table_CFI-G_Inverse Flames.csv`

### Flame spread

- `02_flame_spread/PSI-25_BASS-II/PSI-25_Experimental table_BASS-II.csv`
- `02_flame_spread/PSI-99_SAFFIRE-II/PSI-99_Experimental table_SAFFIRE-2.csv`
- `02_flame_spread/PSI-100_SAFFIRE-III/PSI-100_Experimental table_SAFFIRE-3.csv`

### Soot / smoke point

- `03_soot_smoke/PSI-107_SPICE/PSI-107_Experimental table_Spice.csv`

### Smoke detection

- `04_smoke_detection/PSI-102_SAME/PSI-102_Experimental table_SAME.csv`

## Important interpretation rules

1. **A category folder does not mean the CSV is training-ready.** Each dataset README states whether it is a primary model candidate, supporting evidence, or explorer-only.
2. **No target may be inferred from a suggestive column name.** Decode NASA event codes and measurement definitions from the official data dictionary/report before training.
3. **Rows are not necessarily independent experiments.** Group by the underlying test/run/sample. Repeated frames, repeated sensor records and explanatory note rows are not independent samples.
4. **The raw CSV files are kept byte-for-byte unchanged.** Corrected headers, normalized units, deduplication, row-type classification and derived features belong in a separate `processed/` area created by the implementation, with provenance.
5. **Null is not zero.** Missing or unavailable measurements must remain null with a missingness reason.
6. **Use the full model-specific readme before touching a dataset.** The readmes explain allowed inputs, targets, metadata, prohibited leakage and next data needed.
7. `PSI-102 SAME` belongs to **smoke/aerosol detection**, while `PSI-107 SPICE` belongs to **soot formation/smoke-point combustion physics**. These are different scientific tasks.
8. `PSI-98 SAFFIRE-I`, `PSI-101 SAME-R`, `PSI-60` SPICE analysis, and `PSI-62` BASS/BASS-II analysis are additional high-value sources listed in `additional_official_sources/`. Their official source records are documented, but their original data files were not part of the upload and are not falsely represented as bundled.
9. **LUCI** is an external NASA/NTRS source for simulated lunar-gravity flammability results; it is not a newly supplied PSI dataset. **FM²** is a NASA lunar-gravity project to monitor for actual data release. Keep both outside the local PSI raw categories until downloadable source files and provenance are verified.

## Files supporting implementation

- `MODEL_DATA_ASSIGNMENT.csv`: machine-readable source-to-track mapping.
- `FEATURE_TARGET_MATRIX.csv`: model inputs, candidate outputs, metadata and leakage rules.
- `ADDITIONAL_SOURCE_REGISTER.csv`: extra NASA sources and their use in the project.
- `DATASET_AUDIT.csv`: audit of the eight supplied tables.
- `NASA_PSI_EXPANSION_BACKLOG.csv`: broader investigation expansion queue.
- `model_readmes/`: detailed per-track instructions.

## Do not claim

The pack contains no verified trained model weights. There is no local SAFFIRE-I, SAME-R, PSI-60, PSI-62 or DAFT raw dataset. The additional source notes are research and acquisition instructions, not substitutes for measured files.


## Acquiring additional NASA data

Use each investigation's official NASA PSI record as the authority for current version, license, files and DOI. Download the relevant `Experimental table`, `Raw Data`, `Reference Data`, `Reports`, `Science Documents` or `Engineering Documents` separately; do not infer that every folder has every measurement type. Record the exact file name, source version, retrieval date, license, checksum and parent investigation.

Useful entry points:
- NASA PSI repository: https://psi.nasa.gov/physci/repo
- NASA PSI investigation search: https://psi.nasa.gov/physci/repo/search?data_source=psi&data_type=investigation
- NASA PSI open-data registry: https://registry.opendata.aws/nasa-psi/
- NASA PSI data/source explanation: https://www.nasa.gov/physical-sciences-informatics-psi/history-of-physical-science-informatics/

The NASA PSI registry advertises an open AWS bucket, but confirm the requested investigation path and file version in the current repository before using any S3 object. NASA requires citing PSI collections by their persistent identifier/DOI when available.
