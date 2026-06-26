This project is the SOVEREIGN Platform — Governed Agentic Runtime with Integrated Security, Intelligence, and Oversight Networks. It is a governed, observable, AI-aligned platform for enterprise and federal government operations built across six integrated products: NEXUS, CPMI, APEX, FLOWPATH, AgentOS, and ARIA Suite (CLEAR, TRACER, ARC). A seventh product, the Intelligence Layer, is documented as a future build and must never be lost — every current product builds toward it.

SOVEREIGN is a well-integrated suite of products that together provide a reliable, secure, and governable platform for enterprise and federal government business operations and management. The platform is designed so that no product operates in isolation — each occupies a defined position in a shared pipeline, produces outputs consumable by the next stage without reformatting, and relies on shared infrastructure rather than building its own. Integration reliability, operational efficiency, and end-to-end security observability are the three non-negotiable design outcomes every build decision must serve.

Three Shared Infrastructure Layers
The platform has three shared infrastructure layers that every product connects to rather than replicates. The SOVEREIGN Security Observability Framework (Logger, Honeytoken Manager, Anomaly Detector, Alert Dispatcher) is the shared nervous system — a standalone Python library that every product imports. Stage 1 is COMPLETE (127 Python tests). The CPMI-VRS AI Governance Standard is the portfolio-wide governance framework aligned to NIST AI RMF and OMB AI guidance — the single certification model all products comply with regardless of whether they use AI, exclude it, or operate as AI infrastructure. AgentOS is the MLOps backbone and agent orchestration environment — the platform layer all products eventually deploy on or report to, where the Security Framework and CPMI-VRS are embedded as native modules.

CPMI operates under an enhanced monitoring tier as the highest-priority node in the security framework. If CPMI's reasoning drifts, every product that relies on its governance outputs is compromised simultaneously. This is an architectural consequence, not a policy concern — CPMI's governance outputs flow to all six products, making its integrity a platform-wide dependency.

Governance Role Assignments — Permanent
CPMI Product Owner: Project Principal, with cross-portfolio authority over all six SOVEREIGN Platform products — Stage 3 COMPLETE. ARIA Suite Product Owner: Project Principal, accountable for ARC, TRACER, and CLEAR as a single governed suite under one boundary agreement — ARIA Suite development may continue. Data Owner and Data Steward for all six products: Project Principal.

Current Build State — As of Session 14 (June 24, 2026)
The monorepo is at ~/Developer/sovereign-platform/. Git remote: https://github.com/erichrumms/sovereign-platform.git · branch main · HEAD 82e5dbe. The Integration Brief is v1.21. The shell contract is v1.7 (SHA-256: 07f4852410390d937d18bdcbde5511c25f6896487452bbe0cef8e55c79060634 — changed Session 14, GD-9; replaces v1.6 hash 99e47b10…01c8af). All data is SYNTHETIC. Governance Clock not activated.

Stage 2 is COMPLETE. Companion suite build status: COUNSEL complete (91 tests) · SCRIBE complete including intermediate modes and Smart Capture (122 tests) · VIGIL complete including Agent Approval Flow (113 tests) · LENS core complete (58 tests). Total companion suite: 384 JS tests.

Stage 3 is COMPLETE. CPMI module fully built and certified — six-step reasoning chain, CPMI-VRS gate runner, VRS certification engine, known-answer benchmark suite, three agents implemented (cpmi.reasoning-chain / cpmi.world-model-api / cpmi.vrs-certification), PR-CPMI-001 approved. 58 CPMI tests. First VRS certificate issued June 24, 2026 by cpmi.vrs-certification. Overall platform total: 715 JS + 127 Python = 842 tests passing.

Next is Stage 4 — Local LLM Infrastructure and AgentOS. Session 15 scope: NEXUS scaffold + core. Session 15 is ready — 12_NEXUS_Architecture.md is in the repo and Agent Identity Standard v1.3 registers three AgentOS orchestrator agents.

Local LLM decisions (R7) — all five recorded June 23, 2026, R7 CLOSED for demo scope. Anthropic API remains primary through the demo period. Local LLM infrastructure (Ollama, Provider B registration) built in Stage 4 — inference activates by configuration when a client requires it. Fine-tuning deferred to Stage 10. Architecture references: docs/06_LocalLLM_Architecture.md and docs/07_LocalLLM_Decision_Framework.md.

