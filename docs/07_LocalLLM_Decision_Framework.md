# SOVEREIGN Platform — Local LLM Integration: Decision Framework
## Document ID: SOVEREIGN-LLM-001 | Version 1.0 — Draft | June 20, 2026

**Classification:** Pre-Decisional · Internal Working Document
**Prepared For:** SOVEREIGN Platform — Project Principal
**Status:** Awaiting Decision

**PURPOSE:** This document articulates the full decision space for incorporating a local large language model (LLM) into the SOVEREIGN Platform. It is organized across five distinct perspectives — architectural, compliance, operational, security, and strategic — followed by a comprehensive risk assessment and security assessment. This document does not contain build instructions. It is a pre-decisional analysis to be completed, reviewed, and resolved by the Project Principal before any build decision is recorded.

---

## Executive Summary

The SOVEREIGN Platform currently calls the Anthropic commercial API from three products — CPMI, FLOWPATH, and APEX — via the sovereign-api-client abstraction layer. This works correctly for unclassified and prototype workloads. It does not work for federal deployments handling Controlled Unclassified Information (CUI) because Anthropic's commercial API endpoints are not within any GovCloud or on-premises compliance boundary.

A local LLM resolves this constraint. It is not a new product. It is a registered inference provider inside the sovereign-api-client abstraction that already exists. When data classification requires it, the client routes to the local provider instead of the remote one. Products call the same interface they call today. Nothing at the call site changes.

| Perspective | Primary Concern | Core Finding |
|---|---|---|
| **Architectural** | Integration into existing pipeline | Fits cleanly as a sovereign-api-client provider. Zero call-site rewrites. Must be registered in AgentOS agent registry. |
| **Compliance** | FedRAMP / CUI boundary | Required before any real federal data enters CPMI, FLOWPATH, or APEX. Tier 2 provider decision must precede Stage 5. |
| **Operational** | Performance and maintainability | Significant infrastructure burden. Hardware, model lifecycle, and drift monitoring are ongoing costs, not one-time decisions. |
| **Security** | Threat surface expansion | Adds a new threat surface: model integrity, prompt injection at inference layer, supply chain risk for model weights. Mitigations are designable. |
| **Strategic** | Market and positioning | Enables the "sovereign AI" claim SOVEREIGN's name and market positioning are built on. Without it, the claim is conditional. |

**BOTTOM LINE:** A local LLM is not optional for federal production deployment. It is the architectural answer to a named, blocking risk. The decision is not whether to incorporate one but when, in which configuration, and under what governance controls.

---

## Perspective 1 — Architectural

### Where a Local LLM Lives in SOVEREIGN

The local LLM is an infrastructure component that sits beneath the products that call it. The sovereign-api-client package — already built with 143 tests — is the correct home. Standing Constraint 5 is explicit: no direct LLM API calls; `createSovereignClient()` only. The local LLM becomes a second registered provider within that client. The routing logic is data-classification-driven: commercial API for unclassified workloads, local inference for CUI and above.

| Component | Role |
|---|---|
| **sovereign-api-client** | Abstraction layer — routes calls by `data_classification`. Already built. Needs provider registration. |
| **AgentOS** | Host environment for local inference runtime. Security Framework and CPMI-VRS embed here as native modules. |
| **CPMI** | Highest-priority consumer. Enhanced monitoring (0.7× threshold) means local model outputs require the same anomaly detection as remote outputs. |
| **FLOWPATH / APEX** | Secondary consumers. Elicitation and analytics workloads. |
| **Intelligence Layer (future)** | Local model training corpus is a future IL input. Inference logs from local model calls are the same Logger schema as remote calls — no IL exposure gap. |

### Pipeline Position Consequence

Because CPMI is the governance engine for the entire portfolio, local LLM outputs flowing through CPMI's 6-step reasoning chain carry the same platform-wide dependency that all CPMI outputs carry. If the local model's reasoning quality degrades, CPMI's governance outputs degrade, and every downstream product relying on those outputs is simultaneously affected.

