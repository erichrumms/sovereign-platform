# STRATA — Architecture Overview
## DRAFT v0.4 · August 9, 2026
## Supersedes: DRAFT v0.3 (August 9, 2026)
## v0.3 changes applied by the Build Agent from the Phase 0 repo-verification pass;
## v0.4 changes applied by the Build Agent from the Phase 0 follow-up addendum

**Status: DRAFT — placed for repo visibility, not yet authoritative.** Phase 0
verification is complete and its findings are incorporated. Remaining opens in §8
are decisions, not unverified facts. This document is placed as a live, current
draft; it is not being declared final or authoritative tonight.

**v0.4 changes from v0.3:**
- §5.3: "eight days" added explicitly to the WH-43 two-act timeline, alongside the
  existing specific dates, sourced from the follow-up addendum's section B2/G where
  the figure was derived from real commit evidence.
- §1.1: Intelligence Layer pipeline-position disagreement elevated from a
  parenthetical to a named Governance Agent flag, for greater visibility on
  placement.
- GD-36 CI mechanism: explicit rules now in §6 text; see also Work Scope §4.2.
- All v0.3 corrections and Phase 0 findings carried forward unchanged.

**Reconciliation status, stated precisely so nothing here is over-trusted:**

| Claim | Status |
|---|---|
| Shell-contract current version and hash | **Confirmed** — v1.28, hash `c99355ce...` |
| Cost-tracking coverage (cited where relevant) | **Confirmed** — 14 of 19 real live-call sites, 5 named uninstrumented |
| Next available GD number | **Confirmed at Phase 0** — GD-36; GD-36 through GD-41 proposed in Session 98 (same day), pending Project Principal decision |
| Rules 11, 13, 14 | **Confirmed** in main `AGENT_REFERENCE.md` |
| Rules 15, 16, 17 (cited below) | **Real, but currently live only in `AGENT_REFERENCE_Addendum_20260730.md`** — re-confirmed this pass: Session 95 widened Rule 17 within the addendum but did not merge; the formal merge remains a separate, tracked open item |
| FLOWPATH's gate extensibility | **Verified** — FLOWPATH's own gate is NOT extensible; the shell contract's Workspace review pattern IS, with five working precedents. See §6.1 |
| `docs/` numbering | **Verified** — highest is docs/36; next available docs/37 (no docs/33 exists — a real gap in the sequence) |
| Existing Intelligence Layer content in `docs/` | **Verified** — substantive definitions exist in at least five documents; §1.1 corrected accordingly |
| Cross-workspace dependency graph | **Verified** — see §6; the substrate placement is cheaper than v0.2 assumed |

**This remains deliberate and follows a real lesson.** A proposed process document
(now `docs/36`) was placed in the repo before its own citations were verified and
turned out to cite rules that did not exist. Treat every claim in this document as
confirmed only to the degree the table above says it is.

---

## 1 — What STRATA is

STRATA is an **organization-scoped operational data substrate**: the layer where
data from many source systems is ingested, cleaned, and modeled into a governed set
of objects that applications and AI agents build on.

The name is literal. Each layer is only as trustworthy as the one beneath it —
untouched raw data is what makes cleaning auditable; reviewable pipelines are what
keep the object model accurate; a governed object model is what makes it safe to
build applications and let agents act.

### 1.1 — What STRATA is not

**STRATA is not a SOVEREIGN module.** SOVEREIGN's six products and companion modules
are Layer 4 applications. STRATA sits beneath them.

**STRATA is not the Intelligence Layer.** These occupy adjacent conceptual space and
have been conflated in discussion, so the boundary is stated explicitly:

| | Scope | Direction | Status |
|---|---|---|---|
| **STRATA** | The organization — many source systems | Feeds applications from below | Layers 1-3 proposed, unbuilt |
| **SOVEREIGN** | Governed PPBE and Time & Travel operations | A Layer 4 application | Built and running |
| **Intelligence Layer** | SOVEREIGN's own operational and governance record | A Layer 4 application | Named and substantively specified in `docs/`, not built |

