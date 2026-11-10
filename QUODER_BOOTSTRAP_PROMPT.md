# Quoder bootstrap prompt — FlameLens

You are implementing **FlameLens**, an evidence-grounded NASA microgravity combustion and spacecraft fire-safety intelligence dashboard. Treat this folder as the project handoff and source of truth.

## Read before coding

1. Read `documents/Architecture.md`, `documents/Design.md`, `documents/Phases.md`, `documents/PRD.md` and `documents/Rules.md` in full.
2. Read `data/README_DATA_MAP.md`.
3. Read all relevant files in `data/model_readmes/` before parsing or using any dataset.
4. Read `data/audit/MODEL_DATA_ASSIGNMENT.csv`, `data/audit/FEATURE_TARGET_MATRIX.csv` and `data/audit/ADDITIONAL_SOURCE_REGISTER.csv`.
5. Read the relevant `data/additional_official_sources/*.md` notes before adding external NASA evidence.
6. Check `assets/models/DOWNLOAD_STATUS.txt` before assuming 3D model binaries exist.

## Non-negotiable product direction

Build a **research intelligence dashboard first**, not a generic AI landing page and not a prediction form with decorative NASA content. The core jobs are to discover, rank, compare and interpret NASA fire-safety investigations across prevention, detection and suppression for spacecraft, stations, lunar habitats, pressurized rovers and Mars missions.

The three predictive tracks are subordinate and gated:
- Flame extinction: start with PSI-69 FLEX after its event labels/target and grouping are audited. Keep CFI-G normal and inverse separate.
- Flame spread: use BASS-II and SAFFIRE source tables as an experiment explorer until a calibrated, gravity-specific target is recovered. Use PSI-62 analysis and SAFFIRE-I data as acquisition priorities. LUCI is external NASA simulated-lunar-gravity evidence and must remain a separately sourced branch.
- Soot/smoke point: use PSI-107 SPICE as an input-condition explorer until a proper smoke-point/soot target is obtained from PSI-60 analysed products.
- Smoke detection is a separate evidence track: SAME, SAME-R and DAFT/DAFT-2 must not be mixed into the SPICE soot-point target.

## Data handling rules

- The canonical supplied CSVs live under `data/source_data/` in exactly one category folder. Do not duplicate them into multiple model folders or combine them into a giant training table.
- Do not modify source CSVs. Create normalized/cleaned/row-classified/model tables only under `data/processed/` with source IDs, source row/test IDs, units, missingness reasons and transformation version.
- Never train on post-event fields, IDs, timestamps, comments, file names or camera labels as shortcuts unless a specific prediction-time task justifies them.
- Never infer the meaning of `TFP`, `SE`, `FT`, `?-g`, or undocumented measurement codes. Find source documentation first.
- Do not count all-empty rows, exact duplicated exports, notes, explanatory rows or repeated camera frames as independent tests.
- Null is not zero. Do not invent absent oxygen, pressure, temperature, target labels, detector alarms, gravity levels or NASA records.
- Keep raw experiment, derived analysis, simulation, figure-digitized data and AI-generated content as different evidence types.
- Do not treat PSI-60, PSI-62 or PSI-117 derived analyses as new independent flight experiments. Link derived data to the original source experiments.
- LUCI is NASA publication/flight-opportunity evidence for simulated lunar gravity, not an uploaded PSI CSV. FM² has a NASA project page but no dataset in this pack; do not synthesize FM² records.

## Product and UI expectations

Follow `documents/Design.md` and `documents/PRD.md`. The design should feel like a high-end space-science observatory: restrained dark palette, deliberate typography, elegant stars/orbits, precise data visualization, meaningful 3D and carefully choreographed scroll chapters. Avoid generic AI/vibe-coded layouts, random neon, excessive glass cards, fake telemetry and filler statistics. Every animation must teach or orient; no scroll-jacking. Respect reduced motion and accessibility.

The landing page should introduce microgravity combustion and then guide the user through prevention, detection and suppression. Make research tools accessible without forcing the user through the full animation. Use real evidence and clear citations. Use 3D assets only after checking their license, attribution and actual download status; lazy-load them and provide static fallbacks.

## Build order

1. Establish app structure, design system, routes, responsive layout, data/source types and provenance components.
2. Build investigation catalogue and source ingestion/normalization with schema validation.
3. Build mission overview, relevance ranking, explorer, investigation detail, comparison lab and evidence graph.
4. Build the SI research copilot with retrieval-first answers and visible source citations.
5. Build the data-quality and model-readiness dashboard.
6. Build the FLEX model pipeline only after target audit, with grouped validation and calibrated output. Implement the other model branches only after their readiness gates pass.
7. Add meaningful 3D learning scenes and optimized assets.
8. Add tests for data transformations, rankings, citations, leakage rules, accessibility and error states.

## Delivery expectations

Work in small, testable stages. Before implementing any feature, distinguish what is in the supplied source files from what is only a recommended future source. Do not claim a model, data archive, sensor measurement, 3D binary or NASA validation exists unless the corresponding file/result is present and traceable. The end product must be a functional, maintainable, scientifically defensible web project—not just a mockup.
