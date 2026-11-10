/**
 * Research Relevance rubric v0.1 — dimensions and weights from
 * documents/Architecture.md §2.4. Landing-page scores are an editorial
 * conceptual preview grounded in indexed source descriptions, NOT a computed
 * catalogue result and NOT a hazard probability.
 */

export interface RubricDimension {
  key: string;
  label: string;
  weight: number; // percent
}

export const RUBRIC_VERSION = 'rubric-v0.1 (heuristic)';

export const DIMENSIONS: RubricDimension[] = [
  { key: 'safety', label: 'Safety-need fit', weight: 25 },
  { key: 'phenomenon', label: 'Physical-phenomenon fit', weight: 20 },
  { key: 'environment', label: 'Environment fit', weight: 20 },
  { key: 'measurement', label: 'Measurement fit', weight: 15 },
  { key: 'hardware', label: 'Hardware / implementation transfer', weight: 10 },
  { key: 'completeness', label: 'Evidence completeness', weight: 10 },
];

export interface RankedEntry {
  investigationId: string;
  scores: Record<string, number>; // 0–5 per dimension
  rationale: Record<string, string>;
  doesNotEstablish: string;
}

export interface RelevanceQuestion {
  id: string;
  question: string;
  profile: string;
  entries: RankedEntry[];
}

