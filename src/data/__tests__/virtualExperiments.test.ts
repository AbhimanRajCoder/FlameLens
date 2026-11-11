import { describe, expect, it } from 'vitest';
import { runExtinctionExperiments } from '../virtualExperiments';

describe('FLEX virtual experiment diagnostics', () => {
  it('keeps dataset-level grouped metrics fixed while batch cases follow the selected conditions', async () => {
    const lowRange = await runExtinctionExperiments({
      fuel: 'Methanol', pressureMin: 500, pressureMax: 760, oxygenMin: 0.18, oxygenMax: 0.3,
      diameterMin: 1.2, diameterMax: 2.4, count: 5,
    });
    const highRange = await runExtinctionExperiments({
      fuel: 'Heptane', pressureMin: 1200, pressureMax: 2200, oxygenMin: 0.28, oxygenMax: 0.34,
      diameterMin: 3.1, diameterMax: 4.6, count: 5,
    });

    expect(highRange.evaluation).toEqual(lowRange.evaluation);
    expect(highRange.experiments.map(({ pressure, oxygen, diameter }) => [pressure, oxygen, diameter]))
      .not.toEqual(lowRange.experiments.map(({ pressure, oxygen, diameter }) => [pressure, oxygen, diameter]));
    expect(lowRange.trainingRows).toBe(lowRange.evaluation.observations);
  });
});
