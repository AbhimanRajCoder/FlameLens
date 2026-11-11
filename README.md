<div align="center">
  <img src="public/readme/flamelens-banner.svg" alt="Animated FlameLens orbital observatory banner with a glowing flame and orbiting satellite" width="100%" />

  <br />

  <h1>FlameLens</h1>
  <p><strong>Explore the science of fire beyond Earth.</strong></p>
  <p>An interactive research workspace for navigating NASA combustion investigations, comparing experimental evidence, and learning how fire behaves in spaceflight environments.</p>

  <p>
    <a href="https://github.com/amimishra990-cpu/FlameLens"><img src="https://img.shields.io/badge/Project-FlameLens-102033?style=for-the-badge&logo=github&logoColor=white" alt="FlameLens on GitHub" /></a>
    <img src="https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=111827" alt="React 18" />
    <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript 5" />
    <img src="https://img.shields.io/badge/Vite-6-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite 6" />
  </p>

  <p><a href="#explore-the-workspace">Explore the workspace</a> · <a href="#get-started">Get started</a> · <a href="#research-data">Research data</a></p>
</div>

---

## About FlameLens

Fire behaves differently when gravity, airflow, fuel, pressure, and experimental hardware change. FlameLens brings these factors into view through an interactive interface built around public spaceflight combustion research. It helps students, researchers, and curious readers move from a question to the relevant investigation, inspect what its records contain, and compare evidence in context.

The workspace brings together NASA Physical Sciences Informatics (PSI) investigations on flame extinction, solid-fuel flame spread, soot and smoke-point behavior, and smoke or aerosol detection. Searchable records, source-linked analysis, visual experiments, and short learning scenarios make the research easier to explore without losing the connection to the original evidence.

FlameLens is an independent research and learning project. It is not a NASA product, and NASA’s inclusion as a source does not imply NASA endorsement.

## Explore the workspace

| Workspace | What you can do |
| --- | --- |
| **Investigation Explorer** | Search and filter the research catalogue by topic, source availability, data type, and research intent. Open an investigation to inspect its objectives, experimental context, local file coverage, source links, and evidence gaps. |
| **Comparison Lab** | Select investigations and compare their experimental conditions side by side. Explore shared numeric fields with unit-aware views, inspect row-level values, and see where measurements are comparable or where their methods and definitions differ. |
| **Model Lab** | Explore interactive, research-specific virtual experiments for flame extinction, flame spread, and soot or smoke-point questions. Adjust conditions, run batches, inspect the source records and analysis method, and export a track-specific audit report. |
| **Research Copilot** | Ask questions about the indexed investigations and project methods. Follow answers back to retrieved source passages, inspect their locators, and explore related evidence. |
| **Mission Deck** | Work through three short, fictional research scenarios with Mica, the animated field guide. Each challenge focuses on interpreting a source label, experimental regime, or measurement target. |
| **Overview** | Get a guided introduction to the research areas, evidence tools, and ways to continue exploring. |

### A typical research journey

1. **Start with a question.** Search the Explorer for an investigation, material, measurement, or research theme.
2. **Read the source context.** Check the experiment objective, conditions, fields, and available source files before interpreting a value.
3. **Compare carefully.** Use the Comparison Lab to inspect shared fields and see how units, methods, and source definitions affect a comparison.
4. **Explore a research track.** Use the Model Lab’s virtual experiments to examine how selected conditions relate to the analysis in that workspace.
5. **Follow the evidence.** Ask the Research Copilot a question or try the Mission Deck’s scenarios, then open the linked source passages and records.

## Research data

FlameLens organizes bundled NASA PSI tables by research area so that related topics remain discoverable while distinct investigations remain identifiable. The project includes source records associated with FLEX and CFI-G flame extinction research; BASS-II and SAFFIRE solid-fuel research; SPICE soot and smoke-point research; and SAME smoke or aerosol detection.

The interface is designed to keep useful context close to the data. Source field names and units remain visible, local file availability is identified, and missing or unresolved values are not silently treated as measurements. Comparison and analysis views describe which fields they use and show the relevant source and method information alongside their results. Source records link back to NASA PSI where available.

For the detailed source inventory and file map, see [`data/README_DATA_MAP.md`](data/README_DATA_MAP.md). Method notes and track-specific data documentation are available in the [`data/`](data/) directory.

## Get started

### Requirements

- Node.js
- npm

### Install and run

```bash
git clone https://github.com/amimishra990-cpu/FlameLens.git
cd FlameLens
npm install
npm run dev
```

Vite prints the local development URL in the terminal. To create and serve a production build:

```bash
npm run build
npm run preview
```

### Optional service configuration

Copy `.env.example` to `.env.local` to configure optional services for local development. Supabase URL and publishable key values enable email authentication. The Research Copilot can use a server-side language-model API key when configured. Keep private keys in server-side environment variables; never expose them through a `VITE_` variable or commit them to the repository.

## Built with

- **React and TypeScript** for the application interface and typed research workflows
- **Vite** for local development and production builds
- **Three.js** for interactive 3D scenes and the animated Mission Deck guide
- **Supabase Auth** for optional account and session support
- **NASA PSI source tables and project research notes** for the evidence catalogue and analysis context

## Project structure

```text
src/
  components/   Shared interface, 3D, and navigation components
  data/         Investigation catalogue, comparison logic, and research workflows
  pages/        Overview, Explorer, Comparison, Model Lab, Copilot, and Mission Deck
  scenes/       Landing-page sections and visual scenes
  styles/       Page styles, layout, and design tokens
data/
  source_data/  NASA source tables organized by research area
  research/     Research notes and references
  processed/    Derived project data and supporting material
public/
  images/       Visual assets used in the application
  models/       3D assets
  readme/       Animated README banner
```

---

<div align="center">
  <sub>FlameLens · Combustion research, in context · Built for curious minds looking beyond Earth</sub>
</div>
