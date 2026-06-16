# SOVEREIGN Platform — Architecture Reference
**Developer and Agent Reference Document**
Version 2.0 | May 2026 | Incorporates Option C (Unified Shell + Module Apps) Decision

---

## 1. System Overview and Design Goals

SOVEREIGN is a governed agentic platform. Its architecture serves three non-negotiable outcomes:
1. **Integration reliability** — pipeline outputs flow stage to stage without reformatting
2. **Operational efficiency** — shared infrastructure; no product replicates platform services
3. **End-to-end security observability** — the Security Framework monitors every stage

**Approved deployment architecture:** Option C — Unified Shell with Module Applications.
The shell is the platform. The modules are the products. The shell contract is a governance document approved by the Project Principal before any module development begins.

---

## 2. The SOVEREIGN Pipeline

```
FLOWPATH          →  Intelligence Layer  →  CPMI
(Elicit)             (Future Build)         (Govern)
    ↓                                          ↓
Stage 1                                    Stage 3
    ↓                                          ↓
                   AgentOS (Stage 4 — Execute)
                          ↓
              ┌───────────┴───────────┐
           NEXUS                    APEX
         (Stage 6)               (Stage 6)
              └───────────┬───────────┘
                          ↓
                     ARIA Suite
                     (Stage 7 — Comply)
```

Every product's output is the next stage's input. Pipeline breaks require rewrites. Design every component with its pipeline position in mind.

---

## 3. Monorepo Structure — Option C

```
sovereign-monorepo/
│
├── sovereign-shell/                   ← HOST APPLICATION (built first)
│   ├── src/
│   │   ├── auth/                      ← SAML 2.0 / SSO handler
│   │   ├── navigation/                ← Platform nav, module router
│   │   ├── governance/                ← CPMI-VRS status dashboard
│   │   ├── logger-client/             ← Security Framework client
│   │   └── module-loader/             ← Module mount/unmount contract
│   └── shell-contract.ts              ← WHAT THE SHELL EXPORTS (governance doc)
│
├── sovereign-security/                ← SHARED PACKAGE (Python + TS client)
│   ├── sovereign_logger.py
│   ├── sovereign_honeytoken.py
│   ├── sovereign_anomaly.py
│   ├── sovereign_alerts.py
│   └── sovereign_config.yaml
│
├── sovereign-data/                    ← SHARED PACKAGE (TypeScript)
│   └── types/
│       ├── employee.ts                ← Canonical: employee_id, name, org_unit, role,
│       ├── program.ts                 ←            clearance_level, cost_code_assignments
│       ├── cost-code.ts               ← Canonical: cost_code, program_id, labor_category,
│       ├── document.ts                ←            fiscal_year, ceiling
│       └── vendor.ts                  ← These types are law. Never redefine.
│
├── sovereign-api-client/              ← SHARED PACKAGE
│   └── src/
│       ├── cpmi-client.ts             ← CPMI world model REST API client
│       ├── logger-client.ts           ← Security Framework Logger client
│       └── base-client.ts             ← Auth headers, SOVEREIGN metadata
│
├── module-flowpath/                   ← PRODUCT MODULE
│   ├── src/                           ← Bounded React app
│   ├── api/                           ← FLOWPATH-specific backend
│   └── module.config.ts               ← Shell mount contract implementation
│
├── module-cpmi/
├── module-apex/
├── module-nexus/
├── module-agentos/
└── module-aria/                       ← ARC + TRACER + CLEAR as sub-modules
```

### Shell Contract (shell-contract.ts)
The shell exports exactly these to every module. Modules must not reach outside this contract.

```typescript
export interface SovereignShellContext {
  auth: {
    user: SovereignUser;         // employee_id, name, role, clearance_level
    token: string;               // Bearer token for API calls
    signOut: () => void;
  };
  logger: {
    log: (event: SovereignLogEvent) => void;  // Routes to Security Framework
  };
  governance: {
    cpmiStatus: CPMIPortfolioStatus;   // Live from CPMI world model API
    vrsGates: VRSGateStatus[];         // Current gate certification per product
  };
  data: typeof SovereignDataTypes;     // Re-export of sovereign-data package
}

export interface SovereignModuleContract {
  moduleId: string;              // e.g. "module-nexus"
  mountPath: string;             // e.g. "/nexus"
  mount: (ctx: SovereignShellContext, el: HTMLElement) => void;
  unmount: () => void;
}
```

---

## 4. Layer 1 — SOVEREIGN Security Observability Framework (SOF)

Standalone Python library. Every product imports it. No product replicates any part of it.

### 4.1 Logger (`sovereign_logger.py`)
```python
# Required fields on every entry — no exceptions
{
  "timestamp": "ISO-8601",
  "event_type": "APPROVAL_GATE_OPEN | APPROVAL_GATE_CLOSE | HUMAN_DECISION |
                  AGENT_STEP_START | AGENT_STEP_COMPLETE | ANOMALY_DETECTED |
                  GOVERNANCE_GATE_1 | GOVERNANCE_GATE_2 | GOVERNANCE_GATE_3 |
                  GOVERNANCE_GATE_4 | REASONING_STEP_START | REASONING_STEP_COMPLETE |
                  HONEYTOKEN_ACCESS | FALLBACK_ACTIVATED | EXTERNAL_DEPENDENCY_FAILURE",
  "workflow_step_id": "required-on-every-entry",
  "sovereign_tier": "standard | enhanced",
  "product": "NEXUS | CPMI | APEX | FLOWPATH | AGENTOS | ARIA",
  "actor_id": "user or agent identifier",
  "outcome": "...",
  "payload": {},
  "checksum": "SHA-256 of prior entry + current content"
}

# Additional required fields on HUMAN_DECISION events only:
{
  "decision_type": "HUMAN_APPROVAL | HUMAN_OVERRIDE | HUMAN_DENIAL |
                    AUTHORIZATION_APPROVED | AUTHORIZATION_DENIED |
                    TRAVEL_APPROVED | TRAVEL_DENIED | TRAVEL_ESCALATED |
                    LABOR_CORRECTION_APPROVED | LABOR_ESCALATION_INITIATED",
  "actor": "human",
  "actor_name": "Full Name"
}
```

