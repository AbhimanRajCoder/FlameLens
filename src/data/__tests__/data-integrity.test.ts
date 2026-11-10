import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';
import { INVESTIGATIONS, NOT_REPORTED, getInvestigation } from '../investigations';
import { DIMENSIONS, QUESTIONS, relevanceIndex } from '../ranking';
import { COMPARE_ROWS } from '../comparison';

const root = resolve(__dirname, '../../..');

describe('investigation catalogue integrity', () => {
  it('has unique ids and PSI labels', () => {
    const ids = INVESTIGATIONS.map((i) => i.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const inv of INVESTIGATIONS) expect(inv.psiId.length).toBeGreaterThan(0);
  });

  it('every local-status record points at an existing source directory', () => {
    for (const inv of INVESTIGATIONS.filter((i) => i.status === 'local')) {
      expect(inv.localFile, inv.id).toBeTruthy();
      const dir = inv.localFile!.split(' ')[0];
      expect(existsSync(resolve(root, dir)), `${inv.id}: ${dir}`).toBe(true);
    }
  });

  it('non-local records never claim a local file', () => {
    for (const inv of INVESTIGATIONS.filter((i) => i.status !== 'local')) {
      expect(inv.localFile, inv.id).toBeNull();
    }
  });

  it('uses the canonical not-reported string, never zero, for unknown dates', () => {
    expect(NOT_REPORTED).toBe('Not reported in indexed source');
    for (const inv of INVESTIGATIONS) {
      if (inv.dates === null) continue;
      expect(inv.dates).not.toBe('0');
      expect(inv.dates.length).toBeGreaterThan(0);
    }
  });

  it('source links are official https URLs', () => {
    for (const inv of INVESTIGATIONS) {
      if (inv.sourceUrl === null) continue;
      expect(inv.sourceUrl, inv.id).toMatch(/^https:\/\/(psi\.nasa\.gov|science\.nasa\.gov|www\.nasa\.gov|ntrs\.nasa\.gov|www1\.grc\.nasa\.gov)/);
    }
  });

  it('keeps FLEX and CFI-G as separate records', () => {
    expect(getInvestigation('psi-69')?.name).toContain('FLEX');
    expect(getInvestigation('psi-159')?.name).toContain('CFI-G');
    expect(getInvestigation('psi-69')?.id).not.toBe(getInvestigation('psi-159')?.id);
  });

  it('marks LUCI external and FM² monitor-only', () => {
    expect(getInvestigation('luci')?.status).toBe('external');
    expect(getInvestigation('fm2')?.status).toBe('monitor');
  });
});

describe('relevance rubric', () => {
  it('weights sum to 100 across six dimensions', () => {
    expect(DIMENSIONS).toHaveLength(6);
    expect(DIMENSIONS.reduce((s, d) => s + d.weight, 0)).toBe(100);
  });

  it('computes the index as sum(weight × score ÷ 5)', () => {
    const scores = { safety: 5, phenomenon: 4, environment: 4, measurement: 3, hardware: 3, completeness: 1 };
    expect(relevanceIndex(scores)).toBe(74);
    const allFive = { safety: 5, phenomenon: 5, environment: 5, measurement: 5, hardware: 5, completeness: 5 };
    expect(relevanceIndex(allFive)).toBe(100);
    const allZero = { safety: 0, phenomenon: 0, environment: 0, measurement: 0, hardware: 0, completeness: 0 };
    expect(relevanceIndex(allZero)).toBe(0);
  });

  it('every ranked entry references a real investigation with in-range scores', () => {
    for (const q of QUESTIONS) {
      expect(q.entries.length).toBeGreaterThan(1);
      for (const e of q.entries) {
        expect(getInvestigation(e.investigationId), e.investigationId).toBeDefined();
        for (const d of DIMENSIONS) {
          const s = e.scores[d.key as keyof typeof e.scores];
          expect(s).toBeGreaterThanOrEqual(0);
          expect(s).toBeLessThanOrEqual(5);
          expect(e.rationale[d.key as keyof typeof e.rationale].length).toBeGreaterThan(10);
        }
        expect(e.doesNotEstablish.length).toBeGreaterThan(10);
      }
    }
  });
});

