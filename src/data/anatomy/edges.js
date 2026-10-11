// Page 1 (Anatomy) edges: the Dataflow pipeline, the re-index feedback edge and the
// local-search query edge. Edges to the global map-reduce nodes live in queryPath.js.
import { LABELS, UPDATE_741 } from '../labels.js';
import { STAGE_IDS } from './stages.js';

const c = (text, sourceIds, label = null) => ({ text, sourceIds, label });
const S = STAGE_IDS;
const DF = ['graphragDataflow'];

export const FEEDBACK_EDGE_ID = 'reindexFeedback';

// Solid pipeline edges, in Dataflow order.
const PIPELINE = [
  { id: 'srcToChunk', from: S.SOURCE, to: S.CHUNK, kind: 'flow',
    label: c('Document text flows into chunking.', DF) },
  { id: 'chunkToDocs', from: S.CHUNK, to: S.DOCS, kind: 'flow',
    label: c('TextUnits linked back to their documents.', DF) },
  { id: 'docsToExtract', from: S.DOCS, to: S.EXTRACT, kind: 'flow',
    label: c('TextUnits flow into graph and claim extraction.', DF) },
  { id: 'extractToCommunity', from: S.EXTRACT, to: S.COMMUNITY, kind: 'flow',
    label: c('Merged entities and relationships flow into community detection.', DF) },
  { id: 'communityToSummary', from: S.COMMUNITY, to: S.SUMMARY, kind: 'flow',
    label: c('Communities flow into community report generation.', DF) },
  { id: 'summaryToEmbed', from: S.SUMMARY, to: S.EMBED, kind: 'flow',
    label: c('Report text, entity descriptions and TextUnit text flow into embedding.', DF) },
  { id: 'embedToRetrieval', from: S.EMBED, to: S.RETRIEVAL, kind: 'flow',
    label: c('Indexed outputs and the vector store are available to retrieval.', DF) },
];

// Curved re-index feedback edge: new documents re-enter the pipeline.
const FEEDBACK = {
  id: FEEDBACK_EDGE_ID, from: S.RETRIEVAL, to: S.SOURCE, kind: 'feedback',
  label: c(`Re-index loop: new documents arrive, existing documents are cache-skipped, only new documents are extracted, merged into the graph, then communities and summaries are recomputed before retrieval \u2014 ${UPDATE_741}.`, ['graphragDataflow', 'graphragIssue741'], LABELS.UNVERIFIED),
  claims: [
    c('Caching skips re-chunking and re-extraction of existing documents, so only new documents are extracted.', ['graphragIssue741']),
    c('After the merge, communities are recomputed and summaries are regenerated; recompute cost grows as the graph changes.', ['graphragIssue741']),
    c('Handling of deletions and revisions is unconfirmed for both GraphRAG and LightRAG.', ['graphragIssue741', 'graphragIssue2590', 'lightrag'], LABELS.UNVERIFIED),
  ],
};

// Dotted query edge from retrieval into local search.
const LOCAL_QUERY = {
  id: 'retrievalToLocal', from: S.RETRIEVAL, to: S.LOCAL, kind: 'query',
  label: c('Retrieval context feeds local search; the exact inputs are not described in the gathered material.', ['graphragQueryOverview'], LABELS.UNVERIFIED),
};

export const EDGES = [...PIPELINE, FEEDBACK, LOCAL_QUERY];
