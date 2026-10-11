// Page 1 (Anatomy) global map-reduce query path: a single pass, labelled not a loop.
// Nodes and dotted query edges are merged into ANATOMY_FLOW by index.js.
import { NOT_A_LOOP } from '../labels.js';
import { STAGE_IDS } from './stages.js';

const c = (text, sourceIds, label = null) => ({ text, sourceIds, label });
const GS = ['graphragGlobal'];

// Node ids used by the query edges below.
export const QUERY_IDS = Object.freeze({
  REPORTS: 'globalReports', MAP: 'globalMap', REDUCE: 'globalReduce', ANSWER: 'globalAnswer',
});

const Q = QUERY_IDS;

// Shared claim for the inline tag and the panel; one object, rendered in both places.
export const NOT_A_LOOP_CLAIM = c(`Global search is a single pass: ${NOT_A_LOOP}. Nothing in it triggers another pass.`, GS);

// Context cap, not a pass limit.
const CONTEXT_CAP = c('max_data_tokens caps the size of the context data; it is a context cap, not a limit on passes.', GS);

export const QUERY_NODES = [
  { id: Q.REPORTS, title: 'Community reports (one level)', x: 220, y: 380,
    receives: [c('The query, optional conversation history, and community reports from one hierarchy level.', GS)],
    sends: [c('Community reports batched for the map step.', GS)],
    note: c('Choice of hierarchy level is a trade-off: lower levels are more thorough but cost more.', GS) },
  { id: Q.MAP, title: 'Map: rated points', x: 420, y: 380,
    receives: [c('Batches of community reports plus the query.', GS)],
    sends: [c('From each batch, a list of points, each with an importance rating.', GS)],
    note: NOT_A_LOOP_CLAIM },
  { id: Q.REDUCE, title: 'Reduce', x: 620, y: 380,
    receives: [c('Rated points from every batch.', GS)],
    sends: [c('The top-rated points, assembled as context for the final answer.', GS), CONTEXT_CAP] },
  { id: Q.ANSWER, title: 'Global answer', x: 820, y: 380,
    receives: [c('Reduced context from the top-rated points.', GS)],
    sends: [c('One answer to a corpus-wide question, such as the main themes in the data.', GS)],
    note: c('Enabling allow_general_knowledge may increase hallucinations.', GS) },
];

export const QUERY_EDGES = [
  { id: 'retrievalToReports', from: STAGE_IDS.RETRIEVAL, to: Q.REPORTS, kind: 'query',
    label: c('Global search reads community reports from one hierarchy level of the index.', GS) },
  { id: 'reportsToMap', from: Q.REPORTS, to: Q.MAP, kind: 'query',
    label: c('Report batches flow into the map step.', GS) },
  { id: 'mapToReduce', from: Q.MAP, to: Q.REDUCE, kind: 'query',
    label: c('Rated points flow into the reduce step.', GS) },
  { id: 'reduceToAnswer', from: Q.REDUCE, to: Q.ANSWER, kind: 'query',
    label: NOT_A_LOOP_CLAIM },
];

// Why the path exists: vector RAG struggles on corpus-wide questions.
export const QUERY_PATH_CLAIMS = [
  c('Vector RAG fails on corpus-wide questions because nothing in the query points to the right passages; global search answers them from community reports.', GS),
  c('Global search covers the whole dataset but is compute-heavy.', ['msrDriftBlog']),
  NOT_A_LOOP_CLAIM,
];
