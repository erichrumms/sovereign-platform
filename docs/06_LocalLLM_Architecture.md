# SOVEREIGN Platform — Local LLM Module Architecture
## Document ID: SOVEREIGN-ARCH-LLM-001 | Version 1.0 — Draft | June 21, 2026

**Classification:** Pre-Decisional · Internal Working Document
**Parent Brief:** SOVEREIGN Platform Integration Brief v1.14
**Status:** Pending Project Principal Approval

**SCOPE:** This document defines the architecture of the SOVEREIGN Local LLM Module — its position in the platform pipeline, its interface with the sovereign-api-client abstraction, its AgentOS host configuration, its Security Framework integration, and the governance constraints under which it operates. It is a pre-decisional architecture reference that must be approved by the Project Principal before any Stage 4 local LLM build work begins.

---

## §1 — Purpose and Scope

The SOVEREIGN Local LLM Module is a governed inference runtime embedded within the SOVEREIGN Platform. It is not a product. It is an infrastructure component that registers as a second provider inside the sovereign-api-client abstraction layer, enabling SOVEREIGN products to perform AI inference within an approved compliance boundary rather than routing to a commercial remote API endpoint.

This document defines what the module is, where it lives, how it connects to every other SOVEREIGN component, and what constraints govern it. It is written to the same documentation standard as all SOVEREIGN transition builds.

| Term | Definition |
|---|---|
| **Local LLM Module** | The inference runtime, model weights, provider registration, and monitoring configuration that together constitute SOVEREIGN's on-premises inference capability. |
| **Inference Provider** | A registered backend within sovereign-api-client. The module adds a second provider alongside the existing Anthropic commercial API provider. |
| **Data Classification Routing** | Logic within sovereign-api-client that selects the inference provider based on the `data_classification` field of the incoming request. |
| **CUI** | Controlled Unclassified Information. Federal data classification requiring processing within an approved boundary. Triggers routing to local inference. |
| **Tier 2 Provider** | The SOVEREIGN term (R7) for the non-commercial inference provider. The Local LLM Module is the Tier 2 provider implementation. |

---

## §2 — Platform Position

### 2.1 Pipeline Position

The Local LLM Module is not a pipeline stage. The SOVEREIGN pipeline runs FLOWPATH → CPMI → AgentOS → NEXUS/APEX → ARIA Suite. The module is infrastructure beneath CPMI, FLOWPATH, and APEX — the three products that currently call the Anthropic API. It provides inference capability to those products without changing their pipeline position, output schema, or downstream dependencies.

```
SOVEREIGN PORTFOLIO PIPELINE
─────────────────────────────────────────────────────────
FLOWPATH ──► CPMI ──► AgentOS ──► NEXUS / APEX ──► ARIA Suite

INFERENCE INFRASTRUCTURE (beneath pipeline — not a stage)
┌──────────────────────────────────────────────────────────┐
│  sovereign-api-client  (routing layer — 143 tests)       │
│     ├── Provider A: Anthropic commercial API (unclassified)│
│     └── Provider B: Local LLM Module  (CUI and above)   │
└──────────────────────────────────────────────────────────┘
         ▲                  ▲                  ▲
       CPMI            FLOWPATH              APEX
  (primary consumer)  (elicitation)       (analytics)
```

### 2.2 Consumer Products and Workloads

| Product | Pipeline Stage | Workload | Classification Trigger | Priority |
|---|---|---|---|---|
| CPMI | Stage 3 | 6-step governance reasoning chain. Structured output schema required. | CUI federal program data | HIGHEST — 0.7× anomaly threshold |
| FLOWPATH | Stage 1 | Workflow elicitation and VVR generation. | CUI program office data | HIGH |
| APEX | Stage 6 | Analytics and report generation (MSR, QPR, ABS, CSC). | CUI program data | HIGH |

### 2.3 What the Module Does Not Do

- Operate as a user-facing product or shell module. No UI. Does not register in the sovereign-shell module loader.
- Maintain its own security, governance, or audit trail system. All telemetry flows through the SOVEREIGN Security Framework.
- Define new shared data entities. Consumes existing shared data dictionary fields without modification.
- Replace the Anthropic commercial API. Both providers coexist. Routing is classification-driven.
- Implement fine-tuning in Stage 4. Initial deployment is inference-only, frozen weights. Fine-tuning deferred pending a separate governance decision.