**[Corrected v0.3 — direction reversed in v0.2.]** The Intelligence Layer reasons
over what SOVEREIGN produces. v0.2 said it "writes its output back to the
`deployment_feedback` field"; the repository says the opposite:
`deployment_feedback` is an optional field on `AGENT_STEP_COMPLETE` events that
emitters populate and the Intelligence Layer's Automatability Scorer *consumes*
(`sovereign-shell/src/shell.ts` — "Intelligence Layer Automatability Scorer
consumes deployment_feedback on every AGENT_STEP_COMPLETE"; `docs/31` §1 — "added
to feed a future consumer (the Intelligence Layer)"). The field is the
Intelligence Layer's input, not its output channel.

**[Corrected v0.3 — the Intelligence Layer is more defined than v0.2 assumed.]**
Phase 0 found substantive definitions in `docs/`: five named components
(`docs/06` §7.2 — Task Decomposition Engine, Judgment Detection, Automatability
Scorer, Risk & Failure Modeler, Compliance Mapper), a product identity ("SOVEREIGN's
seventh product and the highest-value future asset in the portfolio," `docs/07` §5),
and named training-signal sources across `docs/14`, `docs/15`, and `docs/22`. Its
defined inputs are broader than "the governance record" alone — analyst interaction
data, inference telemetry, and orientation events are all specified. None of this
conflicts with the STRATA boundary: nothing in `docs/` defines the Intelligence
Layer as a data substrate or ingestion system, so the two remain non-competing.

**Governance Agent flag — Intelligence Layer pipeline-position disagreement:** The
existing authoritative documents disagree about where the Intelligence Layer sits in
the pipeline. `docs/13` (APEX Architecture) and `docs/15` (FLOWPATH Architecture)
both show `FLOWPATH → [Intelligence Layer] → CPMI → AgentOS → NEXUS/APEX → ARIA
Suite` — placing it between FLOWPATH and CPMI. `docs/16` (ARIA Suite Architecture)
shows `APEX → ARIA Suite → [Intelligence Layer]` — placing it after ARIA Suite,
at the end. These are contradictory positions. The inconsistency is surfaced here
for Governance Agent reconciliation before it propagates into STRATA's design of
how Layer 4 consumers interact with the registry. It is not resolved in this
document.

One consumes SOVEREIGN's record; the other supplies the substrate. They are not
competitors and neither replaces the other.

**A note on the relationship worth stating directly:** STRATA is plausibly what makes
the Intelligence Layer buildable. That layer's real blocker was never design — it was
that SOVEREIGN has no persistent record to reason over. Cost tracking is
session-scoped and clears at session end; Stage 2 persistence (`docs/28`) remains
undecided. A STRATA Layer 1 connector pulling `SovereignLogEvent` into persistent
storage produces exactly the history the Intelligence Layer would need. This is a
proposed relationship, not a decided one. (Phase 0 confirmed the session-scoped
Logger and the open Stage 2 question, and additionally confirmed that a
governance-approved read surface for the connector already exists —
`ctx.logger.getEntries()`, GD-28.)

### 1.2 — Naming

"Data OS" was the working label and should not survive into repository documents. It
collides audibly with **AgentOS**, one of SOVEREIGN's six products, and it is a
category label rather than a name. STRATA follows the existing convention — single
evocative words: COUNSEL, SCRIBE, VIGIL, LENS, CPMI, AgentOS, NEXUS, APEX, FLOWPATH,
ARIA.

**No umbrella name for the combined system is proposed.** Naming the whole would
create a fourth term defining something that does not yet exist — three of four
layers are unbuilt. Where the combined system must be referenced, "SOVEREIGN and the
STRATA layers beneath it" is sufficient. Revisit once Layers 1-3 are real.

---

## 2 — The problems STRATA addresses

- **The silo problem** — data trapped inside individual applications (finance,
  schedule, procurement), each with its own definitions, access rules, and export
  formats, requiring manual reconciliation to see the whole picture.
- **The shadow-work problem** — the human labor of pulling exports, reconciling
  mismatched identifiers, and assembling reports by hand, repeated every reporting
  cycle, with no institutional memory of the decisions made along the way.
- **The definition-drift problem** — the same term meaning different things in
  different systems, with no authoritative record of which meaning won or why.

The third is the one STRATA is designed around most deliberately, and it is where
this architecture diverges most from comparable systems. See §7.

---

## 3 — The four layers

| Layer | Function | Owner | Built as |
|---|---|---|---|
| 1. Ingestion | Pull from sources; stamp provenance; change nothing | STRATA | Code, version-controlled |
| 2. Transformation | Clean, standardize, resolve identity, validate, derive | STRATA | Code, version-controlled |
| 3. Semantic Modeling | Define objects, properties, links, actions, permissions | STRATA | Registry + AI-assisted drafting tool |
| 4. Applications | Where people and agents read, decide, and write back | SOVEREIGN and others | Code, version-controlled |

### 3.1 — How STRATA gets built

**STRATA is built using the same methodology that produced SOVEREIGN: Project
Principal, Governance Agent, Build Agent.** Every layer. This is not a low-code
platform and does not have a low-code build path.

The generic draft this document supersedes repeatedly positioned the architecture as
visually assembled and buildable by non-programmers. That framing was inherited from
the commercial platforms the draft was modeled on, and it does not describe how this
organization actually works. It is removed entirely rather than confined to one
layer.

What that means concretely, unchanged from existing practice:

- Scope and decisions originate with the Project Principal and are structured by the
  Governance Agent.
- Implementation happens in Build Agent sessions against a real repository, with
  real `git push` output closing each session.
- Every change is diffable, testable, and reviewable. Rule 15 applies to STRATA
  exactly as it applies to SOVEREIGN — real today in substance, formally homed in
  the unmerged Addendum (see status table above).
- Governance decisions are recorded in the GD Registry before the work they govern.

**This is a stronger position than the low-code framing it replaces**, and it is
worth stating deliberately rather than treating as a limitation. Comparable
platforms sell the ability for non-engineers to assemble tools without code. STRATA's
claim is different and more defensible for this segment: *every artifact in the
system — pipeline, schema definition, application — was produced through a governed
process, is diffable, and has a recorded decision behind it.* Nothing was clicked
into existence without a trace.

**One distinction to preserve.** Rejecting low-code building does not reject
human-in-the-loop *review*. Layer 3's review gate — subject-matter experts accepting,
rejecting, and modifying schema definitions — remains essential. Reviewing a
definition is not the same activity as assembling an application without code. The
first is domain judgment, which belongs with the people who hold it. The second is
engineering, which belongs in a Build Agent session.

---

**Terminology, fixed here to prevent the drift that prompted this document:**

- **Layer 3 — Semantic Modeling** is the layer. Its job is turning clean datasets
  into defined objects.
- **The taxonomy builder** is the AI-assisted tool *inside* Layer 3 that drafts
  object definitions for human review. It is a tool, not a layer.
- **The object schema registry** is Layer 3's *output* — the versioned, approved
  artifact that Layers 1, 2, and 4 all bind to.

The layer is the function; the builder is how it gets populated; the registry is
what everyone else consumes. The companion build specification covers the builder
and the registry only.

---

## 4 — How a fact moves through the system

A single fact — an updated cost figure — travels as follows:

1. It is generated in its native source system, which remains the official record.
2. A connector copies it into Layer 1 on a defined schedule or in real time, stamped
   with source, timestamp, and job identifier. **Nothing is altered.**
3. A Layer 2 transformation standardizes its format, resolves its identifiers
   against other systems' identifiers, validates it against quality assertions, and
   may compute a derived value.
4. The cleaned value becomes a property of a defined object in the Layer 3 registry,
   automatically linked to related objects.
5. Any Layer 4 application reading that object reflects the update immediately,
   because it reads the object live rather than holding a copy.
6. If a user acts on that value, the action is written back as new, permissioned,
   auditable data, visible to every other application with appropriate access.

The chain is traceable in both directions: from any number in any application,
backward to the source record, and forward to everything depending on it.

---

## 5 — Layer descriptions

### 5.1 — Layer 1: Ingestion

**How it works.** Connectors translate each source system's native interface — file
exports, database connections, APIs, streams. Each connector is configured once and
runs on a defined rhythm.

**Sync patterns.** Full sync for smaller reference data; incremental sync as the
standard for high-volume operational data; streaming for real-time systems.

**Storage — a deliberate architectural choice.** Layer 1 data is stored in an **open
table format** (Apache Iceberg or equivalent), not a proprietary store. This is a
direct response to the most-criticized property of comparable platforms: data enters
easily and exits hard.

The consequence worth stating plainly: an organization can walk away from STRATA's
semantic layer and its data remains in an open format it owns, readable by any
compliant engine. This lands directly on the lock-in and total-cost-of-ownership
question that appears in every serious technical evaluation.

**Governing principle.** Data lands exactly as received. No cleaning or correction
happens here, preserving an unaltered audit trail back to the source.

**Interconnection.** No dependency on other layers. Its output — raw,
lineage-stamped data — is the sole input to Layer 2.

**Proposed first connector: SOVEREIGN itself.** SOVEREIGN is both a Layer 4 consumer
and a Layer 1 source. Its `SovereignLogEvent` stream — cost telemetry, human
decisions, agent steps — is currently session-scoped and lost at session end. A
connector pulling it into persistent Layer 1 storage is, in effect, a real answer to
the long-open Stage 2 persistence question. This is proposed as the first connector
because it is small, uses a contract already under our control, and produces a
capability the platform has wanted for some time. (Phase 0 note: the read surface
this connector needs already exists and is governance-approved —
`ctx.logger.getEntries()`, added by GD-28 at shell-contract v1.23.)

### 5.2 — Layer 2: Transformation

**Steps.**

- **Standardization** — reconciling formats, codes, and vocabularies across sources.
- **Entity resolution** — determining that records from different systems refer to
  the same real-world thing, supported by a maintained cross-reference table and, only
  where no shared identifier exists, statistical matching.
- **Validation** — automated quality assertions that quarantine failing records
  rather than passing errors downstream silently.
- **Derivation** — calculating values not present in any single source (variances,
  rates, aggregates).

**How it is built — changed from the generic draft.** Transformations are written as
**version-controlled, testable code**, not assembled in a visual pipeline builder.

This is a deliberate reversal of the original overview and it follows from
SOVEREIGN's own rules rather than from industry fashion. Rule 15 requires that a
sentence describing a code change quote real `git diff` or `git show` output rather
than reconstructing from intent. A visual pipeline cannot satisfy that rule — there
is nothing to diff. A transformation you can diff is one you can review, test, and
roll back, and the platform already has a 2,245-test culture built on exactly that
premise.

**Quality assertions are tests, not a pipeline stage.** Data quality checks are
first-class, version-controlled artifacts that run in continuous integration and
fail the build. This mirrors the platform's existing practice of adding permanent
regression tests to guard known defect classes — the parity-test pattern now covering
5 of 7 Workspace tabs is the same instinct applied to data.

**A hard constraint carried from SOVEREIGN.** SOVEREIGN maintains two program
datasets — PPBE-native programs and World Model programs — **deliberately unmerged**,
with unification happening only at a reporting layer, per an explicit architectural
decision. A naive entity-resolution pass would silently undo that decision. Entity
resolution must be explicitly configured to respect it, or the decision must be
formally revisited. It must not be reversed by default behavior.

**Interconnection.** Consumes Layer 1 output; its cleaned datasets are the exclusive
input to Layer 3. Pipelines are rebuildable: correcting an early step and rerunning
propagates the fix downstream automatically.

**Governing principle.** Every transformation step is visible and traceable, so any
final number's full processing history can be reconstructed on demand.

### 5.3 — Layer 3: Semantic Modeling

**How it works.** Clean datasets are mapped into **object types** representing
real-world entities. Each object type is defined by:

- **Properties** — attributes, each traceable to a specific field in a specific
  Layer 2 dataset.
- **Links** — typed, directional relationships to other object types, with
  cardinality.
- **Actions** — defined operations users may perform, each specifying who may
  invoke it, what input it requires, and what it records.
- **Permissions** — visibility and edit rules attached to the object, so access
  control is defined once and enforced everywhere.

**How it is built.** The registry and the taxonomy builder are built in Build Agent
sessions like everything else. What is *populated* through structured collaboration
with subject-matter experts is the model's content — the object definitions
themselves — with the taxonomy builder drafting proposals for human review. The
builder is an assistive drafting tool, never an autonomous authority. Full detail is
in the companion build specification.

This is the one layer where non-engineers do substantive work, and it is review
work, not build work.

**No separate copy of the data.** Objects are a live lens over Layer 2 datasets. When
a pipeline refreshes, every object reflects the update automatically.

This is Rule 11 — one fact, one computation, reused, never independently
reimplemented — expressed architecturally. **[Corrected v0.3, re-verified with
commit evidence]** The platform has direct experience of the failure mode this
rule guards: WH-43, where two components independently computed the same
pending-travel count and disagreed. The repository's own process document puts the
detection window at **nine days**, not months as v0.2 said (`docs/36` §5: "the
metric that would have caught WH-43 the day it shipped rather than nine days
later"). The full arc was two acts: divergent computation detected July 28, 2026
(fix `0ab1610`, Session 71); that fix itself found wrong by a live check and
reverted August 5, 2026 — **eight days** later (`4f93aea`, Session 92 — "a
structural Rule 11 violation," per its Handoff). The causal claim is also now
*confirmed*, not just plausible: Rule 11 was added to `AGENT_REFERENCE.md` in
Session 93, the session immediately after the WH-43 revert, and its text cites
WH-43 by name (`AGENT_REFERENCE.md:1592` — "WH-43 was exactly this failure"). The
lesson stands without the exaggeration — and at data-platform scale, nothing as
attentive as this platform's walkthrough discipline would necessarily be watching.

**Agent access.** The registry serves approved object types to AI agents over the
**Model Context Protocol**, not a proprietary agent API. Any agent — including ones
built outside this organization — can bind to the governed schema and operate within
the same permission and audit boundaries as human users. Comparable platforms
predate MCP and expose agents through bespoke interfaces. (Phase 0 flag, surfaced
for the Governance Agent: an MCP-served registry would be the platform's first
persistent, out-of-browser service — everything today is session-scoped and
browser-resident. This belongs in the same decision cluster as dependency policy
and Stage 2 persistence; see §8.)

**Governing principle.** The model should reflect how the organization actually
thinks and operates — including its genuine ambiguities and disagreements — rather
than an artificially tidy abstraction.

### 5.4 — Layer 4: Applications

**This layer is where SOVEREIGN lives.** SOVEREIGN's six products, companion
modules, Reviewer's Workspace, and two governed workflow layers are all Layer 4.
The Intelligence Layer, when built, is also Layer 4.

**How it is built.** Layer 4 tools are written as version-controlled code in Build
Agent sessions, exactly as SOVEREIGN's existing products were. There is no
low-code assembly path at this layer or any other — see §3.1.

What the registry changes is not *who* builds Layer 4 tools but *what they bind to*.
Applications bind to registry object types by reference rather than reaching into
raw datasets, so a schema update propagates without re-wiring every consumer. That
is a real reduction in coupling and rework. It is not a reduction in engineering
discipline.

**Interconnection.** Reads live from, and writes actions back into, the registry.
Because every application shares the same objects, an action taken in one is
immediately reflected in every other — including AI-driven interfaces, which operate
under the same permission and action framework.

---

## 6 — The dependency rule

**SOVEREIGN may import from STRATA. STRATA imports nothing from SOVEREIGN.**

This is the load-bearing architectural constraint and the one most likely to be
violated under schedule pressure.

STRATA is organization-scoped. If it depends on SOVEREIGN, then every future
consumer of the substrate must depend on a single application to reach it, and
schema promotion breaks whenever SOVEREIGN is down or being refactored.

**Proposed placement:** STRATA is its own workspace (or set of workspaces) in the
existing monorepo. Co-location gives one repository, one test suite, one set of
governance conventions, one Build Agent workflow. The one-way dependency rule keeps
the architecture honest and preserves the option of lifting STRATA into its own
repository later — mechanical for a workspace with no upward dependencies,
effectively impossible for one that reaches into SOVEREIGN's products.

**Phase 0 findings on placement, now verified:**

- **The substrate entry path is cheaper than v0.2 assumed.** The monorepo has two
  workspace tiers. Shell-mounted UI modules are governance-gated at four hardcoded
  points (the `workspaces` array, static registration in `register-modules.ts`,
  the `MODULE_PRODUCT` map whose validator rejects any moduleId "not one of the
  eleven canonical modules," and the `SovereignProduct` union in the shell
  contract). But **non-UI substrate packages — the `sovereign-data` /
  `sovereign-api-client` tier — need none of that**: one `workspaces` array entry
  and a package.json. STRATA as proposed (no shell-mounted UI of its own) enters
  at that tier, with no shell-contract change and no GD-gated type sync.
- **The one-way rule requires CI enforcement, with specific evidence.** The
  codebase's real dependency graph exceeds its declared one: roughly forty lateral
  module-to-module source imports exist by relative path with no package.json
  record (an established, deliberate pattern — but proof that convention alone
  does not constrain imports here). The CI enforcement is not advisory: **no `../`
  imports may escape the STRATA workspace boundary, and no `@sovereign/*` package
  may appear in STRATA's `package.json`**. These two rules together make the
  dependency boundary as hard as a package boundary. (GD-36.)

### 6.1 — The FLOWPATH relationship

The taxonomy builder requires a human review gate: nothing promoted without explicit
acceptance, accept/reject/modify at single-property granularity, a named steward per
object type, versioned promotion with the approver recorded.

**[Corrected and resolved v0.3 — this was v0.2's highest-risk open question. Phase
0 has now answered it. Full evidence in the Phase 0 report.]**

**Finding:** FLOWPATH's gate model is **not** general enough to accept a new
artifact type. "Artifact type" in FLOWPATH is a closed four-member union of
workflow kinds; the Five-Question Completeness Gate is a single pure function over
workflow-step semantics (roles, sequence, triggers, inputs/outputs, terminal
condition) that a schema draft cannot satisfy or be adapted to; the approval
surface renders FLOWPATH's mapper output concretely and re-runs that gate before
approving; and review granularity is whole-artifact approve-or-return — the
per-property granularity Layer 3 requires exists nowhere in the platform today.

**But the reuse the v0.2 arrangement was reaching for does exist — one level up.**
The shell contract's `ReviewerWorkspaceSurface` (GD-25) was explicitly designed for
new reviewable item types: its payload is deliberately `unknown`, items are keyed
by module id, and the consuming Workspace narrows types per module. Five modules
(VIGIL, ARIA, SCRIBE, NEXUS, FLOWPATH) already publish their pending decisions
through it, each with a small publisher and its own review component. FLOWPATH's
"Review" presence is one tab of the Reviewer's Workspace — which is its own
top-level module, not a FLOWPATH feature (v0.2 misattributed this).

**The corrected arrangement, with the dependency direction preserved:**

- The registry exposes draft schema elements through its own interface.
- A SOVEREIGN-side schema-review component imports STRATA's draft types (the
  allowed direction), publishes drafts to the Reviewer's Workspace surface under
  its own module id, provides the per-element review UI, and emits
  `HUMAN_DECISION` events with a new `SCHEMA_APPROVAL` decision type (a
  governance-gated shell-contract addition — GD, version bump, type sync, Rule 13
  parity report).
- **STRATA does not import FLOWPATH — or anything else in SOVEREIGN.** FLOWPATH
  does not move, and its gate is not extended.

**This does not violate Rule 11.** A review workflow is a mechanism, not a fact.
What must not exist is two places independently deciding what "approved" means —
and under this arrangement the registry remains the single authority on approval,
while the decision itself rides the platform's one existing human-decision audit
grammar.

---

## 7 — What makes STRATA distinct

The four-layer architecture is close to Palantir Foundry's published model. That is
not a weakness — it is a proven structure, and technical evaluators in this segment
will likely recognize it as a credibility signal. But "how is this different from
Foundry?" should be expected in evaluation and answered deliberately rather than met
cold.

**Technical currency — modern, but not distinctive.** Foundry's architecture dates
from roughly 2016-2018. Open table formats, code-first transformations, quality
assertions as CI tests, MCP-based agent access, and open lineage standards are what
a system designed today would use. They make STRATA current. They do not make it
unique; anyone can adopt them.

**Build methodology — a real divergence, not a cosmetic one.** Comparable platforms
are sold substantially on citizen development: non-engineers assembling pipelines and
applications through visual tools. STRATA rejects that path entirely (§3.1). Every
artifact is produced through a governed agent methodology, is diffable, and has a
recorded decision behind it. For an evaluator weighing compliance defensibility, "we
can show you the diff and the decision for every object in the model" is a different
kind of answer than "our analysts built it themselves."

**Governance-native schema evolution — this is the actual differentiator.**
Comparable platforms have permissions, versioning, and lineage. What they do not
have is a governance *culture*: a registry of recorded decisions, a discipline of
disclosing corrections rather than deleting them, and standing rules distinguishing
a finding that de-risks a question from one that closes it (Rule 16 — real in
substance, currently homed in the unmerged Addendum per the status table above).

Applied to schema evolution, this means every promotion is recorded in the shape of
a governance decision: **approver of record, rationale retained, the rejected
alternative kept rather than deleted, and the AI's original proposal preserved
alongside what the human changed it to.**

Over time that produces something with no equivalent in comparable systems: a
queryable record of *why the organization's model looks the way it does* — including
the arguments that did not win. For an evaluator whose criteria include compliance
defensibility and audit-trail integrity, that is a materially different claim than
"we have version history."

The companion build specification already reaches for this without naming it. Its
requirement that disagreements be surfaced explicitly rather than silently resolved,
and its closing instruction to build the tool so as to make disagreement visible
rather than make decisions disappear, are governance philosophy, not data
engineering features.

---

## 8 — Open decisions this document does not resolve

These are real governance decisions requiring explicit resolution, not
implementation details. Left implicit, they will be relitigated repeatedly.

| # | Decision | Why it cannot be deferred |
|---|---|---|
| 1 | STRATA's placement and the one-way dependency rule (now including CI enforcement — see §6) | Every subsequent design choice depends on it |
| 2 | Schema authority — is the object schema registry or the shell contract canonical for entity structure? | Two independent definitions of the same entity is Rule 11 at architecture scale |
| 3 | The schema review gate — **Phase 0 resolved the mechanism question** (the Workspace review pattern, not FLOWPATH's gate; see §6.1); what remains is the decision itself, including the `SCHEMA_APPROVAL` shell-contract addition | Determines Layer 3's review design and one shell-contract bump |
| 4 | Formally ending the zero-new-production-dependencies streak | An ingestion platform cannot be built dependency-free; the streak is real and SBOM-tracked ("unbroken from Session 62") and should end by decision, not by discovery |
| 5 | Entity resolution's treatment of the two program datasets | Default behavior would silently reverse an explicit prior architectural decision |
| 6 | Whether STRATA Layer 1 constitutes the answer to Stage 2 persistence (`docs/28`) — and, related, that an MCP-served registry would be the platform's first persistent service (§5.3) | Stage 2 is a long-standing open decision that this work may resolve incidentally |

---

## 9 — Summary principle

Each layer converts a raw, siloed asset into a progressively more trustworthy one:
scattered data becomes traceable raw data; traceable raw data becomes clean governed
data; clean governed data becomes a meaningful model of the organization; and that
model becomes the shared foundation for every tool built on it, human-facing or
AI-facing.

The value is cumulative. Each new application reuses objects and relationships
already defined rather than starting over.

**And each promotion of a definition into that model is a recorded governance
decision, with its reasoning preserved — which is the part that is genuinely ours.**

---

*STRATA — Architecture Overview · DRAFT v0.4 · August 9, 2026*
*Phase 0 verification applied (v0.3); follow-up addendum incorporated (v0.4)*
*Placed as draft — not authoritative until governance decisions in §8 are recorded*
*Pre-Decisional · Internal Working Document*
