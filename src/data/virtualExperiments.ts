import { loadRawSourceRows, parseCsv, type ParsedRow } from './comparisonLab';

const researchFiles = import.meta.glob('../../data/research/*.csv', { query: '?raw' }) as Record<string, () => Promise<{ default: string }>>;
const BASS_TABLE_KEY = '../../data/research/BASS-II_Table5-1_NASA-TM-20210011385.csv';
const NUMBER = (value: string | undefined) => value === undefined || value.trim() === '' ? null : Number.isFinite(Number(value)) ? Number(value) : null;
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const range = (values: number[]) => ({ min: Math.min(...values), max: Math.max(...values) });
const halton = (index: number, base: number) => {
  let result = 0;
  let fraction = 1 / base;
  let n = index;
  while (n > 0) { result += fraction * (n % base); n = Math.floor(n / base); fraction /= base; }
  return result;
};

export interface ExtinctionQuery {
  fuel: string;
  pressureMin: number;
  pressureMax: number;
  oxygenMin: number;
  oxygenMax: number;
  diameterMin: number;
  diameterMax: number;
  count: number;
}
export interface ExtinctionExperiment {
  pressure: number;
  oxygen: number;
  diameter: number;
  estimatedLabel: string;
  support: { label: string; share: number }[];
  neighborIds: string[];
}
export interface EmpiricalEvaluation {
  observations: number;
  groups: number;
  mae?: number;
  rmse?: number;
  r2?: number;
  accuracy?: number;
  macroF1?: number;
}
export interface ExtinctionBatch {
  experiments: ExtinctionExperiment[];
  labelSummary: { label: string; share: number; count: number }[];
  trainingRows: number;
  evaluation: EmpiricalEvaluation;
  domain: { pressure: { min: number; max: number }; oxygen: { min: number; max: number }; diameter: { min: number; max: number }; fuels: string[] };
}

interface ExtinctionObservation {
  testId: string;
  fuel: string;
  pressure: number;
  oxygen: number;
  diameter: number;
  label: string;
}

function nonEmpty(row: ParsedRow) { return Object.values(row).some((value) => value.trim() !== ''); }
function flexObservations(rows: ParsedRow[]): ExtinctionObservation[] {
  return rows.filter(nonEmpty).flatMap((row) => {
    const pressure = NUMBER(row['Ambient pressure; mmHg']);
    const oxygen = NUMBER(row['O initial ambient composition; mole fraction']);
    const diameter = NUMBER(row['Droplet initial diameter; mm']);
    const fuel = row.Fuel?.trim();
    const label = row['Test end']?.trim();
    if (!pressure || oxygen === null || !diameter || !fuel || !label) return [];
    return [{ testId: row['FLEX Test #']?.trim() || `row-${rows.indexOf(row)}`, fuel, pressure, oxygen, diameter, label }];
  });
}

function classPrediction(query: Pick<ExtinctionObservation, 'fuel' | 'pressure' | 'oxygen' | 'diameter'>, rows: ExtinctionObservation[], excludedTestId?: string) {
  const allCandidates = rows.filter((row) => row.testId !== excludedTestId);
  const sameFuel = allCandidates.filter((row) => row.fuel === query.fuel);
  const candidates = sameFuel.length ? sameFuel : allCandidates;
  const pressureRange = range(rows.map((row) => row.pressure));
  const oxygenRange = range(rows.map((row) => row.oxygen));
  const diameterRange = range(rows.map((row) => row.diameter));
  const scale = (bounds: { min: number; max: number }) => Math.max(bounds.max - bounds.min, 1e-6);
  const ranked = candidates.map((row) => {
    const dp = (row.pressure - query.pressure) / scale(pressureRange);
    const do2 = (row.oxygen - query.oxygen) / scale(oxygenRange);
    const dd = (row.diameter - query.diameter) / scale(diameterRange);
    const distance = Math.sqrt((dp * dp + do2 * do2 + dd * dd) / 3);
    return { row, distance, weight: 1 / (distance + 0.035) };
  }).sort((a, b) => a.distance - b.distance).slice(0, 7);
  const totalWeight = ranked.reduce((sum, item) => sum + item.weight, 0) || 1;
  const shares = new Map<string, number>();
  ranked.forEach(({ row, weight }) => shares.set(row.label, (shares.get(row.label) ?? 0) + weight / totalWeight));
  const support = [...shares.entries()].map(([label, share]) => ({ label, share })).sort((a, b) => b.share - a.share);
  return { support, estimatedLabel: support[0]?.label ?? 'No comparable records', neighborIds: ranked.slice(0, 3).map(({ row }) => row.testId) };
}

