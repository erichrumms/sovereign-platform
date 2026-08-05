# SOVEREIGN Platform — Session 85 Handoff
**Date:** August 4, 2026
**Session:** 85
**Scope:** Root-cause diagnosis and fix — why every live AI call all evening served a
static/fallback response despite the real fixes of Sessions 80–84

---

## Root cause — found, fixed, proven

**The Anthropic API key stored in `sovereign-shell/.env.local` was invalid — a paste
artifact, not a code defect.** The stored value was 118 characters: a 10-character
redacted *display* prefix (`sk-ant-...`, the elided form a dashboard shows when it
truncates a key for display) accidentally pasted in front of the real 108-character key.

Every live call therefore reached Anthropic and was rejected `401 authentication_error:
invalid x-api-key`. The platform's three-tier fallback then did exactly what it is
designed to do — swallowed the error and served the static tier — which is why the UI
showed fallback briefs and the Cost Dashboard stayed at zero all evening, with no
visible error anywhere. Sessions 80–84's fixes were all real and all necessary; none of
them could have fixed this, because the failure was in the credential value itself.

### Evidence chain (all commands run for real this session)

1. **Key as stored → rejected.** One `curl` direct to `api.anthropic.com/v1/messages`
   using the exact value from `.env.local`, bypassing the browser entirely:
   `HTTP 401 {"type":"error","error":{"type":"authentication_error","message":"invalid x-api-key"}}`
2. **Structural analysis (value never displayed):** length 118; contains `sk-ant` twice;
   contains exactly 3 characters outside the key alphabet (the literal `...` dots);
   begins `sk-ant-...sk-`. 10 junk characters + 108-character real key = 118.
3. **Junk prefix stripped → accepted.** Same `curl` with the 10-character prefix
   removed: `HTTP 200`, a real completion (`"OK"`), real usage
   (`input_tokens: 14, output_tokens: 4`), `model: claude-sonnet-4-6`.
4. **Fix applied and re-proven.** `.env.local` now holds the corrected 108-character
   key (`sk-ant-api03-` shape). A final `curl` reading the value *from the fixed file*
   returned `HTTP 200` with real usage. The pre-fix file was backed up **outside the
   repository** at `~/.sovereign-env-backup-session85` (delete after confirming in the
   browser; it should not live anywhere long-term).

### Why "the key is confirmed present and reaching the app" was true yet insufficient

The live diagnostic confirmed the key's *presence* in the running app — it never tested
the key's *validity*. The value looked plausible (starts `sk-ant-`, roughly the right
length), so every eye that checked it passed it. Presence, format, and validity are
three different claims; only a real authenticated request tests the third.

---

## The six candidates, each closed with evidence

| # | Candidate | Verdict | Evidence |
|---|-----------|---------|----------|
| 1 | Dev server serving stale code | **Moot at open; now verified fresh.** | Nothing was listening on port 3000 at session open (`lsof` empty) — no server was running at all. Started fresh this session; the served, Vite-transformed modules were then fetched over HTTP and verified to contain the Session 84 CORS header (1 occurrence in served `anthropic-client.ts`) and the corrected key (valid `sk-ant-api03` shape present, junk prefix absent). **Server left running for browser confirmation.** |
| 2 | Stale failed result in the brief cache | **Impossible by construction.** | `module-vigil/src/approval-engine.ts:211` — `cacheSet` runs only on a *successful* live brief. `sovereign-api-client/src/base-client.ts:460` — same pattern; only live responses are cached. A failure can never be cached, so no cache can replay one. Additionally the vigil cache is a `useRef` map — per mount, not persistent. |
| 3 | Key invalid / billing off | **CONFIRMED — this was the root cause.** Fixed. | Evidence chain above. Billing is active (real tokens billed on the 200s). |
| 4 | Model name invalid | **Cleared.** | `claude-sonnet-4-6` accepted on all three live curls; response echoes the model id. |
| 5 | A config flag disabling live calls | **Cleared.** | Full census of `VITE_*` variables referenced in source: `VITE_ANTHROPIC_API_KEY`, `VITE_CPMI_WORLD_MODEL_ENDPOINT`, `VITE_EVALUATE_ENABLED`, `VITE_EVALUATE_ENDPOINT`, `VITE_NOTION_API_KEY`, `VITE_OLLAMA_ENABLED`, `VITE_OLLAMA_ENDPOINT`, `VITE_VIGIL_ALERT_ENDPOINT`. `.env.local` sets only the Anthropic key; every other flag is unset, and unset defaults route to the Anthropic path. No kill-switch exists for live calls — key presence is the only gate (`createSovereignClient` throws without it; the engine catches and degrades). |
| 6 | Other structural blockers | **None found.** Two adjacent observations recorded below. | Key plumbing verified end-to-end: modules are npm workspaces imported as source (`main: src/index.ts`), so the shell's Vite compiles module code and inlines the shell's `.env.local` values — confirmed in the served output. |

