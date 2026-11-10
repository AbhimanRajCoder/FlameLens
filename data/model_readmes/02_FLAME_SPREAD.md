# Model track 02 — Flame spread and solid-fuel flammability

## Scientific task
Describe and eventually predict solid-fuel flame spread or extinction under a precisely specified material, geometry, oxygen, flow, ignition and gravity condition. For now, the supplied files support an experiment explorer more strongly than a general ML regression model.

## Local data

| Branch | File | Rows | Current role |
|---|---|---:|---|
| BASS-II | `data/source_data/02_flame_spread/PSI-25_BASS-II/PSI-25_Experimental table_BASS-II.csv` | 129 | Environment/material evidence; no consistent spread-rate target in this supplied table. |
| SAFFIRE-II | `data/source_data/02_flame_spread/PSI-99_SAFFIRE-II/PSI-99_Experimental table_SAFFIRE-2.csv` | 15 | Mixed row types; sample and condition evidence; target semantics need harmonization. |
| SAFFIRE-III | `data/source_data/02_flame_spread/PSI-100_SAFFIRE-III/PSI-100_Experimental table_SAFFIRE-3.csv` | 2 | Conditions/metadata only; no outcome target in the supplied table. |

## BASS-II candidate inputs

- `Fuel Sample Material` (retain material description and parse composition/thickness carefully)
- `Flow restrictor`, `Fan display`, `Air display` (instrument/settings; do not treat as calibrated velocity until mapping is verified)
- `Calibrated initial O2 % by vol`
- `Initial CO2 % by vol`
- `Initial CO (ppm)`
- `Radiometer gain...` and `Total Frames Shot` are instrument/observation metadata, not automatically physical input variables.

BASS-II final gas fields such as `Calibrated final O2 % by vol`, `Final CO2 % by vol` and `Final CO (ppm)` are post-test observations. They can be shown as outcomes but not used to predict the pre-test result. This supplied experimental table does not contain a common, explicitly defined flame-front spread-rate target.

## SAFFIRE-II candidate inputs

- `Material`
- `Samle Thickness ` (preserve original spelling in raw data; normalize only in derived data after mapping)
- `Sample Length `
- `Sample Width (cm)`
- `Air Flow (cm/s)`
- `Percent O2 (Note 1)`
- `Ignition Power (W)`
- `Ignition Time (s)`
- `Flow Direction`

Candidate observed outcomes:

- `Burn Time (s)`
- `?-g Burn Length`
- `?-g Spread Length`
- `1-g Burn Length`
- `1-g Spread Rate`

**Do not treat `1-g Spread Rate` as a microgravity spread-rate target.** The literal `?-g` marker must be resolved against the original file/report before relabelling it as a gravity regime. Confirm units and measurement interval. The 15-row CSV contains nine sample rows, two flow-visualization rows and four notes; separate these row types before analysis.

## SAFFIRE-III candidate inputs

The two supplied rows contain sample number, material, thickness, length, width, airflow, flow direction and camera metadata. There are no outcome columns in this table. Use it to compare concurrent and opposed configurations, not to train a supervised model.

## Required target definition before ML

Preferred target: calibrated flame-front position versus time, with a declared flame-front definition, measurement interval and physical unit. Derive spread rate only when calibration, timebase, gravity regime and uncertainty are documented. Preserve per-frame measurements as nested/time-series observations; do not let frames from one burn cross train/test folds.

Potential alternatives such as sustained spread/extinction or flame length must be separate target definitions, not silently mixed with spread rate.

## Additional high-priority sources

1. **PSI-98 SAFFIRE-I** — retrieve raw/analysed video and sensor streams. NASA describes a large SIBAL fabric sample (~0.94 m × 0.4 m), ~20 cm/s airflow, two cameras, thermocouples, radiometers, pressure/O2/CO2 sensors and anemometers. Candidate derived outputs include flame-front/pyrolysis-front position, flame length, temperature, pressure, gas composition and flow. The PSI-98 page lists raw image distortion-grid files and related resources.
2. **PSI-62** — highly relevant ground analysis of BASS/BASS-II imagery using two-color tomography, with reported evaluation quantities including flame geometry, temperature distribution, soot volume fraction and flame spread rate. It is derived/re-analysis work linked to PSI-25/PSI-26, not an independent new flight cohort. Map recovered outputs back to original BASS/BASS-II experiment IDs.
3. **PSI-26 / BASS** — linked investigation; retrieve its official record and source files, then assess whether geometry, material and measurement definitions bridge to BASS-II. Do not pool solely because the names are related.
4. **LUCI** — NASA has published a report summary of extended-duration simulated lunar-gravity flammability tests using centrifugal acceleration on a rotating suborbital vehicle. It includes flame images, oxygen measurement, and reported spread/growth rates and extinction information. This is external NASA/NTRS evidence, not a supplied PSI dataset; acquire its original data package and preserve its gravity time history before use. See `data/additional_official_sources/LUCI_LunarGravity_External_Source.md`.
5. **FM²** — monitor the NASA lunar material flammability project page for data release. NASA describes cameras and sensors for spread, temperature, O2 and CO2; the page itself is not a dataset. See `data/additional_official_sources/FM2_Lunar_Material_Flammability.md`.
6. SAFFIRE-IV/V/VI and SoFIE can be considered later if official PSI/mission data and rights are verified; they are not in this current bundle.

## Model plan

1. Deploy the NASA experiment explorer immediately using local BASS-II/SAFFIRE condition records.
2. Acquire PSI-98 and PSI-62 analysed products and identify comparable target definitions.
3. Build a source/mission-aware training table with `source_id`, `experiment_id`, `test_id`, `sample_id`, `gravity_regime`, `material`, geometry, oxygen, airflow, direction, ignition and target provenance.
4. Begin with regularized regression or a GAM. Compare Gaussian Process / shallow trees only if there are enough independent groups.
5. Report held-out MAE/RMSE in target units and leave-one-source-out results where compatible.
