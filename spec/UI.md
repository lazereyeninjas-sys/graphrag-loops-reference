## Think

**Scope.** This file defines the screens, the user flows, and the contract each screen consumes. Every contract named here comes from ARCHITECTURE.md. Label wording, fixed strings and the validation rules come from STANDARDS.md and are not repeated here. If a screen needs data that no contract provides, it is escalated below rather than guessed.

**UI principles**
1. All factual text renders through `ClaimText`. Literal JSX text is limited to chrome: nav labels, button text, headings, legend entries and empty-state prompts.
2. Motion exists to show data moving between stages. Dot motion comes only from `useAnimationClock`. CSS transitions are used only for hover and selection.
3. Uncertainty is shown, never hidden. Badges, dashed optional nodes and the `EMPTY_WEAK` empty state stay visible at all times.
4. Every interactive element can be reached and operated by keyboard.

**Conflict noted.** OVERVIEW.md says every page is animated, but ARCHITECTURE.md makes `QueryGate` a static SVG. This file follows ARCHITECTURE.md. Page 3's animation comes from selection transitions on its cards (see S3), which S12 permits. If Page 3 should also have flowing dots, the gate needs a `FlowSpec`; this is part of escalation U1.

## Plan

### Screen inventory

| Screen | Route | Component | Contracts consumed |
|---|---|---|---|
| S0 Shell | all | `App`, `NavBar` | `useHashRoute` → `route` |
| S1 Anatomy | `#/anatomy` (default; unknown hashes redirect here) | `AnatomyPage` | `ANATOMY_FLOW: FlowSpec` (Node, Edge, Claim), `SOURCES`, `LABELS`, `NOT_A_LOOP`, `UPDATE_741` |
| S2 Loop patterns | `#/patterns/:patternId` (defaults to `drift`) | `PatternsPage`, `PatternSwitcher`, `PatternDetails` | `PATTERNS: Pattern[]` (FlowSpec, PatternPanel, Claim), `B4_BADGE`, `SOURCES`, `LABELS` |
| S3 When to use | `#/when-to-use` | `WhenToUsePage`, `QueryGate`, `UseCaseCard` | `FRAMING`, `GATE`, `USE_CASES: UseCase[]` (Claim, Suggestion), `EMPTY_WEAK`, `SOURCES`, `LABELS` |

### S0 — Shell
- `NavBar` shows three hash links built from the route enum: "Anatomy", "Loop patterns", "When to use". The active link has `aria-current="page"`.
- Below the nav, `main` renders exactly one page.
- A changed route moves focus to that page's `h1`.
- No link goes outside the app (S8).

### S1 — Anatomy

**Layout.** Two columns: the `FlowDiagram` on the left, the `StagePanel` on the right. Below about 720px wide, the panel stacks under the diagram.

**Header.** The `h1` reads "Anatomy". It is followed by a `PlayPause` and a legend.

**Legend.** Chrome text only:
- solid line: pipeline
- curved line: re-index feedback
- dotted line: query path
- dashed node: optional stage

**Diagram rendering rules**
- `kind: 'flow'` edges are solid. `kind: 'feedback'` edges are a curved return path drawn in an accent colour. `kind: 'query'` edges are dotted.
- Dots take the colour of their edge's kind.
- A node with `optional: true` (the community-summary stage) has a dashed outline. Its `note` claim (LazyGraphRAG, snippet) appears in the panel.
- Edge `label` claims render through `ClaimText` in an SVG `foreignObject`, or in a caption list under the diagram if space runs short. The feedback edge's caption shows the `UPDATE_741` claim and the deletions/revisions `unverified` claim at all times, not only when selected.
- The global map-reduce nodes carry their `NOT_A_LOOP` claim in the panel, plus a small inline "not a loop" tag rendered from that same claim.
- The local-search node's `receives` shows its `unverified` claim.