### Call-Site Compatibility

No product rewrites are required. The sovereign-api-client interface does not change. What changes is that provider registration inside the client gains a second entry, and the routing function gains a classification check. This is consistent with Standing Constraint 3: connections are configuration changes, not rewrites.

### AgentOS Registration Requirement

Every agent in SOVEREIGN must be registered before build. The local inference runtime — if it operates with any autonomous behavior, such as model-loading decisions or fallback selection — requires an entry in `Agent_Identity_Standard.md` with an assigned agent class and a registered agent ID. This classification decision must be made and recorded before the local model is deployed.

### Shell Contract Implications

The shell contract (v1.3, unchanged through Sessions 3–9) is a governance document. The local LLM does not require a shell contract change if correctly scoped as a sovereign-api-client provider. It would require a shell contract change only if it were surfaced as a module interface visible to other modules — which it should not be.

**ARCHITECTURAL DECISION REQUIRED:** The Project Principal must formally classify the local inference runtime as (a) an infrastructure component with no autonomous behavior, or (b) an agent requiring registration in `Agent_Identity_Standard.md`.

---

## Perspective 2 — Compliance

### The Federal Data Boundary Requirement

Federal deployments handling CUI data operate under data-handling requirements that commercial cloud API endpoints cannot satisfy by default. The Anthropic commercial API is not FedRAMP-authorized for CUI. A local LLM running within an approved GovCloud boundary or on approved on-premises infrastructure satisfies the boundary requirement that the commercial API cannot.

### CPMI-VRS Governance Application

The CPMI-VRS AI Governance Standard applies to all six products and, by extension, to the inference infrastructure those products depend on. A local LLM does not bypass CPMI-VRS governance — it operates under it:

- **Gate 1 (Scope and Boundary):** The local model's intended use must be documented.
- **Gate 2 (Transparency):** Model selection must be recorded and version-controlled. A model update is a change event under CPMI-VRS.
- **Gate 3 (Accuracy and Validation):** The Norm Accuracy Benchmark must include local model accuracy validation.
- **Gate 4 (Monitoring and Drift):** Ongoing monitoring is a Gate 4 requirement. This is where the Security Framework's anomaly detection applies at the inference layer.

### NIST AI RMF Alignment

Under NIST AI RMF, a local LLM is a "third-party AI component" from the perspective of the SOVEREIGN platform. Third-party AI components require documented provenance, supply chain risk assessment, ongoing drift monitoring, and explainability documentation. None of these requirements are novel — they are what CPMI-VRS was designed to satisfy.

### The ATO Consequence

Adding a local LLM to the SOVEREIGN Platform changes the ATO boundary. The local LLM decision must precede ATO package finalization for any product that uses it.

### Deployment Target Options

| Approach | Description and Implication |
|---|---|
| **FedRAMP-Authorized Cloud Hosting** | Run the local LLM inside AWS GovCloud ECS. Inference endpoint is within the same GovCloud boundary as NEXUS production. Hardware managed by AWS. Lower operational burden. |
| **On-Premises Mac Mini M4** | Run on the existing Mac Mini M4 documented as the AgentOS local deployment target. No cloud dependency. Maximum data sovereignty. Hardware burden fully owned. |
| **Hybrid (Both)** | Local for development and prototype; GovCloud for production. Highest operational complexity but cleanest boundary for each environment. Consistent with how the rest of the platform is architected. |

**COMPLIANCE DECISION REQUIRED:** The Project Principal must determine the local LLM production deployment target before Stage 5. R7 in the Integration Brief formally tracks this gap.

---

## Perspective 3 — Operational

### The Real Cost of Running Your Own Inference

A local LLM is not a SaaS subscription. It is infrastructure that must be selected, deployed, maintained, monitored, updated, and eventually replaced.

### Model Selection

