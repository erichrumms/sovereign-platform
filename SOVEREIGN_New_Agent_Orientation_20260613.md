# SOVEREIGN Platform — New Agent Orientation Document
## For the Next Claude Chat Session and Beyond

**Prepared by:** Current session agent
**Date:** June 13, 2026
**Purpose:** Complete orientation for a new Claude Chat agent continuing SOVEREIGN
Platform development. Read this entire document before doing anything else.
**Classification:** Pre-Decisional · Internal Working Document

---

## Part 1 — What You Are Working On

SOVEREIGN is the **Governed Agentic Runtime with Integrated Security, Intelligence,
and Oversight Networks** — a governed, observable, sovereign-AI-aligned platform
built for enterprise and federal government operations. It is not a single product.
It is an integrated portfolio of nine modules (six primary products plus three
companion suite modules plus VIGIL) that together form a pipeline for program
management, task correspondence, analytics, compliance, workflow mapping, and agent
orchestration, all governed by a shared security framework and AI governance
standard.

The person you are working with is the **Project Principal** — the sole human
decision-maker on this project. They own every product, hold every governance role,
and make every build decision. Their background is non-technical but they are
engaged, eager to learn, and deeply invested in the project. They benefit from
clear explanations of what things mean before you ask for decisions. They prefer to
understand the big picture before components.

**The single most important thing to know:** Claude has no memory between sessions.
The documents in the `7 - SOVEREIGN` iCloud folder and the `~/sovereign-platform`
monorepo on the Mac Mini ARE the project's memory. If you do not load the right
documents at the start of a session, you are working blind and will make decisions
that contradict prior governance. Never skip the context load step.

---

## Part 2 — The Platform Architecture

### The Nine Modules

**Six Primary Products (the pipeline):**
```
FLOWPATH → [Intelligence Layer, future] → CPMI → AgentOS → NEXUS / APEX → ARIA Suite
```

- **FLOWPATH** — elicits structured workflow artifacts from human experts via
  guided sessions; produces VVR (Verified Workflow Records) that feed the
  Intelligence Layer
- **CPMI** — the governance engine; issues CPMI-VRS certifications across all
  products; operates under enhanced anomaly monitoring (0.7× threshold —
  architectural constant, never change); its integrity is a platform-wide
  dependency
- **AgentOS** — the MLOps backbone and agent orchestration environment; not
  user-facing; the infrastructure layer all products deploy on or report to
- **NEXUS** — task records and correspondence; the human-facing task management
  and document routing product
- **APEX** — portfolio analytics and reporting; QPR, ABS, MSR report generation
- **ARIA Suite** — compliance adjudication; deliberately excludes AI from decision
  paths (this is a feature, not a limitation); produces AI-absence attestations

**Four Companion Suite Modules (parallel human support layer):**
- **COUNSEL** — decision support for individual knowledge workers; produces
  Decision Records logged as HUMAN_DECISION events; feeds IL Judgment Detection
- **SCRIBE** — structured drafting and voice capture; six product-aligned drafting
  modes; Style DNA; voice-to-FLOWPATH field capture
- **LENS** — orientation, learning, and situational awareness; Daily Brief;
  Pipeline Navigator; Governance Explainer; role-based orientation tracks
- **VIGIL** — operator dashboard for Platform Administrators; Alert Queue for
  Security Framework P1/P2/P3 alerts; Agent Approval Queue for AgentOS decisions;
  closes platform Risks R10 and R11

**The Intelligence Layer** — the seventh product, future build. Every current
product already exposes the fields it will consume. Never deprioritize it. Never
remove or rename its exposure fields: `workflow_step_id`, `decision_type`,
`deployment_feedback`, `classification_level`, and the VVR export schema.

### Three Shared Infrastructure Layers

Every product connects to these rather than building its own:

1. **SOVEREIGN Security Observability Framework** — Logger, Honeytoken Manager,
   Anomaly Detector, Alert Dispatcher. A standalone Python library at
   `sovereign-security/`. Stage 1 complete. 127 tests passing.