**Interactions**
- *Play/pause.* `playing` state lives in `AnatomyPage` and passes to `FlowDiagram`. Inside, `FlowDiagram` calls `useAnimationClock(playing, spec.cycleMs)`. Dots on every edge use `(clock + i/dotsPerEdge) % 1`. Pausing freezes the dots in place. Under reduced motion the page starts paused and the button reads "Play".
- *Select stage.* Clicking a node, or pressing Enter/Space on a focused node, sets `selectedId`.
  - The selected node gets a highlight ring.
  - Its incoming and outgoing edges get extra stroke weight, via a selection transition.
  - `StagePanel` shows the node title, a "Receives" list and a "Sends" list (each a `Claim[]`), and the `note` if present.
  - Clicking the same node again, or pressing Esc, clears the selection.
- *Empty panel.* Shows the chrome prompt "Select a stage to see what it receives and sends."

### S2 — Loop patterns

**Layout.** `PatternSwitcher` tabs sit at the top. Below them, the active pattern's `FlowDiagram`, a `PlayPause` and a `StagePanel` are on the left, with `PatternDetails` on the right.

**Switcher**
- Uses `role="tablist"`. Tabs follow `PATTERNS` order, and each tab shows `pattern.title`.
- Activating a tab sets `#/patterns/:id`. Left/Right arrows move between tabs, and Enter/Space activates.
- The `critique` tab (`deemphasised: true`) has a muted style and a trailing badge from `pattern.badge` (`B4_BADGE`). It never gets the primary accent colour.
- An unknown `patternId` falls back to `drift`.

**PatternDetails** shows these sections in fixed order. Section headings are chrome; content is `ClaimText`.
1. Badge (if any), then "Graph source" (`graphSource`).
2. "What flows" (`flows`). B1's docs-vs-blog version note is carried here as a claim.
3. "What triggers another pass" (`trigger`).
4. "Resource cap" (`resourceCap`) and "Sufficiency stop" (`sufficiencyStop`), shown as two separate rows. They are never merged, and the stop row always shows its `unverified` badge.
5. `panels` (if any), each with its own `heading`. For `multihop`, the two panels sit side by side, each with a separate border, and nothing visually joins them.
6. `overlapNote` (for `update`), shown as a callout.

**Interactions**
- `playing` and `selectedId` belong to `PatternsPage`. Switching patterns resets `selectedId` but keeps `playing`.
- Under reduced motion, `playing` starts false.
- Node selection works as in S1, and `StagePanel` shows the selected pattern node's claims.
- Switching patterns gives the diagram a short opacity selection transition, which S12 allows.
- When `critique` is active, the diagram area also carries its muted style.

### S3 — When to use

**Layout, top to bottom**
1. The `h1` reads "When to use".
2. Framing block: each `FRAMING` claim, rendered as a lead paragraph.
3. `QueryGate`: a static SVG showing a question routed to plain RAG or to a graph loop. Its branch labels and the gate's `suggestion` badge render from `GATE`.
4. A grid of `UseCaseCard`s in `USE_CASES` order.

**UseCaseCard**
- **Heading.** Comes from a chrome title map local to `UseCaseCard`, keyed by `patternId`:
  - `drift` → "DRIFT search"
  - `multihop-tog` → "Iterative multi-hop: ToG mechanism"
  - `multihop-findings` → "Iterative multi-hop: general findings"
  - `update` → "Incremental update from new documents"
  - `critique` → "Critique-and-retry (Text2Cypher)"
  - `global` → "Global map-reduce (single pass)"

  Page data folders may not import across pages, so `PATTERNS` titles are not reused here.
- **Collapsed state.** Shows the heading and the first `bestFit` claim.
- **Expanded state** (on click, or Enter/Space; `aria-expanded`). Shows:
  - "Best fit": all `bestFit` claims;
  - "Weak spots": the `weakSpots` claims, or the `EMPTY_WEAK` text in muted italic when the array is empty;
  - "General findings": `generalFindings`, only if present, each under its own source;
  - "Suggested for Agent Command loop builds": the `suggestion.text` with the `suggestion` badge, which is always visible.
- **Animation.** Opening and closing uses a height/opacity selection transition. Several cards may be open at once.
- The `critique` card uses the same muted style as on S2.

### Shared rendering rules