**Stage 2 connection:** Add `SOVEREIGN_LOGGER_ENDPOINT` env var to `sovereign_config.yaml`. No call-site rewrites required in any product.

### 4.2 Honeytoken Manager (`sovereign_honeytoken.py`)
- UUID4 token generation with product and placement metadata
- Placement registry maps token IDs to product locations
- Silent HTTP POST webhook on any access
- Nothing legitimate ever touches a honeytoken — any access is an incident
- P1 alert: immediate routing, no batching

### 4.3 Anomaly Detector (`sovereign_anomaly.py`)
- scikit-learn `IsolationForest` per product — baselines are not shared
- Minimum 100 log entries before activation
- **CPMI tier:** `contamination` parameter multiplied by 0.7 (30% tighter)
- False positive target: <2% in production
- Weekly scheduled retraining + manual trigger
- Fires `ANOMALY_DETECTED` Logger event + Alert Dispatcher call on threshold breach

### 4.4 Alert Dispatcher (`sovereign_alerts.py`)
- **P1 (immediate):** HONEYTOKEN_ACCESS, APPROVAL_GATE_BYPASS, CPMI enhanced tier events
- **P2 (5-minute batch):** All other anomaly events
- Destinations: Slack webhook, Notion API, HTTP endpoint, local file
- 3 retry attempts with exponential backoff

### 4.5 Framework Configuration (`sovereign_config.yaml`)
```yaml
sovereign:
  version: "1.0"
  products:
    - id: CPMI
      tier: enhanced
      anomaly_threshold_multiplier: 0.7
      priority_routing: true
    - id: NEXUS
      tier: standard
    - id: APEX
      tier: standard
    - id: FLOWPATH
      tier: standard
    - id: AGENTOS
      tier: standard
    - id: ARIA
      tier: standard
  alert_destinations:
    slack_webhook: ${SLACK_WEBHOOK_URL}
    notion_database: ${NOTION_DB_ID}
  logger:
    output_path: "./logs/sovereign.jsonl"
    remote_sink: ${SOVEREIGN_LOGGER_ENDPOINT}  # null until Stage 2
```

### 4.6 Product Connector Pattern
```python
# Each product: sovereign_connector.py (thin wrapper)
from sovereign_security import SovereignLogger, HoneytokenManager, AlertDispatcher

logger = SovereignLogger(product_id="NEXUS", tier="standard")

logger.log(
    event_type="HUMAN_DECISION",
    workflow_step_id="nexus-approval-v1-step-3",
    decision_type="HUMAN_APPROVAL",
    actor="human",
    actor_id=user_id,
    payload={"task_id": task_id, "outcome": "approved"}
)
```

---

## 5. Layer 2 — CPMI-VRS Governance Standard

Portfolio-wide AI governance. NIST AI RMF + OMB AI guidance aligned.

### 5.1 The Four Certification Gates

| Gate | Trigger | Evidence | Certifier |
|---|---|---|---|
| Gate 1 — Disclosure | Any AI-enabled output | VRS disclosure record (model, version, limitations, human reviewer) | AI Owner |
| Gate 2 — Audit Trail | Any consequential AI action | Logger chain with `constraintRef` + SP 800-53A tags | Data Steward |
| Gate 3 — Human Oversight | Outputs crossing risk threshold | Signed attestation: reviewer name, date, confidence review | Independent Reviewer |
| Gate 4 — Certification | Pre-production deployment | VRS certificate: scope, expiry, certifying authority | Portfolio Owner |

**ARIA Suite exception:** Gate 1 disclosure record states `model: none` and names the human decision-maker. This is an AI-absence attestation — stronger governance evidence than AI-present systems.

### 5.2 CPMI 6-Step Reasoning Chain
Each step emits Logger events:
```
Step 1: Context       → Load program state, world model, applicable norms
Step 2: Rules         → Apply governing constraints (policy, regulation, CPMI-VRS)
Step 3: Alternatives  → Generate candidate recommendations
Step 4: Assumptions   → Surface assumptions underlying each candidate
Step 5: Confidence    → Score each candidate; flag drift if >15% below session baseline
Step 6: Recommendation → Final recommendation with full lineage trace
```

### 5.3 World Model REST API (required for Stage 3)
```
GET  /v1/world-model/programs/{program_id}
GET  /v1/world-model/norms?applicable_to={program_id}
GET  /v1/world-model/portfolio-status
POST /v1/vrs/certify
GET  /v1/vrs/certificates/{product_id}
```
The Intelligence Layer Compliance Mapper will query this API. Design endpoint schema before building internal data structures.

---

## 6. Layer 3 — AgentOS

