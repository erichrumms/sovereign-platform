# SOVEREIGN Platform
**Governed Agentic Runtime with Integrated Security, Intelligence, and Oversight Networks**

> Version 1.1 — Stage 1 Security Framework Complete · June 2026
> Build Plan: SOVEREIGN Platform Build Plan v2.0
> Governance Document: SOVEREIGN Platform Integration Brief v1.3
> Classification: Pre-Decisional · Internal Working Document

---

## What Is SOVEREIGN?

SOVEREIGN is a unified, AI-enabled back-office operations platform for enterprise and federal government business operations. Six integrated products provide a reliable, secure, and governable platform for the full lifecycle of federal program work — from workflow mapping through task execution, reporting, and compliance adjudication.

Every product occupies a defined position in a shared pipeline, produces outputs consumable by the next stage without reformatting, and relies on shared infrastructure rather than building its own.

**Three non-negotiable design outcomes every build decision must serve:**
- **Integration reliability** — every product's outputs are the next stage's inputs
- **Operational efficiency** — no product replicates infrastructure the platform provides
- **End-to-end security observability** — the shared Security Framework monitors the entire pipeline

**Approved deployment architecture: Option C — Unified Shell with Module Applications.**
One platform. Six product modules. One shell. Unified user experience, independent deployment cadences, single ATO boundary.

---

## Who Is It For?

| Audience | How They Use SOVEREIGN |
|---|---|
| Federal program managers | Task management, correspondence, program analytics and reporting |
| Operations leaders | Pipeline visibility, AI-assisted decisions, compliance posture |
| Compliance officers | ARIA Suite adjudicates authorization, travel, and timecard and labor charging compliance |
| AI governance leads | CPMI governs all AI; issues CPMI-VRS certificates to every product |
| IT administrators | Single shell, single ATO boundary, M365 GCC High integration |
| Developers / AI agents | AgentOS orchestrates MLOps on governed infrastructure |

---

## The Six Products

### FLOWPATH — Workflow Mapping and Elicitation (Pipeline Stage 1)
Six-agent AI system that maps how work actually flows inside an organization. Produces machine-readable Validated Workflow Records (VVRs) — the origin point of the entire SOVEREIGN pipeline.

- **Stack:** Single-file React JSX (prototype); React SPA on AWS GovCloud (production target)
- **Data classification:** CUI-Personnel
- **Status:** Transition build complete. Open condition: `cpmi_vrs_disclosure` field must be added to VVR schema.

### CPMI — AI Governance Engine (Pipeline Stage 3)
The governance engine for the entire portfolio. Issues CPMI-VRS certificates to all six products. Operates under **enhanced monitoring tier** (0.7× anomaly threshold) — integrity is a platform-wide dependency.

- **Reasoning chain:** Context → Rules → Alternatives → Assumptions → Confidence → Recommendation
- **Two tracks:** Track A (Anthropic claude-sonnet-4) · Track B (Notion MCP backend)
- **Status:** Transition build complete. World model REST API not yet deployed.

### AgentOS — MLOps and Agent Orchestration (Pipeline Stage 4)
The platform layer beneath the suite. Not user-facing. Hosts the SOVEREIGN Security Framework and CPMI-VRS as native modules.

- **12 registered actions** at four risk levels: low / medium / high / blocked
- **4-gate verification:** data-quality → accuracy → bias → drift
- **Status:** Transition build complete. `evaluate.py` not yet run end-to-end.

### NEXUS — Task and Correspondence Management (Pipeline Stage 6)
Enterprise task and correspondence management system for federal agencies and corporate organizations.

- **Stack:** Node.js 20/Express · React 18/Vite · PostgreSQL 15 + pgvector · AWS ECS Fargate GovCloud
- **Auth:** EAMS SAML 2.0 / PIV-CAC · M365 GCC High only
- **Status:** Track A complete. Track B API handlers pending. Governance record incomplete.

### APEX — Program Analytics and Reporting Platform (Pipeline Stage 6)
Program analytics and reporting platform for federal and corporate program portfolios.

- **Stack:** Single-file HTML / sql.js v4 (prototype); PostgreSQL (production)
- **Status:** Transition build complete. sql.js persistence validation needed.

