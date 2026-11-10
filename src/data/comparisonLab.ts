import { EXPLORER_RECORDS, type ExplorerRecord } from './explorer';

export type Eligibility = 'direct' | 'caveat' | 'not-comparable';
export type ComparisonMetric = 'airflow' | 'pressure';
export type ParsedRow = Record<string, string>;

export interface ComparisonSource {
  id: string;
  record: ExplorerRecord;
  hardware: string | null;
  gravity: string;
  measurement: string;
  geometry: string | null;
  oxygen: string | null;
  target: string;
  caveats: string[];
}

const SOURCE_NOTES: Record<string, Omit<ComparisonSource, 'id' | 'record'>> = {
  'psi-69': {
    hardware: 'Combustion Integrated Rack / Fluids and Combustion Facility; Multi-user Droplet Combustion Apparatus (NASA PSI metadata).',
    gravity: 'Microgravity flight investigation aboard the ISS (NASA PSI metadata).',
    measurement: 'Droplet table: initial diameter, ambient mixture/pressure and observed end fields. Local table does not include synchronized raw sensor traces.',
    geometry: 'Liquid-fuel droplet; initial diameter recorded in mm.',
    oxygen: 'Initial O₂, N₂, CO and He mole fractions are separate source columns.',
    target: '“Test end” categories are observed outcomes; Disruption, Extinction and Completion semantics are not interchangeable.',
    caveats: ['Do not compare droplet extinction labels to CFI-G self-extinction/flow codes.', 'Rows are table observations; run independence has not been established here.'],
  },
  'psi-159-norm': {
    hardware: null,
    gravity: 'PSI-159 is catalogued as an ISS microgravity investigation; branch-specific platform details are not reported in this local table.',
    measurement: 'Normal spherical gaseous diffusion-flame table; event and temperature fields are recorded, but codes remain unresolved.',
    geometry: 'Normal spherical diffusion flame.',
    oxygen: 'XO₂ before test is recorded as a candidate initial condition.',
    target: 'Self-ext-or-flow-term values (for example SE and FT) require the source dictionary before interpretation.',
    caveats: ['Keep the normal flame branch distinct from inverse CFI-G.', 'The field guide leaves TFP undefined; it is excluded from comparison variables.'],
  },
  'psi-159-inv': {
    hardware: null,
    gravity: 'PSI-159 is catalogued as an ISS microgravity investigation; branch-specific platform details are not reported in this local table.',
    measurement: 'Inverse spherical gaseous diffusion-flame table; empty export rows are preserved in the raw file and omitted from numeric parsing.',
    geometry: 'Inverse spherical diffusion flame.',
    oxygen: 'XO₂ is present, but initial-condition semantics are not verified for this branch.',
    target: 'Self-ext-or-flow-term values (for example SE and FT) require the source dictionary before interpretation.',
    caveats: ['861 all-empty rows in the exported file; 154 non-empty records in the local audit.', 'Keep the inverse branch distinct from normal CFI-G and FLEX.'],
  },
  'psi-25': {
    hardware: 'Microgravity Science Glovebox and a small wind tunnel (NASA PSI metadata).',
    gravity: 'Microgravity flight tests aboard the ISS (NASA PSI metadata).',
    measurement: 'Experimental condition/material table with calibrated initial/final gas fields, instrument settings and frame counts.',
    geometry: 'Sample geometry appears in free-text material descriptions; it is not consistently normalized.',
    oxygen: 'Calibrated initial O₂ is reported as % by volume; final values are post-test.',
    target: 'No consistent measured microgravity flame-spread-rate target in the supplied table.',
    caveats: ['Fan/air display settings are not a calibrated velocity without a mapping.', 'Do not treat final gas readings as pre-test conditions.'],
  },
  'psi-99': {
    hardware: null,
    gravity: 'SAFFIRE-II is catalogued as a spacecraft fire investigation; the local experiment table does not restate platform details.',
    measurement: 'Mixed sample, flow-visualization and note rows; airflow and oxygen entries are source text, not a harmonized measurement series.',
    geometry: 'Sample thickness, length and width are text-coded with mixed units.',
    oxygen: 'Percent O₂ values are approximate and carry source note references.',
    target: 'The “?-g” outcomes are unresolved; 1-g spread rate is a separate gravity condition.',
    caveats: ['15 parsed table rows include 9 sample rows, 2 flow-visualization rows and 4 note rows.', 'Rows are not independent runs; outcome fields require row-type and gravity-marker review.'],
  },
  'psi-100': {
    hardware: null,
    gravity: 'SAFFIRE-III spacecraft-fire campaign context; local rows do not state a gravity label.',
    measurement: 'Two-row condition/configuration table only.',
    geometry: 'SIBAL sample: 0.33 cm thick × 94 cm × 40.6 cm (source strings retained).',
    oxygen: null,
    target: 'No outcome/target fields are present in the supplied two-row table.',
    caveats: ['These are two configuration rows, not an outcome sample or run count.', 'Camera identifiers do not imply a measured image-derived result.'],
  },
  'psi-102': {
    hardware: 'NASA PSI metadata describes smoke detectors, particle sampling and diagnostic hardware; detailed configuration is not present in the local CSV.',
    gravity: 'Microgravity investigation aboard the ISS (NASA PSI metadata).',
    measurement: 'Local table has condition/material rows for airflow, weight-loss rate and aging; it has no paired detector-response series.',
    geometry: null,
    oxygen: null,
    target: 'The local table is not a detector-alarm target dataset and does not report a full particle-size distribution.',
    caveats: ['Four numeric condition records and four explanatory material rows; do not treat all 8 as independent tests.', 'Smoke/aerosol detection is not soot production.'],
  },
  'psi-107': {
    hardware: 'Flow duct with integrated nozzles, cameras and fuel delivery in the Microgravity Science Glovebox (NASA PSI metadata).',
    gravity: 'NASA PSI describes ISS microgravity flames and analogous ground experiments; individual local rows are not gravity-tagged.',
    measurement: 'Local table indexes fuel/nozzle/flow conditions and GMT event times.',
    geometry: 'Coflow jet diffusion flame; nozzle diameter is recorded in mm.',
    oxygen: null,
    target: 'No explicit smoke-point length, soot-volume-fraction or smoke-emission target is present in the supplied table.',
    caveats: ['34 exact duplicate rows remain in the preserved export; replicate semantics are unresolved.', 'Do not substitute luminous flame length for smoke-point length or treat PSI-102 as equivalent.'],
  },
};

