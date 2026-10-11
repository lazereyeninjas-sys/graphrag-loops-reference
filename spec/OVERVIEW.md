## Think

**What the build is.** A small, self-contained React app with three pages. It is a reference for choosing and designing GraphRAG-style loop builds in Agent Command. It explains three things:

- how data moves through a GraphRAG pipeline, from ingestion to answer;
- which loop patterns the approved research actually sources;
- when each pattern fits and when it does not.

**For whom.** People who design multi-agent loops in Agent Command and need a sourced, honest comparison of loop patterns before committing to one.

**What it is not.**
- It is not a benchmark report. No numbers appear on any page: no costs, build times, scores or percentage gains.
- It is not a claim that Agent Command presets match any pattern. No source mentions Agent Command.

**Binding human decisions.** These come from the approved research gate. They override the brief wherever the two differ.

- **D1:** Page 1 anchors on the re-index loop.
- **D2:** Page 2 ships three sourced patterns plus one badged optional pattern.
- **E1:** Deletion and revision handling is unconfirmed for both systems.
- **E2:** "Graph update from new answers" is unsourced. The app uses "update from new documents" instead.
- All numbers are off every page.
- Every Agent Command pairing is labelled a suggestion.
- Empty weak-spot cells stay empty and are marked unverified.

**Claim labelling rule (applies to every page).**
- Every claim shown carries its source name.
- Where it applies, a claim also carries one label: **snippet**, **authors' claim**, or **unverified**.
- Any claim not confirmed in a gathered source is marked **unverified**.
- Mirror sites (mintlify) are never cited as official docs.

## Plan

### Global constraints (from the brief)
- Built with plain React, SVG and CSS only. No animation libraries and no chart libraries.
- No external network calls at runtime. All content ships inside the app.
- No source file may exceed 80 lines. The app is split into small components and data files.
- Each page keeps its animation data in its own separate data file.
- There are exactly 3 pages, each interactive and animated.

### Page 1 — Anatomy (one real loop)
The page shows one GraphRAG loop as nodes and edges.

**Pipeline stages** (source: GraphRAG Dataflow docs):
1. Chunking into TextUnits
2. Documents table
3. Graph extraction: entities, relationships, and claims stored as covariates
4. Leiden community detection
5. Community summaries
6. Embeddings

