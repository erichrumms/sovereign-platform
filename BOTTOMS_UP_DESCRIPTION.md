# SOVEREIGN Platform — Bottom-Up Technical Description
**Framework, Components, Build, Deploy, and Runtime Reference**
Version 2.0 | May 2026

---

## 1. Frameworks and Languages

| Layer | Language | Framework / Runtime | Version |
|---|---|---|---|
| Shell + modules (frontend) | TypeScript | React | 18 |
| Shell bundler | TypeScript | Vite | 5+ |
| NEXUS API | JavaScript | Node.js + Express | 20 LTS / 4.x |
| NEXUS AI microservice | Python | FastAPI | 0.100+ |
| Security Framework | Python | stdlib + scikit-learn + structlog | 3.10+ |
| AgentOS orchestrator | Python | Custom orchestrator | 3.10+ |
| FLOWPATH (current prototype) | JavaScript | React JSX (single-file, no build) | 18 |
| ARIA Suite (current prototype) | JavaScript | React JSX (single-file, no build) | 18 |
| CPMI Track A (current prototype) | JavaScript | React JSX (single-file, no build) | 18 |
| APEX (current prototype) | JavaScript | Vanilla JS + sql.js | ES2020 |
| Database | SQL | PostgreSQL | 15 |
| Prototype persistence | JavaScript | sql.js (WebAssembly SQLite) | 4.x |
| MLOps | Python | scikit-learn + MLflow | 1.x / 2.x |

---

## 2. Monorepo Structure (Option C Target)

```
sovereign-monorepo/
│
├── package.json                    ← Monorepo root (npm workspaces)
├── tsconfig.base.json              ← Shared TypeScript config
├── .env.example                    ← All required environment variables
│
├── sovereign-shell/                ← HOST APPLICATION
│   ├── src/
│   │   ├── main.tsx                ← Entry point; mounts App
│   │   ├── App.tsx                 ← Root router, module loader
│   │   ├── auth/
│   │   │   └── SamlProvider.tsx    ← EAMS SAML 2.0 handler
│   │   ├── navigation/
│   │   │   └── PlatformNav.tsx     ← Shell navigation bar
│   │   ├── governance/
│   │   │   └── VRSDashboard.tsx    ← CPMI-VRS status for all 6 products
│   │   ├── logger/
│   │   │   └── LoggerClient.ts     ← Calls sovereign-security Logger
│   │   └── shell-contract.ts       ← WHAT THE SHELL EXPORTS ← GOVERNANCE DOC
│   ├── index.html
│   └── vite.config.ts
│
├── sovereign-security/             ← SHARED PYTHON PACKAGE
│   ├── __init__.py
│   ├── sovereign_logger.py         ← SHA-256 hash chaining, append-only JSONL
│   ├── sovereign_honeytoken.py     ← UUID4 tokens, silent webhook alerts
│   ├── sovereign_anomaly.py        ← IsolationForest per product
│   ├── sovereign_alerts.py         ← P1/P2 routing to Slack/Notion/HTTP
│   ├── sovereign_config.yaml       ← Per-product tier, alert destinations
│   └── requirements.txt            ← structlog, scikit-learn, joblib, requests, pyyaml
│
├── sovereign-data/                 ← SHARED TYPESCRIPT PACKAGE
│   ├── types/
│   │   ├── employee.ts             ← employee_id, name, org_unit, role,
│   │   │                              clearance_level, cost_code_assignments
│   │   ├── program.ts              ← program_id, name, sponsor, contract_number,
│   │   │                              classification_level, status
│   │   ├── cost-code.ts            ← cost_code, program_id, labor_category,
│   │   │                              fiscal_year, ceiling
│   │   ├── document.ts             ← document_id, title, classification_level,
│   │   │                              version, created_by, program_id, created_at
│   │   └── vendor.ts               ← vendor_id, name, cage_code, jurisdiction,
│   │                                  cleared_status, active_contracts
│   └── index.ts
│
├── sovereign-api-client/           ← SHARED TYPESCRIPT PACKAGE
│   ├── src/
│   │   ├── base-client.ts          ← Auth headers, SOVEREIGN metadata injection
│   │   ├── cpmi-client.ts          ← World model REST API: GET /v1/world-model/...
│   │   └── logger-client.ts        ← Logger endpoint client
│   └── index.ts
│
├── module-flowpath/                ← PRODUCT MODULE
│   ├── src/
│   │   └── App.tsx (or App.jsx)    ← Single-file prototype promoted to module
│   ├── api/                        ← If FLOWPATH needs a backend
│   └── module.config.ts            ← Implements SovereignModuleContract
│
├── module-cpmi/
│   ├── src/
│   │   ├── TrackA/                 ← Claude API reasoning interface
│   │   └── TrackB/                 ← Notion MCP interface
│   └── api/
│       └── world-model/            ← REST API: GET /v1/world-model/...
│
├── module-apex/
├── module-nexus/
│   ├── src/                        ← React 18/Vite frontend
│   └── api/                        ← Node.js 20/Express (port 3001)
│       └── python-service/         ← FastAPI (port 8001)
│
├── module-agentos/
│   ├── orchestrator.py
│   ├── catalog.yaml
│   ├── logger.py
│   ├── monitor.py
│   ├── evaluate.py
│   └── agents/
│       ├── training-agent-constitution.md
│       └── data-agent-constitution.md
│
└── module-aria/
    ├── arc/                        ← ARC module
    ├── tracer/                     ← TRACER module
    └── clear/                      ← CLEAR module
```