| Model Size | Operational Characteristics for SOVEREIGN Workloads |
|---|---|
| **7B parameters** | Fits comfortably in Mac Mini M4 memory. Fast inference. Higher risk of format drift in structured governance outputs. |
| **13B parameters** | Fits in Mac Mini M4 with quantization (Q4/Q5). Better structured output compliance. Practical starting point for CPMI workloads. |
| **34B+ parameters** | Requires GovCloud GPU instance. Highest governance output quality. Not appropriate for current local development environment. |

### Inference Engine Selection

- **Ollama:** Best fit for the current stage. Single binary, runs on macOS, exposes an OpenAI-compatible API. Model version tracking via Modelfile is human-readable and version-controllable. **Recommended for Mac Mini M4 development.**
- **vLLM:** Production-grade serving for GPU-backed GovCloud deployment. More operationally complex. **Recommended for GovCloud production.**
- **llama.cpp:** Maximum performance control. For a single-developer project at current scale, the operational overhead is not justified.

### Model Lifecycle Management

Every model version must have a recorded SHA-256 hash in the SBOM. Model updates must go through a validation gate before promotion to the inference endpoint. The `evaluate.py` script in AgentOS is the natural home for local model validation gates.

### The Fine-Tuning Question

A local model fine-tuned on SOVEREIGN's own operational data would produce more accurate governance outputs than a general-purpose model. However, fine-tuning changes the model, which is a CPMI-VRS change event. The LoRA fine-tuning pipeline, if implemented, must go through the same CPMI-VRS Gate sequence as any other model change.

**OPERATIONAL DECISION REQUIRED:** The Project Principal must decide whether the local LLM deployment includes a fine-tuning capability or is limited to inference only (frozen weights) for Stage 4.

---

## Perspective 4 — Security

### New Attack Surfaces vs. Removed Attack Surfaces

| Dimension | Analysis |
|---|---|
| **REMOVED: Network interception of API calls** | Data no longer travels over the internet to a remote endpoint for CUI workloads. |
| **REMOVED: Third-party data handling** | Anthropic's data handling policies no longer apply to CUI data. Data does not leave the compliance boundary. |
| **ADDED: Model weight integrity** | The model file itself becomes an attack surface. A tampered weight file is a new threat vector with no analog in the remote API model. |
| **ADDED: Prompt injection at inference layer** | Direct access to the inference runtime opens a layer of prompt injection that a managed API's safety filtering might block. |
| **ADDED: Infrastructure access to inference host** | The machine running inference has access to the model weights, inference logs, and data being processed. |
| **CHANGED: Monitoring responsibility** | Anthropic monitors their infrastructure. With a local LLM, SOVEREIGN owns inference-layer monitoring. |

### CPMI Integrity Consequence

A compromised local LLM feeding CPMI is a mechanism for silently corrupting governance outputs across all six products simultaneously. The anomaly detection logic must be calibrated to catch model-level drift, not just individual output anomalies.

### Supply Chain Risk for Model Weights

Mitigations include: downloading only from verified, signed sources with documented provenance; computing and recording SHA-256 hashes at download and at each load; preferring models from organizations with published model cards; maintaining an air-gapped copy of approved model weights.

---

## Perspective 5 — Strategic

### What "Sovereign AI" Requires

When a federal program office evaluates sovereign AI claims, they are asking three questions:

- Does our data leave our control? (Data sovereignty)
- Can we explain what the AI did and why? (Explainability and auditability)
- Can we continue to operate if the vendor disappears? (Independence and continuity)

A platform that calls a commercial API for its inference cannot answer the first question affirmatively for CUI data. A platform with a local LLM running within the approved boundary can. This is the difference between a product that can be deployed in a CUI environment and one that cannot.

### The Intelligence Layer Connection

