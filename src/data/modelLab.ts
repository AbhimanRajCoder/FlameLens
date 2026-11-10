import { EXPLORER_RECORDS } from './explorer';
import { loadRawSourceRows, type ParsedRow } from './comparisonLab';

export type ModelTrackId = 'extinction' | 'spread' | 'soot-smoke';
export type FieldRole = 'candidate input' | 'candidate output' | 'excluded leakage' | 'grouping / provenance' | 'context only';

export interface ModelFieldDefinition {
  field: string;
  role: FieldRole;
  unit: string;
  definition: string;
  method: string;
  caution?: string;
}

export interface ModelDatasetDefinition {
  sourceId: string;
  title: string;
  sourceUrl: string;
  filePath: string;
  groupingField: string;
  groupingNote: string;
  scope: string;
  inputs: ModelFieldDefinition[];
  outputs: ModelFieldDefinition[];
  excluded: ModelFieldDefinition[];
}

export interface ModelTrackDefinition {
  id: ModelTrackId;
  number: string;
  title: string;
  navLabel: string;
  objective: string;
  target: string;
  targetState: 'verified' | 'unresolved' | 'absent';
  readinessReason: string;
  modelPlan: string;
  candidateModels: string[];
  splitPlan: string;
  domainLimit: string;
  sourceIds: string[];
  additionalSources: { title: string; state: string; href: string; note: string }[];
  outputLabel: string;
  outputNote: string;
}

const f = (field: string, role: FieldRole, unit: string, definition: string, method: string, caution?: string): ModelFieldDefinition =>
  ({ field, role, unit, definition, method, ...(caution ? { caution } : {}) });

