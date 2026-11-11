export type EvidenceSource = {
  sourceId: string;
  title: string;
  authorAgency: string;
  sourceType: string;
  documentType: string;
  publicationDate: string;
  version: string;
  localPath: string;
  officialUrl: string | null;
  coverage: string;
  ingestionStatus: 'indexed' | 'not_indexed';
  ingestionNote: string | null;
  sha256: string;
};

export type EvidenceChunk = {
  id: string;
  sourceId: string;
  locator: string;
  line: number;
  text: string;
};

export type CopilotIndex = {
  schemaVersion: number;
  generatedAt: string;
  retrievalMode: string;
  sources: EvidenceSource[];
  chunks: EvidenceChunk[];
  parseFailures: { sourceId: string; path: string; reason: string }[];
};

export type EvidenceMatch = { chunk: EvidenceChunk; source: EvidenceSource; score: number };

export type CopilotClaim = {
  text: string;
  evidence: EvidenceMatch;
  label: string;
};

export type CopilotAnswer = {
  kind: 'found' | 'not-found' | 'safety';
  heading: string;
  summary: string;
  claims: CopilotClaim[];
  followUps: string[];
  note?: string;
};

const STOP_WORDS = new Set([
  'a', 'about', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'can', 'does', 'for', 'from', 'how', 'i',
  'in', 'is', 'it', 'me', 'of', 'on', 'or', 'should', 'tell', 'that', 'the', 'their', 'this', 'to',
  'use', 'was', 'what', 'when', 'where', 'which', 'who', 'why', 'with', 'would', 'you', 'your', 'versus',
]);

let indexPromise: Promise<CopilotIndex> | null = null;

export function loadCopilotIndex(): Promise<CopilotIndex> {
  if (!indexPromise) {
    indexPromise = fetch('/copilot-index.json', { headers: { Accept: 'application/json' } }).then(async (response) => {
      if (!response.ok) throw new Error(`Evidence index request failed (${response.status}).`);
      const index = await response.json() as CopilotIndex;
      if (index.schemaVersion !== 1 || !Array.isArray(index.sources) || !Array.isArray(index.chunks)) {
        throw new Error('Evidence index schema is not recognized.');
      }
      return index;
    }).catch((error) => {
      indexPromise = null;
      throw error;
    });
  }
  return indexPromise;
}

function tokens(value: string) {
  return (value.toLocaleLowerCase().normalize('NFKD').match(/[\p{L}\p{N}-]+/gu) || [])
    .filter((token) => token.length > 1 && !STOP_WORDS.has(token));
}

export function rankEvidence(question: string, index: CopilotIndex, limit = 6): EvidenceMatch[] {
  const query = [...new Set(tokens(question))];
  if (!query.length || !index.chunks.length) return [];
  const documentFrequency = new Map<string, number>();
  const chunkTokens = index.chunks.map((chunk) => {
    const bag = new Set(tokens(`${chunk.text} ${chunk.locator} ${chunk.sourceId}`));
    for (const token of bag) documentFrequency.set(token, (documentFrequency.get(token) || 0) + 1);
    return bag;
  });
  const sourceById = new Map(index.sources.map((source) => [source.sourceId, source]));
  const normalizedQuestion = question.toLocaleLowerCase();
  const ranked = index.chunks.map((chunk, indexOfChunk) => {
    const bag = chunkTokens[indexOfChunk];
    let score = 0;
    for (const token of query) {
      if (!bag.has(token)) continue;
      const idf = Math.log(1 + (index.chunks.length - (documentFrequency.get(token) || 0) + 0.5) / ((documentFrequency.get(token) || 0) + 0.5));
      const titleMatch = sourceById.get(chunk.sourceId)?.title.toLocaleLowerCase().includes(token) ? 0.8 : 0;
      score += idf + titleMatch;
    }
    const source = sourceById.get(chunk.sourceId);
    if (source && normalizedQuestion.includes(source.sourceId.toLocaleLowerCase())) score += 2.2;
    if (source && normalizedQuestion.includes(source.title.toLocaleLowerCase())) score += 1.4;
    if (query.length > 1) {
      const phrase = query.join(' ');
      if (`${chunk.text} ${chunk.locator}`.toLocaleLowerCase().includes(phrase)) score += 1.8;
    }
    return source ? { chunk, source, score } : null;
  }).filter((match): match is EvidenceMatch => Boolean(match && match.score > 0));
  return ranked.sort((a, b) => b.score - a.score).slice(0, limit);
}

function clipExcerpt(text: string, maxLength = 410) {
  const clean = text.replace(/\s+/g, ' ').trim();
  if (clean.length <= maxLength) return clean;
  const boundary = clean.lastIndexOf(' ', maxLength);
  return `${clean.slice(0, boundary > 240 ? boundary : maxLength).trimEnd()}…`;
}

