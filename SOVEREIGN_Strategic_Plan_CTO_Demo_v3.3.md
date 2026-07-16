# SOVEREIGN Platform — Strategic Plan to CTO Demo
## Version 3.3 · July 15, 2026
### Governing Document for All Demo-Path Work — Consolidated

**Classification:** Pre-Decisional · Internal Working Document
**Authority:** Project Principal · SOVEREIGN Platform Governance Authority
**Author:** Governance Agent
**Status:** ACTIVE — governs all work toward the CTO demonstration until superseded
**Changed this version:** **Session 35 (three parts) and its two follow-up
sessions (36, 37) all closed. The PPBE live-call smoke test — the last real
item standing between here and Walkthrough F — is CLOSED.** Three of four
PPBE agents (`ppbe-evidence-synthesizer`, `ppbe-scenario-analyst`,
`ppbe-coordination-assistant`) completed genuine first-ever live model
calls; the fourth (`ppbe-exhibit-drafter`) produced a real live response
that correctly failed its own validator — the fail-closed design working as
intended, a new low-urgency open item, not a wiring defect. Sessions 36-37
traced an incorrect diagnosis to its retraction (no defect existed in the
API-key wiring) and then found and fixed a real one (a retired model
identifier, standardized on `claude-sonnet-4-6` via a single exported
constant with a new allowlist regression test). The cross-module state gap
fix (Session 35 Part 2) and the prompt registry count question (Session 35
Part 3, confirmed 20/19/1 correct — a historical registered-vs-approved
mislabel, not a real gap) are both closed. **A full terminology scrub ran
across every governing document this cycle** — "Governance Agent" and
"Build Agent" only, no model or product names. **A document placement and
integrity toolchain was also built this cycle** (checksum-verified
placement script, a manifest as the actual system of record, a cleanup
pass on the iCloud archive) after a real near-miss where a stale file
briefly reintroduced already-resolved content loss into the live repo —
caught and fixed; see `Agent_Identity_Standard.md`'s own Documentation
Integrity Note. **New this version: Part X, a reference section on the
platform's local/open-model inference capability** — built, tested, and
deliberately dormant through the demo; added as CTO Q&A preparation, not a
change to the demo's scheduled content.
**Relationship to other documents:** unchanged from v3.2 — this remains the
authoritative sequencing reference.

---

## PART I — STRATEGY

### 1. The Objective

Deliver a live SOVEREIGN Platform demonstration to a CTO audience proving, in order
of importance: (1) the governance model is structurally enforced, not decorative;
(2) the platform is genuinely finished — six products, four companion modules, all
tested and walked through; (3) a new capability generalizes onto existing
infrastructure without rebuilding it — proven **twice**, via Time & Travel and PPBE
both, built the same way, to completion; (4) the platform names its own real gap
(the Intelligence Layer) rather than being caught by it.

**Demo-ready, precisely:** both workflow layers fully built and walked through;
Gate 3/4 attestation complete; one full rehearsal of the entire five-item demo
script. Everything in this plan exists to reach that state on purpose.

### 2. Demo Scope, In Presentation Order

| # | Component | Role |
|---|---|---|
| 1 | Core six-product pipeline + companion suite | Foundation — ready today |
| 2 | Governance/certification story | The actual differentiator — lead with it |
| 3 | Time & Travel, fully built end-to-end | Proof-of-concept #1 |
| 4 | PPBE, fully built end-to-end | Proof-of-concept #2 — proves #3 wasn't a one-off |
| 5 | Intelligence Layer | Named as the target every product feeds, not built |

### 3. Strategic Principles

- **One linear build sequence, not two parallel tracks.** Decisions can be made in
  parallel; code cannot be built in parallel by one Build Agent working one repo.
- **Decisions precede the build session that needs them,** not the whole sequence.
  A decision needed by a later session can be made any time before that session
  opens, including while an earlier one is still running.
- **One component per exchange inside build sessions,** even in autonomous mode.
- **Walkthroughs are not optional polish — they are load-bearing.** Every stage
  transition in this platform's history has gone through one. Time & Travel and
  PPBE do not get an exception. See Part V.
- **Plan the whole path now; adjust it explicitly, not silently.** Part IX is
  where tweaks get recorded, in place, not by quiet rewrite.