2. **CPMI-VRS AI Governance Standard** — portfolio-wide governance aligned to
   NIST AI RMF and OMB AI guidance. Four gates: Disclosure, Audit Trail, Human
   Oversight, Certification. Every product certifies under this standard.

3. **AgentOS** — Security Framework and CPMI-VRS are embedded here as native
   modules. The Intelligence Layer eventually deploys here.

### The Option C Architecture

All nine modules run inside a single **Unified Shell + Module Applications**
architecture (Option C — permanent governance record, never re-opened). The shell
(`sovereign-shell/`) provides shared infrastructure: auth, Logger, governance
status, navigation, and protocol stubs. Modules implement `SovereignModuleContract`
and mount into the shell via `ModuleLoader`.

---

## Part 3 — Current Build State (as of Session 3, June 13, 2026)

### What Exists on Disk in the Monorepo

```
~/sovereign-platform/
├── sovereign-security/      Stage 1 COMPLETE — 127 Python tests passing
├── sovereign-api-client/    Stage 1 COMPLETE — 143 TypeScript tests passing
├── sovereign-data/          NEW Session 3 — 23 tests — StyleProfile + 5 entities
├── sovereign-shell/         Stage 1 + Session 3 — dev server running, 0 compile errors
│   ├── shell-contract.ts    v1.3 APPLIED (SHA-256: 4d78754f…6836acc2)
│   └── src/
│       ├── shell.ts         composition root — 8 exports
│       ├── module-loader/   mount/unmount machinery — admits 10 modules
│       ├── navigation/      nav chrome, breadcrumb, module nav
│       ├── governance/      CPMI-VRS dashboard placeholder
│       ├── main.tsx         NEW Session 3 — shell host entry point
│       └── register-modules.ts  NEW Session 3 — registers module-counsel
├── module-counsel/          NEW Session 3 — scaffold mounting ✅
└── shell-contract.ts        v1.3 (root copy — byte-identical to shell copy)
```

**SOVEREIGN runs in a browser.** `cd sovereign-shell && npm run dev` starts
Vite on `http://localhost:3000`. The nav chrome, governance header, and CPMI-VRS
status indicator are visible. `module-counsel` appears in the sidebar (scaffold
only — no UI content yet).

### Governance Decisions on Record

| Decision | What | Status |
|---|---|---|
| GD-1 | StyleProfile canonical entity | APPROVED + IMPLEMENTED in sovereign-data |
| GD-2 | VOICE_CAPTURE_COMPLETED event type | APPROVED + APPLIED shell-contract v1.1 |
| GD-3 | PRIOR_POSITION_RECONCILIATION event type | APPROVED + APPLIED shell-contract v1.1 |
| GD-4 | Seven VIGIL event types | APPROVED + APPLIED shell-contract v1.2 |
| GD-5 | SovereignProduct += 4 companion; SovereignRole += PLATFORM_ADMIN | APPROVED + APPLIED shell-contract v1.3 |

### Shell-Contract Version History

- v1.0 — June 2, 2026 — initial approved
- v1.1 — June 11/13, 2026 — GD-2 + GD-3 applied
- v1.2 — June 11/13, 2026 — GD-4 applied
- v1.3 — June 13, 2026 — GD-5 applied ← CURRENT

---

## Part 4 — The Two Document Environments

Understanding the two environments is critical. Confusing them causes problems.

### Environment 1 — `7 - SOVEREIGN` iCloud Folder

**What it is:** The project's document library. Governance documents, specs,
briefs, decision records, session handoffs, registries.

**Who works here:** The Project Principal (manually) and Claude Chat (producing
documents to be placed here). Claude Cowork organized this folder.