---

## 3. Core Components and Their Responsibilities

### 3.1 Shell — `sovereign-shell`

| Component | Responsibility |
|---|---|
| `shell-contract.ts` | Defines and exports the SovereignShellContext and SovereignModuleContract interfaces. This file is a governance document — changes require Project Principal approval. |
| `SamlProvider.tsx` | Handles EAMS SAML 2.0 authentication. GCC High endpoints only. Exposes `user` and `token` to all modules via context. |
| `PlatformNav.tsx` | Top-level navigation. Module links, user identity, CPMI-VRS status indicator. Never re-implemented in any module. |
| `VRSDashboard.tsx` | Reads CPMI-VRS gate status for all 6 products from the CPMI world model API. Displayed in shell header. |
| `LoggerClient.ts` | TypeScript wrapper around the Python sovereign_logger. Sends Logger events from frontend actions to the Security Framework endpoint. |
| `module-loader/` | Lazy-loads module bundles by route. Mounts/unmounts modules by calling their `SovereignModuleContract` interface. |

### 3.2 Security Framework — `sovereign-security`

| Component | File | Responsibility |
|---|---|---|
| Logger | `sovereign_logger.py` | Append-only JSONL events with SHA-256 hash chaining. `workflow_step_id` required on every entry. |
| Honeytoken Manager | `sovereign_honeytoken.py` | UUID4 token generation, placement registry, silent webhook alert on any access. |
| Anomaly Detector | `sovereign_anomaly.py` | IsolationForest per product. CPMI at 0.7× threshold. Fires ANOMALY_DETECTED on breach. |
| Alert Dispatcher | `sovereign_alerts.py` | P1 immediate / P2 five-minute batch routing. Slack + Notion + HTTP + local file destinations. |
| Config | `sovereign_config.yaml` | Per-product tier, monitoring parameters, alert destinations, Logger endpoint. |

### 3.3 FLOWPATH — `module-flowpath`

| Component | Responsibility |
|---|---|
| Six-Agent System | Coordinator · Interviewers (×2–4) · Mapper · Validator · Analyzer · Domain Translator |
| Domain Translator | Standing review layer at every inter-agent handoff. Preserves domain-specific vocabulary. Architectural pattern candidate for platform elevation. |
| VVR Records | Validated Workflow Records with embedded CPMI export schema. Primary input to Intelligence Layer Task Decomposition Engine. |
| Action Triggers | Three types: bottleneck_ticket · signoff_record · recommendation_task. Each generates `HUMAN_DECISION` Logger event with `decision_type`. |
| RBAC | 4 roles · 10 users · interactive role reassignment with ConfirmBar confirmation |
| 11 Modules | Dashboard · Access Control · Action Triggers · Domain Translator Showcase · Engagements · Workflow Maps · Interviews · Agent Status · VVR Records · Domain Profiles · Analytics |

### 3.4 CPMI — `module-cpmi`

| Component | Responsibility |
|---|---|
| Track A Reasoning Engine | 6-step chain (Context → Rules → Alternatives → Assumptions → Confidence → Recommendation). Each step emits Logger event (enhanced tier). |
| Track B Notion Backend | Five linked databases: PROGRAM_DB, NORM_LIBRARY, CONTEXT_GRAPH, VERSION_REGISTRY, VRS_REGISTRY |
| World Model REST API | `GET /v1/world-model/programs/{id}` · `GET /v1/world-model/norms` · `GET /v1/world-model/portfolio-status` · `POST /v1/vrs/certify` |
| VRS Certification Engine | Issues four-gate certificates. Enhanced monitoring tier — all outputs are platform-wide dependencies. |
| Drift Detection | Three conditions trigger drift detection. Fires REASONING_DRIFT_DETECTED Logger event if confidence drops >15% from session baseline. |

### 3.5 AgentOS — `module-agentos`