- **Verify before trusting, every session.** HEAD, shell-contract hash, agent
  count, test count — fresh, every time, regardless of what a handoff claims.
  **Extended this cycle to documents themselves, not just build state:** verify a
  transferred file's actual content (checksum or line count) before committing or
  placing it anywhere — a real incident this cycle showed a clean `cp`, a clean
  `git commit`, and a clean `git push` are all consistent with the wrong file
  having been moved.

### 4. What This Plan Deliberately Does Not Chase

`REVIEW-SCOPE`, full external-connectivity architecture (`EXT-CONN-EXPLORE`), and any
actual external connector (Deltek, Concur, GFEBS) remain explicitly out of scope —
unchanged from prior versions. **Local/open-model inference capability is real,
built, and deliberately dormant** — CTO Q&A preparation, not a scheduled demo
component; see Part X.

---

## PART II — GOVERNING DECISIONS STATUS

Everything below is settled as of this version. Restated once, here, so it doesn't
need re-verifying against three other documents mid-sequence.

| Decision / Item | Status |
|---|---|
| D-TT7 | DECIDED — Option A. D-TT3 reaffirmed unchanged. `TT-EXT-GD` opened, deferred, trigger-conditioned. |
| D-P7 | DECIDED — Option A. D-P3 reaffirmed unchanged. `PPBE-EXT-GD` opened, deferred, trigger-conditioned. |
| Time & Travel prompts | APPROVED and REGISTERED, confirmed via Session 27 handoff. |
| PPBE Track scope | DECIDED — full parity with Time & Travel. Both build sessions complete. |
| `docs/18_PPBE_Workflow_Architecture.md` | DELIVERED and corrected (v1.1). |
| All four PPBE prompts | APPROVED, July 13, 2026, commit `33495da`. Approved-prompt count: 20 registered = 19 approved + 1 pending (`PR-SCRIBE-004` only) — **confirmed correct by direct on-disk census, Session 35 Part 3.** The historical "16 approved" figure in Sessions 27-30's own handoffs was a registered-vs-approved mislabel, not evidence of a real gap — root cause found and closed. |
| WE-6 (PPBE synthetic data precondition) | SATISFIED, Session 33, demonstrated not asserted. |
| Post-PPBE wrap-up decisions (four, all closed) | Three differing Integration Brief pairs resolved; operational logs gitignored; cross-module gap fix and live-call smoke test both scheduled — **both now also closed, see below.** |
| **Cross-module state gap fix (VIGIL→SCRIBE)** *(new this version)* | **COMPLETE, Session 35 Part 2.** Publishes through the shell's `taskSurface` (GD-19), no contract change. 21 regression tests, including a real e2e convergence test using the actual VIGIL and SCRIBE components on one shared context — this is the literal script Walkthrough F can run in the browser. |
| **PPBE live-call smoke test** *(new this version)* | **CLOSED, Sessions 35-37.** `ppbe-evidence-synthesizer`, `ppbe-scenario-analyst`, `ppbe-coordination-assistant` completed genuine `tier=live` completions (22-73s response times, confirming real generation). `ppbe-exhibit-drafter` produced a real live response that failed its own validator — fail-closed design working correctly, tracked as a new open item below, not a defect. |
| **Model identifier standardization** *(new this version)* | A retired snapshot identifier (`claude-sonnet-4-20250514`) was hardcoded and found via the smoke test's 404s. Standardized on `claude-sonnet-4-6` via a single exported constant (`SOVEREIGN_DEFAULT_MODEL`), confirmed as the only occurrence in the codebase. A new hermetic allowlist test now fails loudly on any future silent drift to an unvalidated model string, rather than surfacing as a live failure. Splitting agents across model tiers (e.g. Haiku for lighter tasks) was considered and explicitly declined for now, given the fragility this exact identifier just demonstrated — revisit only as a separately-scoped, evidence-based decision. |
| `TT-GD` | DECIDED — GD-21. |
| `TT-PRODUCT-GD` | DECIDED — Option 2. |
| `TT-POLICY-ENTITY` | OPEN, non-blocking, unchanged. |
| `PPBE-RECORD` | OPEN. Housekeeping only. |
| Gate 3/4 attestation | OPEN, Project Principal's own pace, blocks nothing else. |
| `module-lens` orientation prompt missing; VIGIL triage prompt path drift | Both Governance Agent corrections, neither blocking. |
| Root document cleanup | **Repo:** ~35 stale Integration Brief versions, non-blocking, unaddressed this cycle. **iCloud:** addressed this cycle — a checksum-verified, manifest-protected cleanup script moved ~66 stale versioned files into stable, type-organized archive folders; nothing deleted. |
| **Exhibit-drafter validation failure** *(new, low urgency)* | A genuine live model call succeeded and its output failed `ppbe-exhibit-drafter`'s own structural validator — likely a figure-sourcing or system-invisibility check tripping on real (vs. static-template) phrasing. Not yet diagnosed. Non-blocking for Walkthrough F; worth a scoped Build Agent session at some point. |
| **`Agent_Identity_Standard.md` — documentation integrity** *(new)* | A near-miss this cycle (a stale file briefly reintroduced a previously-resolved content-loss error into the live repo) was caught and reverted; the file now carries its own Documentation Integrity Note recording it. That same note flags a genuinely unresolved discrepancy: the six PPBE agents' individual Status fields in that file may not match a separately-observed "Implemented (S31/S32)" lineage — not yet reconciled, needs a direct `git log -p` check before anyone corrects it either way. |
| **Governance document terminology** *(new)* | Scrubbed across all governing documents this cycle — "Governance Agent" and "Build Agent" only, no model or product names, per Project Principal instruction. |