**Structure:**
```
7 - SOVEREIGN/
├── SOVEREIGN_Platform_Integration_Brief_v1.7.md   ← LOAD EVERY SESSION
├── PROJECT_SUMMARY.md                              ← LOAD EVERY SESSION
├── AGENT_BACKGROUND_AND_LESSONS_LEARNED.md        ← LOAD EVERY SESSION
├── system_prompt.md                               ← LOAD EVERY SESSION
├── Agent_Identity_Standard.md                     (merged — 7 agents)
├── Prompt_Registry_Specification.md               (merged — 10 prompts)
├── SBOM_Registry.md                               (merged through Session 3)
├── Decision_Matrix.md
├── Agent_Operator_Scope_SOVEREIGN.md
├── Intelligence_Layer_Concept_Document.md
├── Archive/                                       (superseded versions)
├── Companion Suite/
│   ├── 00_SUITE_OVERVIEW_v2.0.md
│   ├── 01_COUNSEL_Decision_Support_v1.1.md
│   ├── 02_SCRIBE_Drafting_Workspace.md
│   ├── 03_LENS_Learning_Navigator_v1.1.md
│   ├── 04_VIGIL_Operator_Dashboard.md
│   └── Governance/
│       ├── Governance_Decision_Record_GD1_GD2_GD3.md
│       ├── Governance_Decision_Record_GD4_VIGIL.md
│       ├── Governance_Decision_Record_GD5_CompanionContract.md
│       ├── Agent_Identity_Standard_CompanionSuite_Additions.md
│       ├── Agent_Identity_Standard_VIGIL_Additions.md
│       ├── Prompt_Registry_CompanionSuite_Additions.md
│       ├── Prompt_Registry_VIGIL_Addition.md
│       ├── sovereign_data_CompanionSuite_Specification.md
│       ├── SCRIBE_Version_Note_20260611.md
│       ├── LENS_Source_scribe_voice_capture.md
│       ├── LENS_Source_counsel_prior_position.md
│       ├── vigil_alert_response.md              ← TO BE AUTHORED
│       └── vigil_agent_approvals.md             ← TO BE AUTHORED
├── Session Handoffs/
│   ├── Session_1_Handoff_SOVEREIGN_SecurityFramework_20260601.md
│   ├── Session_2A_Handoff_SOVEREIGN_APIClient_20260602.md
│   ├── Session_2B_Handoff_SOVEREIGN_Shell_20260602.md
│   └── Session_3_Handoff_SOVEREIGN_CompanionFoundation_20260613.md
├── Product Inserts/                               (six product inserts)
├── Product Transition Packages/                   (six product packages)
├── Security Framework/sovereign-security/         (Python source files)
└── Shell Contract/shell-contract.ts
```

### Environment 2 — `~/sovereign-platform/` Monorepo on Mac Mini

**What it is:** The actual code. Everything that runs.

**Who works here:** Claude Code exclusively. Never Claude Chat. Never Cowork.

**How Claude Code is opened:**
```bash
cd ~/sovereign-platform
claude
```

**Important:** The monorepo root also contains governance documents (PROJECT_SUMMARY.md,
system_prompt.md, session handoffs, etc.) that were placed there during earlier
sessions before the iCloud folder was organized. Both locations have copies. Load
from whichever is most current — for Integration Brief, always use v1.7 from iCloud.

---

## Part 5 — How Claude Cowork Was Used

Claude Cowork is a desktop automation tool available inside the Claude Desktop app.
It can see and manipulate files on the Mac Mini's local filesystem.

**What Cowork did this session:** Organized the `7 - SOVEREIGN` iCloud Drive folder
from a flat collection of files into the structured hierarchy described in Part 4.
Specifically:
- Created all subfolders (`Archive/`, `Companion Suite/`, `Companion Suite/Governance/`,
  `Session Handoffs/`, `Product Inserts/`, `Product Transition Packages/`,
  `Security Framework/`, `Shell Contract/`)
- Moved files to correct locations
- Moved superseded Integration Brief versions to `Archive/`
- Moved staging folders (`files/`, `files2/`, `files3/`) to `Archive/` under
  renamed identifiers (`files_staging_root/` etc.) to avoid naming collisions
