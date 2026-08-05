# SOVEREIGN Platform — SBOM Registry
## Version 1.53 · August 4, 2026

**Supersedes:** v1.52 (Session 84 — Anthropic browser CORS header fix)
**Adds:** Session 85 — root-cause diagnosis and fix of the silent-fallback condition
(invalid API key value in `.env.local`; no repository code changed)

---

## 1 — Shell Contract / Agent / Prompt Registry History

| Version | Session | Change | SHA-256 (both copies) |
|---|---|---|---|
| v1.26 | GD-33 Build Session | Added `reports_to?: string` to `SovereignUser`. | `42a479cab397de93246d05bef7c90959d33f9a5b7d2fc4b74c39cd397951697b` |
| v1.26 | Session 82 | Unchanged. Re-verified at close — both copies identical, matching recorded value. | `42a479cab397de93246d05bef7c90959d33f9a5b7d2fc4b74c39cd397951697b` |
| v1.26 | Session 83 | Unchanged. Re-verified at close — both copies identical, matching recorded value. | `42a479cab397de93246d05bef7c90959d33f9a5b7d2fc4b74c39cd397951697b` |
| v1.26 | Session 84 | Unchanged. Re-verified at close — both copies identical, matching recorded value. | `42a479cab397de93246d05bef7c90959d33f9a5b7d2fc4b74c39cd397951697b` |
| **v1.26** | **Session 85** | **Unchanged. Re-verified at close — both copies identical, matching recorded value.** | **`42a479cab397de93246d05bef7c90959d33f9a5b7d2fc4b74c39cd397951697b`** |

**Agents: 44 total — unchanged.**

**Prompts: 20 = 19 approved + 1 pending — unchanged.**

---

## 2 — Third-Party Dependencies

**Zero new production dependencies. Zero code changes of any kind.** Session 85 changed
no production source file, no test file, and no `package.json`. The session's fix was to
the git-ignored `sovereign-shell/.env.local` credential file (corrected an invalid API
key value — a paste artifact). Zero-new-production-dependency streak continues unbroken
from Session 62.

**External API posture change (no dependency change):** the Anthropic API
(`api.anthropic.com`, model `claude-sonnet-4-6` per the existing SBOM entry) is now
**confirmed reachable and authenticating** from this environment — verified by direct
`curl` at Session 85 with real token usage returned. All prior sessions operated against
a rejected credential; the Cost Dashboard should show nonzero values from the first
successful browser call forward.

**Audit posture:** unchanged — 5 vulnerabilities (1 moderate, 4 high) all in
dev-tooling dependencies, pre-existing.

---

## 3 — Test Totals

| Close point | JS/TS | e2e | Python | Platform Total | Confidence |
|---|---|---|---|---|---|
| Session 83 | 1,867 | 149 (4 skip) | 195 | 2,211 | High — +4 tests |
| Session 84 | 1,868 | 149 (4 skip) | 195 | 2,212 | High — +1 test |
| **Session 85** | **1,868** | **149 (4 skip)** | **195** | **2,212** | **High — full 14-package JS/TS run at close; no code changed, totals unchanged** |

Per-package JS/TS breakdown: identical to Session 84 (sovereign-data 163,
sovereign-api-client 185, sovereign-shell 19, module-counsel 100, module-scribe 240,
module-vigil 215, module-lens 63, module-cpmi 62, module-agentos 89, module-nexus 169,
module-apex 228, module-flowpath 152, module-aria 150, module-workspace 33 —
**total 1,868**).

`tsc --noEmit`: **all 15 workspaces clean** — unchanged from Session 84 (e2e verified
directly via `npx tsc --noEmit`; it has no `lint` script).

---

## 4 — Session 85 Component Changes

| File | Change |
|------|--------|
| `sovereign-shell/.env.local` | **(git-ignored — not in repository)** Corrected `VITE_ANTHROPIC_API_KEY`: removed a 10-character redacted-display prefix (`sk-ant-...`) that had been accidentally pasted in front of the real 108-character key, making the stored value fail Anthropic authentication with 401 on every live call. Verified working by direct `curl` (HTTP 200, real usage) before and after the file edit. Pre-fix backup at `~/.sovereign-env-backup-session85`, outside the repository. |
| `SOVEREIGN_Session85_Handoff.md` | New — Session 85 evidence record (root cause, six-candidate investigation, closure of the invalid `console.log` open item) |
| `SBOM_Session85_Update.md` | This file — v1.53 |

No other files changed.
