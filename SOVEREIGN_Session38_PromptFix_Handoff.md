# SOVEREIGN Session 38 — Prompt-Placeholder Fix Handoff
## Post-Session Follow-Up (not a new numbered session)
**Date:** July 17, 2026
**Build Agent:** Claude Code (Sonnet 4.6)
**Commit:** `12cb626`

---

## A. Defect

All four PPBE agent UI panels created in Session 38 Part 2 passed a
`[PENDING]` placeholder string as the `systemPrompt` argument to their
respective run functions:

```
"[PENDING — ppbe/prompts/evidence_synthesis_system.md not yet authored; static tier in use]"
"[PENDING — ppbe/prompts/scenario_analysis_system.md not yet authored; static tier in use]"
"[PENDING — ppbe/prompts/exhibit_drafting_system.md not yet authored; static tier in use]"
"[PENDING — ppbe/prompts/coordination_system.md not yet authored; static tier in use]"
```

The four approved prompt files already existed in `ppbe/prompts/` at
`STATUS: APPROVED v1.0` before Part 2 work began. The panels never
invoked the approved prompts — the run functions received `[PENDING]`
text on every call path, live or static.

---

## B. Root Cause

Part 2 created the panels before verifying whether the approved prompt
files existed at `ppbe/prompts/`. The placeholder strings were copied
from a Constraint #9 compliance comment and embedded directly as module
constants. Because the static tier intercepts calls when no live API key
is present — which covers all dev runs — the `[PENDING]` placeholder
propagated silently: the run function fired, the static path returned a
deterministic result, and no test asserted what `systemPrompt` had
actually been.

The defect was discovered post-session during the session-close review.

---

## C. Fix

**Approach:** Vite `?raw` import suffix — loads the `.md` file as a raw
string at build time. No hand-maintained constants file, no duplication,
no manual-sync risk between prompt source and what the panel sends.

**Panel changes (three files):**

| Panel | File | Prompt file loaded |
|---|---|---|
| PPBEAgentsPanel (evidence) | `module-apex/src/PPBEAgentsPanel.tsx` | `ppbe/prompts/evidence_synthesis_system.md` |
| PPBEAgentsPanel (scenario) | `module-apex/src/PPBEAgentsPanel.tsx` | `ppbe/prompts/scenario_analysis_system.md` |
| PPBEExhibitPanel | `module-scribe/src/PPBEExhibitPanel.tsx` | `ppbe/prompts/exhibit_drafting_system.md` |
| PPBECoordinationPanel | `module-nexus/src/PPBECoordinationPanel.tsx` | `ppbe/prompts/coordination_system.md` |

Each panel now uses:
```typescript
import evidencePromptRaw from "../../ppbe/prompts/evidence_synthesis_system.md?raw";
const EVIDENCE_SYSTEM_PROMPT = evidencePromptRaw.replace(/^<!--[\s\S]*?-->\s*/, "");
```

The `.replace()` strips the SOVEREIGN metadata comment block (`<!-- ... -->`) that
heads every prompt file, leaving only the approved prompt text that the
run function receives.

**Why `?raw` over a constants file:** The `?raw` suffix is built in to
Vite 5.4.11 (already installed). There is no duplication: the panel
imports the authoritative source file directly. A hand-maintained
constants file would be a second copy of the prompt that could silently
diverge from the approved source — the same class of bug that just
occurred.

---

## D. Jest Infrastructure for `?raw` in Tests

Vite resolves `?raw` natively. Jest does not; three additions per module
make it work:

**1. `src/raw-import.d.ts`** — TypeScript ambient declaration so `tsc`
(with `moduleResolution: bundler`) accepts `import text from '*.md?raw'`
without error:
```typescript
declare module '*.md?raw' {
  const content: string;
  export default content;
}
```

**2. `tests/raw-transformer.cjs`** — Jest transform that returns file
content as a CJS string export (`.cjs` extension required because all
three `package.json` files carry `"type": "module"`):
```js
module.exports = {
  process(sourceText) {
    return { code: `module.exports = ${JSON.stringify(sourceText)};` };
  },
};
```