| Component | File | Responsibility |
|---|---|---|
| Orchestrator | `orchestrator.py` | Central dispatcher. Reads catalog.yaml. Enforces risk classification. Routes to agents. |
| Catalog | `catalog.yaml` | Data source registry. `data_classification` field on every source. Sources tagged `user` refused by orchestrator. |
| Logger | `logger.py` | SOVEREIGN Logger schema module. Stage 2: add endpoint config parameter. |
| Monitor | `monitor.py` | PSI + KS drift detection. Fires ANOMALY_DETECTED on PSI/KS > 0.10. |
| Evaluator | `evaluate.py` | 4-gate verification chain. Gates block — they do not warn. |
| Training Agent Constitution | `training-agent-constitution.md` | Rules governing the training agent's behavior. |
| Data Agent Constitution | `data-agent-constitution.md` | Rules governing the data agent. Explicit prohibition on ingesting `data_classification: user` sources. |

### 3.6 NEXUS — `module-nexus`

| Component | Responsibility |
|---|---|
| Track A API | Task routing, AI classification, correspondence management. Complete. |
| Track B API | PPTX/document generation handlers. **Not yet implemented.** |
| PostgreSQL schema | Row-Level Security with GUC tenant isolation. `validateTenantContext` middleware on all routes. |
| Python FastAPI service | Port 8001. AI classification microservice. |
| SAML middleware | EAMS SAML 2.0 with GCC High endpoints only. |

### 3.7 APEX — `module-apex`

| Component | Responsibility |
|---|---|
| 10 Modules | Program Overview · Work Package Manager · Financial Tracker · Document Library · AI Assistant · Audit Log · Reports · Analytics · User Management · Data Architecture |
| `sovereignLog()` | Sole audit write path. External emission pathway documented as stub — wiring is a configuration connection. |
| `sovereignHold()` | Structural gate before any QPR or ABS report. Swaps to CPMI REST API call when CPMI connects. |
| `cpmiWorldModelQuery()` | CPMI integration stub with stable signature. Internals replace when CPMI connects. |
| Known-answer tests | `D.knownAnswerTests` — baseline expected values per report type. Drift triggers `ANOMALY_DETECTED`. |
| TCO model | Module 10 fifth tab. Three deployment tiers: local ($0/mo) · Railway (~$20/mo) · AWS GovCloud (~$8,400/mo). |

### 3.8 ARIA Suite — `module-aria`

| Component | Module | Responsibility |
|---|---|---|
| Rules Engine | All three | Pure function evaluation of typed rule objects. No AI in evaluation path. |
| `checkSelfApproval()` | All three | Returns boolean; caller replaces decision UI with architectural notice if true. |
| Anomaly Score Bar | ARC | Continuous 0.00–1.00 with three zones. Fires AUDIT_HOLD at ≥ 0.75. |
| Reasoning Chain | TRACER | Expandable rule dots with `rule.reasoning(actual, triggered)` plain-English output. |
| Recurrence Detection | CLEAR | Rolling 6-period window counter. 3+ occurrences → Recurring Error Escalation template. |
| Email Generator | TRACER, CLEAR | Generates typed email objects (not sent — PM reviews before sending). |
| Audit Log | All three | Write-only array (prototype). Append-only table (production). Structural immutability notice in UI. |

---

## 4. Key Processes

### 4.1 Build Process (Target — Monorepo)
```bash
# Install all workspace dependencies
npm install

# Build shared packages first (dependency order matters)
npm run build --workspace=sovereign-data
npm run build --workspace=sovereign-api-client
npm run build --workspace=sovereign-security  # Python wheel

# Build shell
npm run build --workspace=sovereign-shell

# Build modules (can be parallel)
npm run build --workspace=module-nexus
npm run build --workspace=module-flowpath
# ... etc.

# Dev server (shell + all modules hot-reloaded)
npm run dev --workspace=sovereign-shell
```

### 4.2 Security Framework Installation (Stage 2)
```bash
# In each product's virtual environment or requirements.txt:
pip install sovereign-security --break-system-packages

# In each product's sovereign_connector.py:
from sovereign_security import SovereignLogger
logger = SovereignLogger(product_id="NEXUS", tier="standard")
```

### 4.3 AgentOS Pipeline Execution
```bash
# Standard run
python orchestrator.py

# Run evaluation chain only
python evaluate.py

# Trigger model retraining
python monitor.py --retrain
```

### 4.4 NEXUS Full Stack
```bash
# Start API (port 3001)
cd module-nexus/api && npm start

# Start Python microservice (port 8001)
cd module-nexus/api/python-service && uvicorn main:app --port 8001

# Start frontend dev server
cd module-nexus/src && npm run dev
```

