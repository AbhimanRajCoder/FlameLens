# FlameLens — Project Audit & Implementation Baseline

Audit date: 2026-11-10. Scope: entire workspace `C:\Users\Acer\Desktop\FlameLens`.
This deliverable answers Prompt 01 (`repository_audit.md`). It was finalized alongside the
Prompt 02 landing-page milestone, so it records the repository **as it now stands**, not as
it stood before any code existed.

> Note: `quoder_prompts/00_MASTER_PROJECT_CONTEXT.md` and
> `quoder_prompts/PROMPT_ORDER_AND_WORKFLOW.md` are **not present** in this workspace.
> The governing rules were read from `QUODER_BOOTSTRAP_PROMPT.md`, `START_HERE.txt`,
> `README.md`, `documents/{Architecture,Design,Phases,PRD,Rules}.md`,
> `data/README_DATA_MAP.md`, `data/model_readmes/`, `data/audit/`,
> `data/additional_official_sources/`, `MODEL_ARTIFACT_STATUS.txt` and
> `assets/models/{ASSET_MANIFEST.csv,DOWNLOAD_STATUS.txt}`. The checklist below is
> reconstructed from the delivered prompt sheets (01, 02) and `documents/Phases.md`.

## 1. Current stack and versions

| Layer | Choice | Version | Notes |
|---|---|---|---|
| Frontend framework | React + TypeScript | 18.3.1 / ~5.6.3 | No pre-existing frontend; single coherent stack per audit rules |
| Build tool | Vite | ^6.0.5 (resolved 6.4.6) | `@vitejs/plugin-react` 4.x |
| Routing | react-router-dom | ^6.30.0 | BrowserRouter, v7 future flags enabled |
| 3D | three.js | ^0.170.0 | Dynamically imported only when a viewer nears the viewport; manual chunk |
| Tests | vitest | ^2.1.8 (resolved 2.1.9) | Data-integrity suite, 17 tests |
| Browser verification | puppeteer-core (dev) | latest | Drives locally installed Chrome; no browser download |
| Python service | `pyproject.toml` present | metadata only | **Python is not installed on this machine.** File preserved untouched for the future FastAPI data/ML layer; no scientific processing was moved into the browser |
| Runtime | Node v20.18.0, npm 10.8.2 | | Windows, Git Bash |

No second frontend framework was introduced. No Next.js.

## 2. Routes and pages

| Route | Page | State |
|---|---|---|
| `/` | `src/pages/Landing.tsx` — nine-scene guided scroll story | Complete, browser-verified |
| `/sign-in` | `src/pages/AuthShell.tsx` | Branded honest shell: "Authentication is being configured"; collects no credentials |
| `/sign-up` | same shell, sign-up copy | Same honest state |
| `*` | redirect to `/` | No dead routes |

Landing anchors: `#top`, `#playground`, `#pillars`, `#investigations`, `#relevance`,
`#compare`, `#model-lab`, `#about`, `#get-started`. All resolve; sticky header indicates the
active chapter; scroll-progress bar; mobile menu.

## 3. Design system and reusable components

- Tokens (`src/styles/tokens.css`): Design.md palette — space-950 `#070B14`, panel `#111C2D`,
  ice `#66D9F2`, amber `#F3B65A`, ember `#E66A52`, safe `#76C7A3`; function mapping
  prevent/detect/suppress. Local OFL fonts: Fraunces (display), Inter (body), IBM Plex Mono
  (PSI IDs / numerals) in `public/fonts/` with `LICENSES.txt`.
- Components: `Header`, `Footer`, `Reveal` (scroll chapter reveal), `SourceChip`
  (status + function tags), `OrbitalMark`, `Starfield`, `ModelViewer` (lazy GLB with poster
  fallback), `Posters` (SVG fallbacks).
- Honesty primitives: `.not-reported` ("Not reported in indexed source"), `.callout`
  (comparability / evidence-gap warnings), status chips local / registered / external / monitor.
- Reduced motion: `useReducedMotion` disables parallax, auto-rotate and CSS animation.
- Themed scrollbars; no horizontal overflow at 1440 / 820 / 390 px (verified).

## 4. Backend, database, auth integrations

**None configured.** No Supabase/Firebase/Auth.js project exists in the workspace; no
server routes, no database, no API keys. The auth routes are explicitly non-functional
shells. Recommendation for Prompt 03: **Supabase Auth** (single provider, free tier,
RLS-ready) — browser uses only the anon key via env vars; any service-role key stays
server-side. No accounts or paid infrastructure were created.

