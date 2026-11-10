import { describe, expect, it } from 'vitest';
import {
  COMPARISON_SOURCES, EXPERIMENT_ATLAS, commonMetrics, compatibilityForMetric,
  getAtlasRecord, loadComparisonSeries, parseCsv, toCommonUnit,
} from '../comparisonLab';

describe('comparison lab provenance and eligibility', () => {
  it('maps the eight locally audited source tables', () => {
    expect(COMPARISON_SOURCES).toHaveLength(8);
    expect(COMPARISON_SOURCES.every((source) => source.record.localFile && source.record.audit)).toBe(true);
  });

  it('offers airflow for the SAFFIRE pair and pressure only for pressure-defined sources', () => {
    expect(commonMetrics(['psi-99', 'psi-100'])).toEqual(['airflow']);
    expect(commonMetrics(['psi-69', 'psi-159-norm'])).toEqual(['pressure']);
    expect(commonMetrics(['psi-102', 'psi-107'])).toEqual([]);
  });

  it('keeps same dimensions separate from incompatible outcome tasks', () => {
    expect(compatibilityForMetric(['psi-99', 'psi-100'], 'airflow').status).toBe('direct');
    expect(compatibilityForMetric(['psi-69', 'psi-159-norm'], 'pressure').status).toBe('caveat');
    expect(compatibilityForMetric(['psi-102', 'psi-107'], 'airflow').status).toBe('not-comparable');
    expect(compatibilityForMetric(['psi-159-norm', 'psi-159-inv'], 'pressure').status).toBe('direct');
  });

  it('parses quoted CSV, escaped quotes, and empty rows without losing source values', () => {
    expect(parseCsv('A,B\r\n"One, two","said ""yes"""\r\n,,\r\n3,4')).toEqual([
      { A: 'One, two', B: 'said "yes"' }, { A: '', B: '' }, { A: '3', B: '4' },
    ]);
  });

  it('converts FLEX mmHg to bar while retaining the original values in its series', async () => {
    expect(toCommonUnit(760, 'pressure', 'mmHg')).toBeCloseTo(1.01325, 4);
    const [flex] = await loadComparisonSeries(['psi-69'], 'pressure');
    expect(flex.field).toBe('Ambient pressure; mmHg');
    expect(flex.values.length).toBeGreaterThan(0);
    expect(flex.values[0].sourceValue).toBeTruthy();
    expect(flex.normalizedRange?.[0]).toBeCloseTo(flex.rawRange![0] * 133.322387415 / 100000, 10);
  });

  it('links every Atlas member to an indexed record and keeps CFI-G branches distinct', () => {
    for (const group of EXPERIMENT_ATLAS) for (const member of group.members) expect(getAtlasRecord(member.recordId)).toBeDefined();
    const cfi = EXPERIMENT_ATLAS.find((group) => group.id === 'cfi-g')!;
    expect(cfi.members.map((member) => member.recordId)).toEqual(['psi-159-norm', 'psi-159-inv']);
  });
});