### 6.1 Architecture
```
orchestrator.py     ← Central dispatcher; reads catalog.yaml; enforces risk classification
catalog.yaml        ← Data source registry with data_classification field
logger.py           ← SOVEREIGN Logger schema module (Stage 2: add endpoint config)
monitor.py          ← Drift detection; emits ANOMALY_DETECTED events
evaluate.py         ← 4-gate verification chain (not yet run end-to-end)
agents/
  ├── training-agent-constitution.md
  └── data-agent-constitution.md    ← Prohibits ingestion of data_classification: user
pipelines/
  └── proof-of-concept/             ← Architecture validation pipeline (personal project, not part of SOVEREIGN)
```

### 6.2 Risk Classification
```
blocked  → Never executes (classified user data sources)
high     → Requires named human approval before execution
medium   → Queued; approved = re-execute (behavior TBD — must be decided in first SOVEREIGN session)
low      → Executes automatically; logged
```

### 6.3 4-Gate Verification Chain
```
Gate 1: data-quality  → Pandera schema validation
Gate 2: accuracy      → GradientBoostingClassifier vs. baseline
Gate 3: bias          → Subgroup comparison (beginner / intermediate / advanced)
Gate 4: drift         → PSI + KS tests; threshold PSI/KS > 0.10 → retrain alert
```
Gates are binary: they block, they do not warn. A failing gate prevents pipeline promotion.

---

## 7. Product Layer — Six Modules

### 7.1 FLOWPATH
- **Runtime (current):** Single-file React JSX, Claude.ai artifact sandbox
- **Sandbox constraints (non-negotiable):** No localStorage/sessionStorage · No external fetch · No Tailwind bracket syntax · All data constants outside App · CSS keyframes via `document.createElement('style')` with ID guard `fp-css` · All Recharts charts in `<ResponsiveContainer>`
- **Design system:** Identity purple `#6B4FA0` for structural framing only · Semantic: green (complete), amber (warning), red (escalate), blue (info), teal (Lane Owner) · Background stack: `#0D1018` → `#13161F` → `#191D2A` → `#252A3A` · Typography: DM Sans + DM Mono
- **SOVEREIGN connection:** VVR records → CPMI export schema `{step_id, description, inputs, outputs, decision_required, human_role}` · Action Trigger resolutions → `HUMAN_DECISION` Logger events · Agent handoffs → `AGENT_STEP_COMPLETE` with `workflow_step_id`
- **Context window warning:** ~1,350 lines currently. Do not add features before fixing the 5 known issues. If v5.0 adds significant content, extract USERS_INIT and TRIGGERS_INIT to embedded constants.

### 7.2 CPMI
- **Track A:** React artifact, direct Anthropic API (claude-sonnet-4-20250514), `max_tokens: 1000`
- **Track B:** Claude Project + Notion MCP, five linked databases (PROGRAM_DB, NORM_LIBRARY, CONTEXT_GRAPH, VERSION_REGISTRY, VRS_REGISTRY)
- **SOVEREIGN connection:** Every reasoning step → Logger (enhanced tier) · VRS gate completions → Alert Dispatcher (priority) · World model → REST API for IL Compliance Mapper

### 7.3 AgentOS
- See Layer 3 above. AgentOS is infrastructure, not a user-facing module. It appears in the shell navigation as a monitoring/status view only.

### 7.4 NEXUS
- **Stack:** Node.js 20/Express (port 3001) · Python 3.11/FastAPI (port 8001) · React 18/Vite · PostgreSQL 15 + pgvector · AWS ECS Fargate
- **Auth:** GCC High only — `graph.microsoft.us`, `login.microsoftonline.us` · EAMS SAML 2.0 · `validateTenantContext` middleware on all routes
- **Scale:** program or enterprise-scale DAU target · Row-Level Security with GUC tenant isolation
- **Track B pending:** PPTX generation API handlers not yet implemented
- **SOVEREIGN connection:** `APPROVAL_GATE_OPEN/CLOSE` + `HUMAN_DECISION` on every routing event · `decision_type: HUMAN_APPROVAL | HUMAN_OVERRIDE` required

### 7.5 APEX — Program Analytics and Reporting Platform
- **Stack (current):** Single-file HTML · sql.js v4 WebAssembly SQLite · Vanilla JS (~2,100 lines, 53 functions)
- **Stack (production):** PostgreSQL backend · server-side API proxy for Anthropic key · Railway or AWS GovCloud
- **Cross-product dependency:** `sovereignHold(programId, reportType)` checks CPMI portfolio status before any QPR or ABS report renders. When CPMI connects, this function's internals swap to query CPMI REST API — no call-site rewrites.
- **Known-answer tests:** Baseline expected values per report type · `drift_delta > 0.05` → `ANOMALY_DETECTED` · `drift_delta > 0.20` → P1 alert
- **10 modules:** Program Overview · Work Package Manager · Financial Tracker · Document Library · AI Assistant · Audit Log · Reports · Analytics · User Management · Data Architecture (incl. TCO model)

### 7.6 ARIA Suite
- **Runtime (current):** Single-file React JSX, Claude.ai artifact sandbox (same constraints as FLOWPATH)
- **Design:** ARC dark enterprise (`#0D1018` stack) · TRACER + CLEAR light enterprise (`#F4F5F8`) · Shared dark navy nav (`#1E1A3A`)
- **5 architectural constraints (structural, not policy):**
  1. No self-approval — component replacement, not disabled button
  2. AI flags, humans decide — deterministic JS rule evaluation, no model in decision path
  3. Append-only audit — write-only arrays (prototype), append-only tables (production)
  4. Role-gated decisions — analyst can view; PM can decide; structural replacement, not CSS
  5. Policy-as-data — rules in typed JS objects; new rule = new array entry only