---

## PART III — MASTER BUILD SEQUENCE (Corrected and Linear)

This replaces the two-track structure from earlier versions. It is one ordered
list because it is, in reality, one Build Agent working one repository in
session order — there was never a way to actually run two sessions at once.

| Step | What | Type | Opens When |
|---|---|---|---|
| **Session 27** | ~~Time & Travel Phase I / Core Integration~~ — COMPLETE, pushed. 1370 tests passing. | Build Agent build | Done |
| **Session 28** | ~~Time & Travel Phase II / Full Cycle~~ — COMPLETE, pushed. 1455 tests passing. | Build Agent build | Done |
| **Walkthrough E** | ~~Validate Time & Travel end-to-end~~ — COMPLETE | Governance Agent, guided | Done |
| **Session 29** | ~~Time & Travel gap fixes~~ — COMPLETE. 1396 tests passing (corrected). | Build Agent build | Done |
| **Walkthrough E-2** | ~~Verify fixes live~~ — COMPLETE. One critical finding (WE-10). | Governance Agent, guided | Done |
| **Session 30** | ~~Time & Travel fix session~~ — COMPLETE, pushed. 1414 tests passing. Time & Travel walkthrough-clean. | Build Agent build | Done |
| **Session 31** | ~~PPBE Build Session 1 — Core Integration~~ — COMPLETE. 1690 tests passing. | Build Agent build | Done |
| **Session 32** | ~~PPBE Build Session 2 — Full Cycle~~ — COMPLETE. 1826 tests passing. | Build Agent build | Done |
| **Session 33** | ~~PPBE Synthetic Data + Walkthrough Readiness~~ — COMPLETE. 1875 tests passing. **WE-6 SATISFIED.** | Build Agent build | Done |
| **Post-PPBE Wrap-Up** | ~~Loose-end closure + Build Agent strategic assessment~~ — COMPLETE. | Build Agent + Governance Agent | Done |
| **Session 35** | ~~Combined live-call smoke test + cross-module state gap fix + prompt registry count reconciliation~~ — **COMPLETE, three parts.** Part 1: smoke harness built, fail-closed half passing, live half found a credential-handling question later resolved in Sessions 36-37. Part 2: VIGIL→SCRIBE gap fix, complete and demonstrated live. Part 3: prompt count confirmed correct (20/19/1), historical mislabel found and explained. | Build Agent build | Done |
| **Session 36** *(new, unplanned in v3.2)* | ~~Diagnostic investigation of Part 1's live-call failure~~ — COMPLETE. Original field-name diagnosis traced, found incorrect, and formally retracted after confirming the real `SovereignClientConfig` → `AnthropicClientConfig` translation chain with `tsc`. Permanent diagnostic logging (`SOVEREIGN_CLIENT_DEBUG`) added as lasting infrastructure. | Build Agent build | Done |
| **Session 37** *(new, unplanned in v3.2)* | ~~Fix the real defect Session 36's logging surfaced~~ — COMPLETE. A retired model identifier was hardcoded; standardized on `claude-sonnet-4-6` via a single exported constant with a new allowlist regression test. Confirmed via a genuine subsequent live run: 3/4 PPBE agents fully live, the 4th caught cleanly by its own validator. **PPBE live-call smoke test now CLOSED.** | Build Agent build | Done |
| **Walkthrough F** | Validate PPBE end-to-end; full-platform validation | Governance Agent, guided | **Ready now — nothing left blocking it.** |
| **Rehearsal** | Full five-item demo script, both workflow layers, dry-run | Project Principal + Governance Agent | Walkthrough F complete, any resulting fixes closed |
| **Demo Day** | *** DEMO-READY *** | — | Rehearsal clean |