describe('comparison preview provenance', () => {
  const flexCsv = readFileSync(
    resolve(root, 'data/source_data/01_flame_extinction/PSI-69_FLEX/PSI-69_Experimental table_FLEX (1).csv'),
    'utf8',
  );
  const spiceCsv = readFileSync(
    resolve(root, 'data/source_data/03_soot_smoke/PSI-107_SPICE/PSI-107_Experimental table_Spice.csv'),
    'utf8',
  );

  it('FLEX values match raw row 20CAL10 verbatim', () => {
    const row = flexCsv.split(/\r?\n/).find((l) => l.startsWith('2,20CAL10,'))!;
    expect(row).toBeDefined();
    const cells = row.split(',');
    expect(cells[4]).toBe('Methanol');
    expect(cells[5]).toBe('762');
    expect(cells[6]).toBe('0.21');
    expect(cells[10]).toBe('1.86');
    expect(cells[13]).toBe('5');
    expect(cells[14].trim()).toBe('Extinction');
    const byField = Object.fromEntries(COMPARE_ROWS.map((r) => [r.field, r]));
    expect(byField['Fuel'].flex).toBe('Methanol');
    expect(byField['Ambient pressure'].flex).toBe('762 mmHg');
    expect(byField['Initial oxygen'].flex).toBe('0.21 mole fraction');
    expect(byField['Sample / burner geometry'].flex).toBe('Droplet initial diameter 1.86 mm');
    expect(byField['Recorded outcome'].flex).toBe('Test end: Extinction · burn time 5 s');
  });

  it('SPICE values match the raw GMT-45 14:50:07 row verbatim', () => {
    const row = spiceCsv.split(/\r?\n/).find((l) => l.startsWith('45,14:50:07,'))!;
    expect(row).toBeDefined();
    const cells = row.split(',');
    expect(cells[2]).toBe('14:52:11');
    expect(cells[3]).toBe('Ethylene');
    expect(cells[4]).toBe('1.6002');
    expect(cells[8]).toBe('40.15');
    const byField = Object.fromEntries(COMPARE_ROWS.map((r) => [r.field, r]));
    expect(byField['Fuel'].spice).toBe('Ethylene');
    expect(byField['Sample / burner geometry'].spice).toBe('Nozzle exit 1.6002 mm');
    expect(byField['Imposed airflow'].spice).toBe('40.15 cm/s (air velocity)');
    expect(byField['Recorded outcome'].spice).toBe('GMT flame off 14:52:11 (event time only)');
  });

  it('missing fields are null, never zero-filled', () => {
    const byField = Object.fromEntries(COMPARE_ROWS.map((r) => [r.field, r]));
    expect(byField['Ambient pressure'].spice).toBeNull();
    expect(byField['Initial oxygen'].spice).toBeNull();
    expect(byField['Imposed airflow'].flex).toBeNull();
    for (const row of COMPARE_ROWS) {
      for (const v of [row.flex, row.spice]) {
        if (v !== null) expect(v).not.toMatch(/^0(\.0+)?$/);
      }
    }
  });

  it('never calls a droplet test-end category comparable to a smoke-point event', () => {
    const outcome = COMPARE_ROWS.find((r) => r.field === 'Recorded outcome')!;
    expect(outcome.verdict).toBe('not-comparable');
  });
});

describe('3D asset provenance', () => {
  const manifest = JSON.parse(readFileSync(resolve(root, 'public/models/attribution.json'), 'utf8'));

  it('every manifest asset exists and is a valid glTF 2.0 binary with matching checksum', () => {
    expect(manifest.assets.length).toBeGreaterThanOrEqual(2);
    for (const asset of manifest.assets) {
      const file = resolve(root, 'public', asset.file.replace(/^\//, ''));
      expect(existsSync(file), asset.file).toBe(true);
      const buf = readFileSync(file);
      expect(buf.readUInt32LE(0)).toBe(0x46546c67); // "glTF"
      expect(buf.readUInt32LE(4)).toBe(2);
      expect(buf.readUInt32LE(8)).toBe(buf.length);
      expect(buf.length).toBe(asset.bytes);
      expect(createHash('sha256').update(buf).digest('hex')).toBe(asset.sha256);
    }
  });

  it('Draco decoders are served locally', () => {
    for (const f of ['draco_decoder.js', 'draco_decoder.wasm', 'draco_wasm_wrapper.js']) {
      expect(existsSync(resolve(root, 'public/draco', f)), f).toBe(true);
    }
  });

  it('honestly records which listed assets were not downloaded', () => {
    expect(manifest.notDownloaded.length).toBeGreaterThan(0);
  });
});