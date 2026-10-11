## Think

**Cost basis.** Every figure below is costed from the Infrastructure section of ARCHITECTURE.md:

- The app is a static client-only bundle.
- It has no server, database, API, environment variables or secrets.
- It makes no runtime network calls.
- It has two runtime dependencies (`react`, `react-dom`) and two dev dependencies (`vite`, `@vitejs/plugin-react`), all open source.
- ARCHITECTURE.md names no hosting provider and no custom domain.

The app therefore has no compute, storage, database, API or third-party service line items. Its 12-month cost has three possible parts:

1. static hosting and bandwidth;
2. an optional domain;
3. maintenance labour to keep the sourced content current.

**Why maintenance labour is the main variable.** The research brief lists 11 open questions. Several of them could change page content:

- `graphrag update` behaviour (#2590, CLI docs);
- DRIFT's stop setting;
- ToG-2 width and depth limits;
- the 2509.25530 plateau;
- whether B4 can be upgraded from snippet level.

Each resolved question means editing data files and reviewing them against STANDARDS S1–S13.

**Scenario naming.** In this file, **conservative** means the cautious, highest-cost planning case. **Aggressive** means the lean, lowest-cost case. **Realistic** is the expected case.

**Pricing honesty.**
- No vendor price appears in the approved research. Every money figure here is a planning assumption, marked *(assumed, unverified)*, and a human should replace it with a quoted price.
- These figures belong to the SPEC only. They never appear on any app page. The no-numbers rule applies to the pages.

**Out of scope for infrastructure.** One-time Builder (LLM) spend to write the planned files is not infrastructure. It is listed separately as uncosted, because no source gives a per-file cost and this file does not invent one.

## Plan

### Cost drivers taken from ARCHITECTURE.md

| Driver | ARCHITECTURE.md basis | Cost effect |
|---|---|---|
| Compute / server | None ("no server") | Zero |
| Database / storage | None; STANDARDS S10 forbids persistence | Zero |
| Secrets / key management | None; S10 locks `envPrefix` | Zero |
| Third-party APIs | None; CSP `connect-src 'none'` | Zero |
| Dependencies | Four open-source packages, pinned (S11) | No licence cost |
| Hosting | Static bundle; host not chosen | Free tier, existing internal host, or paid tier |
| Bandwidth | Small static bundle; no remote assets, fonts or CDN scripts (S8) | Assumed within free-tier limits *(assumed, unverified)* |
| Domain | Not specified | Optional |
| Maintenance | 43 planned files, including pending `validate.js` (W1) and `whenToUse/index.js` (W2); every edit is reviewed by reading against S1–S13 | Labour hours |

### Scenario assumptions

**Conservative (cautious, highest cost)**
- **C-A1.** Paid static-hosting tier at **$20/month** *(assumed, unverified)*, chosen for an SLA or access control.
- **C-A2.** Custom domain at **$15/year** *(assumed, unverified)*.
- **C-A3.** Content revision every month as open questions resolve, at **4 h** per revision. That time covers the data-file edit, validator-consistent labelling, and a checkpoint C2/C5 read-through.
- **C-A4.** No change to the infrastructure in ARCHITECTURE.md.

**Realistic (expected)**
- **R-A1.** Free static-hosting tier *(assumed, unverified that the chosen host's free tier allows this use)*.
- **R-A2.** No custom domain; the host's default subdomain is used.
- **R-A3.** Quarterly content revision at **3 h** each, which is 4 revisions in the year.
- **R-A4.** Bandwidth stays within free-tier limits, because the app is a reference for internal loop designers and has a small audience *(assumed, unverified)*.
- **R-A5.** No change to the infrastructure in ARCHITECTURE.md.

**Aggressive (lean, lowest cost)**
- **A-A1.** Served from an existing internal static host or file share at no added cost *(assumed, unverified)*.
- **A-A2.** No domain.
- **A-A3.** One content revision in the year, at **2 h**. The content is otherwise frozen at the approved research.
- **A-A4.** No change to the infrastructure in ARCHITECTURE.md.

### 12-month projections

| Line item | Conservative | Realistic | Aggressive |
|---|---|---|---|
| Hosting | $240 (C-A1) | $0 (R-A1) | $0 (A-A1) |
| Bandwidth | $0 | $0 (R-A4) | $0 |
| Domain | $15 (C-A2) | $0 | $0 |
| Dependencies / licences | $0 | $0 | $0 |
| **Cash total (12 mo)** | **$255** | **$0** | **$0** |
| Maintenance labour | 48 h (12 × 4 h) | 12 h (4 × 3 h) | 2 h (1 × 2 h) |

**Labour pricing.** Labour is given in hours because no labour rate is stated anywhere in the SPEC or the brief. A human converts hours to cost at their own rate.

**Month-by-month pattern**
- Cash is flat every month. In the conservative case it is $20/month, with the $15 domain paid in month 1. In the other two cases it is $0.
- Labour is lumpy and follows revision events, not calendar months.

### One-time costs (not infrastructure; uncosted)

| Item | Basis | Status |
|---|---|---|
| Builder spend to write the planned files | WORKFLOW.md phases C0–C6 | **Uncosted.** No per-file or per-token rate is in the research or the SPEC. |
| Plan-gate rework | At most 3 requests in total (WORKFLOW.md) | Included in the Builder or Planner budget. Not costed here. |
| Checkpoint re-submissions | Two consecutive failures escalate (WORKFLOW.md) | Uncosted |
| Planning phase | Capped in OVERVIEW.md | Already capped. Not re-costed here. |

### Re-cost triggers

Re-cost this file whenever ARCHITECTURE.md changes. These changes in particular alter the projections:

1. **A host is named.** Replace the C-A1, R-A1 and A-A1 assumptions with that host's quoted price.
2. **A domain is required.** Move the C-A2 cost into the realistic scenario.
3. **Any server, API, database, runtime fetch or new dependency is added.** This would also break STANDARDS S8, S10 and S11. Costing would restart from new line items, and the standards conflict would be escalated first.
4. **The file count changes.** If W1 or W2 is decided against adding the files, there are 41 files instead of 43. Adjust the revision-hour assumptions only if review scope changes materially.
5. **The CSP placement decision (W3) adds a `transformIndexHtml` hook.** This has no cost effect, because it adds no dependency.

### Cap check and escalations (human decision required; not guessed)

- **B1 — No budget cap is stated in OVERVIEW.md.**
  - OVERVIEW.md records the build budget cap as missing and escalated. The rule "escalate if realistic exceeds the cap" therefore cannot be evaluated.
  - **For information only:** the realistic scenario's cash total is $0 plus 12 labour hours. That would sit within any cap of $0 or more for cash, but labour and one-time Builder spend are not covered by any cap.
  - A human must set:
    - **(a)** a 12-month infrastructure cash cap;
    - **(b)** a maintenance-hours allowance;
    - **(c)** a one-time build spend cap.
  - This item is the same as WORKFLOW W4.
- **B2 — All money figures are assumptions with no sourced pricing.** A human should confirm or replace C-A1, C-A2, R-A1 and A-A1 with quoted prices before relying on the conservative total.
- **B3 — The free-tier fit is unverified.** R-A1 and R-A4 depend on the terms of a host that has not been chosen. If no suitable free tier exists, the realistic case moves toward the conservative hosting line, and B1 must be re-checked against whatever cap is set.

## Execute

1. **Write this budget file.** `BUDGET_ANALYSIS.md` (doc) contains the cost drivers, the three named-assumption scenarios, the 12-month projections, the one-time items, the re-cost triggers and escalations B1–B3. This is the only file this specialist writes.
2. **Supply the budget status to the APPROVE BUILD PLAN Details field.** The status to report is: cap unset (B1); realistic case $0 cash and 12 h labour; one-time Builder spend uncosted. This is consumed by the sequence in WORKFLOW.md; no file is written here.
3. **Re-cost on change.** When ARCHITECTURE.md changes, or a human sets the cap or names a host, rewrite `BUDGET_ANALYSIS.md` (doc) in full against the re-cost triggers above.