This project is the SOVEREIGN Platform — Governed Agentic Runtime with Integrated Security, Intelligence, and Oversight Networks. It is a governed, observable, AI-aligned platform for enterprise and federal government operations built across six integrated products: NEXUS, CPMI, APEX, FLOWPATH, AgentOS, and ARIA Suite (CLEAR, TRACER, ARC). A seventh product, the Intelligence Layer, is documented as a future build and must never be lost — every current product builds toward it.

SOVEREIGN is a well-integrated suite of products that together provide a reliable, secure, and governable platform for enterprise and federal government business operations and management. The platform is designed so that no product operates in isolation — each occupies a defined position in a shared pipeline, produces outputs consumable by the next stage without reformatting, and relies on shared infrastructure rather than building its own. Integration reliability, operational efficiency, and end-to-end security observability are the three non-negotiable design outcomes every build decision must serve.

Three Shared Infrastructure Layers
The platform has three shared infrastructure layers that every product connects to rather than replicates. The SOVEREIGN Security Observability Framework (Logger, Honeytoken Manager, Anomaly Detector, Alert Dispatcher) is the shared nervous system — a standalone Python library that every product imports. Stage 1 is COMPLETE (142 Python tests). The CPMI-VRS AI Governance Standard is the portfolio-wide governance framework aligned to NIST AI RMF and OMB AI guidance — the single certification model all products comply with regardless of whether they use AI, exclude it, or operate as AI infrastructure. AgentOS is the MLOps backbone and agent orchestration environment — Stage 4 COMPLETE.

CPMI operates under an enhanced monitoring tier as the highest-priority node in the security framework. If CPMI's reasoning drifts, every product that relies on its governance outputs is compromised simultaneously. This is an architectural consequence, not a policy concern — CPMI's governance outputs flow to all six products, making its integrity a platform-wide dependency.

Governance Role Assignments — Permanent
CPMI Product Owner: Project Principal, with cross-portfolio authority over all six SOVEREIGN Platform products — Stage 3 COMPLETE. ARIA Suite Product Owner: Project Principal, accountable for ARC, TRACER, and CLEAR as a single governed suite under one boundary agreement — ARIA Suite development may continue. Data Owner and Data Steward for all six products: Project Principal.

Current Build State — As of Session 16 (June 24, 2026)
The monorepo is at ~/Developer/sovereign-platform/. Git remote: https://github.com/erichrumms/sovereign-platform.git · branch main · HEAD 058e630. The Integration Brief is v1.24. The shell contract is v1.11 (SHA-256: 78709b213ff9976ecadd4066645a897ece55fb9b3ffb049b59dd02d19c0162db — three changes Session 16: GD-12 Orchestration AgentClass, GD-13 MODEL_EVALUATION_COMPLETE, GD-14 AGENT_MESSAGE_SENT/RECEIVED). All data is SYNTHETIC. Governance Clock not activated.

Stage 2 is COMPLETE. Companion suite: COUNSEL (91) · SCRIBE (122) · VIGIL (113) · LENS (58) = 384 JS tests.
Stage 3 is COMPLETE. CPMI: 58 tests. First VRS certificate issued June 24, 2026.
Stage 4 is COMPLETE. AgentOS (81 tests) + NEXUS (48 tests) + evaluate.py + A2A layer + E2E suite (4 tests).
Platform total: 792 JS + 142 Python = 934 tests passing.

Next action: Walkthrough A (Level 1 validation) — Claude Chat session. No build work until Walkthrough A is complete. After Walkthrough A, Session 17 begins Stage 5 (APEX).

GD-15 — Python Logger Taxonomy Re-sync (pre-approved): sovereign_logger.py APPROVED_EVENT_TYPES missing ~30 event types from GD-2 through GD-11, and APPROVED_DECISION_TYPES missing 5 members since GD-6. Fold GD-15 re-sync into Session 17 as first deliverable before APEX build begins.

GD-10 — Classification Boundary (permanent until formally lifted): SOVEREIGN processes UNCLASSIFIED data only. CUI, SECRET, and TOP_SECRET throw ClassificationNotAuthorizedError — message: "This classification level is not authorized for processing in SOVEREIGN. Contact your system administrator."

Codebase facts every session must know: real types are SovereignRequestContext / SovereignLLMResponse / ClearanceLevel. createSovereignClient() is unchanged — use routedComplete() for classified routing. sovereign-api-client compiles commonjs — use process.env not import.meta.env. SovereignEventType is NOT mirrored in sovereign-data/src/shared-types.ts. NEXUS minimumRole is AGENT_OPERATOR. evaluate.py ↔ evaluate-port.ts is a cross-runtime config seam, not a live call.

Standing Development Constraints — Every Session Without Exception
1. No independent security, governance, or audit systems — use the platform's.
2. No shared entity field-name divergence — use ClearanceLevel not DataClassification.
3. No rewrite debt — connections are configuration changes, not rewrites.
4. Every human decision event carries decision_type.
5. No direct Anthropic API calls — createSovereignClient() only.
6. workflow_step_id on every Logger call.
7. Shell context frozen at eight exports.
8. shell-contract.ts is a governance document — v1.11, SHA-256: 78709b213ff9976ecadd4066645a897ece55fb9b3ffb049b59dd02d19c0162db. Changes require governance decision, version increment, changelog, impact assessment, SHA-256 verification of both copies, and propagation to all synced shared-type copies.
9. All prompts registered before build — 9 approved.
10. All agents registered before build — 16 registered (7 companion + 3 CPMI + 3 AgentOS orchestrators — all AgentCards active).
11. Five synced copies of shared artifacts — changes must propagate to all copies.

Walkthrough Protocol (standing requirement): A Level 1 walkthrough is conducted after each Stage completes. Project Principal operates the live platform in a browser; Claude Chat provides step-by-step guidance. Walkthrough A (Stage 4) is the next Claude Chat action. Schedule: A after S16 · B after S18 · C after S21 · D after S25 · E after S27 · F after S32.

Two Claude Environments — Never Cross These
Claude Chat handles governance only. Claude Code handles all code. The Project Principal is the bridge.

The Post-Session Rhythm — Every Session
Claude Code closes → handoff + SBOM committed + pushed → Project Principal uploads to Claude Chat → Claude Chat produces merged SBOM + updated Integration Brief → Project Principal commits + pushes + places in iCloud → next session gather script → Claude Code → context paste → opening prompt.

Refer to this work as the SOVEREIGN Platform. Refer to the governing document as the SOVEREIGN Platform Integration Brief (current version: v1.24). Refer to the Mac mini monorepo path as ~/Developer/sovereign-platform/.
