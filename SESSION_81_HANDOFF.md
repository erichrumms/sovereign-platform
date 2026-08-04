# Session 81 Handoff — Platform-Wide Agent-Plumbing Audit
## August 4, 2026

---

## Purpose

Follow-on to Session 80 (browser-safety hotfix). Session 80 fixed bare `process.env`
references in `sovereign-api-client` that threw `"Can't find variable: process"` in a
real browser and silently routed every live call to the static fallback tier. This
session audited the entire platform for (1) any remaining instance of that bug class,
(2) the structural soundness of every real agent live-call site, (3) drift across the
seven module-local `anthropic-key.ts` copies, and (4) the GovCloud path.

**Result in one line: zero new instances of the Session 80 bug class anywhere in the
platform (no code changes made); two findings recorded below for Project Principal
review, neither fixed this session by design.**

---

## Part 1 — Repo-Wide Sweep for the Session 80 Bug Class

Method: `git grep` across all `*.ts`/`*.tsx` source (tests, `__mocks__`, and jest
config excluded) for `process.env`, `process.platform`, `process.cwd`, `process.argv`,
`process.exit`, `__dirname`, `__filename`, and `require(`.

### Every `process.env` reference in non-test source, with guard status

| File:Line | Status |
|---|---|
| `sovereign-api-client/src/ollama-endpoint.ts:18,25` | Guarded — the canonical pattern (`typeof process !== "undefined" ? process.env : undefined`) |
| `sovereign-api-client/src/base-client.ts:250,364` | Guarded (Session 80 fix) |
| `sovereign-api-client/src/anthropic-client.ts:241,269` | Guarded (Session 80 fix; line 169 is a doc comment, not code) |
| `module-agentos/src/evaluate-endpoint.ts:19,26` | Guarded — equivalent variant (`if (typeof process === "undefined" \|\| !process.env) return …`). Functionally sound; pre-dates Session 80. Style differs from the canonical pattern but the behavior is identical: no `process` access unless it exists. |
| `module-flowpath/src/anthropic-key.ts:10` | Comment only ("NEVER use process.env here") — not code |

### Other Node-only globals

- `process.platform` / `process.cwd` / `process.argv` / `process.exit` / `__dirname` /
  `__filename`: **zero hits** in non-test source.
- `require(`: **zero hits** in non-test TypeScript source.

### `import.meta.env` readers (not the bug class — verified anyway)

Nine files read env via `import.meta.env` with an optional-`env` cast:
`anthropic-key.ts` in module-apex/counsel/cpmi/flowpath/lens/scribe/vigil (line 17 or 18
in each), `module-cpmi/src/cpmi-world-model-endpoint.ts:20`,
`module-vigil/src/vigil-endpoint.ts:21`. `import.meta` is ESM, resolved by Vite at build
time — it exists in the browser bundle, so this is browser-safe by construction. Jest
maps each to a node stub via `moduleNameMapper`. Not affected by the Session 80 bug.

**Fixes applied this session: none — no unfixed instance of the bug class exists.**

---

## Part 2 — Every Real Agent Live-Call Site

The docs/31 baseline listed 10 instrumented sites. The full enumeration is larger:
**18 `createSovereignClient()` call sites** (all `tier: "standard"`, all obtaining the
key via a module-local `readAnthropicKey()`), plus deterministic-engine and
display-only emitters that are not LLM calls. Each site below was traced from trigger
to live response or labeled fallback.

### LLM live-call sites (18)

