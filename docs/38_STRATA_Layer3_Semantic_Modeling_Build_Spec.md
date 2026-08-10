# STRATA — Layer 3 Semantic Modeling Build Specification
## DRAFT v0.4 · August 9, 2026
## Supersedes: DRAFT v0.3 (August 9, 2026)
## v0.3 changes applied by the Build Agent from the Phase 0 repo-verification pass;
## v0.4 changes applied by the Build Agent from the Phase 0 follow-up addendum

**Status: DRAFT — placed for repo visibility, not yet authoritative.** Phase 0
verification is complete and its findings are incorporated. Remaining opens in §9
are decisions and pre-implementation questions, not unverified facts.

**v0.4 changes from v0.3:**
- §2: "eight days" added explicitly to the WH-43 two-act timeline, alongside the
  existing specific dates, sourced from the follow-up addendum's section B2/G where
  the figure was derived from real commit evidence.
- All v0.3 corrections and Phase 0 findings carried forward unchanged.

**Companion document:** `docs/37_STRATA_Architecture_Overview.md` — read first.
This specification covers Layer 3 only: the taxonomy builder, the object schema
registry, and the review gate. Layers 1-2 and Layer 4 application building are
outside its scope.

**A preliminary note on coverage and commitment.** This document provides
architecture and design guidance for Phase 3 forward. Implementation will not begin
until GD-36 and GD-38 are formally recorded (Phase 1 of the Work Scope) — both are now recorded, approved August 10, 2026 · Project Principal (Session 99). The
specifications in §5 and beyond are close enough to drive design decisions, but
they are not production contracts — expect them to change as implementation begins.

**Verification status of cited claims:**

| Claim | Status |
|---|---|
| `ReviewerWorkspaceSurface` interface definition and members | **Confirmed** — GD-25, v1.20 `shell-contract.ts` (`ReviewerWorkspaceSurface`: `publish`, `remove`, `listForModule`, `list`, `subscribe`) |
| Five existing modules publishing to the Workspace | **Confirmed** — VIGIL, ARIA, SCRIBE, NEXUS, FLOWPATH |
| `WorkflowType` four-member union | **Confirmed** — `shell-contract.ts:892` |
| `evaluateFiveQuestionGate` signature | **Confirmed** — `FLOWPATH/src/utils/gating.ts` |
| FLOWPATH's approval renders mapper output and re-runs gate | **Confirmed** — `FLOWPATH/src/components/WorkflowApprovalDialog.tsx:44–80` |
| `HumanDecisionType` current members (22) | **Confirmed** — `shell-contract.ts:790–835`; `SCHEMA_APPROVAL` does not yet exist |
| Cost-tracking coverage (14/19 sites, 5 uninstrumented) | **Confirmed** — `sovereign-api-client/src/apiClient.ts` reviewed; 5 uninstrumented sites named in the companion Phase 0 report |
| Rule 13 parity-test requirement | **Confirmed** — `AGENT_REFERENCE.md` |
| Per-element review UI — no platform precedent | **Confirmed** — no existing review component navigates below artifact level |
| Rules 15, 16, 17 cited here | **Real, but currently live only in the unmerged `AGENT_REFERENCE_Addendum_20260730.md`** |

---

## 1 — What this specification covers

Layer 3 is where clean data from Layer 2 becomes a governed object model. This
specification covers two artifacts built in sequence:

| Artifact | What it is | Build order |
|---|---|---|
| **Object schema registry** | The versioned, approved data structure that Layers 1, 2, and 4 bind to | **First** |
| **Taxonomy builder** | The AI-assisted tool that drafts registry entries for human review | **Second** |

Build the registry first. The builder produces drafts; without a registry, those
drafts have nowhere to go. Reversing this order is the most likely sequencing error
in this work.

This specification does not cover Layer 1 or Layer 2 pipeline implementation,
Layer 4 application development, or the host monorepo structure — those are covered
in the Architecture Overview or will be specified separately.