export const COMPARISON_SOURCES: ComparisonSource[] = EXPLORER_RECORDS
  .filter((record) => record.audit && record.localFile)
  .map((record) => {
    const note = SOURCE_NOTES[record.id];
    if (!note) throw new Error(`Missing comparison notes for local source ${record.id}`);
    return { id: record.id, record, ...note };
  });

export function getComparisonSource(id: string): ComparisonSource | undefined {
  return COMPARISON_SOURCES.find((source) => source.id === id);
}

export interface VariableDefinition {
  id: ComparisonMetric;
  label: string;
  unit: string;
  description: string;
  transform: string;
}

export const VARIABLE_DEFINITIONS: Record<ComparisonMetric, VariableDefinition> = {
  airflow: {
    id: 'airflow', label: 'Reported airflow velocity', unit: 'cm/s',
    description: 'Condition values only. PSI-99 and PSI-100 use a shared cm/s label; PSI-102 is a separate aerosol apparatus and is shown with caveats.',
    transform: 'No conversion; source values are reported in cm/s.',
  },
  pressure: {
    id: 'pressure', label: 'Test pressure', unit: 'bar',
    description: 'Pressure is a condition, not an outcome. CFI-G fields are explicitly approximate; FLEX reports ambient pressure.',
    transform: 'FLEX mmHg → bar: value × 133.322387415 Pa/mmHg ÷ 100,000 Pa/bar. Original mmHg strings remain available.',
  },
};