| # | Site | Events emitted | token_usage | Verdict |
|---|---|---|---|---|
| 1 | `module-vigil/src/useApprovalBrief.ts:98` | AGENT_STEP_START/COMPLETE, FALLBACK_ACTIVATED | ✓ (line 144) | SOUND |
| 2 | `module-vigil/src/useTriage.ts:127` | AGENT_STEP_*, FALLBACK_ACTIVATED, TRIAGE_ANALYSIS_PRODUCED | ✓ (line 173) | SOUND |
| 3 | `module-scribe/src/useDraft.ts:118` | AGENT_STEP_*, FALLBACK_ACTIVATED | ✓ (line 164) | SOUND |
| 4 | `module-scribe/src/useIntermediate.ts:107` | AGENT_STEP_*, FALLBACK_ACTIVATED | ✓ (line 155) | SOUND |
| 5 | `module-scribe/src/useStyleProfile.ts:137` | AGENT_STEP_*, FALLBACK_ACTIVATED, HUMAN_DECISION (save) | ✓ (line 188) | SOUND |
| 6 | `module-scribe/src/useTTDraft.ts:146` | AGENT_STEP_*, FALLBACK_ACTIVATED | ✓ (line 198) | SOUND |
| 7 | `module-scribe/src/PPBEExhibitPanel.tsx:172` | none (advisory-only by design; static tier disclosed in UI) | n/a | SOUND |
| 8 | `module-lens/src/useExplanation.ts:135` | AGENT_STEP_*, FALLBACK_ACTIVATED | ✓ (line 183) | SOUND |
| 9 | `module-cpmi/src/useReasoningChain.ts:119` | AGENT_STEP_*, FALLBACK_ACTIVATED, CPMI_REASONING_CHAIN_COMPLETE | ✓ (line 162) | SOUND |
| 10 | `module-cpmi/src/useBenchmark.ts:85` | AGENT_STEP_* (per-scenario fallbacks handled in engine) | ✓ (line 122, aggregated) | SOUND |
| 11 | `module-nexus/src/NexusApp.tsx:145` (travelDrafter port) | AGENT_STEP_*, FALLBACK_ACTIVATED | ✓ (line 182) | **FINDING F1** (Gate 2 — below) |
| 12 | `module-nexus/src/PPBECoordinationPanel.tsx:78` | none (advisory-only by design) | n/a | SOUND |
| 13 | `module-counsel/src/useAnalysis.ts:98` | REASONING_STEP_START/COMPLETE, FALLBACK_ACTIVATED | absent — correct (COUNSEL emits REASONING_STEP_*, out of docs/31 scope by design) | SOUND |
| 14 | `module-counsel/src/usePreMortem.ts:94` | REASONING_STEP_*, FALLBACK_ACTIVATED | absent — correct | SOUND |
| 15 | `module-counsel/src/useCounterargument.ts:96` | REASONING_STEP_*, FALLBACK_ACTIVATED | absent — correct | SOUND |
| 16 | `module-apex/src/useApexAnalysis.ts:107` | APEX_ANALYSIS_STARTED/COMPLETE (tier in payload, line 135) | n/a (product events, not AGENT_STEP_COMPLETE) | SOUND |
| 17 | `module-apex/src/PPBEAgentsPanel.tsx:64` (evidence-synthesizer + scenario-analyst) | none (advisory; static tier disclosed via StaticTierNote, lines 208–215) | n/a | SOUND |
| 18 | `module-flowpath/src/useFlowpathElicitation.ts:108` | FLOWPATH_GATE_FAILED / four FLOWPATH_* artifact events (tier in payload, line 142) | n/a | SOUND |

Common structure verified at every site: `createSovereignClient({ tier: "standard" },
{ api_key_anthropic: readAnthropicKey() })` is constructed inside the injectable
`deps.complete` closure; when the key is absent, the factory throws
(`sovereign-api-client/src/index.ts:209–215`) and that throw is caught by the owning
engine's try-catch (e.g. `draft-engine.ts:244–258`, `analysis-engine.ts:178`,
`apex-analysis.ts:166–181`, `flowpath-mapper.ts:152–169`), which routes to cache →
static with the serving tier honestly labeled (`result.tier !== "live"` →
FALLBACK_ACTIVATED or a UI static-tier disclosure). No site consumes a `complete()`
result without carrying its tier.

**The docs/31 "10 instrumented sites" claim is confirmed exact:** sites 1–6, 8–11
above are the ten AGENT_STEP_COMPLETE emitters carrying `token_usage` with
`estimated_cost_usd`; fallback paths leave it absent, never zero.

### Non-LLM emitters (verified not live-call sites)

| Site | Role |
|---|---|
| `module-nexus/src/useTTIntake.ts:381–409` | AGENT_STEP_* bracketing around the **deterministic** tt.time-compliance-engine (`module-apex/src/tt-time-compliance-engine.ts` — pure, no LLM). Gate 2 try-catch present. |
| `module-nexus/src/tt-travel-queue.ts:77–140` | AGENT_STEP_* for tt.travel-compliance-engine and tt.travel-router — both deterministic, no LLM. Emissions run inside useTTIntake's Gate 2 try-catch (`useTTIntake.ts:262–283`). |
| `module-vigil/src/security-query.ts` | Synthetic read-only data port (`synthetic: true`, lines 103–124). No LLM call, no emission. |
| `module-aria/src/tracer-integration.ts` | Historical/lineage AGENT_STEP_COMPLETE records in demo data (lines 141–172), not emissions. |
| `module-lens/src/AITransparencyPanel.tsx`, `module-workspace/src/WorkspaceApp.tsx` | Read/display Logger events only; WorkspaceApp's cost dashboard filters to `AGENT_STEP_COMPLETE && token_usage != null` (line 722). Neither emits. |

---

## Part 3 — anthropic-key.ts Consistency Check