- Identified files that needed manual action (the three merged registry documents)
- Produced a completion report listing every action taken and every file not found

**How to use Cowork for future folder maintenance:**
1. Open Claude Desktop app on Mac Mini
2. Find Cowork (may be in sidebar or tools menu)
3. Click "Select a folder" when prompted, navigate to iCloud Drive, select
   `7 - SOVEREIGN`, click Allow when macOS asks for permission
4. Confirm Cowork can see the folder before giving it any instructions
5. Give it precise, task-by-task instructions; it will confirm before acting

**Cowork cannot:** merge file contents, write code, or operate in the monorepo.
It is a file organization tool, not a development tool.

---

## Part 6 — How to Work with the Project Principal

**Background:** Non-technical, but eager and engaged. Has learned a great deal
through this project and is increasingly comfortable with technical concepts when
explained clearly.

**Communication preferences:**
- Explain the big picture before components
- Step-by-step instructions when asking them to do something in Terminal or Finder
- Name every file, folder, and command explicitly — do not assume they know where
  things are
- When something goes wrong, diagnose first before asking them to do anything
- Check in at decision points rather than proceeding on assumptions
- They will paste Terminal output directly into chat — read it carefully; it always
  contains useful information

**Decision-making style:**
- Makes decisions confidently when options are clearly framed
- Appreciates when you explain what a decision closes and what it leaves open
- Does not want to re-debate settled decisions — if it is in the governance record,
  it is decided
- Trusts the governance process; will approve things that are properly framed and
  justified

**Workflow rhythm:**
- Claude Chat sessions handle governance documents, specs, decision records,
  Integration Brief updates, and file merges
- Claude Code sessions handle all actual code
- After every Claude Code session, the Project Principal brings the session close
  documents (handoff, SBOM update) to Claude Chat for processing
- Claude Chat then produces the merged SBOM and updated Integration Brief
- The Project Principal manually places files in the correct iCloud locations

**Things that slow things down (avoid):**
- Asking multiple questions at once — ask one, wait for the answer
- Being vague about file names or locations
- Producing documents that reference wrong version numbers
- Assuming the Project Principal knows where a file is without being told

---

## Part 7 — Lessons Learned

These are the most important lessons from prior sessions. Each one was learned
the hard way. Do not rediscover them.

**Session protocol is non-negotiable.** Every session follows four steps: load
context and name every document, state the done condition and wait for approval,
build one component at a time, close with the handoff document. Skipping any step
creates problems in the next session.

**The handoff document is the project's memory.** Claude Code has no memory between
sessions. A missing, partial, or vague handoff means the next session starts blind.
Never skip it. Never produce a partial one.

**State the done condition before writing any code.** "We'll figure it out as we
go" leads to scope creep, constraint violations, and wasted sessions. The done
condition is specific, testable, and approved before a single file is created.

**The compiler is the contract enforcer.** Express governance rules as TypeScript
types wherever possible. A rule encoded as a type cannot be forgotten — the module
will not compile without it. This is why `shell-contract.ts` is a governance
document expressed as TypeScript.

**Never invent taxonomy.** If there is no approved `SovereignEventType` for what
you want to log, do not create one during a build session. Surface the gap, flag
it in the handoff, and resolve it through governance in Claude Chat. The Session 3
agent correctly declined to add a "module mounted" event type because it was not
approved.

**Impact assessment before every shell-contract change.** Search the monorepo for
exhaustive switches on the changed type before applying the change. Record the
finding. This is not optional — it is part of the governance process for every
shell-contract version increment.

**SHA-256 verify both shell-contract copies after every change.** The root copy
and the `sovereign-shell/` copy must remain byte-identical. Verify after every
increment. Record both hashes in the session handoff.

**Three synced copies of shared enums now exist.** `shell-contract.ts` (canonical),
`sovereign-api-client/src/types.ts`, `sovereign-data/src/shared-types.ts`. Any
change to a shared enum must propagate to all three copies. Each carries a
sync-obligation header that makes this a governance-obligated action, not optional.