const METRIC_FIELDS: Record<ComparisonMetric, Record<string, { column: string; unit: string; labelColumn: string }>> = {
  airflow: {
    'psi-99': { column: 'Air Flow (cm/s)', unit: 'cm/s', labelColumn: 'Sample Number' },
    'psi-100': { column: 'Air Flow', unit: 'cm/s', labelColumn: 'Sample Number' },
    'psi-102': { column: 'Air Flow (cm/s)', unit: 'cm/s', labelColumn: 'Sample #' },
  },
  pressure: {
    'psi-69': { column: 'Ambient pressure; mmHg', unit: 'mmHg', labelColumn: 'FLEX Identifier' },
    'psi-159-norm': { column: 'approx p (bar)', unit: 'bar', labelColumn: 'Test' },
    'psi-159-inv': { column: 'approx p (bar)', unit: 'bar', labelColumn: 'Test' },
  },
};

export interface CompatibilityResult {
  status: Eligibility;
  label: string;
  reason: string;
}

export const ELIGIBILITY_EXAMPLES: Array<{
  leftId: string;
  rightId: string;
  field: string;
  status: Eligibility;
  reason: string;
}> = [
  { leftId: 'psi-99', rightId: 'psi-100', field: 'Airflow condition (cm/s)', status: 'direct', reason: 'Same velocity dimension and reported unit; direct for the condition field only. SAFFIRE-II and III have different row scope, and PSI-100 has no outcomes.' },
  { leftId: 'psi-159-norm', rightId: 'psi-159-inv', field: 'Approximate pressure (bar)', status: 'direct', reason: 'Same source field and unit. The flame configurations remain separate; do not pool outcome codes.' },
  { leftId: 'psi-69', rightId: 'psi-159-norm', field: 'Pressure condition', status: 'caveat', reason: 'A known mmHg-to-bar conversion is possible, but FLEX ambient pressure and CFI-G approximate pressure definitions differ.' },
  { leftId: 'psi-102', rightId: 'psi-107', field: 'Outcomes / targets', status: 'not-comparable', reason: 'SAME smoke/aerosol detection evidence and SPICE soot/smoke-point physics are different tasks; the local files also do not contain equivalent targets.' },
  { leftId: 'psi-69', rightId: 'psi-99', field: 'Extinction vs flame-spread outcomes', status: 'not-comparable', reason: 'Droplet test-end categories and solid-fuel spread/burn fields describe different phenomena, regimes and measurement definitions.' },
];

export function commonMetrics(sourceIds: string[]): ComparisonMetric[] {
  if (sourceIds.length < 2) return [];
  return (Object.keys(METRIC_FIELDS) as ComparisonMetric[]).filter((metric) => sourceIds.every((id) => METRIC_FIELDS[metric][id]));
}

export function compatibilityForMetric(sourceIds: string[], metric: ComparisonMetric): CompatibilityResult {
  if (!commonMetrics(sourceIds).includes(metric)) {
    return { status: 'not-comparable', label: 'Not comparable', reason: 'No shared verified field definition is available for every selected source.' };
  }
  if (metric === 'pressure') {
    const hasFlex = sourceIds.includes('psi-69');
    return hasFlex
      ? { status: 'caveat', label: 'Comparable with caveats', reason: 'The shared quantity is pressure, but FLEX ambient pressure differs semantically from CFI-G approximate pressure; conversions are shown separately.' }
      : { status: 'direct', label: 'Direct field comparison', reason: 'The same approximate-pressure field and bar unit occur in both distinct CFI-G branches. This does not make their flame outcomes interchangeable.' };
  }
  const hasSame = sourceIds.includes('psi-102');
  return hasSame
    ? { status: 'caveat', label: 'Comparable with caveats', reason: 'All fields report cm/s, but SAME smoke-generation airflow and SAFFIRE sample airflow belong to different apparatus and contexts.' }
    : { status: 'direct', label: 'Direct condition comparison', reason: 'Airflow velocity is reported in cm/s in each selected source. Compare condition rows only; campaigns and outcomes differ.' };
}

type CsvModule = { default: string };
const rawCsv = import.meta.glob('../../data/source_data/**/*.csv', { query: '?raw' }) as Record<string, () => Promise<CsvModule>>;

