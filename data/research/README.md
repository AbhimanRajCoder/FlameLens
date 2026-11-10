# Research datasets used by the virtual experiment workspaces

## BASS-II Table 5.1 transcription

`BASS-II_Table5-1_NASA-TM-20210011385.csv` is a row-level transcription of Table 5.1 (NASA/TM-20210011385, printed pages 56–57) in NASA's *Burning and Suppression of Solids—II (BASS-II)* technical memorandum:

- Source: <https://ntrs.nasa.gov/api/citations/20210011385/downloads/TM-20210011385.pdf>
- Source record: <https://ntrs.nasa.gov/citations/20210011385>
- Table data describe 20 PMMA burns (M1–M20); 39 flow-condition spread-rate measurements are numerically reported. Tests M6 and M12 state “Not tracked” for spread rate and are not converted to zero or included as targets.
- Several flow settings occur within one burn. `test_id` is the group key; condition rows from one test must stay together in evaluation.
- Initial/final O₂ values are test-level endpoints while airflow is changed during a burn. They are retained for context and MUST NOT be treated as simultaneous per-condition measurements or predictive inputs.
- Measurements are source values, not independent test samples. This compact transcription preserves the fields needed for the spread-workspace empirical experiment runner; omitted table context is in the cited report.
- NASA technical memorandum is a U.S. Government work. Retain the report citation when using this transcription.

## SPICE smoke-point correlation

The soot/smoke workspace uses the published Table 2 fuel coefficients and Eq. (7) from Dotson, Sunderland, Yuan & Urban (2011), based on 55 ISS SPICE microgravity smoke-point observations. This is a published empirical correlation, not a FlameLens-trained soot model:

`L_SP (mm) = A_f × d(mm)^(-0.910) × u_air(cm/s)^(0.414)`

- Paper: <https://terpconnect.umd.edu/~pbs/2011%20Dotson%20et%20al.%20FSJ.pdf>
- DOI: <https://doi.org/10.1016/j.firesaf.2011.08.002>
- Reported fit R² = 0.90. It was fit to the 55 smoke points; this is in-sample fit quality, not independent validation.
- Fuel factors A_f (as published): ethylene 21.2; propane 18.5; propylene 6.05; 75% propylene in N₂ 7.65; 50% propylene in N₂ 13.9.
- Applicable only to attached coflowing microgravity flames over the studied burner and coflow ranges. Output is smoke-point luminous length, not soot volume fraction, emission mass, optical obscuration, or a safety classification.

## Local FLEX records

The extinction workspace reads the existing PSI-69 FLEX CSV without modifying it. Its case-based model estimates the distribution of the literal `Test end` source terms only. Official meanings and independence of the test identifiers remain unresolved; it does not output extinction risk or a certified flame state.
