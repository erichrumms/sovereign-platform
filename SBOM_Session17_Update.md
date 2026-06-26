# SBOM Session 17 Update — SOVEREIGN Platform
## June 25, 2026 · merges into SBOM Registry · AUTONOMOUS SESSION

**Classification:** Pre-Decisional · Internal Working Document
**Scope:** Components added/changed in Session 17 (D1 GD-15 logger re-sync, D2 Walkthrough A
gap fixes, D3 GD-16 + APEX scaffold, D4–D7 APEX screens + benchmarks). For merge into the
master SBOM Registry (current: v1.17 → next v1.18).

---

## 1. Third-Party Dependencies

**No new third-party dependencies.** `module-apex` reuses the existing React / Jest / ts-jest /
testing-library stack (same devDependencies as module-cpmi / module-nexus). `npm audit
--omit=dev`: 0 production vulnerabilities expected (no new runtime packages introduced).

---

## 2. Contract / Data-Dictionary Versions

| Artifact | Status |
|---|---|
| `shell-contract.ts` (both copies) | **v1.11 → v1.12** (GD-16). SovereignEventType += 7 APEX events (→65); HumanDecisionType += REPORT_ATTESTATION (→16); new exported types ApexReportType / RiskFinding / ApexAnalysisOutput. **SHA-256 `61594a698da07a4a748259fe23cf2be03d8e6aeaea5c72502f04e0d3e246dfe3`** — both copies identical. Retired: `78709b21…0162db` (v1.11). |
| `sovereign-data/src/shared-types.ts` | HumanDecisionType += REPORT_ATTESTATION (GD-16 sync); HUMAN_DECISION_TYPES runtime 15 → 16; test updated. |
| `sovereign-security/sovereign_logger.py` | **GD-15** — APPROVED_EVENT_TYPES 21 → 58 (added GD-2…GD-11), APPROVED_DECISION_TYPES 10 → 15 (added 5). **GD-16** — APPROVED_EVENT_TYPES 58 → 65 (7 APEX), APPROVED_DECISION_TYPES 15 → 16 (REPORT_ATTESTATION). Now at full parity with shell-contract v1.12. |
| `sovereign-shell/src/module-loader` | `VALID_AGENT_CLASSES` unchanged (no AgentClass change). MODULE_PRODUCT already mapped module-apex → APEX. |

---

## 3. New / Changed Source Components

### `module-apex` (NEW workspace — D3–D7)
| File | Purpose |
|---|---|
| `src/index.ts` | SovereignModuleContract; 2 AgentCards; PLATFORM_ADMIN role gate. |
| `src/apex-contract.ts` | GD-16 type re-exports; ApexProgramRecord / ProvenanceRecord / ProgramDossier; validation; workflow-step helpers. |
| `src/synthetic-world-model.ts` | Synthetic UNCLASSIFIED programs (P-100 demo + P-200/P-150/P-300 scenario fixtures) with DC-3 provenance + dossier records. |
| `src/apex-data-adapter.ts` | Extensible ApexDataAdapter interface + synthetic backing (read-only; open for PPBE extension). |
| `src/apex-analysis.ts` | apex.ai-assistant orchestration — live → static fallback; deterministic static analysis. |
| `src/useApexAnalysis.ts` | analysis hook (createSovereignClient; APEX_ANALYSIS_STARTED/COMPLETE; Gate-2). |
| `src/report-generator.ts` | apex.report-generator — deterministic report + DC-2 dossier assembly; evaluateHold (= isOnHold). |
| `src/useReportGenerator.ts` | report hook (hold gate; APEX_REPORT_GENERATED; REPORT_ATTESTATION; APEX_DOSSIER_EXPORTED). |
| `src/event-trigger.ts` | PPBE event-driven report trigger STUB (APEX_EVENT_RECEIVED; deferred). |
| `src/banners.tsx` | Gap 6 Category-1/2 banner primitives + shared tokens. |
| `src/ProvenancePanel.tsx` | generic DC-3 provenance panel (renders by entity type). |
| `src/PortfolioDashboard.tsx` | Screen 1 (D4). |
| `src/ProgramDetailView.tsx` | Screen 2 (D5). |
| `src/ReportGenerationPanel.tsx` | Screen 3 (D6). |
| `src/ExecutionMonitoringStub.tsx` | Screen 4 stub (Gap 6 Category 1; PPBE Phase 5). |
| `src/ApexApp.tsx` | tabbed composition root. |
| `src/anthropic-key.ts` | Vite key reader (jest-mapped stub). |
| `src/prompts/apex-assistant.prompt.ts` | runtime PR-APEX-001. |
| `prompts/apex_assistant_system.md` + `CHANGELOG.md` | PR-APEX-001 registered + APPROVED. |
| `agents/ppbe-ledger-monitor/README.md`, `agents/ppbe-evidence-synthesizer/README.md` | reserved PPBE agent slots. |
| `src/benchmark-scenarios.ts` | CPMI-VRS scenarios A/B/C (D7). |
| `tests/**` (14 suites) | 80 tests. |

### `module-nexus` (D2 — Gap 1)
| File | Change |
|---|---|
| `src/useRequestRegistry.ts` | ref-backed monotonic `nextRequestId()` (Gap 1 fix). |
| `src/RequestIntakePanel.tsx` | uses `registry.nextRequestId()` instead of `requests.length`. |
| `tests/useRequestRegistry.test.tsx`, `tests/NexusApp.test.tsx` | +4 Gap 1 regression tests (48 → 52). |

### Gap 3 contrast (D2 — color only)
`module-nexus`, `module-agentos`, `module-vigil`, `module-cpmi`: inactive tab `#64748b`→`#475569`;
sub-AA `#94a3b8` text → `#475569`; disabled-button text `#94a3b8` → `#64748b`. No behavior change.

**Changed (wiring):** root `package.json` — `module-apex` workspace + `test:apex`;
`sovereign-shell/src/register-modules.ts` — registers `apexModule`.

---

## 4. Governance Decisions Recorded This Session

| ID | Decision | Surface |
|---|---|---|
| GD-15 | Python logger taxonomy re-sync (catch-up to v1.11) — no shell-contract change | `sovereign_logger.py` |
| GD-16 | APEX event types (7) + REPORT_ATTESTATION + analysis schema — shell-contract v1.11→v1.12 | both shell-contract copies + 5 synced copies |

---

## 5. Agent Registry

| Agent | Module | Class | LLM-backed | Status |
|---|---|---|---|---|
| `apex.ai-assistant` | module-apex | Analytical | Yes (PR-APEX-001) | **Active (AgentCard registered)** |
| `apex.report-generator` | module-apex | Operational | No | **Active (AgentCard registered)** |

**Total registered & active: 18** (16 prior + 2 APEX). All AgentCards active.

---

## 6. Prompt Registry

| ID | Agent | Status | Approved |
|---|---|---|---|
| PR-APEX-001 | apex.ai-assistant | **APPROVED** | Project Principal, June 25, 2026 |

**Total approved prompts: 10** (9 prior + PR-APEX-001).

---

## 7. Test Totals

**876 JS + 142 Python = 1018** (Session 16: 934). New: module-apex 80; NEXUS 48 → 52.

---

## 8. Model Registry / VRS

No new model-registry entries. APEX CPMI-VRS certification (Gate 3 attestation) is a Session 18 /
Walkthrough B step; benchmark scenarios A/B/C are implemented and produce schema_valid:true outputs.

---

*SBOM Session 17 Update · June 25, 2026 · Autonomous Session · Pre-Decisional · Internal Working Document*
