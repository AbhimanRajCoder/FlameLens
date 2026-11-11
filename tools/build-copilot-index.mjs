import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUTPUT = path.join(ROOT, 'public', 'copilot-index.json');
const EXTENSIONS = new Set(['.md', '.csv', '.txt', '.pdf']);

const PSI_RECORDS = {
  'psi-25': { title: 'BASS-II experimental table', url: 'https://psi.nasa.gov/physci/repo/data/investigations/PSI-25' },
  'psi-69': { title: 'FLEX experimental table', url: 'https://psi.nasa.gov/physci/repo/data/investigations/PSI-69' },
  'psi-99': { title: 'SAFFIRE-II experimental table', url: 'https://psi.nasa.gov/physci/repo/data/investigations/PSI-99' },
  'psi-100': { title: 'SAFFIRE-III experimental table', url: 'https://psi.nasa.gov/physci/repo/data/investigations/PSI-100' },
  'psi-102': { title: 'SAME experimental table', url: 'https://psi.nasa.gov/physci/repo/data/investigations/PSI-102' },
  'psi-107': { title: 'SPICE experimental table', url: 'https://psi.nasa.gov/physci/repo/data/investigations/PSI-107' },
  'psi-159-normal': { title: 'CFI-G normal-flame experimental table', url: 'https://psi.nasa.gov/physci/repo/data/investigations/PSI-159' },
  'psi-159-inverse': { title: 'CFI-G inverse-flame experimental table', url: 'https://psi.nasa.gov/physci/repo/data/investigations/PSI-159' },
};

function listFiles(directory) {
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return listFiles(fullPath);
    return EXTENSIONS.has(path.extname(entry.name).toLowerCase()) ? [fullPath] : [];
  });
}

function investigationIdFor(relativePath) {
  const lowered = relativePath.toLowerCase();
  if (lowered.includes('cfi-g_normal')) return 'psi-159-normal';
  if (lowered.includes('cfi-g_inverse')) return 'psi-159-inverse';
  const psi = lowered.match(/psi[-_ ]?(\d{1,3})/);
  if (psi) return `psi-${psi[1]}`;
  if (lowered.includes('03_soot_smoke')) return 'psi-107';
  if (lowered.includes('04_smoke_detection')) return 'psi-102';
  if (lowered.includes('same-r')) return 'psi-101';
  if (lowered.includes('luci')) return 'luci';
  if (lowered.includes('daft')) return 'daft';
  if (lowered.includes('fm2')) return 'fm2';
  if (lowered.includes('bass-ii')) return 'bass-ii';
  return null;
}

function sourceIdFor(relativePath) {
  const inferredId = investigationIdFor(relativePath);
  if (relativePath.startsWith('data/source_data/') || relativePath.startsWith('data/research/')) return inferredId || 'local-data';
  const category = relativePath.startsWith('data/additional_official_sources/') ? 'note'
    : relativePath.startsWith('data/model_readmes/') ? 'method'
      : relativePath.startsWith('data/audit/') ? 'audit'
        : relativePath.startsWith('data/') ? 'evidence-note'
          : relativePath.startsWith('documents/') ? 'project-doc'
            : 'project';
  const basename = path.basename(relativePath, path.extname(relativePath)).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  return `${category}-${inferredId || basename}`;
}