---

## §3 — Component Architecture

### 3.1 Module Structure

The Local LLM Module has four functional layers: Inference Runtime, Provider Registration, Model Registry, and Monitoring Bridge.

```
LOCAL LLM MODULE — FUNCTIONAL LAYERS
─────────────────────────────────────────────────────────
┌─────────────────────────────────────────────────────────┐
│  LAYER 4 — MONITORING BRIDGE                            │
│  Emits INFERENCE_CALL Logger events. Feeds Anomaly      │
│  Detector. Routes P1/P2/P3 alerts to VIGIL via          │
│  Alert Dispatcher.                                      │
├─────────────────────────────────────────────────────────┤
│  LAYER 3 — MODEL REGISTRY                               │
│  Records model ID, version, SHA-256 hash, CPMI-VRS gate │
│  status. Registered in SBOM. Gate status enforced at    │
│  load time.                                             │
├─────────────────────────────────────────────────────────┤
│  LAYER 2 — PROVIDER REGISTRATION                        │
│  Registers as sovereign-api-client Provider B.          │
│  Receives routed requests when data_classification=CUI+ │
│  Returns responses in sovereign-api-client std schema.  │
├─────────────────────────────────────────────────────────┤
│  LAYER 1 — INFERENCE RUNTIME                            │
│  Dev / prototype: Ollama on Mac Mini M4 (OAI-compat).  │
│  Production:      vLLM on AWS GovCloud GPU instance.    │
│  Model (initial): 13B parameter, Q4/Q5 quantization.   │
└─────────────────────────────────────────────────────────┘
```

### 3.2 sovereign-api-client Integration

Standing Constraint 5: no direct LLM API calls — `createSovereignClient()` only. The Local LLM Module satisfies this constraint by registering as a provider within the existing package. No product touches the local inference endpoint directly. The provider interface contract is symmetric: both providers accept the same request schema and return the same response schema. Product code requires no modification.

```
ROUTING LOGIC — sovereign-api-client (conceptual)
──────────────────────────────────────────────────
createSovereignClient(config)
    │
    ├── request.data_classification === "CUI"?
    │     YES ──► Local LLM Provider B
    │     NO  ──► Anthropic Provider A
    │
    └── Both providers return standard schema:
            { content, model_id, usage, provider, latency_ms }
```

### 3.3 Inference Runtime Configuration

| Environment | Configuration |
|---|---|
| **Development / Prototype** | Ollama on Mac Mini M4. OpenAI-compatible REST API on localhost:11434. Single-user. Model loaded from SBOM-registered local weights file. |
| **Production (Federal)** | vLLM on AWS GovCloud ECS Fargate GPU instance. IAM role-based access. Network allowlist restricts calls to sovereign-api-client callers within the GovCloud VPC. No public exposure. |
| **Model (Initial)** | 13B parameter, Q4/Q5 quantization. Validated against CPMI 6-step reasoning chain output schema before deployment. SHA-256 hash recorded in SBOM at download. |
| **Fallback** | Three-tier: (1) live local inference, (2) cached governance outputs, (3) static governance mode. Fallback activation emits `INFERENCE_FALLBACK` Logger event. |

### 3.4 Model Registry

Every model loaded into the inference runtime must be registered in the SOVEREIGN SBOM before first use.

| Registry Field | Required | Purpose |
|---|---|---|
| `model_id` | Yes | Unique identifier. Format: `org/name:version` |
| `model_sha256` | Yes | SHA-256 hash of weight file. Verified at every load. Mismatch triggers P1 alert, blocks inference. |
| `source_url` | Yes | Verified download source. Documented provenance for NIST AI RMF supply chain requirement. |
| `model_card_url` | Yes | Training data documentation. Supply chain transparency record. |
| `cpmi_vrs_gate_status` | Yes | Gate 1–4 status. Must be PASSED before model loads. Enforced at code level. |
| `sbom_version` | Yes | SBOM version at registration. Links model to SBOM snapshot. |
| `registered_by` | Yes | Project Principal authorization record for this model version. |
| `deployment_environments` | Yes | `dev` \| `govcloud` \| `both`. Controls which runtime instance loads this model. |