**Running in parallel with the whole sequence above, blocking nothing in it:**
Gate 3/4 attestation, `PPBE-RECORD`, the exhibit-drafter validation investigation,
hygiene items (`PROMPT-REGISTRY-DRIFT`, remaining repo-root Brief version cleanup).

**What actually needs deciding before each session, stated once so it's not
scattered across three parts of this document:**

| Before This Session | This Must Be Done First |
|---|---|
| 27–37 | All done |
| Walkthrough F | Nothing — ready now |

---

## PART IV — WALKTHROUGH PROTOCOL

Confirmed from this project's own history (Walkthroughs A through E-2 all followed
this pattern) — not a new process invented for this plan.

**What it is:** a Level 1 walkthrough is a human-in-the-loop validation session
conducted **with the Governance Agent, not the Build Agent.** The Project Principal
operates the live platform in a browser; the Governance Agent provides
step-by-step guidance.

**Purpose:** validate that the most recently built stage works end-to-end as a
system (not just that unit tests pass); surface integration gaps unit tests can't
catch; build Project Principal familiarity with actually operating the platform;
produce a demo rehearsal at each milestone.

**How it runs:**
1. Project Principal opens the dev server: `cd ~/Developer/sovereign-platform/
   sovereign-shell && npm run dev`
2. The Governance Agent provides a scenario script — a synthetic situation walking
   through the feature being validated (for Walkthrough F: a synthetic PPBE
   scenario plus a full-platform pass)
3. Project Principal works through the scenario in the browser
4. Project Principal shares screenshots at each step; the Governance Agent
   confirms correct behavior or identifies a gap
5. **Gaps found become the first deliverables of the next build session** — this
   is exactly the mechanism that produced Walkthrough D's 12 findings and every
   subsequent gap-fix session since

**Validation standard, carried from Walkthrough A and never relaxed since:** no
product passes its walkthrough if Gap 5 (plain-language) or Gap 6 (content-type
distinction) standards are not met. A human reviewer must be able to read all
output as plain prose and orient within five seconds.

**Walkthrough F is now ready to script and run** — Sessions 35-37 all closed, the
live-call smoke test is CLOSED, and the cross-module gap fix's e2e convergence
test is already the literal script for that beat of the walkthrough.

---

## PART V — SESSION-OPENING PROCEDURE

The mechanical steps, confirmed from this project's own history, not reinvented.

**Note on where to actually look when opening a session:** the steps below
describe the general procedure. Each session's own opening-prompt file is
self-contained — it includes these same terminal commands at the top, specific to
that session, so you never need this Strategic Plan open at the same time as the
thing you're actually pasting into the Build Agent. This section exists as the
reusable reference the per-session files are generated from, not as a second
place you need to check mid-session.

**Step 1 — Run the gather script (Terminal 2):**
```bash
chmod +x ~/Developer/sovereign-platform/gather_session<N>_context.sh
~/Developer/sovereign-platform/gather_session<N>_context.sh
```
This reads the required context files and copies them to the clipboard. It reports
found/missing counts — if anything is reported missing, stop and resolve it before
proceeding rather than opening the session on an incomplete context package.

**Step 2 — Open the Build Agent (Terminal 1), autonomous mode:**
```bash
cd ~/Developer/sovereign-platform
caffeinate -i claude --dangerously-skip-permissions
```
`caffeinate -i` keeps the Mac awake for the session. `--dangerously-skip-permissions`
is required for autonomous operation — the Build Agent writes files and runs
commands without per-action approval.

