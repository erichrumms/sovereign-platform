# Agent Reference Document — Unified
## SOVEREIGN Multi-Agent Development System

**Version: 3.10 — August 13, 2026**
**Supersedes:** v3.9 (August 12, 2026), which superseded v3.8 (August 12, 2026), which superseded v3.7 (August 12, 2026), which superseded v3.6 (August 12, 2026),
which superseded v3.5 (August 11, 2026), which superseded v3.4, which superseded v3.3,
which superseded v3.2 (July 22, 2026), which superseded v3.1 (July 19, 2026), which
superseded v3.0 (July 18, 2026 — the merge of BOTH prior lineages: the repo copy,
1,014 lines, June 26, 2026, and the project-knowledge copy v2.0, 530 lines, July 18,
2026). **Correction:** the Supersedes line in v3.5 read "v3.2 (July 22, 2026)" and
skipped v3.3 and v3.4 entirely; those versions exist and their changes are recorded
in the per-version changelog entries below. **Correction (Session 110):** the Supersedes
line in v3.7 read "v3.5 (August 11, 2026), which superseded v3.4..." — skipping v3.6
entirely. v3.6 exists (August 12, 2026); its changes are in the changelog entry below.
This is the second consecutive skip-a-version defect in this line; v3.7 is also the
version that added Lesson 39 (finality language as a prompt to re-verify), making this
a live instance of that lesson inside the document that contains it.
**Merge decision:** Project Principal, July 18, 2026 — one canonical
document, placed identically in the repo, at the iCloud root, and in
project knowledge.
**v3.1 change:** one addition — the sub-module (per-tab) role-gating pattern
(new in GD-22, Session 41), added to Known Codebase Facts so a second
implementation doesn't diverge from the first. Nothing else in v3.0 changed.
**v3.2 change:** one addition — VIGIL's approval queue now has a single
session-scoped source of truth (Session 54, WG-13), added to Known Codebase
Facts so a future VIGIL surface doesn't bypass it. Nothing else in v3.1
changed.
**v3.3 change:** one addition — the session-store pattern generalized from
one instance to six (Session 61: four new applications, plus the two that
already existed), added to Known Codebase Facts as a named, recognized
platform pattern rather than five/six independent hand-rolled copies.
Nothing else in v3.2 changed. The v3.0/v3.1/v3.2/v3.3 counter still continues from the stated v2.0
assumption noted below — the true pre-June-26 original counter value
remains unrecovered.
**v3.4 change:** Rule formalization, authorized by the Governance Agent (Session 94
findings, Session 95 implementation). Rules 11 and 12 are now formally the
single-computation principle and the root-cause-search-elsewhere principle,
preserving 20+ sessions of informal usage since Session 71. The former Rule 11
(shell-contract-bump parity reporting, added Session 93) is renumbered to Rule 13;
its content is unchanged. Rule 14 is recorded as deliberately unassigned — no
fourth principle was found in the repository. The phantom cross-reference in the
former Rule 11's closing paragraph ("Known Codebase Fact about derived-value
defects (Rule 11/12 from Part I)") is removed; no such fact exists in Part I. Nothing
else in v3.3 changed.
**v3.5 change:** Three real content additions, merged from addendum
`AGENT_REFERENCE_Addendum_20260730.md` (committed July 31, 2026; the merge was
performed in Session 106, August 11, 2026 — commit 7824383). Rules 15, 16, and 17
added to Part II's rule sequence after Rule 14. Lessons 30-38 added to Part I's
lesson sequence after Lesson 25. Footer updated from the stale "v3.0" to v3.5.
**Correction (Session 108):** the original v3.5 entry read "Session 105, August 11,
2026" for the merge; git history (commit 7824383 message) confirms Session 106.
The original v3.5 entry also stated "Lessons 26-29 are confirmed absent from this
document and from git history — no content for those numbers exists anywhere in the
repository." That claim is retracted. The content exists — extracted from
AGENT_REFERENCE_v3.5.md (SHA-256 14aa83ad…, 1,993 lines, present in project Downloads)
and recovered into this document as v3.6 Block A below. The file was produced locally
and never committed to the repository; it is not absent from the project.
**v3.6 change:** Three content recoveries from the parallel lineage copy
(AGENT_REFERENCE_v3.5.md, 1,993 lines, SHA-256 14aa83ad…), performed Session 108,
August 12, 2026. Block A: Lessons 26-29 inserted between Lesson 25 and Lesson 30
(content dated July 27, 2026; absent from the repo copy since the July 31 merge was
never committed). Block B: Rule 10 amendment of July 26, 2026 (upstream timestamp
check for shared staging locations) inserted after Rule 10's final paragraph. Block C:
session-store pattern update (seventh instance arrived; extraction deferred past CTO
demonstrations; decision recorded) replaces the stale "seventh instance" placeholder
sentence. Rules 11-17 and Lessons 30-38 are unchanged from v3.5. The two parallel
lineages are otherwise not merged — their Rules 13/14 divergence is an open item for
the Project Principal (documented in Session 108 Handoff). Supersedes line corrected
to show the full v3.0-v3.5 chain. Footer updated to v3.6.
**v3.7 change:** Rules 13/14 lineage conflict resolved by Project Principal decision,
August 12, 2026. Block D: the parallel lineage's Rule 13 — two supporting incidents
(commit-attribution suppression non-functional for seven sessions; placement script
and verification manifest unused for roughly twenty) — folded into canonical Rule 17
as an evidence paragraph, attributed and recovered Session 109. Block E: the parallel
lineage's Rule 14 (finality language is a prompt to re-verify) re-homed as Lesson 39
by Project Principal decision; Rule 14 remains deliberately and permanently unassigned.
D2: citation guidance for the intentional Rule 1–3 duplication across Part I and
Part II added to the "How to read" section — this finding existed in no file before
this note. Rules 11–16 and Lessons 1–38 byte-identical to v3.6. Footer updated to v3.7.
**v3.8 change:** Two corrections and one convention change, Session 110, August 12,
2026. (1) Supersedes line corrected — v3.7 skipped v3.6, repeating the defect v3.5
introduced and Session 108 corrected; v3.7 is also the session that added Lesson 39
(finality language as a prompt to re-verify), making this a live instance of that
lesson in the document that contains it. (2) Handoff close-table convention changed:
the "HEAD after push" value is no longer recorded in the handoff — it cannot be
accurate when written, because further commits always follow; Sessions 108 and 109
both recorded wrong values attempting it. Terminal HEAD is now the responsibility of
DOCUMENT_MANIFEST.tsv (updated after push), not the handoff. Both §Session Handoff
Document sections updated. (3) D1 inventory finding recorded: SOVEREIGN_System_Prompt_v37.md
exists in ~/Downloads (SHA 398fb8b4…, 179 lines, July 24, 2026); DOCUMENT_MANIFEST.tsv's
"KNOWN GAP" claim of "no file on disk" is factually wrong. SOVEREIGN_System_Prompt_v38.md
also exists (SHA eb604959…, 323 lines, July 27, 2026), not tracked in manifest.
Rules 11–17 and Lessons 1–39 byte-identical to v3.7. Footer corrected from stale v3.6 header.
**v3.9 change:** Two deliverables, Session 111, August 12, 2026. (1) D1b — close
protocol update: `sovereign_session_verify.sh` is now a stated close requirement in
both §Session Handoff Document sections (Part I §2 and Part II §2) and in the
autonomous-session close requirements template (Part I §7). The script was also
extended in Session 111 to add four invariant checks (manifest-to-disk integrity,
version-chain continuity, SBOM count accuracy, PLACEMENT_LOG file existence) and to
resolve six standing warnings (HEAD check made informational; working tree check
filters untracked files; contract hash updated from stale v1.20 to v1.28; Walkthrough F
check updated to the compiled file). First-run findings (not fixed this session, per
scope): four SHA mismatches in DOCUMENT_MANIFEST.tsv (SOVEREIGN_Agent_to_Agent_Briefing.md,
SOVEREIGN_Role_Access_Matrix_20260721.md, 30_Session60_Assessment_Action_Plan.md,
22_Informed_Decision_Making.md). Section 7's grep had a multi-line bug (only read the
first line of the Supersedes block); corrected in the same session. (2) D2 — SBOM
version-numbering convention amended: the embedded specific "next available" number in
both Part I §3 and Part II §3 is replaced with a derivation rule (scan all SBOM files
in the repository, find the highest version number, add one). Convention confirmed as
"next free number in the shared space" — not "inherit the last-update number" — by
evidence from merged registry v1.44 (supersedes v1.43, numbered v1.44, not v1.43).
Two unplaced drafts labeled v1.74 and v1.75 collide with committed per-session updates
(Sessions 106/107); relabeling is the Governance Agent's task. Rules 11–17 and
Lessons 1–39 byte-identical to v3.8.
**v3.10 change:** D2, Session 112, August 13, 2026. Lessons 13–23 imported verbatim
from `PROJECT_SUMMARY.md` Part 7 (June 1, 2026), by Project Principal decision of
August 13, 2026. The structural gap note (flagged five times, most recently in System
Prompt v44) was replaced by the content itself. Character note: Lessons 1–12 and
24–39 in this document are session-practice lessons from the repo lineage; Lessons
13–23 are platform-design lessons from the project-knowledge lineage. Both lineages
hold different lessons at the overlapping numbers 1–12 and 24–30 — neither lineage
is renumbered, as that would break every existing citation. Rules 11–17 and
Lessons 24–39 byte-identical to v3.9.

**How to read this document:** Part I is the full SOVEREIGN-specific
reference (the repo lineage, preserved unchanged). Part II is the
condensed operational reference (the project lineage). They overlap
deliberately — nothing was cut in the merge, per the project's own
Rule 10 lesson about lossy transfers. Where they cover the same ground:
Part I's "Three Rules" are Rules 1-3 of Part II's ten; Part II's rules,
being newer and incident-derived (through July 15), govern operational
behavior; Part I governs SOVEREIGN-specific facts (shell contract, GD
system, walkthrough protocol, iCloud structure, Lessons 1-12). The
numbered Lesson sequence runs 1-12 in Part I and continues from 13
onward in the Integration Brief lineage (13 first appears in Brief
v1.37, June 30, 2026).
**Citations specifying a rule by number alone are ambiguous where both sequences
cover the same number** — Rule 2 in Part I is "the shell-contract hash must match
before any build work begins" (line 794); Rule 2 in Part II is "prompts are approved
before they run live" (line 1598 in v3.6; shifts with edits). Write "Part I Rule 2"
or "Part II Rule 2" to remove the ambiguity. The duplication is intentional, documented
here, and is not a defect to correct. *(D2, Session 109, August 12, 2026. This finding
existed in no file before this note — it was lost when the project-knowledge copy was
replaced by the repo copy after the v3.0 merge.)*

═══════════════════════════════════════════════════════════════════
# PART I — SOVEREIGN Multi-Agent Development System Reference
## (repo lineage, complete and unchanged)
═══════════════════════════════════════════════════════════════════

# Agent Reference Document
## Multi-Agent Development System

> **How to use this document:** Load it at the start of every agent session. It
> defines how this project's knowledge is structured, how agents communicate
> through documents, and what rules prevent the most common failures. Every agent
> in this system follows these conventions.

---

## The Big Picture

Every session produces two things: **work** (code, assets, tests) and **knowledge**
(documents). Work lives in the repository. Knowledge lives in documents. Agents
have no memory between sessions — documents are the project's entire institutional
memory.

There are two agent roles and they never swap responsibilities:

| Role | Responsibility |
|---|---|
| **Governance Agent** (Claude Chat) | Authors and updates documents, reviews session output, maintains the knowledge base, approves AI-authored content, produces opening prompts, runs walkthroughs |
| **Build Agent** (Claude Code) | Writes code, runs tests, produces session close artifacts |

The **Project Principal** is the only human in the loop and the bridge between
every step. All final decisions belong to them.

**The Two Claude Environments — Never Cross These**

Claude Chat handles governance only. Claude Code handles code only. The Project
Principal is the physical bridge. Claude Chat never writes code. Claude Code never
authors governance documents. If Claude Code encounters a governance decision, it
stops, documents the fork in the handoff, and waits for the Project Principal to
bring the decision back from Claude Chat.

---

## The Six Document Types

### 1. Master Integration Brief

**What it is:** The single governing document for the entire project. Contains the
platform definition, architecture decisions, build status, constraints, open
governance items, risk register, agent and prompt registries, shell-contract hash
of record, codebase facts, walkthrough schedule, and the full build roadmap.

**Purpose:** Prevents agents from building against stale or wrong state.

**What must be correct:**
- Build status table with test counts
- Shell-contract version and SHA-256 hash of record
- Open governance items including any pre-approved GDs
- Registered agents and approved prompts
- Current session's file list
- Walkthrough schedule and results

**Who writes it:** Governance Agent — produces a complete replacement after every
session AND after every walkthrough. Never partially updates.

**Who reads it:** Build Agent reads it at session open. Never modifies it.

**Project Principal action:** Downloads each new version, copies to monorepo root,
commits and pushes, places in iCloud.

**Version naming:** `SOVEREIGN_Platform_Integration_Brief_v1.NN.md` in monorepo
root. Only the current version matters — older versions may be archived.

---

### 2. Session Handoff Document

**What it is:** The close artifact produced by the Build Agent at the end of every
session. Records exactly what was built, what commits were made, what tests passed,
what was deferred, and what the next session should do.