Layers 1 and 2 are assumed to exist or be built in parallel. Layer 4 consumers —
SOVEREIGN and, eventually, the Intelligence Layer — bind to the registry by
reference, never by direct dataset access. **Layers 1, 2, and 4 must treat the
registry as their shared contract. No layer may hardcode assumptions about entity
structure that bypass it.**

---

## 2 — Governing rules and their Layer 3 implications

Layer 3 is built inside the SOVEREIGN monorepo, which means the full set of build
conventions applies — including some rules with specific implications for this layer.

These are not general best practices. They are existing platform rules that
constrain this build, and violating them would be a regression against decisions
already made.

**Rule 11 — One-fact, one-computation:** Every schema object is defined once in the
registry and referenced everywhere. **No component recomputes or re-derives a
definition that already exists in the registry.** The penalty for violating this at
data-platform scale is the same failure mode as WH-43: two sources of truth
diverge, and the divergence goes undetected because both implementations are
individually plausible. **[Corrected v0.3, re-verified with commit evidence]** The
platform document establishing Rule 11 as mandatory (`AGENT_REFERENCE.md:1592`)
cites WH-43 by name; `docs/36` §5 puts the original detection window at **nine days**
("the metric that would have caught WH-43 the day it shipped rather than nine days
later"). The arc had two acts:
detection and fix July 28, 2026 (`0ab1610`, Session 71); that fix found wrong by a
live check and reverted August 5, 2026 — **eight days** later (`4f93aea`, Session
92). The "eight days" figure is sourced from the Phase 0 follow-up addendum (§B2),
where it was derived from real commit evidence. The lesson applied here: every
schema property's authoritative definition lives in the registry, and any component
displaying or using it reads from there. The registry is precisely the kind of
component where this failure mode would be expensive — and where nothing as
attentive as this platform's walkthrough discipline would necessarily be watching.

**Rule 13 — Parity testing:** Every new schema element introduced in the taxonomy
builder that affects a display surface must be accompanied by a parity test. When
the review UI is built (Phase 5/6), a parity report covering each test added for
review-UI behavior must be submitted as part of the Phase 5/6 completion step.

**Rule 15 — Code-change descriptions quote real `git diff`/`git show` output.** Real
in substance; currently homed only in the unmerged Addendum (see status table
above). Every part of this build must be diffable. This rules out visual or opaque
configuration for anything that constitutes logic — transformation code, schema
definitions, pipeline steps. Nothing in Layer 3 is assembled visually.

**Rule 16 — Finding vs. decision:** Phase 0 distinguished between a finding that
de-risks a question and a decision that closes it. The FLOWPATH gate question is
answered (finding: the gate is not extensible, and the Workspace review pattern is
the correct mechanism). GD-38 remains open (decision: officially authorizing that
pattern for STRATA with a new `SCHEMA_APPROVAL` type). Phase 0 cannot close GD-38.

**Rule 17 — A safeguard's continued existence is not evidence of its continued
use.** Same status as Rule 15. The human review gate must be *demonstrably
exercised*, not merely present. Session reporting should show real approvals, not
just that the gate exists. This rule applies directly to the review UI's reporting
requirements in Phase 5/6.

**The two-program-dataset constraint.** SOVEREIGN maintains PPBE-native programs
and World Model programs as deliberately separate datasets, unified only at a
reporting layer, per an explicit architectural decision. A naive entity-resolution
pass would silently undo that decision. Entity resolution must be explicitly
configured to respect it, or the decision must be formally revisited. It must not
be reversed by default behavior.

---

## 3 — The object schema registry

The registry is the canonical, versioned store of approved object type definitions.
It is the single source of truth for what each object type is, what properties it
has, and what relationships it participates in.

### 3.1 — Registry contents

Each registered object type record contains:

- **Canonical name and semantic description** — one authoritative definition per
  type, not a mapping of source-system names.
- **Properties** — name, type, optional/required, source binding (which Layer 2
  field), nullability behavior, derivation formula if derived.
- **Links** — name, target type, cardinality, directionality, description.
- **Actions** — name, permission group, input schema, output schema, audit-event
  type emitted.
- **Permissions** — who may read, write, or act on instances.
- **Approval record** — approver of record, timestamp, version at approval, text of
  any modifications from the AI draft, and the full original AI proposal (the
  rejected or modified text is kept, not deleted — see §7).

**Illustrative entry structure (not prescriptive of implementation syntax):**

```yaml
object_type:
  name: string                      # e.g., "Program"
  definition: string                # plain-language definition
  definition_source: string         # data pattern, document, or session that motivated it
  status: draft | approved | deprecated
  version: integer
  steward: string                   # named owner with future change authority
  properties:
    - name: string
      data_type: string
      source_field: string          # traceable to Layer 2 dataset + column
      nullable: boolean
      value_constraints: string     # optional range/enum/format
      confidence: high | medium | low   # inference confidence, draft items only
  links:
    - target_object_type: string
      relationship_name: string     # e.g., "depends_on", "funds", "contains"
      cardinality: one_to_one | one_to_many | many_to_many
      inferred_from: string         # field(s)/pattern that produced this link
      confidence: high | medium | low
  lifecycle_states:
    - state: string
      allowed_transitions: [string]
  permissions:
    - role: string                  # binds to the platform role model
      access: view | edit
      property_scope: [string]      # optional per-property restriction
  open_issues:
    - description: string           # ambiguities flagged for human resolution
  governance_record:
    - version: integer
      approver: string              # human approver of record
      timestamp: string
      change_summary: string
      rationale: string             # why this definition, in the approver's words
      ai_proposal: string           # the builder's original proposal, verbatim
      human_modification: string    # what the approver changed, and why
      rejected_alternatives: [string]  # options considered and not taken
```

Layer 4 applications and agents bind to `status: approved` versions only, unless
explicitly operating in sandbox/preview mode against drafts.

### 3.2 — The governance record — the distinguishing requirement

The `governance_record` block is the single most important departure from comparable
commercial platforms.

Standard version history answers *what changed and when*. This block answers **why
the organization's model looks the way it does** — including the reasoning, the
AI's original proposal, what the human changed, and which alternatives were
considered and rejected.

**Requirements:**

- Rejected alternatives are **retained, never deleted**. This mirrors the platform's
  existing practice of keeping flawed versions in history rather than removing them.
- The builder's original proposal is preserved verbatim alongside the approved
  result, so the delta between AI proposal and human judgment is permanently
  visible and analyzable.
- Rationale is required, not optional. A promotion with an empty rationale field
  should fail validation.
- The full record is retained indefinitely and is queryable.

**Phase 0 opportunity, flagged for the Governance Agent:** the `governance_record`
block overlaps substantially with what a `HUMAN_DECISION` event already carries
(approver, decision type, timestamp, payload). If registry promotions also emit
`HUMAN_DECISION` events with the proposed `SCHEMA_APPROVAL` decision type (§5),
schema governance appears in the same audit stream and Activity & Decisions surface
as every other human decision on the platform — one audit grammar, no parallel
record. The registry keeps the full record (rationale, alternatives, verbatim AI
proposal); the event stream carries the decision. That is Rule 11 applied to this
specification's own distinguishing feature.

**Why this matters beyond good practice:** it produces a real audit artifact for
evaluators whose criteria include compliance defensibility and audit-trail integrity,
and it is a materially stronger claim than "we have version history."

### 3.3 — Registry as the Layer 4 binding surface

Layer 4 applications do not reach into Layer 2 datasets directly. They bind to
registry object types by name and use the action surface. When a schema is updated
and re-approved, every consumer reflects the change without re-wiring.

**This is the architectural enforcement of Rule 11 at Layer 4.** An application
cannot accidentally implement its own definition of what a program is — it can only
use the one in the registry. This is by construction, not convention.

Applications bind UI components and agent tools to registry entries **by reference
(name + version), not by direct dataset access**, so a schema update propagates
without re-wiring consumers. Access-control metadata attached to approved schema
is enforced at Layer 4.

### 3.4 — MCP serving

The registry exposes approved object types to AI agents over the Model Context
Protocol. An agent consuming registry types operates within the same permission and
audit boundary as a human user — it cannot act outside the defined action surface
for the object types it is given.

**Phase 0 flag (surfaced for governance, not resolved in this specification):** An
MCP-served registry would be the platform's first persistent, out-of-browser
service. Session-scoped browser-resident services are what the platform runs today.
A persistent MCP server introduces deployment target decisions, credential
management, monitoring, backup, and retention governance that have no precedent
here. This is a real scope item in its own right, not an implementation detail.
It belongs in the governance decision cluster alongside Stage 2 persistence (R15,
Work Scope `docs/39`).

### 3.5 — Registry acceptance criteria

1. An approved object type can be queried by name and version, returning a complete,
   traceable definition including its governance record.
2. Draft and approved versions are cleanly separated; a Layer 4 consumer binding to
   approved versions never receives draft content.
3. Every property and link resolves to a specific Layer 2 dataset field.
4. A promotion attempt with a missing approver or empty rationale is rejected.
5. Rejected alternatives from prior versions remain retrievable.
6. An MCP-connected agent can enumerate approved object types and their permissions.

---

## 4 — The taxonomy builder

The taxonomy builder is an AI-assisted drafting tool. Its job is to propose object
type definitions for human review, not to approve them.

**An assistive drafting tool, never an autonomous authority.** Its value is in
compressing the drafting labor of schema design, not in replacing the judgment calls
that structure ultimately requires.

### 4.1 — AI tool constraints

**The taxonomy builder does not have unmediated access to production data.** It
operates on schemas (field names, types, descriptions) and on approved object type
definitions, not on individual records. Privacy constraints apply to the input
surface of the tool as much as to any other surface.

**Cost tracking applies.** Every inference call the taxonomy builder makes during a
drafting session is instrumented using the existing `trackCost` mechanism.
**[Corrected v0.3]** Phase 0 confirmed the real coverage baseline: **14 of 19**
live-call sites in the production codebase are instrumented, not all of them. The
remaining 5 are named and known: three COUNSEL `REASONING_STEP_*` hooks
(`useAnalysis.ts`, `useCounterargument.ts`, `usePreMortem.ts`), FLOWPATH's
`useFlowpathElicitation.ts`, and APEX's `useApexAnalysis.ts`. The taxonomy builder
must add instrumented inference call sites, not uninstrumented ones — and Phase 3's
completion step must include a coverage report on those five sites.

**No inference call is made without tracking.** This is non-negotiable given the
cost-transparency obligations that apply to the entire platform. An instrumentation
miss in the taxonomy builder is a compliance gap, not a performance issue. The
platform has real, recent experience of the alternative: cost tracking was
retrofitted across 14 sites after the fact, and 5 sites remain uninstrumented today.
Building it in from the first commit avoids adding to that gap.

### 4.2 — What "draft" means in the builder context

A builder draft is a proposal with a confidence signal, a rationale, and a
traceable source binding for each element. It is not a first-pass that needs
significant human interpretation to be useful. The quality bar for a builder draft
is: a subject-matter expert can review it in a single sitting, accept most of it,
and understand clearly what they are accepting.

That bar rules out vague proposals ("this field might relate to cost") and ones that
require the reviewer to verify the source binding independently. If the builder
cannot produce a confident, traceable proposal, it should surface that uncertainty
explicitly rather than guessing.

### 4.3 — Inputs

- **Structured datasets** — cleaned Layer 2 tables with field names, inferred types,
  sample values, null rates, cardinality statistics.
- **Existing reference material** (prioritize when present) — data dictionaries,
  glossaries, regulatory or domain vocabularies, prior schema definitions, sample
  deliverables that imply structure.
- **Human-supplied seed definitions** — partial or draft object types from domain
  experts, to be validated and extended, never overridden.
- **Elicitation session notes** — free-text notes from structured sessions with
  subject-matter experts, mined for definitions, boundaries, and disagreements.
- **Known-decided separations** — a seeded list of concept pairs that must not be
  merged despite structural similarity. The two SOVEREIGN program datasets
  (PPBE-native and World Model) are the first required entry.

### 4.4 — Core functions

Each independently invokable:

1. **Entity candidate detection** — analyze structure (column groupings,
   primary-key-like fields, repeated foreign-key patterns) and content to propose
   candidate object types.
2. **Property extraction and typing** — propose property lists with inferred types,
   formats, units, and permitted ranges from source field statistics.
3. **Relationship inference** — detect likely links via shared or foreign-key-like
   fields, referential patterns, and co-occurrence. Infer directionality and
   cardinality; flag low-confidence inferences explicitly.
4. **Synonym and conflict detection** — identify likely duplicate concepts across
   datasets and flag terminology conflicts. **Never silently merge or split.** Check
   proposed merges against the known-decided separations list before surfacing.
5. **Action and lifecycle inference** — where status or state fields exist, propose
   allowed states and plausible transitions as a draft.
6. **Definition drafting** — generate plain-language definitions citing the data
   pattern or reference material that motivated them, so reviewers can evaluate the
   reasoning, not just the output.
7. **Edge-case generation** — generate boundary test cases per draft definition,
   surfacing exactly the disagreements a manual review session would need to resolve.
8. **Iterative refinement** — accept structured feedback (accept/reject/modify per
   element) and regenerate affected portions without discarding unrelated approved
   parts.
9. **Governance record drafting** — pre-populate the `ai_proposal` field and prompt
   the reviewer for rationale and rejected alternatives at promotion time.

### 4.5 — Process pipeline

```
[Cleaned Datasets] + [Reference Material] + [Seed Definitions] + [Known Separations]
        │
        ▼
 (1) Entity Candidate Detection ──► candidate object list
        │
        ▼
 (2) Property Extraction ──► draft properties per object
        │
        ▼
 (3) Relationship Inference ──► draft links + cardinality
        │
        ▼
 (4) Synonym/Conflict Detection ──► flagged ambiguities
        │
        ▼
 (5) Definition Drafting ──► human-readable draft schema + rationale
        │
        ▼
 (6) Edge-Case Generation ──► test cases for reviewers
        │
        ▼
────── HUMAN REVIEW GATE (Workspace review pattern — see §5) ──────
        │  (accept / reject / modify, per element)
        │  (rationale + rejected alternatives captured here)
        ▼
 (7) Refinement ──► updated draft (loop to gate as needed)
        │
        ▼
 (8) Promotion ──► versioned, active entry + governance record
        │
        ▼
   [Object Schema Registry] ──► Layer 4 applications and agents
```

No schema element reaches the active registry without passing the gate at least
once. Automated re-inference on upstream drift must re-enter the same gate, never
auto-promote.

### 4.6 — Human-in-the-loop requirements

- No auto-promotion without an explicit, recorded human acceptance action.
- Confidence levels, source rationale, and flagged conflicts must all be visible to
  reviewers — the builder must expose *why* it proposed something.
- Reviewers must be able to reject or modify at single-property or single-link
  granularity without rejecting the whole object type. **[Phase 0 note: this
  granularity has no precedent anywhere in the platform — every existing review
  surface is whole-item-with-note. It is net-new UI, state-model, and event-grammar
  design work and must be scoped as such (see §5.3 and Work Scope §6).]**
- Disagreements between source-derived signals and human input must be surfaced
  explicitly — for example, *"the seed definition says X depends on Y; the data
  suggests Y depends on X — please resolve"* — never silently resolved in either
  direction.
- A named steward is assignable per object type and recorded in the registry.
- Rationale is captured **at the moment of approval**, not reconstructed later.

### 4.7 — Non-functional requirements

- **Traceability** — every property and link traces to the specific upstream field
  or reference material that produced it.
- **Auditability** — full governance record retained indefinitely, with attribution.
- **Idempotency** — re-running inference on unchanged source data generates no
  spurious drafts.
- **Explainability** — every AI proposal includes a human-readable rationale.
- **Non-destructive iteration** — rejecting one element never requires
  re-approving unrelated approved elements.
- **Cost observability** — see §4.1.

### 4.8 — Builder acceptance criteria

1. Given cleaned datasets, it produces a draft schema with object types, properties,
   and links, each carrying a rationale and confidence level.
2. Ambiguities and conflicts — between sources, or between sources and seed
   definitions — are explicitly surfaced, not silently resolved.
3. A proposed merge that collides with the known-decided separations list is
   surfaced as a flagged conflict, never executed.
4. Human reviewers can accept, reject, or modify individual elements; only approved
   elements become active.
5. Upstream data changes produce new draft versions without altering the active
   approved schema.
6. Downstream Layer 4 tools query the registry and receive complete, versioned,
   traceable definitions.
7. Every live model call in the builder emits cost telemetry.
8. A promotion produces a complete governance record including the AI's original
   proposal and the human's modification.

---

## 5 — The review gate

**[Corrected and resolved v0.3 — this was the specification's most critical open
question. Phase 0 answered it against the real codebase. Full evidence in the Phase
0 verification report.]**

### 5.1 — Why FLOWPATH's gate cannot be used

v0.2 proposed routing schema review through FLOWPATH's Five-Question Completeness
Gate. Phase 0 showed this is structurally impossible:

- **Closed artifact type.** `WorkflowType` in the shell contract (`shell-contract.ts:892`)
  is a four-member union: `WORKFORCE | FUND_TRANSFER | EQUIPMENT | TRAVEL`. Adding a
  fifth member requires a GD, a shell-contract version bump, and type-system
  propagation. There is no "open for extension" path.
- **Gate semantics mismatch.** `evaluateFiveQuestionGate` is a pure function over
  workflow-step properties (roles, sequence, triggers, inputs/outputs, terminal
  condition). A schema definition draft satisfies none of these semantically. The
  gate would reject every draft for the wrong reasons or accept every one trivially.
- **Approval granularity mismatch.** FLOWPATH's approval surface renders the mapper's
  output and re-runs the gate before approving. The result is whole-artifact
  approve-or-return — a single decision on the entire workflow definition.
  Layer 3 review requires per-element decisions: accept this property, reject that
  one, modify a third.

These are not implementation details — they are structural properties of the gate
that cannot be worked around without breaking FLOWPATH's own semantics.

### 5.2 — The correct mechanism: the Workspace review pattern

The shell contract's `ReviewerWorkspaceSurface` (GD-25) was designed for exactly the
use case FLOWPATH's gate was proposed for — new reviewable item types coming from
different modules — without the closed-type constraint:

- **Open payload.** The `publish` call accepts an `unknown` payload. Each module
  narrowing happens in the module's own review component.
- **Module-scoped queues.** Items are published and listed by module id, so the
  STRATA schema-review queue is fully isolated from FLOWPATH's or VIGIL's.
- **Five working precedents.** VIGIL, ARIA, SCRIBE, NEXUS, and FLOWPATH each have a
  publisher and a Reviewer's Workspace tab. The pattern is not novel; it is the
  established mechanism for human review of AI-generated or AI-flagged items.
  (Note: FLOWPATH's "Review" presence is one tab of the Reviewer's Workspace —
  which is its own top-level module, not a FLOWPATH feature. v0.2 misattributed
  this; corrected here.)

The arrangement that follows from this:

- The registry exposes draft schema elements through its own API (internal to STRATA).
- A SOVEREIGN-side schema-review component (a new Reviewer's Workspace module)
  imports STRATA's draft types (the one allowed import direction), publishes them to
  the Workspace surface under its own module id, and provides the per-element review
  UI.
- On steward decision, the component emits a `HUMAN_DECISION` event of type
  `SCHEMA_APPROVAL` — a **new `HumanDecisionType` member**, requiring a governance
  decision (GD-38), a shell-contract version bump, type sync to
  `sovereign-data/src/shared-types.ts` and the Python logger per Constraint #11, and
  a Rule 13 parity-test report.
- **STRATA does not import from SOVEREIGN.** The dependency direction is preserved —
  the SOVEREIGN-side review component imports from STRATA, not the reverse.

This is the mechanism Phase 0 confirmed as correct. GD-38 is the decision that
authorizes it.

**This does not violate Rule 11.** A review workflow is a mechanism, not a fact.
What must not exist is two places independently deciding what "approved" means —
and here the registry remains the single authority on approval, while the decision
rides the platform's one existing human-decision audit grammar.

### 5.3 — Resolved dependency (was: v0.2's controlling blocking unknown)

v0.2's controlling unknown — "this entire section rests on an unverified assumption"
— is closed. The finding is the contingency v0.2 anticipated: FLOWPATH's gate is
not extensible, and the resolution is the second contingency option (a
registry-facing review surface), strengthened by the discovery that the platform
already has a designed, five-times-proven pattern for exactly that. What remains
open is the *decision* (Work Scope §4.2, the re-scoped GD-38), not the mechanism
question.

One scoping consequence, stated honestly: the per-element review UI is net-new
work with no platform precedent (§4.6 note). It belongs to this specification's
build scope — Phase 5/6 — not to the "connection" phase, so that Phase 7 can stay
small honestly.

### 5.4 — Per-element review UI: net-new work

**[Confirmed v0.3]** There is no existing review component in the platform that
navigates below artifact level. Every existing Reviewer's Workspace tab presents an
item and returns a whole-artifact decision (or routes it to an approval dialog with
a single accept/return choice). Per-element accept/reject/modify — where a steward
acts on individual properties, links, and actions independently — has no precedent
in the codebase.

**This is net-new design and implementation work.** It is not a light extension of
an existing pattern. The questions it raises include:

- What does a "partial approval" state mean in the registry? (Some properties
  accepted, others pending or rejected.)
- Can an object type be promoted if any of its properties are rejected? If so, as
  what?
- How does the per-element UI interact with the audit trail — is each element
  decision its own `HUMAN_DECISION` event, or is the batch a single event with
  structured payload?
- What is the interaction model for modify? (Inline edit? Comment + re-draft? Direct
  override?)

These are scoped as implementation decisions for Phase 5/6, not pre-decisions.
They are listed here so the estimates for Phase 5/6 account for design time, not
just build time.

### 5.5 — Related known gap: FLOWPATH cost-tracking site

`useFlowpathElicitation` is one of **five** live-call sites currently without cost
tracking (the repo-confirmed figure; full list in §4.1). Under the corrected §5
arrangement, FLOWPATH's elicitation flow is *not* load-bearing for schema review,
so this gap no longer escalates on STRATA's account — it remains what it was: a
disclosed backlog item. The builder's own inference calls are covered by §4.1's
from-the-first-commit requirement instead.

---

## 6 — Object type lifecycle

A definition moves through exactly these states:

```
DRAFT → UNDER_REVIEW → (APPROVED | REJECTED | MODIFICATION_REQUESTED)
     ↑                                              |
     └──────────────────────────────────────────────┘
       (modification cycle)
```

**DRAFT** — the builder has produced a proposal; it is not yet in the steward's
queue.

**UNDER_REVIEW** — the proposal has been published to the Reviewer's Workspace; the
steward has been notified; no further builder changes are permitted until the review
is resolved.

**APPROVED** — the steward has accepted the definition (possibly with modifications);
it is recorded in the registry with the approval record; consumers may now bind to
it.

**REJECTED** — the steward has rejected the definition; it remains accessible in
audit history but cannot be promoted; a new draft session is required.

**MODIFICATION_REQUESTED** — the steward has returned the definition with specific
element-level changes requested; the status reverts to DRAFT for the modification
cycle; the request text is recorded alongside the original proposal.

The MODIFICATION_REQUESTED state closes the loop: a steward's feedback is not a
free-form comment that disappears — it is a named state transition with recorded
content.

---

## 7 — What the registry keeps

Rule 16 — the distinction between finding and decision — implies a specific property
of the registry's retention behavior: it keeps what did not win, not just what did.

Every promotion record contains:

- The AI's original proposal (full text, not a diff).
- The steward's decision and timestamp.
- The modification requested, if any (full text).
- The final approved definition.
- The approver of record.

This is not a nice-to-have audit trail. It is the organizational record of *why the
model looks the way it does* — including the assumptions the AI made that the steward
rejected, the alternative property definitions that were considered, and the
rationale the steward recorded for their choices. Over time, that record becomes
queryable institutional memory.

**Build the tool so disagreement is visible, not so decisions disappear.** A steward
who accepts a proposal, modifies it silently, and moves on produces a model without
a record of the modification. The review UI should make the modification path
obvious and the "accept without record" path require an explicit confirmation that no
modification was made.

**And build the registry so that when a decision is made, the reasoning survives it.**

---

## 8 — What Layer 3 does not include

**Layer 3 does not include transformation logic.** How raw data becomes the property
values attached to an object is Layer 2's responsibility. Layer 3 defines what the
properties are and where they come from; Layer 2 produces the values.

**Layer 3 does not include application UI.** The Reviewer's Workspace tab for schema
review is a Layer 4 component — it is a SOVEREIGN-side module that imports from
STRATA, not a STRATA component. This is the correct dependency direction.

**Layer 3 does not store instance data.** The registry stores definitions. Individual
records — the actual cost figure, the actual program entry — live in Layer 1 and are
computed in Layer 2. Layer 3's objects are a live lens over Layer 2, not a copy.

---

## 9 — Open items before Phase 3

These are decisions and pre-implementation questions that must be resolved before
Phase 3 begins. They are listed here rather than in the Work Scope to keep the
technical pre-conditions visible alongside the specification.

| # | Item | Type |
|---|---|---|
| 1 | GD-38: formally authorize the `ReviewerWorkspaceSurface` pattern with `SCHEMA_APPROVAL` | **Resolved — GD-38 approved August 10, 2026 · Project Principal. Shell-contract change deferred to Phase 3+.** |
| 2 | GD-36: formally authorize the one-way dependency rule with CI enforcement | **Resolved — GD-36 approved August 10, 2026 · Project Principal.** |
| 3 | Schema authority: registry or shell contract canonical for shared entity structure? | Decision (affects design) — open; named in GD-39 as blocking Phase 3 |
| 4 | "Partial approval" semantics: what does it mean for an object type when some properties are approved and others are pending? | Design decision |
| 5 | Per-element `HUMAN_DECISION` vs. batched: how many events per review session? | Design decision (affects `SCHEMA_APPROVAL` payload design) |
| 6 | MCP server deployment target: where does a persistent registry server run? | Decision (affects scope of Phase 7) — open; requires its own future GD before Phase 3 |
| 7 | Entity resolution's treatment of the two program datasets | **Resolved — GD-40 approved August 10, 2026. Cross-reference between the two ID schemes is named as near-term Layer 3 modeling work; not a permanent separation.** |

---

## 10 — Summary

The taxonomy builder's role is narrow and disciplined: **propose structure from
evidence, explain its reasoning, and defer authority to humans at every promotion
point.** Its value is in compressing the drafting labor of schema design — not in
replacing the judgment calls that structure ultimately requires.

Build it to make disagreement visible, not to make decisions disappear.

---

*STRATA — Layer 3 Semantic Modeling Build Spec · DRAFT v0.4 · August 9, 2026*
*Phase 0 verification applied (v0.3); follow-up addendum incorporated (v0.4)*
*GD-36 and GD-38 recorded August 10, 2026 — approved by Project Principal (Session 99). This document remains DRAFT v0.4 pending formal adoption.*
*Pre-Decisional · Internal Working Document*
