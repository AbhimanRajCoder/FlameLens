/**
 * Comparison preview values transcribed verbatim from the supplied raw CSVs:
 *  - FLEX row: test #2 / identifier 20CAL10 (PSI-69 experimental table)
 *  - SPICE row: GMT date 45, ignition 14:50:07 (PSI-107 experimental table)
 * null = not reported in the indexed source. Never zero-filled.
 */

export type CompareVerdict = 'same' | 'different' | 'unknown' | 'not-comparable';

export interface CompareRow {
  field: string;
  unitNote?: string;
  flex: string | null;
  spice: string | null;
  verdict: CompareVerdict;
  note?: string;
}

export const COMPARE_SUBJECTS = {
  flex: {
    label: 'FLEX · test 20CAL10',
    psiId: 'PSI-69',
    locator: 'Experimental table, row 2 · test date 3/5/2009',
  },
  spice: {
    label: 'SPICE · run 14:50:07',
    psiId: 'PSI-107',
    locator: 'Experimental table · GMT date 45, ignition 14:50:07',
  },
};

export const COMPARE_ROWS: CompareRow[] = [
  {
    field: 'Fuel',
    flex: 'Methanol',
    spice: 'Ethylene',
    verdict: 'different',
    note: 'Liquid droplet fuel vs gaseous jet fuel.',
  },
  {
    field: 'Sample / burner geometry',
    flex: 'Droplet initial diameter 1.86 mm',
    spice: 'Nozzle exit 1.6002 mm',
    verdict: 'not-comparable',
    note: 'A droplet diameter and a nozzle diameter are different physical quantities.',
  },
  {
    field: 'Ambient pressure',
    unitNote: 'source unit preserved',
    flex: '762 mmHg',
    spice: null,
    verdict: 'unknown',
    note: 'No pressure column exists in the supplied SPICE table.',
  },
  {
    field: 'Initial oxygen',
    flex: '0.21 mole fraction',
    spice: null,
    verdict: 'unknown',
    note: 'No oxygen column exists in the supplied SPICE table.',
  },
  {
    field: 'Imposed airflow',
    flex: null,
    spice: '40.15 cm/s (air velocity)',
    verdict: 'unknown',
    note: 'Velocity, not volumetric flow; FLEX table reports no airflow field.',
  },
  {
    field: 'Gravity regime',
    flex: 'Microgravity flight investigation (per indexed source notes)',
    spice: null,
    verdict: 'unknown',
    note: 'SPICE gravity regime is not stated in the indexed pack fields.',
  },
  {
    field: 'Recorded outcome',
    flex: 'Test end: Extinction · burn time 5 s',
    spice: 'GMT flame off 14:52:11 (event time only)',
    verdict: 'not-comparable',
    note: 'A droplet test-end category is not a smoke-point measurement.',
  },
];

export const VERDICT_LABEL: Record<CompareVerdict, string> = {
  same: 'Same',
  different: 'Different',
  unknown: 'Unknown',
  'not-comparable': 'Not comparable',
};