**Build the fallback in the same session as the feature.** "We'll add the fallback
later" means it never gets added. Three-tier fallback (live → cached → static) is
a platform standard for every external dependency.

**Stub behavior should match how wrong it can go.** `agui.humanAction()` throws
because a silently dropped human action is worse than a crash. `agui.emit()` is
a no-op because a dropped render event should not crash a module. Design stubs
with their failure mode in mind.

**Do not call the Anthropic API directly.** All LLM calls go through
`sovereign-api-client`. `createSovereignClient()` only. If a module needs LLM
access, it calls this — the shell does not proxy it.

**CPMI is different from everything else.** Enhanced monitoring tier. 0.7× anomaly
threshold. Its integrity is a platform-wide dependency because its governance
outputs flow to all six primary products simultaneously. `CPMI_DRIFT_DETECTED`
alerts get elevated treatment everywhere — VIGIL, the monitoring tier, the
triage prompt.

**All data is currently synthetic.** The Governance Clock has not activated.
No real federal data has entered any product. Governance records for all six
primary products are INCOMPLETE. Do not forget this.

**The product inserts and transition packages are mostly not yet produced as
standalone documents.** The Cowork folder organization surfaced that 24 expected
files did not exist. These will be produced as each product's transition build
completes. Do not treat their absence as a problem — they are simply not yet authored.

---

## Part 8 — Standing Development Constraints

These are invariant. They apply to every session, every product, every build
decision. Do not ask if they apply — they always apply.

1. No independent security, governance, or audit systems
2. No shared entity field-name divergence from the data dictionary
3. No rewrite debt — Stage 2 connections are configuration changes
4. Every human decision event carries `decision_type`
5. No direct LLM API calls — all through `sovereign-api-client`
6. `workflow_step_id` on every Logger event; `agent_id` on agent step events
7. Shell context frozen at exactly eight exports
8. `shell-contract.ts` changes require governance decision + version increment +
   changelog + impact assessment + SHA-256 verification
9. All prompts registered before build (10 registered; see Prompt Registry)
10. All agents registered before build (7 registered; see Agent Identity Standard)
11. Three synced copies of shared enums — changes must propagate to all three

---

## Part 9 — Open Items Going Into Session 4

These are the open conditions carried from Session 3. They are listed in priority
order — address the highest-priority items first.

**Blocking COUNSEL core (must resolve in Session 4):**
1. **npm workspace / package linkage.** No workspace or `file:` linkage exists in
   the monorepo. `module-counsel` imports `module-loader` by relative path and
   works for the scaffold (types-only import). But COUNSEL core needs React and
   `createSovereignClient()` — those require the module to have its own
   `node_modules` or workspace linkage. Recommended: npm workspaces. This is
   Session 4's first task.

2. **`ctx.data.types` ↔ `sovereign-data` wiring.** `sovereign-data` is built
   but not imported by the shell host. Depends on item 1.

**Open governance items (resolve in Claude Chat before the build session):**
3. **Decision 24 — role→module access matrix.** COUNSEL/SCRIBE/LENS are intended
   to be accessible by all roles, but the fail-closed default policy cannot
   express "all roles" through a single `minimumRole`. The `module-counsel`
   scaffold uses `minimumRole: "READ_ONLY"` as a placeholder. The access matrix
   resolves this with an injectable `RoleAccessPolicy`.

4. **Module mount/unmount event-type taxonomy gap.** No `SovereignEventType`
   denotes module mount or unmount. Requires a governance decision and shell-
   contract v1.4 when resolved.

5. **shell-contract Section 1 re-export reconciliation.** The contract says shared
   entity types are "re-exported from sovereign-data" but defines them inline.
   Three synced copies exist. Reconciling requires a shell-contract change and
   governance decision.

**LENS source documents still to author:**
6. `vigil_alert_response.md` — governance source for VIGIL alert types; required
   before LENS Platform Administrator VIGIL orientation modules are built
