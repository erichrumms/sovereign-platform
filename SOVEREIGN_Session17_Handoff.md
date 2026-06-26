# SOVEREIGN Platform — Session 17 Handoff
## Claude Code → Project Principal → Claude Chat
## June 25, 2026 — AUTONOMOUS SESSION

**Classification:** Pre-Decisional · Internal Working Document
**Prepared by:** Claude Code (code environment) at Session 17 close.
**Mode:** Autonomous — built D1 → D2 → D3 → D4 → D5 → D6 → D7 and closed without stopping.
**Read §G (Blockers & Findings)** — Gap 4 is expected dev behavior (config gap, not a bug);
one spec function name (`sovereignHold()`) was reconciled to the platform's `isOnHold`; and a
pre-existing `APPROVED_PRODUCTS` companion-product drift is flagged for a future GD.

---

## Session Outcome

| Deliverable | Result |
|---|---|
| **D1 — GD-15 Python logger re-sync** | **Complete** — APPROVED_EVENT_TYPES 21→58, APPROVED_DECISION_TYPES 10→15; exact parity with shell-contract v1.11. |
| **D2 — Walkthrough A gap fixes** | **Complete** — Gap 1 (NEXUS queue binding) fixed + regression tests; Gap 3 (contrast) across NEXUS/AgentOS/VIGIL/CPMI; Gap 4 investigated (config gap, documented). |
| **D3 — APEX scaffold + GD-16 (D-APEX-1)** | **Complete** — shell-contract v1.11→v1.12, 5 synced copies propagated, both AgentCards, PR-APEX-001 APPROVED, PPBE stubs, ApexDataAdapter, generic DC-3 panel, Execution Monitoring stub. |
| **D4 — Portfolio Dashboard (D-APEX-2)** | **Complete** — program list, plain-prose status (Gap 5), Category-2 banners (Gap 6), Export Dossier per row, APEX_ANALYSIS_STARTED on load. |
| **D5 — Program Detail + DC-3 (D-APEX-3)** | **Complete** — P-100 in plain prose, clickable risk flags → generic provenance panel (5 DC-3 fields), expandable reasoning history, Export Dossier. |
| **D6 — Report Generation + DC-2 (D-APEX-4)** | **Complete** — apex.ai-assistant via createSovereignClient, apex.report-generator assembly, sovereignHold() gate, REPORT_ATTESTATION before export, complete DC-2 dossier. |
| **D7 — CPMI-VRS benchmarks (D-APEX-5)** | **Complete** — scenarios A/B/C all schema_valid:true; 80 module-apex tests (≥60 required). |

**No live connections. Governance Clock OFF. All data SYNTHETIC/UNCLASSIFIED.**
**No new agents beyond the 2 APEX agents already in the standard; PR-APEX-001 marked APPROVED.**

---

## A. Done-Condition Traceability

**D1 — GD-15** (commit `89af554`): `sovereign_logger.py` `APPROVED_EVENT_TYPES` now 58 members,
`APPROVED_DECISION_TYPES` now 15 — added the GD-2…GD-11 event types (34) and the 5 missing
decision types (AGENT_APPROVAL, GATE_3_ATTESTATION, WORLD_MODEL_UPDATE, TASK_APPROVAL,
TASK_CANCELLATION). Catch-up only, no new types. Set-equality vs shell-contract v1.11 verified
(empty diff both directions). All 142 Python tests pass.

**D2 — Gaps** (commit `5ebf7bf`):
- **Gap 1** — root cause confirmed: the intake panel computed the next request id from
  `registry.requests.length` (React **state**, which lags the hook's synchronously-updated ref),
  so a fast double-submit produced a duplicate id that the registry's idempotency guard silently
  dropped ("submits and clears but never appears"). Fix: the hook now owns a ref-backed monotonic
  id source (`nextRequestId`); the panel uses it. 4 regression tests added (monotonic ids;
  back-to-back submits keep distinct rows; SUBMITTED row renders immediately). NEXUS 48→52 tests.
- **Gap 3** — the only sub-AA text colors were seven `#94a3b8` (slate-400, ~3.6:1): muted text
  darkened to `#475569`, disabled-button text to `#64748b`; inactive tab labels `#64748b`→`#475569`
  for a clearer active/inactive distinction. Confirmed across NEXUS/AgentOS/VIGIL/CPMI. No test
  asserted any hex; all affected suites pass.
- **Gap 4** — see §E. Investigated; expected dev behavior; no code change.

**D3–D7 — APEX** (commits `dd06a57` GD-16, `ccb84ce` module): see §B (tests) and §C (SHA). Every
D-APEX-1…D-APEX-5 criterion met. 80 module-apex tests; module-apex + shell `tsc --noEmit` clean.

---

## B. Test Totals

| Suite | Session 16 | Session 17 |
|---|---|---|
| sovereign-data | 43 | 43 |
| sovereign-api-client | 174 | 174 |
| module-counsel | 91 | 91 |
| module-scribe | 122 | 122 |
| module-vigil | 113 | 113 |
| module-lens | 58 | 58 |
| module-cpmi | 58 | 58 |
| module-agentos | 81 | 81 |
| module-nexus | 48 | **52** (+4 Gap 1) |
| **module-apex** | — | **80** (new) |
| e2e | 4 | 4 |
| **JS total** | 792 | **876** |
| Python | 142 | 142 |
| **Total** | **934** | **1018** |

---

## C. Shell-Contract Hash of Record (v1.12)

```
shell-contract.ts (both copies) — SHA-256:
61594a698da07a4a748259fe23cf2be03d8e6aeaea5c72502f04e0d3e246dfe3
```
Version progression: v1.11 (`78709b21…0162db`, retired) → **v1.12** (GD-16, current). Both copies
`diff`-identical at close. GD-15 made **no** shell-contract change (Python logger only).

**GD-16 impact assessment (executed):** 7 new `SovereignEventType` (module-apex only; no exhaustive
switch); +1 `HumanDecisionType` REPORT_ATTESTATION (propagated to sovereign-data shared-types type +
runtime + test, 15→16); 3 new exported types (ApexReportType/RiskFinding/ApexAnalysisOutput); no
`AgentClass` change. Constraint #11: synced to Python logger (events 65, decisions 16 — exact
parity). module-loader VALID_AGENT_CLASSES unchanged.

