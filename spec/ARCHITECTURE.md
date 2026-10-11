## Think

**Design stance.** The app is a static, client-only single-page React app. It has no backend, database or HTTP API, and it makes no runtime network requests. Where this file says "tables", it means static data modules. Where it says "API", it means the exports those modules provide and the props components accept. Every visible claim reaches the screen through one typed path: data module, then `Claim` object, then `<ClaimText>`. Source naming and labelling are therefore structural and cannot be skipped.

**Layers and what each owns**

| Layer | Path | Owns |
|---|---|---|
| Data | `src/data/` | All content: sources, claims, nodes, edges, patterns, use cases. No JSX. |
| Logic | `src/hooks/` | Routing state and the animation clock. No content. |
| Shared UI | `src/components/` | Generic SVG flow rendering, claim rendering, controls. No page-specific content. |
| Pages | `src/pages/` | Page composition. Reads only its own page's data folder plus the shared registries. |
| Style | `src/styles/` | All visual styling and motion that is not dot movement. |

**Cap check.** Every feature in OVERVIEW.md fits the 80-line-per-file cap through the splits listed below. No escalation is needed for the cap.

**Inherited escalation.** OVERVIEW.md records that the build budget cap is missing. This file does not set a budget.

## Plan

### Routes (owner: `src/hooks/useHashRoute.js`, consumed by `src/App.jsx`)

Routing is hash-based and needs no router library.

| Route | Screen | Notes |
|---|---|---|
| `#/anatomy` | AnatomyPage | Default. Unknown hashes redirect here. |
| `#/patterns/:patternId` | PatternsPage | `patternId` ∈ `drift`, `multihop`, `update`, `critique`. Defaults to `drift`. |
| `#/when-to-use` | WhenToUsePage | — |

### Shared registries (data layer)

**`src/data/sources.js` exports `SOURCES`.** It is keyed by `sourceId` and lists every source cited in the approved brief. Each entry has this shape:

`{ id, name, url, kind }`
- `kind` ∈ `primary-doc` | `paper` | `issue` | `blog` | `vendor`.
- Mintlify mirrors are never included.

**`src/data/labels.js` exports `LABELS`.** It holds the enum `snippet` | `authors-claim` | `unverified`, plus the separate kind `suggestion`. STANDARDS.md owns the display wording.

### Data contracts

**Claim** — the only shape allowed to carry visible factual text.

`{ text, sourceIds: string[], label: LABEL | null }`

Rules:
- `sourceIds` must contain at least one id, and every id must exist in `SOURCES`.
- A claim that cannot be confirmed in a source uses `label: 'unverified'`. It still names the source that raised the question.
- `text` contains no numeric figures: no costs, durations, scores, percentages or round counts. Identifiers inside source names (arXiv ids, issue numbers) are allowed. "top-K" is allowed as a term.

**Suggestion**

`{ text, kind: 'suggestion', basisSourceIds: string[] }`

Rules:
- Used only for Agent Command notes.
- It never names an Agent Command preset.

**Node**

`{ id, title, x, y, receives: Claim[], sends: Claim[], note?: Claim, optional?: boolean }`

Rules:
- `optional: true` renders a dashed node. It is used for the community-summary stage, with a LazyGraphRAG snippet note.
- Coordinates are expressed in a fixed SVG viewBox units system.

**Edge**

`{ id, from, to, kind, label?: Claim }`

- `kind` ∈ `flow` | `feedback` | `query`.
- Geometry is derived from node coordinates by `FlowEdge`. Edges marked `feedback` render as a curved return path.

**FlowSpec** — one per animated diagram.

`{ id, viewBox, nodes: Node[], edges: Edge[], dotsPerEdge, cycleMs }`

**Pattern** — Page 2.

`{ id, title, badge?: Claim, deemphasised: boolean, graphSource: Claim, flows: Claim[], trigger: Claim, resourceCap: Claim, sufficiencyStop: Claim, panels?: PatternPanel[], overlapNote?: Claim, flow: FlowSpec }`

