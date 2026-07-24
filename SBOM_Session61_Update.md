# SBOM — Session 61 Update
## SOVEREIGN Platform · July 23–24, 2026

**Session:** 61 (session-state resurrection family D1–D5 + navigation D6–D7, per docs/30 §2)
**Content commit:** `b6fd8bc`
**Shell contract:** v1.23 — UNCHANGED. Both copies SHA-256
`6f52449c37b639029023b24055d504182ab2e3ac8edd44d8965799d90847d0d9`, verified identical at close.

## 1 — New Components (exact paths as created on disk)

| Path | What it is |
|---|---|
| `module-vigil/src/vigil-alert-session.ts` | Session-persistent alert-queue store (D2 / D3-1 HIGH) |
| `module-aria/src/aria-vrs-session.ts` | Session-persistent Gate 3/4 store (D3 / D3-2) |
| `module-nexus/src/tt-session.ts` | Session-persistent TT queue store (D4 / D3-3) |
| `module-flowpath/src/flowpath-approval-session.ts` | Session-persistent approval record (D5 / D3-4) |
| `module-vigil/tests/vigil-alert-session.test.ts` | D2 store tests |
| `module-nexus/tests/tt-session.test.ts` | D4 store tests |
| `module-flowpath/tests/flowpath-approval-session.test.ts` | D5 store tests |
| `sovereign-shell/tests/host-navigation.test.tsx` | D6/D7 seam tests |

## 2 — Changed Components

| Path | Change |
|---|---|
| `module-vigil/src/vigil-approval-session.ts` | v1.1 — subscribe/notify added (D1, the D3-9 root fix) |
| `module-vigil/src/useApprovalQueue.ts` | v1.1 — `subscribeToSession` live-subscription option (D1) |
| `module-vigil/src/useAlertQueue.ts` | v1.1 — `sessionStore` option; response semantics moved to store (D2) |
| `module-vigil/src/VigilApp.tsx` | v2.2 — opts into both stores (D1, D2) |
| `module-aria/src/AriaVrsGates.tsx` | v1.1 — store-backed gates; duplicate-attestation guard (D3) |
| `module-nexus/src/useTTIntake.ts` | v1.1 — `sessionStore` option; commitTravel/commitTime choke points (D4) |
| `module-nexus/src/NexusApp.tsx` | opts into tt-session (D4) |
| `module-flowpath/src/FlowpathApp.tsx` | store-backed approvedSessionIds (D5) |
| `module-flowpath/src/WorkflowArtifactReview.tsx` | store-init decision state + duplicate-approval guard (D5) |
| `module-flowpath/src/SessionManager.tsx` | prop widened to `readonly string[]` (D5) |
| `sovereign-shell/src/main.tsx` | v1.4 — goHome (D6) + navigateToModule access guard (D7ii) |
| `sovereign-shell/src/navigation/useNavigationState.ts` | v1.1 — render-time mirror self-heal (D7i) |
| Test files: `VigilApp.test.tsx`, `VigilAppObligation.test.tsx`, `useAlertQueue.test.tsx`, `vigil-approval-session.test.ts`, `AriaVrsGates.test.tsx`, `NexusApp.test.tsx`, `useTTIntake.test.tsx`, `FlowpathApp.test.tsx`, `WorkflowArtifactReview.test.tsx` | store resets in beforeEach + 37 new tests total |

## 3 — Test Counts (full table; arithmetic verified by summing rows)

| Workspace | Suites | Passed | Skipped |
|---|---|---|---|
| sovereign-data | 9 | 125 | 0 |
| sovereign-api-client | 10 | 175 | 0 |
| sovereign-shell | 2 | 18 | 0 |
| module-counsel | 13 | 100 | 0 |
| module-scribe | 25 | 228 | 0 |
| module-vigil | 31 | 211 | 0 |
| module-lens | 9 | 58 | 0 |
| module-cpmi | 16 | 58 | 0 |
| module-agentos | 17 | 89 | 0 |
| module-nexus | 19 | 165 | 0 |
| module-apex | 25 | 218 | 0 |
| module-flowpath | 13 | 139 | 0 |
| module-aria | 13 | 150 | 0 |
| module-workspace | 2 | 28 | 0 |
| e2e | 12 | 149 | 4 |
| **JS total** | **216** | **1,911** | **4** |
| Python (sovereign-security) | — | 195 | 0 |
| **Platform total** | | **2,106** | **4** |

Delta from Session 60 (2,069 passed): **+37**, all new this session (VIGIL +17, ARIA +6,
NEXUS +6, FLOWPATH +4, shell +4). All 15 JS workspaces and pytest: exit code 0.
`tsc --noEmit`: 0 in all 15 workspaces. `npm audit --omit=dev`: `found 0 vulnerabilities`.

## 4 — Registries

- **Agents: 44 — no change** (no new agent identities; all five session stores are plain
  module-level state, not agents).
- **Prompts: 20 = 19 approved + 1 pending — no change.**
- **Production npm dependencies: no change** (no packages added or removed).

---

*SBOM Session 61 Update · July 24, 2026 · Build Agent*
*Pre-Decisional · Internal Working Document*