export function parseCsv(text: string): ParsedRow[] {
  const input = text.replace(/^\uFEFF/, '');
  const rows: string[][] = [];
  let cells: string[] = [];
  let cell = '';
  let quoted = false;
  for (let index = 0; index < input.length; index += 1) {
    const char = input[index];
    if (char === '"' && quoted && input[index + 1] === '"') { cell += '"'; index += 1; }
    else if (char === '"') quoted = !quoted;
    else if (char === ',' && !quoted) { cells.push(cell); cell = ''; }
    else if ((char === '\n' || char === '\r') && !quoted) {
      if (char === '\r' && input[index + 1] === '\n') index += 1;
      cells.push(cell); cell = '';
      rows.push(cells);
      cells = [];
    } else cell += char;
  }
  if (cell.length || cells.length) { cells.push(cell); rows.push(cells); }
  const [headerRow, ...dataRows] = rows;
  if (!headerRow) return [];
  const headers = headerRow.map((header) => header.trim());
  return dataRows.map((values) => Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ''])));
}

/** Load a bundled source table without changing its source headers or values. */
export async function loadRawSourceRows(sourceId: string): Promise<ParsedRow[]> {
  const record = EXPLORER_RECORDS.find((item) => item.id === sourceId);
  if (!record?.localFile) throw new Error(`No local source file is mapped for ${sourceId}`);
  const importer = rawCsv[`../../${record.localFile}`];
  if (!importer) throw new Error(`Local CSV is not bundled for ${sourceId}`);
  const module = await importer();
  return parseCsv(module.default);
}

export interface SourceValue {
  rowLabel: string;
  sourceValue: string;
  value: number;
  normalizedValue: number;
}

export interface ComparisonSeries {
  sourceId: string;
  sourceLabel: string;
  field: string;
  sourceUnit: string;
  values: SourceValue[];
  sourceRows: number;
  missing: number;
  nonNumeric: number;
  rawRange: [number, number] | null;
  normalizedRange: [number, number] | null;
}

function strictNumber(raw: string, unit: string): number | null {
  const escapedUnit = unit.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = raw.trim().match(new RegExp(`^~?\\s*(-?\\d+(?:\\.\\d+)?)\\s*(?:${escapedUnit})?\\s*$`, 'i'));
  return match ? Number(match[1]) : null;
}

export function toCommonUnit(value: number, metric: ComparisonMetric, sourceUnit: string): number {
  if (metric === 'pressure' && sourceUnit === 'mmHg') return value * 133.322387415 / 100000;
  return value;
}

function range(values: number[]): [number, number] | null {
  if (!values.length) return null;
  return [Math.min(...values), Math.max(...values)];
}

export async function loadComparisonSeries(sourceIds: string[], metric: ComparisonMetric): Promise<ComparisonSeries[]> {
  return Promise.all(sourceIds.map(async (sourceId) => {
    const source = getComparisonSource(sourceId);
    const field = METRIC_FIELDS[metric][sourceId];
    if (!source || !field) throw new Error(`No verified ${metric} field for ${sourceId}`);
    const rows = await loadRawSourceRows(sourceId);
    const values = rows.flatMap((row) => {
      const original = row[field.column] ?? '';
      if (!original.trim()) return [];
      const value = strictNumber(original, field.unit);
      if (value === null) return [];
      return [{ rowLabel: row[field.labelColumn] || 'Unlabelled source row', sourceValue: original, value,
        normalizedValue: toCommonUnit(value, metric, field.unit) }];
    });
    const all = values.map((item) => item.value);
    return {
      sourceId, sourceLabel: `${source.record.sourceId} · ${source.record.title}`,
      field: field.column, sourceUnit: field.unit, values, sourceRows: rows.length,
      missing: rows.filter((row) => !(row[field.column] ?? '').trim()).length,
      nonNumeric: rows.filter((row) => {
        const raw = row[field.column] ?? '';
        return raw.trim() !== '' && strictNumber(raw, field.unit) === null;
      }).length,
      rawRange: range(all), normalizedRange: range(values.map((item) => item.normalizedValue)),
    };
  }));
}