The Intelligence Layer is SOVEREIGN's seventh product and the highest-value future asset in the portfolio. A local LLM that is generating inference logs within the SOVEREIGN Logger schema is contributing to that corpus from day one of production operation. A local model fine-tuned on SOVEREIGN's own governance decisions becomes a domain-specific asset that improves over time and that no competitor can replicate — because it was trained on data that only SOVEREIGN has.

**STRATEGIC FRAMING:** The local LLM is the architectural component that makes SOVEREIGN's sovereign AI positioning credible in a federal procurement context. Without it, SOVEREIGN is a well-governed platform that still depends on a commercial API for its most sensitive computations. This is not a feature. It is the foundation of the product's market position.

---

## Section 6 — Comprehensive Risk Assessment

### 6.1 Governance and Compliance Risks

| Risk ID | Risk Description | Score | Mitigation |
|---|---|---|---|
| LLM-GC-01 | CUI data processed by unapproved inference endpoint. | CRITICAL | Enforce `data_classification` routing in sovereign-api-client. Audit log every routing decision. |
| LLM-GC-02 | Model version change not recorded in SBOM. CPMI-VRS Gate 2 violation. | HIGH | All model versions registered in SBOM. Model updates are SBOM change events. |
| LLM-GC-03 | ATO boundary incomplete — local LLM not documented in ATO package. | HIGH | Local LLM decision must precede ATO package finalization. |
| LLM-GC-04 | CPMI-VRS Gates not applied to local model outputs. Governance blind spot. | CRITICAL | CPMI-VRS applies to all inference outputs regardless of provider. |
| LLM-GC-05 | Fine-tuned model update bypasses Gate sequence, alters governance behavior silently. | CRITICAL | Fine-tuned model updates require full Gate sequence before promotion. Enforce via `evaluate.py`. |

### 6.2 Technical and Integration Risks

| Risk ID | Risk Description | Score | Mitigation |
|---|---|---|---|
| LLM-TI-01 | Local model output format drift breaks CPMI's 6-step reasoning chain schema. | CRITICAL | Output schema validation at sovereign-api-client layer. Schema deviation triggers `CPMI_DRIFT_DETECTED`. |
| LLM-TI-02 | Mac Mini M4 insufficient for model size required for governance-quality outputs. | HIGH | Benchmark CPMI reasoning workloads against candidate models before hardware commitment. |
| LLM-TI-03 | Routing logic introduces latency that breaks pipeline timing assumptions. | MEDIUM | Benchmark routing overhead. Three-tier fallback (local → cached → static). |
| LLM-TI-04 | `evaluate.py` never run end-to-end; validation gates untested when local model is added. | HIGH | Run `evaluate.py` against synthetic data in first AgentOS session before local model integration. |

### 6.3 Operational Risks

| Risk ID | Risk Description | Score | Mitigation |
|---|---|---|---|
| LLM-OP-01 | Model updates introduce behavioral drift without detection. CPMI produces degraded outputs. | CRITICAL | Known-answer drift detection applied to local model outputs. VIGIL alert on drift. |
| LLM-OP-02 | Infrastructure burden exceeds single-developer capacity. | HIGH | Phase local LLM capability: inference only in Stage 4, fine-tuning deferred until team capacity supports it. |
| LLM-OP-03 | Local model unavailable blocks CUI-classified CPMI calls. | HIGH | Three-tier fallback: live local inference → cached governance outputs → static governance mode. |
| LLM-OP-04 | No defined process for responding to local model P1 alerts from VIGIL. | HIGH | Agent Operator Scope document must include local model alert response procedure before Stage 4 deployment. |

### 6.4 Strategic Risks

| Risk ID | Risk Description | Score | Mitigation |
|---|---|---|---|
| LLM-ST-01 | Delay in local LLM deployment delays CUI-capable production. First federal client blocked. | CRITICAL | Treat local LLM as Stage 4 deliverable, not post-Stage 5 addition. |
| LLM-ST-02 | Sovereign AI positioning challenged if local inference is not fully implemented. | HIGH | Complete local LLM integration before federal pilot discussions begin. |
| LLM-ST-03 | Intelligence Layer training corpus delayed by late local LLM deployment. | HIGH | Every month of inference operation is a month of Logger training data. Earlier deployment = richer IL corpus. |