### ARIA Suite — Authorization, Travel, and Timecard and Labor Charging Compliance (Pipeline Stage 7)
Three modules under one owner. **Deliberately excludes AI from all decision paths.** Generates AI-absence attestations.

| Module | Version | Purpose |
|---|---|---|
| ARC | v1.0 | Authorization lifecycle; AUDIT_HOLD at anomaly score ≥ 0.75 |
| TRACER | v2.0 | Travel compliance; expandable reasoning chains; role-gated decisions |
| CLEAR | v1.0 | Timecard and labor charging compliance; recurrence escalation at 3+ occurrences |

- **Status:** Documentation-only transition session. Five known issues carry forward unresolved.

---

## Approved Architecture — Option C: Unified Shell with Module Applications

```
sovereign-monorepo/
├── sovereign-shell/       ← Auth, navigation, Logger client, CPMI-VRS dashboard
├── sovereign-security/    ← Security Framework (shared package) ✅ COMPLETE
├── sovereign-data/        ← Canonical SOVEREIGN entity types (shared package)
├── sovereign-api-client/  ← Shared API client with provider abstraction layer
├── module-flowpath/
├── module-cpmi/
├── module-apex/
├── module-nexus/
├── module-agentos/
└── module-aria/           ← ARC + TRACER + CLEAR
```

**ATO boundary:** The shell — all modules inherit the shell's authority (one SSP, one AO review).
**Shell contract:** `shell-contract.ts` v1.0 approved June 1, 2026 — governance document for all module development.

---

## Stage 1 Status — Security Framework

| Component | Status | Tests |
|---|---|---|
| `shell-contract.ts` | ✅ Approved governance document | — |
| `sovereign_logger.py` | ✅ Complete | 41/41 |
| `sovereign_honeytoken.py` | ✅ Complete | 24/24 |
| `sovereign_anomaly.py` | ✅ Complete | 29/29 |
| `sovereign_alerts.py` | ✅ Complete | 33/33 |
| `sovereign_config.yaml` | ✅ Complete | 10/10 |
| `__init__.py` (package) | ✅ Complete | — |
| Agent Operator Scope Document | ✅ Produced — pending approval | — |
| Shell implementation | ⏳ Next session | — |

**Total: 127 tests passing, 0 failing.**

---

## The Intelligence Layer — Seventh Product (Future Build — NEVER LOSE THIS)

Every current product is already exposing the exact fields the Intelligence Layer will consume. No rewrite required when it is built.

| Component | Consumes | Primary Source |
|---|---|---|
| Task Decomposition Engine | `workflow_step_id` chains; VVR export schema | FLOWPATH |
| Judgment Detection | `decision_type` events; human decision log | All products |
| Automatability Scorer | `deployment_feedback` on AGENT_STEP_COMPLETE | AgentOS + NEXUS |
| Risk & Failure Modeler | ANOMALY_DETECTED events; chain breaks | Security Framework |
| Compliance Mapper | CPMI-VRS gate records; ARIA adjudications | CPMI + ARIA |

---

## Current Status Summary

| Product | Stage | Status | Blocker |
|---|---|---|---|
| FLOWPATH | 1 | Ready with Conditions | Gate 1 VVR field |
| CPMI | 3 | Ready with Conditions | World model API |
| AgentOS | 4 | Ready with Conditions | evaluate.py not run |
| NEXUS | 6 | Ready with Conditions | Track B handlers |
| APEX | 6 | Ready with Conditions | Persistence validation |
| ARIA Suite | 7 | Ready with Conditions | 5 known issues |
| Security Framework | 1 | ✅ COMPLETE | Shell implementation remaining |

**Next milestone:** Shell implementation (Stage 1 completion) + Stage 2 Security Framework deployment.

---

## Document Guide

### Core Development Documents

**README.md** — This file. Platform overview, product summaries, architecture, current status, document guide.

**architecture.md** — Developer and agent reference. Monorepo structure, shared entity types, Logger schema, Security Framework modules, shell contract, IL exposure requirements, required-before-production gaps, open design work items.