export const MODEL_DATASETS: Record<string, ModelDatasetDefinition> = {
  'psi-69': {
    sourceId: 'PSI-69', title: 'FLEX · isolated liquid droplet', sourceUrl: 'https://psi.nasa.gov/physci/repo/data/investigations/PSI-69',
    filePath: 'data/source_data/01_flame_extinction/PSI-69_FLEX/PSI-69_Experimental table_FLEX (1).csv',
    groupingField: 'FLEX Test #', groupingNote: 'One distinct test number per local row; its independent-run meaning still needs source confirmation.',
    scope: 'Microgravity fuel-droplet tests. The supplied table records initial conditions and end/outcome fields; it does not include synchronized sensor traces.',
    inputs: [
      f('Fuel', 'candidate input', 'category', 'Fuel identity as written in the table.', 'Source table; identity normalization not applied.'),
      f('Ambient pressure; mmHg', 'candidate input', 'mmHg', 'Reported ambient pressure before/during a droplet test.', 'Source-reported table value; instrument method is not specified in the CSV.'),
      f('O initial ambient composition; mole fraction', 'candidate input', 'mole fraction', 'Initial oxygen fraction in the ambient mixture.', 'Source-reported composition; measurement method not specified in the CSV.'),
      f('N initial ambient composition; mole fraction', 'candidate input', 'mole fraction', 'Initial nitrogen fraction in the ambient mixture.', 'Source-reported composition; measurement method not specified in the CSV.'),
      f('CO initial ambient composition; mole fraction', 'candidate input', 'mole fraction', 'Initial carbon-monoxide fraction in the ambient mixture.', 'Source-reported composition; measurement method not specified in the CSV.'),
      f('He initial ambient composition; mole fraction', 'candidate input', 'mole fraction', 'Initial helium fraction in the ambient mixture.', 'Source-reported composition; measurement method not specified in the CSV.'),
      f('Droplet initial diameter; mm', 'candidate input', 'mm', 'Initial liquid-fuel droplet diameter.', 'Source-reported table value; imaging/calibration method is not included in the CSV.'),
    ],
    outputs: [
      f('Test end', 'candidate output', 'category', 'Recorded test-end label: Extinction, Disruption, or Completion.', 'Categorical source field; official event definitions and observation/censoring rules remain unresolved.', 'Do not combine these categories into a binary target.'),
      f('Visible flame extinction diameter; mm', 'candidate output', 'mm', 'Diameter recorded at visible-flame extinction.', 'Outcome field; measurement protocol and uncertainty are not in the local CSV.', 'Outcome only; never a pre-test predictor.'),
      f('Burn time; s', 'candidate output', 's', 'Recorded burn duration.', 'Outcome field; endpoint and censoring definition are not in the local CSV.', 'Outcome only; never a pre-test predictor.'),
      f('Burning rate; mm', 'candidate output', 'mm (source header)', 'Source field named burning rate.', 'The header gives a length unit; the physical rate definition and unit need verification.', 'Not a usable rate until the source definition is recovered.'),
    ],
    excluded: [f('FLEX Test # / FLEX Identifier / Test Date / Test GMT', 'grouping / provenance', 'mixed', 'Test metadata for joining and grouping.', 'Source-reported identifiers; not predictive inputs.', 'No random row split; verify physical-run grouping.' )],
  },
  'psi-159-norm': {
    sourceId: 'PSI-159 · Normal', title: 'CFI-G · normal flame', sourceUrl: 'https://psi.nasa.gov/physci/repo/data/investigations/PSI-159',
    filePath: 'data/source_data/01_flame_extinction/PSI-159_CFI-G_Normal/PSI-159_Experimental table_CFI-G_Normal Flames.csv',
    groupingField: 'Day + Test', groupingNote: 'Candidate grouping key from source identifiers; confirm how tests map to independent physical runs.',
    scope: 'Normal spherical gas-flame branch of PSI-159. Kept separate from inverse CFI-G and FLEX.',
    inputs: [
      f('Fuel', 'candidate input', 'category', 'Fuel identity as recorded.', 'Source table; no normalization.'),
      f('XO2 before test', 'candidate input', 'mole fraction', 'Oxygen fraction explicitly marked before test.', 'Source-reported pre-test field; instrument method not supplied.'),
      f('Xf', 'candidate input', 'source-specific', 'Mixture fraction field; its timing must be confirmed.', 'Source table; timing/definition not resolved.', 'Do not admit to a model before verifying it is available pre-event.'),
      f('approx p (bar)', 'candidate input', 'bar', 'Approximate chamber pressure.', 'Source-reported approximate pressure.'),
      f('mHC (mg/s)', 'candidate input', 'mg/s', 'Hydrocarbon mass-flow field.', 'Source-reported; confirm measurement timing.'),
      f('Tad (K)', 'candidate input', 'K', 'Adiabatic flame-temperature field.', 'Source table; calculation inputs/convention not included.'),
      f('Zst', 'candidate input', 'dimensionless', 'Stoichiometric mixture-fraction field.', 'Source table; calculation provenance not included.'),
    ],
    outputs: [
      f('Self-ext or flow term', 'candidate output', 'code', 'Reported codes include SE, FT, and a dash.', 'Source event code; meanings and event protocol need NASA definition.', 'Do not interpret codes as extinction classes yet.'),
      f('Hot ignition', 'candidate output', 'mixed label', 'Recorded hot-ignition field.', 'Source value requires event-timing and class-definition review.'),
      f('burn time (sec)', 'candidate output', 's', 'Reported burn duration.', 'Outcome timing/censoring definition not present in local CSV.'),
      f('Peak burner T (C )', 'candidate output', '°C', 'Reported peak burner temperature.', 'Outcome/diagnostic field; protocol and sensor uncertainty not in CSV.'),
    ],
    excluded: [
      f('XO2  after test', 'excluded leakage', 'mole fraction', 'Post-test oxygen composition.', 'Post-event field; cannot predict a pre-event target.'),
      f('TFP', 'context only', 'undefined', 'Field-guide term without a verified definition.', 'No confirmed physical meaning; excluded.'),
      f('Day / Test / Comments', 'grouping / provenance', 'mixed', 'Test identifiers and notes.', 'Grouping/provenance only; identifiers are not model features.'),
    ],
  },
  'psi-159-inv': {
    sourceId: 'PSI-159 · Inverse', title: 'CFI-G · inverse flame', sourceUrl: 'https://psi.nasa.gov/physci/repo/data/investigations/PSI-159',
    filePath: 'data/source_data/01_flame_extinction/PSI-159_CFI-G_Inverse/PSI-159_Experimental table_CFI-G_Inverse Flames.csv',
    groupingField: 'Day + Test', groupingNote: 'Candidate grouping key from source identifiers; confirm the run relationship before any split.',
    scope: 'Inverse spherical gas-flame branch. The exported file contains 861 fully empty rows; these are counted separately from its 154 non-empty records.',
    inputs: [
      f('Fuel', 'candidate input', 'category', 'Fuel identity as recorded.', 'Source table; no normalization.'),
      f('Xf  before test', 'candidate input', 'source-specific', 'Mixture fraction explicitly marked before test.', 'Source-reported pre-test field; source convention not documented locally.'),
      f('approx p (bar)', 'candidate input', 'bar', 'Approximate chamber pressure.', 'Source-reported approximate pressure.'),
      f('XO2', 'candidate input', 'source-specific', 'Oxygen field; initial-condition status is not explicit in this branch.', 'Source table; timing needs verification.', 'Do not map as initial oxygen until confirmed.'),
      f('O2 flow rate (mg/s)', 'candidate input', 'mg/s', 'Oxygen mass-flow field.', 'Source-reported; exact control/measurement method not in CSV.'),
      f('Tad (K)', 'candidate input', 'K', 'Adiabatic flame-temperature field.', 'Source table; calculation inputs/convention not included.'),
      f('Zst', 'candidate input', 'dimensionless', 'Stoichiometric mixture-fraction field.', 'Source table; calculation provenance not included.'),
    ],
    outputs: [
      f('Self -ext or flow term', 'candidate output', 'code', 'Reported event/flow codes include FT and a dash.', 'Source event code; meanings and event protocol need NASA definition.', 'Do not pool with the normal branch codes until definitions match.'),
      f('Hot ignition', 'candidate output', 'mixed label', 'Recorded hot-ignition field.', 'Source value requires event-timing and class-definition review.'),
      f('burn time (sec)', 'candidate output', 's', 'Reported burn duration.', 'Outcome timing/censoring definition not present in local CSV.'),
      f('Peak burner temp (K)', 'candidate output', 'K', 'Reported peak burner temperature in Kelvin.', 'Outcome/diagnostic field; protocol and sensor uncertainty not in CSV.'),
    ],
    excluded: [
      f('Xf  after test', 'excluded leakage', 'source-specific', 'Post-test mixture-fraction field.', 'Post-event composition; cannot predict a pre-event target.'),
      f('HC burnrate (mg/s)', 'candidate input', 'mg/s', 'Hydrocarbon burn-rate field.', 'Timing must be checked; it may be observed during/after combustion.', 'Exclude until prediction-time availability is established.'),
      f('TFP', 'context only', 'undefined', 'Field-guide term without a verified definition.', 'No confirmed physical meaning; excluded.'),
      f('Day / Test / Comments', 'grouping / provenance', 'mixed', 'Test identifiers and notes.', 'Grouping/provenance only; identifiers are not model features.'),
    ],
  },
  'psi-25': {
    sourceId: 'PSI-25', title: 'BASS-II · solid-fuel conditions', sourceUrl: 'https://psi.nasa.gov/physci/repo/data/investigations/PSI-25',
    filePath: 'data/source_data/02_flame_spread/PSI-25_BASS-II/PSI-25_Experimental table_BASS-II.csv',
    groupingField: 'Test # + Sample #', groupingNote: 'Candidate identifiers only; no calibrated flame-front time series is present to verify spread runs.',
    scope: 'Solid-fuel environmental and material conditions. The supplied table has no consistent flame-front spread-rate target.',
    inputs: [
      f('Fuel Sample Material', 'candidate input', 'source text', 'Recorded fuel/material description.', 'Source table; mixed materials and geometry remain as source text.'),
      f('Flow restrictor', 'candidate input', 'setting', 'Flow-restrictor setting.', 'Instrument/control field; calibration mapping unavailable locally.'),
      f('Fan display', 'candidate input', 'display setting', 'Fan display value.', 'Instrument display; not a calibrated airflow measurement.'),
      f('Air display', 'candidate input', 'display setting', 'Air display value.', 'Instrument display; not a calibrated airflow measurement.'),
      f('Calibrated  initial O2 % by vol', 'candidate input', '% by volume', 'Initial oxygen concentration.', 'Calibrated gas field per source heading; instrument details not in table.'),
      f('Initial CO2 % by vol', 'candidate input', '% by volume', 'Initial carbon-dioxide concentration.', 'Source field; method not documented in CSV.'),
      f('Initial CO (ppm)', 'candidate input', 'ppm', 'Initial carbon-monoxide concentration.', 'Source field; method not documented in CSV.'),
    ],
    outputs: [f('Flame-front position vs time', 'candidate output', 'distance / time', 'No such calibrated time-series field exists in the supplied table.', 'Requires linked imagery/analysis, calibration, timebase, and a defined front.' )],
    excluded: [
      f('Calibrated final O2 % by vol / Final CO2 % by vol / Final CO (ppm)', 'excluded leakage', 'mixed', 'Final gas values measured after the test.', 'Post-test fields; not predictors of pre-test outcomes.'),
      f('Radiometer gain / Total Frames Shot', 'context only', 'setting / frames', 'Instrument/observation metadata.', 'Not physical predictors without a verified measurement mapping.'),
      f('PI / Test # / Date / GMT / Sample #', 'grouping / provenance', 'mixed', 'Test and sample identifiers.', 'Metadata only; cannot be used as shortcut features.'),
    ],
  },
  'psi-99': {
    sourceId: 'PSI-99', title: 'SAFFIRE-II · solid-fuel evidence', sourceUrl: 'https://psi.nasa.gov/physci/repo/data/investigations/PSI-99',
    filePath: 'data/source_data/02_flame_spread/PSI-99_SAFFIRE-II/PSI-99_Experimental table_SAFFIRE-2.csv',
    groupingField: 'Sample Number', groupingNote: 'Nine sample rows are in the source audit, but row identifiers also contain imagery references and notes; run grouping is not confirmed.',
    scope: 'Mixed sample, pre-test flow-visualization, and explanatory-note rows. Preserve the row types; do not treat 15 rows as 15 tests.',
    inputs: [
      f('Material', 'candidate input', 'source text', 'Sample material description.', 'Source table; empty material cells may refer to a continuing sample series.'),
      f('Samle Thickness', 'candidate input', 'source text', 'Sample thickness; source header spelling preserved.', 'Source strings use mixed units and qualitative notes; no normalization.'),
      f('Sample Length', 'candidate input', 'source text', 'Sample length.', 'Source strings include differing units and values.'),
      f('Sample Width (cm)', 'candidate input', 'source text', 'Sample width.', 'Source strings may include units.'),
      f('Air Flow (cm/s)', 'candidate input', 'cm/s (source field)', 'Reported airflow value.', 'Source-reported; row context and apparatus scope must stay visible.'),
      f('Percent O2 (Note 1)', 'candidate input', 'approx. %', 'Oxygen percentage with a source note reference.', 'Source text; includes approximations/ranges.'),
      f('Ignition Power (W)', 'candidate input', 'W (source field)', 'Ignition power.', 'Source-reported condition.'),
      f('Ignition Time (s)', 'candidate input', 's (source field)', 'Ignition duration.', 'Source-reported condition.'),
      f('Flow Direction', 'candidate input', 'category', 'Concurrent/opposed flow label.', 'Source text; configuration category.'),
    ],
    outputs: [
      f('?-g Spread Length', 'candidate output', 'mixed source text', 'Candidate spread-length field with unresolved gravity marker and inconsistent-looking entries.', 'Raw text includes numeric-looking values, notes and missing markers; retain unchanged.', 'Do not infer microgravity or a single unit from this label.'),
      f('1-g Spread Rate', 'candidate output', 'mixed source text', 'Spread-rate field explicitly labelled 1-g.', 'Raw text mixes numeric rates, qualitative values and missing markers.', 'This is not a microgravity target.'),
      f('Burn Time (s)', 'candidate output', 'mixed source text', 'Recorded burn duration.', 'Source strings include qualitative entries and numeric times.'),
    ],
    excluded: [f('Sample Number / Camera 1 / Camera 2 / note rows', 'grouping / provenance', 'mixed', 'Sample, imagery, and explanatory-note references.', 'Separate source row kinds before analysis; not predictors.' )],
  },
  'psi-100': {
    sourceId: 'PSI-100', title: 'SAFFIRE-III · condition records', sourceUrl: 'https://psi.nasa.gov/physci/repo/data/investigations/PSI-100',
    filePath: 'data/source_data/02_flame_spread/PSI-100_SAFFIRE-III/PSI-100_Experimental table_SAFFIRE-3.csv',
    groupingField: 'Sample Number', groupingNote: 'Two condition/configuration rows; this is not a run count or an outcome sample.',
    scope: 'Two material/flow configurations (concurrent and opposed) with camera identifiers; no measured output column.',
    inputs: [
      f('Material', 'candidate input', 'source text', 'Sample material description.', 'Source-reported material.'),
      f('Sample Thickness', 'candidate input', 'source text', 'Sample thickness.', 'Source string carries units.'),
      f('Sample Length', 'candidate input', 'source text', 'Sample length.', 'Source string carries units.'),
      f('Sample Width', 'candidate input', 'source text', 'Sample width.', 'Source string carries units.'),
      f('Air Flow', 'candidate input', 'source text', 'Reported airflow speed.', 'Source string carries units; two rows share a reported value.'),
      f('Direction', 'candidate input', 'category', 'Concurrent/opposed flow configuration.', 'Source-reported category.'),
    ],
    outputs: [f('Flame-front position vs time', 'candidate output', 'distance / time', 'No outcome/measurement target is in the supplied table.', 'Requires linked measurements; not derivable from camera identifiers.' )],
    excluded: [f('Sample Number / Camera 1 / Camera 2', 'grouping / provenance', 'identifier', 'Sample and camera identifiers.', 'Metadata only; do not infer image-derived outcomes.' )],
  },
  'psi-107': {
    sourceId: 'PSI-107', title: 'SPICE · coflow flame conditions', sourceUrl: 'https://psi.nasa.gov/physci/repo/data/investigations/PSI-107',
    filePath: 'data/source_data/03_soot_smoke/PSI-107_SPICE/PSI-107_Experimental table_Spice.csv',
    groupingField: 'GMT date + GMT ignition', groupingNote: 'Candidate event linkage only; repeated exact rows and duplicate timestamps mean independence is not established.',
    scope: 'Condition index for coflow jet diffusion flames. It contains no explicit smoke-point, soot-volume-fraction, or smoke-emission target.',
    inputs: [
      f('Fuel', 'candidate input', 'category', 'Fuel identity as recorded.', 'Source-reported table value.'),
      f('Nozzle (mm)', 'candidate input', 'mm', 'Nozzle diameter.', 'Source-reported; calibration details not included in CSV.'),
      f('Fuel Rate (sccm)', 'candidate input', 'sccm', 'Fuel volumetric flow rate at a source reference condition.', 'Source field; standard temperature/pressure not specified in the CSV.', 'Do not convert without reference-state metadata.'),
      f('Fuel Rate (mg/s)', 'candidate input', 'mg/s', 'Fuel mass-flow field.', 'Source-reported; check redundancy with volumetric rate.'),
      f('HC Fuel Rate (mg/s)', 'candidate input', 'mg/s', 'Hydrocarbon fuel-rate field.', 'Source-reported; semantics and possible redundancy need review.'),
      f('Air Rate (cm/s)', 'candidate input', 'cm/s', 'Reported air velocity.', 'Source-reported velocity; this is not a volumetric flow.'),
    ],
    outputs: [
      f('Smoke-point length', 'candidate output', 'not in local table', 'No smoke-point length/threshold column is present.', 'Requires linked PSI-60 analysed measurement and run definition.'),
      f('Soot volume fraction', 'candidate output', 'not in local table', 'No calibrated soot-volume-fraction column is present.', 'Requires PSI-60 diagnostic outputs, calibration, and source-run mapping.'),
      f('Smoke emission label', 'candidate output', 'not in local table', 'No explicit emission class/measurement is present.', 'Cannot be inferred from the investigation name or flame conditions.'),
    ],
    excluded: [f('GMT date / GMT ignition / GMT Flame Off', 'grouping / provenance', 'date / time', 'Event timing fields for joining to source imagery or analyses.', 'Linkage metadata only; not predictive shortcuts.' )],
  },
  'psi-102': {
    sourceId: 'PSI-102', title: 'SAME · smoke/aerosol evidence', sourceUrl: 'https://psi.nasa.gov/physci/repo/data/investigations/PSI-102',
    filePath: 'data/source_data/04_smoke_detection/PSI-102_SAME/PSI-102_Experimental table_SAME.csv',
    groupingField: 'Sample #', groupingNote: 'Four numeric condition records; four later material rows refer to the same conditions and are not new tests.',
    scope: 'Separate smoke/aerosol detection evidence track. This is not a soot-production dataset and has no paired detector response.',
    inputs: [
      f('Sample Material', 'candidate input', 'source text', 'Material identity.', 'Source-reported.'),
      f('Air Flow (cm/s)', 'candidate input', 'cm/s', 'Reported airflow.', 'Source-reported condition.'),
      f('Weight loss rate (mg/min)', 'candidate input', 'mg/min', 'Material weight-loss rate.', 'Source-reported; timing and instrument details absent locally.'),
      f('Aging Duration (minutes)', 'candidate input', 'minutes', 'Material aging duration.', 'Source-reported condition.'),
    ],
    outputs: [f('Detector response / alarm / time-to-alarm', 'candidate output', 'not in local table', 'No paired sensor signal or alarm result is present.', 'Requires co-registered aerosol exposure and sensor output.' )],
    excluded: [f('Sample # / “same conditions” material notes', 'grouping / provenance', 'identifier / note', 'Sample and explanatory material linkage.', 'Do not count explanatory rows as independent measurements.' )],
  },
};