---

## §4 — Security Framework Integration

The SOVEREIGN Security Observability Framework (127 Python tests, Stage 1 COMPLETE) is the shared nervous system of the platform. The Local LLM Module does not build its own monitoring — it extends the four existing Framework components to cover inference-layer events.

### 4.1 Logger — New Event Type: INFERENCE_CALL

| Field | Type | Required | Notes |
|---|---|---|---|
| `workflow_step_id` | string | Yes — invariant | Links inference call to workflow context. Standing Constraint 6. |
| `event_type` | enum | Yes | `INFERENCE_CALL` — new type added to GD-4 event taxonomy. |
| `provider` | enum | Yes | `local_llm` \| `anthropic_api`. Identifies serving provider. |
| `model_id` | string | Yes | From Model Registry. Ties output to registered model version. |
| `model_sha256` | string | Yes | Hash at time of call. Proves model not swapped between calls. |
| `input_classification` | enum | Yes | Data classification of input. Must be CUI+ for local routing. |
| `output_schema_valid` | boolean | Yes | True if response conforms to sovereign-api-client schema. |
| `latency_ms` | integer | Yes | Inference latency. Feeds performance drift detection. |
| `decision_type` | enum | Conditional | Required when inference output informs a human decision. Standing Constraint 4. |
| `fallback_tier` | integer | Conditional | 1, 2, or 3. Present only on `INFERENCE_FALLBACK` events. |

### 4.2 Anomaly Detector — Behavioral Drift Detection

- **Output Schema Drift:** Evaluates CPMI reasoning chain outputs against the expected 6-step schema. Deviation rate above threshold triggers `CPMI_DRIFT_DETECTED`. CPMI's 0.7× threshold applies.
- **Latency Drift:** Inference latency tracked against rolling baseline. Sustained increase may indicate model tampering or hardware degradation. Triggers `INFERENCE_PERFORMANCE_ANOMALY`.
- **Known-Answer Benchmark:** Governance scenarios with known correct outputs run at each model load and on schedule. Deviation triggers `INFERENCE_ACCURACY_ANOMALY`.

### 4.3 Honeytoken Manager

Stage 4 scope (inference-only, no fine-tuning): canary inputs deployed in the known-answer benchmark suite. A canary input is a trigger whose expected output is a specific detectable string. Unexpected trigger output indicates model tampering.

### 4.4 Alert Dispatcher — VIGIL Integration

| Event Type | Severity | VIGIL Priority | Trigger Condition |
|---|---|---|---|
| `INFERENCE_ANOMALY` | P1 | Critical — immediate Agent Operator notification | `output_schema_valid = false` from CPMI workload, or known-answer benchmark failure |
| `MODEL_DRIFT_DETECTED` | P1 | Critical | Anomaly Detector drift score exceeds CPMI-tier threshold (0.7×) |
| `MODEL_HASH_MISMATCH` | P1 — CRITICAL | Critical — block inference immediately | SHA-256 verification failure at model load. Inference halted until resolved. |
| `INFERENCE_FALLBACK` | P2 | High | Any fallback tier activation (live → cached or cached → static) |
| `INFERENCE_PERFORMANCE_ANOMALY` | P3 | Medium | Latency drift beyond rolling baseline threshold |

**VIGIL TRIAGE ASSISTANT EXTENSION:** The `vigil-triage-analyst` agent (PR-VIGIL-001, approved June 17, 2026) must be extended with an inference-layer triage checklist covering: confirm `model_sha256` matches SBOM registry; review `output_schema_valid` trend; check whether `CPMI_DRIFT_DETECTED` co-occurred; verify inference host access log. This is a Stage 4 deliverable extending the existing prompt, not a new prompt registration.

---

## §5 — AgentOS Integration

### 5.1 Hosting Role

AgentOS is the MLOps backbone and agent orchestration environment. The Local LLM Module is an AgentOS-hosted component. It does not run independently. Because AgentOS embeds the Security Framework and CPMI-VRS as native modules, the Local LLM Module inherits platform governance context rather than needing to implement it.

