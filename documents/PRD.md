# Product Requirements Document (PRD)

## 1. Product overview

**Name:** FlameLens  
**Positioning:** NASA microgravity combustion and spacecraft fire-safety intelligence dashboard.  
**Primary users:** professors, graduate/undergraduate students, combustion researchers, aerospace engineers, spacecraft fire-safety and systems researchers.

FlameLens turns NASA Physical Sciences Informatics (PSI) combustion investigations into a searchable, comparable and interpretable research workspace. It helps users identify evidence relevant to fire prevention, detection and suppression for crewed spacecraft, stations, lunar habitats, pressurized rovers and future Mars missions.

## 2. Problem statement

NASA has accumulated decades of low-gravity combustion evidence. The findings are distributed across investigation metadata, raw and analysed tables, reports, videos, sensors and publications. Users can struggle to discover relevant investigations, understand experimental conditions, compare results across different campaigns and distinguish direct evidence from extrapolation.

FlameLens should reduce that discovery and interpretation burden without overstating what the data proves.

## 3. Product goals

1. Make relevant PSI combustion investigations discoverable in minutes.
2. Rank investigations for a selected fire-safety need using an explainable, adjustable relevance rubric.
3. Summarize objectives, approach, fuel/material, sample/burner shape and size, atmosphere, oxygen, pressure, airflow, gravity regime, hardware and diagnostics.
4. Compare tests within an investigation and comparable tests across investigations.
5. Explain how evidence informs prevention, detection and suppression.
6. Identify missing evidence and limits, including gaps for partial-gravity environments.
7. Provide an evidence-grounded SI research copilot with source citations.
8. Offer predictive ML only where verified targets and independent experimental data support it.
9. Make the research understandable through a premium space-themed interactive experience and carefully chosen 3D teaching assets.

## 4. Non-goals

- Not an operational spacecraft fire response manual.
- Not a fire-safety certification system or substitute for NASA engineering review.
- Not a CFD solver, detailed chemical-kinetics package or validated combustion digital twin.
- Not a general-purpose chatbot that answers without PSI evidence.
- Not a rocket/propellant combustion dashboard; the challenge states that these topics are generally outside PSI fire-safety scope.
- Not a claim that microgravity data directly validates lunar or Martian partial-gravity fire safety.
- Not a requirement to have three supervised ML models at launch.

## 5. User personas and jobs-to-be-done

### Research student

“I need to find which NASA investigations contain conditions similar to my project and cite the right source.”

### Combustion researcher

“I need to compare fuel/material, oxygen, flow, geometry, gravity and measured outcomes without flattening away experimental differences.”

### Aerospace systems engineer

“I need a clear, defensible view of which research informs a fire-safety function and where the evidence does not cover my habitat scenario.”

### Faculty / reviewer

“I need a transparent explanation, traceable citations, source versions, limitations and an exportable evidence summary.”

## 6. Core modules and functional requirements

### FR-01 — Mission Overview

- Show investigation totals by indexed source, not assumed total NASA holdings.
- Show distribution across prevention, detection, suppression and contextual research.
- Show data availability and quality separately from investigation count.
- Show a visible evidence-gap panel (for example, direct partial-gravity combustion data gap as described in the challenge brief).
- Every metric must have a definition, source and last-updated timestamp.

**Acceptance:** a user can tell what is indexed, what is not, and which parts have usable files.

### FR-02 — Investigation Ranking

- Select a question/use case: prevention, detection, suppression or habitat transfer.
- Select target environment: spacecraft/station, lunar habitat, pressurized lunar rover, Mars transit or Mars surface.
- Rank investigations with a transparent relevance score and per-dimension rationale.
- Allow users to tune weights and sort by score, data availability, measurement richness or date.
- Explain that relevance is not hazard probability or safety certification.

**Acceptance:** selecting “smoke detection in crew habitat” produces ranked investigations and a visible “why it ranks” breakdown.

### FR-03 — Investigation Explorer

