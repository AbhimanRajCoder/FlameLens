# FlameLens

FlameLens is an interactive research platform for exploring fire behavior and combustion research through the lens of spaceflight. It brings NASA investigation data, visual analysis tools, and guided learning experiences together in one workspace.

Explore how gravity, airflow, fuel properties, and experimental conditions shape flame behavior. Follow the evidence from source records into visual comparisons and interactive scenarios, with context that helps make complex research easier to navigate.

## Explore FlameLens

- **Investigation Explorer** — browse research investigations, source records, and experimental context.
- **Comparison Lab** — compare measurements across selected investigations and inspect the underlying records.
- **Model Lab** — explore interactive analysis for flame extinction, flame spread, and smoke-related research.
- **Mission Deck** — work through short, evidence-focused scenarios with the field guide Mica.
- **Research Copilot** — ask questions about the available research and explore relevant sources.
- **Overview** — get a guided introduction to the research areas and workspace.

## Run locally

Requires Node.js and npm.

```bash
git clone https://github.com/amimishra990-cpu/FlameLens.git
cd FlameLens
npm install
npm run dev
```

Vite prints the local address when the development server starts.

To create a production build:

```bash
npm run build
```

## Technology

FlameLens is built with React, TypeScript, and Vite. Three.js powers the interactive 3D experiences, and the research workspace is organized around NASA source data bundled with the project.