export const QUESTIONS: RelevanceQuestion[] = [
  {
    id: 'detection',
    question: 'Which investigations inform smoke detection in a crew cabin?',
    profile: 'Detection · spacecraft/station',
    entries: [
      {
        investigationId: 'psi-102',
        scores: { safety: 5, phenomenon: 4, environment: 4, measurement: 2, hardware: 3, completeness: 2 },
        rationale: {
          safety: 'Directly targets smoke/aerosol generation from heated spacecraft materials.',
          phenomenon: 'Aerosol source behaviour under controlled airflow — adjacent to detector exposure conditions.',
          environment: 'Microgravity investigation context relevant to a crew cabin.',
          measurement: 'Local table holds only four numeric condition records; no particle-size or detector-response columns.',
          hardware: 'Source/material conditions can inform aerosol-generation test design.',
          completeness: 'Local CSV indexed, but notes rows are not independent tests and key diagnostics are absent.',
        },
        doesNotEstablish: 'Does not establish detector alarm performance, sensitivity or false-alarm behaviour.',
      },
      {
        investigationId: 'psi-101',
        scores: { safety: 5, phenomenon: 5, environment: 4, measurement: 3, hardware: 3, completeness: 1 },
        rationale: {
          safety: 'NASA record targets smoke-particle size quantification for detection-relevant evidence.',
          phenomenon: 'Particle size/morphology and transport are the core detection aerosol question.',
          environment: 'Flight investigation in the SAME lineage; microgravity context.',
          measurement: '66 flight test points and modified diagnostics described; reduced data not yet retrieved.',
          hardware: 'M-pass and modified instrumentation offer a sensor-context pathway.',
          completeness: 'Official metadata reviewed only — files are not bundled.',
        },
        doesNotEstablish: 'Nothing yet: no local measurements are ingested, and instrumentation differs from SAME.',
      },
      {
        investigationId: 'daft',
        scores: { safety: 4, phenomenon: 3, environment: 4, measurement: 2, hardware: 4, completeness: 1 },
        rationale: {
          safety: 'Background dust/aerosol discrimination is essential to avoid false alarms.',
          phenomenon: 'Measures non-combustion particles — a confounder, not smoke generation.',
          environment: 'ISS air-quality context matches crew-cabin background conditions.',
          measurement: 'Particle time series listed for retrieval; exact PSI files unverified.',
          hardware: 'Sensor-qualification evidence with a credible hardware transfer pathway.',
          completeness: 'Background publication identified; no measurement files bundled.',
        },
        doesNotEstablish: 'Does not establish combustion-smoke signatures; dust must never be labelled as smoke.',
      },
      {
        investigationId: 'psi-98',
        scores: { safety: 3, phenomenon: 3, environment: 4, measurement: 3, hardware: 2, completeness: 1 },
        rationale: {
          safety: 'Large-fire smoke transport and environmental sensing inform detection placement questions.',
          phenomenon: 'Fire growth and transport — adjacent to aerosol-source characterization.',
          environment: 'Spacecraft cargo-volume fire context.',
          measurement: 'Cameras, thermocouples, radiometers, pressure/O₂/CO₂ and anemometers described; files not bundled.',
          hardware: 'Sensor layout evidence, but not a detector-qualification campaign.',
          completeness: 'Metadata reviewed; imagery and sensor streams pending retrieval.',
        },
        doesNotEstablish: 'Does not establish detector response to the measured smoke field.',
      },
      {
        investigationId: 'psi-107',
        scores: { safety: 2, phenomenon: 2, environment: 3, measurement: 2, hardware: 1, completeness: 2 },
        rationale: {
          safety: 'Soot/smoke-point physics is upstream of smoke generation, not detection itself.',
          phenomenon: 'Coflow jet diffusion-flame soot physics — a different task from detector response.',
          environment: 'Microgravity combustion context; platform not reported in indexed source.',
          measurement: 'Input conditions only; the smoke-point target must come from PSI-60 analysis.',
          hardware: 'Limited direct detector-hardware pathway.',
          completeness: '469-row local table indexed; target columns absent and duplicates unresolved.',
        },
        doesNotEstablish: 'Does not establish smoke-detector performance; never a detection training set.',
      },
    ],
  },
  {
    id: 'prevention',
    question: 'Which investigations inform material flammability and flame spread for prevention?',
    profile: 'Prevention · spacecraft/station',
    entries: [
      {
        investigationId: 'psi-25',
        scores: { safety: 5, phenomenon: 5, environment: 4, measurement: 3, hardware: 3, completeness: 3 },
        rationale: {
          safety: 'Solid-fuel flammability under varied oxygen and flow is a core prevention question.',
          phenomenon: 'Direct flame-spread/extinction evidence on thin solid fuels.',
          environment: 'Microgravity tests with controlled imposed flow.',
          measurement: '129 condition records with calibrated gas readings; no consistent spread-rate target in this table.',
          hardware: 'Sample geometry and flow-control metadata inform test design.',
          completeness: 'Local table indexed and audited; spread-rate products require PSI-62 retrieval.',
        },
        doesNotEstablish: 'Does not provide a validated microgravity spread-rate prediction target.',
      },
      {
        investigationId: 'psi-99',
        scores: { safety: 5, phenomenon: 4, environment: 4, measurement: 2, hardware: 2, completeness: 2 },
        rationale: {
          safety: 'Large-scale sample fires address realistic spacecraft material configurations.',
          phenomenon: 'Concurrent/opposed spread evidence, though outcomes are text-coded.',
          environment: 'Spacecraft fire context with 20 cm/s imposed flow.',
          measurement: 'Nine sample rows; “?-g” semantics unresolved and many fields missing.',
          hardware: 'Camera records support imagery analysis pathways.',
          completeness: 'Mixed row types audited; calibrated targets not yet recovered.',
        },
        doesNotEstablish: '1-g entries never stand in for microgravity spread behaviour.',
      },
      {
        investigationId: 'psi-98',
        scores: { safety: 5, phenomenon: 4, environment: 4, measurement: 3, hardware: 3, completeness: 1 },
        rationale: {
          safety: 'The largest-scale fire growth evidence in the registered backlog.',
          phenomenon: 'Flame growth over a ~0.94 m SIBAL sample.',
          environment: 'Spacecraft cargo-volume conditions with ~20 cm/s airflow.',
          measurement: 'Rich sensor suite described; no files bundled.',
          hardware: 'Full-scale hardware and sensor layout evidence.',
          completeness: 'Metadata only at this stage.',
        },
        doesNotEstablish: 'No local measurements exist yet to quantify growth rates.',
      },
      {
        investigationId: 'psi-100',
        scores: { safety: 4, phenomenon: 3, environment: 4, measurement: 1, hardware: 2, completeness: 2 },
        rationale: {
          safety: 'Opposed-vs-concurrent configuration comparison supports prevention reasoning.',
          phenomenon: 'Configuration evidence without outcome measurements.',
          environment: '30 cm/s flow, SIBAL fabric geometry recorded.',
          measurement: 'Two condition rows; no outcome columns at all.',
          hardware: 'Camera identifiers only.',
          completeness: 'Fully indexed but intentionally metadata-only.',
        },
        doesNotEstablish: 'Cannot support any outcome prediction from two condition rows.',
      },
    ],
  },
  {
    id: 'suppression',
    question: 'Which investigations inform flame extinguishment and suppressant effects?',
    profile: 'Suppression · spacecraft/station',
    entries: [
      {
        investigationId: 'psi-69',
        scores: { safety: 5, phenomenon: 5, environment: 4, measurement: 3, hardware: 3, completeness: 3 },
        rationale: {
          safety: 'Droplet extinction under varied diluent composition speaks directly to suppression.',
          phenomenon: 'Isolated droplet combustion/extinction — the first pilot regime.',
          environment: 'Pressure and O₂/N₂/CO/He composition varied across 274 records.',
          measurement: 'Pre-test inputs plus outcomes recorded; “Test end” semantics still unverified.',
          hardware: 'Composition control offers a suppressant-dilution evidence pathway.',
          completeness: 'Local table audited; target freeze and grouping audit pending.',
        },
        doesNotEstablish: 'Does not yet establish a validated extinction classifier or gaseous-flame behaviour.',
      },
      {
        investigationId: 'psi-159',
        scores: { safety: 4, phenomenon: 4, environment: 4, measurement: 2, hardware: 2, completeness: 2 },
        rationale: {
          safety: 'Gaseous flame survival limits inform extinguishment boundaries.',
          phenomenon: 'Spherical gas diffusion flames — separate normal and inverse branches.',
          environment: 'Pressure and mixture conditions varied.',
          measurement: 'Event codes SE/FT/- undecoded; TFP excluded.',
          hardware: 'Burner configuration evidence.',
          completeness: 'Both branches indexed; inverse export contains 861 empty rows.',
        },
        doesNotEstablish: 'Not interchangeable with FLEX droplet extinction; no decoded target yet.',
      },
      {
        investigationId: 'psi-117',
        scores: { safety: 3, phenomenon: 4, environment: 3, measurement: 2, hardware: 1, completeness: 1 },
        rationale: {
          safety: 'Cool-flame dynamics inform why visible extinction may not end chemical activity.',
          phenomenon: 'CFD of droplet cool flames under perturbation.',
          environment: 'Simulation of flight conditions, not a new environment.',
          measurement: 'Simulation outputs require discrepancy evaluation against FLEX data.',
          hardware: 'No hardware pathway — computational study.',
          completeness: 'Catalogue metadata only.',
        },
        doesNotEstablish: 'Simulation results are not independent NASA observations.',
      },
    ],
  },
];

export function relevanceIndex(scores: Record<string, number>): number {
  const total = DIMENSIONS.reduce((sum, d) => sum + (scores[d.key] ?? 0) * d.weight, 0);
  return Math.round((total / 5) * 10) / 10; // 0–100, one decimal
}