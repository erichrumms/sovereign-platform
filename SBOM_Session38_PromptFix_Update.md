# SBOM Session 38 — Prompt-Placeholder Fix Update
**Date:** July 17, 2026 · **Session:** 38 follow-up (prompt-placeholder fix)
**Commit:** `12cb626`
**For merge into:** SBOM Registry (supplements SBOM_Session38_Update.md)

---

## New Build-Tooling Artifacts

### TypeScript Ambient Declarations (3 files — new)

| File | Kind |
|---|---|
| `module-apex/src/raw-import.d.ts` | Internal build tooling (TypeScript) |
| `module-scribe/src/raw-import.d.ts` | Internal build tooling (TypeScript) |
| `module-nexus/src/raw-import.d.ts` | Internal build tooling (TypeScript) |

Content is identical in all three. Declares the `*.md?raw` module pattern so
`tsc` with `moduleResolution: bundler` accepts Vite `?raw` import paths without
error. No runtime artifact — compile-time only.

### Jest Raw-File Transformers (3 files — new)

| File | Kind |
|---|---|
| `module-apex/tests/raw-transformer.cjs` | Internal build tooling (Jest transform) |
| `module-scribe/tests/raw-transformer.cjs` | Internal build tooling (Jest transform) |
| `module-nexus/tests/raw-transformer.cjs` | Internal build tooling (Jest transform) |

Content is identical in all three. Implements Jest's `{ process(sourceText) }`
transformer interface; returns the matched file's text as a CJS string export.
Zero external imports. `.cjs` extension is required because all three modules
carry `"type": "module"` in their `package.json`.

**Dependency classification — INTERNAL TOOLING, NOT A NEW NPM DEPENDENCY.**

The `raw-transformer.cjs` files import nothing. Jest's `transform` configuration
accepts any object implementing `process(sourceText)` without installation of any
package. No new entry appears in any module's `dependencies` or
`devDependencies`. Vite's `?raw` suffix is built into Vite 5.4.11 (already
installed). This is purely internal build tooling — a configuration artifact,
equivalent in nature to a `jest.setup.ts` or a tsconfig path alias.

---

## Changed Build-Configuration Artifacts

### package.json jest config — moduleNameMapper additions (3 files changed)

| File | Change |
|---|---|
| `module-apex/package.json` | Added `"^(.+\\.md)\\?raw$": "$1"` to `jest.moduleNameMapper` |
| `module-scribe/package.json` | Same |
| `module-nexus/package.json` | Same |

Strips the Vite `?raw` suffix from import paths before Jest resolves them,
allowing the plain `.md` path to reach the raw-transformer.

### package.json jest config — transform additions (3 files changed)

| File | Change |
|---|---|
| `module-apex/package.json` | Added `"^.+\\.md$": "<rootDir>/tests/raw-transformer.cjs"` to `jest.transform` |
| `module-scribe/package.json` | Same |
| `module-nexus/package.json` | Same |

Routes `.md` file requires through the raw-transformer so Jest returns file
content rather than attempting to parse Markdown as JavaScript.

---

## Changed Source Components

### Panel files — systemPrompt corrected (3 files changed)

| File | Change |
|---|---|
| `module-apex/src/PPBEAgentsPanel.tsx` | Replaced two `[PENDING]` string constants with `?raw` imports from `ppbe/prompts/evidence_synthesis_system.md` and `ppbe/prompts/scenario_analysis_system.md`. Metadata header stripped via `.replace(/^<!--[\s\S]*?-->\s*/, "")`. |
| `module-scribe/src/PPBEExhibitPanel.tsx` | Replaced `[PENDING]` string with `?raw` import from `ppbe/prompts/exhibit_drafting_system.md`. Same strip. |
| `module-nexus/src/PPBECoordinationPanel.tsx` | Replaced `[PENDING]` string with `?raw` import from `ppbe/prompts/coordination_system.md`. Same strip. |

The prompt files themselves (`ppbe/prompts/*.md`) are unchanged — all four
were already at `STATUS: APPROVED v1.0` before Session 38. This fix wires
the panels to those existing files; no prompt was authored or modified.

---

## Changed Test Files

### Prompt-assertion tests added (3 files changed)

| File | Tests added | Spy target | Asserts |
|---|---|---|---|
| `module-apex/tests/PPBEAgentsPanel.test.tsx` | +2 | `runEvidenceSynthesis` (arg 1), `runScenarioAnalysis` (arg 1) | `systemPrompt` arg equals `fs.readFileSync(promptFile)` with metadata stripped |
| `module-scribe/tests/PPBEExhibitPanel.test.tsx` | +1 | `runExhibitDraft` (arg 1) | Same |
| `module-nexus/tests/PPBECoordinationPanel.test.tsx` | +1 | `runCoordinationTracking` (arg 2; `asOfIso` is arg 1) | Same |

Tests use `jest.spyOn` without a mock implementation (real function runs,
static tier handles execution). Guard is independent of API key availability.

---

## Unchanged Governance Artifacts

- **Shell contract:** v1.16, SHA-256
  `521a62daa77a1986a6e23fc2ee29c5bedf082933d7c42b4cd25eb0e7b4fd5fb7` —
  not touched.
- **Agent registry:** 44 — unchanged.
- **Prompt registry:** 20 (19 approved + 1 pending) — unchanged. The four
  PPBE prompts were already at APPROVED v1.0. This fix connects the panels
  to those existing files; no new prompt file was created or modified.
- **npm dependencies / devDependencies:** No additions, no removals, no
  version changes in any module.
- **sovereign-data:** 1.6.0 — unchanged.
- **No GD issued.**

---

## Test Count Delta (affected modules only)

| Module | Before | After | Delta |
|---|---|---|---|
| module-apex | 189 | 191 | +2 |
| module-scribe | 219 | 220 | +1 |
| module-nexus | 155 | 156 | +1 |

JS/TS platform total: 1724 → **1728 passing**. All other module counts
unchanged from SBOM_Session38_Update.md.

---

*SBOM_Session38_PromptFix_Update.md · July 17, 2026*