**system_prompt.md** — AI agent operating instructions. Standing constraints, design decisions, session protocol.

**PROJECT_SUMMARY.md** — Full project history. Strategic decisions, problems resolved, lessons learned, risks, schedule.

**project_plan.html** — Visual delivery plan. 10-stage schedule, milestone gates, prerequisites, required-before-production panel.

### Governance Decision Records

**Decision_Matrix.md** — Zone 1/2/3 assignments for all six products. Approved `decision_type` taxonomy. IL training data specification.

**Prompt_Registry_Specification.md** — Monorepo prompt directory structure, CHANGELOG format, change management process, v1.0 baseline prompts, five CPMI behavioral benchmarks.

**Agent_Identity_Standard.md** — 22 named agents across six products. `agent_id` and `agent_class` fields. Credential lifecycle. Anomaly response process.

**Agent_Operator_Scope_SOVEREIGN.md** — Agent Operator role definition. Alert response protocol. Prompt review cadence. Daily briefing review. Benchmark execution. Escalation authority. Succession procedure. *(NEW — Session 1)*

### Architecture and Compliance Governance

**SOVEREIGN_FedRAMP_Infrastructure_Strategy.md** — Three-tier deployment architecture. FedRAMP Moderate target. SBOM requirement under EO 14028.

**SOVEREIGN_Federal_Records_Management_Position.md** — Federal records identification. Records architecture requirements. Records management counsel prerequisite.

**ARIA_AI_Boundary_Scope.md** — AI-free execution layer vs. permissible design-layer assistance. Customer-facing statement.

**CPMI_Independent_Validation_Architecture.md** — Three validation layers above CPMI certification. Norm Accuracy Benchmark as Stage 3 deliverable.

**APEX_Override_Mechanism_Design.md** — Type A (real hold) and Type B (system error) override processes. Five misuse protections.

**ARIA_Rule_Maintenance_Process.md** — Regulatory change detection. Update workflow. Three urgency tiers. Annual GSA per diem subprocess.

### Strategic and Planning Documents

**SOVEREIGN_Strategic_Gap_Analysis.docx** — Gap analysis against AI-Enabled Organization framework. Three blocking gaps (closed). Four R-gaps. Two OWIs.

**SOVEREIGN_Delivery_Strategy.docx** — Option C recommendation. 10-stage schedule. 1,320–1,420 hour effort estimate.

**Panel_Response.md** — Structured response to AI Stack Advisory Panel. Nine questions. Two open work items (OWI-FP-001, OWI-INT-001).

**AGENT_BACKGROUND_AND_LESSONS_LEARNED.md** — Written to the AI agent. Why major choices were made. Patterns that work. Anti-patterns to avoid.

### Session Operations Documents

**End_of_Session_Prompt.md** — Paste at end of every session. Produces all governance documents + session handoff + SBOM update.

**VISUAL_DESIGN_SUMMARY.md** — UI/UX design systems for all products and shell. Stable — do not change without Project Principal awareness.

**BOTTOMS_UP_DESCRIPTION.md** — Technical reference. Frameworks, build processes, extension patterns.

---

## Installation

> All data is currently SYNTHETIC. No real federal data has entered any product.

### Prerequisites
- Node.js 20 LTS+
- Python 3.10+
- PostgreSQL 15 (production deployments)
- Anthropic API key with claude-sonnet-4 access (CPMI, FLOWPATH, APEX)

### Security Framework (Python)
```bash
cd sovereign-security
pip install pyyaml requests scikit-learn numpy joblib structlog pytest --break-system-packages
python -m pytest tests/ -v
```

### Environment Variables
```bash
ANTHROPIC_API_KEY=your_key_here
DATABASE_URL=postgresql://user:pass@host:5432/sovereign
SOVEREIGN_LOGGER_ENDPOINT=          # Stage 2 — remote Logger sink
HONEYTOKEN_WEBHOOK_URL=             # Stage 2 — honeytoken alert webhook
SLACK_WEBHOOK_URL=                  # Stage 2 — alert Slack destination
```

---

*SOVEREIGN Platform · Pre-Decisional · Internal Working Document*
