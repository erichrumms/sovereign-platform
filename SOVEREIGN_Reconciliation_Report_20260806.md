# SOVEREIGN Platform — Reconciliation Report
## August 6, 2026 — Build Agent Audit Pass

**Purpose:** Evidence-backed reconciliation of four specific disagreements found
across the August 6, 2026 documentation set. Each finding below is backed by a
direct `grep` or file read against the real repository; nothing here is
reconstructed from memory.

**Scope:** Audit only — no product code was modified, no governance document was
rewritten.

---

## Check 1 — Do Rules 15, 16, or 17 exist anywhere in the real repo?

**Result: Yes — they exist in `AGENT_REFERENCE_Addendum_20260730.md` at repo
root, not in `AGENT_REFERENCE.md` itself.**

Direct confirmation:

```
$ grep -n "## New Rule" AGENT_REFERENCE_Addendum_20260730.md
13:## New Rule — Rule 15
27:## New Rule — Rule 16
39:## New Rule — Rule 17
```

The Addendum file is `AGENT_REFERENCE_Addendum_20260730.md`, committed July 30,
2026. Its header states:

> "Append after the existing v3.4 content (Rules 1-14, Lessons 1-29) — do not
> replace... This addendum should be merged in by whoever has the complete file,
> preserving everything currently there."

That merge has not happened: the main `AGENT_REFERENCE.md` is currently v3.4
(version header confirmed at file line 4: `**Version: 3.4 — August 5, 2026**`).
Its final named rule is:

```
AGENT_REFERENCE.md line 1648:
### Rule 14 — [Deliberately unassigned]
```

```
AGENT_REFERENCE.md lines 1650-1654:
Rule 14 is reserved as explicitly unassigned. Session 94 confirmed that "Rule 14"
appeared only as the silent fourth member of a "Rules 11-14" group reference in
docs/36 and had no individual citation, definition, or description anywhere in the
repository. No fourth principle was identified. This number is held open rather
than filled, pending a Governance Agent / Project Principal decision to assign it.
```

The Addendum's Rule 15, 16, and 17 definitions (quoted verbatim):

**Rule 15** (Addendum line 13-25): A Handoff's description of a code change must
be written with the diff open, quoting only text that appears verbatim in real
`git show` or `git diff` output — never reconstructed from what the change was
intended to do.

**Rule 16** (Addendum line 27-37): A finding that de-risks a question is not the
same claim as one that answers it, and both deserve to be stated separately.

**Rule 17** (Addendum line 39-72): A tool's or safeguard's continued existence is
not evidence of its continued use — check whether it's actually active, not just
whether it's still listed. Covers two application domains: governance documents
and monitoring-agent thresholds. Scope widened August 5, 2026 (Session 95) to
cover the monitoring-agent domain, per Session 94 Finding C.

**What needs correcting:** Any document that cites Rules 15-17 as existing in
`AGENT_REFERENCE.md` is citing the Addendum, not the main document. The rules
exist and are authoritative; their physical home is the Addendum, which has not
yet been folded into a v3.5 main document. Documents that refer to
"AGENT_REFERENCE.md Rules 15-17" are technically citing the wrong file. The
fix is a v3.5 merge pass, not rule redefinition.

---

## Check 2 — Real cost-tracking coverage count

**Result: 14 instrumented, 5 uninstrumented, 19 total live LLM call sites.
Neither "14 of 14" nor "14 of 18" is correct.**

### How the count was established

All non-test, non-mock TypeScript/TSX files across the platform were searched for
Anthropic API imports, then each confirmed call site was checked for `token_usage`
wiring (`computeEstimatedCostUSD`, `input_tokens`, `output_tokens`).

```
$ find . -name "*.ts" -o -name "*.tsx" | grep -v "node_modules|__mocks__|\.test\.|spec\.|\.d\.ts" \
  | xargs grep -l "anthropic|Anthropic" | sort
```

Deterministic steps (AGENT_STEP_COMPLETE events without any real LLM call — confirmed
by the absence of any Anthropic import and by inline code comments) were excluded.
Specifically: `module-nexus/src/tt-travel-queue.ts` and
`module-nexus/src/useTTIntake.ts` emit `AGENT_STEP_COMPLETE` for rule-based steps
that make no live model call. `tt-travel-compliance-engine.ts` line 13 states
explicitly: "NO LLM call." These three files were excluded from the live-call count.

### Instrumented sites — 14 confirmed

Confirmed by `grep -rn "token_usage|computeEstimatedCostUSD|input_tokens" <path>`:

