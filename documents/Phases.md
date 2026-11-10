# Phases

## Delivery roadmap

The plan prioritizes a trustworthy research dashboard before adding predictive features. Phases can overlap only after their entry criteria are met; do not skip data provenance or validation to meet a visual deadline.

## Phase 0 — Scope, source and product freeze

**Goal:** convert the challenge statement and supplied material into a traceable source inventory.

Tasks:
- Freeze the challenge scope: prevention, detection, suppression and application to crewed spacecraft, stations, lunar habitats/rovers and Mars missions.
- Confirm “dashboard first, ML second” as the product hierarchy.
- Inventory every local CSV and reference PDF; record version, source, encoding, checksum and local path.
- Add investigation metadata from NASA PSI official records; separate investigation-level facts from file-level measurements.
- Create an investigation backlog for PSI records not included in the local pack. Prioritize PSI-98 SAFFIRE-I, PSI-101 SAME-R, PSI-60 SPICE analysis and PSI-62 BASS/BASS-II analysis; then evaluate DAFT/DAFT-2, PSI-10 Flame Design, PSI-117 FLEX CFD, FLEX-2, CFI, ACME BRE/E-FIELD/S-Flames and SLICE. See `data/additional_official_sources/` and `data/audit/ADDITIONAL_SOURCE_REGISTER.csv`.
- Define the first relevance scoring rubric and label it heuristic.

Exit criteria:
- Source inventory signed off.
- Five product documents agreed.
- No unknown dataset is presented as downloaded.
- Each investigation has a source page or is explicitly marked pending verification.

## Phase 1 — Data ingestion and audit

**Goal:** build a repeatable source catalogue and field-level quality report.

Tasks:
- Preserve raw source files unchanged in their category folders under `data/source_data/`. Each supplied CSV must have exactly one canonical home; consult `data/README_DATA_MAP.md`.
- Detect encoding, delimiter, data types, empty rows, duplicated rows, note rows, repeated samples and mixed-format cells.
- Create a schema dictionary: raw field, normalized field, unit, source, meaning, input/target/metadata status, prediction-time availability and missingness reason.
- Separate row types: experiment record, sample metadata, note/footnote, visualization reference, blank row and derived/analysed measurement.
- Link rows to experiment/test/sample identifiers without treating them as model features.
- Build validation warnings rather than silently repairing ambiguous records.

Specific supplied-file checks:
- FLEX: audit `Test end` categories (`Extinction`, `Disruption`, `Completion`); confirm what each means and whether follow-up duration is comparable.
- CFI-G inverse: 1,015 parsed rows include 861 fully empty rows; create a non-empty analysis view and preserve source unchanged.
- SPICE: audit 34 exact repeated rows; determine whether they are duplicate exports or repeated measurements before excluding them from any analytical view.
- SAFFIRE-II: separate nine sample records from two flow-visualization rows and four note rows.
- SAFFIRE-III: two supplied rows are conditions/metadata only, not a target table.
- SAME: four rows contain numeric measurements; four material notes refer back to the first four conditions and are not independent tests.

Exit criteria:
- Data-quality report exists for every source.
- Every cleaned/derived value traces back to raw values and a transform.
- No zero-fill for absent variables.

## Phase 2 — Investigation intelligence and ranking

**Goal:** deliver the first complete value even before ML.

Tasks:
- Build investigation cards and detail pages from source metadata.
- Implement search, filter and user-selected use cases.
- Implement transparent Relevance Score dimensions with editable weights and visible rationale.
- Add prevention/detection/suppression tags and application-context tags.
- Add source coverage and evidence completeness separately from relevance.
- Add missing-evidence warnings, including direct partial-gravity data gap.

Exit criteria:
- A user can ask “What is most relevant to smoke detection in a crew habitat?” and see ranked investigations with reasons and source links.
- Score components are visible and deterministic for the same input/version.
- Relevance is not described as hazard probability or safety certification.

## Phase 3 — Comparison Lab and Fire-Safety Atlas

**Goal:** help users compare experimental conditions rather than just read abstracts.

Tasks:
- Create side-by-side comparison across compatible tests/investigations.
- Show fuel/material, sample shape/size, burner/nozzle, atmosphere, oxygen, pressure, airflow, gravity, hardware and diagnostics where reported.
- Highlight same/different/unknown values.
- Add a hardware/investigation relationship graph (CIR/MDCA/MSG and relevant apparatus relationships only when source-verified).
- Add measurement-type views: video, thermocouple, radiometer, pressure, O2/CO2, anemometer, particle/smoke diagnostics and other reported sensors.
- Support export of comparison tables with citations and transformation notes.

Exit criteria:
- Users can compare at least two records and identify differences without mixing units or mislabelling missing data.
- Every comparison includes a comparability warning where definitions differ.

## Phase 4 — Evidence-grounded SI copilot

**Goal:** produce concise, traceable answers over the indexed research corpus.

Tasks:
- Index PSI metadata, data dictionaries, reports and selected scientific papers.
- Chunk by investigation/file/page/section; retain DOI, PSI ID, filename, page and version metadata.
- Implement retrieval filters by safety need, material/fuel, environment, hardware, mission context and data type.
- Require claim-level citations for factual assertions.
- Add “evidence found / evidence missing / interpretation” sections.
- Add contradiction detection and abstention when source material is insufficient.
- Store prompt and model version for reproducible answers.