export const MODEL_TRACKS: Record<ModelTrackId, ModelTrackDefinition> = {
  extinction: {
    id: 'extinction', number: '01', title: 'Flame extinction', navLabel: 'Extinction',
    objective: 'Resolve and eventually estimate the conditions associated with a defined extinction event, without confusing visible flame-out, sustained burning, disruption, or ignition failure.',
    target: 'No approved target yet. FLEX Test end is recorded as three source labels, but event definitions and observation/censoring rules have not been verified. CFI-G codes remain undecoded.',
    targetState: 'unresolved',
    readinessReason: 'Local records are present; FLEX outcome semantics and independent-run grouping still need verification. CFI-G event codes and field timing are also unresolved.',
    modelPlan: 'Freeze a FLEX-only target first. Keep Extinction, Disruption, and Completion separate until NASA defines the observation protocol. Consider survival methods only if censoring is documented.',
    candidateModels: ['Naive majority-label baseline after target approval', 'Regularized logistic regression', 'Shallow random forest (candidate, compare only with grouped validation)'],
    splitPlan: 'Group by the verified physical test/run key (FLEX Test # is a candidate, not yet confirmed as an independent run). CFI-G normal and inverse remain separate experts and separate evaluations.',
    domainLimit: 'No numerical prediction outside the isolated FLEX droplet conditions. CFI-G branches are different geometries/configurations and cannot inherit FLEX performance.',
    sourceIds: ['psi-69', 'psi-159-norm', 'psi-159-inv'],
    additionalSources: [{ title: 'PSI-117 · FLEX-linked CFD analysis', state: 'Metadata only · no local analysis data', href: 'https://psi.nasa.gov/physci/repo/data/investigations/PSI-117', note: 'Derived analysis, not independent flight tests.' }],
    outputLabel: 'Recorded event-field audit',
    outputNote: 'Bars show exact source-table field values only. They are not model classes, probabilities, or predictions.',
  },
  spread: {
    id: 'spread', number: '02', title: 'Flame spread', navLabel: 'Spread',
    objective: 'Describe how material, geometry, oxygen, airflow, ignition, and gravity relate to a clearly measured solid-fuel flame-front history.',
    target: 'No common verified flame-front position-versus-time target exists across the supplied BASS-II and SAFFIRE tables. The SAFFIRE-II “?-g” marker is unresolved; its 1-g rate is a distinct regime.',
    targetState: 'absent',
    readinessReason: 'BASS-II supplies conditions without a consistent calibrated spread target; SAFFIRE-II mixes sample, imagery, and note rows; SAFFIRE-III has two condition rows and no outcomes.',
    modelPlan: 'Keep source-specific exploratory branches. Acquire calibrated flame-front position/time products, resolve gravity and run/sample links, then assess whether any measurement definition can be harmonized.',
    candidateModels: ['No baseline can be fit without a verified target', 'Future candidate: regularized regression or GAM', 'Compare sources only after target, geometry, gravity, and timebase are compatible'],
    splitPlan: 'Never split image frames as independent rows. Recover experiment, burn, and sample relationships first; hold out physical burns and report leave-one-source-out only if compatible evidence is available.',
    domainLimit: 'The empirical spread estimate is limited to the NASA BASS-II PMMA conditions represented here: 1–5 mm thickness, 1.2/2.2 cm width, one/two-sided burning, and 2–21 cm/s opposed flow. Do not generalize it to other materials, SAFFIRE outcomes, or partial-gravity regimes.',
    sourceIds: ['psi-25', 'psi-99', 'psi-100'],
    additionalSources: [
      { title: 'PSI-62 · BASS-II tomography analysis', state: 'Registered analysis · files not bundled', href: 'https://psi.nasa.gov/physci/repo/data/investigations/PSI-62', note: 'Potential derived spread/temperature outputs; map back to PSI-25 runs.' },
      { title: 'PSI-98 · SAFFIRE-I', state: 'Metadata only · files not bundled', href: 'https://psi.nasa.gov/physci/repo/data/investigations/PSI-98', note: 'Candidate imagery/sensor source; not counted as local data.' },
      { title: 'LUCI · lunar-gravity publication', state: 'External evidence · not a local PSI table', href: 'https://ntrs.nasa.gov/citations/20250010653', note: 'Analogue publication; not partial-gravity validation for a trained model.' },
    ],
    outputLabel: 'Source and target coverage',
    outputNote: 'Bars count local source records and target-field entries. They do not represent spread performance.',
  },
  'soot-smoke': {
    id: 'soot-smoke', number: '03', title: 'Soot & smoke-point', navLabel: 'Soot / smoke',
    objective: 'Study a precisely defined SPICE soot or smoke-point measurement, retaining its measurement method, fuel/burner conditions, and link to the originating test.',
    target: 'No smoke-point length, calibrated soot-volume-fraction, or explicit smoke-emission target exists in the supplied PSI-107 table.',
    targetState: 'absent',
    readinessReason: 'PSI-107 contains input conditions only. The required PSI-60 analyzed soot/length products and run/image mapping are not in this project.',
    modelPlan: 'Build a data-readiness profile only. Do not infer a soot label from the SPICE name, luminous flame length, or the separate SAME smoke/aerosol records.',
    candidateModels: ['No supervised baseline: target absent', 'Future candidate: ridge regression for a verified continuous target', 'Shallow nonlinear comparison only after grouped run/fuel/burner validation'],
    splitPlan: 'Preserve PSI-107 run/image linkage. Resolve repeated rows and group by physical flame/run (and fuel/burner configuration); never split correlated frames/records randomly.',
    domainLimit: 'The published correlation applies only to attached coflowing microgravity flames across the studied fuel, burner, and 5.4–65 cm/s airflow ranges. It predicts luminous smoke-point length only; do not generalize to soot volume fraction, quiescent air, emissions, detector response, or spacecraft safety.',
    sourceIds: ['psi-107'],
    additionalSources: [{ title: 'PSI-60 · SPICE data analysis', state: 'NASA analysis record identified · files not bundled', href: 'https://psi.nasa.gov/physci/repo/search?data_source=psi&data_type=investigation', note: 'Highest-priority target source; derived from PSI-107 rather than an independent flight cohort.' }],
    outputLabel: 'Condition evidence · target gate',
    outputNote: 'Condition ranges and fuel counts are derived from local PSI-107 rows. No soot particles or predicted output are depicted.',
  },
};