---

## D. Commit Hashes

| Deliverable | Commit |
|---|---|
| D1 — GD-15 Python logger re-sync | `89af554` |
| D2 — Walkthrough A gap fixes (Gap 1/3/4) | `5ebf7bf` |
| D3 — GD-16 shell-contract v1.12 + propagation | `dd06a57` |
| D3–D7 — APEX module (scaffold, screens, stubs, benchmarks) | `ccb84ce` |
| Close — Session 17 handoff + SBOM | (this commit) |

Branch `main`, pushed to `origin`. HEAD at open was `3e7978b`.

---

## E. Gap 4 — CPMI Live Reasoning Investigation (Finding + Recommendation)

**Finding (confirmed, not theorized):** The CPMI live reasoning service not connecting in dev is
**expected behavior and a configuration gap, not a bug.** Evidence, end-to-end:
1. `module-cpmi/src/anthropic-key.ts` reads `VITE_ANTHROPIC_API_KEY` from `import.meta.env`. In the
   synthetic dev environment this is unset, so `readAnthropicKey()` returns `undefined`.
2. `useReasoningChain.ts:119` calls `createSovereignClient({ tier: "standard" }, { api_key_anthropic:
   undefined })`. For tier `standard`, `createSovereignClient` **throws by design** at
   `sovereign-api-client/src/index.ts:203` ("api_key_anthropic is required for tier 'standard'").
3. `reasoning-engine.ts:153` catches the throw (Tier 1), the per-program cache is empty (Tier 2), so
   the chain returns the **static** world-model output (`:164`) and emits `FALLBACK_ACTIVATED`.

This is exactly the Walkthrough A observation: "static fallback fired correctly and transparently."

**Recommendation:** No code change. To exercise the live tier in dev, set `VITE_ANTHROPIC_API_KEY`
in a local `.env` (Vite) before `npm run dev`. It is intentionally absent in the committed/synthetic
environment (no secret in the repo; GD-10 UNCLASSIFIED-only; Governance Clock OFF). Per the Session 17
rule ("do not force a live connection if it requires credentials not available in dev"), the live
connection was **not** forced. The static fallback is itself a positive demo story: the platform
degrades transparently and tells the human reviewer the live service is unavailable rather than
silently fabricating a recommendation. **APEX uses the identical pattern** (`apex.ai-assistant` →
static analysis tier when key-less), so the same is true there by design.

---

## F. Spec Reconciliations