The seven module-local copies (`module-apex`, `module-counsel`, `module-cpmi`,
`module-flowpath`, `module-lens`, `module-scribe`, `module-vigil`, each at
`src/anthropic-key.ts`) have **seven different byte-level SHA-256 hashes** — but the
drift is **header-comment-only**: each file's header names its own module, session, and
date, and module-flowpath's adds a spec §13 note. With comments and blank lines
stripped, **all seven hash to the same value**:

```
30832ea3d72ea11b87643799926fcb8618993aebf7385151a00465452af42215  (all 7, comment-stripped)
```

The functional body is identical in every copy: read
`import.meta.env.VITE_ANTHROPIC_API_KEY` via an optional-`env` cast, return
`undefined` when absent. **No functional drift. No action needed.** If byte-identity
across copies is ever wanted as an invariant, that is a governance decision (the
per-module headers are intentional).

---

## Part 4 — GovCloud Path

1. **Guard status:** `govcloud-client.ts` contains **no `process.env` reference at
   all** (verified by the Part 1 sweep) — the Session 80 guard is not needed there.
2. **Selection:** `createSovereignClient()` selects `GovCloudClient` for
   `tier: "enhanced"` (`sovereign-api-client/src/index.ts:226–239`). A repo-wide grep
   found **no product code passing `tier: "enhanced"`** — every one of the 18 call
   sites uses `"standard"`. The GovCloud path is currently unreachable from products.
3. **Dormant by design:** R7 (Tier 2 provider decision) is OPEN. The endpoint is the
   named placeholder `UNRESOLVED_PENDING_GOVCLOUD_DECISION`
   (`govcloud-client.ts:75`); `callProvider()` throws
   `GovCloudNotYetResolvedException` (`govcloud-client.ts:281–286, 305`), which the
   base client's three-tier fallback catches and converts to the static response. The
   mirror-image tier guards hold: `AnthropicClient.complete()` rejects `"enhanced"`
   (`anthropic-client.ts:219–227`); `GovCloudClient.complete()` rejects `"standard"`
   (`govcloud-client.ts:220–226`).
4. **Not configured in this environment:** the `sovereign_config.yaml` referenced by
   the governance notice does not exist in the repo — only comments and the
   placeholder constants reference it. This matches the documented pre-R7 posture.

**Verdict: structurally sound, dormant by design, not a finding.**

---

## Findings for Project Principal Review (NOT fixed this session, by instruction)

### F1 — NexusApp.tsx travelDrafter: Gate 2 fail-closed is claimed but not implemented