- Search by PSI ID, title, acronym, objectives, fuel/material, hardware, diagnostic, safety function and measurement.
- Filter by gravity regime, platform, oxygen, pressure, airflow, sample geometry and file availability when reported.
- Display original source labels next to normalized labels.
- Show a source-backed detail page for each investigation.

**Acceptance:** all supplied local sources are searchable and the user can trace each record to a PSI page/file.

### FR-04 — Investigation detail

Display, where available:
- Objectives, research question, hypothesis and approach.
- Platform, facility, hardware and experimental apparatus.
- Fuel/material, sample shape/size, burner/nozzle geometry.
- Oxygen concentration, diluents, pressure, airflow, gravity and other conditions.
- Diagnostics/sensors and what each measures.
- Experimental variables and how tests were varied.
- Data products, measured outcomes, sample/test identifiers and data-quality notes.
- Related investigations, publications, DOI and citation instructions.

**Acceptance:** unknown fields display “Not reported in this source” rather than guessed values.

### FR-05 — Comparison Lab

- Compare 2–4 investigations or tests.
- Align normalized fields only when the underlying definitions are compatible.
- Show units and conversions, original source labels, missingness, range and notes.
- Provide a “same / different / unknown / not comparable” summary.
- Export a source-linked comparison table.

**Acceptance:** no silent unit conversion, no missing-to-zero substitution, no false equivalence between different targets.

### FR-06 — Fire-Safety Atlas

- Organize evidence into prevention, detection, suppression and cross-cutting research.
- Show links between investigation, apparatus/hardware, sensor and fire-safety need.
- Distinguish direct evidence from adjacent technology transfer.
- Support Earth applications as a separate “transfer opportunity” view, not as proof of equal performance in Earth and microgravity.

**Acceptance:** users can trace a displayed relationship back to an investigation or supporting publication.

### FR-07 — SI Research Copilot

Example questions:
- “Which investigations are most relevant to smoke detection in a crew cabin?”
- “Compare SAFFIRE-II and BASS-II material/flow conditions.”
- “What did FLEX test about CO2 and helium suppression?”
- “Which sensors were used to measure the plume?”
- “What evidence is missing for a 30% oxygen lunar habitat?”

Requirements:
- Retrieve PSI records and reports before answering.
- Cite each material factual claim with investigation/file/page locator.
- Separate source facts, cross-source synthesis and engineering interpretation.
- Display missing or contradictory evidence.
- Abstain when sources do not support the answer.

**Acceptance:** no answer presents unsupported numeric values, false citations or invented test details.

### FR-08 — Data & Model Lab

- Show file inventory, raw row count, non-empty row count, duplicates, missing fields and parse warnings.
- Show field dictionary and input/target/metadata classification.
- Show model readiness by branch and target definition.
- Show grouped validation, baseline comparison, calibration and supported domain for any active model.
- Show model version and feature list.

**Acceptance:** no model appears “available” without a validated target, model artifact, validation record and domain policy.

### FR-09 — Predictive features

- FLEX extinction is the first pilot candidate, subject to target semantics and event/censoring audit.
- CFI-G normal and inverse flames remain separate branches.
- Flame spread remains an experiment explorer until a consistent gravity-specific target is established.
- SPICE remains an experiment explorer until the correct smoke-point/soot target is retrieved and verified.
- SAME/SAME-R/DAFT are detection evidence and sensor context, not interchangeable flame-smoke classification labels.

**Acceptance:** unsupported input conditions return evidence and a limitation message instead of an invented prediction.

### FR-10 — Immersive landing and learning journey

- Space-themed editorial landing page.
- Scroll-triggered chapter transitions that teach microgravity flame behaviour and the three fire-safety functions.
- Relevant GLB/FBX model plan with lazy-loading and static fallbacks.
- Interactive 3D and data scenes must teach a concept, not merely decorate.
- Respect reduced-motion, mobile, keyboard and screen-reader use.

**Acceptance:** users can bypass the story and reach research functions immediately; no critical content depends on animation.

## 7. Data scope at initial handoff

### Supplied local datasets