export interface AtlasMember {
  recordId: string;
  relationDetail: string;
}

export interface AtlasGroup {
  id: string;
  title: string;
  relationType: string;
  sourceLabel: string;
  sourceUrl: string;
  members: AtlasMember[];
}

export const EXPERIMENT_ATLAS: AtlasGroup[] = [
  { id: 'cfi-g', title: 'CFI-G configurations', relationType: 'Same PSI-159 investigation · distinct flame configurations', sourceLabel: 'Local source assignment + PSI-159 catalogue', sourceUrl: 'https://psi.nasa.gov/physci/repo/data/investigations/PSI-159', members: [
    { recordId: 'psi-159-norm', relationDetail: 'Normal spherical-flame branch; kept separate in its own local CSV.' },
    { recordId: 'psi-159-inv', relationDetail: 'Inverse spherical-flame branch; separate local CSV with 861 empty export rows.' },
  ] },
  { id: 'saffire', title: 'SAFFIRE experiment series', relationType: 'Named investigation series', sourceLabel: 'NASA Combustion Science investigation index', sourceUrl: 'https://www.nasa.gov/physical-sciences-informatics-psi/psi-investigations-by-research-area/', members: [
    { recordId: 'psi-98', relationDetail: 'SAFFIRE-I metadata only; its files are not bundled here.' },
    { recordId: 'psi-99', relationDetail: 'SAFFIRE-II local table with mixed sample, visualization and note rows.' },
    { recordId: 'psi-100', relationDetail: 'SAFFIRE-III local two-row condition table; no outcomes.' },
  ] },
  { id: 'bass-tomography', title: 'BASS-II imaging and tomography', relationType: 'Image re-analysis / derived source', sourceLabel: 'NASA PSI-62 linked investigation', sourceUrl: 'https://psi.nasa.gov/physci/repo/data/investigations/PSI-62', members: [
    { recordId: 'psi-25', relationDetail: 'BASS-II flight source table; no consistent spread-rate target is in the bundled table.' },
    { recordId: 'psi-62', relationDetail: 'PSI-62 tomography analysis is registered metadata only, not an independent flight cohort.' },
  ] },
  { id: 'spice-analysis', title: 'SPICE and its analysis', relationType: 'Input investigation → ground analysis', sourceLabel: 'Project data map and analysis assignment', sourceUrl: 'https://psi.nasa.gov/physci/repo/data/investigations/PSI-107', members: [
    { recordId: 'psi-107', relationDetail: 'Local PSI-107 table contains conditions, not smoke-point or soot target columns.' },
    { recordId: 'psi-60', relationDetail: 'PSI-60 analysis products are not locally present; do not infer PSI-107 target coverage.' },
  ] },
  { id: 'same-reflight', title: 'SAME and SAME-R', relationType: 'Original investigation → NASA-linked reflight', sourceLabel: 'NASA PSI related-investigation metadata', sourceUrl: 'https://psi.nasa.gov/physci/repo/data/investigations/PSI-102', members: [
    { recordId: 'psi-102', relationDetail: 'Local SAME conditions table; not a paired detector-response series.' },
    { recordId: 'psi-101', relationDetail: 'SAME-R metadata only; NASA describes changed materials and diagnostics.' },
  ] },
  { id: 'flex-cfd', title: 'FLEX and later CFD analysis', relationType: 'Flight data used by ground analysis', sourceLabel: 'Local flame-extinction model readme', sourceUrl: 'https://psi.nasa.gov/physci/repo/data/investigations/PSI-69', members: [
    { recordId: 'psi-69', relationDetail: 'FLEX droplet flight source table; event labels remain unresolved for modelling.' },
    { recordId: 'psi-117', relationDetail: 'PSI-117 is a CFD analysis linked to FLEX, not new independent flight tests.' },
  ] },
];

export function getAtlasRecord(recordId: string): ExplorerRecord | undefined {
  return EXPLORER_RECORDS.find((record) => record.id === recordId);
}
