/**
 * Investigation records for the public landing preview.
 * Every field is grounded in the supplied project pack (data/audit/*.csv,
 * data/model_readmes/*, data/additional_official_sources/*) or the raw CSVs.
 * Fields the pack does not state are null and render as
 * "Not reported in indexed source" — never guessed.
 */

export type SafetyFunction = 'prevent' | 'detect' | 'suppress' | 'context';

export type SourceStatus = 'local' | 'registered' | 'external' | 'monitor';

export interface Investigation {
  id: string;
  psiId: string;
  name: string;
  fn: SafetyFunction;
  status: SourceStatus;
  objective: string;
  fuelMaterial: string | null;
  facilityHardware: string | null;
  measuredVariables: string | null;
  dates: string | null;
  sourceUrl: string | null;
  doi: string | null;
  localFile: string | null;
  caveat: string;
  /** Constellation map position (SVG viewBox 720 x 540). */
  x: number;
  y: number;
}

export const FUNCTION_LABEL: Record<SafetyFunction, string> = {
  prevent: 'Prevention',
  detect: 'Detection',
  suppress: 'Suppression',
  context: 'Contextual research',
};

export const STATUS_LABEL: Record<SourceStatus, string> = {
  local: 'Local table indexed',
  registered: 'Source registered · not ingested',
  external: 'External NASA publication',
  monitor: 'Source to monitor',
};

