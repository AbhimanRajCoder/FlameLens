# Model / evidence track 04 — Smoke and aerosol detection

This is a separate dashboard evidence track, not one of the original three combustion predictors. It is required by the NASA challenge objective around fire detection and should not be merged into the SPICE soot/smoke-point model.

## Local data

- `data/source_data/04_smoke_detection/PSI-102_SAME/PSI-102_Experimental table_SAME.csv` — 8 rows, 5 columns. Four rows contain numeric airflow, weight-loss-rate and aging-duration values; four later material rows refer to the same conditions as rows 1–4 and contain no new numeric condition set.

The local table is not a full detector-response or particle-size dataset. It can support a limited sample/material/condition explorer, not a detection sensitivity predictor.

## Data required for useful detection analysis

### Source / aerosol generation

- Fuel or material identity and composition.
- Sample geometry, exposed surface area and orientation.
- Heating or ignition power, temperature and duration.
- Mass-loss / pyrolysis rate and source operating time.

### Aerosol / smoke characteristics

- Particle or droplet size distribution (including distribution definition and measurement uncertainty).
- Number concentration and mass concentration, when available.
- Particle morphology / microscopy records and contamination flags.
- Transport conditions: airflow/velocity, pressure, temperature, location and elapsed time from source.

### Detector / sensor response

- Detector/sensor model and measurement principle.
- Raw instrument signal, calibration, sensitivity and detection threshold.
- Alarm state / time-to-alarm, false-alarm or missed-detection outcome where reported.
- Sensor location, orientation, sampling interval and background dust/aerosol condition.

Do not infer detector alarms from particle measurements alone. A response model needs paired aerosol-exposure and sensor-output records.

## Additional sources to acquire

1. **PSI-101 SAME-R** — NASA reports 66 flight test points and modified diagnostics including M-pass; intended to improve particle morphology/size evidence after contamination problems in SAME. Obtain the final report and reduced data. Keep SAME-R separate from SAME and annotate its instrument changes.
2. **DAFT / DAFT-2** — dust and aerosol measurement feasibility work. Useful to model or explain dust-vs-smoke discrimination and background particle confounding, not as combustion-smoke generation labels. Verify actual PSI record IDs and file inventories before ingestion.
3. **PSI-98 SAFFIRE-I** — contains smoke transport and environmental sensor streams associated with a large fire; link as an in-vehicle detection/transport evidence source, distinct from SAME aerosol-source tests.
4. **SAME data-utilization analysis** — potentially useful model/analysis documentation for smoke generation in microgravity. Treat as derived research, not an independent flight campaign.

## Dashboard output before predictive modeling

Show the experimental source, aerosol/material conditions, size/morphology findings, sensor hardware, measured sensor response if available, contamination/limitations and closest comparable tests. If a paired detector response dataset is not found, state that detection performance is not inferable from the local data.
