// Page 2 pattern B3: incremental graph update from new documents (index-time loop).
// Exports one Pattern; validated by patterns/index.js before export.
import { LABELS, UPDATE_741 } from '../labels.js';

const c = (text, sourceIds, label = null) => ({ text, sourceIds, label });
const LR = ['lightrag'];
const GR = ['graphragIssue741'];
const BOTH = ['lightrag', 'graphragIssue741'];
const AC = LABELS.AUTHORS_CLAIM;
const UV = LABELS.UNVERIFIED;

const N = Object.freeze({
  NEW: 'upNewDocs', CACHE: 'upCache', EXTRACT: 'upExtract', MERGE: 'upMerge', RECOMPUTE: 'upRecompute', RET: 'upRetrieval',
});

const nodes = [
  { id: N.NEW, title: 'New documents arrive', x: 80, y: 120,
    receives: [c('New data added to an already indexed corpus.', BOTH)],
    sends: [c('The new documents to the indexing steps.', BOTH)] },
  { id: N.CACHE, title: 'Cache-skip existing', x: 240, y: 120,
    receives: [c('The full document set, old and new.', GR)],
    sends: [c('Only new documents onward; caching skips re-chunking and re-extraction of existing documents.', GR)],
    note: c(`GraphRAG variant only, ${UPDATE_741}.`, ['graphragIssue741', 'graphragCli'], UV) },
  { id: N.EXTRACT, title: 'Extract new only', x: 400, y: 120,
    receives: [c('New documents only.', BOTH)],
    sends: [c('Nodes and edges from the same graph indexing used for the original documents.', LR)] },
  { id: N.MERGE, title: 'Merge into graph', x: 560, y: 120,
    receives: [c('New nodes and edges plus the existing graph.', LR)],
    sends: [c('A graph that is the union of the old and new node and edge sets, with no full reprocessing.', LR)] },
  { id: N.RECOMPUTE, title: 'Recompute communities', x: 720, y: 120,
    receives: [c('The rebuilt graph (GraphRAG variant).', GR)],
    sends: [c('Recomputed communities and regenerated summaries.', GR)],
    note: c('Open maintainer concern: deciding when changed communities have shifted enough to need recomputing.', GR) },
  { id: N.RET, title: 'Retrieval', x: 720, y: 230,
    receives: [c('The updated index.', BOTH)],
    sends: [c('Low-level and high-level retrieval over the merged graph (LightRAG).', LR)] },
];

const edges = [
  { id: 'upNewToCache', from: N.NEW, to: N.CACHE, kind: 'flow', label: c('New documents enter the update pass.', BOTH) },
  { id: 'upCacheToExtract', from: N.CACHE, to: N.EXTRACT, kind: 'flow', label: c('Only new documents reach extraction.', GR) },
  { id: 'upExtractToMerge', from: N.EXTRACT, to: N.MERGE, kind: 'flow', label: c('New nodes and edges flow into the merge.', LR) },
  { id: 'upMergeToRecompute', from: N.MERGE, to: N.RECOMPUTE, kind: 'flow', label: c('GraphRAG rebuilds the graph and recomputes communities and summaries.', GR) },
  { id: 'upRecomputeToRet', from: N.RECOMPUTE, to: N.RET, kind: 'flow', label: c('The updated index is available to retrieval.', BOTH) },
  { id: 'upRetToNew', from: N.RET, to: N.NEW, kind: 'feedback', label: c('The next arrival of new documents starts another pass.', BOTH) },
];

const deletions = c('Handling of deletions and revisions is unconfirmed for both LightRAG and GraphRAG.', ['lightrag', 'graphragIssue741', 'graphragIssue2590'], UV);

const lightragPanel = { heading: 'LightRAG variant', claims: [
  c('New documents go through the same graph indexing as the originals.', LR),
  c('Their nodes and edges are union-merged into the existing graph, with no full reprocessing.', LR),
  c('Aims to integrate new data without disrupting the existing graph and to reduce compute.', LR, AC),
] };

const graphragPanel = { heading: 'GraphRAG variant', claims: [
  c(`Caching skips existing documents, only new documents are extracted, then the graph is rebuilt, communities recomputed and summaries regenerated \u2014 ${UPDATE_741}.`, ['graphragIssue741', 'graphragCli'], UV),
  c('The issue #2590 title reports that the update command ignores removed documents; the issue body was not read.', ['graphragIssue2590'], UV),
  c('A planned append command that places new entities into existing communities without full Leiden recompute is described; its status is not confirmed.', ['graphragAppend2606'], UV),
  deletions,
] };

export const UPDATE = {
  id: 'update',
  title: 'Incremental update from new documents',
  deemphasised: false,
  graphSource: c('Runs on a GraphRAG or LightRAG index, at index time rather than query time.', BOTH),
  flows: [
    c('New documents flow through extraction, are merged into the graph, then (GraphRAG only) communities and summaries are recomputed before retrieval.', BOTH),
    c('RAGA states that GraphRAG and LightRAG lack incremental update; the primary sources describe additive insertion, so RAGA may refer to the deletion and revision gap.', ['raga2605', 'lightrag', 'graphragIssue741'], UV),
  ],
  trigger: c('Arrival of new data triggers the loop, once per arrival.', BOTH),
  resourceCap: c('One pass per arrival of new data; in GraphRAG, recompute cost for communities and summaries grows as the graph changes.', BOTH),
  sufficiencyStop: c('No sufficiency stop beyond finishing the pass for each arrival was found in the sources.', BOTH, UV),
  panels: [lightragPanel, graphragPanel],
  overlapNote: c('This pattern overlaps with the re-index feedback loop on the Anatomy page; here the LightRAG and GraphRAG variants are compared side by side.', ['graphragDataflow', 'graphragIssue741', 'lightrag']),
  flow: { id: 'updateFlow', viewBox: '0 0 900 300', nodes, edges, dotsPerEdge: 3, cycleMs: 4000 },
};

export default UPDATE;