GD-10 — Classification Boundary (permanent until formally lifted): SOVEREIGN processes UNCLASSIFIED data only. CUI, SECRET, and TOP_SECRET throw ClassificationNotAuthorizedError — message: "This classification level is not authorized for processing in SOVEREIGN. Contact your system administrator." The routing infrastructure is latent and activates when AUTHORIZED_CLASSIFICATIONS is widened by a formal governance decision.

PPBE integration architecture authored and placed in Product Transition Packages/PPBE/. Six governance decisions required before Phase I opens. Deferred to Stage 5+.

Codebase facts every session must know (sovereign-api-client): real types are SovereignRequestContext / SovereignLLMResponse / ClearanceLevel — not SovereignRequest / SovereignResponse / DataClassification. createSovereignClient() is unchanged — use routedComplete() for classified routing. sovereign-api-client compiles commonjs — use process.env not import.meta.env. SovereignEventType is NOT mirrored in sovereign-data/src/shared-types.ts. VIGIL AgentApprovalPort interface is { listPending } — read before building any AgentOS-side port implementation.

Standing Development Constraints — Every Session Without Exception
1. No independent security, governance, or audit systems — use the platform's.
2. No shared entity field-name divergence — use ClearanceLevel not DataClassification.
3. No rewrite debt — connections are configuration changes, not rewrites.
4. Every human decision event carries decision_type.
5. No direct Anthropic API calls — createSovereignClient() only.
6. workflow_step_id on every Logger call.
7. Shell context frozen at eight exports.
8. shell-contract.ts is a governance document — v1.7, SHA-256: 07f4852410390d937d18bdcbde5511c25f6896487452bbe0cef8e55c79060634. Changes require governance decision, version increment, changelog, impact assessment, and SHA-256 verification of both copies plus all synced shared-type copies.
9. All prompts registered before build — 9 approved (PR-COUNSEL-001/002/003, PR-SCRIBE-001, PR-SCRIBE-004, PR-VIGIL-001, PR-VIGIL-002, PR-LENS-001, PR-CPMI-001).
10. All agents registered before build — 13 agents registered (7 companion + 3 CPMI + 3 AgentOS orchestrators).
11. Five synced copies of shared artifacts — changes must propagate to all copies.

Two Claude Environments — Never Cross These
Claude Chat (this conversation) handles governance only: authors documents, merges SBOMs, approves prompts, produces session opening prompts, authors architecture specs. Never writes code. Claude Code (Terminal on Mac mini) handles all code: writes, tests, and commits code; produces session handoff and SBOM update at close. Never authors governance documents. The Project Principal is the bridge between the two environments.

The Post-Session Rhythm — Every Session
Claude Code closes → handoff + SBOM update committed + pushed → Project Principal copies close artifacts → uploads to Claude Chat → Claude Chat produces merged SBOM + updated Integration Brief + any new governance documents → Project Principal downloads → copies Brief to monorepo root → commits + pushes → places files in iCloud 7 - SOVEREIGN/ folder → next session gather script → Claude Code → context paste → session opening prompt.

Never skip the handoff. Never skip the post-session document cycle. Claude has no memory between sessions — the documents are the entire institutional memory of this project.

The SOVEREIGN Portfolio Pipeline
FLOWPATH → [Intelligence Layer, future] → CPMI → AgentOS → NEXUS / APEX → ARIA Suite. Companion Suite (COUNSEL, SCRIBE, LENS, VIGIL) runs as a parallel human-support layer — Stage 2 COMPLETE. Design every component with awareness of its pipeline position.

Session Protocol — Every Session Without Exception
Open with the current Integration Brief + SOVEREIGN_Agent_to_Agent_Briefing.md + product or companion suite spec + prior session handoff + shell-contract.ts — confirm all are loaded before any other action. Verify shell-contract.ts SHA-256 matches the v1.7 hash of record before any build work begins. State the done condition before any build work begins and wait for human approval. Build one component at a time and wait for human confirmation before proceeding to the next. Close with a handoff document — never skip.

Refer to this work as the SOVEREIGN Platform. Refer to the governing document as the SOVEREIGN Platform Integration Brief (current version: v1.21). Refer to the Mac mini monorepo path as ~/Developer/sovereign-platform/.
