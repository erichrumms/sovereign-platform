# Session Handoff Document
## SOVEREIGN Platform — Session 2A: sovereign-api-client and R2 Governance
**Session Date:** June 2, 2026
**Session Number:** 2A — Stage 1, Session 2A
**Products Worked On:** Platform-wide — sovereign-api-client (shared package)
**Stage:** Stage 1 — SOVEREIGN Security Observability Framework — IN PROGRESS
**R2 Status:** CLOSED — sovereign-api-client v1.0 built, 143 tests passing
**R3 Status:** CLOSED — Agent Operator Scope Document v1.0 approved by Project Principal, June 2, 2026

---

## Session 2A Done Condition — MET

| Criterion | Status |
|---|---|
| `sovereign-api-client/src/base-client.ts` — auth headers, SOVEREIGN metadata, timeout, three-tier fallback | ✅ 33 tests passing |
| `sovereign-api-client/src/anthropic-client.ts` — Anthropic API wrapper, three-tier fallback, Tier 1 enforcement | ✅ 41 tests passing |
| `sovereign-api-client/src/govcloud-client.ts` — GovCloud routing stub, `UNRESOLVED_PENDING_GOVCLOUD_DECISION` placeholder, Tier 2 enforcement | ✅ 32 tests passing |
| `sovereign-api-client/src/index.ts` — `createSovereignClient()` factory, all public exports, TypeScript exhaustiveness check | ✅ 37 tests passing |
| R2 formally documented in `R2_Closure_Record.md` | ✅ |
| Unit tests passing for Anthropic client and fallback behavior | ✅ 143 / 143 |
| SBOM updated with new npm dependencies | ✅ `SBOM_Session2A_Update.md` |

**Full test suite: 143 tests, 143 passing, 0 failures.**

---

## Governance Decisions Made This Session (Permanent Records)

1. **R3 — CLOSED.** Agent Operator Scope Document v1.0 approved by Project Principal, June 2, 2026. Stage 2 alerts may go live. Integration Brief v1.4 must update R3 status accordingly.

2. **R2 governance decision — recorded.** Project Principal confirmed: *"The sovereign-api-client will be built so that the Tier 2 (GovCloud/CUI) LLM provider is a configuration value, not a code dependency."* This is a permanent governance record. Resolving R7 (Tier 2 provider selection) is a configuration change in `sovereign_config.yaml` — not a rewrite of any product module, shell, or Security Framework component.

---

## Files Produced This Session

| File | Location in Monorepo | Test Results |
|---|---|---|
| `types.ts` | `sovereign-api-client/src/types.ts` | Type-only — no tests |
| `base-client.ts` | `sovereign-api-client/src/base-client.ts` | 33/33 passing |
| `test_base_client.test.ts` | `sovereign-api-client/tests/` | — |
| `anthropic-client.ts` | `sovereign-api-client/src/anthropic-client.ts` | 41/41 passing |
| `test_anthropic_client.test.ts` | `sovereign-api-client/tests/` | — |
| `govcloud-client.ts` | `sovereign-api-client/src/govcloud-client.ts` | 32/32 passing |
| `test_govcloud_client.test.ts` | `sovereign-api-client/tests/` | — |
| `index.ts` | `sovereign-api-client/src/index.ts` | 37/37 passing |
| `test_index.test.ts` | `sovereign-api-client/tests/` | — |
| `package.json` | `sovereign-api-client/package.json` | Governance document |
| `tsconfig.json` | `sovereign-api-client/tsconfig.json` | Governance document |
| `R2_Closure_Record.md` | `sovereign-api-client/R2_Closure_Record.md` | Governance document |
| `SBOM_Session2A_Update.md` | `sovereign-api-client/SBOM_Session2A_Update.md` | Append to SBOM_Registry.md |

---

## Bugs Found and Fixed by Tests (Real Bugs — Not Cosmetic)