function evaluateExtinction(rows: ExtinctionObservation[]): EmpiricalEvaluation {
  const labels = [...new Set(rows.map((row) => row.label))];
  const byLabel = new Map(labels.map((label) => [label, { actual: 0, predicted: 0, truePositive: 0 }]));
  let correct = 0;
  rows.forEach((row) => {
    const prediction = classPrediction(row, rows, row.testId).estimatedLabel;
    const actual = byLabel.get(row.label)!;
    const predicted = byLabel.get(prediction);
    actual.actual += 1;
    if (predicted) predicted.predicted += 1;
    if (prediction === row.label) { correct += 1; actual.truePositive += 1; }
  });
  const f1s = [...byLabel.values()].map((metric) => {
    const precision = metric.truePositive / Math.max(1, metric.predicted);
    const recall = metric.truePositive / Math.max(1, metric.actual);
    return (2 * precision * recall) / Math.max(1e-12, precision + recall);
  });
  return { observations: rows.length, groups: new Set(rows.map((row) => row.testId)).size, accuracy: correct / Math.max(1, rows.length), macroF1: f1s.reduce((sum, value) => sum + value, 0) / Math.max(1, f1s.length) };
}

export async function runExtinctionExperiments(query: ExtinctionQuery): Promise<ExtinctionBatch> {
  const rows = flexObservations(await loadRawSourceRows('psi-69'));
  if (!rows.length) throw new Error('The local FLEX table has no complete source-label cases.');
  const domain = {
    pressure: range(rows.map((row) => row.pressure)), oxygen: range(rows.map((row) => row.oxygen)),
    diameter: range(rows.map((row) => row.diameter)), fuels: [...new Set(rows.map((row) => row.fuel))].sort(),
  };
  const count = clamp(Math.round(query.count), 5, 100);
  const experiments = Array.from({ length: count }, (_, index) => {
    const pressure = clamp(query.pressureMin + halton(index + 1, 2) * (query.pressureMax - query.pressureMin), domain.pressure.min, domain.pressure.max);
    const oxygen = clamp(query.oxygenMin + halton(index + 1, 3) * (query.oxygenMax - query.oxygenMin), domain.oxygen.min, domain.oxygen.max);
    const diameter = clamp(query.diameterMin + halton(index + 1, 5) * (query.diameterMax - query.diameterMin), domain.diameter.min, domain.diameter.max);
    const result = classPrediction({ fuel: query.fuel, pressure, oxygen, diameter }, rows);
    return { pressure, oxygen, diameter, ...result };
  });
  const totals = new Map<string, number>();
  experiments.forEach((experiment) => totals.set(experiment.estimatedLabel, (totals.get(experiment.estimatedLabel) ?? 0) + 1));
  const labelSummary = [...totals.entries()].map(([label, count]) => ({ label, count, share: count / experiments.length })).sort((a, b) => b.count - a.count);
  return { experiments, labelSummary, trainingRows: rows.length, evaluation: evaluateExtinction(rows), domain };
}

export interface SpreadQuery { thickness: number; width: number; sides: 1 | 2; flowMin: number; flowMax: number; count: number }
export interface SpreadExperiment { flow: number; estimatedSpreadRate: number; estimated100mmTime: number; nearestTestIds: string[]; closestObservedRate: number }
export interface SpreadBatch { experiments: SpreadExperiment[]; averageRate: number; trainingRows: number; testGroups: number; evaluation: EmpiricalEvaluation; domain: { thickness: { min: number; max: number }; width: number[]; sides: number[]; flow: { min: number; max: number }; oxygenContext: { min: number; max: number } } }
interface SpreadObservation { testId: string; thickness: number; width: number; sides: number; flow: number; rate: number; initialO2: number; finalO2: number }

async function loadSpreadObservations(): Promise<SpreadObservation[]> {
  const importer = researchFiles[BASS_TABLE_KEY];
  if (!importer) throw new Error('The NASA BASS-II Table 5.1 transcription is missing from the build.');
  const { default: csv } = await importer();
  return parseCsv(csv).flatMap((row) => {
    const values = [NUMBER(row.thickness_mm), NUMBER(row.width_cm), NUMBER(row.sides_burning), NUMBER(row.opposed_flow_cm_s), NUMBER(row.spread_rate_mm_s), NUMBER(row.test_initial_o2_pct), NUMBER(row.test_final_o2_pct)];
    if (values.some((value) => value === null)) return [];
    const [thickness, width, sides, flow, rate, initialO2, finalO2] = values as number[];
    return [{ testId: row.test_id, thickness, width, sides, flow, rate, initialO2, finalO2 }];
  });
}

function spreadDistance(query: Pick<SpreadObservation, 'thickness' | 'width' | 'sides' | 'flow'>, row: SpreadObservation) {
  const diff = [
    (query.thickness - row.thickness) / 4,
    (query.width - row.width) / 1,
    (query.sides - row.sides),
    (query.flow - row.flow) / 19,
  ];
  return Math.sqrt(diff.reduce((sum, value) => sum + value * value, 0) / diff.length);
}