**ClaimText**
- Renders the claim text, then " — " and the source names joined by "; ", then a `LabelBadge` if `label` is set.
- An info toggle reveals the URLs as `<code>` text. They are never links.

**LabelBadge**
- Renders one pill per label. Its wording comes from STANDARDS.md.
- `unverified` and `snippet` use a warning tone, `authors-claim` a neutral tone, and `suggestion` an outline tone.

**General**
- Each `FlowNode` is a `<g role="button" tabindex="0">` with `aria-label` = node title and a visible focus ring.
- Contrast is at least WCAG AA. Colour is never the only signal: edge kinds also differ by dash pattern, and badges always carry text.
- At most one decorative `@keyframes` focus pulse is allowed, on the selected node, and it is disabled under reduced motion (S12).

### Escalations (screen needs data no contract defines)

- **U1 — `GATE` shape undefined.** ARCHITECTURE.md lists `gate.js` with "suggestion kind" but gives no shape. `QueryGate` needs:
  - two branches, each with a condition and a destination;
  - claims citing 2502.11371 and 2604.16401 (snippet);
  - a `Suggestion`.

  Proposed shape: `{ branches: [{ when: Claim, to: Claim }], suggestion: Suggestion }`. If dots are wanted on Page 3, add `flow: FlowSpec`. A human or ARCHITECTURE.md decides.
- **U2 — `FRAMING` shape undefined, and there is no Page 3 `index.js`.** The proposed shape is `FRAMING: Claim[]`. The missing `index.js` is the same issue as WORKFLOW W2.
- **U3 — No field for `update`'s two variants.** `Pattern` has no variants field, and STANDARDS S3 checks "the GraphRAG variant" without naming a field. Proposal: `update` uses `panels` with exactly two entries, headed "LightRAG variant" and "GraphRAG variant". The GraphRAG panel carries the `UPDATE_741` claim and the deletions/revisions `unverified` claim. ARCHITECTURE.md must confirm this, and STANDARDS S3 must reference `panels`.

## Execute

1. **Write this UI spec:** `UI.md` (doc). This is the only file this specialist writes.
2. **Shell screen (S0):** `src/App.jsx` (code) and `src/components/NavBar.jsx` (code). Implement the route-to-page switch, focus on route change, and `aria-current`.
3. **Shared diagram UI:**
   - `src/components/FlowDiagram.jsx`, `src/components/FlowNode.jsx`, `src/components/FlowEdge.jsx`, `src/components/AnimatedDot.jsx` and `src/components/PlayPause.jsx` (code).
   - Implement the edge-kind styling, dot colours, selection highlight and keyboard behaviour defined above.
4. **Claim rendering:** `src/components/ClaimText.jsx`, `src/components/LabelBadge.jsx` and `src/components/StagePanel.jsx` (code). Include the source join, URL-as-text toggle, badge tones and panel empty prompt.
5. **S1 Anatomy:** `src/pages/AnatomyPage.jsx` (code). Implement the layout, legend, always-visible feedback-edge captions and `playing`/`selectedId` state.
6. **S2 Loop patterns:**
   - `src/pages/PatternSwitcher.jsx`, `src/pages/PatternDetails.jsx` and `src/pages/PatternsPage.jsx` (code).
   - Implement the tablist, the fixed section order, separate cap and stop rows, separated multihop panels, the overlap callout and B4 de-emphasis.
   - The `update` variant layout is pending U3.
7. **S3 When to use:**
   - `src/pages/QueryGate.jsx` (code; pending U1), `src/pages/UseCaseCard.jsx` (code) and `src/pages/WhenToUsePage.jsx` (code; `FRAMING` pending U2).
   - Implement the title map, expand/collapse transition, the `EMPTY_WEAK` state and the always-visible suggestion badge.
8. **Styles:**
   - `src/styles/base.css`: type, contrast, badge tones, focus rings.
   - `src/styles/flow.css`: edge dash patterns, dot colours, dashed optional nodes, selection transitions, the single reduced-motion-gated focus pulse.
   - `src/styles/pages.css`: two-column and stacked layouts, tabs, muted B4 style, card transitions.
   - All three are code.