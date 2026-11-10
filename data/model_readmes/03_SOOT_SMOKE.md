# Model track 03 — Soot formation and smoke-point combustion

## Scientific task
Start with a precisely defined SPICE smoke-point target (preferably a measured smoke-point length/condition). Do not label this as generic "soot = yes/no" and do not substitute luminous flame length or smoke detector response.

## Local data

- `data/source_data/03_soot_smoke/PSI-107_SPICE/PSI-107_Experimental table_Spice.csv` — 469 rows, 9 columns in the supplied audit; 34 exact repeated rows requiring replicate/export review.

## Candidate inputs from supplied SPICE CSV

- `Fuel`
- `Nozzle (mm)`
- `Fuel Rate (sccm)`
- `Fuel Rate (mg/s)`
- `HC Fuel Rate (mg/s)`
- `Air Rate (cm/s)`

`GMT date`, `GMT ignition` and `GMT Flame Off` are event/provenance metadata. They may help link records to videos or runs but must not become shortcut predictors.

## Unit and dependency cautions

- Determine whether fuel-rate columns are alternate conversions or distinct measurements; do not feed redundant representations as if independent information without understanding them.
- Confirm standard temperature/pressure used for sccm before converting to molar or mass flow.
- `Air Rate (cm/s)` is a velocity, not volumetric flow.
- No direct oxygen concentration, pressure or temperature input appears in the supplied SPICE field list. Do not fabricate these fields or make them mandatory.
- Derive nozzle exit velocity only when flow conditions and reference state are compatible with nozzle area.

## Target status

The local PSI-107 table has no explicit smoke-point length, soot-volume-fraction or smoke-emission target in its nine supplied columns. Hence **no supervised model should be trained from this table alone**.

Keep these as separate possible targets:

1. Smoke-point length/threshold under the SPICE measurement definition.
2. Luminous flame length — a different target.
3. Soot volume fraction — requires calibrated analysed diagnostics.
4. Smoke-emission classification — requires explicit emission labels and a consistent observation rule.

## Additional high-priority sources

**PSI-60 — Computational and Experimental Analysis of SPICE Data Sets.** NASA's PSI catalogue describes this as ground analysis work using SPICE data; the approach includes image processing, experimental diagnostics and detailed soot modelling, with distributions and soot volume fractions derived from SPICE. This is the highest-priority additional acquisition for this track. It is analysis of PSI-107 data, not a separate independent flight cohort. Preserve links to the original SPICE run, image, calibration and source PSI-107 identifier.

**PSI-10 / ACME Flame Design.** Complementary gaseous spherical-flame soot-inception-limit evidence under flow, mixture-fraction and inert-dilution changes. This is a different physical geometry and target from SPICE coflow smoke-point length. Keep as a separate research branch / physics reference.

## Model plan after obtaining targets

1. Match each processed soot/smoke measurement to the PSI-107 fuel, nozzle, flow and run identifiers.
2. Verify calibration, camera, exposure, processing algorithm and measurement uncertainty.
3. Check the 34 repeated rows against original experiment semantics before excluding or grouping them.
4. Fit a simple ridge/regularized baseline for a continuous target, or logistic baseline for a verified binary target.
5. Compare a shallow nonlinear model only with grouped validation by run/fuel/burner configuration.
6. Do not use images/frames/pixels as independent rows if they originate from one experimental flame.