- **Known issues (5 — fix before source file changes):**
  1. TRACER tracks selected by array index, not item ID
  2. CLEAR main layout `calc(100vh - 175px)` — fragile
  3. CLEAR decision handler stale reference risk
  4. Purple hex inconsistency: ARC `#6B4FA0` vs TRACER/CLEAR `#4a3f8f` — canonicalize to `#6B4FA0`
  5. ARC has no role toggle — Thomas Nguyen hardcoded

---

## 8. Intelligence Layer — Future Build (Architecture Preserved)

**Position in pipeline:** Between FLOWPATH (Stage 1) and CPMI (Stage 3)
**Status:** Documented, not built. Stage 10 of the delivery schedule produces the IL build plan.

### 8.1 Five Components

| Component | Input Required Now | Source |
|---|---|---|
| Task Decomposition Engine | VVR export schema: `{step_id, description, inputs, outputs, decision_required, human_role}` | FLOWPATH |
| Judgment Detection | `HUMAN_DECISION` events with `decision_type` field — 12+ months of training data | All 6 products |
| Automatability Scorer | `deployment_feedback` block: `{workflow_step_id, step_outcome, agent_id, action_type, failure_reason}` | AgentOS |
| Risk and Failure Modeler | `ANOMALY_DETECTED` events with `workflow_step_id` | Security Framework |
| Compliance Mapper | `classification_level` on every program record · CPMI world model REST API queryable by `program_id` | CPMI + FLOWPATH Domain Translator |

### 8.2 What Every Current Product Must Not Change
- `workflow_step_id` field name — never rename
- `decision_type` field name and taxonomy — never rename
- `deployment_feedback` block structure — never restructure
- `classification_level` field name on program entities — never rename
- VVR export schema field names — frozen

---

## 9. Data Dictionary — Canonical Shared Entities

**These definitions are law. Never redefine in any product.**

| Entity | Canonical Fields |
|---|---|
| Employee | `employee_id`, `name`, `org_unit`, `role`, `clearance_level`, `cost_code_assignments` |
| Program | `program_id`, `name`, `sponsor`, `contract_number`, `classification_level`, `status` |
| Cost Code | `cost_code`, `program_id`, `labor_category`, `fiscal_year`, `ceiling` |
| Document | `document_id`, `title`, `classification_level`, `version`, `created_by`, `program_id`, `created_at` |
| Vendor | `vendor_id`, `name`, `cage_code`, `jurisdiction`, `cleared_status`, `active_contracts` |

---

## 10. API Design Principles

- Every product exposes a REST API — future products consume each other
- Versioned endpoints from day one: `/v1/[resource]`
- Authentication: shell SSO — no product builds its own auth
- All responses include SOVEREIGN metadata:
```json
{
  "sovereign_product": "NEXUS",
  "sovereign_version": "1.0",
  "cpmi_vrs_gate_status": "GATE_2_COMPLETE"
}
```

---

## 11. Error Handling Standard

Three-tier fallback is required for all external dependencies. Build it in the same session as the feature that needs it.

```python
try:
    result = await external_call()
except TimeoutError:
    result = get_cached_result() or get_static_fallback()
    logger.log(event_type="FALLBACK_ACTIVATED",
               workflow_step_id=current_step_id,
               payload={"tier": "cache|static", "reason": "timeout"})
except SpecificAPIError as e:
    logger.log(event_type="EXTERNAL_DEPENDENCY_FAILURE",
               workflow_step_id=current_step_id,
               payload={"error": str(e)})
    raise SovereignServiceError(f"Dependency failure: {e}") from e
```

Required for: Anthropic API · Notion API · any OAuth integration · CPMI world model API calls from APEX.

---

## 12. Required-Before-Production Design Obligations

These four items are not blocking Stage 1 but must be resolved before their respective production stages. They are design obligations tracked in every session context.

### R1 — Human Review Volume Architecture — Required Before Stage 5

NEXUS at program or enterprise-scale volume will generate a volume of AI-assisted decisions that cannot be individually reviewed. A governance model assuming "human reviews all outputs" fails silently at scale — reviewers clear queues to keep operations moving, not because they reviewed each item. This must be designed before Stage 5, not discovered during it.

**Three-tier review architecture required:**
- **Risk tiers:** Define consequence tiers for all NEXUS action categories. Congressional inquiries, SES-level items, and classified correspondence = Tier 3 (individual substantive review). Routine administrative routing = Tier 1 (statistical sampling). Written tier criteria required as a governance record before Stage 5.
- **Statistical sampling methodology:** For Tier 1: define sample rate, quality metrics, review frequency, and the threshold at which degraded sample quality triggers escalation. This is a governance record — not left to reviewer discretion.
- **Automatic escalation thresholds:** Specific signals that trigger mandatory individual review regardless of tier: AI confidence below threshold, novel input type, content matching defined sensitivity patterns, output approaching permission zone boundary.

**Shell architecture implication:** The sovereign-shell must include a review queue component that enforces tier routing. NEXUS cannot build its own queue infrastructure — the platform provides it. This is a Stage 1 shell design requirement.

**Governance obligation:** Before Stage 5, the Project Principal documents: (a) the three tier definitions, (b) statistical sampling methodology, (c) automatic escalation signal list, and (d) the honest percentage of NEXUS outputs that will receive substantive individual review. The answer must be accurate, not aspirational.

---

### R2 — AI Provider Abstraction Layer — Required in Stage 1 Shell Build

CPMI Track A, FLOWPATH agents, and APEX call the Anthropic API directly. No abstraction layer exists. Model deprecation, pricing changes, or availability events cascade to each product independently. For GovCloud production deployment of NEXUS, Anthropic's commercial API (`api.anthropic.com`) is not within the GovCloud boundary — a different LLM infrastructure is required and must be decided before Stage 5 locks the production architecture.

