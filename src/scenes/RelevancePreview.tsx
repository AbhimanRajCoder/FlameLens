import { useState } from 'react';
import { Reveal } from '../components/Reveal';
import { StatusChip } from '../components/SourceChip';
import { getInvestigation } from '../data/investigations';
import { DIMENSIONS, QUESTIONS, RUBRIC_VERSION, relevanceIndex } from '../data/ranking';

export function RelevancePreview() {
  const [questionId, setQuestionId] = useState(QUESTIONS[0].id);
  const [entryIdx, setEntryIdx] = useState(0);
  const question = QUESTIONS.find((q) => q.id === questionId)!;
  const entries = [...question.entries].sort((a, b) => relevanceIndex(b.scores) - relevanceIndex(a.scores));
  const entry = entries[Math.min(entryIdx, entries.length - 1)];
  const inv = getInvestigation(entry.investigationId)!;
  const maxIndex = Math.max(...entries.map((e) => relevanceIndex(e.scores)));

  return (
    <section className="chapter relevance-chapter" id="relevance" aria-labelledby="relevance-heading">
      <div className="container">
        <Reveal>
          <p className="section-label">Scene 05 · Research relevance</p>
          <h2 id="relevance-heading" className="chapter-title">
            From a research question to relevant evidence
          </h2>
          <p className="lede">
            FlameLens ranks investigations with a transparent rubric — six visible dimensions, adjustable weights and a
            rationale for every score. Try the example questions below.
          </p>
        </Reveal>

        <Reveal delay={80}>
          <div className="question-tabs" role="tablist" aria-label="Example research questions">
            {QUESTIONS.map((q) => (
              <button
                key={q.id}
                role="tab"
                id={`qtab-${q.id}`}
                aria-selected={q.id === questionId}
                aria-controls="relevance-panel"
                className={`question-tab ${q.id === questionId ? 'is-active' : ''}`}
                onClick={() => {
                  setQuestionId(q.id);
                  setEntryIdx(0);
                }}
              >
                {q.question}
              </button>
            ))}
          </div>
        </Reveal>

        <div className="relevance-grid" id="relevance-panel" role="tabpanel" aria-labelledby={`qtab-${questionId}`}>
          <Reveal className="rank-list" delay={120}>
            <p className="rank-profile mono">{question.profile} · {RUBRIC_VERSION}</p>
            <ol className="rank-entries">
              {entries.map((e, i) => {
                const ri = getInvestigation(e.investigationId)!;
                const idx = relevanceIndex(e.scores);
                return (
                  <li key={e.investigationId}>
                    <button
                      className={`rank-entry ${i === entryIdx ? 'is-selected' : ''}`}
                      aria-pressed={i === entryIdx}
                      onClick={() => setEntryIdx(i)}
                    >
                      <span className="rank-num mono">{String(i + 1).padStart(2, '0')}</span>
                      <span className="rank-main">
                        <span className="rank-name">
                          <span className="mono rank-psi">{ri.psiId}</span> {ri.name}
                        </span>
                        <span className="rank-bar" aria-hidden="true">
                          <span className="rank-bar-fill" style={{ width: `${(idx / maxIndex) * 100}%` }} />
                        </span>
                      </span>
                      <span className="rank-score mono">{idx.toFixed(1)}</span>
                    </button>
                  </li>
                );
              })}
            </ol>
            <p className="chip chip-caution rank-preview-note">
              <span className="dot" aria-hidden="true" />
              Conceptual preview — editorial assessment from indexed source descriptions, not yet a computed catalogue
              result.
            </p>
          </Reveal>

          <Reveal className="rank-detail" delay={200}>
            <div className="rank-detail-head">
              <h3>
                <span className="mono">{inv.psiId}</span> {inv.name}
              </h3>
              <StatusChip status={inv.status} />
            </div>
            <p className="rank-index-line">
              Relevance index <strong className="mono">{relevanceIndex(entry.scores).toFixed(1)}</strong> / 100
              <span className="rank-index-sub">Σ(weight × score ÷ 5), rubric v0.1</span>
            </p>
            <ul className="dimension-list">
              {DIMENSIONS.map((d) => (
                <li key={d.key}>
                  <div className="dimension-row">
                    <span className="dimension-label">{d.label}</span>
                    <span className="dimension-weight mono">{d.weight}%</span>
                    <span className="dimension-score mono">{entry.scores[d.key]}/5</span>
                  </div>
                  <div className="dimension-meter" aria-hidden="true">
                    {[0, 1, 2, 3, 4].map((n) => (
                      <span key={n} className={n < entry.scores[d.key] ? 'is-filled' : ''} />
                    ))}
                  </div>
                  <p className="dimension-rationale">{entry.rationale[d.key]}</p>
                </li>
              ))}
            </ul>
            <p className="does-not-establish">
              <strong>What this does not establish:</strong> {entry.doesNotEstablish}
            </p>
          </Reveal>
        </div>

        <Reveal>
          <p className="relevance-disclaimer">
            Research relevance means “worth examining for this question.” It is not hazard probability, safety
            certification, or proof that any system is safe.
          </p>
        </Reveal>
      </div>
    </section>
  );
}