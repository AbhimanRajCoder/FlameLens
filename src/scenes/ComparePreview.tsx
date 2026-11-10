import { Link } from 'react-router-dom';
import { Reveal } from '../components/Reveal';
import { COMPARE_ROWS, COMPARE_SUBJECTS, VERDICT_LABEL, type CompareVerdict } from '../data/comparison';

const VERDICT_CLASS: Record<CompareVerdict, string> = {
  same: 'verdict-same',
  different: 'verdict-different',
  unknown: 'verdict-unknown',
  'not-comparable': 'verdict-nc',
};

function VerdictIcon({ v }: { v: CompareVerdict }) {
  return (
    <svg width="11" height="11" viewBox="0 0 11 11" aria-hidden="true">
      {v === 'same' && <path d="M1.5 6l2.5 2.5L9.5 3" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />}
      {v === 'different' && <path d="M2 2l7 7M9 2l-7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />}
      {v === 'unknown' && <path d="M3.2 3.6a2.3 2.3 0 1 1 3.4 2c-.8.5-1.1.9-1.1 1.7M5.5 9.4v.1" stroke="currentColor" strokeWidth="1.3" fill="none" strokeLinecap="round" />}
      {v === 'not-comparable' && <path d="M1.5 5.5h8M3 2.5L1.5 5.5 3 8.5M8 2.5l1.5 3L8 8.5" stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />}
    </svg>
  );
}

export function ComparePreview() {
  return (
    <section className="chapter compare-chapter" id="compare" aria-labelledby="compare-heading">
      <div className="container">
        <Reveal>
          <p className="section-label">Scene 06 · Comparison lab preview</p>
          <h2 id="compare-heading" className="chapter-title">
            Compare conditions, not just titles
          </h2>
          <p className="lede">
            Two real records from the supplied tables, side by side. Missing values stay missing — and different
            physical regimes are flagged, not silently aligned.
          </p>
        </Reveal>

        <Reveal delay={120}>
          <div className="compare-table-wrap">
            <table className="compare-table">
              <caption className="sr-only">
                Comparison of FLEX test 20CAL10 and SPICE run 14:50:07, transcribed from the supplied experimental
                tables. Missing fields are shown as Not reported.
              </caption>
              <thead>
                <tr>
                  <th scope="col" className="compare-field-col">Field</th>
                  <th scope="col">
                    <span className="compare-subject mono">{COMPARE_SUBJECTS.flex.psiId}</span>
                    {COMPARE_SUBJECTS.flex.label}
                    <small className="mono">{COMPARE_SUBJECTS.flex.locator}</small>
                  </th>
                  <th scope="col">
                    <span className="compare-subject mono">{COMPARE_SUBJECTS.spice.psiId}</span>
                    {COMPARE_SUBJECTS.spice.label}
                    <small className="mono">{COMPARE_SUBJECTS.spice.locator}</small>
                  </th>
                  <th scope="col" className="compare-verdict-col">Status</th>
                </tr>
              </thead>
              <tbody>
                {COMPARE_ROWS.map((row) => (
                  <tr key={row.field}>
                    <th scope="row">
                      {row.field}
                      {row.unitNote && <small>{row.unitNote}</small>}
                    </th>
                    <td className="mono compare-value">
                      {row.flex ?? <span className="not-reported">Not reported</span>}
                    </td>
                    <td className="mono compare-value">
                      {row.spice ?? <span className="not-reported">Not reported</span>}
                    </td>
                    <td>
                      <span className={`verdict ${VERDICT_CLASS[row.verdict]}`}>
                        <VerdictIcon v={row.verdict} />
                        {VERDICT_LABEL[row.verdict]}
                      </span>
                      {row.note && <small className="compare-note">{row.note}</small>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Reveal>

        <Reveal delay={180}>
          <div className="callout compare-warning">
            <svg className="callout-icon" width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
              <path d="M7 1.5L13 12H1L7 1.5z" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
              <path d="M7 5.4v3M7 10.2v.1" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
            </svg>
            <span>
              <strong>Comparability warning.</strong> A burning methanol droplet and an ethylene coflow jet are different
              physical regimes. Identical field names do not guarantee identical definitions, units or measurement
              protocols — and “Not reported” never means zero.
            </span>
          </div>
          <p className="compare-cta-line">
            The full Comparison Lab aligns only semantically compatible variables and exports source-linked tables.{' '}
            <Link to="/sign-up">It ships with the dashboard →</Link>
          </p>
        </Reveal>
      </div>
    </section>
  );
}