**OPEN DECISION — Must be resolved before Stage 4 build begins:** The inference runtime must be classified as either (a) an infrastructure component with no autonomous behavior — SBOM entry only, no `Agent_Identity_Standard.md` entry required — or (b) an autonomous agent making model-loading or fallback-selection decisions — requiring registration in `Agent_Identity_Standard.md` with an assigned `agent_id` and agent class before any build work begins (Standing Constraint 10). If fallback selection is automated without human approval, classification (b) applies. The Project Principal must record this decision as a governance record.

### 5.2 evaluate.py Validation Gate

The Local LLM Module validation sequence runs through `evaluate.py` before any model is promoted to an active inference endpoint. This is the mechanism by which CPMI-VRS gate status is assigned to a model version.

- **Gate 1 — Scope and Boundary:** Model card reviewed. Provenance documented. Intended use cases confirmed. Data classification routing verified.
- **Gate 2 — Transparency:** Model ID, version, SHA-256 recorded in SBOM. Source URL and model card URL verified. SBOM version incremented.
- **Gate 3 — Accuracy Validation:** Known-answer benchmark executed. Output schema compliance verified against CPMI 6-step schema. Norm accuracy within Project Principal-defined threshold.
- **Gate 4 — Monitoring and Drift:** Anomaly Detector baseline established. VIGIL alert routing confirmed. Fallback chain tested. Agent Operator notified of deployment.

A model without gate status = PASSED is refused by the inference runtime at load time. This is a code-level constraint enforced in `evaluate.py`, not a process reminder.

### 5.3 MLflow Integration

Inference call logs, latency metrics, and benchmark scores are tracked as MLflow experiment runs. Each model version is a registered MLflow model linked to its SOVEREIGN SBOM entry.

---

## §6 — CPMI-VRS Governance Application

| Gate | Standard Requirement | Local LLM Module Application |
|---|---|---|
| Gate 1 — Scope & Boundary | Document intended use, data processed, output schema, boundary conditions. | Model card, intended workloads (CPMI / FLOWPATH / APEX), `data_classification = CUI+` only, output schema = sovereign-api-client standard. Documented before first load. |
| Gate 2 — Transparency | Record model identity, training provenance, version control. | Model Registry entry: SHA-256, source URL, model card URL, SBOM version. Every model update is a Gate 2 re-certification event. |
| Gate 3 — Accuracy & Validation | Validate accuracy against intended use cases. | Known-answer benchmark suite for CPMI governance scenarios. Output schema compliance test. Norm accuracy threshold defined by Project Principal before Stage 4. |
| Gate 4 — Monitoring & Drift | Continuous monitoring for behavioral drift. Alert on deviation. | Anomaly Detector behavioral drift detection. VIGIL alert routing. Scheduled benchmark re-runs. Latency baseline tracking via MLflow. |

**ARCHITECTURAL CONSEQUENCE — CPMI Enhanced Monitoring:** CPMI operates at 0.7× the standard anomaly detection threshold — an architectural constant. This threshold applies to all CPMI outputs regardless of which inference provider produced them. Local LLM outputs feeding CPMI's governance chain are evaluated against the 0.7× threshold. This is not a new requirement. It is the existing requirement applied to the new provider.

### 6.1 Model Update Governance

A model update — even a minor version change or quantization adjustment — requires re-certification through all four CPMI-VRS gates before the updated model is promoted to the active endpoint. There is no expedited gate path.

- New version downloaded. SHA-256 recorded. SBOM version incremented.
- `cpmi_vrs_gate_status` set to PENDING for new version.
- `evaluate.py` run. All four gates must pass.
- Project Principal approval recorded as governance record before promotion.
- Previous version retained in SBOM as deprecated — not deleted. Recovery path if new version fails in production.

---

## §7 — Data Handling and Intelligence Layer Exposure

### 7.1 Data Classification Enforcement

The Local LLM Module is the CUI-and-above inference path. The sovereign-api-client routing logic enforces the boundary at the code level. Mislabeled data reaching the wrong provider is a Logger anomaly event, not a silent error.

### 7.2 Intelligence Layer Exposure

