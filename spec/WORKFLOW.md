## Think

**What this file fixes.** It sets the order in which the Builder writes files, the gates that stop for a human, and the review rules at each checkpoint. Nothing in this workflow is executed, tested or deployed. Every check here is a review done by reading.

**Where the build order comes from.** The order is derived from the layers in ARCHITECTURE.md, mapped onto Schema → API → UI:

| Phase | ARCHITECTURE.md layer(s) | Meaning in this app |
|---|---|---|
| Shell | Infrastructure | Project files and the CSP. Everything else sits inside these. |
| Schema | Data: shared registries | `SOURCES`, `LABELS`, the fixed strings and the validator. These are the contracts every other file depends on. |
| API | Data: per-page modules, plus Logic | Per-page data exports (`ANATOMY_FLOW`, `PATTERNS`, the Page 3 exports) and the hook signatures (`useHashRoute`, `useAnimationClock`). These are what UI consumes. |
| UI | Shared UI, Pages, Style | Components, pages, entry and CSS. |

A layer may import only from itself or from earlier layers. Page data folders never import from each other (STANDARDS S13).

**Disagreement check (escalation trigger).** ARCHITECTURE.md and STANDARDS.md disagree on what must be reviewed:

- **Validator.** STANDARDS requires `src/data/validate.js` as the enforcement point for S1–S7, and makes each data `index.js` call it. ARCHITECTURE.md's file list omits it.
- **Page 3 validation point.** STANDARDS requires `src/data/whenToUse/index.js`. ARCHITECTURE.md omits it, so Page 3 has no load-time validation point to review.
- **CSP placement.** STANDARDS escalation 3 asks ARCHITECTURE.md to choose between production-only CSP injection and "dev mode not supported". No choice is recorded, so the review target for `index.html` and `vite.config.js` is undetermined.

These are **escalated to the human**, not guessed (see Plan § Escalations). The CSP *directives* do not conflict: STANDARDS S8/S9 is a strict superset of the ARCHITECTURE.md policy, and review uses the superset.

**Inherited escalation.** OVERVIEW.md records that no build budget cap is set. BUDGET_ANALYSIS.md is still empty. This file does not set a cap.

## Plan

### Gates

| Gate | Type | Position | What confirms it |
|---|---|---|---|
| **APPROVE RESEARCH FINDINGS** (`research-gate`) | Hard, entry | Before Planner acts | The harness holds the exact reply `CONFIRM APPROVE RESEARCH FINDINGS` from a human. If it is absent, Planner reports that the gate is unsatisfied and stops. |
| **APPROVE BUILD PLAN** | Hard, blocking | After the full SPEC is written, before the Builder writes any file | The harness matches the exact reply `CONFIRM APPROVE BUILD PLAN` from a real human action. Any other reply cancels. |

**APPROVE BUILD PLAN rules**

- **Request content.** The request is presented verbatim. Its Details field contains:
  - the complete file list, with path and kind (doc or code);
  - the open escalations;
  - the budget cap, or the statement that none is set.
- **Pre-score.** Node `tpe-prescore` is shown alongside the request as a recommendation only. The human decides.
- **While waiting.** The loop is paused. No tool calls are made and no budget is spent.
- **No self-confirmation.** No agent narration counts as confirmation.
- **On rejection:**
  - The SPEC returns to Planner with the reviewer's feedback attached.
  - Planner reworks only the affected files and re-requests.
  - The gate may be requested at most 3 times in total. After that, the plan escalates to Human Review.
  - The whole run is never restarted.
- **Preconditions for raising the gate:**
  - every escalation below has a recorded human decision, or is listed as open in Details;
  - the budget cap is either set by a human or listed as open in Details.

The Builder does not start while a precondition that a human has marked blocking remains open.

### Build and merge order

Each phase's files are written in the order listed. A phase merges into the shared build only after its checkpoint review passes.

1. **Shell.** `package.json`, `vite.config.js`, `index.html`, `README.md`.
2. **Schema.** `src/data/sources.js`, `src/data/labels.js`, `src/data/validate.js` (pending escalation W1).
3. **API: data.**
   - Page 1 folder, then Page 2 folder, then Page 3 folder.
   - Within each folder, leaf files come first and `index.js` comes last.
   - `src/data/whenToUse/index.js` is pending escalation W2.
4. **API: logic.** `src/hooks/useHashRoute.js`, `src/hooks/useAnimationClock.js`.
5. **UI: shared components.**
   - Leaf components first: `LabelBadge`, `ClaimText`, `PlayPause`, `AnimatedDot`, `FlowEdge`, `FlowNode`.
   - Then `FlowDiagram`, `StagePanel`, `NavBar`.
6. **UI: pages.**
   - Sub-components before their page: `PatternSwitcher` and `PatternDetails` before `PatternsPage`; `QueryGate` and `UseCaseCard` before `WhenToUsePage`.
   - `AnatomyPage` has no page-level sub-components.
7. **UI: entry and styles.** `src/styles/*.css`, `src/App.jsx`, `src/main.jsx`.

**Order rules**

- A file may not reference a symbol from a file that is not yet written.
- A later phase may not change an earlier phase's exported contract. If a change is needed, the Builder stops at the current checkpoint and returns to Planner. The return counts against the plan-gate rework limit only if it changes the file list or scope.

### Checkpoint and review rules

All reviews are done by reading. No review step runs, builds or tests anything.