1. **GovCloud resolved-endpoint test race condition.** The original test asserted `fetch` was called after `mockRejectedValueOnce` when the endpoint is a real URL. The `setTimeout`-based timeout in `BaseSovereignClient._withTimeout()` fired before the async chain reached `fetch` under Jest's timer model, causing the assertion to fail. Fixed: the test now asserts what actually matters — that the `FALLBACK_ACTIVATED` event payload does not contain `reason: "placeholder"` when a real endpoint is configured. This correctly validates that the placeholder guard stood aside without relying on fetch call timing.

2. **Import path for shell-contract types.** `base-client.ts` originally imported `SovereignProduct` and `SovereignTier` directly from `../../sovereign-shell/shell-contract`. This broke standalone compilation and testing of the package. Fixed: `types.ts` provides local re-exports of both types, with a governance note requiring them to stay in sync with `shell-contract.ts`. The `moduleNameMapper` approach was also tried and discarded — the local types file is the correct pattern for a standalone shared package.

---

## Architecture of sovereign-api-client

```
sovereign-api-client/src/
├── types.ts              ← SovereignProduct, SovereignTier (local re-exports)
├── base-client.ts        ← Abstract base: fallback, metadata, timeout, Logger interface
├── anthropic-client.ts   ← Tier 1 (standard): Anthropic API, Tier 1 enforcement
├── govcloud-client.ts    ← Tier 2 (enhanced): GovCloud stub, placeholder guard
└── index.ts              ← createSovereignClient() factory, all public exports
```

**Provider selection flow:**
```
Product agent
  → createSovereignClient({ tier }, config, logger, cache)   [index.ts]
      tier "standard" → new AnthropicClient(...)             [anthropic-client.ts]
      tier "enhanced" → new GovCloudClient(...)              [govcloud-client.ts]
  → client.complete(messages, context)                       [base-client.ts]
      → Tier 1: live provider call (with timeout)
      → Tier 2: cache fallback (if live fails)
      → Tier 3: static fallback (if cache empty)
      → returns SovereignLLMResponse (always — never throws on fallback)
```

**Tier enforcement (mutual exclusion):**
- `AnthropicClient.complete()` rejects `tier: "enhanced"` — throws before any network call
- `GovCloudClient.complete()` rejects `tier: "standard"` — throws before any network call
- Both enforced at the `complete()` override level, not in `callProvider()`

**Placeholder mechanics:**
- `GOVCLOUD_PROVIDER_ENDPOINT = "UNRESOLVED_PENDING_GOVCLOUD_DECISION"` — named exported constant
- `GovCloudClient.callProvider()` checks `this.endpoint === GOVCLOUD_PROVIDER_ENDPOINT`
- If placeholder: throws `GovCloudNotYetResolvedException`
- Base class catches and activates static fallback — callers always get a `SovereignLLMResponse`
- When R7 resolved: implement real HTTP call in `callProvider()`, remove guard, update 4 config values

---

## npm Dependencies Installed This Session

All devDependencies — no production runtime npm dependencies introduced.

| Package | Version | Purpose |
|---|---|---|
| typescript | 5.9.3 | TypeScript compiler |
| jest | 29.7.0 | Unit test framework |
| ts-jest | 29.4.11 | TypeScript preprocessor for Jest |
| @types/jest | 29.5.14 | Jest type definitions |
| @types/node | 20.19.41 | Node.js type definitions |

Zero production runtime npm dependencies. `sovereign-api-client` uses Node.js built-in `fetch` (Node 18+) only.

---

## Open Conditions Carried Forward

### R7 — Tier 2 LLM Provider Decision — OPEN (unchanged from Session 1)
Required before Stage 5. Not a Stage 2 blocker. The `UNRESOLVED_PENDING_GOVCLOUD_DECISION` placeholder in `govcloud-client.ts` means this resolves to a config change when the time comes.

### Shell Implementation — Session 2B (next session)
Session 2A is complete. Session 2B builds the shell scaffold.