7. `vigil_agent_approvals.md` — governance source for VIGIL approval protocol;
   same dependency

**Carried (unchanged, longer horizon):**
- Decision 25 — access-denial taxonomy gap
- ARIA rule maintenance intake path not designed
- Output Studio provenance reference not specified
- Notification / push interface absent
- R7 — Tier 2 LLM provider decision (Stage 5)
- esbuild dev-server advisory GHSA-67mh-4wv8-2f99 — deferred to Stage 5+

---

## Part 10 — Work Plan: Next Two Stages

### Stage 2 (Current) — Remaining Work

Stage 2 deploys the Security Framework across all products, wires the Logger, and
builds the companion suite modules. In priority order:

**Session 4 (Claude Code) — COUNSEL Core:**
Done condition seeds:
- npm workspaces configured; `module-counsel` resolves `@sovereign/api-client`
  and `@sovereign/data` via workspace protocol
- `ctx.data.types` wired to real `sovereign-data` exports
- COUNSEL core built: Prior Position Alert, Decision Framing, Analysis Engine
  (PR-COUNSEL-001 authored and registered), Decision Record output with
  `PRIOR_POSITION_RECONCILIATION` Logger emit
- `SOVEREIGN_LOGGER_ENDPOINT` wired in config (Stage 2 remote sink — config
  change only, no call-site rewrites)

**Session 5 (Claude Code) — COUNSEL Completion + SCRIBE Scaffold:**
- Counterargument Mode (PR-COUNSEL-002)
- Pre-Mortem Studio (PR-COUNSEL-003)
- SCRIBE scaffold implementing `SovereignModuleContract`
- SCRIBE typed drafting modes (six product-aligned modes using sovereign-data
  schemas)

**Session 6 (Claude Code) — SCRIBE Completion:**
- Smart Capture voice mode (emits `VOICE_CAPTURE_COMPLETED`)
- Style DNA (uses `StyleProfile` from sovereign-data)
- Source synthesis mode (PR-SCRIBE-002)
- Workflow framing mode (PR-SCRIBE-003) — primary OWI-FP-001 mitigation

**Session 7 (Claude Code) — VIGIL:**
- VIGIL scaffold with PLATFORM_ADMIN mount gate (now expressible)
- Alert Queue and Alert Detail (wires to Security Framework Alert Dispatcher)
- Anomaly Triage Assistant (PR-VIGIL-001)
- Agent Approval Queue (wires to AgentOS A2A when available)
- Before this session: author `vigil_alert_response.md` and
  `vigil_agent_approvals.md` in Claude Chat

**Session 8 (Claude Code) — LENS:**
- LENS scaffold and Daily Brief
- Pipeline Navigator
- Governance Explainer (PR-LENS-001 + all source documents)
- Role-based orientation tracks (PR-LENS-002)
- AI Transparency Panel

**Parallel to companion suite build — primary products:**
Security Framework deployment across all six primary products is also Stage 2 work.
This has been partially deferred while the companion suite foundation was established.
These sessions should be interleaved with companion suite sessions:
- Wire Logger emission pathways in all six products
- First real module mounts for primary products
- Validate P1/P2 alert routing end-to-end

**Stage 2 is not complete until:**
- All Logger emission pathways are live
- All six primary products have their Security Framework deployed
- All four companion modules are built and mounting
- `SOVEREIGN_LOGGER_ENDPOINT` is wired and receiving events
- A2A `_stage` advances from `DEFINED` toward `IMPLEMENTED`

### Stage 3 — CPMI-VRS Elevation

Stage 3 prerequisites are satisfied (named product owner assigned, Stage 2
must be complete first). When Stage 2 is done:

- CPMI-VRS elevated to portfolio-wide governance standard
- CPMI world model REST API deployed; live governance status flows to all products
- Stage 3 swap: `ctx.governance.isOnHold()` connects to live CPMI REST API;
  zero UI changes required (the presentation already reads the context)
- CPMI-VRS Gate 4 certifications begin for all products and companion modules
- ATO package preparation begins for NEXUS (R9 — high priority at Stage 5)