**sovereign-api-client must provide:**
- **Provider abstraction:** Products call the shared client — never a provider API directly. Switching providers requires one config change in `sovereign_config.yaml`, not six product rewrites.
- **Three-tier fallback as platform standard:** APEX's live → cached → static pattern is extracted to the shared package and required for all AI-dependent products. Build in Stage 1 alongside the client.
- **GovCloud endpoint routing:** A separate configuration path for GovCloud deployments routing to an authorized endpoint (self-hosted model, FedRAMP-authorized alternative, or government-provided inference). This must be a first-class design path, not a retrofit.
- **Multi-vendor test harness:** At least one alternative provider (OpenAI, Google Vertex AI) testable under non-crisis conditions before it is ever needed under crisis conditions.

**GovCloud decision required before Stage 5:** Anthropic's commercial API does not hold a FedRAMP authorization at the level required for CUI or classified data. The Project Principal must determine before Stage 5: (a) which LLM provider or self-hosted model is authorized for the CUI tier, (b) whether a separate GovCloud LLM deployment is required, and (c) how this affects the tiered infrastructure design (commercial / CUI / classified) in the Agent Identity Standard.

---

### R3 — Agent Operator Role — Required Before Stage 2

The Agent Operator is the human responsible for managing agent behavior at the portfolio level — reviewing prompts, reviewing outputs at volume, calibrating escalation thresholds, and responding to Security Framework alerts. This is the most critically understaffed role in AI-enabled organizations. SOVEREIGN currently has no named Agent Operator, no defined scope, and no succession procedure.

Stage 2 deploys the Security Framework across all six products. Real P1 and P2 alerts begin routing. The human who receives those alerts and decides what to do is performing Agent Operator functions. If the role is undefined at Stage 2, alerts go unresolved.

**Required before Stage 2:**
- **Agent Operator scope document:** What the Agent Operator does for SOVEREIGN — portfolio-level prompt review cadence, alert response protocol, daily briefing review (AgentOS), behavioral benchmark execution (CPMI), escalation decision authority.
- **Formal role assignment:** The Project Principal currently performs Agent Operator functions informally. Must be formally named, scoped, and documented before Stage 2 alerts go live.
- **Succession procedure:** Who receives alerts if the primary Agent Operator is unavailable? Who can authorize agent isolation? Documented procedure required.
- **Production capacity planning note:** At NEXUS program or enterprise-scale volume, one Agent Operator performing all review functions is not sustainable. The scope document must include a capacity estimate for production scale and the staffing requirement it implies. This feeds the Client Implementation Methodology.

---

### R4 — Federal Client Workforce Transition — Required Before Any Client Pilot

SOVEREIGN designs for the destination — automated, AI-governed federal program operations. Federal clients will spend two to four years in the transition state where agents are running but the organization has not changed. Civil service protections, union agreements, and political constraints on workforce restructuring mean that the transformation path available to private-sector organizations is not available to federal agencies.

Program officers asked to use FLOWPATH to map their workflows are creating documentation that will partially automate their own jobs. This dynamic, if unaddressed, produces resistance that defeats the implementation before it begins.

**Required before any client pilot:**
- **Honest positioning:** Client-facing documentation must not promise transformation at a pace the federal workforce cannot sustain. Two-to-four year transition timeline is realistic. Overpromising creates distrust when the timeline slips.
- **FLOWPATH pilot framing:** Program officers are domain experts whose knowledge is being preserved and leveraged — not participants in their own displacement. This framing is accurate and must be explicit in pilot communications.
- **Review capacity design:** Program office staff are the human reviewers in the governance architecture. Their review capacity is bounded by their existing workload. Risk-stratified review tiers (R1) must be designed with federal program office staffing realities in mind.
- **Middle management transition acknowledgment:** The platform changes where coordination, mentoring, and crisis absorption functions live — it does not eliminate them. Client implementations must name this explicitly.
- **Client Implementation Methodology document:** Before the first client pilot, produce a SOVEREIGN Client Implementation Methodology covering: phased transition sequence, staffing requirements at each phase, program office communication approach, and realistic destination-state timeline. This is a client deliverable.

---

## 15. Panel Review Responses — Governance Documents (May 2026)

Six governance documents were produced in response to the AI Stack Advisory Panel external review. Each addresses a specific architectural or governance question. All are incorporated into Integration Brief v1.3.

### 15.1 SOVEREIGN FedRAMP and Infrastructure Strategy

Defines the three-tier deployment architecture (Tier 1 Commercial, Tier 2 CUI/FedRAMP Moderate, Tier 3 Classified). States FedRAMP Moderate as the Tier 2 target. FedRAMP authorization preparation begins at Stage 5. The Tier 2 LLM provider decision (Anthropic commercial API is not in GovCloud boundary for CUI data) must be resolved before Stage 5. Tier 3 classified deployment architecture is deferred — not yet designed.

**Open architectural decision (must resolve before Stage 5):** Which LLM provider or self-hosted model is authorized for Tier 2 (CUI) data processing? This decision affects the sovereign-api-client configuration and the NEXUS production architecture.

### 15.2 ARIA AI Boundary Scope Statement

Draws the precise boundary of the "no AI in the decision path" claim. At runtime execution, AI is completely absent — verifiable by code inspection, no API calls in ARIA modules. At the design layer, AI assistance in rule drafting is permissible under four documented conditions: human expert validation required before production; disclosure in the change record; the rule object (not the AI draft) is the governed artifact; reasoning chain templates validated against the rules they explain.

