import { useState, type CSSProperties } from 'react';
import { Reveal } from '../components/Reveal';
import { FunctionTag, StatusChip } from '../components/SourceChip';
import {
  FUNCTION_LABEL,
  INVESTIGATIONS,
  NOT_REPORTED,
  getInvestigation,
  type Investigation,
} from '../data/investigations';

const FN_COLOR: Record<Investigation['fn'], string> = {
  prevent: 'var(--fn-prevent)',
  detect: 'var(--fn-detect)',
  suppress: 'var(--fn-suppress)',
  context: 'var(--fn-context)',
};

const SHORT_LABEL: Record<string, string> = {
  'psi-62': 'PSI-62',
  'psi-159': 'CFI-G',
  daft: 'DAFT/DAFT-2',
  'psi-117': 'PSI-117',
  'psi-60': 'PSI-60',
  'psi-10': 'PSI-10',
  luci: 'LUCI',
  fm2: 'FM²',
};

/** Pack-verified relationships (never inferred). */
const LINKS: [string, string][] = [
  ['psi-102', 'psi-101'], // SAME → SAME-R reflight
  ['psi-69', 'psi-117'], // FLEX → CFD analysis
  ['psi-107', 'psi-60'], // SPICE → analysis
  ['psi-25', 'psi-62'], // BASS-II → tomography analysis
];

function nodeLabel(inv: Investigation): string {
  return SHORT_LABEL[inv.id] ?? inv.name;
}

function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const STARS = (() => {
  const rand = mulberry32(20261110);
  return Array.from({ length: 96 }, () => ({
    x: rand() * 720,
    y: rand() * 540,
    r: 0.4 + rand() * 1.1,
    o: 0.2 + rand() * 0.55,
    delay: -(rand() * 6),
    dur: 2.5 + rand() * 4,
  }));
})();