### Adjacent observations (not blockers, worth knowing)

- **The 401 was visible all along, one layer down.** `base-client.ts` emits
  `FALLBACK_ACTIVATED` with `payload.detail` carrying the provider error message
  (`complete()` catch block, base-client.ts:361–374). The browser console had
  "Anthropic API error 401 (authentication_error)…" in it on every attempt. A future
  session may want the fallback `detail` surfaced in the Cost Dashboard or brief panel
  so a credential failure is distinguishable from a network failure at UI level.
- **Default `max_tokens` is 1,000** (base-client default). Fine for briefs; known to
  truncate long multi-finding PPBE/APEX outputs (Session 35 record). Unchanged — flagged
  only because live output now actually flows.

---

## The stray `console.log` — does not exist (handoff claim was a documentation error)

The Session 83/84 handoffs both carried forward "remove the stray `console.log` in
`module-vigil/src/useApprovalBrief.ts`." Verified this session, per the Session 61
lesson (verify repository *state* claims before writing them down):

- `grep console.log module-vigil/src/` — zero matches, whole module.
- `git log -S "console.log" -- module-vigil/src/useApprovalBrief.ts` — zero commits:
  no `console.log` has **ever** existed in that file's history.
- Working tree was clean at session open, so disk matched HEAD.

Nothing to remove. The open item is closed as *invalid*, and the claim should not be
carried into future handoffs. (Likely origin: the Session 84 session-open `git status`
observation attributed a debug line to the wrong file; whatever it saw is not in the
repository today.)

---

## What was NOT changed

No production source file, test file, or dependency was touched this session. The only
repository changes are this handoff and `SBOM_Session85_Update.md`. The fix itself
lives in `sovereign-shell/.env.local`, which is git-ignored (`.gitignore:23`) and
carries no history — by design, keys never enter the repository.

---

## Test results (full run at close, per-workspace method)

```
sovereign-data:       163 passed
sovereign-api-client: 185 passed
sovereign-shell:       19 passed
module-counsel:       100 passed
module-scribe:        240 passed
module-vigil:         215 passed
module-lens:           63 passed
module-cpmi:           62 passed
module-agentos:        89 passed
module-nexus:         169 passed
module-apex:          228 passed
module-flowpath:      152 passed
module-aria:          150 passed
module-workspace:      33 passed
Total:              1,868 passed   (unchanged from Session 84 — no code changed)
```

`tsc --noEmit`: **all 15 workspaces clean** (e2e has no `lint` script; verified by
running `npx tsc --noEmit` in `e2e/` directly).

Shell contract: **v1.26**, both copies re-verified identical —
`42a479cab397de93246d05bef7c90959d33f9a5b7d2fc4b74c39cd397951697b`.

---

## For the next session

1. **Browser confirmation (the one step only the Project Principal can do):** the dev
   server was left running on port 3000 with the corrected key. Open VIGIL, generate an
   approval brief — expect a real, labeled-section AI brief (tier `live`) and a nonzero
   Cost Dashboard. If the server has since stopped: `npm run dev` from the repo root.
2. Delete `~/.sovereign-env-backup-session85` once the browser test passes.
3. Consider surfacing `FALLBACK_ACTIVATED` `payload.detail` in the UI (Cost Dashboard
   or brief panel) so a 401 is never invisible again — needs a Governance decision on
   placement; surfaced here, not designed here.
4. The production-path item stands unchanged: browser-held keys are a dev/demo posture;
   production must route through a backend proxy (Session 84 record).

---

## SBOM

`SBOM_Session85_Update.md` — v1.53. Zero code changes, zero new dependencies, test
totals unchanged. All 15 workspaces type-clean.