Exit criteria:
- Sample questions produce answers with working source links/locators.
- A test set of unsupported questions triggers abstention rather than fabricated claims.
- Assistant distinguishes a source fact from its interpretation.

## Phase 5 — Predictive-model pilots

**Goal:** enable prediction only for a scientifically defined target and supported domain.

### 5A. FLEX extinction pilot

- Confirm whether the task is visible flame-extinction classification, time-to-event/survival analysis or a measured regression target.
- Resolve `Disruption` and `Completion` semantics; define censoring and observation windows.
- Use pre-test inputs only; exclude post-event fields and IDs.
- Group by run/test/sample to avoid leakage.
- Compare majority baseline, regularized logistic model and shallow Random Forest; consider survival modelling if events are censored.
- Report confusion matrix, recall/sensitivity, specificity, precision, F1, balanced accuracy, ROC-AUC/PR-AUC and calibration as appropriate.
- Report supported domain, independent experiment count and uncertainty separately.

### 5B. CFI-G branches

- Maintain separate normal and inverse branches.
- Verify `TFP` definition and all event codes against the NASA data dictionary/publication.
- Decide whether the target represents self-extinction, flow termination, ignition success, cool flame or another source-defined endpoint.
- Keep `XO2 before test` / `Xf before test` separate from post-test values.

### 5C. Flame spread

- Keep BASS-II/SAFFIRE as an explorer until a gravity-specific, interval-defined and calibrated spread-rate target is verified.
- Investigate analysed NASA products and calibrated video front positions.
- Never substitute 1-g spread rate for a microgravity target.

### 5D. Soot / smoke

- Obtain analysed SPICE smoke-point or soot diagnostic output.
- Choose one primary target (smoke-point length, luminous flame length, soot volume fraction or a defined smoke-emission class); never interchange them.
- Record camera calibration and image-processing provenance if target is image-derived.

Exit criteria:
- No model is released without a frozen target definition, group-aware validation, baseline comparison and applicability-domain gate.
- Model version, feature list and supported range are stored with every prediction.

## Phase 6 — High-fidelity visual experience

**Goal:** make the research product memorable without weakening scientific clarity.

Tasks:
- Implement the scroll-led landing story described in `Design.md`.
- Add a conceptual gravity/flame teaching scene, particle/smoke transport explainer and mission context scenes.
- Add NASA GLB models from the asset manifest after verifying the file, license/attribution, scale and performance.
- Convert FBX sources offline to GLB; create compressed LOD variants.
- Implement reduced-motion and low-bandwidth fallbacks.
- Run real user testing with a student, combustion researcher and aerospace/fire-safety reviewer.

Exit criteria:
- All motion teaches or navigates; 3D assets are lazy-loaded and have fallbacks.
- The dashboard is still fully usable with 3D and animation disabled.

## Phase 7 — Release hardening

- Test keyboard access, screen readers, mobile, low bandwidth and reduced motion.
- Verify all citations, download links, model attribution and data-license statements.
- Add error states for unavailable NASA PSI services or incomplete records.
- Run security review for file upload, query handling, API keys and LLM prompt injection from retrieved files.
- Publish a changelog for source versions, ranking rubrics, schemas and models.
- Add a clear research decision-support disclaimer.

## Release gates

| Gate | Required before release |
|---|---|
| Data integrity | Immutable raw layer, source/version, unit and parser audit |
| Research catalogue | Every investigation has verified source metadata or a visible pending state |
| Ranking | Transparent dimensions, weights, rationale and non-safety disclaimer |
| SI | Claim-level citations, refusal/abstention and source/interpretation separation |
| ML | Frozen target, independent-group validation, calibration/uncertainty and domain gate |
| UI | Responsive, accessible, useful without animation/3D |
| Assets | Source page, format, license/usage check, optimization and attribution |


## Data segregation gates

Before implementation begins, preserve the four canonical source categories under `data/source_data/`. Keep the three extinction branches separate within their track. Keep the detection evidence track separate from SPICE soot/smoke-point data. Every ingestion/normalization script must read `data/audit/MODEL_DATA_ASSIGNMENT.csv`, apply explicit column mappings, preserve source fields and output a provenance record. Do not auto-train a model merely because a category directory contains a CSV. The matching `data/model_readmes/` file is the readiness contract.

## Additional NASA data acquisition priorities

1. PSI-60 for analysed SPICE soot/volume-fraction outputs.
2. PSI-62 for two-color tomography and BASS/BASS-II flame spread-rate analysis.
3. PSI-98 for SAFFIRE-I flame growth, imagery and environmental sensor streams.
4. PSI-101 for SAME-R particle-size/morphology and detector context.
5. PSI-117 and PSI-10 as separate simulation/physics reference branches, not as extra independent experimental rows.
6. DAFT/DAFT-2 for dust/background aerosol and sensor discrimination context.

Only place a newly retrieved file under a local `source_data` category after its official PSI record, version, DOI/license and file inventory have been verified. Do not create empty fake CSVs for missing sources.


### Partial-gravity evidence update

A NASA NTRS record now identifies published LUCI simulated-lunar-gravity flammability results. This is external NASA publication evidence, not a supplied PSI CSV. Include it as a separately sourced partial-gravity evidence item after checking the publication and original data package. Monitor the NASA FM² project page for future released records; a project page is not a measured dataset.