| Module | File | Result |
|---|---|---|
| VIGIL | `module-vigil/src/useApprovalBrief.ts` | ✓ instrumented |
| VIGIL | `module-vigil/src/useTriage.ts` | ✓ instrumented |
| SCRIBE | `module-scribe/src/useDraft.ts` | ✓ instrumented |
| SCRIBE | `module-scribe/src/useIntermediate.ts` | ✓ instrumented |
| SCRIBE | `module-scribe/src/usePPBEExhibitDraft.ts` | ✓ instrumented |
| SCRIBE | `module-scribe/src/useStyleProfile.ts` | ✓ instrumented |
| SCRIBE | `module-scribe/src/useTTDraft.ts` | ✓ instrumented |
| NEXUS | `module-nexus/src/NexusApp.tsx` | ✓ instrumented |
| NEXUS | `module-nexus/src/usePPBECoordinationTracking.ts` | ✓ instrumented |
| CPMI | `module-cpmi/src/useBenchmark.ts` | ✓ instrumented |
| CPMI | `module-cpmi/src/useReasoningChain.ts` | ✓ instrumented |
| LENS | `module-lens/src/useExplanation.ts` | ✓ instrumented |
| APEX | `module-apex/src/usePPBEEvidenceSynthesis.ts` | ✓ instrumented |
| APEX | `module-apex/src/usePPBEScenarioAnalysis.ts` | ✓ instrumented |

### Uninstrumented sites — 5 confirmed

Direct check: `grep -n "token_usage|computeEstimatedCostUSD" <file>` returned no
output for any of the following:

| Module | File | Event type used |
|---|---|---|
| COUNSEL | `module-counsel/src/useAnalysis.ts` | `REASONING_STEP_COMPLETE` — no `token_usage` |
| COUNSEL | `module-counsel/src/useCounterargument.ts` | `REASONING_STEP_COMPLETE` — no `token_usage` |
| COUNSEL | `module-counsel/src/usePreMortem.ts` | `REASONING_STEP_COMPLETE` — no `token_usage` |
| FLOWPATH | `module-flowpath/src/useFlowpathElicitation.ts` | no `token_usage` |
| APEX | `module-apex/src/useApexAnalysis.ts` | no `token_usage` |

### What the arithmetic shows

- 14 + 5 = **19 total** real live LLM call sites
- Coverage: **14 of 19** (not 14 of 14, not 14 of 18)
- Gap: **5 uninstrumented** (not 4)

**The existing documents' named list is correct:** FLOWPATH's
`useFlowpathElicitation`, APEX's `useApexAnalysis`, and three COUNSEL
`REASONING_STEP_*` sites — that is exactly five named items. The arithmetic
"14 of 18" is inconsistent with its own list: five uninstrumented plus
fourteen instrumented equals nineteen, not eighteen. The list is right;
the arithmetic is wrong by one.

**"14 of 14" (complete coverage)** is wrong in both directions: coverage is
incomplete (5 sites uninstrumented) and the total is not 14.

**What needs correcting:** Documents that state "14 of 18" should be corrected
to "14 of 19," with the gap stated as five uninstrumented sites, not four.
Documents that state "14 of 14" (complete) should be corrected to "14 of 19
(five uninstrumented: three COUNSEL REASONING_STEP_* hooks, FLOWPATH
useFlowpathElicitation, APEX useApexAnalysis)."

---

## Check 3 — Real, evidence-backed self-correction count

**Result: Four documented self-corrections are on record in the repo.
The CTO Demo Script (July 30, 2026, the current repo version) names only two —
it predates Sessions 92 and 94. No "v3.11" Strategic Plan exists in the repo.**

### The four real, cited instances

**1. Session 73 — Fabricated Handoff section**
Source: `SBOM_Registry_v1.44.md` §4, lines 84-88:
> "The original Handoff for this session contained a fabricated section — specific,
> detailed tooltip text for three modules that were never touched. Caught by direct
> challenge, corrected across two full verification rounds with real `git show`
> evidence throughout; originals retained in repository history, not deleted."

Also formalized as Rule 15 in `AGENT_REFERENCE_Addendum_20260730.md` lines 18-25.

**2. Session 75 — Snapshot-count double-error**
Source: `SBOM_Registry_v1.44.md` §3 line 60, §4 lines 100-102:
> "Session 75's snapshot-count double-count, corrected from a claimed 13 to a real 9"
> "A real snapshot-count error (13 claimed, 9 actual) caught and corrected during
> supplemental verification — a genuine methodology mistake, not fabrication,
> distinguished precisely in the record."

Also cited as a self-correction in `SOVEREIGN_Strategic_Plan_CTO_Demo_v3.10.md`
line 48: "a test-count error caught and corrected."

**3. Session 92 — WH-43 original fix (Session 71) found wrong**
Source: `SOVEREIGN_Session92_Handoff.md` line 52:
> "The WH-43 fix over-corrected. Session 92 reverts to the pre-WH-43 ROUTED-only
> filter."

The Session 71 fix had added ESCALATED items to the badge filter. Session 92
confirmed that ESCALATED items should NOT appear on the workspace surface (they
have transferred responsibility to a different authority). The Session 71 commit's
own claim — "NEXUS's Travel queue visually presents [ESCALATED] as requiring
attention" — is stated in the Session 92 Handoff as inaccurate.

