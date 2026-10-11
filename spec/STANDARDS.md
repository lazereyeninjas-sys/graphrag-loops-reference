## Think

**What this file governs.** These rules apply to every layer in ARCHITECTURE.md: data, hooks, shared UI, pages and styles. Each rule names the code mechanism that enforces it. A rule that depends on a model or a writer "remembering" is not a rule here.

**Threat model.** The app is a static bundle with no backend, inputs or storage. It faces three risks:

1. **Content integrity.** A claim could be unsourced, mislabelled or carry a number.
2. **Runtime egress.** The app could make a network call, load a remote asset or follow a link.
3. **Injection of markup.** Text could be rendered as HTML.

**RLS.** Not applicable. There is no database, no table and no row, so nothing exists to apply row-level security to. The equivalent guarantee is "no persistence at all". The CSP and the storage ban below enforce it.

**Key handling.** Not applicable. The app holds no API keys, tokens, secrets or environment variables, and it must never acquire any. This is enforced under rule S5 below.

**Where enforcement lives.**
- Content rules are enforced by one validator module. It runs at module load in every data folder's `index.js` and throws on any violation, so invalid content cannot render.
- Egress and injection rules are enforced by the CSP in `index.html` and by the component contracts.
- The validator is part of the app's code. It is not a test step, and this plan schedules no run of it.

## Plan

### Label wording (owned here; `LabelBadge` renders exactly these strings)

| `label` / kind | Displayed text |
|---|---|
| `snippet` | `snippet` |
| `authors-claim` | `authors' claim` |
| `unverified` | `unverified` |
| `suggestion` | `suggestion` |
| `null` | no badge |

**Fixed strings.** These are exported as constants from `src/data/labels.js`, and data files import the constants instead of retyping the text:
- `B4_BADGE` = `snippet-level, unverified`
- `UPDATE_741` = `as described by maintainers in #741; current CLI behaviour unverified`
- `EMPTY_WEAK` = `Empty — unverified`
- `NOT_A_LOOP` = `not a loop`

### Must-never rules and their code-level enforcement

**S1 — Every visible claim names a source.**
- `validate.js` → `assertClaim(c)` throws unless all of the following hold:
  - `text` is a non-empty string.
  - `sourceIds.length ≥ 1`.
  - Every id is a key of `SOURCES`.
  - `label` is a member of `LABELS` or is `null`.
- `ClaimText` accepts only a `claim` prop and renders source names from `SOURCES[id].name`. If it receives an unknown id it renders nothing, and it throws in development mode.
- Pages never render factual text as raw JSX strings. The only literal text allowed outside data files is UI chrome: nav labels, button text and headings.

**S2 — No numbers on any page.**
- `assertNoFigures(text)` runs on the text of every Claim, Suggestion and Node title, and on every edge label.
- It first strips the allowed identifiers:
  - arXiv ids: `/\b\d{4}\.\d{4,5}(v\d+)?\b/`
  - issue refs: `/#\d+/`
  - venue years: `/\b(ICLR|NeurIPS|ACL) \d{4}\b/`
  - `top-K`
- It then throws if any `\d`, `%`, `$`, `×` or a spelled-out multiplier word (`twice`, `times`, `fold`) remains.
- Pattern and use-case ids contain no digits.

**S3 — Unconfirmed means `unverified`.** These checks are enforced in `validate.js`:
- `Pattern.sufficiencyStop` must be present for every pattern, with `label === 'unverified'`, because no stop is sourced.
- `Pattern.resourceCap` and `Pattern.sufficiencyStop` must both be present and must not be the same object.
- `critique`:
  - `deemphasised === true`
  - `badge.text === B4_BADGE`
  - every claim's label ∈ {`snippet`, `unverified`}
- `multihop`:
  - `panels.length === 2`
  - no claim object appears in both panels (identity check via `Set`)
- The anatomy feedback edge (`kind === 'feedback'`) and the GraphRAG variant in `update.js` must carry `label.text === UPDATE_741`.
- Both `update.js` and the anatomy feedback edge must include a deletions-and-revisions claim with `label === 'unverified'`.
- The global query path node must carry a claim whose text includes `NOT_A_LOOP`.

**S4 — Weak spots are never back-filled.**
- `validate.js` defines `GENERAL_FINDING_SOURCES`, which contains the 2502.11371 and ICLR 2026 entries plus the general Text2Cypher sources.
- `assertUseCase` throws if any `weakSpots` claim cites a source in that set.
- General Text2Cypher findings are allowed only in `generalFindings`.
- `UseCaseCard` renders `EMPTY_WEAK` when `weakSpots.length === 0`. It has no other fallback text.

**S5 — Agent Command notes are suggestions only.**
- `assertSuggestion` throws unless all of the following hold:
  - `kind === 'suggestion'`.
  - `basisSourceIds` is non-empty and every id is valid.
  - `text` does not match `/\bpreset\b/i`.
- `UseCaseCard` always renders the `suggestion` badge next to the note.

**S6 — No unsourced patterns.**
- `PATTERN_IDS` is a frozen enum: `drift`, `multihop`, `update`, `critique`.
- `USECASE_IDS` is a frozen enum: `drift`, `multihop-tog`, `multihop-findings`, `update`, `critique`, `global`.
- `validate.js` rejects any other id. This structurally excludes answer write-back, StepChain and routing as Page 2 patterns.
- Claim text must not match `/new answers/i` unless `label === 'unverified'` (E2).

