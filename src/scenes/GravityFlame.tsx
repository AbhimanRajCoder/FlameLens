import { useState } from 'react';
import { Reveal } from '../components/Reveal';

type Regime = 'earth' | 'micro';

export function GravityFlame() {
  const [regime, setRegime] = useState<Regime>('micro');
  const [flow, setFlow] = useState(false);
  const [labels, setLabels] = useState(true);

  const micro = regime === 'micro';
  const flowActive = micro && flow;

  return (
    <section className="chapter gravity-chapter" id="playground" aria-labelledby="gravity-heading">
      <div className="container">
        <Reveal>
          <p className="section-label">Scene 02 · Playground</p>
          <h2 id="gravity-heading" className="chapter-title">
            Fire changes when gravity changes
          </h2>
          <p className="lede">
            The same fuel, the same chemistry — a different flame. Switch regimes to see why microgravity combustion
            demands its own evidence base.
          </p>
        </Reveal>

        <div className="gravity-grid">
          <Reveal className="gravity-stage-wrap" delay={100}>
            <div className={`gravity-stage regime-${regime} ${flowActive ? 'has-flow' : ''} ${labels ? 'show-labels' : ''}`}>
              <svg viewBox="0 0 400 420" role="img" aria-label={
                micro
                  ? `Conceptual microgravity flame: a rounded diffusion-dominated flame${flowActive ? ' elongated by imposed airflow' : ''}.`
                  : 'Conceptual Earth-gravity flame: a buoyant teardrop plume rising from the burner.'
              }>
                <defs>
                  <linearGradient id="flame-earth" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#f7d98b" />
                    <stop offset="0.45" stopColor="#f3b65a" />
                    <stop offset="1" stopColor="#e66a52" />
                  </linearGradient>
                  <radialGradient id="flame-micro" cx="0.5" cy="0.5" r="0.5">
                    <stop offset="0" stopColor="#d9f6fd" stopOpacity="0.95" />
                    <stop offset="0.55" stopColor="#66d9f2" stopOpacity="0.75" />
                    <stop offset="1" stopColor="#2a7fa8" stopOpacity="0" />
                  </radialGradient>
                  <radialGradient id="flame-micro-core" cx="0.5" cy="0.5" r="0.5">
                    <stop offset="0" stopColor="#eafbff" />
                    <stop offset="1" stopColor="#66d9f2" stopOpacity="0.1" />
                  </radialGradient>
                </defs>

                {/* instrument grid */}
                <g stroke="#a9b5c5" strokeOpacity="0.07">
                  {[80, 140, 200, 260, 320].map((y) => <line key={`h${y}`} x1="20" y1={y} x2="380" y2={y} />)}
                  {[80, 140, 200, 260, 320].map((x) => <line key={`v${x}`} x1={x} y1="40" x2={x} y2="380" />)}
                </g>

                {/* burner */}
                <rect x="186" y="338" width="28" height="16" rx="3" fill="#2c4258" />
                <rect x="194" y="330" width="12" height="10" rx="2" fill="#46617d" />
                <line x1="150" y1="354" x2="250" y2="354" stroke="#46617d" strokeWidth="2" />

                {/* flow arrows (micro + flow) */}
                <g className="flow-arrows" stroke="#66d9f2" strokeWidth="1.6" fill="none" strokeLinecap="round">
                  {[236, 262, 288].map((y) => (
                    <g key={y} className="flow-arrow">
                      <line x1="42" y1={y} x2="104" y2={y} />
                      <path d={`M98 ${y - 5}l7 5-7 5`} />
                    </g>
                  ))}
                </g>

                {/* Earth flame */}
                <g className="flame flame-earth">
                  <g className="flicker">
                    <path
                      d="M200 336 C 170 300 160 262 178 220 C 190 190 196 158 200 104 C 204 158 212 190 224 220 C 242 262 230 300 200 336 Z"
                      fill="url(#flame-earth)"
                      opacity="0.92"
                    />
                    <path d="M200 336 C 188 320 184 306 190 292 C 196 282 198 272 200 258 C 202 272 206 282 212 292 C 218 306 212 320 200 336 Z" fill="#7fc4e8" opacity="0.65" />
                  </g>
                  <circle className="ember-particle p1" cx="192" cy="250" r="2" fill="#f3b65a" />
                  <circle className="ember-particle p2" cx="208" cy="270" r="1.6" fill="#f3b65a" />
                  <circle className="ember-particle p3" cx="200" cy="230" r="1.4" fill="#f7d98b" />
                </g>

                {/* Microgravity flame */}
                <g className="flame flame-micro">
                  <ellipse className="micro-shell" cx="200" cy="270" rx="62" ry="62" fill="url(#flame-micro)" />
                  <ellipse className="micro-core" cx="200" cy="270" rx="26" ry="26" fill="url(#flame-micro-core)" opacity="0.85" />
                  <ellipse className="micro-outline" cx="200" cy="270" rx="62" ry="62" fill="none" stroke="#66d9f2" strokeOpacity="0.3" strokeDasharray="2 6" />
                  <circle className="diffusion-dot d1" cx="200" cy="270" r="1.6" fill="#9fe6f7" />
                  <circle className="diffusion-dot d2" cx="200" cy="270" r="1.4" fill="#9fe6f7" />
                  <circle className="diffusion-dot d3" cx="200" cy="270" r="1.2" fill="#9fe6f7" />
                </g>

                {/* labels */}
                <g className="scene-labels" fontFamily="IBM Plex Mono, monospace" fontSize="10.5" fill="#a9b5c5">
                  <g className="labels-earth">
                    <line x1="216" y1="150" x2="288" y2="118" stroke="#a9b5c5" strokeOpacity="0.4" />
                    <text x="292" y="116">buoyant plume rises</text>
                    <line x1="182" y1="318" x2="96" y2="330" stroke="#a9b5c5" strokeOpacity="0.4" />
                    <text x="24" y="334">O₂ drawn in at base</text>
                    <line x1="222" y1="230" x2="300" y2="230" stroke="#a9b5c5" strokeOpacity="0.4" />
                    <text x="304" y="233">soot glow</text>
                  </g>
                  <g className="labels-micro">
                    <line x1="238" y1="222" x2="300" y2="170" stroke="#a9b5c5" strokeOpacity="0.4" />
                    <text x="304" y="168">diffusion-fed shell</text>
                    <line x1="200" y1="204" x2="200" y2="150" stroke="#a9b5c5" strokeOpacity="0.4" />
                    <text x="146" y="140">no buoyant rise</text>
                    <line x1="146" y1="292" x2="86" y2="316" stroke="#a9b5c5" strokeOpacity="0.4" />
                    <text x="24" y="322">rounder, cooler, bluer</text>
                  </g>
                  <g className="labels-flow">
                    <text x="42" y="216" fill="#66d9f2">imposed flow</text>
                  </g>
                </g>
              </svg>
            </div>
            <p className="conceptual-note chip chip-caution">
              <span className="dot" aria-hidden="true" />
              Conceptual educational visualization — not CFD, not a measured NASA test, not a predictive simulation.
            </p>
          </Reveal>

          <Reveal delay={180} className="gravity-controls-col">
            <div className="control-block">
              <p className="control-label mono" id="regime-label">Gravity regime</p>
              <div className="segmented" role="group" aria-labelledby="regime-label">
                <button aria-pressed={!micro} onClick={() => setRegime('earth')}>
                  Earth gravity · 1 g
                </button>
                <button aria-pressed={micro} onClick={() => setRegime('micro')}>
                  Microgravity · µg
                </button>
              </div>
            </div>

            <div className="control-block">
              <button
                role="switch"
                aria-checked={flowActive}
                className="switch-row"
                disabled={!micro}
                onClick={() => setFlow((v) => !v)}
              >
                <span className={`switch ${flowActive ? 'is-on' : ''}`} aria-hidden="true"><span className="knob" /></span>
                <span>
                  Imposed airflow
                  <small>{micro ? 'Replace buoyancy with forced flow, as in BASS/SAFFIRE tests.' : 'Switch to microgravity to see flow take over from buoyancy.'}</small>
                </span>
              </button>
              <button role="switch" aria-checked={labels} className="switch-row" onClick={() => setLabels((v) => !v)}>
                <span className={`switch ${labels ? 'is-on' : ''}`} aria-hidden="true"><span className="knob" /></span>
                <span>
                  Explanatory labels
                  <small>Annotate the active transport mechanism.</small>
                </span>
              </button>
            </div>

            <div className="gravity-explainer" aria-live="polite">
              {micro ? (
                <>
                  <h3>Diffusion takes over</h3>
                  <p>
                    Without buoyancy, the flame relaxes toward a sphere. Oxygen reaches the reaction zone mainly by
                    diffusion; the flame can burn cooler and bluer, and radiation carries a larger share of the heat.
                    {flowActive &&
                      ' With imposed airflow, direction returns: the flow stretches the flame and meters its oxygen supply — the principle behind flow-controlled microgravity spread experiments.'}
                  </p>
                </>
              ) : (
                <>
                  <h3>Buoyancy drives the plume</h3>
                  <p>
                    On Earth, hot combustion products rise, drawing fresh oxygen in from below and stretching the flame
                    into the familiar teardrop. Soot particles glow yellow-orange as they ride the plume. This
                    convection-dominated behaviour is exactly what disappears in orbit.
                  </p>
                </>
              )}
              <p className="explainer-footnote mono">No physical measurement values are implied by this illustration.</p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}