| Dataset | Supplied rows | Initial role | Important caveat |
|---|---:|---|---|
| PSI-25 BASS-II | 129 | Prevention / solid fuel | No consistent spread-rate target in supplied CSV |
| PSI-69 FLEX | 274 | Suppression / droplet extinction | `Test end` has Extinction, Disruption and Completion; do not force binary labels until definitions are checked |
| PSI-99 SAFFIRE-II | 15 table rows | Prevention / large-scale fire | Mixed sample, flow-visualization and note rows |
| PSI-100 SAFFIRE-III | 2 | Prevention context | Metadata/condition rows only |
| PSI-102 SAME | 8 table rows | Detection | Four measured records; four material notes with no numeric measurements |
| PSI-107 SPICE | 469 | Smoke point / soot context | 34 exact duplicated rows; target columns are not in this input table |
| PSI-159 CFI-G Inverse | 1,015 parsed rows | Gaseous flame branch | 154 non-empty rows and 861 entirely empty rows |
| PSI-159 CFI-G Normal | 179 | Gaseous flame branch | Event and `TFP` semantics require verification |

These are counts from the supplied files, not counts of all NASA PSI records or necessarily independent experimental runs. Separately, LUCI publication evidence now provides a partial-gravity comparison opportunity outside the supplied PSI CSVs; FM² remains a source to monitor for released test data.

### Recommended PSI expansion backlog

Add SAFFIRE-I, SAME-R, FLEX-2, CFI, BASS (where available), ACME BRE, ACME E-FIELD Flames, ACME S-Flames, DAFT, DAFT-2, SLICE and relevant SAME data-analysis products after verifying their individual PSI records, file inventory and provenance. Do not treat the expansion list as if those files are already bundled.

## 7A. Data segregation and model inputs

Local data is physically segregated in `data/source_data/` by scientific task. The exact category-to-file mapping, input fields, candidate outputs, metadata fields, training readiness and leakage rules are specified in `data/README_DATA_MAP.md`, `data/audit/MODEL_DATA_ASSIGNMENT.csv`, `data/audit/FEATURE_TARGET_MATRIX.csv` and `data/model_readmes/`.

The three supervised tracks are distinct: FLEX/CFI-G extinction branches, BASS/SAFFIRE flame-spread evidence, and SPICE soot/smoke-point evidence. SAME/SAME-R/DAFT is an additional detection evidence track, not a fourth trained model by default. No model should train until its readme's target and readiness conditions are met.

## 8. Ranking and confidence semantics

Use distinct fields:

- **Research relevance:** how closely an investigation informs the selected user question.
- **Data completeness:** how much source metadata and measured data are available.
- **Model uncertainty:** uncertainty in a fitted prediction.
- **Measurement uncertainty:** uncertainty of the observed data.
- **Applicability domain:** whether user conditions are represented by training data.

Never compress these into one “AI confidence” percentage.

## 9. Non-functional requirements

- Scientific traceability: each claim, ranking and prediction is source/version linked.
- Performance: first meaningful content does not depend on 3D model download.
- Accessibility: keyboard operation, contrast, reduced motion and table alternatives.
- Security: safe upload parsing, API-key isolation, prompt-injection resistance for retrieved documents.
- Reliability: clear empty/error states when NASA PSI pages or files are not available.
- Reproducibility: source hashes, normalizer version, ranking-rubric version, model version and SI prompt/model version recorded.

## 10. Success metrics

- Time for a new user to locate an investigation relevant to a use case.
- Percentage of factual SI claims with valid citations.
- Percentage of catalogue fields with source/measurement provenance.
- Number of successful side-by-side comparisons without unit/definition mismatch.
- User-rated usefulness of ranking rationale.
- Number of model predictions withheld correctly when outside the supported domain.
- Lighthouse/accessibility and mobile performance scores.

Do not use number of AI calls, number of generated paragraphs or number of glowing cards as product success metrics.

## 11. Product disclaimer

FlameLens is a research discovery and decision-support tool. It does not certify spacecraft materials, suppression systems, fire detectors, operational procedures or habitat atmospheres. All operational use requires qualified engineering review and authoritative mission requirements.
