# Model track 01 — Flame extinction

## Scientific task
Predict a clearly defined extinction outcome for a specified physical regime using only measurements available at the stated prediction time. Do not treat all extinction investigations as one homogeneous dataset.

## Separate branches and local data

| Branch | File | Rows in supplied file | Role |
|---|---|---:|---|
| FLEX droplet | `data/source_data/01_flame_extinction/PSI-69_FLEX/PSI-69_Experimental table_FLEX (1).csv` | 274 | First candidate for a supervised model after target audit. |
| CFI-G normal | `data/source_data/01_flame_extinction/PSI-159_CFI-G_Normal/PSI-159_Experimental table_CFI-G_Normal Flames.csv` | 179 | Separate gas-flame branch; audit event codes and fields first. |
| CFI-G inverse | `data/source_data/01_flame_extinction/PSI-159_CFI-G_Inverse/PSI-159_Experimental table_CFI-G_Inverse Flames.csv` | 1,015 parsed rows; 154 non-empty, 861 blank | Separate gas-flame branch; preserve raw file, ignore all-empty rows only in a derived working view. |

## FLEX candidate inputs — only pre-test fields

- `Fuel`
- `Ambient pressure; mmHg` (convert consistently to Pa in derived features; preserve source value/unit)
- `O initial ambient composition; mole fraction`
- `N initial ambient composition; mole fraction`
- `CO initial ambient composition; mole fraction`
- `He initial ambient composition; mole fraction`
- `Droplet initial diameter; mm`
- Additional fuel-property descriptors only if verified from a cited source and available at prediction time.

### FLEX target candidates — not yet approved

- `Test end`: observed category values in the supplied audit include `Extinction` (186), `Disruption` (61) and `Completion` (27). **Do not collapse to a binary target yet.** Retrieve the NASA definition of each category and observation protocol first. Disruption is not automatically equivalent to extinction; completion is not automatically a universally comparable non-extinction label.
- `Burn time; s`: outcome, potentially usable only after its timing/endpoint definition and censoring are verified.
- `Visible flame extinction diameter; mm`: measured outcome, not pre-test input.
- `Burning rate; mm`: outcome; verify physical definition and unit before use.

If test ends before an extinction event is observed, consider survival analysis with right censoring rather than labelling the record as a negative example. Distinguish visible flame extinction from persistence of cool-flame chemistry.

## FLEX metadata / grouping only

`FLEX Test #`, `FLEX Identifier`, `Test Date`, `Test GMT` and any sample/run identifier are provenance/grouping fields. They must not be predictive shortcuts. Group rows from one physical test/run together during validation.

## CFI-G normal candidate inputs

Potential pre-event inputs, subject to NASA definition checks:

- `Fuel`
- ` XO2 before test`
- `Xf` only after confirming that this is an initial/pre-test mixture field
- `approx p (bar)`
- `mHC (mg/s)`
- configuration `Flame Type` (normal branch is already separated)
- `Tad (K)` and `Zst` only when their definitions/calculation provenance match the NASA convention and are known pre-event.

## CFI-G inverse candidate inputs

Potential pre-event inputs, subject to the source dictionary:

- `Fuel`
- `Xf  before test`
- `approx p (bar)`
- `XO2` — verify whether the column is an initial condition for this file before mapping it to normalized `oxygen_mole_fraction_initial`.
- `O2 flow rate (mg/s)`
- `HC burnrate (mg/s)` only if the original measurement timing confirms it is available at the intended prediction time; a burning rate measured during/after combustion may be leakage.
- `Tad (K)` and `Zst` only after definitions/provenance checks.

## CFI-G outcomes and unresolved fields

- `Self-ext or flow term` has values such as `SE`, `FT` and `-`; do not assign class meanings until the source dictionary/report decodes them.
- `burn time (sec)` and peak burner temperature are outcome/observation candidates.
- `XO2 after test`, `Xf after test`, peak-temperature fields and comments are not pre-test predictors.
- `TFP` is explicitly undefined in the supplied field guide. Exclude it until NASA documentation identifies its physical meaning.
- `Cool flame?` and `Hot ignition` require event-timing checks before being admitted as predictors.

## Modeling plan

1. Audit FLEX labels and group IDs; report class counts and independent test groups.
2. Establish a majority-class baseline.
3. Compare regularized logistic regression and a shallow Random Forest for a verified binary target; use a survival baseline if censoring is real and targetable.
4. Calibrate probabilities using group-respecting validation. Report sensitivity, specificity, balanced accuracy, PR-AUC when imbalanced, Brier score and calibration plots.
5. Keep normal and inverse CFI-G as separate experts. A multi-regime model is a later experiment only after compatible targets and leave-one-source-out validation.
6. Apply a domain/coverage gate before predictions. Outside the verified regime, return related NASA tests rather than a numerical forecast.

## Additional source to obtain

- PSI-117, a ground CFD analysis using FLEX data, can support physical interpretation and simulation comparison. It is not a new independent flight experiment and must not be counted as new experimental rows.
- PSI-10 / ACME Flame Design is adjacent gaseous spherical-flame / soot-inception evidence; do not merge with FLEX droplet data.
- FLEX-2 and FLEX-2J are future acquisition candidates; verify exact PSI record, target and hardware before adding.
