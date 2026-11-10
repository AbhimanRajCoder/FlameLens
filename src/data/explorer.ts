import auditCsv from '../../data/audit/DATASET_AUDIT.csv?raw';
import { FUNCTION_LABEL, INVESTIGATIONS, type Investigation } from './investigations';

export type AuditRow = {
  sourceId: string;
  title: string;
  file: string;
  rows: number | null;
  nonEmptyRows: number | null;
  columns: number | null;
  duplicates: number | null;
  role: string;
  readiness: string;
  note: string;
  category: string;
};

function parseCsvRow(line: string): string[] {
  const fields: string[] = [];
  let field = '';
  let quoted = false;
  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    if (char === '"' && quoted && line[i + 1] === '"') { field += '"'; i += 1; }
    else if (char === '"') quoted = !quoted;
    else if (char === ',' && !quoted) { fields.push(field); field = ''; }
    else field += char;
  }
  fields.push(field);
  return fields;
}

const lines = auditCsv.replace(/^\uFEFF/, '').trim().split(/\r?\n/);
const headers = parseCsvRow(lines[0]);
const auditRows = lines.slice(1).map((line): AuditRow => {
  const values = parseCsvRow(line);
  const row = Object.fromEntries(headers.map((header, index) => [header, values[index] ?? '']));
  const numberOrNull = (key: string) => row[key] === '' ? null : Number(row[key]);
  return {
    sourceId: row.source_id, title: row.investigation, file: row.file,
    rows: numberOrNull('rows_in_file'), nonEmptyRows: numberOrNull('non_empty_rows'),
    columns: numberOrNull('columns'), duplicates: numberOrNull('exact_duplicate_rows'),
    role: row.role, readiness: row.readiness, note: row.audit_note,
    category: row.category,
  };
});

const byId = new Map(INVESTIGATIONS.map((investigation) => [investigation.id, investigation]));
const localCsvUrls = import.meta.glob('../../data/source_data/**/*.csv', { eager: true, query: '?url', import: 'default' }) as Record<string, string>;

function parentForAudit(row: AuditRow): Investigation | undefined {
  const id = row.sourceId.toLowerCase();
  if (id.startsWith('psi-159')) return byId.get('psi-159');
  return INVESTIGATIONS.find((investigation) => investigation.psiId.toLowerCase() === id);
}

export type ExplorerRecord = {
  id: string;
  sourceId: string;
  title: string;
  investigation: Investigation;
  audit: AuditRow | null;
  localFile: string | null;
  localFileUrl: string | null;
  availability: string;
  dataType: string;
  phenomenonGroup: string;
  materials: string | null;
  searchText: string;
};

const localRecords: ExplorerRecord[] = auditRows.map((audit) => {
  const investigation = parentForAudit(audit);
  if (!investigation) throw new Error(`Dataset audit contains an unmatched source ID: ${audit.sourceId}`);
  const branch = audit.sourceId === 'PSI-159-NORM' ? ' — normal flames'
    : audit.sourceId === 'PSI-159-INV' ? ' — inverse flames' : '';
  const materials = audit.sourceId === 'PSI-159-NORM' ? 'Ethane, propane, butane and blends (normal flames).'
    : audit.sourceId === 'PSI-159-INV' ? 'Ethane, propane and butane (inverse flames).'
      : investigation.fuelMaterial;
  const title = `${investigation.name}${branch}`;
  return {
    id: audit.sourceId.toLowerCase(), sourceId: audit.sourceId, title, investigation,
    audit, localFile: audit.file, localFileUrl: localCsvUrls[`../../${audit.file}`] ?? null,
    availability: 'Local file available', dataType: 'Experimental table', phenomenonGroup: audit.category, materials,
    searchText: [audit.sourceId, title, audit.file, audit.role, audit.readiness, audit.note,
      investigation.psiId, investigation.objective, investigation.fuelMaterial,
      investigation.facilityHardware, investigation.measuredVariables].filter(Boolean).join(' ').toLowerCase(),
  };
});

const metadataRecords: ExplorerRecord[] = INVESTIGATIONS.filter((item) => item.status !== 'local').map((investigation) => ({
  id: investigation.id, sourceId: investigation.psiId, title: investigation.name, investigation,
  audit: null, localFile: null, localFileUrl: null,
  availability: investigation.status === 'registered' ? 'Metadata only' : investigation.status === 'external' ? 'External source lead' : 'Unavailable / monitor',
  dataType: investigation.status === 'external' ? 'Publication' : investigation.status === 'monitor' ? 'Project metadata' : 'Investigation metadata',
  phenomenonGroup: FUNCTION_LABEL[investigation.fn],
  materials: investigation.fuelMaterial,
  searchText: [investigation.psiId, investigation.name, investigation.objective, investigation.fuelMaterial,
    investigation.facilityHardware, investigation.measuredVariables, investigation.caveat].filter(Boolean).join(' ').toLowerCase(),
}));

