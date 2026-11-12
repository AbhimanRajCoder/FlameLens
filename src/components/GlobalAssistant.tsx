import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { answerFromEvidence, loadCopilotIndex, type CopilotAnswer, type CopilotIndex } from '../data/copilot';
import { useAuth } from '../lib/AuthContext';

type ProviderState = 'checking' | 'ready' | 'not-configured' | 'unavailable';
type Guide = { title: string; summary: string; prompt: string };
type AssistantClaim = { text: string; sourceId: string; locator: string; url: string | null };
type AssistantReply = { heading: string; summary: string; claims: AssistantClaim[]; note?: string; suggestions?: string[] };
type Message = { id: number; role: 'user' | 'assistant'; text: string; reply?: AssistantReply };

const PAGE_GUIDES: { match: RegExp; guide: Guide }[] = [
  { match: /^\/$/, guide: { title: 'FlameLens home', summary: 'Start with the investigation overview, then move into the Explorer, Comparison Lab, Model Lab, or Mission Deck. The landing page introduces the research themes and tools.', prompt: 'How do I start exploring?' } },
  { match: /^\/dashboard/, guide: { title: 'Overview', summary: 'Use the dashboard to orient yourself to the available research areas, evidence summaries, and workspace links. Open an investigation or tool to inspect its source context.', prompt: 'What can I explore from the overview?' } },
  { match: /^\/explorer/, guide: { title: 'Investigation Explorer', summary: 'Search by investigation, source ID, material, measurement, or topic. Use the filters to narrow the catalogue, then open a record to review its objective, local file coverage, source links, and evidence gaps.', prompt: 'How do I find an investigation?' } },
  { match: /^\/comparison/, guide: { title: 'Comparison Lab', summary: 'Choose up to three records, compare their reported context, and select a field for a distribution view where definitions and units permit. The eligibility notes explain differences that limit direct comparison.', prompt: 'How do I compare two sources?' } },
  { match: /^\/models\/extinction/, guide: { title: 'Flame extinction workspace', summary: 'Set fuel, pressure, oxygen fraction, droplet diameter, and batch size. Run a local case-based estimate, inspect the neighbor labels and grouped diagnostic, and read the target-definition notes beside the result.', prompt: 'What do the FLEX results mean?' } },
  { match: /^\/models\/spread/, guide: { title: 'Flame spread workspace', summary: 'Set the PMMA sample geometry, burning sides, opposed airflow, and batch size. The workspace interpolates from NASA BASS-II PMMA measurements and reports the supporting burn IDs and grouped error metrics.', prompt: 'How is spread rate estimated?' } },
  { match: /^\/models\/soot-smoke/, guide: { title: 'Soot and smoke-point workspace', summary: 'Choose a fuel, burner diameter, and coflow range to evaluate the published SPICE smoke-point correlation. Its output is luminous length, with the paper, domain, and uncertainty shown beside it.', prompt: 'What does smoke-point length mean?' } },
  { match: /^\/models/, guide: { title: 'Model Lab', summary: 'Choose a track for extinction, flame spread, or smoke-point analysis. Each has its own inputs, method, evidence base, and supported range. Read its method and scope notes before interpreting an output.', prompt: 'Which Model Lab track should I use?' } },
  { match: /^\/playground/, guide: { title: 'Mission Deck', summary: 'The Mission Deck is a short science-literacy game. Read each fictional incident and source line, choose the evidence-safe response, and use Mica’s field notes to understand the reasoning.', prompt: 'How do I play the Mission Deck?' } },
  { match: /^\/copilot/, guide: { title: 'Research Copilot', summary: 'Ask a question about an indexed investigation or method. Local evidence search returns linked passages you can inspect in the source trail. Provider-generated summaries are optional and require explicit consent.', prompt: 'How do source citations work?' } },
  { match: /^\/(sign-in|sign-up|forgot-password|reset-password)/, guide: { title: 'Account access', summary: 'Sign in or create an account to save supported account features, or choose guest access where offered to explore the research workspaces. Password recovery is available from the sign-in page.', prompt: 'Can I explore as a guest?' } },
];

const HELP_QUESTION = /^(hi|hello|hey|good morning|good afternoon|good evening|help|help me|what can you do|what can i do here|where do i start)[!.?\s]*$/i;
const PAGE_QUESTION = /\b(this page|current page|this screen|what (is|does) (this|the) (page|screen|workspace)|how (do i|to|can i) (use|find|compare|open|select|navigate|search|run|start|play)|where (do i|can i)|what can i (do|explore)( here)?|how does this work)\b/i;

