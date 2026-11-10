/**
 * Mission-environment contexts. Scenario values come from the NASA challenge
 * brief as relayed in documents/Architecture.md §4 — they are labelled
 * scenario assumptions, never measurements from PSI experiment tables.
 */

export interface MissionContext {
  id: string;
  label: string;
  short: string;
  scenarioAssumptions: string[];
  evidenceCoverage: string[];
  gap: string;
}

export const MISSIONS: MissionContext[] = [
  {
    id: 'orbital',
    label: 'Orbital spacecraft / station',
    short: 'Orbital',
    scenarioAssumptions: [
      'ISS-like crew cabin used as the reference context for ranking and comparison.',
      'No pressure or oxygen value is assumed beyond what each indexed source actually reports.',
    ],
    evidenceCoverage: [
      'Seven local PSI tables from microgravity combustion investigations are indexed and audited.',
      'Droplet extinction (FLEX), gaseous flame limits (CFI-G), solid-fuel spread conditions (BASS-II, SAFFIRE), smoke-point inputs (SPICE) and aerosol-source conditions (SAME).',
    ],
    gap: 'Microgravity evidence does not automatically validate partial-gravity (Moon/Mars surface) fire safety.',
  },
  {
    id: 'lunar',
    label: 'Lunar habitat / pressurized rover',
    short: 'Lunar',
    scenarioAssumptions: [
      'Challenge-brief scenario: possible lunar habitat/rover atmosphere at ≥ 30% oxygen and ≤ 10.2 psi.',
      'Challenge-brief scenario: spacesuit operations can involve 100% oxygen at about 4.3 psi.',
      'These are scenario context from the brief — not design requirements and not measured conditions in every NASA experiment.',
    ],
    evidenceCoverage: [
      'LUCI: external NASA publication evidence for simulated lunar gravity (centrifugal acceleration on a rotating suborbital vehicle) — not a bundled PSI CSV.',
      'FM²: NASA lunar-gravity material flammability project to monitor for a future data release — a project page is not a dataset.',
    ],
    gap: 'No direct partial-gravity combustion dataset in the current PSI scope described by the challenge brief.',
  },
  {
    id: 'mars',
    label: 'Mars transit / surface',
    short: 'Mars',
    scenarioAssumptions: [
      'Mars transit habitat approximates the microgravity evidence context.',
      'Mars surface habitat sits in partial gravity, outside the directly measured PSI scope described by the brief.',
    ],
    evidenceCoverage: [
      'Microgravity investigations inform transit-habitat prevention, detection and suppression questions.',
      'Surface scenarios must carry an explicit gravity/atmosphere mismatch warning until partial-gravity data are released and verified.',
    ],
    gap: 'No direct partial-gravity combustion dataset in the current PSI scope described by the challenge brief.',
  },
];

export const METHODOLOGY_STEPS = [
  {
    title: 'Immutable sources',
    body: 'NASA PSI tables are preserved byte-for-byte, hashed and segregated by scientific track.',
  },
  {
    title: 'Audited catalogue',
    body: 'Row types, duplicates, empty rows and missing fields are classified — never silently repaired.',
  },
  {
    title: 'Transparent rubric',
    body: 'Relevance dimensions, weights and rationale stay visible and adjustable. Relevance is not risk.',
  },
  {
    title: 'Gated models',
    body: 'Prediction appears only after a frozen target, grouped validation and an applicability-domain gate.',
  },
];

export const DISCLAIMER =
  'FlameLens is a research discovery and decision-support platform. Its rankings and explanations are intended to help explore NASA combustion evidence. They are not a fire-risk certification, operational fire response procedure, spacecraft design approval or substitute for qualified engineering review.';