### 15.3 SOVEREIGN Federal Records Management Position

Identifies which SOVEREIGN artifacts constitute federal records. Documents the records architecture requirements: retention schedule field additions to the data dictionary, FOIA category mapping, AI draft preservation as separate artifact from sent correspondence, metadata updatability without record alteration. Specifies records management counsel engagement as a pre-federal-production-deployment requirement.

**Data dictionary update required before federal production:** Add `retention_schedule`, `retention_expiry`, and `legal_hold` fields to all record tables. This is a schema addition, not a rewrite.

### 15.4 CPMI Independent Validation Architecture

Defines three validation layers above CPMI's certification function: (1) Gate 3 Human Independent Reviewer — required attestation before high-consequence outputs are acted upon; (2) Behavioral Benchmark Suite — five existing benchmarks plus a sixth Norm Accuracy Benchmark (Stage 3 deliverable) that validates CPMI's application of specific regulatory norms against expert-confirmed ground truth; (3) Shell Governance Dashboard — portfolio-level view of CPMI behavior over time, independent of any individual query.

**Stage 3 deliverable added:** Norm Accuracy Benchmark suite — test cases for each active world model norm, confirmed by human expert review.

### 15.5 APEX Override Mechanism Design

Specifies two override types: Type A (real governance hold — two-person authorization required: Program Manager + Independent Reviewer; report generated with GOVERNANCE_HOLD_ACTIVE watermark) and Type B (system/configuration error — Agent Operator authorization with technical documentation). Two-person rule for Type A is architecturally enforced, not policy-only. Override pattern monitoring in daily briefing detects routine misuse.

### 15.6 ARIA Rule Maintenance Process

Specifies the complete regulatory change detection, update, validation, and deployment workflow for all three ARIA rule sets. Three urgency tiers: Immediate (3 business days), Scheduled (10 days before effective date), Routine (60 days). Annual GSA per diem updates (threshold values only) have a simplified process — complete by October 1 each year. Boundary condition discipline (exact operator, test cases at threshold) required for every numeric threshold update. Regulatory monitoring assigned, scheduled, and produces auditable records in AgentOS daily briefing.

---

## 16. Open Design Work Items — Dedicated Sessions Required

Two items from the panel review require dedicated design sessions. They cannot be resolved through documentation alone. Both are stage-gate requirements — the relevant stages cannot proceed without them.

### OWI-FP-001 — FLOWPATH Elicitation Methodology for Unofficial Process Capture

**What it is:** FLOWPATH's current design specifies a structured elicitation sequence but does not specify methodology for surfacing unofficial process — the workarounds, exceptions that became norms, and informal decision paths that are where real operational knowledge lives. A VVR built from official process descriptions will produce automation that fails on contact with operational reality.

**What the dedicated session must produce:**
- Structured probing techniques for exception and workaround identification
- Agent prompts designed to surface informal decision paths
- VVR schema additions for confidence level and official-vs-observed process divergence
- Facilitator guidance for escalating contradictions between stated and observed process
- Guidance on how VVR consumers (CPMI, Intelligence Layer) should treat lower-confidence records

**Required before:** Stage 8 (FLOWPATH Production Build) and before any real program office pilot.

**Session specification:** One 3–4 hour Claude Chat session. Agent role: System Architect + FLOWPATH Product Specialist. Opens with: FLOWPATH transition package, current VVR schema, this architecture document. Done condition: FLOWPATH Elicitation Methodology Specification produced and approved by Project Principal.

### OWI-INT-001 — Cross-Product Failure Topology Map

**What it is:** A systematic mapping of every input-output dependency across the six-product pipeline with documented failure consequences for each dependency failure. An error introduced at FLOWPATH that propagates through CPMI → AgentOS → NEXUS → APEX → ARIA before producing a visible symptom must be traceable and detectable. This mapping does not yet exist.

**What the dedicated session must produce:**
- Complete dependency map: what each product receives from upstream, what it produces for downstream
- Failure consequence table: for each dependency, what happens downstream when it fails, is wrong, or produces unexpected output
- Cascading misclassification analysis: specific failure paths where an early-stage error compounds through downstream agents
- Detection mechanism specification: how each failure type is detected, by whom, and with what expected latency
- Reconstruction procedure: how a cross-product audit trail trace is performed step by step
- Architectural responses: specific changes to platform design required to address each identified failure mode

**Required before:** Stage 9 (Integration Testing). Stage 9's gate criteria include: cross-product failure topology map exists and has been reviewed by Project Principal.

**Session specification:** One full 4–5 hour Claude Chat session. Agent role: System Architect. Opens with: full six-product transition package, integration architecture, this architecture document. Done condition: Cross-Product Failure Topology Map produced. Note: this session will produce architectural change requirements — build time must be allocated for those changes before Stage 9 begins.


---

## 13. Deployment Architecture

### Development
- Mac mini M4, 24GB RAM
- Docker Compose for service isolation
- MLflow local file-based tracking
- macOS Keychain for secrets (AgentOS)
- macOS launchd for scheduling

### Production Target (NEXUS)
- AWS ECS Fargate, GovCloud us-gov-east-1 or us-gov-west-1
- S3 for document storage
- CloudWatch for operational monitoring
- RDS PostgreSQL 15

### GovCloud Constraints
- Endpoints: `graph.microsoft.us`, `login.microsoftonline.us` only
- No commercial AWS endpoint calls from within GovCloud boundary
- PIV/CAC hardware authentication required in production

