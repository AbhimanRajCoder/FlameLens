import { describe, expect, it } from 'vitest';
import { EXPLORER_RECORDS, filterExplorerRecords, relevanceEvidence } from '../explorer';

describe('investigation explorer index', () => {
  it('maps every audited file and preserves CFI-G configurations as separate results', () => {
    const local = EXPLORER_RECORDS.filter((record) => record.localFile);
    expect(local).toHaveLength(8);
    expect(EXPLORER_RECORDS).toHaveLength(17);
    expect(local.every((record) => record.audit && record.localFileUrl)).toBe(true);
    expect(local.find((record) => record.id === 'psi-159-norm')?.title).toContain('normal flames');
    expect(local.find((record) => record.id === 'psi-159-inv')?.title).toContain('inverse flames');
    expect(local.find((record) => record.id === 'psi-159-norm')?.materials).toContain('blends');
    expect(local.find((record) => record.id === 'psi-159-inv')?.materials).not.toContain('blends');
  });

  it('finds multiple search terms across IDs, variables, campaign, and filenames', () => {
    expect(filterExplorerRecords({ query: 'psi-107 spice' }).map((record) => record.id)).toContain('psi-107');
    expect(filterExplorerRecords({ query: 'weight-loss SAME' }).map((record) => record.id)).toContain('psi-102');
    expect(filterExplorerRecords({ query: 'PMMA BASS-II' }).map((record) => record.id)).toContain('psi-25');
  });

  it('combines area and availability filters and reports empty searches without fabricated matches', () => {
    const filtered = filterExplorerRecords({ category: 'Smoke Detection', availability: 'Local file available' });
    expect(filtered.map((record) => record.id)).toEqual(['psi-102']);
    expect(filterExplorerRecords({ query: 'nonexistent rocket propellant' })).toEqual([]);
  });

  it('supports ID/title sorting and uses audited counts without treating sources as training-ready', () => {
    expect(filterExplorerRecords({ sort: 'title' })[0].title).toBe('ACME Flame Design');
    expect(filterExplorerRecords({ sort: 'id' }).slice(0, 3).map((record) => record.sourceId)).toEqual(['DAFT / DAFT-2', 'FM²', 'LUCI']);
    const spice = EXPLORER_RECORDS.find((record) => record.id === 'psi-107')!;
    expect(spice.audit?.rows).toBe(469);
    expect(spice.audit?.duplicates).toBe(34);
    expect(spice.audit?.readiness).toMatch(/target audit/i);
  });

  it('keeps source gaps visible in the relevance explanation', () => {
    const spice = EXPLORER_RECORDS.find((record) => record.id === 'psi-107')!;
    const evidence = relevanceEvidence(spice, 'soot');
    expect(evidence.gaps.join(' ')).toMatch(/target column/i);
    expect(evidence.reasons.join(' ')).toMatch(/local source table/i);
    const daft = EXPLORER_RECORDS.find((record) => record.id === 'daft')!;
    expect(daft.localFile).toBeNull();
    expect(daft.availability).toBe('Metadata only');
  });
});
