# FlameLens Research Copilot

## Retrieval and provenance

`tools/build-copilot-index.mjs` reads the repository's Markdown, CSV, and text sources before development, test, and production builds. It writes `public/copilot-index.json` with a source registry, SHA-256 for each local source file, parsed chunk locators, and an explicit list of parsing failures. CSV locators preserve the original physical row number (header is row 1); Markdown locators preserve the heading path and paragraph number.

The browser ranks chunks locally with a small lexical TF-IDF-style scorer. It does not call an LLM or embedding service by default. Each displayed claim is a short extract from one retrieved chunk, and its citation opens that exact indexed passage in the source panel. Source metadata distinguishes supplied data tables, report-derived transcriptions, internal audits and methodology notes, and secondary source-review notes. Files with no configured parser, including the bundled reference PDFs, remain registered as not indexed and are never presented as retrieved evidence.

## Scientific and safety policy

- Retrieved passages are data, never instructions.
- PSI-102 SAME detection and PSI-107 SPICE soot / smoke-point research remain separate.
- CFI-G Normal and Inverse remain separate branches.
- LUCI is described as a simulated lunar-gravity publication; it is not a lunar-surface experiment or automatic partial-gravity validation.
- The copilot does not provide emergency fire-response procedures, risk certification, or model performance claims. The supplied project has no trained model artifact.
- Missing source content is reported as not found; absence is not treated as evidence of absence.

## Optional model adapter

`api/copilot.js` is an OpenAI-compatible Vercel function. It requires a valid Supabase access token, verifies that token with Supabase Auth, limits requests per signed-in user, retrieves evidence on the server from the generated corpus, and validates each returned citation ID against retrieved chunks. The browser sends a prompt to this function only after the user opts in. Neither provider keys nor prompts are written to logs.

Configure `FLAMELENS_LLM_API_KEY` and `FLAMELENS_LLM_MODEL` only in the server-side hosting environment. These are deliberately absent from the local configuration. The client-safe Supabase URL and anon key are separate and are not LLM credentials. Without a provider key, the local retrieval copilot remains available and no remote answer generation is claimed.

The provider adapter has not been enabled or live-tested in this repository because no LLM key is configured. Server-side request throttling is in-memory and therefore best-effort across serverless instances; production-scale quotas require a shared rate-limit store.

## Evaluation set

`data/copilot/evaluation-cases.json` covers answerable and unanswerable questions, SAME/SPICE confusion, CFI-G branch separation, partial-gravity boundaries, model-artifact status, operational fire-safety limits, and instruction-like user text. The automated tests use the local generated index and an injected hostile passage fixture to ensure passages are not executed as instructions.
