# Design

## Visual direction: a scientific mission-control observatory

The interface should feel like a polished aerospace research instrument: calm, precise, cinematic and information-dense where needed. It should **not** look like a generic AI template, a crypto dashboard or a neon-purple “vibe-coded” landing page.

## 1. Art direction

- **Core palette:** near-black/navy space background, cool graphite panels, restrained ice-blue/cyan for active data, warm amber for caution, controlled red for fire/suppression context and neutral white for text.
- **Avoid:** full-page purple gradients, glowing borders on every card, random floating orbs, excessive glassmorphism, oversized pill buttons, fake terminal text and decorative charts with no data meaning.
- **Atmosphere:** subtle starfield, faint orbital lines, instrument-grid texture and occasional orbital parallax. Keep the data surface legible first.
- **Typography:** one distinctive editorial display face for large headlines and a highly readable sans-serif for controls, tables and long research text. Use monospaced numerals only for measurement values, PSI identifiers and telemetry-like labels.
- **Layout:** strong 12-column grid, deliberate whitespace, tight alignment, restrained radii and consistent spacing. Large editorial hero sections; compact, precise data tables in the research app.

## 2. Color and interaction tokens

Suggested starting tokens (final colors must pass contrast checks):

| Token | Suggested value | Use |
|---|---|---|
| Space 950 | `#070B14` | Main background |
| Space 900 | `#0B1220` | Secondary background |
| Panel 800 | `#111C2D` | Panels / navigation |
| Panel 700 | `#172438` | Hover / active surfaces |
| Text 100 | `#F3F6FA` | Primary text |
| Text 400 | `#A9B5C5` | Secondary text |
| Ice 400 | `#66D9F2` | Active navigation / data links |
| Amber 400 | `#F3B65A` | Caution / incomplete evidence |
| Ember 500 | `#E66A52` | Fire / suppression visual cue |
| Safe 400 | `#76C7A3` | Validated / complete state |

Color must never be the only way to communicate status. Pair every status with a label and icon.

## 3. Landing-page story: scroll is a guided lesson

Make the landing page an intentional narrative, not a stack of generic feature cards. Use scroll-triggered animation and scene transitions, but keep content visible and usable without motion.

### Scene 01 — “Fire behaves differently when gravity disappears”

- Full-viewport hero with a carefully lit Earth limb / orbital station scene and one slow-moving 3D ISS silhouette.
- Headline: **Understand fire before it becomes a spacecraft emergency.**
- Supporting text: NASA's microgravity combustion research, organized into evidence for prevention, detection and suppression.
- Primary action: `Explore investigations`; secondary action: `See how it works`.
- Minimal navigation and a scroll cue. Do not put a fake “AI confidence” statistic in the hero.

### Scene 02 — “The flame changes shape”

- Split-screen educational visualization: familiar buoyant flame versus diffusion-dominated low-gravity flame.
- On scroll, animate the plume from an upward-bent teardrop to a rounded/spherical flame representation.
- Labels explain buoyancy, diffusion, forced flow and radiation. Mark the illustration as conceptual, not a measurement or CFD result.
- Interaction: toggle gravity regime and inspect the explanatory labels.

### Scene 03 — “Three layers of fire safety”

- Three editorial zones: **Prevent**, **Detect**, **Suppress**.
- As the user scrolls, an orbital line connects each layer to relevant NASA investigation families.
- Prevention examples: BASS/BASS-II, SAFFIRE, ACME BRE.
- Detection examples: SAME/SAME-R, DAFT/DAFT-2 and relevant smoke/aerosol investigations.
- Suppression examples: FLEX/FLEX-2, CFI/CFI-G and relevant suppressant work.
- Keep relationships nuanced: a sensor-qualification test is not a flame-growth experiment; a gaseous-flame experiment is not automatically a solid-material flammability test.

### Scene 04 — “The evidence is larger than one mission”

- Interactive mission timeline / constellation. Selecting an investigation opens its detail preview.
- Show experiment platform, apparatus, fuel/material family and measurement types.
- The timeline must use real metadata. Unknown dates stay unknown; do not infer dates from an ID.

### Scene 05 — “Find the closest evidence”

- Demonstrate investigation ranking by a selected use case, with transparent dimensions and visible rationale.
- Example use case: “Which experiments inform smoke detection in a crew cabin?”
- Show a ranked list, not a made-up numerical risk result.

### Scene 06 — “Compare conditions, not just titles”

- Side-by-side experiment comparison with oxygen, pressure, flow, material/fuel, geometry, sensors, gravity and hardware.
- Missing values display as `Not reported in this source`, not `0`.
- Add a clear note when values are not comparable across investigations.

### Scene 07 — “Ask the evidence”

- Show the SI copilot retrieving NASA source passages and experiment records.
- Display source chips, page/file identifiers and a “what is not known” panel.
- Avoid an empty chat box as the only product demo; lead with example research questions and evidence cards.