Rules:
- `resourceCap` and `sufficiencyStop` are separate required fields.
- If no stop is sourced, `sufficiencyStop` is an `unverified` claim.
- `critique` has `deemphasised: true` and the badge "snippet-level, unverified".

**PatternPanel**

`{ heading, claims: Claim[] }`

- `multihop` has exactly two panels: the ToG mechanism, and the 2509.25530 findings.
- The two panels never share a claim object.

**UseCase** — Page 3.

`{ patternId, bestFit: Claim[], weakSpots: Claim[], generalFindings?: Claim[], suggestion: Suggestion }`

Rules:
- An empty `weakSpots` array renders as "Empty — unverified".
- Weak spots are never back-filled from general RAG-vs-GraphRAG findings.
- `generalFindings` holds the general Text2Cypher findings, each under its own source.
- `patternId` also allows `global`, the single-pass contrast case.

### Data modules per page (one data folder per page; no cross-page imports)

**Page 1 — `src/data/anatomy/`**
- `stages.js` — the six Dataflow stages plus a retrieval node. Includes a local-search node whose inputs are marked unverified.
- `edges.js` — pipeline edges and the re-index feedback edge. The feedback edge carries the label "as described by maintainers in #741; current CLI behaviour unverified" and a claim that deletions and revisions are unconfirmed.
- `queryPath.js` — the global map-reduce path, labelled "not a loop". `max_data_tokens` is described as a context cap.
- `index.js` — assembles and exports `ANATOMY_FLOW: FlowSpec`.

**Page 2 — `src/data/patterns/`**
- `drift.js`, `multihop.js`, `update.js` and `critique.js` each export one `Pattern`.
- `update.js` holds both the LightRAG and GraphRAG variants, plus `overlapNote`.
- `index.js` exports `PATTERNS` in display order.

**Page 3 — `src/data/whenToUse/`**
- `framing.js` — the 2502.11371 claim and the ICLR 2026 snippet claim.
- `gate.js` — the query-type routing gate, with suggestion kind.
- `useCases.js` — `UseCase[]` for `drift`, `multihop-tog`, `multihop-findings`, `update`, `critique`, `global`. This keeps the ToG and 2509.25530 weak spots apart.

### Component contracts

| Component | Props | Notes |
|---|---|---|
| `App` | — | Reads the route and renders `NavBar` plus one page. |
| `NavBar` | `route` | Three hash links. |
| `FlowDiagram` | `spec: FlowSpec, playing, selectedId, onSelect` | Renders SVG nodes, edges and dots. Generic. |
| `FlowNode` | `node, selected, onSelect` | Keyboard-focusable `<g role="button">`. Enter or Space selects. |
| `FlowEdge` | `edge, from, to, pathRef` | Draws the path and exposes its ref for dots. |
| `AnimatedDot` | `pathRef, progress` | Positions via `getPointAtLength`. |
| `PlayPause` | `playing, onToggle` | Uses `aria-pressed`. |
| `StagePanel` | `node` | Shows the `receives` and `sends` claims. |
| `ClaimText` | `claim` | Renders text, source names from `SOURCES`, and `LabelBadge`. Displays source URLs as plain text, never as fetched resources. |
| `LabelBadge` | `label` | Takes its wording from STANDARDS.md. |
| `PatternSwitcher` | `patterns, activeId` | Tabs that set `#/patterns/:id`. |
| `PatternDetails` | `pattern` | Shows graph source, flows, trigger, cap, stop, panels and overlap note. |
| `QueryGate` | `gate` | Page 3 gate diagram, static SVG. |
| `UseCaseCard` | `useCase` | Shows best fit, weak spots (with an empty state) and the suggestion. |

### Animation contract (owner: `src/hooks/useAnimationClock.js`)

