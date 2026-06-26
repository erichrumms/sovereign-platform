# SOVEREIGN Platform — SBOM Session 18 Update
## Claude Code session-update file (to be merged into SBOM_Registry by Claude Chat)
## June 26, 2026 — Autonomous Session

**Classification:** Pre-Decisional · Internal Working Document
**Supersedes inputs to:** `SBOM_Registry.md` v1.18 (through Session 17)
**Merge target:** next merged registry (v1.19)

---

## 1 — Shell Contract

| Field | Value |
|---|---|
| Version | **v1.12 — UNCHANGED this session** |
| SHA-256 (both copies) | `61594a698da07a4a748259fe23cf2be03d8e6aeaea5c72502f04e0d3e246dfe3` |
| Change this session | **None** — no shell-contract change authorized (Constraint #8) |
| Both copies identical | Yes — verified at close |

No `SovereignEventType`, `HumanDecisionType`, `AgentClass`, `SovereignProduct`, or shared-type
change in `shell-contract.ts`.

---

## 2 — Governance Decisions

| GD | Title | Scope | Status |
|---|---|---|---|
| **GD-17** | `APPROVED_PRODUCTS` companion-product re-sync | `sovereign-security/sovereign_logger.py` only — adds COUNSEL, SCRIBE, LENS, VIGIL to `APPROVED_PRODUCTS` (catch-up to the shell-contract `SovereignProduct` union, GD-5/v1.3). Python-only; **no** shell-contract change; **no** Constraint #11 propagation beyond the logger. | **Complete** — Session 18 (commit `35ca00f`) |

GD-17 closes Integration Brief v1.26 Item 55. No new GD beyond GD-17 this session.

---

## 3 — New / Changed Software Components

| Component | Module | Kind | Session |
|---|---|---|---|
| `GateRunnerPanel.tsx` | module-apex | New — APEX CPMI-VRS Certification screen (fifth tab); surfaces Gates 1–4, the three benchmark scenarios, and the human attestation/baseline actions | 18 (D2) |
| `ApexApp.tsx` | module-apex | Changed — fifth tab "CPMI-VRS Certification" wired (v1.0 → v1.1) | 18 (D2) |
| `nexus-agentos-port.ts` | module-agentos | New — `createAgentOSBackedPort`, the live AgentOS backing for NEXUS's injectable `AgentOSPort` (creates a real AgentOS task + emits AGENTOS_TASK_ASSIGNED with request_id traceability) | 18 (D3) |
| `harness.tsx` / `pipeline.test.tsx` | e2e | Changed — additive live-handoff path (`nexusLive`/`livePort`/`apex`) + Scenario 5 (Walkthrough B) | 18 (D4) |
| `sovereign_logger.py` | sovereign-security | Changed — `APPROVED_PRODUCTS` 6 → 10 products (GD-17) | 18 (D1) |

No new production npm packages. No new internal workspace packages.

---

## 4 — Registered Agents (18 — UNCHANGED)

No new agents this session. The two APEX agents (`apex.ai-assistant`, `apex.report-generator`)
registered in Session 17 are exercised by the Gates tab (benchmark outputs) and report flow. All
18 AgentCards active.

---

## 5 — Approved Prompts (10 — UNCHANGED)

No new prompts this session. PR-APEX-001 remains APPROVED.

---

## 6 — Test Totals

| Suite | Session 17 | Session 18 |
|---|---|---|
| sovereign-data | 43 | 43 |
| sovereign-api-client | 174 | 174 |
| module-counsel | 91 | 91 |
| module-scribe | 122 | 122 |
| module-vigil | 113 | 113 |
| module-lens | 58 | 58 |
| module-cpmi | 58 | 58 |
| module-agentos | 81 | **86** |
| module-nexus | 52 | 52 |
| module-apex | 80 | **91** |
| e2e | 4 | **5** |
| **JS total** | 876 | **893** |
| Python | 142 | 142 |
| **Total** | **1018** | **1035** |

---

## 7 — Model Registry / VRS Certificates

No change to the model registry. APEX CPMI-VRS gate **infrastructure** is now in place (the Gates
tab): Gate 1 (AI Disclosure) and Gate 2 (Reasoning Transparency) are demonstrably satisfied (banner
present; three benchmark scenarios schema-valid and inspectable); Gate 3 (Human Attestation) and
Gate 4 (Monitoring Baseline) are live UI actions awaiting the Project Principal during Walkthrough
B. No VRS certificate is issued by Claude Code (Gate 3 attestation is the human step).

---

## 8 — Supply-Chain / Vulnerability Status

`npm audit --omit=dev`: **0 vulnerabilities.** `tsc --noEmit` clean across shell, module-apex,
module-agentos, and e2e.

---

*SOVEREIGN Platform · SBOM Session 18 Update · June 26, 2026 · Pre-Decisional · Internal Working Document*