function followUpsFor(question: string) {
  const normalized = question.toLocaleLowerCase();
  if (normalized.includes('same') || normalized.includes('spice') || normalized.includes('smoke')) {
    return ['Separate smoke detection from soot production', 'What is not present in the local tables?'];
  }
  if (normalized.includes('cfi') || normalized.includes('normal') || normalized.includes('inverse')) {
    return ['Inspect CFI-G Normal alone', 'Inspect CFI-G Inverse alone'];
  }
  if (normalized.includes('gravity') || normalized.includes('lunar') || normalized.includes('mars')) {
    return ['What does the local evidence say about gravity regime?', 'Which records are only registered, not ingested?'];
  }
  return ['Compare two source records', 'What is missing from the available evidence?'];
}

const OPERATIONAL_PATTERN = /\b(what should (the )?crew|how do i (extinguish|put out|fight)|extinguish (a|the) fire now|fire response (procedure|checklist)|evacuat(e|ion)|life[- ]critical|operational fire|NASA[- ]approved .*fire|suppress (an|a|the) fire in (the )?(spacecraft|cabin))\b/i;
const UNAVAILABLE_REQUEST_PATTERN = /(?:hidden (?:system )?prompt|reveal.{0,30}(?:secret|credential|api key|prompt)|(?:exact|certified|official|approved).{0,35}(?:alarm|cutoff|threshold)|(?:alarm|cutoff|threshold).{0,35}(?:certified|approved))/i;

function bestDirectSources(question: string, index: CopilotIndex, sourceIds: string[], maxPerSource = 1): EvidenceMatch[] {
  const sourceById = new Map(index.sources.map((source) => [source.sourceId, source]));
  const query = new Set(tokens(question));
  return sourceIds.flatMap((sourceId) => {
    const source = sourceById.get(sourceId);
    if (!source) return [];
    return index.chunks.filter((chunk) => chunk.sourceId === sourceId).map((chunk) => {
      const overlap = tokens(chunk.text).filter((token) => query.has(token)).length;
      return { chunk, source, score: overlap + (query.has(sourceId) ? 2 : 0) };
    }).sort((a, b) => b.score - a.score).slice(0, maxPerSource);
  });
}