- **Signature:** `useAnimationClock(playing, cycleMs) → progress ∈ [0,1)`.
- **Mechanism:** driven by `requestAnimationFrame` and cancelled on unmount or pause. Progress is kept on pause, so play resumes where it stopped.
- **Dot spacing:** each dot's progress is `(clock + i/dotsPerEdge) % 1`.
- **Reduced motion:** when `prefers-reduced-motion` is set, the hook starts paused.
- **Libraries:** none. CSS handles hover and selection transitions only.

### Security posture

- **Network:** no `fetch`, XHR, WebSocket, CDN script, web font or remote image. All assets are bundled.
- **Content Security Policy:** `index.html` carries a meta CSP: `default-src 'self'; connect-src 'none'; img-src 'self' data:; object-src 'none'`.
- **Content safety:** `dangerouslySetInnerHTML` is never used. All text renders as React text nodes.
- **No inputs and no storage:** there are no user inputs beyond navigation and clicks, and no storage. No `localStorage`, cookies or telemetry.
- **Untrusted text:** source URLs are static strings from the approved brief and are treated as untrusted display text.

### Infrastructure

- **Hosting:** a static bundle with no server, database, environment variables or secrets.
- **Dependencies:** `react` and `react-dom`, plus one dev bundler (`vite` with `@vitejs/plugin-react`). No other dependency is permitted, and specifically no animation, chart or router library.
- **Plan boundary:** this plan defines files only. It plans no install, build, run, test or deploy step.

## Execute

Every file is at most 80 lines. If a data file nears the cap, it is split within its own page folder, and the split is noted in its `index.js`.

1. **Project shell**
   - `package.json` (code)
   - `vite.config.js` (code)
   - `index.html` (code; includes the CSP)
   - `README.md` (doc; scope, label meanings, no-numbers rule)
2. **Shared registries**
   - `src/data/sources.js` (code)
   - `src/data/labels.js` (code)
3. **Page 1 data**
   - `src/data/anatomy/stages.js` (code)
   - `src/data/anatomy/edges.js` (code)
   - `src/data/anatomy/queryPath.js` (code)
   - `src/data/anatomy/index.js` (code)
4. **Page 2 data**
   - `src/data/patterns/drift.js` (code)
   - `src/data/patterns/multihop.js` (code)
   - `src/data/patterns/update.js` (code)
   - `src/data/patterns/critique.js` (code)
   - `src/data/patterns/index.js` (code)
5. **Page 3 data**
   - `src/data/whenToUse/framing.js` (code)
   - `src/data/whenToUse/gate.js` (code)
   - `src/data/whenToUse/useCases.js` (code)
6. **Hooks**
   - `src/hooks/useHashRoute.js` (code)
   - `src/hooks/useAnimationClock.js` (code)
7. **Shared components**
   - `src/components/FlowDiagram.jsx` (code)
   - `src/components/FlowNode.jsx` (code)
   - `src/components/FlowEdge.jsx` (code)
   - `src/components/AnimatedDot.jsx` (code)
   - `src/components/PlayPause.jsx` (code)
   - `src/components/ClaimText.jsx` (code)
   - `src/components/LabelBadge.jsx` (code)
   - `src/components/StagePanel.jsx` (code)
   - `src/components/NavBar.jsx` (code)
8. **Pages**
   - `src/pages/AnatomyPage.jsx` (code)
   - `src/pages/PatternsPage.jsx` (code)
   - `src/pages/PatternSwitcher.jsx` (code)
   - `src/pages/PatternDetails.jsx` (code)
   - `src/pages/WhenToUsePage.jsx` (code)
   - `src/pages/QueryGate.jsx` (code)
   - `src/pages/UseCaseCard.jsx` (code)
9. **Entry and styles**
   - `src/main.jsx` (code)
   - `src/App.jsx` (code)
   - `src/styles/base.css` (code)
   - `src/styles/flow.css` (code)
   - `src/styles/pages.css` (code)