## 5. Dataset and 3D asset availability

- Eight raw NASA CSVs present and immutable under `data/source_data/` (four segregated
  tracks). Audit CSVs in `data/audit/`; per-model readiness rules in `data/model_readmes/`.
- Nine additional-source notes in `data/additional_official_sources/` — notes only; the
  DAFT/DAFT-2, PSI-10, PSI-117, LUCI, FM² etc. data files are **not bundled** and are marked
  as such in the UI. LUCI = external publication evidence; FM² = monitor-only.
- **No trained ML weights** (`MODEL_ARTIFACT_STATUS.txt`); the landing page claims none.
- 3D: two verified GLBs downloaded from the user-listed official NASA URLs and served
  locally (see `public/models/attribution.json` for source URLs, byte counts, SHA-256):
  - `public/models/iss-b.glb` — ISS (B) compact, 476,992 B (hero).
  - `public/models/apollo-lunar-module.glb` — 716,840 B (lunar mission tab, lazy).
  - Both are Draco-compressed; decoder copied locally to `public/draco/` (no CDN).
  - Not downloaded (honest manifest): ISS (D) IGOAL ~91 MB, Gateway 63 MB, Z2 16 MB,
    Perseverance, Astronaut, Mark III, fire extinguisher — too heavy or unneeded this milestone.
  - Known asset quirk: the ISS (B) GLB contains a stray truss cluster ~25 units above the
    station; the viewer frames the dominant connected structure and culls detached geometry
    far outside it. The GLB file itself is unmodified (documented in attribution.json).
- Three reference PDFs in `data/reference*` could not be text-extracted in this environment
  (no PDF renderer); extract field semantics from them before Phase 1 ingestion.

## 6. Environment variables

**None configured; none required for the landing page.** No `.env` files exist. Names only,
reserved for the next stages (never commit values):

- `VITE_SUPABASE_URL` — browser-safe project URL (Prompt 03)
- `VITE_SUPABASE_ANON_KEY` — browser-safe anon key (Prompt 03)
- `SUPABASE_SERVICE_ROLE_KEY` — server-side only, never in the browser bundle
- `DATABASE_URL` — future FastAPI/ingestion layer
- `LLM_API_KEY` — future server-side SI copilot only; never in the landing page

## 7. Recommended minimal architecture (reuses what exists)

1. Keep React+TS+Vite SPA for the public experience; add routes per prompt (auth → explorer
   → compare → model lab → copilot → playground).
2. Keep `pyproject.toml` FastAPI layer for ingestion/ML when Python is available; the browser
   never trains models or holds privileged keys.
3. Supabase Auth + Postgres (RLS) as the single backend provider; anon key in browser,
   service role server-side only.
4. Data flow stays pack-governed: raw CSVs immutable → audited ingestion → typed API →
   UI states that render missing as "Not reported", never zero.

## 8. Prompt-by-prompt execution checklist

- [x] **01_REPOSITORY_AUDIT** — this document; stack preserved/selected; no fake auth; no dummy records.
- [x] **02_LANDING_PAGE** — nine scenes, sticky nav, honest auth shells, two verified local GLBs
      with attribution + checksums, lazy loading + SVG fallbacks, reduced-motion support.
      Verified in Chrome at 1440×900, 820×1180, 390×844: 38/38 automated checks, zero console
      errors, zero failed requests; screenshots in `screenshots/`.
- [ ] **03_AUTH** — Supabase Auth; replace shells with real sign-in/up; env names above; no
      service-role key in browser. (Next prompt to paste.)
- [ ] **04+** — per `documents/Phases.md`: Phase 1 ingestion/audit → Phase 2 investigation
      intelligence/ranking → Phase 3 Comparison Lab/Atlas → Phase 4 evidence-grounded SI
      copilot → Phase 5 model pilots (only after target/leakage audits) → Phase 6 visual
      refinement → Phase 7 release hardening.

## 9. Run commands

```bash
npm install        # already done
npm run dev        # http://localhost:5173
npm run build      # tsc -b && vite build
npm test           # vitest data-integrity suite (17 tests)
node scripts/verify-landing.mjs   # browser acceptance suite (needs dev server + Chrome)
```

**Next prompt to paste:** `03_AUTH` (authentication). Prompt `02_LANDING_PAGE.md` is complete
and browser-checked; do not rebuild it.