**4. Session 94 — Citation-accuracy correction (docs/36 "Rules 11-14" attribution)**
Source: `SOVEREIGN_Session94_Handoff.md` lines 73 and 363:
> "Added a correction note (labeled 'August 5, 2026 citation-accuracy note...')"
> "Added citation-accuracy correction note after the Session 92 addendum in §1 |
> Primary task — correct the false 'Rules 11-14' attribution with evidence-backed
> explanation"

The doc cited "Rules 11-14" but only Rules 11 and 12 had individual definitions
and citations in the router audit context. Rules 13 and 14 had neither. Session 94
confirmed this, added an evidence-backed correction note to `docs/36`, and blocked
any inline rule-number substitution pending the Governance Agent's decision.

### What the current repo documents actually say about count

- **`SOVEREIGN_CTO_Demonstration_Script_20260730.md` (July 30, 2026):** Mentions
  two self-corrections explicitly ("a fabricated status report" and "a double-counted
  test figure") in Screen 4. Does not mention Session 92 or 94 events — it predates
  both.

- **`SOVEREIGN_Strategic_Plan_CTO_Demo_v3.10.md` (July 30, 2026):** States "two
  real self-corrections (a fabricated Handoff caught and corrected; a test-count
  error caught and corrected)" at line 47-48. Same predating issue.

- **No v3.11** of the Strategic Plan exists in the repo. The latest version at repo
  root is `SOVEREIGN_Strategic_Plan_CTO_Demo_v3.10.md`.

### On the claimed "fifth self-correction"

The task prompt states that some document (not in repo) calls WH-43's resolution a
fifth self-correction on top of four. By direct evidence in the repo, WH-43 has
generated exactly one confirmed self-correction: the Session 92 finding that the
Session 71 fix over-corrected. Whether the eventual live confirmation (if it
occurs) constitutes an additional self-correction is a Governance Agent framing
decision — the repo contains no document that formally designates it as such.

**What needs correcting:** The CTO Demo Script and Strategic Plan v3.10 need to be
updated to add self-corrections 3 and 4 (Sessions 92 and 94) to the two already
on record. The "four disclosed" count in documents not yet in the repo is correct
on current evidence; the two-count in the July 30 documents is stale.

---

## Check 4 — Which Integration Brief is current at repo root?

**Result: One Integration Brief exists at repo root.
`SOVEREIGN_Platform_Integration_Brief_v1.57.md` — version header confirmed.**

```
$ ls -la SOVEREIGN_Platform_Integration_Brief*
-rw-r--r-- ... SOVEREIGN_Platform_Integration_Brief_v1.57.md
```

File header, lines 1-3:
```
# SOVEREIGN Platform Integration Brief
## Version 1.57 | July 30, 2026
```

No v1.58 and no DRAFT file of any version exist anywhere in the repo:

```
$ find . -name "*Integration_Brief*" | grep -v ".git/"
./SOVEREIGN_Platform_Integration_Brief_v1.57.md
```

The DRAFT Integration Brief v1.58 referenced in the task is not in the
repository. It does not need correcting; it simply does not exist in the repo yet.
The current repo version is v1.57 dated July 30, 2026. This is the single
authoritative current document by the repo's own Rule 1 ("The Integration Brief
is always current in the repo").

---

## Summary Table

| Check | Claim under review | Real answer | Needs correcting? |
|---|---|---|---|
| Rules 15-17 | "Already-established rules" | Exist in `AGENT_REFERENCE_Addendum_20260730.md` (lines 13, 27, 39), **not** merged into `AGENT_REFERENCE.md` v3.4 | Addendum needs merge into a v3.5 main doc; any citation to "AGENT_REFERENCE.md Rules 15-17" is technically to the wrong file |
| Cost coverage | "14 of 14" (complete) | **14 of 19** — 5 uninstrumented | Documents claiming complete coverage are wrong |
| Cost coverage | "14 of 18" | **14 of 19** — total is 19, gap is 5 not 4 | Total and gap count both need correcting |
| Self-corrections | CTO script: 2 on record | 2 in the script, **4 in the repo** — the July 30 script predates Sessions 92 and 94 | CTO script and Strategic Plan v3.10 need updating |
| Self-corrections | 4 in newer docs (not in repo) | 4 confirmed in repo evidence | Consistent with repo evidence if citing Sessions 73, 75, 92, 94 |
| Self-corrections | 5th (WH-43 resolution) | 1 WH-43 self-correction on record (Session 92); "fifth" framing not in any repo document | Governance Agent decision on how to frame |
| Integration Brief | v1.57 or DRAFT v1.58? | **v1.57 only** — no v1.58 or DRAFT in repo | Nothing to correct — v1.57 is the single current document |

---

*Produced by Build Agent — August 6, 2026*
*Evidence: direct grep and file reads against real repo state; no reconstructed content*
*This document is new evidence for the Governance Agent's next update pass —
it does not replace any existing governance document*