export const EXPLORER_RECORDS = [...localRecords, ...metadataRecords];
export const EXPLORER_AUDIT_ROWS = auditRows;

export const RESEARCH_INTENTS = [
  { id: 'extinction', label: 'Flame extinction', function: 'suppress' },
  { id: 'spread', label: 'Flame spread', function: 'prevent' },
  { id: 'soot', label: 'Soot / smoke production', function: 'context' },
  { id: 'detection', label: 'Smoke detection', function: 'detect' },
] as const;
export type ResearchIntent = typeof RESEARCH_INTENTS[number]['id'];

const TARGET_EVIDENCE: Record<ResearchIntent, Record<string, 'present' | 'partial' | 'absent'>> = {
  extinction: { 'psi-69': 'partial', 'psi-159-norm': 'partial', 'psi-159-inv': 'partial' },
  spread: { 'psi-25': 'absent', 'psi-99': 'partial', 'psi-100': 'absent', 'psi-98': 'partial' },
  soot: { 'psi-107': 'absent', 'psi-60': 'present', 'psi-10': 'partial' },
  detection: { 'psi-102': 'absent', 'psi-101': 'partial', daft: 'partial' },
};

export type RelevanceEvidence = { points: number; reasons: string[]; gaps: string[]; target: string };
export function relevanceEvidence(record: ExplorerRecord, intent: ResearchIntent): RelevanceEvidence {
  const target = TARGET_EVIDENCE[intent][record.id] ?? 'absent';
  const targetPoints = target === 'present' ? 3 : target === 'partial' ? 2 : 0;
  const titleAndText = record.searchText;
  const intentText = intent === 'extinction' ? /extinct|extinguish|flame limit|self-ext|disruption/.test(titleAndText)
    : intent === 'spread' ? /spread|saffire|bass/.test(titleAndText)
      : intent === 'soot' ? /soot|spice|smoke-point|smoke point/.test(titleAndText)
        : /smoke|aerosol|particle|same|detection/.test(titleAndText);
  const reasons: string[] = [];
  const gaps: string[] = [];
  let points = targetPoints;
  if (target === 'present') reasons.push('The registered source description includes the requested measurement family; the files are not local.');
  else if (target === 'partial') reasons.push('A candidate event or related measurement is described, but its semantics or coverage need verification.');
  else gaps.push('No verified target column for this question is present in the indexed local table.');
  if (intentText) { points += 2; reasons.push('Investigation description matches the selected physical phenomenon.'); }
  else gaps.push('The indexed description has only an indirect connection to this phenomenon.');
  if (record.investigation.measuredVariables) { points += 1; reasons.push('Measured or candidate variables are described in the source catalogue.'); }
  else gaps.push('Measurement variables are not reported in the indexed source.');
  if (record.localFile) { points += 1; reasons.push('A local source table is available and linked to its audit entry.'); }
  else gaps.push('No local data file is indexed for this source.');
  if (record.audit && record.audit.nonEmptyRows === 0) gaps.push('The audited file has no non-empty records.');
  return { points, reasons, gaps, target };
}

export type ExplorerFilters = {
  query?: string;
  category?: string;
  availability?: string;
  type?: string;
  sort?: string;
  intent?: ResearchIntent;
};

export function filterExplorerRecords(filters: ExplorerFilters = {}): ExplorerRecord[] {
  const queryTerms = (filters.query ?? '').toLowerCase().trim().split(/\s+/).filter(Boolean);
  const matching = EXPLORER_RECORDS.filter((record) => {
    if (queryTerms.some((term) => !record.searchText.includes(term))) return false;
    if (filters.category && record.phenomenonGroup !== filters.category) return false;
    if (filters.availability && record.availability !== filters.availability) return false;
    if (filters.type && record.dataType !== filters.type) return false;
    return true;
  });
  const intent = filters.intent ?? 'extinction';
  return matching.sort((a, b) => {
    const evidenceA = relevanceEvidence(a, intent);
    const evidenceB = relevanceEvidence(b, intent);
    if (filters.sort === 'title') return a.title.localeCompare(b.title);
    if (filters.sort === 'id') return a.sourceId.localeCompare(b.sourceId, undefined, { numeric: true });
    if (filters.sort === 'completeness') {
      const fields = (record: ExplorerRecord) => [record.investigation.fuelMaterial, record.investigation.facilityHardware,
        record.investigation.measuredVariables, record.investigation.dates, record.audit?.rows]
        .filter((value) => value !== null && value !== undefined && value !== '').length;
      return fields(b) - fields(a) || a.title.localeCompare(b.title);
    }
    return evidenceB.points - evidenceA.points || Number(Boolean(b.localFile)) - Number(Boolean(a.localFile)) || a.sourceId.localeCompare(b.sourceId, undefined, { numeric: true });
  });
}