**Step 3 — Confirm auto mode:** press `Shift+Tab`, confirm "auto mode on" in the
status bar.

**Step 4 — Paste context:** paste the clipboard from Step 1.

**Step 5 — Paste the opening prompt** for that session.

**Step 6 — The Build Agent confirms every file by name, restates the done
condition, and — because this is an autonomous session — begins building
immediately** rather than waiting for turn-by-turn approval. It still follows
one-component-per-exchange internally; "autonomous" means it doesn't wait for
your approval between components, not that the build discipline is relaxed.

**Step 7 — Walk away. Return when the Build Agent has produced the session
handoff and SBOM update, committed and pushed — AND copied both to the Desktop.**

**Step 8 — Bring the handoff and SBOM back to the Governance Agent** (this
conversation, or a fresh one with `AGENT_REFERENCE.md`, this plan, and the
current Agent-to-Agent Briefing loaded). The Governance Agent produces a
refreshed System Prompt every session as standard practice, along with the
merged SBOM, updated Strategic Plan, and updated Agent-to-Agent Briefing where
warranted — **and, as of this cycle, verifies every transferred document's
checksum before it gets placed anywhere,** using `place_governance_doc.sh` and
`DOCUMENT_MANIFEST.tsv` at the repo root rather than an unverified manual copy.

---

## PART VI — DECISION GATES (Remaining Open Items Only)

| Decision | Blocks | Leverage |
|---|---|---|
| `TT-POLICY-ENTITY` | Nothing in the build sequence | Low urgency — module-level workaround already functioning |
| `PPBE-RECORD` | Nothing in the build sequence | Housekeeping |
| Gate 3/4 attestation | Nothing in the build sequence | Strengthens the demo narrative |
| `docs/16` Supervision Efficiency | Nothing in the build sequence | Project Principal call on add vs. waive |
| Exhibit-drafter validation failure | Nothing in the build sequence | Worth resolving before this specific agent gets heavy Walkthrough F exposure, not before the walkthrough starts |
| `Agent_Identity_Standard.md` PPBE Status-field lineage discrepancy | Nothing in the build sequence | Needs a direct `git log -p` check, not a guessed correction |
| Local/open-model activation | Nothing in the build sequence — deliberately dormant | See Part X. Activates only when a real client's compliance posture requires it. |

---

## PART VII — RISK & CONTINGENCY

| Risk | Mitigation |
|---|---|
| Walkthrough F surfaces platform-wide issues, not just PPBE-specific ones | Walkthrough F is explicitly scoped as full-platform validation, not PPBE-only — this is expected, not a surprise |
| A "passing" result masks a path that wasn't actually exercised | Confirmed as a real risk this cycle (the smoke test's fail-closed "PASS" looked identical whether the primary path failed cleanly or was never reached). Mitigation: diagnostic logging now exists and is permanent; don't trust a green summary line alone for anything with a fallback path. |
| A stale document gets committed or placed without anyone noticing | Confirmed as a real risk this cycle (a near-miss briefly reintroduced resolved content loss into the live repo). Mitigation: checksum verification before placement is now tooled (`place_governance_doc.sh`), not just a written rule. |
| Session count grows beyond planned if a walkthrough finds more than expected | Sequence is dependency-based, not calendar-based — it absorbs this without needing a new plan version, just a Part IX log entry |

---

## PART VIII — COMPLETE TASK LIST

**Project Principal:**
- [x] ~~Run Sessions 27-33~~ — ALL COMPLETE
- [x] ~~Decide `TT-GD` / `TT-PRODUCT-GD`~~ — DECIDED
- [x] ~~Approve the four PPBE prompts~~ — DONE
- [x] ~~Resolve the three differing Integration Brief version pairs~~ — DONE
- [x] ~~Decide operational log tracking policy~~ — DONE, gitignored
- [x] ~~Decide the cross-module gap fix and live-call smoke test scheduling~~ — DONE, both closed
- [x] ~~Run Session 35 (three parts)~~ — DONE
- [x] ~~Run Sessions 36-37 (diagnosis + real fix)~~ — DONE
- [x] ~~Place the checksum-verified governance documents across repo and iCloud~~ — DONE
- [x] ~~Run the iCloud archive cleanup~~ — DONE
- [ ] Work through Walkthrough F with the Governance Agent — **ready now**
- [ ] Rehearse the full five-item demo script
- [ ] Decide `PPBE-RECORD`, attest Gate 3/4, whenever convenient — not on the path
- [ ] Decide `docs/16` Supervision Efficiency — add retroactively or formally waive
- [ ] **New — decide whether to include Part X (Local LLM) in the live demo narrative or hold it strictly as Q&A backup** — either is reasonable, this plan defaults to Q&A-only unless told otherwise
- [ ] Non-blocking, optional — remaining ~35 stale Integration Brief versions in the repo root, if the repo itself will be shown