**3. `package.json` jest config additions** (same pattern in all three
modules):
```json
"moduleNameMapper": {
  "^(.+\\.md)\\?raw$": "$1",
  ...
},
"transform": {
  "^.+\\.md$": "<rootDir>/tests/raw-transformer.cjs",
  ...
}
```

The `moduleNameMapper` regex strips the `?raw` suffix so Jest resolves
the plain `.md` path, then the `raw-transformer.cjs` intercepts that
`.md` require and returns the file content as the module value.
`isolatedModules: true` in ts-jest means the TypeScript compiler does
not error on `?raw` import paths during transpile.

---

## E. Prompt-Assertion Tests

One new `describe` block added to each panel test file. Each test uses
`jest.spyOn` without a mock implementation (the spy wraps the real
function; the static tier still handles execution). After clicking the
trigger button and waiting for completion, the test asserts that the
`systemPrompt` argument captured by the spy exactly equals the content of
the real `.md` file with the metadata header stripped.

| Test file | Spy target | systemPrompt arg index |
|---|---|---|
| `module-apex/tests/PPBEAgentsPanel.test.tsx` | `runEvidenceSynthesis` | 1 |
| `module-apex/tests/PPBEAgentsPanel.test.tsx` | `runScenarioAnalysis` | 1 |
| `module-scribe/tests/PPBEExhibitPanel.test.tsx` | `runExhibitDraft` | 1 |
| `module-nexus/tests/PPBECoordinationPanel.test.tsx` | `runCoordinationTracking` | 2 (`asOfIso` is arg 1) |

These tests are **independent of API key availability** — the static tier
runs in test, the spy captures the argument regardless. A regression to
any `[PENDING]` string or any prompt other than the approved file will
fail the suite immediately.

---

## F. Test Counts

Counts are for the three directly affected modules only. All other module
counts are unchanged from the Session 38 handoff.

| Module | Before fix | After fix | Delta |
|---|---|---|---|
| module-apex | 189 | 191 | +2 |
| module-scribe | 219 | 220 | +1 |
| module-nexus | 155 | 156 | +1 |
| **Three-module total** | **563** | **567** | **+4** |

**JS/TS platform total (all modules):** 1724 → **1728 passing**.
Zero regressions. All 24 apex suites, 24 scribe suites, and 18 nexus
suites exit 0.

---

## G. Governance Status

- **Shell contract v1.16:** Not touched. Both copies remain at
  `521a62daa77a1986a6e23fc2ee29c5bedf082933d7c42b4cd25eb0e7b4fd5fb7`.
- **Agent registry:** No change. All four PPBE agents were already
  registered. This fix wires them to their approved prompts; it does
  not register any new agent.
- **Prompt registry:** No change. The four prompts were already at
  `APPROVED v1.0`. This fix connects the panels to those existing
  approved prompts; no new prompt was authored or registered.
- **npm dependencies:** No new package added. See SBOM update.
- **No GD issued.**

---

## H. Open Items Inherited from Session 38

These are unchanged — this follow-up commit does not affect them:

- **Session 35 Part 1 live smoke run:** Project Principal action required
  (ANTHROPIC_API_KEY + RUN_PPBE_LIVE_SMOKE=1).
- **Walkthrough F re-verification:** Project Principal's call. This
  follow-up commit resolves the prompt-placeholder defect; it does not
  unilaterally close any Walkthrough F finding.

---

## I. Integration Brief Update Flags

1. **Test count:** JS/TS 1724 → **1728** (+4). Python 195 (unchanged).
   Platform total: **1928 passing** (+ 4 key-gated unchanged).
2. **Part 2 PPBE panels:** The `[PENDING]` prompt note in the Session 38
   handoff (Section G, "New prompts authored: None") is now superseded.
   The panels have been connected to the four APPROVED v1.0 prompts via
   `?raw` imports. No new prompts were authored — the existing approved
   files are now actually used.
3. **New Jest build tooling:** Six new internal files (three
   `raw-import.d.ts`, three `raw-transformer.cjs`) and three
   `package.json` jest config changes. No new npm dependency. See SBOM
   update `SBOM_Session38_PromptFix_Update.md`.

---

*SOVEREIGN_Session38_PromptFix_Handoff.md · Session 38 follow-up · July 17, 2026*