| Checkpoint | After phase | Reviewer reads for |
|---|---|---|
| C0 | Shell | S8 and S9 CSP directives present; S10 `envPrefix` lock; S11 exact pins, the four packages only, no lifecycle scripts; CSP placement matches the W3 decision. |
| C1 | Schema | `LABELS` wording and the fixed strings match STANDARDS; S7 (no mintlify URLs, `kind` within the enum); the validator exports match the STANDARDS contract. |
| C2 | API data | See the list below. |
| C3 | API logic | Animation contract: `requestAnimationFrame`, cancelled on pause and unmount, progress kept on pause, reduced motion starts paused; hash routes and default redirect as in ARCHITECTURE.md. |
| C4 | Shared components | S1 (`ClaimText` is the only path for factual text); S8 (URLs shown as text only); S9 (no injection sinks); S12 (no motion library). |
| C5 | Pages | S1, S4 and S5 rendering; the `EMPTY_WEAK` empty state; the `suggestion` badge always shown; B4 de-emphasised; no factual text in raw JSX. |
| C6 | Entry and styles | S10 and S12 (`@keyframes` not used for data dots); no remote fonts or assets. |

**C2 review items (API data)**

- Every Claim satisfies S1–S3.
- S4: no weak spot is back-filled from a general finding.
- S6: only the frozen pattern and use-case ids are used.
- The numbers ban holds.
- Every `index.js` calls its validators before export.
- No data folder imports from another page's folder.

**Rules that apply at every checkpoint**

- Every file is at most 80 lines (S13).
- Each file matches the kind and path in ARCHITECTURE.md.
- No claim says or implies that anything was run, built or tested.
- The binding gate decisions (D1, D2, E1, E2, no numbers, suggestion-only notes) take precedence over any other text. Where they conflict, follow the decision and record the conflict.

**Failure at a checkpoint**

- The Builder fixes only the failing files in that phase and re-submits the same checkpoint.
- A failure that needs a contract or scope change returns to Planner (see the order rules above).
- Two consecutive failures of the same checkpoint on the same rule escalate to a human.

### Escalations (human decision required; not guessed)

- **W1.** Should `src/data/validate.js` be added to the ARCHITECTURE.md file list? STANDARDS requires it; ARCHITECTURE.md omits it.
- **W2.** Should `src/data/whenToUse/index.js` be added? STANDARDS requires it; ARCHITECTURE.md omits it.
- **W3.** Where does the CSP go: injected into the production `index.html` only, or kept in source with dev mode declared unsupported? ARCHITECTURE.md has not chosen.
- **W4.** The build budget cap is unset (inherited from OVERVIEW.md). It is pending BUDGET_ANALYSIS.md and a human decision.

## Execute

1. **Write this workflow file.** `WORKFLOW.md` (doc): gates, Schema → API → UI order, checkpoints, escalations W1–W4. This is the only file this specialist writes.
2. **Raise APPROVE BUILD PLAN** once the SPEC is complete. Details lists every file below, W1–W4 and the budget status. No file is written before `CONFIRM APPROVE BUILD PLAN`.
3. **Shell (C0).**
   - `package.json` (code)
   - `vite.config.js` (code)
   - `index.html` (code)
   - `README.md` (doc)
4. **Schema (C1).**
   - `src/data/sources.js` (code)
   - `src/data/labels.js` (code)
   - `src/data/validate.js` (code; subject to W1)
5. **API: Page 1 data (C2).**
   - `src/data/anatomy/stages.js` (code)
   - `src/data/anatomy/edges.js` (code)
   - `src/data/anatomy/queryPath.js` (code)
   - `src/data/anatomy/index.js` (code)
6. **API: Page 2 data (C2).**
   - `src/data/patterns/drift.js` (code)
   - `src/data/patterns/multihop.js` (code)
   - `src/data/patterns/update.js` (code)
   - `src/data/patterns/critique.js` (code)
   - `src/data/patterns/index.js` (code)
7. **API: Page 3 data (C2).**
   - `src/data/whenToUse/framing.js` (code)
   - `src/data/whenToUse/gate.js` (code)
   - `src/data/whenToUse/useCases.js` (code)
   - `src/data/whenToUse/index.js` (code; subject to W2)
8. **API: logic (C3).**
   - `src/hooks/useHashRoute.js` (code)
   - `src/hooks/useAnimationClock.js` (code)
9. **UI: shared components (C4).**
   - `src/components/LabelBadge.jsx` (code)
   - `src/components/ClaimText.jsx` (code)
   - `src/components/PlayPause.jsx` (code)
   - `src/components/AnimatedDot.jsx` (code)
   - `src/components/FlowEdge.jsx` (code)
   - `src/components/FlowNode.jsx` (code)
   - `src/components/FlowDiagram.jsx` (code)
   - `src/components/StagePanel.jsx` (code)
   - `src/components/NavBar.jsx` (code)
10. **UI: pages (C5).**
    - `src/pages/AnatomyPage.jsx` (code)
    - `src/pages/PatternSwitcher.jsx` (code)
    - `src/pages/PatternDetails.jsx` (code)
    - `src/pages/PatternsPage.jsx` (code)
    - `src/pages/QueryGate.jsx` (code)
    - `src/pages/UseCaseCard.jsx` (code)
    - `src/pages/WhenToUsePage.jsx` (code)
11. **UI: entry and styles (C6).**
    - `src/styles/base.css` (code)
    - `src/styles/flow.css` (code)
    - `src/styles/pages.css` (code)
    - `src/App.jsx` (code)
    - `src/main.jsx` (code)