**What's wrong.** `module-nexus/src/NexusApp.tsx` states — in its own header (line 32:
"Gate 2 applies (failed START aborts the draft)") and inline (line 128: "Gate 2:
AGENT_STEP_START. A failed emit aborts (fail-closed, Constraint #6)") — that Gate 2
applies to the travelDrafter port. But none of its three Logger emissions is
protected: `AGENT_STEP_START` (lines 129–139), `FALLBACK_ACTIVATED` (lines 159–169),
and `AGENT_STEP_COMPLETE` (lines 172–183) are all bare `ctx.logger.log()` calls with
no try-catch. Every other AGENT_STEP emitter follows the fail-closed pattern (e.g.
`useDraft.ts:87–109` wraps START and returns on error; `useTTIntake.ts:262–283`
wraps its deterministic-engine bracketing).

**Why it matters.** Because the port is an async function, a throwing `log()` rejects
the promise and is caught downstream in `useTTIntake.ts` (line ~334) as a generic
`draftStatus: "error"`. Two consequences: (a) the abort happens by accident of promise
mechanics, not by the specified fail-closed contract at the emission site; (b) if the
COMPLETE emit fails *after* a successful draft, the produced draft is discarded and
the audit trail is left with an unpaired START — a different failure mode than the
spec describes. No data loss or mislabeled tier occurs; this is a contract/consistency
defect, not a live-call defect. `token_usage` threading at line 182 is correct.

**Options.**
1. **Apply the established pattern** — wrap the three emissions in try-catch exactly
   as `useDraft.ts` does, returning a labeled abort from the port that `useTTIntake`
   surfaces. Tradeoffs: smallest change consistent with the spec; requires deciding
   the port's abort return shape (its `draft()` contract currently has no error
   variant) and one new test; touches a Session 30 deliverable.
2. **Amend the comment/spec to match the code** — document that Gate 2 enforcement for
   this port is delegated to useTTIntake's downstream catch. Tradeoffs: zero code
   risk, but it weakens Gate 2's fail-closed-at-emission-site rule for exactly one
   site and leaves the unpaired-START failure mode in place; since Gate 2 is a
   standing constraint, rewording its application is arguably a Governance Agent
   call, not a code comment edit.
3. **Move the Logger bracketing into useTTIntake** — emit START/COMPLETE around
   `drafter.draft()` where Gate 2 protection already exists, leaving the port purely
   functional. Tradeoffs: cleanest layering, but a larger refactor that changes event
   ownership and touches both files plus their tests.

### F2 — e2e workspace fails `tsc --noEmit` (pre-existing, one line)

**What's wrong.** `e2e/tests/startup-publish-convergence.test.ts(22,1)`: TS6133 —
`SYNTH_PPBE_PROGRAMS` is imported from `@sovereign/data` and never used. All other 14
workspaces typecheck clean. The import dates to Session 72 at the latest (commit
`0d3bae9` is the last touch of the file); it was present before this session on a
clean tree.

**Why it matters.** The session-close gate "tsc --noEmit clean on all workspaces"
cannot currently be honestly claimed for e2e. Jest runs the file fine (its transform
does not enforce unused-local checks), which is why the test suite stays green.

**Options.**
1. **Delete the unused import** — one line, zero behavior change. Tradeoff: none of
   substance; left unfixed this session only because it is not the Session 80 bug
   class and this session's instruction was to fix that class alone.
2. **Prefix with underscore or `void` it** — signals intent to use later. Tradeoff:
   keeps dead code with no evidence it will be needed.
3. **Relax `noUnusedLocals` for e2e tsconfig** — not recommended; hides future dead
   code across the whole workspace.

---

## Carried-Forward Open Items (from Session 80, unchanged)

- `SOVEREIGN_CLIENT_DEBUG` diagnostic gates remain in `base-client.ts` and
  `anthropic-client.ts` ("Remove after live-call failure is diagnosed" — the cause is
  now diagnosed and fixed; removal or conversion to a permanent structured diagnostic
  is a pending cleanup decision).
- `ConsoleClientLogger` logs unconditionally in browser environments (undefined
  `NODE_ENV` ≠ "production"). Acceptable for now per Session 80.
- Live browser verification of each call path is explicitly **separate, later work**
  — this session confirmed the code is wired correctly, not runtime behavior.

---

## Test Results at Close

No source files were changed this session, and the full suite was run anyway per the
close rule.

| Suite | Result |
|---|---|
| JS/TS (14 packages, per-workspace run, summed) | **1,862 passing** — identical per-package to Session 80 (data 163, api-client 181, shell 19, counsel 100, scribe 240, vigil 215, lens 63, cpmi 62, agentos 89, nexus 168, apex 228, flowpath 151, aria 150, workspace 33) |
| e2e | **149 passing, 4 skipped** (key-gated live smoke) |
| Python (`sovereign-security`, full pytest run) | **195 passed** — this session ran the real suite; the figure Session 80 carried forward is now directly re-verified (the `def test_` grep gap of 192 vs 195 is a counting-method artifact, not missing tests) |
| **Platform total** | **2,206** |
| `tsc --noEmit` | Clean on 14 of 15 workspaces; e2e fails with the one pre-existing TS6133 (Finding F2) |
| Shell contract | v1.26, both copies SHA-256 identical and matching the recorded value: `42a479cab397de93246d05bef7c90959d33f9a5b7d2fc4b74c39cd397951697b` |

```
Tests:       1,862 JS/TS passing (14 packages)
             149 e2e passing (4 skipped)
             195 Python passing
```

---

## Session Close Checklist

- [x] Repo-wide sweep for the Session 80 bug class — zero unfixed instances (Part 1)
- [x] Every live-call site enumerated and traced — 18 sites + non-LLM emitters (Part 2)
- [x] anthropic-key.ts consistency — header-only drift, functional bodies identical (Part 3)
- [x] GovCloud path — no guard needed, unreachable from products, dormant by design (Part 4)
- [x] Zero code changes — no new bug-class instances existed to fix
- [x] Two findings recorded with options, left for follow-on by instruction (F1, F2)
- [x] Full test suite run at close: 1,862 + 149 e2e + 195 Python = 2,206
- [x] tsc --noEmit run on all 15 workspaces (14 clean; e2e = pre-existing F2)
- [x] Shell contract SHA-256 re-verified, both copies, matches recorded v1.26 value
- [x] SBOM v1.49 written (`SBOM_Session81_Update.md`)
- [x] Handoff written (this file)
- [x] Both files committed
- [x] Both files copied to Desktop
- [x] `git push` executed — output shown in session log

---

*Session 81 · August 4, 2026 · SOVEREIGN Platform*
*Build Agent — platform-wide agent-plumbing audit*