### 4.5 Single-File Prototype Execution (FLOWPATH, ARIA, CPMI Track A, APEX)
```
1. Open the .html file in a Chromium-based browser
2. For AI products: enter Anthropic API key in the key input field when prompted
3. For ARIA Suite: no API key required
4. All state is in-memory React — refreshing the page resets state (prototype limitation)
```

---

## 5. Configuration Mechanisms and Environment Variables

### 5.1 Required Environment Variables

```bash
# ── AI ──────────────────────────────────────────────────────────
ANTHROPIC_API_KEY=                # claude-sonnet-4 access. Never store in code.

# ── Database ─────────────────────────────────────────────────────
DATABASE_URL=postgresql://user:pass@host:5432/sovereign

# ── NEXUS ────────────────────────────────────────────────────────
PORT=3001                          # Express API port
PYTHON_API_PORT=8001               # FastAPI microservice port
SAML_IDP_METADATA_URL=             # EAMS SAML 2.0 IDP metadata URL
SAML_SP_ENTITY_ID=                 # NEXUS service provider entity ID
NODE_ENV=production

# ── AgentOS ──────────────────────────────────────────────────────
AGENTOS_DATA_DIR=/path/to/data     # iCloud Drive path (paste, don't type — spaces)
MLFLOW_TRACKING_URI=file:///path/to/mlflow

# ── SOVEREIGN Security Framework ─────────────────────────────────
SLACK_WEBHOOK_URL=                 # Alert destination
NOTION_DB_ID=                      # Notion alert database
SOVEREIGN_LOGGER_ENDPOINT=         # null until Stage 2 deployment

# ── CPMI ─────────────────────────────────────────────────────────
NOTION_API_KEY=                    # Track B Notion MCP
CPMI_WORLD_MODEL_URL=              # REST API base URL (after Stage 3)
```

### 5.2 sovereign_config.yaml — Key Settings
```yaml
sovereign:
  version: "1.0"
  products:
    - id: CPMI
      tier: enhanced                           # 0.7× anomaly threshold
      anomaly_threshold_multiplier: 0.7
      priority_routing: true                   # No batching for CPMI events
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
  alert_tiers:
    P1:
      events: [HONEYTOKEN_ACCESS, APPROVAL_GATE_BYPASS]
      delivery: immediate
    P2:
      events: [ANOMALY_DETECTED]
      delivery: batch_5min
```

### 5.3 catalog.yaml (AgentOS) — Key Settings
```yaml
data_sources:
  - id: program_office_data
    type: csv
    path: ${AGENTOS_DATA_DIR}/programs/
    data_classification: business-client    # Program management data
    enabled: false                          # Enabled when Program Office Suite pipeline activates
  - id: user_profile_data
    type: json
    path: ${AGENTOS_DATA_DIR}/users/
    data_classification: user               # PII — blocked by orchestrator
    enabled: false                          # Explicitly disabled
pipelines:
  - id: program-office-suite
    data_source: program_office_data
    model: GradientBoostingClassifier
    mlflow_experiment: program_office_suite
```

---

## 6. Plugins, Extensions, and Add-on Mechanisms

### 6.1 Shell Module Registration
New products are added to SOVEREIGN by:
1. Creating a new `module-[product]/` directory in the monorepo
2. Implementing `SovereignModuleContract` in `module.config.ts`
3. Registering the module route in `sovereign-shell/src/App.tsx`
4. Requesting a CPMI-VRS gate evaluation for the new module

No other products require changes when a new module is added.

### 6.2 Security Framework — Adding a Product
1. Add product entry to `sovereign_config.yaml`
2. Add `sovereign_connector.py` to the product's codebase
3. Run Stage 2 integration validation for that product

### 6.3 ARIA — Adding Policy Rules
Policy-as-data pattern. New rules are configuration, not engineering:
```javascript
// In ROUTING_RULES / POLICY_RULES / DETECTION_RULES arrays:
{
  id: "RULE-011",
  label: "New rule label",
  field: "totalCost",
  condition: ">",
  value: 5000,
  escalateTo: "Senior Management",
  ref: "Policy §X.Y",
  reasoning: (actual, triggered) =>
    `Cost of $${actual.toLocaleString()} exceeds $5,000 threshold per §X.Y. ` +
    `Senior Management authorization required.`
}
```

### 6.4 AgentOS — Adding a Pipeline
1. Add data source entry to `catalog.yaml` with `data_classification` field
2. Create pipeline configuration section
3. Create agent constitution document (use `training-agent-constitution.md` as template)
4. Extend `orchestrator.py` to recognize new pipeline actions
5. Run `evaluate.py` — expect gate failures on first run (correct behavior)

---
*SOVEREIGN Platform Bottom-Up Technical Description v2.0 · May 2026*
*Pre-Decisional · Internal Working Document*