export function answerFromEvidence(question: string, index: CopilotIndex): CopilotAnswer {
  const matches = rankEvidence(question, index, index.chunks.length);
  const operational = OPERATIONAL_PATTERN.test(question);
  if (operational) {
    return {
      kind: 'safety',
      heading: 'Research evidence, not operational guidance',
      summary: 'FlameLens is a research discovery tool, not a certified spacecraft fire-response system. I can retrieve source material about combustion experiments, but I can’t recommend emergency actions.',
      claims: matches.slice(0, 3).map((evidence) => ({ text: clipExcerpt(evidence.chunk.text), evidence, label: 'Retrieved source passage' })),
      followUps: ['Show source-backed extinguishment research', 'What does FlameLens not certify?'],
      note: 'Use the mission’s approved emergency procedures and qualified operators for real incidents.',
    };
  }

  if (UNAVAILABLE_REQUEST_PATTERN.test(question)) {
    return {
      kind: 'not-found',
      heading: 'Not found in the indexed evidence',
      summary: 'The local evidence bundle does not contain a certified alarm threshold or a hidden system prompt. I can only retrieve source material that is registered and indexed for FlameLens.',
      claims: [],
      followUps: ['Ask about measurements recorded in a specific NASA investigation.', 'Inspect which sources are registered but not indexed.'],
    };
  }

  const threshold = Math.max(0.55, Math.min(1.25, 1.8 / Math.max(1, new Set(tokens(question)).size)));
  const normalized = question.toLowerCase();
  const sameAndSpice = /same/.test(normalized) && /spice|soot/.test(normalized);
  const cfiBranches = /cfi[- ]?g/.test(normalized) && /normal/.test(normalized) && /inverse/.test(normalized);
  const gravityBoundary = /partial[- ]gravity|lunar gravity|mars gravity|one[- ]sixth|1\/6\s*g/i.test(question);
  let relevant = matches.filter((match) => match.score >= threshold).slice(0, 4);
  const spiceTarget = /psi[- ]?107|\bspice\b/i.test(question) && /target|smoke|soot|table|measure/i.test(question);
  const flexLabels = /\bflex\b|psi[- ]?69/i.test(question) && /label|event|test end|category/i.test(question);
  if (sameAndSpice) {
    const records = bestDirectSources(question, index, ['psi-102', 'psi-107']);
    if (records.length) relevant = records;
  } else if (cfiBranches) {
    const branches = bestDirectSources(question, index, ['psi-159-normal', 'psi-159-inverse']);
    if (branches.length) relevant = branches;
  } else if (gravityBoundary) {
    const luci = bestDirectSources(question, index, ['note-luci'], 3);
    if (luci.length) relevant = luci.slice(0, 3);
  } else if (spiceTarget) {
    const spice = bestDirectSources(question, index, ['psi-107', '03-soot-smoke'], 1);
    if (spice.length) relevant = spice;
  } else if (flexLabels) {
    const flex = bestDirectSources(question, index, ['psi-69', '01-flame-extinction'], 2);
    if (flex.length) relevant = flex;
  } else if (/trained|validated|model artifact|independent validation/i.test(question)) {
    const status = bestDirectSources(question, index, ['project-model-artifact-status'], 1);
    if (status.length) relevant = status;
  }
  if (!relevant.length) {
    return {
      kind: 'not-found',
      heading: 'Not found in the indexed evidence',
      summary: 'I could not find a supporting passage in the local evidence index. This does not mean the claim is false; the source may not be included or parsed yet.',
      claims: [],
      followUps: ['Ask about an indexed investigation such as FLEX, BASS-II, SAME, SPICE, or CFI-G.', 'Check which files are registered but not indexed.'],
    };
  }

  const sourceCount = new Set(relevant.map(({ source }) => source.localPath)).size;
  const mixedSources = sourceCount > 1;
  let summary = `I found ${relevant.length} relevant passage${relevant.length === 1 ? '' : 's'} across ${sourceCount} local source file${sourceCount === 1 ? '' : 's'}. The cards below are short source extracts, each linked to its exact section or row.`;
  let note = 'These are retrieved source passages, not model-generated conclusions. The local index does not contain every NASA PSI file.';
  if (sameAndSpice) {
    summary = 'The indexed materials keep PSI-102 SAME detection evidence separate from PSI-107 SPICE soot / smoke-point research. Review each cited record independently; a shared word such as “smoke” does not make the targets interchangeable.';
    note = 'SAME is not soot production, and the supplied SPICE condition table does not itself establish a smoke-point or soot-volume-fraction target.';
  } else if (cfiBranches) {
    summary = 'The local files treat CFI-G Normal and CFI-G Inverse as separate branches. Their records should be compared side by side, not pooled as one undifferentiated dataset.';
    note = 'A shared PSI identifier does not establish identical geometry, target definition, or measurement protocol.';
  } else if (gravityBoundary) {
    summary = 'The retrieved notes identify LUCI as a simulated lunar-gravity publication, not a lunar-surface experiment or a validated partial-gravity model. The linked local record is a source review note; its underlying raw measurement package is not bundled.';
    note = 'Do not describe microgravity evidence as partial-gravity validation without direct validation data.';
  } else if (spiceTarget) {
    summary = 'The local PSI-107 SPICE table has no explicit smoke-point length, soot-volume-fraction, or smoke-emission target in its supplied columns. That missing target means this table alone does not support supervised training for those outcomes.';
    note = 'The SPICE methodology note records the target boundary; confirm field definitions and measurement provenance against the official NASA PSI-107 record before modeling.';
  } else if (flexLabels) {
    summary = 'The local FLEX evidence identifies Test end categories including Extinction, Disruption, and Completion. These are literal PSI-69 labels; the local methodology says not to collapse them into a binary target before verifying NASA’s event definitions and observation protocol.';
    note = 'The local labels are not a validated target definition or model result.';
  } else if (mixedSources) {
    note = 'These sources have different provenance and roles. Internal audits and summaries are not primary NASA findings; compare each source’s label and locator before combining claims.';
  }

  return {
    kind: 'found',
    heading: sameAndSpice ? 'Keep the evidence tracks separate' : cfiBranches ? 'Two CFI-G branches, kept distinct' : gravityBoundary ? 'A boundary on gravity transfer' : spiceTarget ? 'SPICE target boundary' : flexLabels ? 'FLEX event labels' : 'Evidence located',
    summary,
    claims: relevant.map((evidence) => ({ text: clipExcerpt(evidence.chunk.text), evidence, label: evidence.source.sourceType === 'primary_local_dataset' ? 'Local table excerpt' : evidence.source.sourceType === 'internal_audit' ? 'Internal audit excerpt' : 'Source note excerpt' })),
    followUps: followUpsFor(question),
    note,
  };
}

export const COPILOT_PROMPTS = [
  'Does PSI-102 SAME measure smoke detection or soot production?',
  'Are CFI-G Normal and Inverse combined in the local evidence?',
  'What target is missing from the PSI-107 SPICE table?',
  'Is there a trained or validated FlameLens model?',
  'What does the local evidence establish about lunar gravity?',
];
