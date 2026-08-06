# SOVEREIGN Platform — SBOM Update
## Version 1.60 · August 5, 2026

**Supersedes:** v1.59 (Session 92 — WH-43 badge-mismatch fix reverted; Check 7 parity test added)
**Adds:** Session 93 — Workspace badge parity extended to 5 of 7 tabs; AGENT_REFERENCE Rule 11; Cost Dashboard parity-audit banner; docs/36 placed. Zero new production dependencies. Shell-contract unchanged at v1.28.

---

## 1 — Shell Contract / Agent / Prompt Registry History

| Version | Session | Change | SHA-256 (both copies) |
|---|---|---|---|
| v1.27 | Session 87 | GD-34: added `fallback_category?`, `duration_ms?`, `stop_reason?`, `responded_at?` to `SovereignLogEvent`. | `3570923c35f965b4f0abc1f200816e3dd5e4df7322af1921b8fc38c330a479ff` |
| v1.27 | Sessions 88–90 | Unchanged. Re-verified at each close. | `3570923c35f965b4f0abc1f200816e3dd5e4df7322af1921b8fc38c330a479ff` |
| **v1.28** | **Sessions 91–93** | **docs/34 Phase 3: added `SUPERVISOR` to `SovereignRole` union. Unchanged in Sessions 92–93 — no shell contract additions.** | **`c99355cea43b63672615e76551aa835c3eb73a2f6435fbc43665f67d50ec681b`** |

---

## 2 — Production Dependency Delta

**Zero new production dependencies this session.**

All changes are test additions, a documentation convention, a UI banner, and a docs/ placement.

---

## 3 — Files Changed This Session

| File | Change |
|---|---|
| `module-vigil/src/ApprovalQueue.tsx` | Added `data-testid={`vigil-queue-request-${request.request_id}`}` to `RequestCard <li>` — enables VIGIL parity test counting |
| `e2e/tests/workspace-badge-parity.test.tsx` | NEW — 4 parity tests: VIGIL, ARIA, SCRIBE, FLOWPATH badge/surface/rendered count invariants |
| `AGENT_REFERENCE.md` | Added Rule 11 (shell-contract-bump triggers explicit parity test reporting in Handoff) |
| `module-workspace/src/WorkspaceApp.tsx` | Added `parity-audit-disclosure` banner + `parityAuditStyle` to `CostDashboardSection` |
| `docs/36_Router_Inspection_Audit_Process.md` | NEW — placed from repo root; status line updated to reflect Session 93 partial implementation |

---

## 4 — Test Count Delta

| Workspace | Session 92 | Session 93 | Delta |
|---|---|---|---|
| sovereign-data | 164 | 164 | 0 |
| sovereign-api-client | 192 | 192 | 0 |
| module-counsel | 100 | 100 | 0 |
| module-scribe | 243 | 243 | 0 |
| module-vigil | 215 | 215 | 0 |
| module-lens | 63 | 63 | 0 |
| module-cpmi | 62 | 62 | 0 |
| module-agentos | 89 | 89 | 0 |
| module-nexus | 171 | 171 | 0 (1 pre-existing failure unchanged) |
| module-apex | 234 | 234 | 0 |
| module-flowpath | 153 | 153 | 0 |
| module-aria | 150 | 150 | 0 |
| module-workspace | 33 | 33 | 0 |
| e2e | 156 | 160 | **+4** (workspace-badge-parity.test.tsx) |
| **JS/TS total** | **2,025** | **2,029** | **+4** |
| Python (sovereign-security) | 195 | 195 | 0 |
| **Platform total** | **2,220** | **2,224** | **+4** |

*Note: e2e pre-Session 93 baseline derived from current run with workspace-badge-parity excluded (156 passing). Platform total excludes the 1 pre-existing module-nexus failure (useTTIntake routing_tier mismatch, present before Session 93).*

---

## 5 — New Documents

| File | Type | Description |
|---|---|---|
| `docs/36_Router_Inspection_Audit_Process.md` | Architecture reference | Router inspection and audit process; placed from proposal; partially implemented in Session 93 |
| `e2e/tests/workspace-badge-parity.test.tsx` | Test | Cross-surface badge parity tests for all 5 surface-backed Workspace tabs |
| `SOVEREIGN_Session93_Handoff.md` | Handoff | This session's close artifact |
| `SBOM_Session93_Update.md` | SBOM update | This file |

---

*SOVEREIGN Platform SBOM v1.60 · Session 93 · August 5, 2026*
*Governance Agent merges this into the cumulative SBOM registry.*