function describeSource(relativePath, content) {
  const id = sourceIdFor(relativePath);
  const investigationId = investigationIdFor(relativePath);
  const filename = path.basename(relativePath, path.extname(relativePath)).replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').trim();
  const firstHeading = content?.split(/\r?\n/).find((line) => /^#\s+/.test(line))?.replace(/^#\s+/, '').trim();
  const psi = investigationId ? PSI_RECORDS[investigationId] : undefined;
  let classification = 'internal_project_document';
  let agency = 'FlameLens project';
  let documentType = 'Project documentation';
  let title = firstHeading || filename;
  let coverage = 'Project context and implementation notes.';
  let officialUrl;
  let ingestionStatus = 'indexed';
  let ingestionNote;

  if (relativePath.startsWith('data/source_data/')) {
    classification = 'primary_local_dataset';
    agency = 'NASA Physical Sciences Informatics (source record)';
    documentType = 'Supplied experimental table';
    title = psi?.title || filename;
    officialUrl = psi?.url;
    coverage = `Local table for ${(investigationId || id).toUpperCase()}; source release details should be verified against the linked NASA record.`;
  } else if (relativePath.startsWith('data/research/')) {
    classification = 'derived_transcription';
    agency = 'NASA technical report / FlameLens transcription';
    documentType = 'Report-derived data table';
    title = filename;
    officialUrl = 'https://ntrs.nasa.gov/citations/20210011385';
    coverage = 'A local transcription associated with NASA-TM-20210011385; values remain linked to the source report.';
  } else if (relativePath.startsWith('data/audit/')) {
    classification = 'internal_audit';
    documentType = 'Audit artifact';
    coverage = 'FlameLens data quality, coverage, provenance, or model-target audit. Not a NASA finding.';
  } else if (relativePath.startsWith('data/model_readmes/')) {
    classification = 'internal_methodology';
    documentType = 'Model methodology note';
    coverage = 'FlameLens target definitions, model scope, data limits, and validation requirements.';
  } else if (relativePath.startsWith('data/additional_official_sources/')) {
    classification = 'internal_source_note';
    documentType = 'Source review note';
    coverage = 'FlameLens notes summarizing a separately linked official source. Treat the note as secondary to the official source.';
    const official = content?.match(/https?:\/\/[^\s)>]+/);
    officialUrl = official?.[0]?.replace(/[.,;]+$/, '');
    const doi = content?.match(/DOI:\s*([^\s]+)/i);
    if (doi) title = `${title} · DOI ${doi[1]}`;
  } else if (relativePath.startsWith('data/reference/')) {
    classification = 'secondary_reference';
    agency = 'Reference document';
    documentType = 'PDF reference';
    ingestionStatus = 'not_indexed';
    ingestionNote = 'PDF extraction is not configured; this file is registered but excluded from retrieval.';
    coverage = 'Registered reference PDF; contents have not been parsed or searched.';
  } else if (relativePath.startsWith('data/')) {
    classification = 'internal_evidence_note';
    documentType = relativePath.endsWith('.csv') ? 'Audit or derived CSV' : 'Evidence note';
    coverage = 'FlameLens evidence mapping and source-use caveats; not a substitute for the linked primary record.';
  } else if (relativePath.startsWith('documents/')) {
    classification = 'internal_project_document';
    documentType = 'Project specification';
    coverage = 'FlameLens architecture, design, or product requirements.';
  } else if (relativePath === 'README.md') {
    classification = 'internal_project_document';
    documentType = 'Project overview';
  }

  return {
    sourceId: id,
    investigationId: investigationId || null,
    title,
    authorAgency: agency,
    sourceType: classification,
    documentType,
    publicationDate: 'Not stated in the indexed local file',
    version: 'Bundled local version; source release version not inferred',
    localPath: relativePath,
    officialUrl: officialUrl || null,
    coverage,
    ingestionStatus,
    ingestionNote: ingestionNote || null,
  };
}

function splitLong(text, limit = 760) {
  if (text.length <= limit) return [text];
  const sentences = text.split(/(?<=[.!?])\s+/);
  const parts = [];
  let current = '';
  for (const sentence of sentences) {
    if (current && `${current} ${sentence}`.length > limit) {
      parts.push(current);
      current = sentence;
    } else current = current ? `${current} ${sentence}` : sentence;
  }
  if (current) parts.push(current);
  return parts.flatMap((part) => part.length > limit ? part.match(new RegExp(`.{1,${limit}}`, 'g')) || [] : [part]);
}