export interface FieldAudit extends ModelFieldDefinition {
  present: boolean;
  observed: number;
  missing: number;
  categories: { value: string; count: number }[];
  numeric: { count: number; min: number | null; max: number | null };
}

export interface DatasetAudit {
  sourceId: string;
  title: string;
  sourceUrl: string;
  filePath: string;
  headers: string[];
  rawRows: number;
  nonEmptyRows: number;
  emptyRows: number;
  exactDuplicateRows: number;
  candidateGroupField: string;
  candidateIdentifierCount: number;
  missingIdentifierRows: number;
  rowKinds: { label: string; count: number }[];
  groupingNote: string;
  scope: string;
  fields: FieldAudit[];
  allFieldCoverage: { field: string; nonMissing: number; missing: number }[];
  targetValues: { field: string; categories: { value: string; count: number }[]; present: boolean; observed: number }[];
}

function numericValue(value: string): number | null {
  const match = value.trim().match(/^~?\s*(-?(?:\d+\.?\d*|\.\d+))(?:\s*[a-zA-Z%°/²³µμ_-]+)?\s*$/);
  if (!match) return null;
  const number = Number(match[1]);
  return Number.isFinite(number) ? number : null;
}

function profileField(rows: ParsedRow[], definition: ModelFieldDefinition, headers: string[]): FieldAudit {
  const present = headers.includes(definition.field);
  const values = present ? rows.map((row) => (row[definition.field] ?? '').trim()).filter(Boolean) : [];
  const counts = new Map<string, number>();
  values.forEach((value) => counts.set(value, (counts.get(value) ?? 0) + 1));
  const numbers = values.map(numericValue).filter((value): value is number => value !== null);
  return {
    ...definition,
    present,
    observed: values.length,
    missing: rows.length - values.length,
    categories: [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).map(([value, count]) => ({ value, count })),
    numeric: { count: numbers.length, min: numbers.length ? Math.min(...numbers) : null, max: numbers.length ? Math.max(...numbers) : null },
  };
}