**S7 — No mirror sources.**
- `assertSources` runs once over `SOURCES` and throws if any `url` contains `mintlify`, or if any `kind` is outside the `ARCHITECTURE.md` enum.
- Every entry sits on one line, to keep the file within the cap.

**S8 — No runtime egress.**
- The `index.html` CSP is the enforcement. It extends the ARCHITECTURE.md policy with `script-src 'self'`, `style-src 'self'`, `font-src 'self'`, `frame-src 'none'`, `base-uri 'none'` and `form-action 'none'`.
- Source URLs render only as text inside `<span>` or `<code>`. They are never an `href`, `src` or `srcset`.
- The app uses no `<a>` with an external target. Navigation links are hash-only (`#/…`), and `NavBar` builds them from the route enum.

**S9 — No HTML injection.**
- The CSP adds `require-trusted-types-for 'script'`, so browsers that support Trusted Types reject string-to-HTML sinks.
- The code contains no `dangerouslySetInnerHTML`, `innerHTML`, `eval`, `new Function` or string `setTimeout`.
- All text is React text nodes.

**S10 — No persistence, secrets or telemetry.**
- The code does not reference `localStorage`, `sessionStorage`, `indexedDB`, `document.cookie`, `navigator.sendBeacon`, `import.meta.env` or `process.env`.
- `vite.config.js` sets `envPrefix: '__NONE__'`, so no environment variable can be exposed to the bundle.

**S11 — Dependency lock.**
- `package.json` lists only the following:
  - `dependencies`: `react`, `react-dom`
  - `devDependencies`: `vite`, `@vitejs/plugin-react`
- All versions are pinned exactly, with no `^` or `~`.
- There are no `postinstall` or other lifecycle scripts.

**S12 — No animation or chart library.**
- `useAnimationClock` is the only motion source for dots.
- CSS `transition` is allowed on hover and selection only.
- `@keyframes` are not allowed for data dots. They may be used for at most one decorative focus pulse, which is UI.md's choice.

**S13 — File size and isolation.**
- Each file is at most 80 lines. This is enforced by the per-file split in ARCHITECTURE.md and checked by reading during review. This rule is structural, not runtime.
- Page data folders never import from another page's folder. Each `index.js` imports only from its own folder, `../sources.js`, `../labels.js` and `../validate.js`.

### Validator contract (`src/data/validate.js`)

**Exports:** `assertClaim`, `assertNoFigures`, `assertSuggestion`, `assertPattern`, `assertUseCase`, `assertFlowSpec`, `assertSources`, `GENERAL_FINDING_SOURCES`.

**`assertFlowSpec` checks:**
- Node ids are unique.
- Every edge's `from` and `to` resolve to a node.
- Every node's `receives`, `sends` and `note` pass `assertClaim`.

**Behaviour:**
- Each assertion throws `Error('[standards Sx] <id>: <reason>')`.
- Each data `index.js` calls the relevant assertions before export, so the app cannot mount with invalid content.

### Escalations (design changes required; not guessed)

1. **`src/data/validate.js` is missing from the ARCHITECTURE.md file list.** S1–S7 cannot be enforced in code without it. ARCHITECTURE.md must add it.
2. **`src/data/whenToUse/` has no `index.js`.** Page 3 data therefore has no load-time validation point. ARCHITECTURE.md must add `src/data/whenToUse/index.js`, which validates and exports `FRAMING`, `GATE` and `USE_CASES`.
3. **The CSP blocks the Vite dev server.** The ARCHITECTURE.md CSP (`connect-src 'none'`, `default-src 'self'`) and the S8/S9 additions block Vite's dev-mode HMR websocket and its injected `<style>` tags. The production bundle is unaffected. ARCHITECTURE.md must decide one of two options:
   - inject the CSP only into the production `index.html` through a small `vite.config.js` `transformIndexHtml` hook, using no extra dependency; or
   - accept that dev mode is not a supported path.

   This plan schedules no run either way.
4. **Fixed label strings must live in `labels.js`.** S3 and S5 depend on them being exported there, so `labels.js` must export the constants listed above in addition to the `LABELS` enum.

## Execute

1. **Write this standards file**
   - `STANDARDS.md` (doc): label wording, rules S1–S13, validator contract, escalations.
2. **Validator module** (pending ARCHITECTURE.md adding it, escalation 1)
   - `src/data/validate.js` (code): the assertions and `GENERAL_FINDING_SOURCES`, per the contract above.
3. **Label constants**
   - `src/data/labels.js` (code): the `LABELS` enum, display wording and the fixed strings `B4_BADGE`, `UPDATE_741`, `EMPTY_WEAK`, `NOT_A_LOOP`.
4. **Load-time validation calls**
   - `src/data/anatomy/index.js` (code)
   - `src/data/patterns/index.js` (code)
   - `src/data/whenToUse/index.js` (code; pending escalation 2)

   Each calls its validators before export.
5. **Egress and injection controls**
   - `index.html` (code): CSP with the S8 and S9 directives.
   - `vite.config.js` (code): `envPrefix` lock, plus the CSP placement chosen under escalation 3.
6. **Dependency lock**
   - `package.json` (code): exact pins, the four packages only, no lifecycle scripts.
7. **Rendering contracts**
   - `src/components/ClaimText.jsx` (code)
   - `src/components/LabelBadge.jsx` (code)
   - `src/pages/UseCaseCard.jsx` (code)
   - `src/components/NavBar.jsx` (code)

   These implement S1, S4, S5 and S8 as specified.