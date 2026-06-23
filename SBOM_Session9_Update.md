# SBOM Session 9 Update — SOVEREIGN Platform
## June 23, 2026 · merges into SBOM Registry

**Classification:** Pre-Decisional · Internal Working Document
**Scope:** Software components added/changed in Session 9 (D1 — Security Framework live
wiring, configurable/synthetic). For merge into the master SBOM Registry in Claude Chat.

---

## 1. Third-Party Dependencies

**No new third-party dependencies.** D1 is configuration wiring within `module-vigil`.
`npm audit --omit=dev`: **0 production vulnerabilities.**

The configurable endpoint reads a build-time platform-config value
(`VITE_VIGIL_ALERT_ENDPOINT`); the scoped query uses a browser/runtime-native synthetic
backing — no package, no external service this session.

---

## 2. Package / Contract Versions

| Artifact | Status |
|---|---|
| `shell-contract.ts` | **v1.3, unchanged.** SHA-256 `4d78754f…6836acc2` — both synced copies verified identical at close. |
| `@sovereign/module-vigil` | 1.0.0 (no version bump; internal config wiring). |

No other package versions changed.

---

## 3. New / Changed Source Components (`module-vigil`)

**New**
- `src/vigil-endpoint.ts` — isolated reader for `VITE_VIGIL_ALERT_ENDPOINT` (platform-config binding for `vigil_alert_endpoint`).
- `src/security-query.ts` — `SecurityObservabilityQuery` port + pure scoping (`scopeRecentEvents`, `scopeSimilarAlerts`) + synthetic/dev backing (`createDevSecurityQuery`).
- `tests/__mocks__/vigil-endpoint.ts` — test stub (returns null → degradation posture).
- `tests/config.test.ts`, `tests/security-query.test.ts`, `tests/AlertDetail.test.tsx`.

**Changed**
- `src/config.ts` — `VIGIL_ALERT_ENDPOINT` now sourced from `readAlertEndpoint()` (default null).
- `src/AlertDetail.tsx` — fills `AnomalyContext.recentEvents` + `similarAlerts` from the injectable Security query (default synthetic/dev).
- `package.json` — jest `moduleNameMapper` adds `vigil-endpoint` → stub.

No existing VIGIL logic rewritten (Constraint #3): `useAlertQueue`, `useTriage`,
`triage-engine`, `AlertQueue` unchanged.

---

## 4. Governance / Registry Delta

- **No `SovereignEventType` added** — the scoped query is read-only.
- **No new prompts, no new agents.** `vigil-approval-agent` remains deferred.
- **Governance Clock: OFF.** All data SYNTHETIC. The endpoint and query backing are
  synthetic/dev; pointing them at the live Security Framework is a future configuration
  change gated by a governance decision to activate live operation.

---

## 5. Test Inventory

| Suite | Session 8 | Session 9 |
|---|---|---|
| sovereign-data | 36 | 36 |
| sovereign-api-client | 143 | 143 |
| module-counsel | 91 | 91 |
| module-scribe | 122 | 122 |
| module-vigil | 63 | **72** |
| module-lens | 58 | 58 |
| **JS total** | 513 | **522** |
| Python (sovereign-security) | 127 | 127 |
| **Total** | 640 | **649** |

---

*SBOM Session 9 Update · June 23, 2026 · merge into master SBOM Registry · Pre-Decisional · Internal Working Document*