function sourceClaims(answer: CopilotAnswer): AssistantClaim[] {
  return answer.claims.slice(0, 3).map((claim) => ({
    text: claim.text,
    sourceId: claim.evidence.source.sourceId,
    locator: claim.evidence.chunk.locator,
    url: claim.evidence.source.officialUrl,
  }));
}

function getPageContext(guide: Guide) {
  const heading = document.querySelector('main h1, h1')?.textContent?.trim();
  const sections = Array.from(document.querySelectorAll('main h2')).slice(0, 5).map((item) => item.textContent?.trim()).filter(Boolean);
  return [guide.title, heading, guide.summary, sections.length ? `Visible sections: ${sections.join('; ')}` : ''].filter(Boolean).join('. ').slice(0, 1200);
}

function asAssistantReply(answer: CopilotAnswer): AssistantReply {
  return { heading: answer.heading, summary: answer.summary, claims: sourceClaims(answer), note: answer.note, suggestions: answer.followUps.slice(0, 2) };
}

export function GlobalAssistant() {
  const location = useLocation();
  const { session, isGuest } = useAuth();
  const guide = useMemo(() => PAGE_GUIDES.find(({ match }) => match.test(location.pathname))?.guide ?? {
    title: 'FlameLens workspace', summary: 'Explore NASA combustion investigations, compare source evidence, and follow links back to the underlying records.', prompt: 'How do I use this workspace?',
  }, [location.pathname]);
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [provider, setProvider] = useState<ProviderState>('checking');
  const [providerConsent, setProviderConsent] = useState(false);
  const [index, setIndex] = useState<CopilotIndex | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let active = true;
    fetch('/api/copilot?mode=status', { headers: { Accept: 'application/json' } }).then(async (response) => {
      if (!response.ok) throw new Error('Provider status is unavailable.');
      return response.json() as Promise<{ configured?: boolean }>;
    }).then((status) => { if (active) setProvider(status.configured ? 'ready' : 'not-configured'); })
      .catch(() => { if (active) setProvider('unavailable'); });
    return () => { active = false; };
  }, []);

  useEffect(() => { if (open) inputRef.current?.focus(); }, [open]);
  useEffect(() => { endRef.current?.scrollIntoView({ block: 'end', behavior: 'smooth' }); }, [messages, busy]);
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open]);

  const ask = async (raw: string) => {
    const nextQuestion = raw.trim();
    if (!nextQuestion || busy) return;
    setMessages((items) => [...items, { id: Date.now(), role: 'user', text: nextQuestion }]);
    setQuestion(''); setBusy(true); setError('');
    try {
      const pageContext = getPageContext(guide);
      if (HELP_QUESTION.test(nextQuestion) || PAGE_QUESTION.test(nextQuestion) || nextQuestion.toLocaleLowerCase() === guide.prompt.toLocaleLowerCase()) {
        setMessages((items) => [...items, { id: Date.now() + 1, role: 'assistant', text: '', reply: { heading: guide.title, summary: guide.summary, claims: [] } }]);
        return;
      }

      const localIndex = index ?? await loadCopilotIndex();
      setIndex(localIndex);
      const localAnswer = answerFromEvidence(nextQuestion, localIndex);
      let reply = asAssistantReply(localAnswer);
      if (providerConsent && provider === 'ready' && session?.access_token) {
        try {
          const response = await fetch('/api/copilot', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
            body: JSON.stringify({ question: nextQuestion, pageContext }),
          });
          const payload = await response.json() as { claims?: { text: string; evidenceIds: string[] }[]; followUps?: string[]; error?: string };
          if (!response.ok) throw new Error(payload.error || 'The configured AI provider is unavailable.');
          const sourceById = new Map(localIndex.sources.map((source) => [source.sourceId, source]));
          const chunkById = new Map(localIndex.chunks.map((chunk) => [chunk.id, chunk]));
          const claims = (payload.claims ?? []).flatMap((claim) => claim.evidenceIds.map((id) => {
            const chunk = chunkById.get(id);
            const source = chunk && sourceById.get(chunk.sourceId);
            return chunk && source ? { text: claim.text, sourceId: source.sourceId, locator: chunk.locator, url: source.officialUrl } : null;
          }).filter((claim): claim is AssistantClaim => Boolean(claim))).slice(0, 3);
          if (claims.length) reply = { heading: 'AI summary · source-linked', summary: 'A configured AI provider summarized retrieved local evidence. Check the linked passages for the source wording.', claims, suggestions: (payload.followUps ?? []).slice(0, 2) };
        } catch (cause) {
          setError(cause instanceof Error ? `${cause.message} Showing local evidence results.` : 'AI summary unavailable. Showing local evidence results.');
        }
      }
      setMessages((items) => [...items, { id: Date.now() + 1, role: 'assistant', text: '', reply }]);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'The local evidence index could not be loaded.');
    } finally { setBusy(false); }
  };

  const submit = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); void ask(question); };

  return <div className="fl-assistant-root">
    {open && <section id="fl-assistant-panel" className="fl-assistant-panel" aria-label="FlameLens AI assistant">
      <header className="fl-assistant-header">
        <div className="fl-assistant-mark" aria-hidden="true"><span>AI</span><i /></div>
        <div className="fl-assistant-heading"><span>FLAMELENS / FIELD GUIDE</span><h2>Ask about this page</h2></div>
        <button type="button" className="fl-assistant-close" onClick={() => setOpen(false)} aria-label="Close assistant">×</button>
      </header>
      <div className="fl-assistant-status"><i />{provider === 'ready' ? session?.access_token ? 'LOCAL EVIDENCE · OPTIONAL AI SUMMARIES' : isGuest ? 'LOCAL EVIDENCE · GUEST SESSION' : 'LOCAL EVIDENCE · SIGN IN FOR AI SUMMARIES' : 'LOCAL SOURCE SEARCH · PAGE HELP'}</div>
      <div className="fl-assistant-context" aria-live="polite"><span>PAGE CONTEXT</span><b>{guide.title}</b></div>
      <div className="fl-assistant-thread" role="log" aria-live="polite" aria-relevant="additions text">
        {!messages.length ? <div className="fl-assistant-welcome"><span>YOU’RE ON / {guide.title.toUpperCase()}</span><p>{guide.summary}</p><button type="button" onClick={() => void ask(guide.prompt)}>{guide.prompt}<b aria-hidden="true">↗</b></button></div> : messages.map((message) => <article className={`fl-assistant-message is-${message.role}`} key={message.id}>
          {message.role === 'user' ? <p>{message.text}</p> : <div className="fl-assistant-answer">
            <span>{message.reply?.heading ?? 'FlameLens Guide'}</span><p>{message.reply?.summary ?? message.text}</p>
            {message.reply?.claims.map((claim, claimIndex) => <div className="fl-assistant-claim" key={`${message.id}-${claim.sourceId}-${claimIndex}`}><p>{claim.text}</p>{claim.url ? <a href={claim.url} target="_blank" rel="noreferrer">{claim.sourceId} · {claim.locator} ↗</a> : <small>{claim.sourceId} · {claim.locator}</small>}</div>)}
            {message.reply?.note && <small className="fl-assistant-note">{message.reply.note}</small>}
            {message.reply?.suggestions?.map((suggestion) => <button type="button" className="fl-assistant-followup" key={`${message.id}-${suggestion}`} onClick={() => void ask(suggestion)} disabled={busy}>{suggestion}<b aria-hidden="true">→</b></button>)}
            {message.reply && message.reply.claims.length === 0 && <Link className="fl-assistant-copilot-link" to="/copilot">Open full Research Copilot ↗</Link>}
          </div>}
        </article>)}
        {busy && <div className="fl-assistant-working" role="status"><i />Searching the source index…</div>}
        {error && <p className="fl-assistant-error" role="status">{error}</p>}
        <div ref={endRef} />
      </div>
      <form className="fl-assistant-composer" onSubmit={submit}>
        {provider === 'ready' && session?.access_token && <label className="fl-assistant-consent"><input type="checkbox" checked={providerConsent} onChange={(event) => setProviderConsent(event.target.checked)} /><span>Use AI summary for this question. It sends the question and page title to the configured provider with retrieved public excerpts.</span></label>}
        <label className="fl-assistant-input-label" htmlFor="fl-assistant-input">YOUR QUESTION</label>
        <div className="fl-assistant-input-row"><textarea ref={inputRef} id="fl-assistant-input" value={question} onChange={(event) => setQuestion(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); void ask(question); } }} maxLength={1000} rows={2} placeholder="Ask about this page or the research…" disabled={busy} /><button type="submit" aria-label="Send question" disabled={busy || !question.trim()}>↑</button></div>
        <p>Source search stays on this site. Answers cite indexed passages when available.</p>
      </form>
    </section>}
    <button type="button" className={`fl-assistant-launcher${open ? ' is-open' : ''}`} onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-controls={open ? 'fl-assistant-panel' : undefined} aria-label={open ? 'Close FlameLens AI assistant' : 'Open FlameLens AI assistant'}>
      <span className="fl-assistant-orbit" aria-hidden="true"><i /><b>AI</b></span><span>{open ? 'Close guide' : 'Ask AI guide'}</span><i className="fl-assistant-launch-dot" aria-hidden="true" />
    </button>
  </div>;
}