### Product-Level Open Conditions (Unchanged)
| Product | Condition |
|---|---|
| FLOWPATH | Add `cpmi_vrs_disclosure` field to VVR schema |
| CPMI | Deploy world model REST API; run Phase 5 write-back |
| AgentOS | Run `evaluate.py` end-to-end |
| NEXUS | Complete Track B API handlers; complete governance record |
| APEX | Validate sql.js persistence end-to-end; wire Logger emission pathway |
| ARIA Suite | Resolve 5 known issues; begin source file modifications |

---

## Next Session — Session 2B: Shell Scaffold

**Purpose:** Build the shell host application that every module mounts into.

**Documents to load:**
- This handoff (Session 2A) + `system_prompt.md` + Integration Brief v1.3
- `shell-contract.ts` — being implemented in Session 2B
- `architecture.md` — Section 3 (monorepo structure), Section 14.1 (review queue — shell requirement)
- `sovereign-api-client/src/index.ts` — shell imports it

**Done condition (state before any build work begins):**
- `sovereign-shell/src/shell.ts` — implements `SovereignShellContext`; wires auth, logger, governance, navigation, mcp/a2a/agui stubs
- `sovereign-shell/src/module-loader/` — mount/unmount enforcing `SovereignModuleContract`; `agentCards` registration; `minimumRole` enforcement; `healthCheck()` polling
- `sovereign-shell/src/navigation/` — platform nav chrome; breadcrumb; module routing
- `sovereign-shell/src/governance/` — CPMI-VRS status dashboard placeholder; `isOnHold()` visible in shell header
- `sovereign-shell/package.json` — React 18, TypeScript 5, Vite 5 dependencies
- All components compile without TypeScript errors against `shell-contract.ts`
- SBOM updated with npm dependencies

**What Session 2B does NOT build:** Product module UIs, CPMI world model live connection, AG-UI event bus implementation, A2A task lifecycle.

**After Session 2B:** Stage 1 is complete. Monorepo scaffold exists on Mac Mini. Stage 2 begins in Claude Code.

---

## Context Session 2B Needs

- All data is SYNTHETIC. Governance Clock has not activated.
- Security Framework: all 4 modules in `sovereign-security/` — 127 tests passing (Session 1)
- sovereign-api-client: all 4 source files in `sovereign-api-client/src/` — 143 tests passing (Session 2A)
- `shell-contract.ts` v1.0 is an approved governance document — any change requires governance decision + version increment
- R2 CLOSED. R3 CLOSED.
- R7 (Tier 2 LLM provider) remains open — Stage 5 prerequisite, not a Session 2B concern
- Node.js/npm environment confirmed available (Session 2A installed jest, ts-jest, typescript)
- Python dependencies confirmed installed (Session 1): pyyaml 6.0.3, pytest 9.0.3, requests 2.33.1, scikit-learn 1.8.0, numpy 2.4.4, joblib 1.5.3, structlog 25.5.0

---

## Integration Brief v1.4 Update Flag

**Integration Brief v1.4 update required** at next Integration Brief session:

1. **R2 status:** Change to `CLOSED — sovereign-api-client v1.0 built Session 2A, June 2, 2026. 143 tests passing.`
2. **R3 status:** Change to `CLOSED — Agent Operator Scope Document v1.0 approved June 2, 2026`
3. **New standing constraint (Section 6):** Add — *"No product calls an LLM provider API directly — all LLM calls go through sovereign-api-client. Use `createSovereignClient()` from `@sovereign/api-client`. Never instantiate AnthropicClient or GovCloudClient directly."*
4. **SBOM:** npm dependencies from Session 2A appended (see `SBOM_Session2A_Update.md`)
5. **Shell contract status:** Already recorded in v1.3 — no change needed

---

*Session 2A Handoff · SOVEREIGN Platform · June 2, 2026*
*Pre-Decisional · Internal Working Document*