function markdownChunks(source, content) {
  const chunks = [];
  const headings = [];
  let paragraph = [];
  let paragraphStart = 1;
  let paragraphNumber = 0;
  const flush = () => {
    const text = paragraph.join(' ').replace(/\s+/g, ' ').trim();
    paragraph = [];
    if (!text || text.length < 28) return;
    paragraphNumber += 1;
    const section = headings.filter(Boolean).join(' › ') || 'Opening text';
    for (const [partIndex, part] of splitLong(text).entries()) {
      const locator = `${section} · paragraph ${paragraphNumber}${partIndex ? ` (continued ${partIndex + 1})` : ''}`;
      chunks.push(makeChunk(source, locator, part, paragraphStart));
    }
  };

  content.split(/\r?\n/).forEach((line, index) => {
    const heading = line.match(/^(#{1,6})\s+(.+)/);
    if (heading) {
      flush();
      const level = heading[1].length - 1;
      headings.length = level;
      headings[level] = heading[2].trim();
      paragraphStart = index + 1;
      return;
    }
    if (!line.trim() || /^\s*```/.test(line) || /^\s*[-|: ]+\s*$/.test(line)) {
      flush();
      paragraphStart = index + 2;
      return;
    }
    const cleaned = line
      .replace(/^\s*>\s?/, '')
      .replace(/^\s*[-*+]\s+/, '')
      .replace(/^\s*\d+[.)]\s+/, '')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1 ($2)')
      .replace(/[`*_]/g, '');
    if (!paragraph.length) paragraphStart = index + 1;
    paragraph.push(cleaned.trim());
  });
  flush();
  return chunks;
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = '';
  let quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    if (quoted && char === '"' && text[index + 1] === '"') { cell += '"'; index += 1; }
    else if (char === '"') quoted = !quoted;
    else if (char === ',' && !quoted) { row.push(cell); cell = ''; }
    else if ((char === '\n' || char === '\r') && !quoted) {
      if (char === '\r' && text[index + 1] === '\n') index += 1;
      row.push(cell);
      if (row.some((value) => value.trim())) rows.push(row);
      row = [];
      cell = '';
    } else cell += char;
  }
  row.push(cell);
  if (row.some((value) => value.trim())) rows.push(row);
  return rows;
}

function csvChunks(source, content) {
  const rows = parseCsv(content);
  const headers = (rows.shift() || []).map((value, index) => value.trim() || `Column ${index + 1}`);
  return rows.flatMap((row, index) => {
    const cells = row.map((value, cellIndex) => ({ key: headers[cellIndex] || `Column ${cellIndex + 1}`, value: value.trim() }))
      .filter(({ value }) => value && value.toLowerCase() !== 'not reported');
    if (!cells.length) return [];
    const text = cells.map(({ key, value }) => `${key}: ${value}`).join('; ');
    return text.length < 24 ? [] : [makeChunk(source, `CSV row ${index + 2}`, text, index + 2)];
  });
}

function makeChunk(source, locator, text, line) {
  const stableId = crypto.createHash('sha1').update(`${source.localPath}\n${locator}\n${text}`).digest('hex').slice(0, 14);
  return { id: stableId, sourceId: source.sourceId, locator, line, text };
}

const trackedFiles = [
  ...listFiles(path.join(ROOT, 'data')),
  ...listFiles(path.join(ROOT, 'documents')),
  path.join(ROOT, 'README.md'),
  path.join(ROOT, 'MODEL_ARTIFACT_STATUS.txt'),
].filter((file) => fs.existsSync(file)).sort();

const sources = [];
const chunks = [];
const parseFailures = [];
for (const absolutePath of trackedFiles) {
  const relativePath = path.relative(ROOT, absolutePath).replaceAll(path.sep, '/');
  const raw = fs.readFileSync(absolutePath);
  const extension = path.extname(relativePath).toLowerCase();
  const content = extension === '.pdf' ? '' : raw.toString('utf8');
  const source = describeSource(relativePath, content);
  source.sha256 = crypto.createHash('sha256').update(raw).digest('hex');
  sources.push(source);

  if (source.ingestionStatus !== 'indexed') {
    parseFailures.push({ sourceId: source.sourceId, path: relativePath, reason: source.ingestionNote });
    continue;
  }
  if (extension === '.csv') chunks.push(...csvChunks(source, content));
  else if (extension === '.md' || extension === '.txt') chunks.push(...markdownChunks(source, content));
}

const output = {
  schemaVersion: 1,
  generatedAt: new Date().toISOString(),
  retrievalMode: 'local lexical retrieval; no LLM or embeddings configured',
  sources,
  chunks,
  parseFailures,
};
fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
fs.writeFileSync(OUTPUT, `${JSON.stringify(output)}\n`);
console.log(`Indexed ${chunks.length} chunks from ${sources.filter((source) => source.ingestionStatus === 'indexed').length} sources; ${parseFailures.length} registered source(s) not parsed.`);