### Sovereign AI Compliance Checklist (required before federal deployment)
- [ ] U.S.-jurisdiction data residency documented and contractually enforceable
- [ ] Model provenance documented (training data lineage, licensing, version)
- [ ] FedRAMP-compatible hosting path identified
- [ ] SBOM (Software Bill of Materials) maintained as live registry
  - Required by Executive Order 14028 (May 2021) for all software sold to federal agencies
  - Enables verification of the "no non-U.S. controlled components in decision-critical paths" requirement — without an SBOM, that requirement cannot be checked
  - Built from Session 1 using the End of Session Prompt SBOM step; never reconstructed from memory
  - Minimum fields per entry: package name, version, type (Python/npm/API/service), product(s) using it, date added, purpose, licensing
- [ ] No non-U.S. controlled components in decision-critical paths
- [ ] ATO boundary definition produced before any classified data ingestion
- [ ] ISSO contact documented for each product
- [ ] Retention schedules documented for each product

---

## 13. Known Environment Issues

- **ngrok URL instability:** URLs change between sessions — breaks OAuth flows. Use fixed-domain ngrok or rebuild OAuth state on session start. Do not design features that depend on ngrok URL persistence.
- **LibreOffice in sandboxed environments:** Use `scripts/office/soffice.py` wrapper — bare `soffice` hangs due to AF_UNIX socket restrictions.
- **Claude artifact sandbox:** No localStorage, no external fetch, no Tailwind bracket syntax. See Section 7.1 for full constraint list. These look like bugs — they are architectural facts.
- **MLX/Ollama on M4 24GB:** Known RAM ceiling for large models — verify model fits before committing.
- **AgentOS iCloud Drive path:** Contains spaces — must be pasted exactly, not typed.
- **macOS Terminal:** Needs explicit Privacy & Security permissions on first run.

---
*SOVEREIGN Platform Architecture Reference v2.0 · May 2026*
*Pre-Decisional · Internal Working Document*

---

## 17. Session 1 Build Results — Security Framework Complete (June 2026)

### 17.1 Shell Contract Approved

`shell-contract.ts` v1.0 approved by Project Principal, June 1, 2026. This is the governance document that gates all module development.

**Additions beyond Architecture Section 3 specification:**
- `auth.hasRole()` and `auth.hasClearance()` helper methods — modules enforce role-gated UI without building their own checks
- `governance.isOnHold()` — APEX `sovereignHold()` pattern generalized to platform level
- Three protocol boundary interfaces added to `SovereignShellContext`: `mcp`, `a2a`, `agui`
- `SovereignModuleContract` extended: `agentCards` (every module registers agents at mount), `minimumRole` (shell enforces access), `healthCheck()` (shell governance dashboard polling)
- `ILExposureVerified` type — frozen field checklist documented at type level

**A2A approval behavior resolved:** Platform default `ACKNOWLEDGE_AND_CONTINUE`. CPMI Gate 3 exception: `RE_EXECUTE`. Encoded in CPMI's agent card. Permanent governance record.

**Section 3 in this document (shell-contract.ts sketch) is now superseded by the approved `shell-contract.ts` file.** The approved file is the canonical reference.

### 17.2 Security Framework — All Four Modules Complete

| Module | File | Tests | Key Design Decision |
|---|---|---|---|
| Logger | `sovereign_logger.py` | 41/41 | SHA-256 chain; CPMI enhanced tier enforced architecturally |
| Honeytoken Manager | `sovereign_honeytoken.py` | 24/24 | Last-entry-wins registry; P1 always fires before webhook attempt |
| Anomaly Detector | `sovereign_anomaly.py` | 29/29 | Per-product IsolationForest; CPMI 0.7× contamination; 100-entry minimum |
| Alert Dispatcher | `sovereign_alerts.py` | 33/33 | P1 immediate; P2 5-min batch; context manager drains queue on shutdown |
| Config | `sovereign_config.yaml` | 10/10 checks | All 6 products; all 4 modules pre-structured; env vars use null + comment |
| Package | `__init__.py` | — | `SovereignSecurityFramework` bundle wires all four modules |

**Total: 127 tests, 127 passing, 0 failures.**

### 17.3 Architecture Updates

**Event type taxonomy expanded** — four new Logger event types added to `SovereignEventType`:
- `AGUI_EVENT` — AG-UI protocol events (Stage 2)
- `MCP_TOOL_CALL` — MCP boundary events (Stage 2)
- `A2A_TASK_HANDOFF` — A2A coordination events (Stage 2)
- `A2A_TASK_FAILURE` — A2A partial failure events (Stage 2)

**YAML env var syntax note:** `${VAR}` syntax is NOT supported in YAML without a custom resolver. All env var placeholders in `sovereign_config.yaml` use `null` with a comment naming the env var. Products reading config must not assume `${VAR}` resolves to an environment variable.

**Section 4.5 config example** in this document used `${VAR}` syntax — this was illustrative only and is not the implemented pattern. The actual `sovereign_config.yaml` uses `null` values.

### 17.4 R3 Status Update

**R3 — Agent Operator Role: CLOSED (pending Project Principal approval of scope document)**

`Agent_Operator_Scope_SOVEREIGN.md` v1.0 produced June 1, 2026. Covers:
- Role assignment (Project Principal, temporary)
- Alert response protocol (P1: 30-min acknowledgment, 2-hr triage; P2: 1 business day)
- Prompt review cadence (quarterly full registry; monthly CPMI; immediate on benchmark failure)
- Daily briefing review process with Logger event requirement
- CPMI behavioral benchmark execution schedule
- Escalation authority and succession procedure
- Production capacity planning note (part-time staff minimum at production scale)

