import { Reveal } from '../components/Reveal';
import { FunctionTag, StatusChip } from '../components/SourceChip';
import { INVESTIGATIONS } from '../data/investigations';

const PILLARS = [
  {
    fn: 'prevent' as const,
    index: '01',
    title: 'Prevent',
    thesis: 'Keep materials, atmospheres and flows outside the conditions where fire can take hold.',
    body: 'Material flammability, ignition sensitivity, oxygen concentration, airflow and flame spread define the prevention envelope. Solid-fuel evidence comes from thin samples to full-scale spacecraft fires.',
    families: [
      { ids: ['psi-25', 'psi-99', 'psi-100'], text: 'BASS-II and SAFFIRE II/III tables are indexed locally; SAFFIRE-I is registered for retrieval.' },
    ],
    boundary: 'A gaseous burner experiment (e.g. ACME BRE in the expansion backlog) is not automatically a solid-material flammability test.',
  },
  {
    fn: 'detect' as const,
    index: '02',
    title: 'Detect',
    thesis: 'Know what smoke looks like in microgravity — and what is only dust.',
    body: 'Smoke and aerosol generation, particle size and transport, sensor response and background discrimination. SAME and SAME-R are related but instrumentally distinct; DAFT/DAFT-2 characterize the dust and aerosols a detector must not mistake for fire.',
    families: [
      { ids: ['psi-102', 'psi-101', 'daft'], text: 'SAME conditions are local; SAME-R and DAFT evidence are registered, not yet ingested.' },
    ],
    boundary: 'Particle measurements are not detector alarm performance, and dust must never be labelled as combustion smoke.',
  },
  {
    fn: 'suppress' as const,
    index: '03',
    title: 'Suppress',
    thesis: 'Find the limits where flames can no longer survive.',
    body: 'Droplet and gaseous-flame extinguishment, suppressant dilution and flame survival limits. FLEX varied pressure and O₂/N₂/CO/He composition around burning droplets; CFI-G probed spherical gas-flame limits in separate normal and inverse configurations.',
    families: [
      { ids: ['psi-69', 'psi-159', 'psi-117'], text: 'FLEX and both CFI-G branches are local; FLEX-2 is a backlog candidate and PSI-117 is simulation context.' },
    ],
    boundary: 'Liquid-droplet extinction and gaseous-flame limits are different physical regimes — one is never evidence for the other by default.',
  },
];

export function Pillars() {
  return (
    <section className="chapter pillars-chapter" id="pillars" aria-labelledby="pillars-heading">
      <div className="container">
        <Reveal>
          <p className="section-label">Scene 03 · Three layers of fire safety</p>
          <h2 id="pillars-heading" className="chapter-title">
            One mission, three defensive layers
          </h2>
          <p className="lede">
            Prevention, detection and suppression draw on different investigations — and different physics. FlameLens
            keeps the relationships explicit instead of flattening them into one score.
          </p>
        </Reveal>

        <div className="pillars-track">
          <div className="orbit-line" aria-hidden="true">
            <svg viewBox="0 0 24 600" preserveAspectRatio="none">
              <line x1="12" y1="0" x2="12" y2="600" stroke="var(--hairline-strong)" strokeWidth="1" strokeDasharray="1 6" />
              {[60, 300, 540].map((y, i) => (
                <circle key={y} cx="12" cy={y} r="5" fill="var(--space-950)" stroke={['var(--fn-prevent)', 'var(--fn-detect)', 'var(--fn-suppress)'][i]} strokeWidth="1.6" />
              ))}
            </svg>
          </div>

          <div className="pillars-list">
            {PILLARS.map((p, i) => (
              <Reveal key={p.fn} as="article" className={`pillar pillar-${p.fn}`} delay={i * 90}>
                <div className="pillar-head">
                  <span className="pillar-index mono" aria-hidden="true">{p.index}</span>
                  <div>
                    <FunctionTag fn={p.fn} />
                    <h3 className="pillar-title">{p.title}</h3>
                  </div>
                </div>
                <p className="pillar-thesis">{p.thesis}</p>
                <p className="pillar-body">{p.body}</p>
                <div className="pillar-chips">
                  {p.families[0].ids.map((id) => {
                    const inv = INVESTIGATIONS.find((x) => x.id === id)!;
                    return (
                      <a key={id} href="#investigations" className="pillar-chip-link" aria-label={`${inv.name} — open in the constellation`}>
                        <span className="mono">{inv.psiId}</span> {inv.name}
                        <StatusChip status={inv.status} />
                      </a>
                    );
                  })}
                </div>
                <p className="pillar-family-note">{p.families[0].text}</p>
                <p className="pillar-boundary">
                  <svg width="13" height="13" viewBox="0 0 13 13" aria-hidden="true">
                    <circle cx="6.5" cy="6.5" r="5.6" fill="none" stroke="currentColor" strokeWidth="1.2" />
                    <path d="M6.5 3.4v3.4M6.5 9.2v.1" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                  </svg>
                  {p.boundary}
                </p>
              </Reveal>
            ))}
          </div>
        </div>

        <Reveal>
          <p className="pillars-closing">
            The orbit connects the layers; it does not merge them. One investigation is not automatically evidence for
            another phenomenon.
          </p>
        </Reveal>
      </div>
    </section>
  );
}