export const INVESTIGATIONS: Investigation[] = [
  {
    id: 'psi-25',
    psiId: 'PSI-25',
    name: 'BASS-II',
    fn: 'prevent',
    status: 'local',
    objective:
      'Solid-fuel flame spread and extinction evidence: how material, sample geometry, oxygen and imposed flow shape burning in microgravity. The supplied table is an environment/material evidence source.',
    fuelMaterial:
      'PMMA films and rods (100 µm–5 mm thick), SIBAL fabric, Nomex, Japan Wax candle — as recorded in the local table.',
    facilityHardware: null,
    measuredVariables:
      'Calibrated initial/final O₂ (% vol), initial/final CO₂ (% vol), initial/final CO (ppm); fan/air display settings, flow restrictor, radiometer gain and frame counts recorded as instrument metadata.',
    dates: '2014 (test dates in local table)',
    sourceUrl: 'https://psi.nasa.gov/physci/repo/data/investigations/PSI-25',
    doi: '10.60555/4qc4-de67',
    localFile: 'data/source_data/02_flame_spread/PSI-25_BASS-II/',
    caveat:
      'No consistent measured microgravity spread-rate target exists in this supplied CSV. Final gas readings are post-test observations, not pre-test inputs.',
    x: 150,
    y: 120,
  },
  {
    id: 'psi-98',
    psiId: 'PSI-98',
    name: 'SAFFIRE-I',
    fn: 'prevent',
    status: 'registered',
    objective:
      'Large-scale spacecraft fire growth: NASA describes a large SIBAL composite fabric sample (~0.94 m × 0.4 m) with ~20 cm/s airflow, imaged and instrumented to study flame growth and fire behaviour.',
    fuelMaterial: 'SIBAL composite fabric, approximately 0.94 m × 0.4 m (per indexed source note).',
    facilityHardware:
      'Two cameras, thermocouples, radiometers, pressure and O₂/CO₂ sensing, anemometers (per indexed source note).',
    measuredVariables:
      'Candidate products listed for retrieval: flame-front/pyrolysis-front position, flame length, temperature, pressure, gas composition, airflow. Files not bundled.',
    dates: null,
    sourceUrl: 'https://psi.nasa.gov/physci/repo/data/investigations/PSI-98',
    doi: '10.60555/0t15-1z43',
    localFile: null,
    caveat: 'Official metadata reviewed; raw/analysed files are not in this pack. Frames are not independent experiments.',
    x: 300,
    y: 78,
  },
  {
    id: 'psi-99',
    psiId: 'PSI-99',
    name: 'SAFFIRE-II',
    fn: 'prevent',
    status: 'local',
    objective:
      'Large-scale solid-fuel fire and flame-spread evidence across concurrent and opposed flow configurations. The supplied table mixes sample records, flow-visualization references and notes.',
    fuelMaterial: 'Silicone, cotton-fiberglass (SIBAL), PMMA & Nomex samples; 29 cm × 5 cm geometry typical.',
    facilityHardware: 'Camera identifiers recorded per sample (e.g. S1C1/S1C2); facility not reported in indexed source.',
    measuredVariables:
      'Airflow 20 cm/s, ~21.5–22.1% O₂, ignition power 80–97 W; text-coded outcomes (burn time, “?-g” and 1-g burn/spread entries) preserved as written.',
    dates: null,
    sourceUrl: 'https://psi.nasa.gov/physci/repo/data/investigations/PSI-99',
    doi: null,
    localFile: 'data/source_data/02_flame_spread/PSI-99_SAFFIRE-II/',
    caveat:
      'Nine sample rows, two flow-visualization rows and four note rows. The “?-g” marker is unresolved; 1-g spread rate is never a microgravity target.',
    x: 452,
    y: 96,
  },
  {
    id: 'psi-100',
    psiId: 'PSI-100',
    name: 'SAFFIRE-III',
    fn: 'prevent',
    status: 'local',
    objective:
      'Opposed-versus-concurrent flow comparison context. The two supplied rows are conditions/metadata only — material, geometry, airflow, direction and cameras — with no outcome columns.',
    fuelMaterial: 'SIBAL fabric, 0.33 cm thick, 94 cm × 40.6 cm.',
    facilityHardware: 'Camera identifiers S1C1/S1C2 and S2C1/S2C2; facility not reported in indexed source.',
    measuredVariables: 'Airflow 30 cm/s; concurrent vs opposed direction. No target/outcome fields in the supplied table.',
    dates: null,
    sourceUrl: 'https://psi.nasa.gov/physci/repo/data/investigations/PSI-100',
    doi: null,
    localFile: 'data/source_data/02_flame_spread/PSI-100_SAFFIRE-III/',
    caveat: 'A metadata/condition explorer only — not a supervised training table.',
    x: 596,
    y: 140,
  },
  {
    id: 'psi-62',
    psiId: 'PSI-62',
    name: 'BASS tomography analysis',
    fn: 'prevent',
    status: 'registered',
    objective:
      'Ground modelling/analysis linked to BASS/BASS-II: two-color tomography reconstruction reporting flame geometry, temperature distribution, soot volume fraction and flame spread rate.',
    fuelMaterial: null,
    facilityHardware: null,
    measuredVariables: 'Derived spread-rate and field outputs listed for retrieval; must map back to original PSI-25/PSI-26 tests.',
    dates: null,
    sourceUrl: 'https://psi.nasa.gov/physci/repo/data/investigations/PSI-62',
    doi: '10.60555/e9xp-ex83',
    localFile: null,
    caveat: 'Derived research, not a new independent flight cohort. Files not bundled.',
    x: 228,
    y: 196,
  },
  {
    id: 'psi-102',
    psiId: 'PSI-102',
    name: 'SAME',
    fn: 'detect',
    status: 'local',
    objective:
      'Smoke/aerosol generation evidence: sample materials heated under controlled airflow with weight-loss and aging conditions recorded. A detection evidence source, not a detector-response dataset.',
    fuelMaterial:
      'Teflon (four numeric records); Kapton, silicone rubber, lampwick and dibutyl phthalate notes refer to the same conditions as records 1–4.',
    facilityHardware: null,
    measuredVariables:
      'Airflow 5–10 cm/s, weight-loss rate 1–2 mg/min, aging duration 1–20 min for the four measured records. No paired detector alarm/response or particle-size distribution in this table.',
    dates: null,
    sourceUrl: 'https://psi.nasa.gov/physci/repo/data/investigations/PSI-102',
    doi: '10.60555/gd4k-8h62',
    localFile: 'data/source_data/04_smoke_detection/PSI-102_SAME/',
    caveat:
      'Eight rows are not eight independent measured tests. Detection performance is not inferable from this local table alone.',
    x: 132,
    y: 306,
  },
  {
    id: 'psi-101',
    psiId: 'PSI-101',
    name: 'SAME-R',
    fn: 'detect',
    status: 'registered',
    objective:
      'Reflight related to SAME: NASA describes 66 flight test points and modified diagnostics (including M-pass) to quantify low-gravity smoke-particle sizes after contamination affected the original SAME TEM grids.',
    fuelMaterial: null,
    facilityHardware: 'Modified diagnostics including M-pass; instrumentation changed relative to SAME (per indexed source note).',
    measuredVariables: 'Reduced particle-size/morphology data and detector context listed for retrieval. Files not bundled.',
    dates: null,
    sourceUrl: 'https://psi.nasa.gov/physci/repo/data/investigations/PSI-101',
    doi: '10.60555/2np7-jv14',
    localFile: null,
    caveat: 'Keep separate from SAME: instrumentation and protocol changed. Particle measurements ≠ detector alarm performance.',
    x: 280,
    y: 350,
  },
  {
    id: 'daft',
    psiId: 'DAFT / DAFT-2',
    name: 'Dust & Aerosol Feasibility',
    fn: 'detect',
    status: 'registered',
    objective:
      'ISS particle/dust and air-quality measurement feasibility: background aerosol characterization and sensor discrimination context. Exact PSI identifiers require verification.',
    fuelMaterial: null,
    facilityHardware: 'Particle instrumentation aboard the ISS (per NASA background publication); device details pending verification.',
    measuredVariables: 'Background particle size/concentration time series listed for retrieval. Files not bundled.',
    dates: null,
    sourceUrl: 'https://www.nasa.gov/wp-content/uploads/2022/03/iss_technical_publication_030116.pdf',
    doi: null,
    localFile: null,
    caveat: 'Dust is not combustion smoke. DAFT data must never become smoke-generation labels.',
    x: 430,
    y: 306,
  },
  {
    id: 'psi-69',
    psiId: 'PSI-69',
    name: 'FLEX',
    fn: 'suppress',
    status: 'local',
    objective:
      'Droplet combustion and extinction evidence: fuel droplets burned under varied pressure and initial O₂/N₂/CO/He composition. First supervised-model candidate, pending target audit.',
    fuelMaterial: 'Methanol and heptane droplets; initial diameters recorded in mm.',
    facilityHardware: null,
    measuredVariables:
      'Ambient pressure (mmHg), initial O/N/CO/He mole fractions, droplet initial diameter; outcomes include visible extinction diameter, burn time and “Test end” categories.',
    dates: '2009 (test dates in local table)',
    sourceUrl: 'https://psi.nasa.gov/physci/repo/data/investigations/PSI-69',
    doi: '10.60555/mbq8-0451',
    localFile: 'data/source_data/01_flame_extinction/PSI-69_FLEX/',
    caveat:
      '“Test end” = Extinction (186), Disruption (61), Completion (27). Category definitions must be verified before any binary target is created.',
    x: 150,
    y: 448,
  },
  {
    id: 'psi-159',
    psiId: 'PSI-159',
    name: 'CFI-G (normal & inverse)',
    fn: 'suppress',
    status: 'local',
    objective:
      'Gaseous spherical diffusion-flame limits in two separate configurations: normal and inverse flames. Each is its own physical branch — never pooled with FLEX droplets.',
    fuelMaterial: 'Ethane, propane, butane and blends (normal); ethane, propane, butane (inverse).',
    facilityHardware: null,
    measuredVariables:
      'Initial XO₂/Xf, approximate pressure (bar), fuel/O₂ flow rates; event codes “SE”, “FT”, “-” and TFP recorded but not yet decoded.',
    dates: null,
    sourceUrl: 'https://psi.nasa.gov/physci/repo/data/investigations/PSI-159',
    doi: null,
    localFile: 'data/source_data/01_flame_extinction/PSI-159_CFI-G_Normal/ (+ Inverse/)',
    caveat:
      'Inverse export: 154 non-empty rows of 1,015 (861 all-empty). TFP is excluded until NASA documentation defines it.',
    x: 322,
    y: 478,
  },
  {
    id: 'psi-117',
    psiId: 'PSI-117',
    name: 'FLEX cool-flame CFD',
    fn: 'suppress',
    status: 'registered',
    objective:
      'Ground CFD analysis using FLEX flight data: n-alkane droplet cool flames under external thermo-convective perturbation (OpenFOAM, low-temperature chemistry).',
    fuelMaterial: null,
    facilityHardware: 'Simulation (OpenFOAM) — not flight hardware.',
    measuredVariables: 'Simulation outputs and assumptions listed for retrieval; simulation-to-experiment discrepancy must be evaluated.',
    dates: null,
    sourceUrl: 'https://psi.nasa.gov/physci/repo/search?data_source=psi&data_type=investigation',
    doi: null,
    localFile: null,
    caveat: 'Simulation is not a new experimental observation and must never be appended as flight rows.',
    x: 492,
    y: 440,
  },
  {
    id: 'psi-107',
    psiId: 'PSI-107',
    name: 'SPICE',
    fn: 'context',
    status: 'local',
    objective:
      'Soot formation / smoke-point combustion physics in coflow jet diffusion flames. The supplied table is an input-condition index: fuel, nozzle and flow settings.',
    fuelMaterial: 'Ethylene, propane, propylene and blends, methane.',
    facilityHardware: 'Nozzle diameters recorded (e.g. 0.762 mm, 1.6002 mm); facility not reported in indexed source.',
    measuredVariables:
      'Fuel rate (sccm and mg/s), HC fuel rate, air rate (cm/s velocity), GMT ignition/flame-off event times. No smoke-point length or soot-fraction target in this table.',
    dates: null,
    sourceUrl: 'https://psi.nasa.gov/physci/repo/data/investigations/PSI-107',
    doi: '10.60555/9kbh-e962',
    localFile: 'data/source_data/03_soot_smoke/PSI-107_SPICE/',
    caveat:
      '34 exact repeated rows await replicate/export review. Smoke-point length, luminous flame length and soot volume fraction are distinct targets — never interchanged.',
    x: 588,
    y: 250,
  },
  {
    id: 'psi-60',
    psiId: 'PSI-60',
    name: 'SPICE analysis',
    fn: 'context',
    status: 'registered',
    objective:
      'Ground analysis of PSI-107 SPICE datasets: image processing, experimental diagnostics and detailed soot modelling, with derived distributions and soot volume fractions.',
    fuelMaterial: null,
    facilityHardware: null,
    measuredVariables: 'Analysed soot-volume-fraction profiles and image-derived geometry listed for retrieval, with run mapping back to PSI-107.',
    dates: null,
    sourceUrl: 'https://psi.nasa.gov/physci/repo/search?data_source=psi&data_type=investigation',
    doi: null,
    localFile: null,
    caveat: 'Highest-priority acquisition for the SPICE target gap. Derived analysis — not an independent flight cohort.',
    x: 652,
    y: 342,
  },
  {
    id: 'psi-10',
    psiId: 'PSI-10',
    name: 'ACME Flame Design',
    fn: 'context',
    status: 'registered',
    objective:
      'Soot production and control in spherical gaseous-fuel flames: soot-inception limits and oxygen-enriched combustion. Adjacent physics, different geometry and target from SPICE.',
    fuelMaterial: null,
    facilityHardware: null,
    measuredVariables: 'Soot-inception-limit measurements and flame diagnostics listed for retrieval. Files not bundled.',
    dates: null,
    sourceUrl: 'https://psi.nasa.gov/physci/repo/data/investigations/PSI-10',
    doi: null,
    localFile: null,
    caveat: 'Never merge its soot-inception target with SPICE smoke-point length or FLEX droplet extinction labels.',
    x: 640,
    y: 448,
  },
  {
    id: 'luci',
    psiId: 'LUCI',
    name: 'Lunar Combustion Investigation',
    fn: 'context',
    status: 'external',
    objective:
      'Published simulated lunar-gravity flammability results: extended-duration burns under centrifugal acceleration on a rotating suborbital vehicle, with reported spread/growth rates and an oxygen-related extinction limit.',
    fuelMaterial: 'Cotton/fiberglass composite fabric and a 4 mm PMMA rod (per NASA NTRS summary).',
    facilityHardware: 'Rotating suborbital vehicle; two orthogonal flame cameras and oxygen measurement (per indexed source note).',
    measuredVariables: 'Publication reports flame imaging, oxygen measurement and burns > 2.5 min. Original tabular package not bundled.',
    dates: null,
    sourceUrl: 'https://ntrs.nasa.gov/citations/20250010653',
    doi: null,
    localFile: null,
    caveat:
      'External NASA publication evidence — not a PSI CSV. Simulated lunar gravity via rotation, not a lunar-surface experiment.',
    x: 396,
    y: 208,
  },
  {
    id: 'fm2',
    psiId: 'FM²',
    name: 'Flammability of Materials on the Moon',
    fn: 'context',
    status: 'monitor',
    objective:
      'NASA project investigating material combustion at approximately one-sixth lunar gravity in habitat-relevant atmospheres. A future data source to monitor.',
    fuelMaterial: 'Four fuel samples planned in a sealed chamber (per NASA project page) — no measured records released here.',
    facilityHardware: 'Cameras plus flame/fuel temperature, O₂ and CO₂ sensing described on the project page.',
    measuredVariables: null,
    dates: null,
    sourceUrl:
      'https://www.nasa.gov/glenn/glenn-expertise-space-exploration/physical-sciences-program/combustion-science/flammability-of-materials-on-the-moon-fm2/',
    doi: null,
    localFile: null,
    caveat: 'A project page is not a dataset. No synthetic FM² records are created or implied.',
    x: 540,
    y: 356,
  },
];

export const NOT_REPORTED = 'Not reported in indexed source';

export function getInvestigation(id: string): Investigation | undefined {
  return INVESTIGATIONS.find((i) => i.id === id);
}