| IL Component | Exposure Satisfied By |
|---|---|
| Task Decomposition Engine | `workflow_step_id` on every `INFERENCE_CALL` event links inference activity to workflow context. |
| Judgment Detection | `decision_type` on `INFERENCE_CALL` events that inform human decisions. Same constraint as all other human decision events (Standing Constraint 4). |
| Automatability Scorer | Not applicable — infrastructure component, not a task-level agent step. No `deployment_feedback` required. |
| Risk & Failure Modeler | `INFERENCE_ANOMALY`, `MODEL_DRIFT_DETECTED`, and `INFERENCE_FALLBACK` events feed failure pattern data to the Risk Modeler. |
| Compliance Mapper | CPMI-VRS gate status records for each model version feed the Compliance Mapper's governance coverage analysis. |

---

## §8 — SOVEREIGN Readiness Assessment

| Criterion | Status | Notes |
|---|---|---|
| No rewrite debt for Security Framework, CPMI-VRS, or AgentOS connection | SATISFIED BY DESIGN | Provider registration, Logger events, and CPMI-VRS gate sequence defined before build begins. |
| Shared entity compliance with SOVEREIGN data dictionary | SATISFIED BY DESIGN | Module introduces no new shared entities. |
| Logger schema compliance — `workflow_step_id` on every event, `decision_type` on human decision events | PENDING | `INFERENCE_CALL` schema defined in §4.1. Validated by test suite in Stage 4. |
| Intelligence Layer exposure requirements satisfied for all five IL components | SATISFIED BY DESIGN | See §7.2. No new fields required from products. |
| All known issues resolved | N/A — no prior sessions | Five open decisions must be resolved before build begins. |

### 8.1 Decisions Required Before Stage 4 Build

| ID | Decision | Blocking |
|---|---|---|
| D1 | Agent classification: infrastructure component or registered agent? | Agent registry update / Stage 4 kickoff |
| D2 | Tier 2 provider selection: which model, which engine, which quantization? | Stage 4 kickoff |
| D3 | Deployment target: Mac Mini M4, GovCloud, or hybrid by environment? | Stage 4 kickoff / ATO preparation |
| D4 | Fine-tuning in scope for Stage 4, or inference-only with fine-tuning deferred? | Stage 4 scope definition |
| D5 | Agent Operator Scope document updated with local model alert response SLA? | Before live inference activation |

### 8.2 Open Items Carried Forward

- `evaluate.py` must be run end-to-end against synthetic data before any model is loaded into the active inference endpoint. First action of the Stage 4 AgentOS session.
- VIGIL Triage Assistant (PR-VIGIL-001) must be extended with inference-layer triage checklist before live alert feed activation.
- Known-answer benchmark suite must be authored before Gate 3 can execute. Must cover all three consumer workloads: CPMI governance chain, FLOWPATH elicitation, APEX analytics.
- MLflow cloud deployment: file-based local tracking appropriate for Stage 4. Production MLflow deployment addressed before Stage 5.

---

## §9 — Build Sequencing and Stage Placement

| Stage | LLM Module Work | Dependency |
|---|---|---|
| Stage 1 (COMPLETE) | Confirm sovereign-api-client provider interface accommodates a second provider without modification. One-session design review. No new code. | None |
| Stage 4 | Primary build stage: inference runtime deployed, Provider B registered, Model Registry built, `INFERENCE_CALL` Logger event added, Anomaly Detector extended, all five D-decisions resolved and recorded. | All five D-decisions resolved before kickoff. `evaluate.py` run first session. |
| Stage 5+ | Consumer products use local LLM for CUI workloads via sovereign-api-client. No product-level code changes. Configuration only. ATO packages updated. | Stage 4 complete. |
| Stage 10 (Intelligence Layer) | Fine-tuning capability (if approved at D4) uses accumulated Logger corpus. IL training data validation includes inference log review. | 12+ months of inference logs accumulated. |

**STAGE 4 DONE CONDITION:** Model passes all four CPMI-VRS gates via `evaluate.py`. `INFERENCE_CALL` Logger event passes schema validation. Anomaly Detector baseline established with CPMI-tier threshold calibrated. VIGIL alert routing confirmed for all five new event types. Agent Operator notified of deployment. All five D-decisions recorded as governance records. sovereign-api-client Provider B routes correctly on `data_classification: CUI` test cases.

---

*SOVEREIGN Platform · SOVEREIGN-ARCH-LLM-001 · v1.0 · June 21, 2026*
*Pre-Decisional · Internal Working Document · Pending Project Principal Approval*
