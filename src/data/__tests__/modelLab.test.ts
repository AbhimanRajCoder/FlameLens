import { describe, expect, it } from 'vitest';
import { auditModelDataset, deriveTrackStatus, MODEL_TRACKS } from '../modelLab';

describe('model lab audits stay tied to local evidence', () => {
  it('preserves FLEX end labels as observed categories and keeps the target gated', async () => {
    const audit = await auditModelDataset('psi-69');
    expect(audit.nonEmptyRows).toBe(274);
    expect(audit.emptyRows).toBe(0);
    expect(audit.candidateIdentifierCount).toBe(274);
    expect(audit.targetValues[0].categories).toEqual([
      { value: 'Extinction', count: 186 },
      { value: 'Disruption', count: 61 },
      { value: 'Completion', count: 27 },
    ]);
    const status = deriveTrackStatus(MODEL_TRACKS.extinction, [audit], 0);
    expect(status.trained).toBe(false);
    expect(status.approvedTargetCount).toBe(0);
  });

  it('counts inverse CFI-G blank export rows separately from measured records', async () => {
    const audit = await auditModelDataset('psi-159-inv');
    expect(audit.nonEmptyRows).toBe(154);
    expect(audit.emptyRows).toBe(861);
    expect(audit.sourceId).toBe('psi-159-inv');
  });

  it('separates SAFFIRE-II sample, imagery-reference, and note rows from the source table', async () => {
    const audit = await auditModelDataset('psi-99');
    expect(audit.nonEmptyRows).toBe(15);
    expect(audit.rowKinds).toEqual([
      { label: 'Sample records', count: 9 },
      { label: 'Flow-visualization references', count: 2 },
      { label: 'Explanatory notes', count: 4 },
    ]);
  });

  it('reports SPICE target absence and repeated rows without creating soot labels', async () => {
    const audit = await auditModelDataset('psi-107');
    expect(audit.nonEmptyRows).toBe(469);
    expect(audit.exactDuplicateRows).toBe(34);
    expect(audit.targetValues.every((field) => !field.present)).toBe(true);
  });

  it('keeps SAME as a distinct detection evidence table', async () => {
    const audit = await auditModelDataset('psi-102');
    expect(audit.nonEmptyRows).toBe(8);
    expect(audit.rowKinds).toEqual([
      { label: 'Numeric condition rows', count: 4 },
      { label: 'Explanatory material rows', count: 4 },
    ]);
    expect(audit.targetValues[0].present).toBe(false);
  });
});