export function Constellation() {
  const [selectedId, setSelectedId] = useState('psi-69');
  const selected = getInvestigation(selectedId)!;

  const select = (id: string) => setSelectedId(id);

  return (
    <section className="chapter constellation-chapter" id="investigations" aria-labelledby="constellation-heading">
      <div className="container">
        <Reveal>
          <p className="section-label">Scene 04 · Investigation constellation</p>
          <h2 id="constellation-heading" className="chapter-title">
            A constellation of NASA investigations
          </h2>
          <p className="lede">
            Every node is a record supported by the supplied project documents. Select one to inspect what is actually
            indexed — and what is still only a registered source.
          </p>
        </Reveal>

        <div className="constellation-grid">
          <Reveal className="constellation-map-wrap" delay={100}>
            <svg
              viewBox="0 0 720 540"
              className="constellation-map"
              role="group"
              aria-label="Investigation constellation map. Use the node buttons or the list below to select an investigation."
              onPointerMove={(e) => {
                const r = e.currentTarget.getBoundingClientRect();
                e.currentTarget.style.setProperty('--cs-px', String((e.clientX - r.left) / r.width - 0.5));
                e.currentTarget.style.setProperty('--cs-py', String((e.clientY - r.top) / r.height - 0.5));
              }}
              onPointerLeave={(e) => {
                e.currentTarget.style.setProperty('--cs-px', '0');
                e.currentTarget.style.setProperty('--cs-py', '0');
              }}
            >
              <defs>
                <radialGradient id="cs-nebula-cyan" cx="0.5" cy="0.5" r="0.5">
                  <stop offset="0" stopColor="#66d9f2" stopOpacity="0.1" />
                  <stop offset="1" stopColor="#66d9f2" stopOpacity="0" />
                </radialGradient>
                <radialGradient id="cs-nebula-ember" cx="0.5" cy="0.5" r="0.5">
                  <stop offset="0" stopColor="#e66a52" stopOpacity="0.08" />
                  <stop offset="1" stopColor="#e66a52" stopOpacity="0" />
                </radialGradient>
                <filter id="cs-glow" x="-90%" y="-90%" width="280%" height="280%">
                  <feGaussianBlur stdDeviation="3.2" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* deep-space backdrop: nebulae + two parallax star layers */}
              <g aria-hidden="true">
                <ellipse className="cs-nebula" cx="250" cy="180" rx="270" ry="175" fill="url(#cs-nebula-cyan)" />
                <ellipse className="cs-nebula cs-nebula-b" cx="510" cy="390" rx="250" ry="165" fill="url(#cs-nebula-ember)" />
                <g className="cs-stars cs-stars-far" fill="#cfe3f2">
                  {STARS.slice(0, 62).map((s, i) => (
                    <circle key={i} className="cs-star" cx={s.x} cy={s.y} r={s.r} style={{ animationDelay: `${s.delay}s`, animationDuration: `${s.dur}s`, '--star-o': s.o } as CSSProperties} />
                  ))}
                </g>
                <g className="cs-stars cs-stars-near" fill="#e8f4fc">
                  {STARS.slice(62).map((s, i) => (
                    <circle key={i} className="cs-star" cx={s.x} cy={s.y} r={s.r + 0.4} style={{ animationDelay: `${s.delay}s`, animationDuration: `${s.dur}s`, '--star-o': Math.min(1, s.o + 0.15) } as CSSProperties} />
                  ))}
                </g>
              </g>

              {/* orbital guides */}
              <g fill="none" stroke="var(--hairline)" aria-hidden="true">
                <ellipse cx="360" cy="270" rx="330" ry="216" />
                <ellipse className="cs-orbit-spin" cx="360" cy="270" rx="248" ry="150" strokeDasharray="2 6" />
                <ellipse cx="360" cy="270" rx="150" ry="230" transform="rotate(24 360 270)" strokeOpacity="0.5" />
              </g>

              {/* verified relationships — animated evidence threads */}
              <g strokeDasharray="4 6" aria-hidden="true">
                {LINKS.map(([a, b]) => {
                  const ia = getInvestigation(a)!;
                  const ib = getInvestigation(b)!;
                  return <line key={`${a}-${b}`} className="cs-link" x1={ia.x} y1={ia.y} x2={ib.x} y2={ib.y} stroke={FN_COLOR[ia.fn]} />;
                })}
              </g>

              {INVESTIGATIONS.map((inv) => {
                const isSel = inv.id === selectedId;
                const color = FN_COLOR[inv.fn];
                return (
                  <g
                    key={inv.id}
                    transform={`translate(${inv.x} ${inv.y})`}
                    className={`constellation-node ${isSel ? 'is-selected' : ''}`}
                    role="button"
                    tabIndex={0}
                    aria-pressed={isSel}
                    aria-label={`${inv.psiId} ${inv.name} — ${FUNCTION_LABEL[inv.fn]}. ${inv.status === 'local' ? 'Local table indexed.' : 'Files not ingested.'}`}
                    onClick={() => select(inv.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        select(inv.id);
                      }
                    }}
                  >
                    {isSel && <circle className="sel-ring" r="14" fill="none" stroke={color} strokeWidth="1.2" />}
                    <circle r="18" fill="transparent" />
                    {inv.status === 'local' && <circle r="6.5" fill={color} filter="url(#cs-glow)" />}
                    {inv.status === 'registered' && <circle r="6.5" fill="var(--space-950)" stroke={color} strokeWidth="1.6" />}
                    {inv.status === 'external' && (
                      <>
                        <circle r="6.5" fill={color} filter="url(#cs-glow)" />
                        <circle r="10" fill="none" stroke={color} strokeWidth="0.9" strokeOpacity="0.6" />
                      </>
                    )}
                    {inv.status === 'monitor' && <circle r="6.5" fill="none" stroke={color} strokeWidth="1.6" strokeDasharray="2.4 2.4" />}
                    <circle className="node-halo" r="13" fill={color} aria-hidden="true" />
                    {isSel && <circle className="sel-ring-echo" r="14" fill="none" stroke={color} strokeWidth="1" aria-hidden="true" />}
                    <text className="node-label" y="26" textAnchor="middle" fill={isSel ? 'var(--text-100)' : 'var(--text-400)'}>
                      {nodeLabel(inv)}
                    </text>
                  </g>
                );
              })}
            </svg>

            <div className="constellation-legend" aria-hidden="true">
              <span><i style={{ background: 'var(--fn-prevent)' }} /> Prevention</span>
              <span><i style={{ background: 'var(--fn-detect)' }} /> Detection</span>
              <span><i style={{ background: 'var(--fn-suppress)' }} /> Suppression</span>
              <span><i style={{ background: 'var(--fn-context)' }} /> Context</span>
              <span className="legend-sep" />
              <span><i className="glyph-filled" /> Local</span>
              <span><i className="glyph-hollow" /> Registered</span>
              <span><i className="glyph-ring" /> External</span>
              <span><i className="glyph-dashed" /> Monitor</span>
            </div>

            <div className="constellation-chips" role="group" aria-label="Select an investigation">
              {INVESTIGATIONS.map((inv) => (
                <button
                  key={inv.id}
                  className={`inv-chip mono ${inv.id === selectedId ? 'is-selected' : ''}`}
                  aria-pressed={inv.id === selectedId}
                  onClick={() => select(inv.id)}
                >
                  {inv.psiId}
                </button>
              ))}
            </div>
          </Reveal>

          <Reveal delay={180} className="constellation-preview-wrap">
            <aside className="constellation-preview" aria-live="polite" aria-label={`Preview of ${selected.psiId} ${selected.name}`}>
              <div className="preview-top">
                <p className="mono preview-psi">{selected.psiId}</p>
                <h3 className="preview-name">{selected.name}</h3>
                <div className="preview-tags">
                  <FunctionTag fn={selected.fn} />
                  <StatusChip status={selected.status} />
                </div>
              </div>

              <p className="preview-objective">{selected.objective}</p>

              <dl className="spec-list">
                <div>
                  <dt>Fuel / material</dt>
                  <dd>{selected.fuelMaterial ?? <span className="not-reported">{NOT_REPORTED}</span>}</dd>
                </div>
                <div>
                  <dt>Facility / hardware</dt>
                  <dd>{selected.facilityHardware ?? <span className="not-reported">{NOT_REPORTED}</span>}</dd>
                </div>
                <div>
                  <dt>Measured variables</dt>
                  <dd>{selected.measuredVariables ?? <span className="not-reported">{NOT_REPORTED}</span>}</dd>
                </div>
                <div>
                  <dt>Dates</dt>
                  <dd>{selected.dates ?? <span className="not-reported">{NOT_REPORTED}</span>}</dd>
                </div>
                {selected.doi && (
                  <div>
                    <dt>DOI</dt>
                    <dd className="mono">{selected.doi}</dd>
                  </div>
                )}
                {selected.localFile && (
                  <div>
                    <dt>Local source</dt>
                    <dd className="mono local-path">{selected.localFile}</dd>
                  </div>
                )}
              </dl>

              <div className="callout preview-caveat">
                <svg className="callout-icon" width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
                  <path d="M7 1.5L13 12H1L7 1.5z" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
                  <path d="M7 5.4v3M7 10.2v.1" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                </svg>
                <span>{selected.caveat}</span>
              </div>

              {selected.sourceUrl && (
                <a className="btn btn-secondary btn-sm preview-source" href={selected.sourceUrl} target="_blank" rel="noopener noreferrer">
                  Official source record
                  <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
                    <path d="M4 2h6v6M10 2L2 10" stroke="currentColor" strokeWidth="1.3" fill="none" strokeLinecap="round" />
                  </svg>
                </a>
              )}
            </aside>
          </Reveal>
        </div>
      </div>
    </section>
  );
}