function isNonEmpty(row: ParsedRow): boolean {
  return Object.values(row).some((value) => value.trim() !== '');
}

export async function auditModelDataset(sourceId: string): Promise<DatasetAudit> {
  const definition = MODEL_DATASETS[sourceId];
  if (!definition) throw new Error(`No model-lab data contract exists for ${sourceId}`);
  const sourceRecord = EXPLORER_RECORDS.find((record) => record.id === sourceId);
  if (!sourceRecord?.localFile || sourceRecord.localFile !== definition.filePath) {
    throw new Error(`Model-lab source mapping does not match the explorer file for ${sourceId}`);
  }
  const allRows = await loadRawSourceRows(sourceId);
  const headers = Object.keys(allRows[0] ?? {});
  const rows = allRows.filter(isNonEmpty);
  const distinct = new Set<string>();
  let missingIdentifierRows = 0;
  for (const row of rows) {
    const key = definition.groupingField.split(' + ').map((part) => row[part]?.trim() ?? '').join(' | ');
    if (!key.replace(/\|/g, '').trim()) missingIdentifierRows += 1;
    else distinct.add(key);
  }
  let rowKinds: { label: string; count: number }[] = [];
  if (sourceId === 'psi-99') {
    const samples = rows.filter((row) => /^\d+-\d+$/.test(row['Sample Number'] ?? '')).length;
    const flowImages = rows.filter((row) => /^F\d+C\d+/i.test(row['Sample Number'] ?? '')).length;
    const notes = rows.filter((row) => /^Note\s+\d+/i.test(row['Sample Number'] ?? '')).length;
    const other = rows.length - samples - flowImages - notes;
    rowKinds = [{ label: 'Sample records', count: samples }, { label: 'Flow-visualization references', count: flowImages }, { label: 'Explanatory notes', count: notes }, ...(other ? [{ label: 'Other / unresolved row type', count: other }] : [])];
  } else if (sourceId === 'psi-102') {
    const measured = rows.filter((row) => ['Air Flow (cm/s)', 'Weight loss rate (mg/min)', 'Aging Duration (minutes)'].every((field) => numericValue(row[field] ?? '') !== null)).length;
    const notes = rows.length - measured;
    rowKinds = [{ label: 'Numeric condition rows', count: measured }, { label: 'Explanatory material rows', count: notes }];
  }
  const seen = new Set<string>();
  let exactDuplicateRows = 0;
  for (const row of rows) {
    const key = JSON.stringify(headers.map((header) => row[header] ?? ''));
    if (seen.has(key)) exactDuplicateRows += 1;
    else seen.add(key);
  }
  const fieldDefinitions = [...definition.inputs, ...definition.outputs, ...definition.excluded];
  const fields = fieldDefinitions.map((item) => profileField(rows, item, headers));
  const targetValues = definition.outputs.map((field) => {
    const profile = fields.find((item) => item.field === field.field)!;
    return { field: field.field, categories: profile.categories, present: profile.present, observed: profile.observed };
  });
  return {
    sourceId, title: definition.title, sourceUrl: definition.sourceUrl, filePath: definition.filePath,
    headers, rawRows: allRows.length, nonEmptyRows: rows.length, emptyRows: allRows.length - rows.length,
    exactDuplicateRows, candidateGroupField: definition.groupingField, candidateIdentifierCount: distinct.size,
    missingIdentifierRows, rowKinds, groupingNote: definition.groupingNote, scope: definition.scope, fields,
    allFieldCoverage: headers.map((field) => {
      const nonMissing = rows.filter((row) => (row[field] ?? '').trim() !== '').length;
      return { field, nonMissing, missing: rows.length - nonMissing };
    }),
    targetValues,
  };
}