### Scene 08 — “A safer path to the Moon and Mars”

- Switch between spacecraft, lunar habitat/pressurized rover and Mars transit scenarios.
- Show which conditions are supported by existing PSI evidence and where the gravity/atmosphere mismatch remains.
- Explicitly show “No direct partial-gravity combustion dataset in the current PSI scope described by the challenge brief.”
- CTA: `Open the research dashboard`.

## 4. Dashboard shell

- Persistent top bar with FlameLens mark, global search, current environment selector, data freshness/source status and profile/help actions.
- Left navigation: Overview, Rankings, Investigations, Compare, Fire-Safety Atlas, SI Copilot, Data & Models.
- Main workspace uses one strong focal area, not many equally loud cards.
- A contextual right rail can show “Why this result?”, source citations, similar experiments and data gaps.
- Use progressive disclosure for long metadata. A researcher should be able to inspect every raw field, but the default view should not show 40 columns at once.

## 5. 3D asset plan

Use 3D assets to teach a concept or establish context. Do not place 3D objects in every section.

### Curated assets / sources

See `../assets/models/ASSET_MANIFEST.csv` and `../assets/models/download-links/` for source pages and download shortcuts. Candidate assets include:

- NASA ISS model — orbital habitat / hero context.
- NASA astronaut model — human scale and crew context.
- NASA Apollo Lunar Module — historical lunar-surface context only.
- NASA Gateway Core — future lunar-orbit infrastructure context; heavy asset.
- NASA Perseverance rover — Mars exploration context, not a pressurized crew rover.
- NASA Z2 or Mark III spacesuit — spacesuit pressure/oxygen explainer.
- Poly Haven fire extinguisher model — suppression-equipment visual; source page states CC0.
- NASA ISS FBX package — authoring/editing source; convert offline before browser delivery.

### Use policy

1. Download from the linked official/source page and retain its attribution/license note.
2. Do not hotlink third-party binary assets at runtime.
3. Optimize to GLB, compress geometry/textures, create LODs and inspect scale/materials before use.
4. Load on intersection or user action; do not load all models at initial page render.
5. Prefer GLB/glTF in the browser. FBX is an authoring interchange format; convert it offline unless there is a clear reason not to.
6. Provide a poster/fallback image and an accessible textual description.
7. Avoid showing a Mars rover as if it were the actual pressurized lunar rover design.

### Educational visuals that should be custom-built

- Gravity-regime flame comparison: a lightweight shader/particle scene, labelled as conceptual.
- Smoke/aerosol particle transport: controllable particle field with sensor sampling points.
- Oxygen/pressure scenario dial: data-driven instrument component using scenario assumptions.
- Suppressant dilution visualization: conceptual concentration field; not a real CFD or validated extinction simulation.

## 6. Motion system

- Use scroll progress for chapter transitions and small parallax depth, not for every paragraph.
- Use IntersectionObserver-style reveal only for meaningful section entry.
- Prefer 500–900 ms for major scene transitions; 150–250 ms for interface feedback.
- Keep the page usable at normal scrolling speed; never pin the page for too long.
- Add a persistent “Skip story / Open dashboard” route.
- Respect `prefers-reduced-motion`; replace animated scenes with static diagrams and remove parallax.
- Avoid flashing, rapid particles, fake loading animations and forced cursor effects.

## 7. Data visualization language

- Prefer axis-labelled plots with units and exact dataset/experiment IDs.
- Use a fixed color mapping for prevention, detection, suppression and contextual research.
- Compare distributions only when variables share definitions and units.
- Mark source coverage, missing data and unsupported extrapolation visibly.
- For all charts provide a table/download alternative and a descriptive caption.

## 8. Performance and accessibility

- First meaningful content must not wait for 3D assets.
- Use responsive images, model LOD, texture compression and route-level lazy loading.
- Keep a mobile static fallback for complex scenes and a low-bandwidth mode.
- Keyboard-operable navigation, visible focus, semantic headings, labelled controls and screen-reader descriptions are mandatory.
- WCAG AA contrast target; never encode outcomes by color alone.
- Avoid audio autoplay. All animation must be nonessential to understanding the science.

## 9. “Not vibe-coded” acceptance test

The design is not ready if it relies on visual effects to disguise shallow content. It must pass these checks:

- Every chart, ranking and stat is backed by a source or explicitly marked as illustrative.
- The landing-page animation teaches a scientific or product concept.
- Typography, spacing, grid and table behavior are consistent across pages.
- Every interactive element has a real state change or navigation action.
- Empty, loading, error, unsupported and low-coverage states are designed.
- No card says “AI-powered insight” without showing the evidence behind it.
- The dashboard remains useful with all animations and all 3D models disabled.