**Governance Agent:**
- [x] ~~Draft the four PPBE agent prompts~~ — reassigned to the Build Agent, July 12
- [x] ~~Produce the approval record for each PPBE prompt~~ — DONE
- [x] ~~Write the Walkthrough E / E-2 scenario scripts~~ — delivered
- [x] ~~Reconcile Sessions 31 through the wrap-up pass~~ — DONE
- [x] ~~Correct docs/18's errors~~ — DONE, v1.1
- [x] ~~Correct `Agent_Identity_Standard.md`'s stale PPBE and TT statuses~~ — TT statuses DONE this cycle; PPBE statuses flagged as a separate, still-open lineage discrepancy (see Part II)
- [x] ~~Reconcile Session 35's three-part close~~ — DONE
- [x] ~~Reconcile Sessions 36-37's diagnosis and fix~~ — DONE
- [x] ~~Full terminology scrub across all governing documents~~ — DONE, this cycle
- [x] ~~Build a document placement and integrity toolchain~~ — DONE, this cycle
- [x] ~~Run the iCloud cleanup~~ — DONE, this cycle
- [ ] **Write the Walkthrough F scenario script** — no longer blocked on anything. Next deliverable.
- [ ] Produce Walkthrough F's opening materials
- [ ] Keep Part IX current as tweaks occur
- [ ] Resolve `module-lens` orientation prompt (missing on disk) and VIGIL triage prompt path drift — both still open
- [ ] Run the `git log -p` check on `Agent_Identity_Standard.md`'s PPBE Status-field discrepancy before correcting it

**Build Agent:**
- [x] ~~Sessions 27 through 33~~ — all complete
- [x] ~~Author all four PPBE prompts~~ — done, Session 32
- [x] ~~Session 35 — cross-module state gap fix~~ — done
- [x] ~~Session 35 — live-call smoke test harness~~ — done
- [x] ~~Session 36 — diagnostic investigation~~ — done, original diagnosis retracted
- [x] ~~Session 37 — retired model identifier fix~~ — done, `claude-sonnet-4-6` standardized
- [ ] Resolve `PROMPT-REGISTRY-DRIFT` when convenient
- [ ] `F-2` — low priority, not demo-path, resolve whenever convenient
- [ ] Exhibit-drafter validation failure — scoped follow-up session, low urgency
- [ ] Naming tension (`TRAVEL_APPROVAL` vs. `TRAVEL_APPROVED`/etc.) — candidate consolidation GD, non-urgent
- [ ] AIS Logger event-name drift — documentation cleanup only
- [ ] Verify `docs/16` Supervision Efficiency section status when convenient

---

## PART IX — CHANGE CONTROL (Full History)

| Date | Change | Reason |
|---|---|---|
| July 11, 2026 | Initial version (v1.0) through v3.1 | See prior versions of this document for the full early history |
| July 12–13, 2026 | v3.2 — Both PPBE build sessions complete plus synthetic data (Session 33); post-build wrap-up pass; all four PPBE prompts approved; prompt count reached its final three-number form (20/19/1) after three prior corrections | Build Agent session closes, relayed and reconciled by Project Principal |
| **July 15, 2026** | **v3.3 — Session 35 (three parts) and Sessions 36-37 all closed. PPBE live-call smoke test CLOSED** — 3/4 agents proven genuinely live, the 4th caught cleanly by its own validator (new low-urgency open item). Cross-module state gap fix COMPLETE and demonstrated live. Prompt registry count CONFIRMED correct (20/19/1) with the historical discrepancy's root cause found (a registered-vs-approved mislabel in Sessions 27-30's own handoffs). Model identifier standardized on `claude-sonnet-4-6`, single source of truth, allowlist-guarded against future silent drift. A documentation near-miss (stale file briefly reintroduced resolved content loss into the live repo) caught, reverted, and recorded permanently in `Agent_Identity_Standard.md`'s own integrity note — which also flags a genuinely unresolved PPBE Status-field lineage discrepancy in that same file, not yet corrected. Full terminology scrub applied across every governing document. A checksum-verified document placement toolchain (manifest + placement script) built and used for real; iCloud folder cleanup run (66 stale files archived, nothing deleted, zero data loss). **New: Part X added — a Local/Open Model Capability reference section, built strictly from a verified internal talking-points source, for CTO Q&A preparation. Walkthrough F is now fully unblocked — the only thing standing between here and it is drafting its scenario script.** | Multiple Build Agent session closes (35, 36, 37) plus a substantial governance/tooling cycle, relayed and reconciled by Project Principal across many exchanges |

