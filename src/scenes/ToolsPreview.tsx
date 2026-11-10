import { Link } from 'react-router-dom';
import { Reveal } from '../components/Reveal';

const READINESS = [
  { branch: 'FLEX droplet extinction', status: 'Pilot candidate — target & grouping audit pending', state: 'caution' },
  { branch: 'CFI-G normal / inverse', status: 'Separate branches — event codes undecoded', state: 'caution' },
  { branch: 'Flame spread (BASS/SAFFIRE)', status: 'Experiment explorer — no verified spread-rate target', state: 'neutral' },
  { branch: 'SPICE soot / smoke point', status: 'Input-condition explorer — target must come from PSI-60', state: 'neutral' },
  { branch: 'Smoke detection (SAME family)', status: 'Evidence track — not a trained model by default', state: 'neutral' },
];

function ToolGlyph({ kind }: { kind: 'explorer' | 'lab' | 'copilot' | 'playground' }) {
  const common = { width: 44, height: 44, viewBox: '0 0 44 44', 'aria-hidden': true as const };
  if (kind === 'explorer')
    return (
      <svg {...common}>
        <circle cx="19" cy="19" r="10" fill="none" stroke="var(--ice-400)" strokeWidth="1.5" />
        <line x1="26.5" y1="26.5" x2="35" y2="35" stroke="var(--ice-400)" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="14" y1="17" x2="24" y2="17" stroke="var(--text-400)" strokeWidth="1.2" />
        <line x1="14" y1="21" x2="21" y2="21" stroke="var(--text-400)" strokeWidth="1.2" />
      </svg>
    );
  if (kind === 'lab')
    return (
      <svg {...common}>
        <rect x="8" y="8" width="28" height="28" rx="4" fill="none" stroke="var(--amber-400)" strokeWidth="1.5" />
        <path d="M14 27l5-6 4 3 7-9" fill="none" stroke="var(--amber-400)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="31" cy="13" r="2.4" fill="var(--space-950)" stroke="var(--amber-400)" strokeWidth="1.3" />
      </svg>
    );
  if (kind === 'copilot')
    return (
      <svg {...common}>
        <path d="M9 10h26v18H19l-7 6v-6H9z" fill="none" stroke="var(--safe-400)" strokeWidth="1.5" strokeLinejoin="round" />
        <line x1="14" y1="16" x2="30" y2="16" stroke="var(--text-400)" strokeWidth="1.2" />
        <line x1="14" y1="21" x2="25" y2="21" stroke="var(--text-400)" strokeWidth="1.2" />
        <circle cx="33" cy="24" r="1.6" fill="var(--safe-400)" />
      </svg>
    );
  return (
    <svg {...common}>
      <ellipse cx="22" cy="24" rx="15" ry="6" fill="none" stroke="var(--ember-500)" strokeWidth="1.3" strokeOpacity="0.7" transform="rotate(-16 22 24)" />
      <path d="M22 10c2.4 4 6 6.2 6 11a6 6 0 0 1-12 0c0-2.7 1.1-4.4 2.5-6.1.4 1.4 1 2.3 2 2.9-.3-2.3.6-5 1.5-7.8z" fill="var(--ember-500)" />
    </svg>
  );
}

export function ToolsPreview() {
  return (
    <section className="chapter tools-chapter" id="model-lab" aria-labelledby="tools-heading">
      <div className="container">
        <Reveal>
          <p className="section-label">Scene 07 · Research tools</p>
          <h2 id="tools-heading" className="chapter-title">
            Four connected capabilities, one evidence base
          </h2>
          <p className="lede">
            The dashboard is the product. Prediction is a gated capability inside it — available only where verified
            targets and independent experimental data support it.
          </p>
        </Reveal>

        <div className="tools-list">
          <Reveal as="article" className="tool-row" delay={60}>
            <ToolGlyph kind="explorer" />
            <div className="tool-body">
              <h3>Investigation Explorer</h3>
              <p>
                Search, filter and rank NASA research by safety function, material, gravity regime, hardware and data
                availability — with original source labels kept beside normalized ones.
              </p>
            </div>
            <span className="tool-status chip chip-registered"><span className="dot" />In development</span>
          </Reveal>

          <Reveal as="article" className="tool-row" delay={120}>
            <ToolGlyph kind="lab" />
            <div className="tool-body">
              <h3>Model Lab</h3>
              <p>
                Predictions only for validated targets and supported domains. Every release carries a frozen target
                definition, group-aware validation, baseline comparison and an applicability gate. Current readiness,
                from the data audit:
              </p>
              <ul className="readiness-list">
                {READINESS.map((r) => (
                  <li key={r.branch}>
                    <span className={`readiness-dot ${r.state}`} aria-hidden="true" />
                    <span className="readiness-branch">{r.branch}</span>
                    <span className="readiness-status">{r.status}</span>
                  </li>
                ))}
              </ul>
              <p className="tool-footnote mono">No trained model artifact exists in this milestone. None is claimed.</p>
            </div>
            <span className="tool-status chip chip-caution"><span className="dot" />Gated</span>
          </Reveal>

          <Reveal as="article" className="tool-row" delay={180} id="research-copilot">
            <ToolGlyph kind="copilot" />
            <div className="tool-body">
              <h3>SI Research Copilot</h3>
              <p>
                An evidence-grounded research assistant: retrieval before generation, claim-level citations to
                investigation/file locators, and explicit abstention when the indexed sources do not support an answer.
              </p>
            </div>
            <span className="tool-status chip chip-registered"><span className="dot" />In development</span>
          </Reveal>

          <Reveal as="article" className="tool-row" delay={240}>
            <ToolGlyph kind="playground" />
            <div className="tool-body">
              <h3>Educational Playground</h3>
              <p>
                Conceptual, interactive scenes — like the gravity explainer above — that teach the physics behind the
                evidence. A learning layer, never a replacement for research data.
              </p>
            </div>
            <a className="tool-status chip chip-local tool-link" href="#playground">
              <span className="dot" />Try it above
            </a>
          </Reveal>
        </div>

        <Reveal>
          <p className="tools-cta-line">
            All four capabilities open into the full research dashboard. <Link to="/sign-up">Get started →</Link>
          </p>
        </Reveal>
      </div>
    </section>
  );
}
