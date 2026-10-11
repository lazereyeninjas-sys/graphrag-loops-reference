// Page 1 (Anatomy) nodes: the GraphRAG Dataflow indexing stages, retrieval and local search.
// Coordinates use the anatomy viewBox units. Global map-reduce nodes live in queryPath.js.
import { LABELS } from '../labels.js';

const c = (text, sourceIds, label = null) => ({ text, sourceIds, label });
const DF = ['graphragDataflow'];

// Node ids used by edges.js and queryPath.js.
export const STAGE_IDS = Object.freeze({
  SOURCE: 'sourceDocs', CHUNK: 'chunking', DOCS: 'documents', EXTRACT: 'extraction',
  COMMUNITY: 'communities', SUMMARY: 'summaries', EMBED: 'embeddings',
  RETRIEVAL: 'retrieval', LOCAL: 'localSearch',
});

const S = STAGE_IDS;

export const STAGES = [
  { id: S.SOURCE, title: 'Source documents', x: 70, y: 80,
    receives: [c('Input documents to be indexed.', DF), c('On re-index, new documents arrive; caching skips re-chunking and re-extraction of existing documents.', ['graphragIssue741'])],
    sends: [c('Document text to chunking.', DF)] },
  { id: S.CHUNK, title: 'Chunking into TextUnits', x: 220, y: 80,
    receives: [c('Document text.', DF)],
    sends: [c('TextUnits sized in tokens, each linked back to its source document.', DF)] },
  { id: S.DOCS, title: 'Documents table', x: 370, y: 80,
    receives: [c('Documents and their TextUnits.', DF)],
    sends: [c('Links from each document to its TextUnits, for provenance.', DF)] },
  { id: S.EXTRACT, title: 'Graph extraction', x: 520, y: 80,
    receives: [c('TextUnits.', DF)],
    sends: [c('Entities and relationships from graph extraction, merged into the graph.', DF), c('Claims from claim extraction, stored as covariates.', DF)] },
  { id: S.COMMUNITY, title: 'Leiden communities', x: 670, y: 80,
    receives: [c('The merged graph of entities and relationships.', DF)],
    sends: [c('A hierarchy of communities from Leiden hierarchical community detection.', DF)] },
  { id: S.SUMMARY, title: 'Community summaries', x: 820, y: 80, optional: true,
    receives: [c('Communities and their member entities and relationships.', DF)],
    sends: [c('Community reports, generated and summarised per community.', DF)],
    note: c('Optional in some Microsoft designs: LazyGraphRAG needs no prior summarization of source data.', ['msrLazyBlog'], LABELS.SNIPPET) },
  { id: S.EMBED, title: 'Embeddings', x: 820, y: 230,
    receives: [c('Entity descriptions, TextUnit text and community report text.', DF)],
    sends: [c('Embeddings stored in a vector store.', DF)] },
  { id: S.RETRIEVAL, title: 'Retrieval', x: 600, y: 230,
    receives: [c('Indexed outputs of the pipeline: graph tables, community reports and embeddings.', DF)],
    sends: [c('Context for a query mode: global search, local search or DRIFT search.', ['graphragGlobal', 'graphragDrift'])],
    note: c('After a re-index, retrieval works over the merged graph with recomputed communities and summaries.', ['graphragIssue741'], LABELS.UNVERIFIED) },
  { id: S.LOCAL, title: 'Local search', x: 380, y: 230,
    receives: [c('What local search receives (entities, relationships, TextUnits or covariates) is not described in the gathered material.', ['graphragQueryOverview'], LABELS.UNVERIFIED)],
    sends: [c('An answer built from local context; how that context is assembled is not described in the gathered material.', ['graphragQueryOverview'], LABELS.UNVERIFIED)],
    note: c('Local search works best when the answer sits in a few text units.', ['msrDriftBlog']) },
];