**CRITICAL RISKS (Immediate Action Required):** LLM-GC-01 (CUI boundary violation), LLM-GC-04 (governance blind spot), LLM-GC-05 (fine-tuning gate bypass), LLM-TI-01 (CPMI output schema drift), LLM-OP-01 (behavioral drift without detection), LLM-ST-01 (first client deployment blocked).

---

## Section 7 — Comprehensive Security Assessment

### 7.1 Threat Model

| Threat Actor | Motivation and Capability |
|---|---|
| **Nation-state adversary** | Highest capability. Would target model supply chain, inference host access, or training data poisoning. |
| **Insider threat (privileged user)** | Access to inference host. Could exfiltrate model weights, tamper with inference logs, or inject manipulated inputs. |
| **Opportunistic attacker** | Seeks exposed services. If inference endpoint is inadvertently exposed on network, standard exploitation techniques apply. |
| **Adversarial program office actor** | Motivated to manipulate governance outputs. Would attempt prompt injection through FLOWPATH inputs. |
| **Model weight supply chain actor** | Compromises model distribution platform. Inserts adversarial weights that behave normally on standard benchmarks but produce specific outputs under trigger conditions. |

### 7.2 Threat Vectors and Control Mapping

**Vector 1: Model Weight Tampering**
- Control 1.1: SHA-256 hash recorded in SBOM at download. Verified at every model load. Mismatch triggers P1 alert and blocks inference.
- Control 1.2: Weight files stored in read-only filesystem mount. Write access requires authorized change event.
- Control 1.3: Air-gapped backup copy of approved weights maintained separately.
- Control 1.4: Model provenance documented in CPMI-VRS Gate 1 record.

**Vector 2: Prompt Injection at Inference Layer**
- Control 2.1: Input sanitization at sovereign-api-client layer before inputs reach the inference runtime.
- Control 2.2: CPMI's 6-step reasoning chain output validated against schema at the api-client response layer.
- Control 2.3: Reasoning chain audit logs preserved in Logger. Anomaly Detector applies known-answer drift detection.
- Control 2.4: CPMI enhanced monitoring threshold (0.7×) detects injection-induced output anomalies earlier.

**Vector 3: Inference Host Compromise**
- Control 3.1: Inference host is a dedicated system, SOVEREIGN-only workloads, minimal installed software.
- Control 3.2: Network access to inference endpoint restricted to sovereign-api-client callers only.
- Control 3.3: Inference host access logged. Unauthorized access attempt triggers Security Framework alert.
- Control 3.4: GovCloud deployment uses IAM role-based access with least-privilege principle.

**Vector 4: Training Data Poisoning (If Fine-Tuning Is In Scope)**
- Control 4.1: Fine-tuning data sourced from Logger records only via authorized, audited export process.
- Control 4.2: Honeytoken Manager deploys canary records in training data.
- Control 4.3: Fine-tuned model must pass Norm Accuracy Benchmark before promotion.
- Control 4.4: Training data export is a CPMI-VRS Gate 2 event. Documented, authorized, timestamped.

**Vector 5: Inference Log Tampering**
- Control 5.1: Logger is append-only by architectural constraint. No delete or update operations on Logger records.
- Control 5.2: Logger records signed or hashed at write time.
- Control 5.3: VIGIL alert-response audit trail covers inference-related alerts.

### 7.3 Security Controls Summary — Implementation Priority

