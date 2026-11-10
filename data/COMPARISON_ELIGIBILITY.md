# FlameLens comparison eligibility

This note describes what the Comparison Lab plots and what its eligibility labels mean. Source descriptions and row counts are drawn from the local audit, source catalogue, and the linked NASA Physical Sciences Informatics (PSI) metadata. Local files remain unchanged.

## Eligibility labels

- **Direct field comparison**: the same named quantity and unit are present for every selected source. This applies to the selected field only; it does not establish equivalent apparatus, samples, gravity history, or outcomes.
- **Comparable with caveats**: a field can be aligned, but definitions or apparatus differ. The interface shows source units and any conversion alongside the original source values.
- **Not comparable**: no verified shared field definition exists for the selected records. The Lab still shows their metadata side by side and explains the mismatch.

Comparison of conditions never implies comparison of targets. The available pressure and airflow plots are condition summaries; they must not be interpreted as predictive or outcome comparisons.

## Parsing and transformations

The Lab reads local CSV exports at runtime and parses quoted CSV fields. A value is included in a plot only when the complete cell matches a signed decimal number, optionally prefixed with `~` and followed by the field's expected unit. Blank and non-numeric values are excluded from the numeric marks and counted separately. No row deduplication is performed. Each dot is one parsed source-table value, **not** one independent experiment or run.

FLEX ambient pressure is reported in mmHg and converted to bar using:

```text
bar = mmHg × 133.322387415 Pa/mmHg ÷ 100,000 Pa/bar
```

The transformation is reversible to the displayed precision and original source strings remain in the row preview. CFI-G `approx p (bar)` values are labeled approximate and are not treated as semantically identical to FLEX ambient pressure. An optional independent source-scale view preserves each original pressure unit; its rows are visually aligned by relative range and are not on a shared numerical axis.

## Field scope and known limits

- **PSI-99 / SAFFIRE-II and PSI-100 / SAFFIRE-III**: reported airflow can be aligned as a condition because both local fields are labeled cm/s. The SAFFIRE-II file mixes sample, visualization, and note rows. SAFFIRE-III has two configuration rows and no outcome columns. The chart is not an outcome comparison.
- **PSI-159 CFI-G normal and inverse branches**: the approximate pressure field can be compared as a condition. The branch-specific datasets and all event codes remain separate; normal and inverse outcomes are never pooled.
- **PSI-69 FLEX and CFI-G**: pressure conversion is shown with caveats because the FLEX field is ambient pressure and CFI-G is approximate pressure. FLEX event categories are not automatically binary labels.
- **PSI-102 SAME and PSI-107 SPICE**: these are not target-compatible. SAME records smoke/aerosol generation conditions without a paired detector-response series. SPICE records fuel/nozzle/flow conditions without an explicit smoke-point or soot target. Smoke detection and soot/smoke-point physics are distinct tasks.
- **PSI-25 BASS-II**: supplied rows include experimental conditions and gas readings, but no consistent measured microgravity flame-spread-rate target. Final gas readings remain post-test values.
- **PSI-159 inverse**: the exported table contains 861 all-empty rows. They remain preserved in the source CSV and contribute to the source-row/missingness accounting; only numeric values are plotted.
- **PSI-107 SPICE**: 34 exact duplicate table rows are retained as exported. Their replicate meaning has not been established.

## Relationship groups in the Experiment Atlas

Atlas links describe relationships grounded in the local assignment map or NASA metadata: CFI-G configurations, the SAFFIRE investigation series, BASS-II imagery and PSI-62 analysis, SPICE input data and PSI-60 analysis, SAME and SAME-R, and FLEX source data and PSI-117 CFD. A link does not establish that rows are independent, that derived products are new test cohorts, or that targets are interchangeable. Each group provides a source link and local Explorer record links where available.

## NASA campaign context shown in the Lab

The research-note cards summarize published mission scope. These counts and outcomes describe NASA campaign reports; they are deliberately not joined to specific rows in the smaller local CSV exports.

- **SAFFIRE-II**: the NASA large-scale flammability report describes nine material samples and flow conditions (20 cm/s for most sample tests, with one at 25 cm/s). The local 15-row CSV is a mix of sample records, flow-visualization references, and notes. [NASA report](https://ntrs.nasa.gov/api/citations/20170008805/downloads/20170008805.pdf?attachment=true)
- **SAME**: NASA PSI describes 30 samples across five materials, with particle analysis and detector response documented as part of the overall investigation. The supplied local file has four numeric condition records and no paired detector-response series. [NASA PSI-102](https://psi.nasa.gov/physci/repo/data/investigations/PSI-102)
- **SPICE**: NASA PSI states that 526 flames were studied across microgravity and analogous ground tests. The local 469-row table is an input-condition index, has 34 exact duplicates, and has no explicit smoke-point or soot target. [NASA PSI-107](https://psi.nasa.gov/physci/repo/data/investigations/PSI-107)
- **FLEX**: NASA describes droplet-flame tests to map extinction limits while varying pressure, oxygen, and droplet size. The local table exposes `Disruption`, `Extinction`, and `Completion` as separate source categories; they are not collapsed into one label. [NASA PSI-69](https://psi.nasa.gov/physci/repo/data/investigations/PSI-69)

The comparison hero shows an explanatory schematic of a FLEX fuel-droplet test: ignition, a spherical microgravity flame, then a possible cool flame after visible flame-out. The diagram is conceptual and not measured geometry or a local PSI-69 measurement. NASA explains why droplets can continue burning after the bright flame disappears. [NASA FLEX explanation](https://svs.gsfc.nasa.gov/11318/)

All eight locally audited comparison tables are listed in the source library and can be opened in the Investigation Explorer. The initial comparison uses three records (SAFFIRE-II, SAFFIRE-III, and SAME) to make cross-campaign coverage visible. Airflow is shared by column definition, but the SAME apparatus differs, so the comparison is marked with caveats. A two-source SAFFIRE-only preset remains available for the narrower, direct condition comparison.