**Stage 4 (following Stage 3):** Embed Security Framework and CPMI-VRS as native
AgentOS modules. This completes the three shared infrastructure layers as a unified
deployed system.

---

## Part 11 — Context Package for Session 4

When opening Session 4 in Claude Code, load these documents from `~/sovereign-platform/`
or from iCloud via upload:

**Required (every session):**
1. `SOVEREIGN_Platform_Integration_Brief_v1.7.md`
2. `PROJECT_SUMMARY.md`
3. `AGENT_BACKGROUND_AND_LESSONS_LEARNED.md`
4. `system_prompt.md`
5. `Session_3_Handoff_SOVEREIGN_CompanionFoundation_20260613.md`

**Session 4 specific:**
6. `shell-contract.ts` (v1.3)
7. `sovereign-shell/src/shell.ts`
8. `sovereign-shell/src/module-loader/index.ts`
9. `module-counsel/src/index.ts`
10. `01_COUNSEL_Decision_Support_v1.1.md` (COUNSEL architecture spec)
11. `sovereign_data_CompanionSuite_Specification.md`

**Opening Claude Code:**
```bash
cd ~/sovereign-platform
claude
```

Then paste the standard opening prompt (or use
`Stage2_Session3_Claude_Code_Opening_Prompt.md` as a template — update session
number, done condition seeds, and context package list).

---

## Part 12 — Claude Chat Session Protocol

Every Claude Chat session that involves governance documents follows this pattern:

1. **Upload the relevant documents.** Tell the agent explicitly which document to
   produce or update and why.
2. **Confirm the agent loads the Integration Brief version.** Always the current
   version — v1.7 as of now.
3. **After every Claude Code session:** upload the session handoff and SBOM update;
   the Claude Chat agent produces the merged SBOM and updated Integration Brief.
4. **After every governance decision:** produce a Governance Decision Record in
   Claude Chat, update the agent and prompt registries if needed, update the
   Integration Brief.
5. **Download produced files** from Claude Chat and place them in the correct iCloud
   locations per the folder map.

**What Claude Chat produces (never Claude Code):**
- Integration Brief updates
- Governance Decision Records
- Session Handoff documents (if not produced by Claude Code)
- Agent Identity Standard additions
- Prompt Registry additions
- SBOM merges
- Specification documents (sovereign-data spec, module specs, etc.)
- LENS governance source documents

**What Claude Code produces (never Claude Chat):**
- All TypeScript, Python, TSX, HTML code
- Package.json, tsconfig, vite.config files
- Test files
- Shell-contract version increments
- Session Handoff documents (produced at session close, then brought to Chat)
- SBOM session update files (produced at session close, then merged in Chat)

---

## Part 13 — The Most Important Things to Never Forget

1. **The Intelligence Layer is the seventh product.** Every product builds toward
   it. Never deprioritize it. Never remove its exposure fields.

2. **CPMI is the platform's governance engine.** If CPMI drifts, all six products
   are simultaneously compromised. It gets elevated treatment everywhere.

3. **All data is SYNTHETIC.** The Governance Clock has not activated. No real
   federal data has entered any product.

4. **The Integration Brief is the governing document.** Load the current version
   at the start of every session. As of now, that is v1.7.

5. **The compiler is the contract enforcer.** If a governance rule can be expressed
   as a TypeScript type, it should be. The module will not compile without it.

6. **The handoff document is the project's memory.** Never skip it. A session
   without a handoff leaves the next session blind.

7. **SOVEREIGN is a governed platform, not just software.** Every architectural
   decision has governance implications. Surface gaps rather than papering over
   them. The Session 3 agent found a real gap (GD-5) and surfaced it correctly
   before writing a single line of code.

---

*SOVEREIGN Platform New Agent Orientation Document*
*Prepared June 13, 2026 — covers through Session 3*
*Update this document at each major project milestone*
*Pre-Decisional · Internal Working Document*