export async function auditModelTrack(trackId: ModelTrackId): Promise<DatasetAudit[]> {
  const track = MODEL_TRACKS[trackId];
  return Promise.all(track.sourceIds.map(auditModelDataset));
}

export function deriveTrackStatus(track: ModelTrackDefinition, audits: DatasetAudit[], trainedArtifactCount: number) {
  const allSourcesLoaded = audits.length === track.sourceIds.length && audits.every((audit) => audit.nonEmptyRows > 0);
  const approvedTargets = track.targetState === 'verified'
    ? audits.flatMap((audit) => audit.fields).filter((field) => field.role === 'candidate output' && field.present)
    : [];
  const hasTrainedArtifact = trainedArtifactCount > 0;
  const stage = hasTrainedArtifact ? 'Evaluation' : allSourcesLoaded && approvedTargets.length === 0 ? 'Audit' : allSourcesLoaded ? 'Data preparation' : 'Audit';
  return {
    stage,
    trained: hasTrainedArtifact,
    auditedSources: audits.length,
    rowCount: audits.reduce((sum, audit) => sum + audit.nonEmptyRows, 0),
    approvedTargetCount: approvedTargets.length,
  };
}

export function fieldAuditFor(audit: DatasetAudit, fieldName: string) {
  return audit.fields.find((field) => field.field === fieldName);
}

export const MODEL_PROTOCOL = {
  version: '0.1.0 · evidence-gated audit',
  randomSeed: 42,
  preprocessing: 'Not fitted. No imputation, scaling, encoding, or feature selection has been run. Any fitted transform must be learned inside training folds only.',
  evaluation: 'No metrics, calibration, uncertainty intervals, residuals, or confusion matrices are available because no supervised model has been trained.',
  externalValidation: 'None. No independent validation artifact is present.',
};
