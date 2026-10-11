# GraphRAG loops reference

A small, static React app that serves as a reference for choosing and designing GraphRAG-style loop builds in Agent Command. It explains how data moves through a GraphRAG pipeline from ingestion to answer, which loop patterns the gathered sources actually describe, and when each pattern fits and when it does not.

It is not a benchmark report and it does not claim that any Agent Command preset matches any pattern. No gathered source mentions Agent Command.

## Pages

- **Anatomy** (`#/anatomy`): the GraphRAG Dataflow pipeline with a visible re-index feedback edge for new documents. Animated dots, a play/pause control, and a click or keyboard selection on any stage to see what it receives and sends. The global map-reduce query path is shown as a single pass and tagged "not a loop".
- **Loop patterns** (`#/patterns/:patternId`): a switcher over DRIFT search, iterative multi-hop retrieval (two separately sourced panels), incremental update from new documents (LightRAG and GraphRAG variants), and critique-and-retry over generated graph queries. The last one is badged "snippet-level, unverified" and visually de-emphasised.
- **When to use** (`#/when-to-use`): framing findings, a query-type gate placed before any loop, and one card per pattern with best fit, weak spots and a "suggested for Agent Command loop builds" note.

## Label meanings

Every claim names its source. Where it applies, a claim also carries one label:

- **snippet**: only a search snippet of the source was seen.
- **authors' claim**: a self-report by a paper's authors.
- **unverified**: not confirmed in any gathered source.
- **suggestion**: used only for Agent Command notes. These are inferences, not facts, and never name a preset.

An empty weak-spot cell is shown as "Empty \u2014 unverified". Weak spots are never filled from general RAG-vs-GraphRAG findings. A resource cap and a sufficiency stop are always shown as separate rows; no pattern has a sourced sufficiency stop.

Mirror sites are never cited as official docs. Source URLs are shown as plain text only; the app never links to or fetches them.

## No-numbers rule

No page shows costs, build times, scores, percentage gains or round counts. Identifiers inside source names (arXiv ids, issue numbers, venue years) and the term "top-K" are allowed. The load-time validator in `src/data/validate.js` rejects any other figure in claim text.

## How content is checked

All factual text lives in data modules under `src/data/` and reaches the screen only through the `ClaimText` component. Each page's data folder has an `index.js` that runs the validator at module load. Any content violation throws, so invalid content cannot mount. Page data folders never import from each other.

## Structure

- `src/data/` shared registries (`sources.js`, `labels.js`, `validate.js`) and one folder per page: `anatomy/`, `patterns/`, `whenToUse/`.
- `src/hooks/` hash routing and the `requestAnimationFrame` animation clock.
- `src/components/` generic SVG flow rendering, claim rendering and controls.
- `src/pages/` page composition.
- `src/styles/` all styling; CSS transitions are used for hover and selection only.

Built with plain React, SVG and CSS. No animation, chart or router library. Dependencies are `react` and `react-dom`, plus `vite` and `@vitejs/plugin-react` for development, all pinned exactly.

## Security and privacy

- No runtime network calls, remote fonts, remote images or CDN scripts.
- No storage, cookies, telemetry or environment variables (`envPrefix` is locked in `vite.config.js`).
- No HTML injection sinks; all text renders as React text nodes.
- Navigation links are hash-only.

## Content Security Policy and dev mode

The Content Security Policy is injected into the production `index.html` only, by the `production-csp` plugin in `vite.config.js` (`transformIndexHtml`). The policy blocks the dev server's HMR websocket and injected style tags, so **dev mode (`npm run dev`) runs without the CSP**. Treat only the production build as carrying the full policy.

## Scripts

- `npm run dev` starts the dev server (no CSP).
- `npm run build` produces the static bundle with the CSP injected.
- `npm run preview` serves the built bundle locally.

The app is a static bundle with no server, database or secrets.