function predictSpread(query: Pick<SpreadObservation, 'thickness' | 'width' | 'sides' | 'flow'>, rows: SpreadObservation[], excludedTestId?: string) {
  const ranked = rows.filter((row) => row.testId !== excludedTestId).map((row) => ({ row, distance: spreadDistance(query, row) })).sort((a, b) => a.distance - b.distance).slice(0, 4);
  const weights = ranked.map(({ distance }) => 1 / (distance + 0.025));
  const sum = weights.reduce((total, weight) => total + weight, 0) || 1;
  const rate = ranked.reduce((total, item, index) => total + item.row.rate * weights[index] / sum, 0);
  return { rate, ranked, closestObservedRate: ranked[0]?.row.rate ?? 0 };
}

function evaluateSpread(rows: SpreadObservation[]): EmpiricalEvaluation {
  const residuals = rows.map((row) => row.rate - predictSpread(row, rows, row.testId).rate);
  const mean = rows.reduce((sum, row) => sum + row.rate, 0) / rows.length;
  const squaredError = residuals.reduce((sum, error) => sum + error * error, 0);
  const totalSquares = rows.reduce((sum, row) => sum + (row.rate - mean) ** 2, 0);
  return { observations: rows.length, groups: new Set(rows.map((row) => row.testId)).size, mae: residuals.reduce((sum, error) => sum + Math.abs(error), 0) / rows.length, rmse: Math.sqrt(squaredError / rows.length), r2: 1 - squaredError / totalSquares };
}

export async function runSpreadExperiments(query: SpreadQuery): Promise<SpreadBatch> {
  const rows = await loadSpreadObservations();
  if (!rows.length) throw new Error('The NASA BASS-II table contains no numerical spread measurements.');
  const flows = rows.map((row) => row.flow);
  const oxygen = rows.flatMap((row) => [row.initialO2, row.finalO2]);
  const domain = { thickness: range(rows.map((row) => row.thickness)), width: [...new Set(rows.map((row) => row.width))].sort(), sides: [...new Set(rows.map((row) => row.sides))].sort(), flow: range(flows), oxygenContext: range(oxygen) };
  const count = clamp(Math.round(query.count), 5, 100);
  const experiments = Array.from({ length: count }, (_, index) => {
    const flow = clamp(query.flowMin + halton(index + 1, 2) * (query.flowMax - query.flowMin), domain.flow.min, domain.flow.max);
    const prediction = predictSpread({ thickness: query.thickness, width: query.width, sides: query.sides, flow }, rows);
    return { flow, estimatedSpreadRate: prediction.rate, estimated100mmTime: 100 / prediction.rate, nearestTestIds: [...new Set(prediction.ranked.map((item) => item.row.testId))], closestObservedRate: prediction.closestObservedRate };
  });
  return { experiments, averageRate: experiments.reduce((sum, item) => sum + item.estimatedSpreadRate, 0) / experiments.length, trainingRows: rows.length, testGroups: new Set(rows.map((row) => row.testId)).size, evaluation: evaluateSpread(rows), domain };
}

export const SPICE_CORRELATION = {
  paper: 'Dotson, Sunderland, Yuan & Urban, Fire Safety Journal 46 (2011), 550–555',
  doi: 'https://doi.org/10.1016/j.firesaf.2011.08.002',
  pdf: 'https://terpconnect.umd.edu/~pbs/2011%20Dotson%20et%20al.%20FSJ.pdf',
  sampleCount: 55,
  fitR2: 0.90,
  diameterExponent: -0.910,
  coflowExponent: 0.414,
  lengthUncertaintyPercent: 5,
  airVelocityUncertaintyPercent: 10,
  fuels: [
    { id: 'ethylene', label: 'Ethylene', factor: 21.2 },
    { id: 'propane', label: 'Propane', factor: 18.5 },
    { id: 'propylene', label: 'Propylene', factor: 6.05 },
    { id: 'propylene75', label: '75% propylene / N₂', factor: 7.65 },
    { id: 'propylene50', label: '50% propylene / N₂', factor: 13.9 },
  ],
};

export interface SootQuery { fuelId: string; diameter: number; flowMin: number; flowMax: number; count: number }
export interface SootExperiment { flow: number; estimatedSmokePointLength: number }
export interface SootBatch { experiments: SootExperiment[]; averageLength: number; fuelLabel: string; fuelFactor: number; source: typeof SPICE_CORRELATION }

export function runSootExperiments(query: SootQuery): SootBatch {
  const fuel = SPICE_CORRELATION.fuels.find((item) => item.id === query.fuelId) ?? SPICE_CORRELATION.fuels[0];
  const count = clamp(Math.round(query.count), 5, 100);
  const experiments = Array.from({ length: count }, (_, index) => {
    const flow = clamp(query.flowMin + halton(index + 1, 2) * (query.flowMax - query.flowMin), 5.4, 65);
    const length = fuel.factor * query.diameter ** SPICE_CORRELATION.diameterExponent * flow ** SPICE_CORRELATION.coflowExponent;
    return { flow, estimatedSmokePointLength: length };
  });
  return { experiments, averageLength: experiments.reduce((sum, item) => sum + item.estimatedSmokePointLength, 0) / experiments.length, fuelLabel: fuel.label, fuelFactor: fuel.factor, source: SPICE_CORRELATION };
}
