// Page 1 (Anatomy) data entry point. Assembles the re-index loop FlowSpec from the
// stages, pipeline edges and global map-reduce query path, validates it, then exports.
// Imports only from this folder and the shared registries (S13).
import { assertClaim, assertFlowSpec } from '../validate.js';
import { STAGES, STAGE_IDS } from './stages.js';
import { EDGES, FEEDBACK_EDGE_ID } from './edges.js';
import { QUERY_NODES, QUERY_EDGES, QUERY_IDS, QUERY_PATH_CLAIMS, NOT_A_LOOP_CLAIM } from './queryPath.js';

// The single animated diagram for Page 1.
const flow = {
  id: 'anatomy',
  viewBox: '0 0 900 450',
  nodes: [...STAGES, ...QUERY_NODES],
  edges: [...EDGES, ...QUERY_EDGES],
  dotsPerEdge: 3,
  cycleMs: 4000,
};

// Load-time validation: throws on any content violation, so invalid content cannot mount.
assertFlowSpec(flow, { anatomy: true });
QUERY_PATH_CLAIMS.forEach((claim, i) => assertClaim(claim, `anatomy.queryPath[${i}]`));

const feedbackEdge = flow.edges.find((e) => e.id === FEEDBACK_EDGE_ID);

// Captions for the re-index feedback edge, shown at all times under the diagram:
// the #741 label claim first, then its supporting claims (including deletions/revisions).
const feedbackCaptions = [feedbackEdge.label, ...(feedbackEdge.claims || [])];
feedbackCaptions.forEach((claim, i) => assertClaim(claim, `anatomy.feedbackCaptions[${i}]`));

export const ANATOMY_FLOW = Object.freeze(flow);
export const FEEDBACK_CAPTIONS = Object.freeze(feedbackCaptions);
export const GLOBAL_PATH_CLAIMS = Object.freeze([...QUERY_PATH_CLAIMS]);
export const GLOBAL_NOT_A_LOOP = NOT_A_LOOP_CLAIM;

// Ids of the global map-reduce nodes, for the inline "not a loop" tag.
export const GLOBAL_NODE_IDS = Object.freeze(Object.values(QUERY_IDS));
export { STAGE_IDS, QUERY_IDS, FEEDBACK_EDGE_ID };