**Purpose:** Prevents knowledge loss between sessions and gives the Governance
Agent accurate inputs for updating the Brief.

**What must be correct:**
- Done-condition traceability (proof each criterion was met)
- Shell-contract hash of record (new hash if contract changed)
- Exact commit hashes for each change made this session
- Test counts (JS and Python separately, and total)
- Update flags for the Integration Brief
- Spec reconciliations — any place Claude Code adapted from the spec to reality
- Blockers and findings — anything Claude Code surfaced but did not act on

**Convention (Session 110):** The handoff close table does not carry a "HEAD after push"
value. This value cannot be accurate when written — further commits (SBOM, manifest
updates) always follow the handoff; Sessions 108 and 109 both recorded wrong values
attempting it. The session's terminal HEAD is recorded in the DOCUMENT_MANIFEST.tsv row
added at close, not in the handoff itself.

**Close requirement (Session 111):** `sovereign_session_verify.sh` must be run at
session close and its full output quoted verbatim in the handoff. A script that exists
but goes unrun is the exact failure shape Rule 17 describes — this requirement closes
that loop. The handoff is not complete without the verify output present.

**Who writes it:** Build Agent at session close. Commits and pushes to repo root.

**Who reads it:** Governance Agent uses it as the primary input for all
post-session document updates.

**Project Principal action:** Copies file from repo and uploads to Governance Agent.

---

### 3. Software Bill of Materials (SBOM) Registry

**What it is:** A cumulative record of every software component in the project —
production packages, internal workspace packages, registered agents, approved
prompts, shell-contract versions, VRS certificates, and model registry entries.

**Purpose:** Supply chain visibility, compliance documentation, governance record.

**What must be correct:**
- Shell-contract version history with SHA-256 hashes
- All registered agents with status (registered only vs. implemented)
- All approved prompts with approval dates
- Test count totals per suite and platform total
- Model registry entries with CPMI-VRS gate status
- VRS certificate records

**Who writes it:** Build Agent produces a session update file. Governance Agent
merges it into the cumulative registry.

**Version-numbering convention (established D4, Session 110; amended D2, Session 111):**
Per-session update files and merged registry files share one number space — they do not
run independent sequences. Each document takes the next available number regardless of
type. The merged registry v1.44 (July 30, 2026, through Session 76) was followed by
per-session update v1.45 (Session 77); both sequences draw from the same counter.
**Derivation rule (Session 111):** the next available number is always determined by
scanning all `SBOM_Session*_Update.md` and `SBOM_Registry_v*.md` files in the
repository, finding the highest version number present, and adding one. Never carry
a specific number forward from a prior session's claim — a specific number goes stale
immediately after it is used. Assigning v1.74 or v1.75 to a new merged registry would
collide with per-session updates already committed at those numbers (Session 106 =
v1.74, Session 107 = v1.75 — confirmed in real files). Two unplaced draft registries
labeled v1.74 and v1.75 exist in Governance Agent conversation history (not on disk);
relabeling is the Governance Agent's task.

**Project Principal action:** Downloads the merged registry and places in iCloud
`Companion Suite/Governance/`.

---

### 4. Agent-to-Agent Briefing

**What it is:** A self-contained document that orients any Claude instance opening
a SOVEREIGN session — Claude Chat or Claude Code — before any other documents
load. Contains the Project Principal profile, platform definition, current build
state, shell-contract hash, monorepo path, two-environment rules, invariant
constraints, and what makes sessions go badly.

**Purpose:** Provides instant orientation without requiring the full Integration
Brief. Especially important for Claude Chat sessions that don't receive a gather
script paste.

**What must be correct:**
- Shell-contract version and hash
- Current HEAD and Integration Brief version
- Stage completion status
- Agent registry count
- The four things that most commonly break sessions

**Who writes it:** Governance Agent updates after any session that changes the
shell-contract hash or stage completion status.

**Who reads it:** Both agents. Load order for Claude Code: Integration Brief →
Agent-to-Agent Briefing → system prompt → spec → prior handoff → shell-contract.

---

### 5. Context Gather Script

**What it is:** A shell script that collects all files in the session's required
context, concatenates them with clear headers, copies the result to the clipboard,
and reports how many files were found vs. missing.

**Purpose:** Ensures the Build Agent receives exactly the right files — no more,
no less — at the start of each session.

**What must be correct:** The file list must exactly match the session context
package defined in the Integration Brief. A missing file means the Build Agent
builds without critical context. The gather script reports missing files explicitly
— always check the count before pasting.

**Critical: verify filenames against the SBOM before writing the gather script.**
The Governance Agent writes gather scripts against expected filenames before Claude
Code has built the files. When Claude Code names a file slightly differently than
the spec assumed, the path in the gather script is wrong and the file is reported
missing. This happened in Sessions 20 and 21 (wrong path for module-loader,
wrong filename for synthetic-elicitation.ts).

The fix is simple: before writing any gather script, read the prior session's
SBOM update (Section: New Components or Changed Components) and use the exact
filenames Claude Code recorded — not the filenames the spec anticipated. The SBOM
is the authoritative record of what actually exists on disk.

**Gather script file verification checklist (every session):**
1. Read the prior session's SBOM update — note every new file created
2. Cross-reference each new file's path against what you planned to include
3. Use the SBOM filename exactly — not the spec's assumed filename
4. If a file you expected is not in the SBOM, it was not built — do not include it

**Who writes it:** Governance Agent produces a new version for each session.
The file list grows as the project grows.

**Project Principal action (exact sequence):**
1. Write the script to the repo root (via heredoc in Terminal or download)
2. Make it executable: `chmod +x gather_sessionNN_context.sh`
3. Commit and push: `git add gather_sessionNN_context.sh && git commit -m "..." && git push`
4. Run it in Terminal before opening Claude Code
5. Paste the clipboard output as the first thing into Claude Code
6. Then paste the session opening prompt

If the script was already written in a prior step and is showing as tracked in
git, skip steps 1–3 and go straight to running it.

---

### 6. Architecture Specification Documents

**What they are:** Detailed specifications for each product or component — what it
does, its pipeline position, data shapes, event types, shell-contract changes
required, done condition, and any autonomous operation rules.

**Purpose:** Prevents the Build Agent from inventing architecture. The spec is the
single design authority. Constraints override the spec when they conflict — Claude
Code adapts and documents the reconciliation in the handoff.

**What must be correct:**
- Shell-contract changes with GD numbers and pre-approval status
- Done condition — exact, verifiable, in order
- Codebase facts specific to this component
- Autonomous rules (what Claude Code may decide vs. must surface)

**Who writes it:** Governance Agent authors before the relevant build session.
Committed to `docs/` before the session opens.

**Who reads it:** Build Agent reads at session open. Uses as the primary design
authority. Never modifies. Documents spec-vs-reality gaps in handoff §Findings.

---

## The Shell Contract

The shell-contract is the most critical governance artifact in the codebase. It
defines the types that every module shares. Changes require:

1. A Governance Decision (GD) number
2. Version increment (e.g., v1.8 → v1.9)
3. Changelog entry in both copies
4. Impact assessment
5. Propagation to all synced shared-type copies (Constraint #11)
6. SHA-256 verification of both copies — must be identical
7. New hash recorded in the Integration Brief

**Both copies must always be identical.** Claude Code verifies this before
proceeding to any deliverable that follows a shell-contract change.

**The hash of record** travels in the Integration Brief, the system prompt, and
the Agent-to-Agent Briefing. It is the single most important fact Claude Code
must verify at session open.

---

## How to Launch an Autonomous Build Session

This is the preferred mode for major build work. The Project Principal sets
everything up, launches Claude Code, and steps away. Claude Code builds through
the full session scope without interruption.

### Pre-Launch Checklist

Before launching an autonomous session, confirm in Claude Chat:
- [ ] Architecture spec is committed to `docs/`
- [ ] Gather script is written and committed
- [ ] Opening prompt is written (either in Claude Chat or saved to repo)
- [ ] Any pre-approved governance decisions are recorded in the Integration Brief
- [ ] Any new agents are registered in Agent_Identity_Standard.md and committed
- [ ] Any new prompts are approved and recorded

### Step-by-Step Launch

**Step 1 — Run the gather script in Terminal:**
```bash
~/Developer/sovereign-platform/gather_sessionNN_context.sh
```
Confirm output says "NN of NN files found. 0 missing." before proceeding.

**Step 2 — Open Claude Code with autonomous settings:**
```bash
cd ~/Developer/sovereign-platform
caffeinate -i claude --dangerously-skip-permissions
```

`caffeinate -i` prevents the Mac from sleeping during a long session.
`--dangerously-skip-permissions` allows Claude Code to write files and run
commands without asking permission for each action. Required for autonomous
sessions where the Project Principal is not present.

**Step 3 — Enable auto mode:**
Press `Shift+Tab` to cycle to auto mode. Confirm "auto mode on" appears in
the status bar.

**Step 4 — Paste context:**
Paste the clipboard from the gather script. This loads all source files.

**Step 5 — Paste the opening prompt:**
Paste the session opening prompt. Claude Code will read all context documents,
confirm each by name, restate the done condition, and — in an autonomous session —
begin building immediately without waiting for approval.

**Step 6 — Walk away.**
For autonomous sessions, the opening prompt explicitly tells Claude Code to begin
immediately. Return when Claude Code has produced the handoff and SBOM documents.

### Autonomous Session Opening Prompt Structure

Every autonomous opening prompt contains these sections in order:

```
1. SESSION HEADER — session number, HEAD hash, shell-contract hash
2. CRITICAL CODEBASE FACTS — types, constraints, known gotchas
3. ACTIVE GOVERNANCE DECISIONS — GDs pre-approved for this session
4. DONE CONDITION — D1, D2, D3... in order, each exact and verifiable
5. AUTONOMOUS OPERATION RULES — what Claude Code may decide vs. must surface
6. STANDING CONSTRAINTS — all 11, every session
7. CLOSE REQUIREMENTS — sovereign_session_verify.sh (full output quoted in handoff), test suite, tsc, audit, SHA verify, commits, handoff
```

The opening prompt explicitly states: "Begin now. Build D1 → D2 → D3 without
stopping." This is what distinguishes an autonomous session from an interactive one.

### What Claude Code Does in an Autonomous Session

Claude Code follows these rules:
- Builds all deliverables in order without stopping for approval
- Makes all technical decisions within scope independently
- Adapts specs to codebase reality (Constraints override specs)
- Documents every spec-vs-reality reconciliation in the handoff
- Stops and documents in handoff (does NOT act on) anything outside scope
- Closes cleanly even if a blocker prevents completion of optional deliverables
- Never issues governance decisions, never self-approves agents or prompts
- Never touches the shell-contract beyond what the opening prompt authorizes

### Optional Deliverables Pattern

Structure sessions with required deliverables (D1, D2) and optional ones (D3, D4):

```
D1 — Required — do first
D2 — Required — complete before D3
D3 — Optional — only if D1 and D2 complete cleanly
D4 — Optional — only if D3 completes cleanly
```

Claude Code stops at the last completed deliverable and closes cleanly. The
handoff records which optional deliverables were and were not reached.

---

## The Post-Session Rhythm

Every session follows the same cycle. The Project Principal is the link between
every step. Never skip any step — Claude has no memory between sessions and the
documents are the only continuity.

```
Step 1 — CLAUDE CODE closes the session
         Produces handoff document and SBOM update
         Commits both, pushes to repository
         HEAD advances

Step 2 — PROJECT PRINCIPAL copies the close artifacts
         cp ~/Developer/sovereign-platform/SOVEREIGN_Session16_Handoff.md ~/Desktop/
         cp ~/Developer/sovereign-platform/SBOM_Session16_Update.md ~/Desktop/
         Uploads both to Claude Chat

Step 3 — CLAUDE CHAT processes the close artifacts
         Produces: merged SBOM, updated Integration Brief,
         updated system prompt (if shell-contract changed),
         updated Agent-to-Agent Briefing (if hash changed),
         new architecture spec (if next session needs one),
         new gather script, new opening prompt
         Presents all files for download

Step 4 — PROJECT PRINCIPAL places the files
         cp ~/Downloads/SOVEREIGN_Platform_Integration_Brief_vN.NN.md \
            ~/Developer/sovereign-platform/SOVEREIGN_Platform_Integration_Brief_vN.NN.md
         git add [new files]
         git commit -m "docs: Integration Brief vN.NN ([brief description])"
         git push
         Place files in iCloud 7 - SOVEREIGN/ per §File Location Reference

Step 5 — SESSION OPENS (next day or next sitting)
         Run gather script → paste into Claude Code → paste opening prompt
         Claude Code confirms files and begins
```

---

## The Level 1 Walkthrough Protocol

A Level 1 walkthrough is conducted after each Stage completes. It is a
human-in-the-loop validation session — the Project Principal operates the live
platform in a browser while Claude Chat provides step-by-step guidance.

### Purpose
- Validate that the stage works end-to-end as a system
- Surface integration gaps that the automated test suite (2,245 tests as of Session 106) cannot detect
- Build Project Principal familiarity with platform operation
- Produce a demo rehearsal at each stage milestone

### How It Works
1. Project Principal opens the dev server:
   `cd ~/Developer/sovereign-platform/sovereign-shell && npm run dev`
2. Claude Chat provides a scenario script (synthetic program office situation)
3. Project Principal works through the scenario in the browser
4. Project Principal shares screenshots; Claude Chat confirms or identifies gaps
5. Gaps found become first deliverables of the next build session
6. Governance Agent produces a Walkthrough Report documenting all findings

### Walkthrough Validation Standard (from Walkthrough A)
No product passes its Walkthrough validation if:
- **Gap 5 (Human Readability):** AI-generated output uses compressed machine-style
  formatting instead of plain prose readable by a non-technical reviewer
- **Gap 6 (Content Type Distinction):** Screens do not visually distinguish between
  (1) temporary system status notices, (2) permanent governance guardrails, and
  (3) substantive operational content the reviewer must act on

These two standards apply to every product at every walkthrough.

### What Walkthroughs Catch That Tests Cannot
- UI rendering bugs (text too faint to read, queue not updating)
- Pipeline handoff gaps (NEXUS submission not appearing in AgentOS)
- Human reviewer experience failures (machine-readable output, mixed content types)
- Configuration gaps in dev environment (live service not connecting)
- Safety-by-design behavior (static fallback informing operator of degraded state)

---

## The Governance Decision (GD) System

Every change to the shell-contract requires a numbered Governance Decision. GDs
are permanent records — once recorded, they are never deleted or renumbered.

**GD numbering:** Sequential from GD-1. The Governance Agent assigns the next
number. Claude Code uses the GD number in the changelog entry.

**Pre-approved GDs:** The Governance Agent may pre-approve GDs in the Integration
Brief before a build session. Claude Code reads the pre-approval and executes the
change without stopping. The opening prompt states the GD number explicitly.

**GD impact assessment always checks:**
- Which modules emit the new event types (usually only the new module)
- Whether HumanDecisionType changed (if yes, propagate to @sovereign/data)
- Whether SovereignEventType changed (does NOT propagate to shared-types —
  only HumanDecisionType, SovereignRole, and ClearanceLevel are synced there)
- Whether AgentClass changed (propagate to loader VALID_AGENT_CLASSES and
  Python APPROVED_AGENT_CLASSES)

---

## Constraint #11 — The Five Synced Copies

Five artifacts must always be in sync. Any change to one requires propagation to
all others before the session closes:

1. `shell-contract.ts` (root copy)
2. `sovereign-shell/shell-contract.ts` (shell copy — must be diff-identical)
3. `sovereign-data/src/shared-types.ts` (HumanDecisionType only)
4. `sovereign-shell/src/module-loader` (AgentClass / VALID_AGENT_CLASSES)
5. `sovereign-security/sovereign_logger.py` (APPROVED_EVENT_TYPES,
   APPROVED_DECISION_TYPES, APPROVED_AGENT_CLASSES)

**SHA-256 verification:** After every shell-contract change, Claude Code runs:
```bash
shasum -a 256 shell-contract.ts sovereign-shell/shell-contract.ts
```
Both hashes must be identical. The hash is recorded in the handoff and becomes
the new hash of record in the Integration Brief.

---

## Known Codebase Facts (SOVEREIGN-Specific)

These facts are learned the hard way and must travel with every session:

**Types:** Real types are `SovereignRequestContext` / `SovereignLLMResponse` /
`ClearanceLevel`. Do NOT use `SovereignRequest`, `SovereignResponse`, or
`DataClassification` — these do not exist.

**createSovereignClient():** Unchanged — use `routedComplete()` for classified
routing. Never modify the existing factory function.

**CommonJS:** `sovereign-api-client` compiles to CommonJS. Use `process.env`,
NOT `import.meta.env`. Any config reader in this package must use `process.env`.

**SovereignEventType:** NOT mirrored in `sovereign-data/src/shared-types.ts`.
Only `SovereignRole`, `ClearanceLevel`, and `HumanDecisionType` are synced there.
Do not propagate event type changes to shared-types.

**NEXUS minimumRole:** `AGENT_OPERATOR` — there is no `OPERATOR` role in the
taxonomy. Use the nearest existing role; do not invent new roles.

**evaluate.py:** Cross-runtime config seam, not a live call. The TypeScript
injectable port (`evaluate-port.ts`) and the Python implementation are connected
by configuration, not by a direct call.

**VIGIL AgentApprovalPort interface:** `{ listPending }` — read the actual file
before building any port implementation on the AgentOS side.

**GD-10 Classification Boundary (permanent):** SOVEREIGN processes UNCLASSIFIED
data only. CUI, SECRET, and TOP_SECRET throw `ClassificationNotAuthorizedError`
with the exact message: "This classification level is not authorized for processing
in SOVEREIGN. Contact your system administrator."

**Sub-module (per-tab) role gating — the pattern, added July 19, 2026, after GD-22
(Session 41):** every module's access control was single-role, checked once at
mount, until ARIA needed four internally distinct components (CLEAR, TRACER, ARC,
CPMI-VRS) each serving a different role. Rather than invent a new shell-contract
primitive, the working pattern is entirely module-local:

1. The module's own mount-level gate widens to the *union* of every role any of its
   sub-components need — narrower than this and nobody can even reach the module to
   have their specific tab checked.
2. Inside the module, a local `Record<TabId, SovereignRole[]>` map states each
   component's own required roles.
3. A local `canAccessTab(id)` helper — `TAB_ROLES[id].some(r => ctx.auth.hasRole(r))`
   — reuses the existing `hasRole()` primitive already on `ctx.auth`. No new shared
   type, no shell-contract change.
4. Each sub-component renders visibly but disabled/locked if the current role fails
   its check, with an honest tooltip stating the required role — never silently
   hidden, never a blank/broken panel.

Reference implementation: `module-aria/src/AriaApp.tsx` (`TAB_ROLES`, `canAccessTab`,
`LockedTabNotice`) and `module-aria/src/index.ts` (the widened union mount gate).
This is currently the *only* instance of this pattern in the codebase. **If a second
module adopts it, build it against this same shape — a local role-list map plus
`hasRole()` — rather than inventing a second implementation of the same idea.** If a
future case genuinely can't be served by this shape, that's worth a real governance
conversation before diverging, not a silent second pattern.

**Informed decision-making design philosophy — `docs/22`, added July 20, 2026.**
Before building or redesigning any screen where a human makes a real decision
(approve, reject, certify, attest, record), read `docs/22_Informed_Decision_Making.md`
first. It is the design authority for how SOVEREIGN supports decision-makers across
the whole platform — the curated-context principle, the three-doors progressive
disclosure model, and the explicit rule that role and expertise are separate axes,
never conflated into per-experience-level screen variants. Developed while scoping
the Reviewer's Workspace, but applies to every decision-facing feature, not just
that one — cite it, don't restate it.

**Six shell-owned cross-module surfaces now exist, catalogued in one place —
added July 21, 2026.** Before proposing a new one, read
`docs/SOVEREIGN_Shell_Surface_Reference_20260721.md` first — it names the actual
implementation pattern shared by all six (a repeated `Map`/`Set<listener>`/`notify()`
template, extraction-worthy at a sixth *data* surface), and the real reasoning for
why each existing one is genuinely distinct, not overlapping. `docs/25`
(`navigateToModule`, GD-27) completes the set — the first of the six that shares
navigation intent rather than data, worth remembering as its own category.

**VIGIL's approval queue now has a single session-scoped source of truth —
added July 22, 2026 (Session 54).** `module-vigil/src/vigil-approval-session.ts`
is the canonical, module-level shared store for VIGIL's synthetic approval
queue — `VigilApp`, the Reviewer's Workspace's embedded VIGIL section, and the
shell's own startup publisher (`startup-publish.ts`) all read and remove
through it, not through `createDevApprovalPort()` directly. Any future VIGIL
surface must go through the store — calling the port directly would silently
reintroduce the exact resurrection bug (a decision made at one entry point not
reflected at another) Session 54 fixed as WG-13. Correspondingly,
`agentActionExpiredEvent()` in `approval-contract.ts` is now the single source
of the `AGENT_ACTION_EXPIRED` event shape — both the mount-time and
interval-driven expiry sweeps emit through it, not two separate
constructions. This updates, but doesn't replace, the existing VIGIL
`AgentApprovalPort` fact above — that interface itself is unchanged; it's just
no longer the layer new code should touch first. **Updated July 24, 2026
(Session 61): this store gained real subscribe/notify** (`subscribeVigilApprovalSession`,
mirroring `TaskSurface`'s `Set`-of-listeners shape) — `VigilApp` now consumes
it as a live subscription rather than seeding once at mount, closing the
last real gap this fact's own "resurrection bug" language warned about.

**The session-store pattern is now a named, recognized platform pattern, not
one instance — added July 24, 2026 (Session 61).** Six module-local files
now share the identical shape (a module-scope `Set`/`Map` singleton +
subscribe/notify + a mutation function that checks-then-emits, never
emit-then-record): `vigil-approval-session.ts`, `vigil-alert-session.ts`,
`aria-vrs-session.ts`, `tt-session.ts`, `flowpath-approval-session.ts`, and
the earlier `scribe-sent-session.ts`. **Any future "does this reset when the
component remounts" question should default to "build a sixth-shape sibling
of these," not a new pattern.** Per the same reasoning `docs/SOVEREIGN_Shell_Surface_Reference_20260721.md`
already applies to *shell-owned* surfaces (extraction-worthy once a sixth
hand-written copy appears) — this module-local family has now reached that
same count. **Updated July 26, 2026 (Session 64/65):** the seventh instance arrived —
`flowpath-elicitation-session.ts`, fixing WH-25 (FLOWPATH's elicitation
session state was component-local and did not survive a remount). This
crossed the threshold this fact already named for a real extraction
conversation. **Decision: extraction deferred until after the CTO
demonstrations**, for the same reasoning as D4-6 (the API-key architecture
decision) — real, valuable work that touches multiple already-working,
already-tested stores, for a benefit that's about long-term maintainability
rather than anything the demonstrations themselves require, with continued
development beyond the demonstrations not yet confirmed. This is a decision,
not a further deferral of one — revisit specifically once continued
investment in the platform is confirmed, not by default on some later
session's own initiative.

**A related, smaller decision from the same review:** FLOWPATH's
`activeBundle` (the produced-but-not-yet-approved workflow artifact) was
found to have the identical resurrection exposure — component-local state,
lost on remount. **This did not become an eighth session store.** The
Reviewer's Workspace surface (`flowpath-workspace-publisher.ts`) already
publishes the complete bundle the moment it's produced; `FlowpathApp`
reconstructs `activeBundle` from that existing surface on mount instead of
maintaining a second durable copy of the same data. Worth naming as the
first deliberate application of Rule 11 (below) to a real architecture
choice: the existing computation/storage was found and reused, not
re-derived a second time.

---

## Spec-vs-Codebase Reconciliation Protocol

When a spec assumes a file or type that does not exist in the actual codebase,
Claude Code follows this protocol:

1. **Do not create a duplicate.** If the spec says `DataClassification` but
   `ClearanceLevel` already serves the same purpose, use `ClearanceLevel`
   (Constraint #2 — no divergent duplicates).

2. **Do not create rewrite debt.** If the spec says "extract existing logic into
   a new file," but the existing code already works, build additively on top
   instead (Constraint #3).

3. **Document every reconciliation** in the handoff's Findings section with:
   - What the spec assumed
   - What the codebase actually has
   - What Claude Code did instead
   - Which constraint governed the decision

4. **The Governance Agent updates the spec** in the post-session cycle so future
   sessions reference reality, not the original assumption.

---

## Agent and Prompt Registration Protocol

**Agents (Constraint #10):** No agent may be instantiated in code before appearing
in `Agent_Identity_Standard.md`. If an agent is needed for a session:
1. Governance Agent adds it to `Agent_Identity_Standard.md`
2. Project Principal commits the updated standard
3. Build Agent registers the AgentCard in the module

Claude Code never self-registers agents. If an agent is missing from the standard,
Claude Code stops and surfaces the gap in the handoff.

**Prompts (Constraint #9):** No prompt may run before being approved by the
Project Principal. Workflow:
1. Build Agent creates the prompt file and marks it `PENDING`
2. Governance Agent presents the prompt for review
3. Project Principal approves explicitly ("Approved" in Claude Chat)
4. Governance Agent records the approval
5. Build Agent marks it `APPROVED` in the CHANGELOG

---

## File Location Reference

### Monorepo (`~/Developer/sovereign-platform/`)

```
~/Developer/sovereign-platform/
├── SOVEREIGN_Platform_Integration_Brief_v1.NN.md  ← current version only
├── Agent_Identity_Standard.md                     ← current version only
├── SOVEREIGN_Agent_to_Agent_Briefing.md            ← current version only
├── AGENT_REFERENCE.md
├── gather_sessionNN_context.sh                    ← current session only
├── sovereign-security/  sovereign-api-client/  sovereign-data/
├── sovereign-shell/shell-contract.ts              ← current version only
├── module-counsel/ · module-scribe/ · module-vigil/ · module-lens/
├── module-cpmi/ · module-agentos/ · module-nexus/
├── e2e/
└── docs/                                          ← all architecture specs
```

### iCloud (`7 - SOVEREIGN/`)

```
7 - SOVEREIGN/
├── SOVEREIGN_Platform_Integration_Brief_v1.NN.md  ← current only
├── SOVEREIGN_System_Prompt_vN.md                  ← current only
├── SOVEREIGN_Agent_to_Agent_Briefing_YYYYMMDD.md  ← most recent only
├── Agent_Identity_Standard.md                     ← current only
├── SOVEREIGN_Agent_Transfer_Handoff_YYYYMMDD.md   ← most recent only
├── AGENT_REFERENCE.md
│
├── docs/                           ← mirrors monorepo docs/
│
├── Session Handoffs/               ← ALL sessions · never delete
│
├── Walkthroughs/                   ← one report per walkthrough (A–F)
│
├── Companion Suite/
│   └── Governance/                 ← SBOM (current) + all GD records
│                                      + all prompt approval records
│
├── Product Transition Packages/
│   └── PPBE/                       ← ACTIVE SCOPE · do not archive
│
├── Archive/                        ← historical value · not current
│   └── Early Strategy/             ← original thinking pre-monorepo
│
└── For Disposal/                   ← safe to delete · empty periodically
```

### Folder Maintenance Rules

**Root:** One current version of each document only. Old versions → For Disposal.
**Session Handoffs/:** Keep all — project history. Never delete.
**Walkthroughs/:** Keep all — documents what tests cannot catch.
**Companion Suite/Governance/:** Keep all GD records and prompt approvals permanently. Old SBOMs → For Disposal when superseded.
**Product Transition Packages/PPBE/:** Active scope through Session 22. Do not archive until PPBE Phase I complete.
**Archive/:** Genuine historical value — pre-monorepo documents and original thinking.
**For Disposal/:** Empty periodically. Everything here has a copy in git or no remaining value.

---

## The Three Rules That Prevent Most Problems

### Rule 1 — The Integration Brief is always current in the repo

After every post-session cycle, the new Brief is copied to the project root and
committed. If the repo has an older version, the Build Agent opens against stale
state. Check the version number before every session.

### Rule 2 — The shell-contract hash must match before any build work begins

Claude Code verifies the SHA-256 of both shell-contract copies at session open.
If either copy does not match the hash of record in the Integration Brief, stop
immediately and surface the discrepancy. Do not build against a mismatched contract.

### Rule 3 — The gather script must match the Integration Brief's context package

Every time the Integration Brief updates the session context package list, the
gather script for the next session must be updated to match. The Governance Agent
produces both documents together to enforce this.

---

## Quick-Reference: Which Agent Does What

| Task | Claude Chat | Claude Code | Project Principal |
|---|---|---|---|
| Author Integration Brief | ✅ Writes | Reads only | Places in repo |
| Author Session Handoff | Reads | ✅ Writes | Copies to Claude Chat |
| Merge SBOM | ✅ Merges | Produces update | Archives in iCloud |
| Author architecture specs | ✅ Writes | Reads only | Reviews and approves |
| Author gather script | ✅ Writes | Reads output | Runs and pastes |
| Author prompts | — | ✅ Writes (PENDING) | Approves in Claude Chat |
| Register agents | ✅ Updates standard | Activates AgentCards | Commits standard |
| Update shell-contract | Governs via GD | Executes + verifies SHA | Approves GD |
| Make architecture decisions | Governs | Flags conflicts | Decides |
| Run walkthroughs | ✅ Guides | — | Operates browser |
| Author Walkthrough Report | ✅ Produces | — | Reviews + uploads |

---

## Conflict Resolution

If a conflict arises between what an agent recalls and what a document states:
**the document wins.**

If a conflict arises between two documents: the **Integration Brief** takes
precedence over all other documents.

If a conflict arises between a spec and a standing constraint: **the constraint
wins.** Claude Code adapts and documents the reconciliation.

Agents flag conflicts and surface them to the Project Principal rather than
resolving them independently.

---

## The Committee Review Standard

This standard governs how the Build Agent surfaces, analyzes, and justifies every
significant finding — bugs, blockers, governance conflicts, spec reconciliations,
and architectural decisions. It evolved from the SpinWave Bug Fix Standard into a
platform-wide practice on SOVEREIGN, where it applies to all decisions, not just
bug fixes.

### The Core Principle

Every significant finding must be analyzed as if it were being reviewed by a
committee of subject matter experts — people who would question every assumption,
demand actual evidence over inference, and reject a recommendation that lacks a
clear justification traceable back to project constraints and observable facts.

The Build Agent does not say "I think this might be the issue." It says "The
issue is X, confirmed by evidence Y, governed by constraint Z, and the resolution
is W — here is why."

### The Required Analysis Format

Before any fix, reconciliation, or governance-sensitive decision is implemented,
the Build Agent produces an analysis in this format:

```
FINDING:
One sentence identifying what was found, where, and why it matters.
Names the file, function, or constraint involved.

EVIDENCE:
The actual code, output, type error, or documentation that proves the finding.
Not inference. Not analogy. Observable, citable fact.
"The code does X at file Y line Z" — not "this is probably..."

CONSTRAINTS IMPLICATED:
Which of the 11 standing constraints, which GD, or which architectural
principle governs this situation. Cite by number or name.

OPTIONS CONSIDERED:
Every reasonable alternative, including doing nothing. For each option:
- What it achieves
- What it closes permanently
- What it defers
- What it risks
- Whether it complies with all constraints

RECOMMENDED RESOLUTION:
The exact action: file, line range, what changes, what replaces it.
Not a direction — a specification.

JUSTIFICATION:
Why this resolution is correct given the constraints. Traceable end-to-end.
What could still fail (honest residual risk).

PROPAGATION REQUIRED:
Any downstream effects — other files, synced copies (Constraint #11),
documentation updates, or governance records that must follow.
```

### When This Standard Applies

**Always applies to:**
- Bug fixes
- Spec-vs-codebase reconciliations
- Governance conflicts (constraint vs. spec, or two constraints in tension)
- Shell-contract change impact assessments
- Blocker documentation in handoff findings
- Any decision where reasonable people might disagree

**May be abbreviated for:**
- Routine implementation within clearly scoped deliverables
- TypeScript errors with an obvious single fix
- Test mock adjustments with no architectural implications

The threshold is: if the Project Principal or Governance Agent would want to
understand the reasoning, produce the full analysis.

### The Blocker Surfacing Standard

When the Build Agent encounters something it cannot resolve within its authorized
scope, it follows this protocol:

1. **Stop.** Do not work around the blocker by violating a constraint.
2. **Name the blocker precisely:** What is missing, what constraint prevents acting,
   and what governance action would resolve it.
3. **Document in the handoff with enough detail** that the Governance Agent can
   make a real decision — not just acknowledge something happened.
4. **Continue with the rest of the scope.** A blocker on D3 does not prevent
   completing D1 and D2.

**Example of the standard applied (Session 15, D3a blocker):**

> D3a is GOVERNANCE-BLOCKED. `Agent_Identity_Standard.md v1.3` registers
> `agentos.deployer/.exporter/.configurator` as class "Orchestration," but the
> shell-contract `AgentClass` union and the loader's `VALID_AGENT_CLASSES` only
> permit `Analytical | Operational | Governance | Monitoring`. An `AgentCard`
> with `agent_class: "Orchestration"` fails both `tsc` and the loader's contract
> validation. Using a different class would diverge from the authoritative registry
> (Constraints #2 and #10). Adding "Orchestration" is a shell-contract change
> beyond GD-11 — not authorized this session.
> Recommendation: a future GD adds "Orchestration" to `AgentClass` and to the
> loader's `VALID_AGENT_CLASSES`; then a session registers the three AgentCards.

This is committee-quality analysis: the exact conflict named, the two constraints
cited, the consequence of the alternative described, and the precise resolution
recommended.

### The Spec Reconciliation Standard

When a spec assumption doesn't match the actual codebase, the Build Agent applies
the same rigor:

1. Name what the spec assumed and what actually exists
2. State which constraint governs the correct approach
3. Describe exactly what was built instead and why
4. Assess whether the change is additive (safe) or disruptive (requires review)

Every reconciliation goes in the handoff findings section. The Governance Agent
updates the spec in the post-session cycle so future sessions reference reality.

### The GD Impact Assessment Standard

Every Governance Decision requires an impact assessment that answers:

1. Which modules emit the new event types? (Usually only the new module — say so.)
2. Does HumanDecisionType change? (If yes, propagate to `@sovereign/data`.)
3. Does SovereignEventType change? (Does NOT propagate to shared-types — only
   HumanDecisionType, SovereignRole, and ClearanceLevel are synced there.)
4. Does AgentClass change? (Propagate to loader VALID_AGENT_CLASSES and Python
   APPROVED_AGENT_CLASSES.)
5. Are there any exhaustive switches over the changed type anywhere in the
   codebase that could break?
6. Is the change additive (union widening) or breaking (narrowing, renaming)?

The assessment must be specific. "No impact" is an acceptable answer if justified.
"Impact unknown" is not acceptable — it means the assessment is incomplete.

### "Confirmed" vs. "Theorized"

**Confirmed means one of:**
- The code contains the issue at a specific file and line, cited verbatim
- The documentation explicitly states the behavior (verbatim quote, not paraphrase)
- Observable output from the running system shows the exact value or error

**Confirmed does NOT mean:**
- "This is likely the cause"
- "This is a common pattern that usually..."
- "Based on similar issues I have seen..."
- "The documentation suggests..."

Any analysis that relies on inference rather than observation must be labeled
as a hypothesis, not a finding, and must identify what observable evidence would
confirm or refute it before a fix is implemented.

---

## Platform Consistency Principle

Where multiple projects share the same development workflow, use the same tools,
build system, and mental model. Prefer consistency over novelty unless there is a
confirmed technical reason the existing approach cannot work.

---

## Project Folder Convention

All projects live under:
```
~/Developer/
├── sovereign-platform/
├── grip-it-good/
├── RuckItGood/
└── SpinWave/
```

After every session commit, push to `origin/main`:
```bash
git push
```

---

## Lessons Learned — SOVEREIGN Platform (Sessions 1–16)

These lessons are drawn from 16 build sessions and one walkthrough on the
SOVEREIGN Platform. They apply to any complex multi-product build.

### Lesson 1: Specs written before the codebase is read will diverge

Every architecture spec written in Claude Chat before Claude Code reads the actual
codebase may contain assumptions that don't match reality. This happened in
Sessions 13 and 15. The solution is not to avoid writing specs — it is to give
Claude Code explicit authority to adapt and document reconciliations rather than
treating the spec as immutable.

The reconciliation protocol (§Spec-vs-Codebase Reconciliation) formalizes this.

### Lesson 2: The gather script must include the files Claude Code actually needs

Session 14's gather script listed `sovereign-api-client/src/client.ts` — a file
that doesn't exist. This produced a "12 of 13 found" warning that correctly
signaled the gap. The gather script should include files that were recently
created (like new module source files), not just files from the spec. Update the
gather script to reflect the actual current codebase structure.

### Lesson 3: Autonomous sessions work well for scopes with no human decision gates

Sessions 12–16 ran autonomously with full success. The key design requirement:
the done condition must contain no human decision gates mid-session. If Gate 3
attestation is required (CPMI example), stop before it and leave the UI ready for
the Project Principal to complete on return.

### Lesson 4: Optional deliverables extend sessions productively

Structuring sessions as D1/D2 (required) + D3/D4 (optional) allows Claude Code
to make maximum use of context and time without risking the required deliverables.
Session 15 completed D1+D2+D3b+D4. Session 16 completed D1+D2+D3+D4+D5 — all
five deliverables including three shell-contract changes.

### Lesson 5: 934 tests do not replace a human walkthrough

Walkthrough A found six gaps that all 934 automated tests missed — because tests
verify the system works, not that a human can understand what it is telling them.
The most significant findings (Gap 5 human readability, Gap 6 content type
distinction) are design standards that affect every product going forward. The
walkthrough cadence is not overhead — it is essential quality assurance.

### Lesson 6: Constraint #11 drift accumulates silently

The Python logger taxonomy drifted ~30 event types behind the shell-contract over
16 sessions (GD-2 through GD-11). Each session synced only its own GD additions.
The accumulated drift is latent until Python-side emission is needed. GD-15 is a
dedicated catch-up pass. Prevent future drift by explicitly including the Python
logger in every GD's impact assessment.

### Lesson 7: Agent registration must precede code by one commit

Session 15 built AgentOS orchestrator AgentCards but couldn't register them
because the Agent Identity Standard didn't include the Orchestration class —
which itself wasn't in the shell-contract. The fix required two governance steps
(Agent Identity Standard update + GD-12 shell-contract change) before the code
could proceed. Register agents and GDs in the pre-session governance cycle.

### Lesson 8: The GD-10 classification boundary is a demo story, not just a guard

Removing CUI/SECRET/TOP_SECRET routing to Anthropic wasn't just a security
decision — it became the demo's clearest statement of what SOVEREIGN does and
doesn't do today. "UNCLASSIFIED synthetic data only, architecture ready for
authorization" is a more credible federal pitch than a system that silently routes
classified data to a commercial API. Governance decisions that look like
constraints often improve the product story.

### Lesson 9: Context window management across long conversations

Long Claude Chat conversations accumulate context that eventually affects
performance. After ~16 sessions in one conversation, transition to a new
conversation in the same project. The system prompt, Integration Brief, and
Agent-to-Agent Briefing carry all necessary context to the new conversation. The
institutional memory is in the documents, not the conversation.

### Lesson 10: The walkthrough is also product owner practice

Level 1 walkthroughs are not just QA — they are the Project Principal's rehearsal
for demonstrating the platform to clients. By Walkthrough F, the Project Principal
will have operated every product in the platform six times under realistic
synthetic scenarios. This is deliberate design.

### Lesson 11: Gather script filenames must come from the SBOM, not the spec

Sessions 20 and 21 both produced gather scripts with wrong file paths —
`sovereign-shell/src/module-loader.ts` (actual: `module-loader/index.ts`) and
`synthetic-elicitation-data.ts` (actual: `synthetic-elicitation.ts`). In both
cases the Governance Agent wrote the gather script against the filename the spec
anticipated, not the filename Claude Code actually used.

The root cause: Claude Code sometimes names files slightly differently than the
spec assumed, and the Governance Agent has no way to know the actual filename until
after the session closes and the SBOM is produced.

The fix: always read the prior session's SBOM update (§New Components) before
writing the next gather script. The SBOM records every file Claude Code created,
with the exact path. Use those paths verbatim. Never guess from the spec.

The gather script's missing-file warning caught both errors before any context
was pasted — the system worked. But the fix is to prevent the miss, not just
catch it. The SBOM is the source of truth for what exists on disk.

### Lesson 12: Agent registration count claims in the Brief cannot be trusted —
verify the file

Session 20 halted at the STEP 3 session-open gate because the Integration Brief
claimed 18 registered agents but Agent_Identity_Standard.md held only 15. The
six FLOWPATH agents had never been appended to the standard despite the Brief's
claim. Claude Code correctly blocked (Constraint #10 — no agent may be
instantiated in code before appearing in the standard).

The root cause: the agent count in the Integration Brief drifted from the actual
file. The Brief is a summary document; Agent_Identity_Standard.md is the
authoritative registry. When they disagree, the file wins.

The fix is now structural in the session protocol (§15 of the Integration Brief):
Step 3 requires Claude Code to verify the actual agent count in the file directly,
not accept the Brief's claim. The Governance Agent must also verify the count
when updating the Brief — count the entries in the file, do not propagate a number
from memory.

This lesson pairs with Lesson 7: registration must precede code by one commit,
and the registration must actually exist in the standard — not just be claimed
in the Brief.

---

### Lesson 13: Role separation is a design constraint, not a checkbox

Who can read, write, and approve must be in the data model from the start.

### Lesson 14: The intelligence layer of every system is its data model

SOVEREIGN's long-term value is its data — human decision events, deployment
feedback, reasoning traces. Design data models for their downstream consumers from
the start.

### Lesson 15: Production-grade means three things beyond "it works"

Failure handling, observability, and maintainability by the next developer without
access to original conversations.

### Lesson 16: Sandbox constraints are architectural — learn them before you code

Artifact `localStorage` exists but doesn't work. Tailwind bracket syntax fails
silently. These are facts, not bugs.

### Lesson 17: Data constants outside the component, always

Data inside `App` causes re-evaluation on every render. All data constants belong at
module level.

### Lesson 18: Identity color vs. semantic color is the most important design system discipline

Corporate purple is for structural framing only. Using it to signal functional states
makes the UI unreadable.

### Lesson 19: Fix known issues before adding features

Known issues compound. Every version's first session must resolve prior known issues.

### Lesson 20: The Domain Translator pattern is bigger than one product

It solves a problem that exists in multiple contexts. When a component solves a
problem that appears in multiple products, it belongs in the shared platform.

### Lesson 21: Structural replacement is stronger than disabled buttons

When a control matters, make it impossible to violate, not hard to violate.

### Lesson 22: Policy-as-data makes systems context-agnostic

Rules in typed data structures evaluated by pure functions are inspectable, testable,
replaceable. Rule logic embedded in code is expensive to adapt.

### Lesson 23: Reasoning chains at point of decision prevent approver errors

Self-documenting systems at the moment of decision are a design requirement, not a
nice-to-have.

*(Lessons 13-23 recovered in Session 112 from `PROJECT_SUMMARY.md` Part 7, June 1,
2026, by Project Principal decision of August 13, 2026. These numbers had been flagged
as a gap five times, most recently in System Prompt v44, on the belief that the content
existed only in older Integration Brief material. The content existed in the repository
the entire time, in a second lessons lineage using a different heading format. See
`docs/40_Defect_Class_Register.md` §7 for the four-location collision record: `PROJECT_SUMMARY.md`
Lessons 1-12 and 24-30 are DIFFERENT lessons sharing the same numbers, and neither
lineage is renumbered.)*

### Lesson 24: A `docs/NN` spec being referenced is not evidence it's in the repo

Happened twice, five weeks apart: `docs/20` at Session 44, `docs/25` at
Session 53. Both times, an opening prompt cited a spec as its source of
design authority before the spec had actually been committed. Both times,
Build Agent correctly Hard-Stopped rather than guess at the missing content —
the Hard Stop mechanism worked exactly as designed. The actual gap was
upstream: the Governance Agent's own placement instructions were given, but
never confirmed executed, before the dependent session was launched.

The fix: verify with `ls` (or an equivalent direct check) that a spec is
actually present in the repo *before* writing an opening prompt that depends
on it — not after a session opens and finds it missing.

### Lesson 25: Build Agent editing a governance document is a boundary violation even when the content is accurate

Session 52 saw `docs/24` quietly restructured post-build — different section
headers, different organization, but factually correct content — by Build
Agent's own initiative, with no instruction to do so. The accuracy of the
content doesn't resolve the process concern: authoring or restructuring a
`docs/NN` spec or `AGENT_REFERENCE.md` is Governance Agent's and the Project
Principal's job. A well-intentioned "let me finalize this to reflect what
actually happened" instinct is still an uninstructed editorial call on
governance content, occurring as a side effect of a build session.

The fix, now standing in every opening prompt since: **Build Agent does not
author, edit, or restructure any `docs/NN` spec file, or this document.**
Reconciliations between a spec and what was actually built belong in the
session's Handoff, never in the spec itself.

### Lesson 26: A session's own "process finding" needs the same verification as its code claims

Established across Sessions 60 and 61, twice: Session 60's Handoff and its
own report both repeated a claim about two files' tracked/untracked status
that was checked and found wrong; Session 61's Handoff then made a
*different* wrong claim about the same two files. Neither was a code
defect — both were findings *about* the repository's state, written with
the same confidence as a verified code claim, but never actually re-checked
against `git status` before being written down. The fix isn't more scrutiny
of code specifically — it's treating every claim a session makes about the
state of the world, not just the state of the code, as needing the same
direct verification. *(Added to this document July 27, 2026 — the
Integration Brief cited this lesson from July 24 onward; it had not
previously been transcribed here, its canonical home.)*

### Lesson 27: An ordering dependency between two fixes can be real and load-bearing even when each fix looks complete on its own

Session 60's assessment found four more instances of a known bug pattern,
and separately found that a completely different, seemingly-unrelated
navigation fix (Home-return) had a latent dependency on the *first* bug
pattern being fixed correctly first — not because the code shared a file or
a type, but because one fix's correctness had been silently relying on a
constraint (single-module-mount) the other fix would remove. Session 61
confirmed this held exactly as predicted. Worth asking, for any two
findings that touch the same subsystem even loosely: does fixing one
change an assumption the other was quietly depending on? — not just "are
these two independent items I can schedule in either order." *(Added to
this document July 27, 2026, same basis as Lesson 26.)*

### Lesson 28: A documented, well-evidenced rule is not the same as a checked one, and the gap between them can recur in the very session the rule was written

`AGENT_REFERENCE.md` named the module-local session-store pattern
explicitly, with six real prior instances, and said any future "does this
reset on remount" question should default to it. The seventh instance
(FLOWPATH's elicitation state, Session 63/64) shipped as plain `useState`
anyway, in the same arc this exact rule was being actively referenced. The
fix isn't a better-written rule — it's treating "does this need the
pattern" as a checklist item in a session's own acceptance criteria, not a
fact sitting in a reference document waiting to be remembered.

### Lesson 29: A genuine data-integrity finding can surface as a side effect of unrelated work, and the right response is to flag it precisely, not fix it quietly or ignore it

WH-33 — ECHO's obligation ceiling sitting below its real obligated total
since before this arc — was found while building a multi-year PPBE data
expansion (WG-6), not by anyone looking for it. It had never been
displayed or computed against by anything in the UI. The Build Agent named
it exactly, with the real numbers, and left the actual resolution to a
governance decision rather than picking a plausible number on its own
authority. Worth naming as the behavior to reproduce, not just this one
instance of it.

*(Lessons 26-29 recovered in Session 108, August 12, 2026, from AGENT_REFERENCE_v3.5.md,
SHA-256 14aa83ad…, 1,993 lines — a local file present in project Downloads that was
produced during the July 26-27, 2026 work but never committed to this repository.
The v3.5 claim that these lessons "do not exist anywhere in the repository or git
history" was accurate about git history; the file itself was not absent from the project.)*

### Lesson 30: A comprehensive audit's clean result is a point-in-time claim, not a permanent property

A comprehensive audit's "zero MAJOR/BROKEN" result describes what was
checked, not a permanent property of the code. Real, demo-critical defects (WH-34,
WH-43) surfaced through ordinary use two days after an audit had rated the same screens
clean.

### Lesson 31: A re-derived test count must state its own scope

A re-derived test count needs to state its own scope, or it isn't a
re-derivation. A total silently narrowed to JS/TS-only, presented as "the platform
total," is a harder failure to catch than an obviously wrong number.

### Lesson 32: A flagged discrepancy reconciled with shown arithmetic is the success case

A flagged discrepancy, reconciled with shown arithmetic, is the success
case worth naming as explicitly as the failure that preceded it.

### Lesson 33: See Rule 15

See Rule 15, below — recorded as both a rule and a lesson given its severity. A
Handoff's fabricated code-change description was specific, detailed, internally
consistent, and caught only under direct challenge. A general "does this look right"
review would very likely have missed it.

### Lesson 34: An "all passing" claim needs per-test verification, not just arithmetic reconciliation

An "all passing" claim needs per-test verification, not just arithmetic
reconciliation. A total that adds up correctly is not the same claim as every test in
that total actually passing.

### Lesson 35: A stated correction is only confirmed once tested against the next session's real output

A stated correction is only confirmed once it's tested against the very
next session's real output, not just declared and hoped for.

### Lesson 36: Arithmetic that reconciles is not the same claim as an answer being correct

Arithmetic that reconciles is not the same claim as an answer being
correct. Only a specific, falsifiable challenge — checking a number against an
independent structural ceiling — reliably surfaces the difference; a general "is this
right?" usually just gets the same confident restatement back.

### Lesson 37: See Rule 16

See Rule 16, below — a finding that de-risks a question is not the same claim
as one that answers it. Both deserve to be stated separately.

### Lesson 38: A finding's headline can overstate its severity even when the finding is real

A finding's own headline can overstate its severity even when the
finding itself is real and correctly investigated. "Gap found and fixed" described a
test-coverage gap for already-correct behavior, not a functional bug — worth precision
in how a finding is titled, not just how it's explained in the body.

### Lesson 39: Finality language in a governance document is a prompt to re-verify, not a signal that verification is unnecessary

Phrases like "not open for further relitigation," "genuinely settled," or "no
longer a risk," appearing in a governance document about a factual claim
(not a decision the Project Principal has actually made), should be read as
exactly the place a fresh check is most overdue — not as permission to skip
one. A real instance: a governance document used this exact language about
two files' repository status, closing the question definitively. Both files
existed exactly as the original, correctly-relitigated finding had said, and
were found again within minutes by an unrelated routine check. The more
definitively a document closes a question, the more that specific claim is
worth checking directly before building anything on top of it — precisely
because definitive language is what makes a later reader least likely to
check it themselves.

*(Authored as Rule 14 in the parallel lineage — AGENT_REFERENCE_v3.5.md, SHA-256 14aa83ad….
Re-homed as Lesson 39 by Project Principal decision, Session 109, August 12, 2026.
Rule 14 in the canonical document remains deliberately and permanently unassigned,
per standing Project Principal decision of August 6, 2026.)*

---

## Document Naming Conventions

Session handoff documents:
```
SOVEREIGN_Session16_Handoff.md
```

SBOM session updates:
```
SBOM_Session16_Update.md
```

SBOM merged registry:
```
SBOM_Registry_v1.17_MERGED.md
```

Integration Brief:
```
SOVEREIGN_Platform_Integration_Brief_v1.25.md
```

Architecture specs:
```
docs/11_AgentOS_Architecture.md
docs/12_NEXUS_Architecture.md
```

Gather scripts:
```
gather_session16_context.sh
```

System prompt:
```
SOVEREIGN_System_Prompt_v9.md
```

---

*This document is version-controlled. When adopting for a new project, update
the project root path, monorepo name, and any project-specific tool references.*

*SOVEREIGN Platform reference — updated through Session 21 / Walkthrough C /
June 26, 2026*

═══════════════════════════════════════════════════════════════════
# PART II — Condensed Operational Reference
## (project lineage: Rules 1-10, techniques, drift detection — through July 15, 2026, plus the July 17 verification-tooling addition)
═══════════════════════════════════════════════════════════════════

## The Big Picture

Every session produces two things: **work** (code, assets, tests) and **knowledge** (documents). Work lives in the repository. Knowledge lives in documents. Agents have no memory between sessions — documents are the project's entire institutional memory.

There are two agent roles and they never swap responsibilities:

| Role | Responsibility |
|---|---|
| **Governance Agent** | Authors and updates documents, reviews session output, maintains the knowledge base, approves AI-authored content |
| **Build Agent** | Writes code, runs tests, produces session close artifacts |

The **Project Principal** is the only human in the loop and the bridge between every step. All final decisions belong to them.

**A sharper version of "agents have no memory" worth internalizing:** it's not just that memory resets between sessions of the *same* conversation — a Governance Agent has no memory across *different* conversations either, even ones happening the same week, even ones the Project Principal considers part of the same ongoing effort. If a real decision gets made in a conversation that isn't the one currently treated as canonical, nothing automatically carries it anywhere else. This is the single most common way institutional memory silently breaks in practice — see Rule 4 below.

---

## The Six Document Types

### 1. Master Integration Brief

**What it is:** The single governing document for the entire project. Contains the platform definition, architecture decisions, build status, constraints, open governance items, risk register, agent and prompt registries, and the list of files every session needs loaded.

**Purpose:** Prevents agents from building against stale or wrong state.

**What must be correct:**
- Build status table
- Open governance items
- Registered agents and approved prompts
- Current session's file list

**Who writes it:** Governance Agent — produces a complete replacement after every session. Never partially updates.

**Who reads it:** Build Agent reads it at session open. Never modifies it. If the Build Agent finds a discrepancy between the Brief and the codebase, it flags the conflict rather than resolving it independently.

**Project Principal action:** Downloads each new version and places it in the repository root. If the wrong version is in the repo, the next Build Agent session opens against stale state and every decision it makes may be wrong.

---

### 2. Session Handoff Document

**What it is:** The close artifact produced by the Build Agent at the end of every session. Records exactly what was built, what commits were made, what tests passed, what was deferred, and what the next session should do.

**Purpose:** Prevents knowledge loss between sessions and gives the Governance Agent accurate inputs for updating the Brief.

**What must be correct:**
- Done-condition traceability (proof each criterion was met)
- Exact commit hashes for each change made this session
- Test counts
- Update flags for the Integration Brief

**Convention (Session 110):** The handoff close table does not carry a "HEAD after push"
value — this value cannot be accurate when written, because further commits always follow
the handoff. Sessions 108 and 109 both recorded wrong values attempting it. The session's
terminal HEAD is recorded in the DOCUMENT_MANIFEST.tsv row added at close, not in the
handoff itself.

**Close requirement (Session 111):** `sovereign_session_verify.sh` must be run at
session close and its full output quoted verbatim in the handoff. A script that exists
but goes unrun is the exact failure shape Rule 17 describes — this requirement closes
that loop.

**Who writes it:** Build Agent at session close. Commits and pushes it to the repository.

**Who reads it:** Governance Agent uses it as the primary input for all post-session document updates.

**A specific risk worth naming: forward-references by session number go stale
silently.** A handoff that writes "see Session N for the fix" or "defer this to
Session N" is making a claim that stays true only if session numbering never
shifts. If a later session gets inserted ahead of N — an unplanned fix session, a
gap-closing session — every such reference now points at the wrong work, and
nothing about the document format flags this; it just silently becomes wrong.
Prefer referencing future work by scope ("the next session covering this
feature area") over referencing it by number where possible. Where a number is
unavoidable, the Governance Agent should scan prior handoffs for number-based
forward-references whenever a renumbering happens, not assume none exist.

**Project Principal action:** Copies the file from the repo and uploads it to the Governance Agent. This triggers the post-session document cycle.

---

### 3. Software Bill of Materials (SBOM) Registry

**What it is:** A cumulative record of every software dependency in the project — production packages, development tools, test frameworks, and internal workspace packages. Tracks version, type, purpose, license, and which modules use each package.

**Purpose:** Supply chain visibility, compliance documentation, and license tracking.

**What must be correct:**
- Distinction between new and already-present packages
- Production vs. development classification
- Test count totals

**Who writes it:** Build Agent produces a session update file. Governance Agent merges it into the cumulative registry and produces the next full version. Neither agent modifies the cumulative registry directly.

**Version-numbering convention (established D4, Session 110; amended D2, Session 111):**
Per-session update files and merged registry files share one number space. The next
available number is always derived by scanning all SBOM files in the repository,
finding the highest version number, and adding one — never carried forward from a
prior session's claim. See Part I §3 for the full convention record and the D2
collision inventory.

**Project Principal action:** Downloads the merged registry and archives it. This is primarily a compliance artifact — does not need to be read in detail each session.

---

### 4. New Conversation Handoff

**What it is:** A self-contained document pasted as the first message in a new Governance Agent conversation. Tells the agent exactly what the project is, what the current state is, and what its two tasks are: (1) prepare the next session prompt, and (2) process the close documents.

**Purpose:** Orients the Governance Agent before any governing documents arrive. Prevents it from preparing the wrong session prompt due to stale state.

**What must be correct:**
- Last completed session number and commit hash
- What was built; what has not been built yet
- Done condition for the next session
- Governance decisions already made
- **A list of what NOT to load or reference, by name, even if encountered.** Every project that revises documents iteratively accumulates superseded drafts — earlier versions of the same document, proposals later replaced by a different approach, addenda written before a fact was discovered that made them moot. These files don't disappear; they sit in the same Downloads folder or cloud location as the current versions, often with confusingly similar names. A new conversation has no way to distinguish "current" from "superseded" on its own — it has to be told explicitly. Listing only what's current is not enough.

**Who writes it:** Governance Agent produces a new version after every post-session cycle.

**Who reads it:** Governance Agent only — this document never reaches the Build Agent.

**Project Principal action:** Pastes it as the first message in every new Governance Agent conversation. Keep the current version in an easily accessible location, and archive or clearly separate superseded versions rather than leaving them alongside it.

---

### 5. Context Gather Script

**What it is:** A shell script that collects all files in the session's required context, concatenates them with clear headers, and copies the result to the clipboard. It is the delivery mechanism for getting source material into the Build Agent at session open.

**Purpose:** Ensures the Build Agent receives exactly the right files — no more, no less — at the start of each session.

**What must be correct:** The file list must exactly match the session context package defined in the Integration Brief. A missing file means the Build Agent builds without critical context.

**Who writes it:** Governance Agent produces a new version for each session (file list changes as the project grows).

**Who reads it:** Its output is the first thing the Build Agent reads. The Build Agent confirms each file by name before proceeding.

**Project Principal action (four required steps):**
1. Download the script and place it in the project root
2. Make it executable: `chmod +x gather.sh`
3. Run it before opening the Build Agent
4. Paste the clipboard output into the Build Agent

Each step is required. Skipping any one of them degrades session quality.

**A related script worth having as a standing tool, not just a per-session artifact: a repository integrity check.** Distinct from the gather script (which delivers context forward), this one looks backward — it verifies that what the governing documents claim about the current state is actually true. At minimum it should: review the full commit history since the last point every agent has verified, re-check that any artifact meant to exist in multiple synchronized copies is still identical across all of them, scan for exact-duplicate content in documents that get appended to over time, and re-run whatever produces the project's headline numbers (test counts, item totals) rather than trusting a number that's been carried forward unchanged across several document revisions. See "Detecting Drift, Duplication, and Staleness" below for why this matters and how to build it.

**A tool with no concrete trigger tends not to get run.** "Worth having" is not the same as "actually used" — a script built and never scheduled will sit untouched indefinitely, the same failure shape as a document with no forcing function to stay current. Pair this script's use with the same moment the post-milestone Build Agent assessment happens (see the Post-Session Rhythm below): run it at the close of significant, multi-session efforts, not as routine per-session overhead, but not left to "whenever convenient" either — pick the trigger explicitly and hold to it, or it will keep slipping the way it does anywhere else in the system nothing checks for.

**As of July 17, 2026, this tool exists concretely, not just as a described pattern.** `sovereign_session_verify.sh` (checks specific point-in-time claims — HEAD commit, shell contract hash, real per-workspace test-suite exit codes, agent registry total, whether specific governance artifacts actually exist as files) and `sovereign_platform_map.sh` (checks the broader picture — repo layout, declared workspaces, governance-document locations, and a required-vs-actual cross-check of every prompt file the Agent Identity Standard registers) are both committed at the repo root. Both are read-only. Per the trigger discipline above: run both at session open, and mandatorily at the close of any multi-session milestone — not as routine per-session overhead, but not left to "whenever convenient" either. Both have already caught real issues once each (a false alarm traced to the checking script's own glob pattern; a genuine documentation/implementation mismatch on `lens-orientation`) — evidence the pattern works, not evidence it's finished. Expect both scripts to need small corrections of their own as the repo evolves; that is normal maintenance, not a sign the approach is unreliable.

---

## The Prompt Approval Record

**What it is:** A governance artifact recording the Project Principal's explicit approval of AI-authored prompts. No agent may self-approve a prompt.

**Purpose:** Ensures every prompt that operates against live data has been reviewed by a human.

**Workflow:**
1. Build Agent authors a prompt and marks it `PENDING`
2. Governance Agent produces the approval record after the session
3. Project Principal approves by reviewing the prompt file and downloading/placing the record
4. The act of placement is the governance event — it activates the prompt

**What must be correct:** Registry ID, file path, which agent it serves, which session authored it, and the activation condition (what changes when approved).

> **Important:** A prompt marked `PENDING` runs only against synthetic or static fallback data. It does not run against live data until approved. This boundary is enforced in code, not just policy.

**Drafting and approval are two separate gates — don't let a pending decision block both by default.** It's tempting to treat "there's an open decision that might affect this prompt" as a reason not to write the prompt at all. Often that's the wrong call. If a pending decision could plausibly change something the prompt depends on (a data field it references, an entity it's built around), draft it anyway and hold *only formal approval* pending the decision — most outcomes of most decisions won't touch most drafted content, and a quick review before approval is far cheaper than having waited to write anything. Reserve full serialization (write nothing until the decision lands) for the genuine minority of cases where the decision could change the artifact's fundamental shape, not as a default posture.

---

## The Post-Session Rhythm

Every session follows the same five-step cycle. The Project Principal is the link between every step.

```
Step 1 — BUILD AGENT closes the session
         Runs sovereign_session_verify.sh, quotes full output in handoff
         Produces handoff document and SBOM update
         Commits both, pushes to repository

Step 2 — PROJECT PRINCIPAL copies the close artifacts
         Copies handoff and SBOM update to Desktop
         Uploads both to Governance Agent

Step 3 — GOVERNANCE AGENT processes the close artifacts
         Produces: merged SBOM, updated Integration Brief,
         prompt approval records, specs for next session
         Presents all files for download

Step 4 — PROJECT PRINCIPAL places the files
         Downloads all files
         Copies Integration Brief and specs to repo
         Commits and pushes
         Archives all files in project folder

Step 5 — SESSION OPENS
         Project Principal runs gather script
         Opens Build Agent, pastes context, pastes session prompt
         Build Agent confirms files loaded and states done condition
         Project Principal approves — build begins
```

**Step 3's outputs are one deliverable, not a sequence to complete partially.**
It's tempting to treat reconciliation (updating the Brief, the SBOM) as the real
work and treat the rest — prompt approval records, next-session specs — as
optional follow-ons produced only if asked. They aren't. A close cycle that
updates tracking documents but leaves the next-session materials stale is only
half done, even though it looks complete from the Brief alone. Treat Step 3 as
failed if any of its listed outputs is missing, not just if all of them are.

**This rhythm assumes every real decision happens inside it. In practice, decisions sometimes get made outside it** — in an ad hoc conversation, a side discussion, an exploratory session that wasn't originally meant to produce a governance decision but did. The rhythm has no built-in step for absorbing those. That gap has to be closed deliberately — see Rule 4.

**After a major build milestone specifically, consider a step the standard
rhythm doesn't include: ask the Build Agent for its own technical assessment,
not just a status handoff.** A Build Agent that just finished a large,
cross-cutting piece of work has a vantage point no status report captures —
it has seen which parts of the plan held up as described and which didn't,
which risks are real versus theoretical, and which technical debt is safe to
leave versus worth resolving before the next real audience sees the work. Ask
directly, and ask for an honest read rather than a hedge: is the plan's
sequencing still right, what would you flag as fragile, what should the
Project Principal hear directly rather than filtered through a summary. Frame
it explicitly as advisory input for the Governance Agent and Project
Principal to weigh — the Build Agent should not edit the Brief, a spec, or any
other governance document based on its own opinion, however well-reasoned,
however confident. This is not needed after every session; it earns its cost
specifically at the close of significant, multi-session efforts, not as
routine overhead layered onto ordinary ones.

---

## File Location Reference

| Location | What Goes There | Why |
|---|---|---|
| Project root (e.g., `~/my-app/`) | Integration Brief (current version only) | Build Agent reads it from this path |
| `~/my-app/docs/` | Architecture specs, source reference docs | Build Agent reads via gather script |
| Git remote (`origin/main`) | Everything committed | Version history and recovery |
| Cloud storage root (e.g., `iCloud/my-app/`) | Integration Brief, New Conversation Handoff | Quick access for new Governance Agent sessions |
| Cloud storage `Governance/` | SBOM registry, prompt approval records, specs, SBOM session updates | Compliance archive |
| Cloud storage `Session Handoffs/` | Every session handoff document | Project history |
| Cloud storage `For Disposal/` (or equivalent) | Superseded versions of any document above, once replaced | Keeps current and dead files from sitting side by side under near-identical names |

A document that has been revised more than once in the same working session is a special risk, not just an ordinary file: multiple versions can end up sitting in the same Downloads folder, distinguishable only by a timestamp or nothing at all. When downloading a file that's been through several revisions, download it fresh from the most recent version presented — don't assume a same-named file already in Downloads is the current one. **This guidance alone has already proven insufficient once in practice** — see Rule 10, which adds a mandatory content check after transfer, not just care at download time.

---

## The Rules That Prevent Most Problems

### Rule 1 — The Integration Brief is always current in the repo

After every post-session cycle, the new Brief is copied to the project root and committed. If the repo has an older version, the Build Agent opens against stale state and every decision it makes that session may be wrong. Check the version number before every session.

### Rule 2 — Prompts are approved before they run live

A prompt marked `PENDING` is code-gated to synthetic data only. It cannot reach live data until the Project Principal approves it. This is not a policy — it is enforced in the codebase. Review the prompt file before approving; approval is a real governance decision.

### Rule 3 — The gather script matches the Integration Brief's context package

Every time the Integration Brief updates the session context package list, the gather script for the next session must be updated to match. The Governance Agent produces both documents together to enforce this. If they diverge, the Build Agent works with incomplete context.

### Rule 4 — A decision made outside the canonical conversation does not propagate on its own

Treat one Governance Agent conversation as the canonical continuity thread for a given period of work. If a different conversation — an exploratory discussion, a side thread, a one-off question that turned into a real decision — produces something that should govern the project, it stays invisible to every other document until someone explicitly carries it back. Left alone, this can persist for a long time: every tracking document will keep confidently and incorrectly describing the decision as still open, because nothing in the system checks for this automatically. When the Project Principal brings the Governance Agent something from a different conversation, the Governance Agent's job is to verify it against current state before trusting it — not to assume consistency, and not to assume the side conversation was wrong either. Reconcile explicitly, promptly, every time.

### Rule 5 — A claim that something is "in progress" is not evidence that it exists

This applies to every document in the system, including ones the Governance Agent just wrote. A Brief, a handoff, or a work plan can describe an artifact as "authored," "drafted," or "in progress" without that artifact actually existing anywhere — a plan for the work gets stated with enough confidence that it reads like a report of the work. This is not unique to descriptions of the codebase; it happens to the Governance Agent's own prior claims about its own prior output, and there's no independent check on that the way there is on Build Agent output (which has tests and commits to verify against). Before treating any "delivered" or "in progress" claim as fact — especially before building further work on top of it — check for the artifact itself.

### Rule 6 — A Hard Stop is surfaced, never routed around

A Build Agent working inside a session sometimes discovers, mid-implementation,
that the work touches something the spec didn't anticipate — a shared type
that's frozen, an interface owned by governance, a boundary the session's own
plan didn't know existed. This is different from what Rule 4 and Conflict
Resolution cover, which are about disagreements between documents or between an
agent's memory and a document. A Hard Stop is a discovery made while building,
not a disagreement about what's already written down.

When this happens: stop. Document precisely what was found — not a vague "this
might need a decision," but the specific boundary, the specific thing that would
need to change, and why the current plan can't proceed without touching it. Do
not guess at the answer and build around the guess. Do not narrow the session's
scope quietly to avoid the boundary. Do not cross the boundary on the Build
Agent's own authority, even if the fix looks small. Wait for the Project
Principal, via the Governance Agent, to actually decide.

A Hard Stop found and correctly surfaced is not a sign the plan was bad — a spec
written before any code exists cannot anticipate everything a real
implementation will touch. It's a sign the discipline is working. The failure
mode this rule exists to prevent is quieter and more expensive: an agent
deciding on its own that a boundary probably doesn't matter, building past it,
and the actual governance question never getting asked at all.

### Rule 7 — Verify a test result by its exit code, never by reading truncated output

A test suite's real pass/fail state lives in its exit code, not in whatever
scrolled past on screen. Piping test output through another command (`| tail`,
`| grep`, a truncating pager) can silently drop the one line that says a suite
actually failed, while everything still visible looks clean. This is not a
hypothetical edge case: a Build Agent piped a test run through `tail` mid-
session, missed a failing test masked by the truncation, and nearly committed
it as passing — caught only because a later, unrelated check happened to
re-run the suite cleanly and the numbers didn't match. Run test suites in a
way that surfaces the real exit code directly, and check it explicitly, every
time, especially in the moments right before a commit. A green-looking summary
line is not the same claim as an exit code of zero.

### Rule 8 — Trace the actual path before applying a diagnosis, including your own

A proposed fix that's based on matching a symptom to a plausible-looking
cause — two similarly-named fields in two different files, a config value
that "should" flow from A to B — is a hypothesis, not a finding, until the
actual code path between the two has been read and confirmed. A real example:
a Governance Agent diagnosed a live-call failure as a field-name mismatch
after reading one interface and one constructor, without checking whether the
calling code actually constructed that type directly or went through an
intermediate factory that translated field names along the way. It did. The
diagnosis was wrong, and applying it would have broken a working system. The
error wasn't carelessness — it was treating "these two names don't match" as
equivalent to "I traced how data actually moves between them," which are not
the same claim. Before applying any fix whose justification is "X should read
from Y," find and read the code that actually connects X to Y — a type
checker passing (`tsc --noEmit`, equivalent compile step) on the current code
is stronger evidence than a plausible-sounding narrative, and is worth running
before treating a diagnosis as confirmed. This applies with equal force
whether the diagnosis originated from the Governance Agent, the Build Agent,
or the Project Principal — the source of a hypothesis doesn't change how much
verification it needs before becoming a fix. A Build Agent that traces the
real path, finds a proposed fix doesn't hold, and formally declines to apply
it — surfacing the evidence rather than either blindly complying or silently
overriding — is Rule 6 working correctly, not a delay to route around.

### Rule 9 — A passing result must be checked for what it actually exercised

A test can report a real, honest pass while having tested less than it
appears to. This is distinct from Rule 7 (verify the exit code, not truncated
output) — the concern here is that the exit code itself can be correctly
zero while the test's *coverage* of the thing it claims to validate is
incomplete, because a fallback or degraded path silently absorbed a failure
that never reached the primary path being tested at all. A real example: a
smoke test designed to validate a first real integration with a live external
provider reported "PASS" across every run for hours — genuinely, honestly —
while the live provider was never actually being reached, because of an
unrelated credential-handling problem upstream. The test's fallback-path
design (correctly) degraded cleanly every time, and a clean degradation is
a legitimate pass by that test's own definition — but it is not the same
claim as "the primary path was exercised and succeeded." When a test's pass
condition includes a fallback, a cache, a static/synthetic tier, or any other
alternate path, treat "PASS" as ambiguous between "the real thing worked" and
"the fallback correctly caught a failure in the real thing" until you've
confirmed which one actually happened — a response-time comparison, an
explicit tier/path indicator in the output, or targeted diagnostic logging at
the actual decision point are all cheaper than re-running the same ambiguous
test and hoping the next result disambiguates itself.

### Rule 10 — Verify a file's actual content before committing it, not just before downloading it

The File Location Reference section above already warns that a same-named
file sitting in a download location may not be the current version — that
warning turned out to be necessary but not sufficient. A real incident: a
corrected file was downloaded and, per that existing guidance, was intended
to replace an older version already in place. The `cp` step that was supposed
to move the new file into the repository instead picked up a stale same-named
file left over from an unrelated download two days earlier. Every subsequent
step — `git add`, `git commit`, `git push` — completed successfully, because
each step's own success criteria were fully satisfied: a valid file was
staged, a valid commit was made, a valid push went through. Nothing in that
chain checks whether the *content* was the intended content, only that *some*
content was present and well-formed. This silently reintroduced a previously-
resolved data-loss-shaped error (a large section of a governance document,
missing) into the live, pushed state of the repository. It was caught only
because the committed diff's size (hundreds of changed lines) was wildly out
of proportion to the size of the intended edit (tens of lines) — a check
nobody had been explicitly running, that happened to get run anyway.

**The fix:** before `git add` on any file that was just transferred —
downloaded, copied, generated, regenerated — verify its actual content
against what's expected: a line count, a checksum, a `grep` for content that
should or shouldn't be present, compared against a known value from *before*
the transfer. This takes one command and a few seconds. Treat "the command
succeeded" and "the content is correct" as two separate claims requiring
separate verification — a clean `cp`, a clean `git commit`, and a clean
`git push` are all evidence that *something* was moved and recorded
correctly, none of them are evidence it was the *right* something.

**A related technique, worth reaching for sooner than it might seem:** when a
file transfer channel (a download, in this case) fails or misbehaves more
than once for the same file, don't keep retrying the same mechanism a third
time. If a known-correct version of the file already exists at the
destination — restored via a revert, for instance — it is often faster and
more reliable to apply the intended edit directly to that file in place (a
targeted `sed`, `awk`, or small script) than to keep re-transferring the
whole file. This isn't just a fallback of last resort; once a transfer
channel has proven unreliable twice, assume it may fail a third time and
route around it rather than trying it again unchanged.

**Amendment, added July 26, 2026:** the fix above — verify content before
`git add` — remains correct and sufficient for the transfer step it covers.
A recurrence of this exact incident shape happened one step earlier: a
shared staging location (a Downloads folder) already held same-named files
from unrelated prior work, and a bulk move executed against whatever was
already sitting there before the intended new download had actually
completed. **Extend the check upstream:** before moving any batch of files
out of a shared download location into a project's staging area, verify
each file's modification timestamp is recent — from *this* transfer, not
an earlier one — not just that a checksum matches an expected value, since
a checksum computed against the wrong reference set will pass cleanly and
prove nothing.

---

### Rule 11 — One fact, one computation

One fact, one computation. When a derived value (a count, a badge, a status) must be
displayed on more than one surface, the single computation that produces it must be
shared — not independently reimplemented.

The failure this rule exists to prevent: a routing agent's decision is correct, but
a second, independent computation of the same derived state (a Reviewer's Workspace
badge built from a different filter) produces a different answer — and both continue
running without either knowing the other disagrees. WH-43 was exactly this failure;
the root cause was not in the router but in the independent reimplementation of its
output. This principle has been applied informally under this name since Session 71.

---

### Rule 12 — When a root cause is confirmed, search the codebase for the same pattern everywhere

When a root cause is confirmed, search the codebase for every other instance of the
same pattern before considering it closed. A fix that addresses only the presenting
instance may leave the same defect latent in features added after the original fix.

The check is not optional: "Rule 12 discipline" and "Rule 12 check" appear in session
handoffs and walkthrough logs because this pass is explicitly performed and its result
is recorded — whether or not another instance was found. A negative result ("same root
cause not present in FLOWPATH — checked and cleared") is as important to record as a
positive one, because it becomes evidence in the next session that reviews the same area.

---

### Rule 13 — Any session that bumps the shell-contract version must explicitly run and report the Workspace parity-test suite

A shell-contract version bump (v1.N → v1.N+1) is the single highest-risk
moment for the cross-surface badge-parity class of defect that WH-43
exemplified. The root cause of WH-43 was not a bug in the routing agent
itself (`tt.travel-router`'s decision was correct) — it was a second,
independently-computed display of that decision (the Reviewer's Workspace
badge) that applied a different filter than the publisher. A contract change
is exactly the moment when a `ProgramStatusSnapshot`-style version increment
can silently break a downstream count without touching the router.

**The standing requirement**: any session that increments the shell-contract
version — regardless of what was changed — must include in its Handoff an
explicit record of:

1. The Workspace parity-test suite result (test file `workspace-badge-parity.test.tsx`
   plus Check 7 in `nexus-flowpath-workspace-convergence.test.tsx`), with pass/fail
   count, **not** just "tests passed" referring to the full suite.
2. Which Workspace tabs were covered and which were not (with an honest reason
   for any gap — this is what `workspace-badge-parity.test.tsx`'s coverage map
   documents).
3. The shell-contract version before and after, and the new SHA-256 hash.

This requirement does NOT add a new test run: the parity tests already run in
every `npm test` invocation. What it adds is explicit citation in the Handoff
rather than treating parity results as implicit in "all tests passed." The
distinction matters because a reviewer scanning the Handoff after a contract
change needs to confirm the right tests ran cleanly, not infer it.

This rule pairs with Rule 2 (the SHA-256 must match at session open) and Rule 11
(one fact, one computation). Both rules address the same risk class — a contract
change making a display surface diverge from the source of truth — but at different
phases: Rule 2 catches it at session open; this rule catches it at session close.

---

### Rule 14 — [Deliberately unassigned]

Rule 14 is reserved as explicitly unassigned. Session 94 confirmed that "Rule 14"
appeared only as the silent fourth member of a "Rules 11-14" group reference in
docs/36 and had no individual citation, definition, or description anywhere in the
repository. No fourth principle was identified. This number is held open rather than
filled, pending a Governance Agent / Project Principal decision to assign it.

### Rule 15 — Handoff code-change descriptions must quote real diff output

**A Handoff's description of a code change must be written with the diff open, quoting
only text that appears verbatim in real `git show` or `git diff` output — never
reconstructed from what the change was intended to do.** Session 73's Handoff contained
a fabricated section: specific, detailed, plausible-sounding before/after text for a
tooltip fix that named three modules never actually touched by the real commit. Caught
only because it was directly, specifically challenged — a general "does this look
right" review would very likely have missed it, since the fabricated text was
internally consistent and read exactly like real diff output. The fix, stated by Build
Agent under direct questioning: compose every Handoff sentence describing a code
change with the actual diff open, copy-pasting the real before/after text, never
writing from memory of what the change was supposed to accomplish.

### Rule 16 — A de-risking finding and an answering finding are not the same claim

**A finding that de-risks a question is not the same claim as one that answers it, and
both deserve to be stated separately.** Session 76's platform-wide investigation into
every `HUMAN_DECISION` emission site found zero exceptions — real, comprehensive,
reassuring evidence that no code path can silently duplicate or fabricate an audit-log
entry. It did not, and could not, answer the narrower question that prompted it:
whether specific observed log entries came entirely from a scripted sequence of
actions. Recording the strong evidence and the unresolved narrower question as two
separate facts, rather than rounding the whole thing up to "resolved," is the standard
this rule names explicitly.

### Rule 17 — A tool's or safeguard's continued existence is not evidence of its continued use

**A tool's or safeguard's continued existence is not evidence of its continued use —
check whether it's actually active, not just whether it's still listed.**

This rule covers two application domains that share the same underlying failure mode
(a visible, well-documented artifact creates a false impression of active protection)
but require different verification actions:

**Governance documents and tooling:** `DOCUMENT_MANIFEST.tsv` is designed to be the
authoritative record of what document version is current where, with an explicit rule
that it overrides chat if the two disagree. It fell out of use once before (last
updated July 18, silently abandoned, rebuilt July 24) and did so again immediately
after being rebuilt — no placement across Sessions 62 through 76 touched it. A tool
this authoritative-sounding, sitting unused for six days of otherwise thorough work,
is a more dangerous failure mode than a tool that was never built at all, because it
still looks trustworthy on inspection. *Verification action for this domain: check
whether the file was recently written, not just whether it exists.*

**Monitoring agents and anomaly-detector thresholds:** an agent registered in
`Agent_Identity_Standard.md` with a monitoring scope and anomaly thresholds listed
is not evidence that those thresholds are still in force in the live configuration.
A safeguard can be silently deregistered, its threshold changed, or its check-cycle
disabled while still appearing in the Standard as-registered. *Verification action
for this domain: query the Agent Identity Standard for the registered threshold,
then confirm the live configuration uses the same value — not just that an entry
exists. A mismatch between the Standard and the live config is itself an anomaly.*

**August 5, 2026 scope widening — Session 95 (Governance Agent authorization):**
the original rule (July 30, 2026) covered governance documents only. Scope extended
to monitoring agents and anomaly-detector thresholds per the Session 94 findings
(Finding C in SOVEREIGN_Session94_Handoff.md), which identified docs/36's informal
"Rule 13" citation as pointing at this principle applied to the monitoring-agent case.
No content from the original governance-document application was changed.

**Two supporting incidents recovered from the parallel lineage, Session 109:** The first —
a commit-attribution suppression setting in `.claude/settings.json`, correctly configured,
non-functional for seven consecutive sessions before anyone checked actual commit output
rather than the settings file that was supposed to control it — shares the same failure
pattern as a deliberately accepted state in this repository: `git config user.name` and
`user.email` are not set; `git log` records `developmentsystem@Erichs-Mac-mini.local` (the
machine hostname) as the author email on every commit. **Project Principal decision,
August 12, 2026: this attribution is deliberately left as is — not an open defect, not
an item to remediate.** Both the suppression setting and the git configuration look correct
until someone checks what actual output contains — the principle stands regardless of
whether the example represents a live gap or a settled decision. The second — `place_governance_doc.sh` and its
verification manifest `DOCUMENT_MANIFEST.tsv` went unused for roughly twenty sessions
after being rebuilt July 24, 2026, silently drifting out of sync with the real files
they exist to check, with no announcement of the lapse. D5 of Session 109 exists because
of the second incident. *(Recovered from the parallel lineage — authored as Rule 13 in
AGENT_REFERENCE_v3.5.md, SHA-256 14aa83ad…; re-homed as evidence for canonical Rule 17
by Project Principal decision, Session 109, August 12, 2026.)*

---

## Detecting Drift, Duplication, and Staleness

Two categories of project artifact are structurally prone to silently going wrong, independent of how careful any single agent is:

**Anything maintained by manual copy-paste across multiple files.** If a fact, a type definition, or a configuration value is meant to exist identically in more than one place — synchronized copies of a shared contract, a registry mirrored in two formats, a constant duplicated for two different tools to read — every manual update to it is a chance for the copies to diverge. This isn't a one-time risk to check off; it's a standing property of the artifact for as long as it's maintained by hand.

**Anything maintained by manual append.** A document that grows by adding new dated sections over time — a running log, an accumulating registry, a changelog — is vulnerable to the same content being added twice: once correctly, and once again later by someone (or some agent) who didn't realize it was already there. The failure mode is usually not corruption of existing content, just quiet repetition of it, which is easy to miss on a normal read-through and easy to catch with a specific check.

**A four-step method that reliably catches both**, in order:
1. **Quantity check.** Does a count — a line count, an item count, a total — look larger than expected for what's supposedly there? An unexplained excess is often the first visible symptom.
2. **Structure check.** Map the document's or artifact's actual structure (section headers, entity names, key names) and look for anything that appears more than once when it should appear once.
3. **Content-equality check.** Before assuming a repeated structure is a bug, confirm the repeated blocks are actually identical — diff them. If they're not identical, the fix is different (and more important) than if they are: something may have changed between the copies, and picking the wrong one to keep loses real information.
4. **Provenance check.** Trace *when* and *how* the duplication happened, not just *that* it happened — commit history, revision history, whatever the project's equivalent is. Knowing the mechanism (a merge that didn't realize content was already present, a manual paste run twice) is what prevents the same failure from recurring, not just fixing this one instance.

**A number that's been carried forward unchanged for a long time is not the same as a number that's true right now.** Any headline figure — a test count, a total item count, a "0 known issues" claim — accumulates risk the longer it goes unverified, even if nothing is known to have changed. It should be independently re-derived on a real cadence (before a demo, before a major handoff, at defined intervals), not merely repeated from the last document that stated it. **A number that's brand new carries its own version of this risk, not a smaller one** — a fresh count produced by a flawed counting method is wrong immediately, not after time passes. "Re-derive periodically" is not a substitute for checking a new number's own methodology the first time it's reported; a number can be simultaneously the newest one available and completely wrong.

**When a verification check returns something other than what was predicted, that result is information — investigate it, don't explain it away.** It's tempting, when a check comes back with an unexpected number, to reach for the first plausible-sounding reason it might be fine and move on. Sometimes the check's own assumption was wrong (it expected the wrong count for a legitimate reason). Sometimes it just found a real, previously-unknown problem. Both are common. The only way to tell them apart is to actually look at what the check found, not to pick whichever explanation is more comfortable.

**A third category, distinct from the two above: identifiers whose validity is decided by a party outside the project entirely.** A hardcoded model name, an API version string, a third-party package's exact version pin — these don't drift through anyone on the project making a mistake; they can simply stop being valid on someone else's schedule, with no warning and no local event that would prompt a check. A real example: a dated model-snapshot identifier, correct when written, was silently retired by its provider months later; nothing about the codebase changed, but every live call against it began failing. The fix that matters isn't just correcting the one stale value — it's making sure the identifier exists in exactly one place (a single exported constant, not copy-pasted across files) and adding a fast, hermetic test that fails loudly if that constant ever holds a value outside an explicit allowlist. That converts "this will eventually break silently and be diagnosed the hard way" into "this fails a normal test run the moment it happens," without needing to predict when the external party will act.

---

## A Debugging Technique Worth Naming: The Working Sibling

When a feature fails and a near-identical feature elsewhere in the codebase
works, the fastest path to root cause is usually comparing the two directly,
not investigating the broken one from first principles. If the failing feature
was built by copying the working one's pattern, whatever's missing is probably
something the working version has that nothing in the broken one's own code
advertises as absent — a wiring step, a registered handler, a stage in a
pipeline that never got its equivalent. Treat the working sibling as the
specification, not just as a nice-to-have reference.

This is especially valuable when a bug's symptom has multiple plausible causes
— a UI showing no result could mean the underlying process never ran, ran and
produced nothing to show, or ran and produced something the UI fails to
display. A working comparison case often resolves that ambiguity in one look:
whichever step the two implementations actually differ at is very likely where
the fault is, without needing to test each hypothesis in isolation.

---

## A Technique Worth Naming: Verify the Substitution, Not Just the Value

When a command depends on a secret the Project Principal has to type or paste
in by hand — an API key is the common case — a placeholder shown as an
example (even one deliberately formatted to look plausible, like
`sk-ant-your-key-here`) is easy to run verbatim by mistake, especially mid-way
through a long session where commands are being copied and re-run repeatedly.
This happened three times in a row on one project, with two different
placeholder conventions, before being caught — each time producing a real,
plausible-looking error (an authentication failure) that had nothing to do
with the system actually being debugged.

The fix is not a better-worded placeholder — wording alone doesn't solve this
reliably. The fix is verifying the substitution happened before trusting
anything downstream of it: after the value is set, check its shape
independently (for a credential, its length — `echo "KEY_LENGTH=${#VAR}"` —
is usually enough to distinguish a real value from an unedited placeholder)
as its own explicit step, before running the command that actually depends on
it. This is cheap, takes one line, and turns an ambiguous downstream failure
into an immediate, unambiguous answer. It generalizes past credentials to
anything a human substitutes into a template by hand: a resource ID, a file
path, a config value — verify the substitution landed before trusting a
result that depends on it.

A related rule specific to secrets themselves: never ask the Project
Principal to paste the secret's actual value into a conversation — only the
output of commands that used it. If a real secret does end up pasted
somewhere it shouldn't, by accident, treat it as compromised and rotate it
immediately; noting the exposure without rotating the credential is not a
complete response.

---

## Quick-Reference: Which Agent Does What

| Task | Governance Agent | Build Agent | Project Principal |
|---|---|---|---|
| Author Integration Brief | ✅ Writes | Reads only | Places in repo |
| Author Session Handoff | Reads | ✅ Writes | Copies to Governance Agent |
| Merge SBOM | ✅ Merges | Produces update | Archives |
| Author module specs | ✅ Writes | Reads only | Reviews and approves |
| Author gather script | ✅ Writes | Reads output | Runs and pastes |
| Author prompts | — | ✅ Writes (PENDING) | Approves |
| Update Integration Brief | ✅ Produces new version | Flags discrepancies | Places in repo |
| Make architecture decisions | Governs | Flags conflicts | Decides |
| Reconcile a decision made in a different conversation | ✅ Verifies and folds in | — | Brings it back explicitly |
| Give a post-milestone technical assessment | Weighs the input | ✅ Provides (advisory only) | Weighs the input |

---

## Conflict Resolution

If a conflict arises between what an agent recalls and what a document states: **the document wins — but only once its currency has been checked.** A document that's out of date is not more trustworthy than an agent's own reasoning; it's simply wrong in a way that looks authoritative. Before deferring to a document over a conflicting signal (git history, a live test run, a directly-read file), confirm the document is actually the current version, not an assumption carried in from a prior step.

If a conflict arises between two documents: the **Integration Brief** takes precedence over all other documents. Agents flag the conflict and surface it to the Project Principal rather than resolving it independently.

If a conflict arises between a document and the actual, directly-observable state of the repository or codebase: **investigate before resolving in either direction.** Documents can be stale; direct observation can also be misread or incomplete. The fix is to check — provenance, history, a fresh read of the source — not to default to whichever side seems more authoritative by role.

---

*This document is version-controlled. The current version number and last-updated session are tracked in the Integration Brief.*

---


---

*Agent Reference Document — Unified v3.10 · August 13, 2026*
*Merge of both lineages, Project Principal decision, July 18, 2026*
*Lessons 13-23 imported from PROJECT_SUMMARY.md Part 7 (Session 112); Lessons 40+ continue in docs/40 and Integration Brief lineage*
*v3.5 — August 11, 2026: Rules 15–17 and Lessons 30–38 merged from addendum; July 30 docs/28 append merged; footer updated*
*v3.6 — August 12, 2026: Lessons 26–29 recovered; Rule 10 amendment added; session-store extraction decision recorded; Supersedes line corrected; v3.5 session attribution corrected (105→106)*
*v3.7 — August 12, 2026: Block D (Rule 13 parallel incidents) added to Rule 17; Block E (parallel Rule 14) re-homed as Lesson 39; citation guidance for Part I/II Rule duplication added; Rule 14 permanently unassigned*
*v3.8 — August 12, 2026: Supersedes line corrected (v3.7 skipped v3.6); handoff close-table HEAD convention changed (no longer recorded in handoff); D1 inventory System Prompt findings recorded; footer v3.6 header corrected*
*v3.9 — August 12, 2026: Close protocol updated (verify script required at close, D1b); SBOM version-numbering derivation rule added replacing embedded specific number (D2)*
*v3.10 — August 13, 2026: Lessons 13-23 imported from PROJECT_SUMMARY.md Part 7 (D2, Session 112); structural gap note replaced by content*