---

## PART X — LOCAL / OPEN MODEL CAPABILITY (Reference — Not Demo-Path)

**Purpose of this section:** CTO Q&A preparation, not a scheduled demo
component. This capability is real, built, and deliberately dormant through
Demo Day — it does not appear in Part I's presentation order unless the
Project Principal decides otherwise (see Part VIII). Everything below is
drawn from `SOVEREIGN-LLM-001` (the Local LLM Integration Decision
Framework, built June 2026) via a verified internal talking-points summary.
Where a detail could not be confirmed against that source, it is marked
explicitly rather than stated as fact — treat any such note as a flag to
verify before it goes in front of a CTO, not as settled.

### The bottom line

A local LLM isn't a hypothetical add-on — it answers a specific, named
blocker: Anthropic's commercial API isn't FedRAMP-authorized for CUI, so it
can't be the only inference path for federal deployments. The real question
is *when* to activate local inference and under what configuration, not
*whether* to support it at all.

### Where it actually stands

- **Built, not running.** Session 13 (June 2026) wired Ollama in as a
  second registered inference provider, with routing logic, a model
  registry entry, and dedicated audit-log events for inference calls,
  fallbacks, and model integrity checks.
- **Anthropic remains the sole live provider through the demo** — a
  deliberate governance decision, not a gap. The architecture is
  demonstrable without Ollama needing to be running.
- **Activation is a configuration change, not a rebuild** — it flips on
  when a specific client's compliance posture requires it.

### The five-perspective case, if the CTO wants depth

- **Architectural** — Local inference slots in as a second provider behind
  the same abstraction layer every product already calls. Zero
  product-level rewrites.
- **Compliance** — Satisfies the CUI/FedRAMP boundary commercial APIs
  can't. Three deployment options on the table: FedRAMP GovCloud hosting,
  on-premises hardware, or hybrid (dev local / production cloud).
- **Operational** — The honest cost center. Model selection, hardware,
  lifecycle management, and drift monitoring are ongoing work, not a
  one-time setup.
- **Security** — Trades network/third-party exposure for new
  responsibilities: model weight integrity (SHA-256 verification),
  inference-layer prompt injection, and owning monitoring Anthropic
  currently handles. All designable with controls already in the
  platform's security framework — nothing net-new architecturally.
- **Strategic** — This is what makes the "sovereign AI" name credible.
  Without local inference capability, that positioning is conditional.

### Trade-offs to be upfront about

- A local model is meaningfully less capable than Claude on complex
  reasoning — acceptable for routine tasks, requires more careful handling
  for anything high-stakes.
- Every model update triggers re-certification (accuracy/drift gates)
  before it can go live again — not automatic. **Unconfirmed against the
  source document: whether this re-certification specifically routes
  through the platform's existing CPMI-VRS gate mechanism, or a separate
  gate. Verify before stating this specifically to a CTO.**
- Fine-tuning is explicitly **out of scope for now** — inference-only on
  frozen weights, deferred to a future phase once enough production data
  has accumulated to make it worthwhile.

### If the CTO asks "when does this go live?"

Not before a real client's data-handling requirements demand it. The
infrastructure is ready and tested; flipping it on for a specific
classification of data is a deliberate governance decision, made the same
way every other consequential platform change is — not something that
happens by default.

---

*SOVEREIGN Platform — Strategic Plan to CTO Demo · v3.3 · July 15, 2026*
*Pre-Decisional · Internal Working Document*
*File to: git `docs/`*
