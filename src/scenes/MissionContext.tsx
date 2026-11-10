import { useState } from 'react';
import { Reveal } from '../components/Reveal';
import { ModelViewer } from '../components/ModelViewer';
import { IssPoster, LunarModulePoster, MarsRoverPoster } from '../components/Posters';
import { METHODOLOGY_STEPS, MISSIONS } from '../data/missions';

export function MissionContext() {
  const [missionId, setMissionId] = useState('orbital');
  const mission = MISSIONS.find((m) => m.id === missionId)!;

  return (
    <section className="chapter mission-chapter" id="about" aria-labelledby="mission-heading">
      <div className="container">
        <Reveal>
          <p className="section-label">Scene 08 · Mission contexts & methodology</p>
          <h2 id="mission-heading" className="chapter-title">
            From ISS to Moon and Mars
          </h2>
          <p className="lede">
            Evidence travels only as far as its physics allows. Switch mission context to see what the indexed research
            covers — and where the gravity and atmosphere mismatch remains.
          </p>
        </Reveal>

        <Reveal delay={80}>
          <div className="segmented mission-switch" role="group" aria-label="Mission context">
            {MISSIONS.map((m) => (
              <button key={m.id} aria-pressed={m.id === missionId} onClick={() => setMissionId(m.id)}>
                {m.short}
              </button>
            ))}
          </div>
        </Reveal>

        <div className="mission-grid">
          <Reveal className="mission-visual" delay={120}>
            {missionId === 'orbital' && (
              <ModelViewer
                src="/models/iss-b.glb"
                label="International Space Station — NASA 3D model"
                description="Microgravity evidence context: the orbital station whose cabin environment anchors the indexed research."
                poster={<IssPoster />}
                className="orbital-model"
                autoRotateSpeed={0.4}
                attribution={
                  <a
                    className="model-credit"
                    href="https://science.nasa.gov/3d-resources/international-space-station-iss-b/"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Model: NASA Science 3D Resources
                  </a>
                }
              />
            )}
            {missionId === 'mars' && (
              <ModelViewer
                src="/models/perseverance.glb"
                label="Mars 2020 Perseverance Rover — NASA/JPL 3D model"
                description="Robotic exploration context only — not a crewed pressurized rover design."
                poster={<MarsRoverPoster />}
                className="mars-model"
                autoRotateSpeed={0.4}
                attribution={
                  <a
                    className="model-credit"
                    href="https://science.nasa.gov/3d-resources/mars-2020-perseverance-rover/"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Model: NASA/JPL · robotic context — not a crewed pressurized rover
                  </a>
                }
              />
            )}
            {missionId === 'lunar' && (
              <ModelViewer
                src="/models/apollo-lunar-module.glb"
                label="Apollo Lunar Module — NASA 3D model"
                description="Historical lunar-surface context. The Apollo Lunar Module is not current lunar habitat or pressurized rover hardware."
                poster={<LunarModulePoster />}
                className="lunar-model"
                autoRotateSpeed={0.4}
                attribution={
                  <a
                    className="model-credit"
                    href="https://science.nasa.gov/3d-resources/apollo-lunar-module/"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Model: NASA Science 3D Resources · historical context only
                  </a>
                }
              />
            )}
            <p className="mission-visual-caption mono">{mission.label}</p>
          </Reveal>

          <Reveal className="mission-detail" delay={200} key={missionId}>
            <div className="mission-block">
              <h3 className="mission-block-title mono">Scenario assumptions</h3>
              <ul className="mission-list">
                {mission.scenarioAssumptions.map((a) => <li key={a}>{a}</li>)}
              </ul>
            </div>
            <div className="mission-block">
              <h3 className="mission-block-title mono">Evidence coverage</h3>
              <ul className="mission-list">
                {mission.evidenceCoverage.map((c) => <li key={c}>{c}</li>)}
              </ul>
            </div>
            <div className="callout mission-gap">
              <svg className="callout-icon" width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
                <path d="M7 1.5L13 12H1L7 1.5z" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
                <path d="M7 5.4v3M7 10.2v.1" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
              </svg>
              <span><strong>Evidence gap.</strong> {mission.gap}</span>
            </div>
            {missionId === 'lunar' && (
              <div className="mission-source-chips">
                <a className="chip chip-external" href="https://ntrs.nasa.gov/citations/20250010653" target="_blank" rel="noopener noreferrer">
                  <span className="dot" />LUCI · external NASA publication
                </a>
                <a
                  className="chip chip-caution"
                  href="https://www.nasa.gov/glenn/glenn-expertise-space-exploration/physical-sciences-program/combustion-science/flammability-of-materials-on-the-moon-fm2/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span className="dot" />FM² · source to monitor
                </a>
              </div>
            )}
          </Reveal>
        </div>

        <Reveal>
          <div className="methodology">
            <h3 className="methodology-title">How FlameLens keeps evidence honest</h3>
            <ol className="methodology-steps">
              {METHODOLOGY_STEPS.map((s, i) => (
                <li key={s.title}>
                  <span className="method-num mono" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                  <div>
                    <h4>{s.title}</h4>
                    <p>{s.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </Reveal>
      </div>
    </section>
  );
}