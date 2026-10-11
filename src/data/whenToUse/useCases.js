// Page 3 (When to use) use cases, in display order. Shape: UseCase[] with
// { patternId, bestFit: Claim[], weakSpots: Claim[], generalFindings?: Claim[], suggestion }.
// Empty weakSpots render as EMPTY_WEAK. Weak spots never cite general-finding sources (S4).
// Every Agent Command note is a suggestion and names no specific build. Validated by index.js.
import { LABELS, SUGGESTION_KIND } from '../labels.js';

const c = (text, sourceIds, label = null) => ({ text, sourceIds, label });
const s = (text, basisSourceIds) => ({ text, kind: SUGGESTION_KIND, basisSourceIds });
const SN = LABELS.SNIPPET;
const UV = LABELS.UNVERIFIED;
const AC = LABELS.AUTHORS_CLAIM;
const F = ['iterRetrieval2509'];

const drift = {
  patternId: 'drift',
  bestFit: [
    c('Local questions that benefit from broader community context, trading cost against quality.', ['msrDriftBlog']),
    c('Runs over a GraphRAG index: a primer over top-K community reports, then local search on follow-up questions.', ['graphragDrift']),
  ],
  weakSpots: [],
  suggestion: s('Build a follow-up-expansion loop with an explicit token budget, and design your own sufficiency stop, because none is sourced.', ['graphragDrift', 'msrDriftBlog']),
};

const multihopTog = {
  patternId: 'multihop-tog',
  bestFit: [
    c('Multi-hop questions that need deep, faithful reasoning over a knowledge graph.', ['tog2V7'], AC),
    c('Beam search over an existing KG keeps the best entity and relation paths between hops.', ['togIclr2024', 'togArxiv']),
  ],
  weakSpots: [],
  suggestion: s('Use only for multi-hop queries, and set and test your own width, depth and sufficiency limits, because none are confirmed in the gathered text.', ['togIclr2024', 'tog2V7']),
};

const multihopFindings = {
  patternId: 'multihop-findings',
  bestFit: [
    c('Multi-hop and bridge-type questions, where evidence linking entities is missing after a single retrieval.', F),
  ],
  weakSpots: [
    c('Noise from expansion lowers precision.', F),
    c('Little or no gain, and in some cases harm, on single-hop and comparison questions.', F),
    c('Bridge documents can stay buried below the top ranks.', F),
    c('Gains plateau after some number of rounds; the count is not shown here.', F, UV),
  ],
  suggestion: s('Run iterative retrieval only for multi-hop queries, with a round cap and reranking, given the plateau, noise and buried-bridge findings.', ['iterRetrieval2509']),
};

const update = {
  patternId: 'update',
  bestFit: [
    c('Frequently changing data, integrated without full reprocessing of the existing graph.', ['lightrag'], AC),
    c('GraphRAG: caching skips existing documents so only new documents are extracted before communities and summaries are recomputed.', ['graphragIssue741'], UV),
  ],
  weakSpots: [
    c('In GraphRAG, recomputing communities and summaries costs more as the graph changes.', ['graphragIssue741']),
    c('Handling of deletions and revisions is unconfirmed for both LightRAG and GraphRAG.', ['lightrag', 'graphragIssue741', 'graphragIssue2590'], UV),
  ],
  suggestion: s('Run a background re-index loop triggered by new documents and handle deletions explicitly. Write back new source evidence only; do not write generated answers into the graph.', ['lightrag', 'graphragIssue741', 'graphragIssue2590']),
};

const critique = {
  patternId: 'critique',
  bestFit: [
    c('Natural-language question answering over an existing labeled property graph.', ['multiAgentCypher'], SN),
  ],
  weakSpots: [],
  generalFindings: [
    c('Plain Text2Cypher failed on complex biomedical KGs until task splitting and prompt engineering were added.', ['text2cypherBiomed'], SN),
    c('Symbolic execution breaks on noisy graphs, and models misread schema meaning.', ['symbolicExec2603'], SN),
    c('Text similarity does not prove a generated graph query is correct; execution-grounded checks are needed.', ['execGrounded2601'], SN),
  ],
  suggestion: s('Use when a loop generates graph queries: check against execution results, not text similarity, and set your own retry cap, because none is confirmed.', ['multiAgentCypher', 'execGrounded2601']),
};

const global = {
  patternId: 'global',
  bestFit: [
    c('Corpus-wide questions, such as the main themes in the data, answered from community reports in a single pass.', ['graphragGlobal']),
  ],
  weakSpots: [
    c('Hierarchy-level choice is a trade-off: lower levels are more thorough but cost more.', ['graphragGlobal']),
    c('Covers the whole dataset but is compute-heavy.', ['msrDriftBlog']),
    c('Enabling allow_general_knowledge may increase hallucinations.', ['graphragGlobal', 'msrDriftBlog']),
  ],
  suggestion: s('Use as a single-pass summariser for corpus-wide theme questions rather than as a loop.', ['graphragGlobal', 'msrDriftBlog']),
};

export const USE_CASES = [drift, multihopTog, multihopFindings, update, critique, global];

export default USE_CASES;
