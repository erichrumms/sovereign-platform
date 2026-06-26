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
- Exact commit hashes
- Test counts (JS and Python separately, and total)
- Update flags for the Integration Brief
- Spec reconciliations — any place Claude Code adapted from the spec to reality
- Blockers and findings — anything Claude Code surfaced but did not act on

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
7. CLOSE REQUIREMENTS — test suite, tsc, audit, SHA verify, commits, handoff
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
- Surface integration gaps that 934 passing tests cannot detect
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

*SOVEREIGN Platform reference — updated through Session 16 / Walkthrough A /
June 25, 2026*