**Re-index feedback edge** (source: GraphRAG Dataflow docs + issue #741). The edge must be visible and carry new documents through these steps:
1. Cache-skip existing documents.
2. Extract only the new documents.
3. Merge into the graph.
4. Recompute communities and summaries.
5. Pass to retrieval.

**Required labels on Page 1:**
- **Feedback edge:** "as described by maintainers in #741; current CLI behaviour unverified".
- **Deletions and revisions:** "unconfirmed (unverified)".
- **Community-summary stage:** optional in some Microsoft designs, because LazyGraphRAG needs no prior summarization (source: MSR LazyGraphRAG blog, snippet).

**Global map-reduce query path** (source: Global Search docs):
- Flow: community reports at one hierarchy level → map (rated points) → reduce → answer.
- Labelled **"not a loop"** (single pass).
- Its `max_data_tokens` setting is shown as a context cap, not as a pass limit.

**Interactions:**
- Animated dots move along the edges to show data flowing between stages.
- A play/pause control starts and stops all motion.
- Clicking any stage opens a panel showing what that stage receives and what it sends, with the source named.
- Local search inputs are not described in the research. Any local-search node says so (unverified).

### Page 2 — Loop patterns (switcher, one animated flow each)
For each pattern the page shows:
- the graph-source badge;
- what flows between stages;
- what triggers another pass;
- the resource cap and the sufficiency stop, recorded separately.

**B1 — DRIFT search** (sources: GraphRAG DRIFT docs; MSR DRIFT blog)
- **Graph source:** GraphRAG index.
- **Flow:**
  1. Primer against the top-K community reports, giving an initial answer plus follow-up questions.
  2. Local search answers the follow-ups, producing intermediate answers and new follow-ups.
  3. The output is a ranked question-and-answer hierarchy.
- **Trigger:** new follow-up questions. The docs' term "confidence" is undefined in the gathered material, so it is marked unverified.
- **Resource cap:** token budget.
- **Sufficiency stop and depth limit:** not found in sources (unverified).
- **Version note:** where the docs and the blog differ, the docs are preferred.

**B2 — Iterative multi-hop retrieval.** Shown as two separately sourced panels that are never merged.
- **Panel 1, mechanism:**
  - ToG (ICLR 2024 paper): iterative beam search over a KG; entity and relation paths flow between hops.
  - ToG-2 (arXiv 2407.10805 v7, cited version): alternates graph retrieval and context retrieval (authors' claim where applicable).
  - Graph source: an existing KG, or extraction for ToG-2 (authors' claim).
  - Trigger: the clues so far do not answer the question. The exact sufficiency check and width/depth limits are unverified.
- **Panel 2, findings** (source: arXiv 2509.25530):
  - What flows: the question plus evidence so far steers the next retrieval.
  - Trigger: missing bridge evidence between entities.
  - Gains plateau after some number of rounds. No number is shown.

**B3 — Incremental graph update from new documents** (index-time loop)
- **LightRAG variant** (source: LightRAG paper): new documents are indexed the same way and their nodes and edges are union-merged into the graph, with no full reprocessing.
- **GraphRAG variant** (source: issue #741): cache-based extraction of new documents only, then community and summary recompute. Carries the #741 label used on Page 1.
- **Trigger:** arrival of new data, one pass per arrival.
- **Overlap note:** this pattern overlaps with Page 1, and the page must state so.
- **Deletions and revisions:** unconfirmed for both systems.

**B4 — Critique-and-retry over generated graph queries** (source: arXiv 2511.08274, snippet). Badged **"snippet-level, unverified"** and visually de-emphasised, so it does not carry equal weight with B1–B3.
- **Graph source:** an existing labeled property graph. There is no extraction stage and no community layer.
- **Flow:** Cypher → entity verification → execution → aggregated feedback → corrected query → interpreter.
- **Trigger:** a syntax error, a semantic error, or a schema mismatch.
- **Retry cap:** unverified.

**Excluded from Page 2:**
- StepChain query-time write-back.
- Answer write-back to the graph. Unsourced, per E2.
- Routing between RAG and GraphRAG. It is not a loop and appears on Page 3 only.

**Interactions:**
- A switcher selects one pattern at a time.
- Each pattern has its own animated SVG flow with play/pause.

### Page 3 — When to use
**Framing.** The page opens with this context (source: arXiv 2502.11371): RAG does best on single-hop, detail questions; GraphRAG does best on multi-hop and corpus-wide summary questions. A supporting claim follows: GraphRAG often underperforms vanilla RAG on many real-world tasks (ICLR 2026 paper, snippet). These general findings never fill a pattern-specific cell.

**Query-type gate.** Routing (sources: arXiv 2502.11371; arXiv 2604.16401, snippet) is shown as a gate placed before any loop: single-hop questions go to plain RAG, and multi-hop or corpus-wide questions go to a graph loop. The gate itself is labelled a suggestion.

**Per-pattern entries.** Each pattern (B1–B4, plus the global map-reduce contrast case) gets three items: best use cases, weak spots, and a "suggested for Agent Command loop builds" note.

| Pattern | Weak spots shown |
|---|---|
| DRIFT | Empty, marked unverified |
| ToG / ToG-2 | Empty, marked unverified |
| 2509.25530 findings | Expansion noise, little or no gain or harm on single-hop and comparison questions, buried bridge documents, plateau with no number |
| GraphRAG update | Recompute cost (#741); deletions unconfirmed |
| Text2Cypher (2511.08274) | Empty, marked unverified. General Text2Cypher findings are shown only under their own source names. |
| Global map-reduce | Hierarchy-level trade-off; compute-heavy; `allow_general_knowledge` may increase hallucinations (sources: Global Search docs; MSR DRIFT blog) |

**Agent Command notes.**
- Every note is labelled **"suggestion"**.
- No specific Agent Command preset is named, because the research supports no match.
- Each note restates the research suggestion for its pattern, for example "design your own sufficiency stop" for DRIFT.

### Budget cap
- **Build budget:** the approved brief and the binding gate decisions state **no monetary or iteration cap** for the build. This file does not invent one. The open item is escalated to the human and to BUDGET_ANALYSIS.md, and it must be set before the build starts.
- **Planning phase:** capped at **$1.50 and 5 iterations**.
- **Size cap:** at most 80 lines per file, per the brief's constraints.

### Escalations recorded in this file
- **Build budget cap missing** from the brief. A human must set it. The brief does not contradict itself on any feature.

## Execute

1. **Write the product scope** — `OVERVIEW.md` (doc).
   - Covers purpose, audience, binding decisions, page features, constraints and budget cap, as written above.
   - This is the only file this specialist produces.
2. **Fix the file list from this scope** — owned by ARCHITECTURE.md, which defines component and data-file paths. It must provide:
   - one animation data file per page;
   - components of 80 lines or fewer.
3. **Set the labelling and source-citation conventions** — owned by STANDARDS.md. Conventions cover the snippet, authors' claim and unverified labels, the source name on every claim, and the ban on numbers.
4. **Define the visual and interaction behaviour** — owned by UI.md. Covers animated dots, play/pause, stage-click panels, the pattern switcher and the de-emphasised B4 badge.
5. **Resolve the build budget cap** — owned by BUDGET_ANALYSIS.md together with a human decision. Required before any build step.
6. **Hand the complete SPEC to the human plan gate** — sequence owned by WORKFLOW.md. No file is written by the Builder before that gate is confirmed.