| Control ID | Control | Priority | Stage |
|---|---|---|---|
| SEC-01 | SHA-256 weight hash verification at load | CRITICAL | Stage 4 |
| SEC-02 | Read-only filesystem for model weights | CRITICAL | Stage 4 |
| SEC-03 | Inference endpoint network allowlist | CRITICAL | Stage 4 |
| SEC-04 | sovereign-api-client input sanitization layer | HIGH | Stage 4 |
| SEC-05 | CPMI output schema validation at response layer | CRITICAL | Stage 4 |
| SEC-06 | Logger `INFERENCE_CALL` event type with full schema | CRITICAL | Stage 4 |
| SEC-07 | Anomaly Detector behavioral drift calibration | HIGH | Stage 4 |
| SEC-08 | VIGIL `INFERENCE_ANOMALY` and `MODEL_DRIFT` events | HIGH | Stage 4 |
| SEC-09 | Honeytoken in training data corpus | MEDIUM | Stage 4 (if fine-tuning) |
| SEC-10 | Agent Operator alert response SLA for model P1 events | HIGH | Before Stage 4 |
| SEC-11 | Air-gapped approved weight backup | MEDIUM | Stage 4 |
| SEC-12 | Append-only Logger enforcement for inference records | CRITICAL | Stage 1 (existing) / verify Stage 4 |

### 7.4 Residual Exposure

- **Residual 1 — Novel model behavior:** A model can produce outputs technically within schema but semantically incorrect. Mitigation: Human-in-the-loop review for high-stakes governance outputs.
- **Residual 2 — Zero-day supply chain compromise:** A nation-state actor with cryptographic capability could produce a tampered model with a valid hash. Mitigation: Air-gapped weights provide recovery capability.
- **Residual 3 — Sophisticated prompt injection:** Novel attacks may evade both drift detection and known-answer benchmark testing.
- **Residual 4 — Single Agent Operator:** The Project Principal is currently the only assigned Agent Operator. Must be resolved before first client pilot.

**SECURITY POSTURE ASSESSMENT:** The local LLM security architecture is designable to an acceptable residual exposure level using controls consistent with SOVEREIGN's existing Security Framework design. No new security infrastructure is required — the Logger, Honeytoken Manager, Anomaly Detector, and VIGIL are already built or in progress. What is required is extension of their event taxonomies and detection thresholds to cover inference-layer events.

---

## Section 8 — Decision Framework and Recommended Sequencing

### 8.1 Decisions Required Before Any Build Work Begins

| Decision | Required Before |
|---|---|
| **D1: Inference runtime classification — infrastructure component or registered agent?** | Agent registry update / Stage 4 kickoff |
| **D2: Tier 2 LLM provider selection — which model, which engine, which quantization?** | Stage 4 kickoff (R7) |
| **D3: Deployment target — Mac Mini M4, GovCloud, or hybrid by environment?** | Stage 4 kickoff (ATO implications) |
| **D4: Fine-tuning in scope for Stage 4, or inference-only with fine-tuning deferred?** | Stage 4 scope definition |
| **D5: Agent Operator Scope document updated to include local model alert response SLA?** | Stage 4 deployment (before live inference) |

### 8.2 Recommended Build Sequencing

- **Stage 4 (AgentOS embedding):** Primary integration stage. Local LLM registered as sovereign-api-client provider. Security Framework extended with inference-layer event types. `evaluate.py` validation gates tested. All five decisions above resolved and recorded.
- **Stage 5+ (product production builds):** Products consuming the local LLM via sovereign-api-client for CUI workloads. No product-level changes required beyond configuration.
- **Stage 10 (Intelligence Layer):** Fine-tuning of local model on accumulated SOVEREIGN Logger corpus, if in scope.

### 8.3 What This Document Is Not

This document is a pre-decisional analysis. It is not a build specification, a task assignment, or an authorization to begin development. The Project Principal's approval of the five decisions listed in Section 8.1, recorded as governance records consistent with SOVEREIGN's session protocol, is the action this document is designed to support.

---

*SOVEREIGN Platform · SOVEREIGN-LLM-001 · Version 1.0 · June 20, 2026*
*Pre-Decisional · Internal Working Document · Awaiting Project Principal Decision*