1. **`sovereignHold()` → `ctx.governance.isOnHold(product)`.** The APEX spec (§6) and the opening
   prompt name a platform function `sovereignHold()`. No such export exists; the platform hold
   function is `SovereignShellContext.governance.isOnHold(product)` (shell-contract Section 7). APEX
   **imports/calls** it via the thin `evaluateHold(isOnHold)` adapter in `report-generator.ts` — it
   does NOT reimplement a hold engine (Constraint #2, "import/call, do not reimplement"). APEX is
   held when APEX or CPMI is on hold (APEX depends on CPMI).
2. **APEX key reader uses `import.meta` (mirrors module-cpmi), not `process.env`.** The opening
   prompt's "use process.env not import.meta.env" note applies to config readers in the CommonJS
   `sovereign-api-client`. The proven platform pattern for an ESM module's build-time Vite secret is
   the isolated `anthropic-key.ts` reading `import.meta.env`, jest-mapped to a stub (module-cpmi).
   module-apex mirrors that exactly; `process.env` would not be populated in the Vite browser build.
3. **`ApexProgramRecord` is an APEX view type, not a `ProgramRecord` dictionary extension.** It
   aligns to the CPMI `WorldModelRecord` plus APEX presentation fields and uses **none** of the PPBE
   reserved names (`fiscal_year`, `lifecycle_cost_estimate`, `obligation_plan`,
   `performance_baseline`), per spec §17.3.
4. **`ApexDataAdapter` synthetic backing.** The initial adapter reads in-module synthetic World Model
   data (UNCLASSIFIED, Governance Clock OFF) rather than importing module-cpmi directly, keeping
   module boundaries clean. The live adapter (later, by configuration) maps to `cpmi.world-model-api`
   + Logger queries with identical result shapes — no rewrite (Constraint #3). Documented in the file.

---

## G. Blockers & Findings (surfaced, not stopped)

1. **`APPROVED_PRODUCTS` companion-product drift (pre-existing, out of GD-15 scope) — flag for a
   future GD.** `sovereign_logger.py` `APPROVED_PRODUCTS` holds only the six primary products
   (NEXUS, CPMI, APEX, FLOWPATH, AGENTOS, ARIA); it is **missing the four companion products**
   (COUNSEL, SCRIBE, LENS, VIGIL) that exist in the shell-contract `SovereignProduct` union (GD-5).
   GD-15 was scoped to event types and decision types only ("catch-up only, no new types"), so I did
   **not** modify `APPROVED_PRODUCTS`. Today the companion modules emit only via the TypeScript shell
   logger, so the gap is latent — but any Python-side emission under a companion product would be
   rejected. **Recommendation:** a small future GD adds the four companion products to
   `APPROVED_PRODUCTS` (Constraint #11), analogous to GD-15.
2. **Gap 4 is config, not a bug** — see §E. No action taken (correct).
3. **APEX CPMI-VRS Gate UI surfacing is via the benchmark module, not a dedicated gates tab.** D-APEX-5
   benchmarks (A/B/C) are implemented and tested (`benchmark-scenarios.ts`); the Report Generation
   screen provides Gate 1 (AI disclosure banner) and Gate 2 (reasoning transparency — the analysis
   narrative + sections are inspectable). A dedicated "CPMI-VRS Gates" tab inside APEX (mirroring
   CPMI's GateRunnerPanel) was not built this session; the scenario outputs are available
   programmatically via `runAllBenchmarks()` for Walkthrough B review. **Recommendation:** if a
   visible gates tab is wanted for Walkthrough B, add it in Session 18 (APEX completion).
4. **Untracked governance docs at repo root left as-is** (Integration Brief v1.21–25, SBOM
   registries, system prompts, etc.) — Claude Code does not author/commit governance documents.
5. **`logs/sovereign.jsonl` test artifacts** (written by pytest runs) were left unstaged.

---

## H. Update Flags for Integration Brief v1.26

1. **Shell-contract v1.11 → v1.12** (GD-16). New hash of record:
   `61594a698da07a4a748259fe23cf2be03d8e6aeaea5c72502f04e0d3e246dfe3`. Retire `78709b21…0162db`.
2. **GD-15 complete** — Python logger taxonomy re-synced (events 58, decisions 15 at v1.11; now 65/16
   after GD-16). Item 52 (carried) → CLOSED.
3. **GD-16 complete** — APEX event types + analysis schema; 5 synced copies propagated.
4. **New test total: 1018** (876 JS + 142 Python). New module-apex (80 tests). NEXUS 48→52.
5. **APEX build status:** Stage 5a scaffold + three screens + benchmarks COMPLETE; module registered
   in the shell. Remaining for Session 18: APEX completion + CPMI-VRS certification (Gate 3 attestation
   is a Walkthrough B / Project Principal step).
6. **Walkthrough A gaps:** Gap 1 FIXED, Gap 3 FIXED (4 named modules), Gap 4 CLOSED (config, not a bug).
   Gap 2 was covered by the Gap 3 contrast pass (AgentOS task table uses light backgrounds — the
   "dark background" concern did not reproduce; faintness was the `#64748b`/`#94a3b8` colors, now darkened).
7. **New open item:** `APPROVED_PRODUCTS` companion-product re-sync (future GD — see §G.1).
8. **18 agents total** confirmed in code (16 prior + apex.ai-assistant + apex.report-generator).
   PR-APEX-001 APPROVED (9 prior + 1 = 10 approved prompts).

---

## I. Repo State at Close

- Branch `main`, pushed to `origin`.
- Commits this session: `89af554` (D1), `5ebf7bf` (D2), `dd06a57` (GD-16), `ccb84ce` (APEX module),
  + this close commit (handoff + SBOM).
- `shell-contract.ts` v1.12 · SHA `61594a69…46dfe3` · both copies identical.
- All suites green: 876 JS + 142 Python = 1018. `tsc --noEmit` clean (shell + module-apex + changed workspaces).

---

*SOVEREIGN Platform · Session 17 Handoff · June 25, 2026 · Autonomous Session · Pre-Decisional · Internal Working Document*