Upon Project Principal approval: R3 is fully satisfied and Stage 2 Security Framework deployment may proceed.

### 17.5 R2 Session Split Decision

The original plan placed `sovereign-api-client` (R2) and the shell scaffold in a single session. This was revised — R2 has its own governance obligation (the Tier 2 LLM provider decision) that should not be compressed with the shell build.

**Session 2A (sovereign-api-client)** resolves R2 as follows:
- Builds `sovereign-api-client/` with Anthropic wrapper, three-tier fallback, and GovCloud routing stub
- The Tier 2 provider slot is `UNRESOLVED_PENDING_GOVCLOUD_DECISION` — a named configuration placeholder, not a code gap
- This means switching Tier 2 providers later is a config change, not a rewrite
- R2 is formally documented: what is built, what is deferred, and why the deferral creates no rewrite debt

**Session 2B (shell scaffold)** builds on Session 2A:
- `sovereign-shell/src/shell.ts` implementing full `SovereignShellContext`
- Module loader, navigation chrome, governance dashboard placeholder
- Compiles against approved `shell-contract.ts` — TypeScript enforces the contract

**Architecture Section 14.2** (R2 full specification) is required reading for Session 2A. The session opens with the Tier 2 provider placeholder decision before any code is written.

### 17.6 Remaining Stage 1 Work

Stage 1 remaining work is two sessions (see Section 17.5 for rationale):

**Session 2A:** `sovereign-api-client/` — provider abstraction, three-tier fallback, GovCloud routing stub. R2 formally closed with documented Tier 2 placeholder. Required context: architecture.md Section 14.2, SOVEREIGN_FedRAMP_Infrastructure_Strategy.md.

**Session 2B:** `sovereign-shell/src/shell.ts`, module loader, navigation chrome, CPMI-VRS dashboard placeholder. Shell compiles against approved `shell-contract.ts`.

Stage 2 prerequisites remaining open: R1 (human review volume, before Stage 5), R7 (Tier 2 LLM provider, before Stage 5), R8 (records fields, before federal production), R9 (CPMI Norm Accuracy Benchmark, Stage 3 deliverable).

---

## 18. Session 2B Build Results — Shell Scaffold Complete · Stage 1 Complete (June 2, 2026)

### 18.1 sovereign-shell Built

The host application scaffold is built and compiles strict (`tsc --noEmit`, React 18 + @types/react, 0 errors) against the approved `shell-contract.ts` v1.0.

```
sovereign-shell/
├── shell-contract.ts            ← byte-identical copy of approved v1.0 (canonical home, §3)
├── package.json                 ← React 18.3.1 / TypeScript 5.9.3 / Vite 5.4.21
├── tsconfig.json · tsconfig.node.json · vite.config.ts
└── src/
    ├── shell.ts                 ← composition root — implements SovereignShellContext
    ├── module-loader/index.ts   ← mount/unmount, minimumRole, agentCards, healthCheck polling
    ├── navigation/              ← nav chrome (ShellNavChrome, ModuleNav, Breadcrumb, theme, hook)
    └── governance/              ← CPMI-VRS dashboard placeholder + header isOnHold indicator
```

**Layering principle:** `shell.ts` owns the headless `SovereignShellContext` data; `navigation/` and `governance/` are presentation that READ from the context (never re-implement it); `module-loader/` is machinery. This is why the Stage 3 swap to CPMI's live world-model REST API (§5.3) touches no UI — the dashboard already reads the contract `governance` export.

### 18.2 Key Shell Behaviors (for Stage 2 module authors)

- **Logger boundary validation:** `workflow_step_id` required on every event (throws if missing); `HUMAN_DECISION` requires `decision_type`/`actor:"human"`/`actor_name`; `AGENT_STEP_*` require `agent_id`; `AGENT_STEP_COMPLETE` warns (not throws) if `deployment_feedback` missing. Local append-only buffer is the source of truth; remote sink (`SOVEREIGN_LOGGER_ENDPOINT`) is a Stage 2 config add with no call-site rewrites.
- **Protocol stubs (`_stage: "DEFINED"`):** `mcp.call` throws; `a2a.registerAgent`/`listAgents` are live (advance `_stage` → `CARDS_REGISTERED`); `a2a.invokeAgent`/`getTaskState` throw; `agui.emit`/`subscribe` inert; `agui.humanAction` throws. All are Stage 2 implementations.
- **healthCheck polling:** three-tier fallback (live → cached → static UNAVAILABLE), timeout race, emits `FALLBACK_ACTIVATED`.
- **minimumRole:** fail-closed injectable `RoleAccessPolicy` (default exact-match-or-SYSTEM_ADMIN).

### 18.3 New Open Items (Session 2B)

1. Role→module access matrix — governance artifact to replace the fail-closed default policy (policy injection, not rewrite).
2. Module access-denial taxonomy gap — no `SovereignEventType` for denial; adding one is a contract change.
3. `sovereign-data` package not yet built — `ctx.data.types` is a frozen placeholder; canonical entity types (§9) re-export here when built.
4. esbuild dev-server advisory (GHSA-67mh-4wv8-2f99) — dev-only, deferred to pre-production Vite review.

### 18.4 Stage 1 — COMPLETE

Security Framework (127 tests) + shell-contract v1.0 + sovereign-api-client (143 tests, R2 closed) + sovereign-shell scaffold. R3 closed. **Stage 2 begins in Claude Code.**

---
*Architecture Reference — Session 2B addition · June 2, 2026*
