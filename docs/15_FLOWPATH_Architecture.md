# SOVEREIGN Platform — FLOWPATH Architecture Specification
## Document 15 · Workflow Elicitation and Process Intelligence
## Authored: June 26, 2026 · Status: APPROVED FOR BUILD · Sessions 20–21

**Classification:** Pre-Decisional · Internal Working Document
**Pipeline Position:** Stage 5b · Entry point to the SOVEREIGN pipeline
**CPMI-VRS Certification:** Required before Session 21 closes
**Walkthrough:** C · After Session ~21
**Depends on:** APEX Stage 5a COMPLETE · PPBE governance decisions D-P1 through D-P6

---

## §1 — What FLOWPATH Is and Why It Exists

FLOWPATH is the entry point to the SOVEREIGN pipeline. Every other product in
the platform operates on workflow data — AgentOS executes workflows, APEX analyzes
them, CPMI governs the AI that reasons about them, VIGIL authorizes consequential
actions within them, ARIA Suite monitors compliance with them. But none of those
products knows what workflows actually exist in a given organization until FLOWPATH
elicits them.

FLOWPATH is not a process documentation tool. It is an elicitation product — a
structured interview and mapping system that draws out how an organization actually
operates from the people who do the work. The distinction matters. Process
documentation captures the idealized workflow. FLOWPATH elicits the real one —
the workarounds, the informal handoffs, the judgment calls that experienced staff
make automatically, the steps that exist in practice but not in any manual.

**Three things FLOWPATH produces that no other product can:**

First, it produces machine-readable workflow artifacts that AgentOS can govern and
execute. A workflow elicited by FLOWPATH becomes the executable blueprint that the
rest of the platform runs on. Without FLOWPATH, the platform cannot adapt to an
organization's actual operations — it imposes a generic model and asks the
organization to conform.

Second, it captures the organization's analytical vocabulary, thresholds, and
domain knowledge. What does this program office call a "red flag"? What cost
variance triggers a review? What does "on track" mean in this organization's
context? This vocabulary is what makes APEX's analytical guidance feel like it
understands the program office rather than a generic template. Without this
vocabulary, APEX surfaces findings in its own language; with it, APEX speaks the
language of the organization it serves.

Third, it captures the organization's operational validation cadence — when AI
outputs are reviewed against source data, by whom, on what schedule, before what
decisions. This is the DC-5 requirement from Walkthrough B: the monthly pre-review
validation workflow that makes AI-assisted analysis defensible, not just functional.
FLOWPATH elicits it; APEX executes it.

**The Walkthrough B principle that shapes this spec:**

During Walkthrough B, the Project Principal articulated the platform's core value
proposition in plain language: AI enables the human. Experienced and junior analysts
alike should be guided to the highest-priority findings in their portfolio, able to
verify every AI conclusion against source data, and able to do this work in a
fraction of the time — without learning a new tool, because they can talk to APEX.

FLOWPATH is what makes that possible. APEX can guide an analyst to the right
questions only if it knows what questions matter to this organization. FLOWPATH
is how it learns.

---

## §2 — Pipeline Position and Data Flows

```
[FLOWPATH] → [Intelligence Layer] → CPMI → AgentOS → NEXUS → APEX → ARIA Suite
```

FLOWPATH occupies the first position in the pipeline. Its outputs feed every
downstream product.

**FLOWPATH produces:**
- `WorkflowArtifact` objects — structured, machine-readable workflow definitions
  that AgentOS executes and VIGIL governs
- `OrganizationalVocabulary` records — the domain-specific terms, thresholds,
  and analytical criteria that calibrate APEX's guidance
- `ValidationCadenceRecord` objects — the organization's pre-review validation
  schedule, assigned reviewers, and sign-off requirements (DC-5)
- `DataSourceRegistry` entries — the authoritative source systems (accounting,
  payroll, travel, contract management) that APEX queries for analyst verification
  (DC-6)
- `DependencyMap` objects — inter-workflow dependencies with handoff standards
  and timing requirements (PPBE integration)
- `DecisionCriteriaArtifact` objects — the standards against which programming
  and resource proposals are evaluated (PPBE + COUNSEL integration)

**FLOWPATH consumes:**
- Interview transcripts and workshop outputs (from the elicitation sessions)
- Existing process documentation (as reference only — never as the primary source)
- The SOVEREIGN data dictionary (all FLOWPATH outputs must conform to registered
  entity schemas)

**FLOWPATH does NOT:**
- Execute workflows (that is AgentOS)
- Analyze workflow outputs (that is APEX)
- Govern AI reasoning within workflows (that is CPMI)
- Enforce compliance (that is ARIA Suite)
- Build its own governance, security, or audit infrastructure (inherits all from
  the platform)

---

## §3 — The Three FLOWPATH Elicitation Agents

All three agents must be registered in `Agent_Identity_Standard.md` and committed
before Session 20 opens. This is a hard gate — Constraint #10.

The six FLOWPATH agents registered in the original Agent Identity Standard
(`flowpath.coordinator`, `flowpath.interviewer`, `flowpath.mapper`,
`flowpath.validator`, `flowpath.analyzer`, `flowpath.domain-translator`) remain
the authoritative registry. This spec describes their roles in the context of the
DC-5, DC-6, and DC-7 requirements from Walkthrough B, which extend their scope
beyond the original registration.

### `flowpath.coordinator`

Orchestrates the full elicitation lifecycle. Routes between interviewer, mapper,
validator, analyzer, and domain-translator. Manages session state and produces
the opening and closing summaries for each elicitation session. Does not call
the LLM for reasoning — it is a routing and state management component.

### `flowpath.interviewer`

The primary elicitation agent. Conducts structured multi-turn dialogue with
subject matter experts — program managers, analysts, contracting officers,
financial managers — to surface the actual operational workflow, not the
documented ideal. Applies the Five-Question Completeness Gate before any
workflow artifact is produced.

**DC-7 extension to original scope:** The interviewer also elicits the
organization's analytical vocabulary — the specific terms, thresholds, and
metrics that define what "at risk," "on track," and "needs attention" mean in
this organization's context. This vocabulary output is passed to the
`OrganizationalVocabulary` record and becomes the calibration layer for APEX's
conversational guidance. Without this, APEX speaks generically. With it, APEX
speaks the organization's language.

**DC-5 extension to original scope:** The interviewer also elicits the
organization's operational validation cadence — how often AI outputs are reviewed
against source data, who is responsible for sign-off, and what decisions the
validated output feeds into. This produces a `ValidationCadenceRecord` that APEX
uses to schedule and gate pre-review validation cycles.

### `flowpath.mapper`

Converts interviewer output into structured `WorkflowArtifact` objects conforming
to the SOVEREIGN data dictionary. Applies the domain-translator's vocabulary
corrections before finalizing any artifact. Produces dependency maps and decision
criteria artifacts as well as the primary workflow definition.

**DC-6 extension to original scope:** The mapper also produces the
`DataSourceRegistry` — the enumeration of authoritative source systems that a
given workflow draws on (accounting system, payroll, travel, contract management,
ERP). Each data source is registered with its system name, the data elements it
provides, the update frequency, and the API or integration path. This registry
becomes the APEX data integration specification — it tells APEX where to find the
transaction-level data that analysts need to verify AI findings. Without this,
APEX can only display summary data from the World Model. With it, APEX can guide
an analyst to the actual obligation records, payroll transactions, or contract
modifications that produced a finding.

---

## §4 — The Five-Question Completeness Gate

No workflow artifact may be produced until the Five-Question Completeness Gate
passes. The gate verifies that the elicited workflow is complete enough to be
useful as an executable blueprint.

**The five questions:**

1. **Who does what?** Every step in the workflow must have a named role
   (not a person — a role) responsible for its completion.

2. **In what sequence?** The order of steps must be unambiguous. Parallel
   steps and conditional branches must be explicitly identified.

3. **Under what conditions?** The trigger conditions for each step and the
   decision criteria for each branch must be stated.

4. **With what inputs and outputs?** Every step must identify what it receives
   from the preceding step and what it produces for the following step.

5. **When does it end?** The terminal condition — the state that confirms the
   workflow is complete — must be named and verifiable.

If any question cannot be answered from the elicitation output, the interviewer
returns to the subject matter expert for clarification before the mapper produces
an artifact. A workflow that fails the gate is not a workflow — it is a narrative.

---

## §5 — First-Order Requirements from Walkthrough B

These three requirements from Walkthrough B (DC-5, DC-6, DC-7) are
**first-order architectural requirements** for FLOWPATH, not enhancements to
retrofit. They shape every design decision in this spec. They are not
aspirational — they are the mechanism by which the platform's core value
proposition is delivered.

### DC-5 — Operational Validation Cadence

**The requirement:** APEX's AI analysis must be validated against source data
on a recurring schedule — at month close, before quarterly reviews, before any
significant briefing — by a named analyst who signs off on the results. Gate 2
(Reasoning Transparency) in the APEX CPMI-VRS certification represents developer
validation. DC-5 requires operational validation: the ongoing, scheduled process
by which the organization confirms that AI findings are correct before relying
on them in decisions.

**FLOWPATH's role:** Elicit the organization's existing pre-review validation
practices and formalize them into a `ValidationCadenceRecord`. This record
specifies: what is validated (which programs, which metrics), how often (monthly,
quarterly, before each QPR), who is responsible (named roles), what the sign-off
requires (comparison to source data, a minimum note, a supervisor review), and
what downstream decisions the validated output feeds.

**APEX's role:** Execute the validation cadence on schedule. Surface a
"Pre-Review Validation Required" notice when a validation cycle is due. Guide
the assigned analyst through the comparison of AI findings against source data.
Record sign-off in the Logger as a `HUMAN_DECISION` event with
`decision_type: VALIDATION_SIGN_OFF`. Carry that record into APEX's Gate 2
certification as ongoing operational evidence — not just one-time developer
testing.

**Shell-contract implication:** `VALIDATION_SIGN_OFF` must be added to
`HumanDecisionType`. This requires a GD. Pre-approve for Session 20 or 21.

### DC-6 — Analytical Workspace with Source Data Access

**The requirement:** Every AI finding surfaced by APEX must be backed by
transaction-level source data that an analyst can access directly and verify
independently. Dashboards do not satisfy this requirement. APEX must make its
case — justify every red flag, assessment, and recommendation with data the
human analyst can work through themselves.

This is not about showing more data on screen. It is about giving the analyst
the means to challenge the AI. A senior analyst who doubts a cost variance
finding must be able to pull the underlying obligation records, re-run the
calculation, and confirm or reject the AI's conclusion. A junior analyst who
doesn't yet know what to doubt must be guided to the right questions and shown
the data that would answer them.

**FLOWPATH's role:** During elicitation, the mapper produces a
`DataSourceRegistry` for each workflow — the enumeration of authoritative source
systems (accounting, payroll, travel, contract management) with the data elements,
update frequency, and integration path for each. This registry is the APEX data
integration specification. It tells APEX where to find the transaction-level data
and how to retrieve it.

**APEX's role:** For every AI finding, provide a "Verify in source data" path
that opens an analyst workspace showing the underlying transactions. The workspace
must allow filtering, sorting, and export (CSV for numerical data, per Walkthrough
B AF-2). The analyst must be able to re-run the calculation that produced the
finding and see whether their result matches the AI's. If it does, they have
verified. If it doesn't, they have found an error — and the platform has prevented
a bad finding from reaching a briefing.

**Data integration note:** The initial FLOWPATH build (Sessions 20–21) produces
the `DataSourceRegistry` schema and the elicitation capability. The actual
integration with customer source systems is a deployment-time configuration —
not a build dependency. The APEX data layer is built to accept registered data
sources via the `ApexDataAdapter` interface (already designed for extension in
Session 17). FLOWPATH tells APEX what sources exist; the customer's IT team
connects them.

### DC-7 — Conversational Analyst Interface

**The requirement:** Analysts at all experience levels must be able to interact
with APEX through natural language — asking questions, requesting drill-downs,
and navigating findings without learning query syntax or menu structures. A career
analyst with twenty years of experience and a recently hired analyst must both be
able to do their work effectively, because the AI guides them to the right
questions. The experienced analyst moves faster. The junior analyst gains the
pattern recognition they haven't yet earned through experience.

**The distinction that matters:** This is not a chatbot added to APEX. It is
a domain-calibrated guidance layer — a conversational interface that knows what
questions matter to this specific program office because FLOWPATH elicited the
vocabulary, thresholds, and analytical priorities during onboarding. "What is
driving the cost variance on P-100?" returns a traced, verifiable answer because
the system knows what "cost variance" means in this organization's accounting
system, what the threshold for concern is, and where to find the supporting
transactions.

**FLOWPATH's role:** The `OrganizationalVocabulary` record produced during
elicitation is the calibration layer. It specifies: the domain terms this
organization uses and their definitions, the thresholds that trigger concern for
each metric, the analytical priorities that govern what gets surfaced first, and
the question patterns that experienced analysts in this organization ask most
often. This vocabulary is loaded into APEX at deployment and calibrates the
conversational guidance layer.

**APEX's role:** A conversational interface panel that accepts natural language
input and returns: a direct answer in plain prose, the source data that produced
the answer, a path to verify the answer independently, and a suggested next
question based on what experienced analysts in this organization typically ask
next. All responses traceable to source data. All responses logged. No response
without a citation.

**Intelligence Layer connection:** The conversational interaction data — what
analysts ask, what they verify, what they accept and what they challenge — is
among the richest training signal the Intelligence Layer will receive. Every
question an experienced analyst asks teaches the platform what experienced
analysts notice. Every verification step teaches the platform what trusted
findings look like. FLOWPATH's vocabulary capture is the seed; analyst
interaction is the ongoing learning.

---

## §5a — Individual Workflow Elicitation (Analyst Workstyle Profiles)

The organizational workflow elicitation in §5 captures how the organization
operates as a governance system. But organizations are not monolithic. Two
analysts covering the same program portfolio will honor the same governance
requirements — the same approval gates, the same audit trail, the same
compliance checkpoints — while working quite differently within those boundaries.

A career analyst who has reviewed the same program for three years has developed
a mental model that no process document captures. They know which cost elements
drift first, which contractors tend to slip on third milestones, which flags
are genuine concerns and which are seasonal noise. They have a preferred
sequence — the things they check first, the comparisons they always run, the
questions they ask before escalating. That pattern recognition is the most
valuable analytical asset in the organization, and right now it lives only
in their head.

A recently hired analyst covering the same program has the governance framework
but not the intuition. They follow the process correctly but don't yet know
where to look first or what a "normal" variance looks like for this specific
program. They need guidance that the organizational workflow artifact cannot
provide — because the organizational artifact describes what must be done, not
what experienced people notice.

**FLOWPATH addresses both levels.** Organizational elicitation captures the
governance skeleton. Individual elicitation captures the expertise that makes
that skeleton work in practice.

### The Two-Layer Workflow Model

**Layer 1 — Organizational Workflow (Mandatory)**

The governance-required process: the steps that must be completed, the
approvals that must be obtained, the audit events that must be logged, the
compliance checkpoints that must be passed. This layer is non-negotiable.
Every analyst working within this organization's SOVEREIGN environment operates
within these boundaries. Deviating from Layer 1 is not a workstyle difference —
it is a compliance failure.

Layer 1 is elicited from process owners, compliance officers, and program
executives. It is approved by a named governance authority before being
committed to the workflow registry. It is immutable once approved — changes
require a new elicitation session and a new approval.

**Layer 2 — Individual Workstyle Profile (Advisory)**

The analyst's personal workflow within the governance boundaries: their
preferred sequence of analysis steps, the thresholds that personally trigger
concern for them, the program-specific context they carry from prior reviews,
the questions they ask first when they see a particular type of flag.

Layer 2 does not change what gets logged, what gets approved, or what the
audit trail records. It changes how APEX guides this specific analyst — the
order in which findings are surfaced, the contextual notes that appear alongside
a flag, the "things to check next" suggestions that reflect this analyst's
experience. It is advisory, not mandatory. An analyst can override APEX's
Layer 2 guidance without triggering a compliance event.

Layer 2 is elicited from individual analysts in structured one-on-one sessions.
It is tagged `data_classification: user` — it belongs to the analyst, not
the organization. No organizational administrator can read an individual
analyst's Workstyle Profile. The analyst can update it, reset it, or request
that FLOWPATH re-elicit it at any time.

### The `AnalystWorkstyleProfile` Entity

The structured output of individual workflow elicitation. Fields:

- `analyst_id` — the analyst's SOVEREIGN user identity
- `program_expertise` — programs this analyst has reviewed before, with depth
  rating (current cycle / multiple cycles / long-term familiarity)
- `preferred_analysis_sequence` — the ordered list of steps this analyst
  typically follows when reviewing a program, derived from their elicitation
  responses
- `personal_thresholds` — the specific values at which this analyst becomes
  concerned about a given metric, which may differ from organizational defaults
  (e.g., an analyst who covers high-risk programs may have tighter thresholds
  than the organizational standard)
- `program_context_notes` — the analyst's prior knowledge about specific
  programs: known issues, historical patterns, contractor performance history,
  relationship with the responsible party. These notes travel with the analyst
  across review cycles.
- `vocabulary_extensions` — any terms this analyst uses differently from the
  organizational vocabulary standard (surfaced by `flowpath.domain-translator`
  for reconciliation)
- `last_elicited` — timestamp of the most recent individual elicitation session
- `data_classification: user` — mandatory, non-removable tag

### Balancing Organizational and Individual Layers

FLOWPATH's `flowpath.validator` is responsible for ensuring that individual
Workstyle Profiles operate within organizational workflow boundaries. The
validation rules:

**Individual preferences within mandatory gates:** An analyst's preferred
sequence can reorder the advisory analysis steps, but cannot skip or defer
mandatory approval gates. If the organizational workflow requires VIGIL
authorization before a recommendation is exported, no individual preference
overrides that.

**Personal thresholds must be at least as sensitive as organizational ones:**
An analyst can configure personal thresholds that are tighter than the
organizational standard (triggering concern earlier). They cannot configure
thresholds that are looser (triggering concern later than the organization
requires). If an analyst's personal threshold for cost variance concern is
10 percent but the organizational standard is 8 percent, the validator surfaces
a conflict and asks the analyst to resolve it.

**Vocabulary extensions are flagged, not blocked:** If an analyst uses a term
differently from the organizational vocabulary standard, `flowpath.domain-translator`
flags the divergence. The analyst is shown the organizational definition and
their usage side by side and asked whether they intend a different meaning or
simply use the term informally. If they intend a different meaning, the
divergence is recorded — this is potentially valuable signal about vocabulary
gaps in the organizational standard.

### Collective Intelligence from Individual Profiles

When many individual Workstyle Profiles are aggregated across an organization,
patterns emerge that no single analyst or manager can see:

Experienced analysts covering similar programs tend to check the same things
first — and those patterns, once identified, become the default advisory
sequence for junior analysts covering similar programs. The most valuable
analytical tacit knowledge in the organization becomes visible and transferable.

Personal thresholds that consistently differ from organizational defaults are
a signal about whether the organizational standard is calibrated correctly.
If ten experienced analysts have independently set tighter cost variance
thresholds than the organizational standard, the standard may need review.

Program context notes across multiple analysts reveal institutional knowledge
about specific programs that no single person holds completely — one analyst
knows the contractor's history, another knows the milestone pattern, a third
knows the regulatory constraint that recurs every Q3. Aggregated, they form
a program intelligence profile that APEX can surface to any analyst reviewing
that program.

**Intelligence Layer connection:** Every individual elicitation session, every
Workstyle Profile update, and every instance of an analyst accepting or
overriding APEX's advisory guidance is training signal for the Intelligence
Layer's Judgment Detection component. What do experienced analysts notice that
junior analysts miss? What guidance is accepted versus overridden — and when
overriding correlates with a better outcome, the Intelligence Layer learns from
that too. FLOWPATH's individual elicitation is among the richest inputs the
Intelligence Layer will receive.

### Privacy Architecture

Individual Workstyle Profiles are `data_classification: user` without exception.
They are not accessible to organizational administrators, program managers, or
other analysts. They are not shared with CPMI, VIGIL, or any governance product.
They do not appear in the audit trail beyond the fact of their existence (the
Logger records that a Workstyle Profile exists for a given analyst, not its
contents).

The aggregated patterns surfaced for organizational learning are fully
anonymized — no individual analyst's profile is identifiable in the aggregate.
The Intelligence Layer training signal from individual interaction carries
`data_classification: user` through the entire pipeline.

This privacy architecture is not optional. It is the condition under which
analysts will participate honestly in individual elicitation. If analysts
believe their workstyle data will be used to evaluate their performance or
compare them to colleagues, they will answer elicitation questions strategically
rather than honestly. The profile will be useless. The architecture must make
the privacy guarantee structural and technical, not just policy.

### The Trust Problem — The Most Important Design Constraint in FLOWPATH

Before any elicitation question is asked, FLOWPATH must reckon honestly with
why an analyst might not want to answer.

When an AI system asks an employee to explain exactly how they do their work —
step by step, what they check first, how they reach their conclusions — the
reasonable interpretation is that someone is building a replacement. That fear
has historical basis. Process documentation has been used for automation and
workforce reduction. Employees who have seen this happen, or watched colleagues
experience it, will not participate honestly in an elicitation process they
believe serves that purpose. They will describe the idealized process from the
manual, not how they actually work. The profile will be useless. Worse, it will
be confidently useless — APEX will think it knows how this analyst works and
guide them accordingly, when in fact it knows nothing.

The platform cannot function if FLOWPATH elicitation is perceived as a threat.
And the platform cannot earn trust by making promises. Promises can be broken.
Policy can be changed. The trust must be earned by design — by making the
privacy and the purpose structurally impossible to misuse, not merely
policy-protected.

**This constraint governs every FLOWPATH design decision about individual
elicitation:** how the system presents itself, what questions it asks, how it
asks them, what it does with the answers, and what the analyst can see, change,
and delete about their own profile.

### Four Structural Guarantees

**Guarantee 1 — Purpose transparency, stated honestly before the first question.**

Every individual elicitation session opens with a plain-language statement of
purpose. Not legal language. Not a terms of service. A direct, human statement:

"I'm going to ask you some questions about how you approach your analytical
work. Your answers help APEX guide you to the right questions faster and surface
the things you care about in the order you care about them. Your responses are
visible only to you — not to your manager, not to the platform administrator,
and not to anyone else. They are not used to evaluate your performance. They
are not used to automate or replace your work. They are used to make your work
faster and less frustrating. If at any point you want to stop, or review or
delete what you've told me, you can do that."

This statement is not optional. It is the first output of every individual
elicitation session, every time, without exception. It is not a checkbox the
analyst clicks past. It is written in the dialogue as a direct communication
from the system to the person it is about to ask questions of.

**Guarantee 2 — Structural impossibility of managerial access.**

The privacy guarantee cannot rest on an administrator's choice not to look.
It must be technically enforced:

- `AnalystWorkstyleProfile` entities are stored with `data_classification: user`
  and queryable only by the user they belong to — not by role, not by elevation,
  not by any administrative override.
- The analyst_id in Logger events is hashed before storage — not pseudonymized,
  but one-way hashed with a per-user salt. No platform query can reverse it.
- No API surface in the platform returns another user's Workstyle Profile.
  This is not a permission — it is an absence. The endpoint does not exist.
- Performance management systems, HR systems, and organizational reporting
  systems have no integration path to Workstyle Profile data. The
  `data_classification: user` tag is enforced at the data layer and blocks
  any export path that does not carry the owning user's authentication.

**Guarantee 3 — Genuine voluntary participation with no penalty for declining.**

An analyst who declines individual elicitation receives a platform experience
guided by organizational defaults — the same guidance any new analyst receives
before their profile is built. They do not lose access to any platform feature.
They are not flagged in any system. No notification is sent to any manager or
administrator that they declined.

The choice to participate or not participate is itself private. The platform
records that a Workstyle Profile does not exist for a given analyst, but not
that the analyst was offered elicitation and declined. Those are different facts,
and only the first one is recorded.

Analysts who initially decline can choose to participate later. Analysts who
participate can pause, delete sections of their profile, or delete the entire
profile at any time. Deletion is immediate and complete — not archived, not
recoverable by administrators, not retained in any form beyond the hashed
Logger event that records the profile existed.

**Guarantee 4 — Questions that feel like capability amplification, not
documentation for replacement.**

The way a question is asked signals its purpose. "Describe your complete
process for reviewing a program" feels like process documentation — like
building a manual for someone who will do this work instead of you. "What do
you always check first when you see a cost variance flag?" feels like the
system is trying to understand what you know so it can help you work faster.

Every question `flowpath.interviewer` asks in individual elicitation mode must
be written to the second framing, not the first. The questions surface expertise
and preference — the things an experienced analyst does that make them effective
— not process steps that could be formalized into a procedure.

Specific question types that are prohibited in individual elicitation:
- "Describe all the steps you take to complete [task]" — this is process
  documentation framing
- "How long does it take you to [complete a review]?" — this is productivity
  measurement framing
- "What would you do differently if you had more time?" — this implies the
  current process is deficient

Permitted question types:
- "When you look at a program that's flagged as at risk, what do you look at
  first?" — surfaces expertise and priority
- "Is there a type of finding that you trust immediately versus one you always
  want to verify yourself?" — surfaces calibration and judgment
- "Are there programs in your portfolio where you know the history well enough
  that the context changes how you read the data?" — surfaces program-specific
  knowledge
- "When APEX surfaces a recommendation and you override it, what's usually the
  reason?" — surfaces the gap between platform guidance and expert judgment

The PR-FLOWPATH prompt for individual elicitation mode must be authored with
these constraints explicitly stated. The Governance Agent authors it; the
Project Principal approves it. No individual elicitation session runs on a
prompt that has not been reviewed against these prohibited and permitted
question patterns.

### The Honest Case for Individual Elicitation

If analysts ask why they should participate — which they will, and should —
the honest answer is not reassurance. It is demonstration.

The platform is built on the principle that AI enables the human. Not replaces.
Not documents for future replacement. Enables — makes the analyst faster, gives
the junior analyst the pattern recognition they haven't yet earned, surfaces
the right questions in the order an experienced analyst would ask them.

Individual elicitation is how FLOWPATH learns to do that for this specific
analyst rather than a generic one. An analyst who participates gets a platform
that knows they always check cost elements before milestone status for P-100,
because that's where the risk has historically been. An analyst who doesn't
gets a platform that checks them in a generic order.

The benefit is immediate and personal. The privacy is structural and technical.
The purpose is capability amplification, not documentation.

That case has to be made honestly, by the platform, in plain language, before
the first question is asked. And then the platform has to make it true by
everything it does with the answers.

---

Individual Workstyle Profiles are elicited at three moments:

**Onboarding:** A new analyst's first FLOWPATH session produces an initial
Workstyle Profile based on their background, prior experience, and initial
preferences. This profile starts sparse and grows richer as the analyst
uses the platform and APEX records how they work.

**Post-review reflection:** After completing a significant review cycle, the
analyst is offered a short elicitation session — "Did anything about how
you worked through this review differ from how APEX guided you? Were there
things APEX surfaced too early or too late?" These reflections update the
profile incrementally without requiring a full elicitation session.

**Annual refresh:** A full individual elicitation session offered once per
year, or when the analyst's role or program portfolio changes significantly.
The refresh is offered, not required — the analyst chooses whether to update
their profile.

---

## §6 — FLOWPATH Screens and UI Structure

FLOWPATH presents three primary screens plus a session management interface.
All screens must meet Gap 5 (human readability) and Gap 6 (content type
distinction) standards before Walkthrough C.

### Screen 1 — Elicitation Session Manager

The entry point. Shows all active and completed elicitation sessions for this
organization. Each session is linked to a workflow type (operational, PPBE,
validation cadence, data source inventory). The session manager shows session
status, the subject matter expert who participated, the date, and the completion
status of the Five-Question Gate.

**Gap 6 compliance:**
- Category 2 (blue, permanent): AI disclosure banner — all elicitation
  dialogue is AI-assisted, outputs require human review before committing to
  the workflow artifact registry
- Category 3 (primary): session list and status

### Screen 2 — Elicitation Dialogue Interface

The interview workspace. Shows the multi-turn dialogue between the
`flowpath.interviewer` and the subject matter expert. The interviewer's
questions appear in sequence; the expert's responses are captured and
structured in real time. The Five-Question Gate status is visible throughout
the session so the expert and facilitator know what gaps remain.

**Gap 5 compliance:** The interviewer's questions must be written in plain
language appropriate to the expert's domain. A program manager asked about
workflow steps should not receive questions that reference SOVEREIGN internal
types or data structures.

**Gap 6 compliance:**
- Category 1 (amber): Five-Question Gate failure notices (temporary — resolved
  as gaps are addressed)
- Category 2 (blue): AI disclosure and the reminder that elicitation output
  requires human review before workflow artifact production
- Category 3 (primary): the dialogue and the structured output emerging from it

### Screen 3 — Workflow Artifact Review

The review and approval surface. Shows the structured `WorkflowArtifact` produced
by `flowpath.mapper` from the elicitation output. The reviewing human (typically
the program manager or process owner) can read the artifact in plain prose,
identify any inaccuracies, and approve or return for revision.

**Human approval gate:** No `WorkflowArtifact` is committed to the workflow
registry until a named human reviewer has approved it. The approval is logged
as a `HUMAN_DECISION` event with `decision_type: WORKFLOW_APPROVAL`. This is
Constraint #4 — every human decision event carries `decision_type`.

**Shell-contract implication:** `WORKFLOW_APPROVAL` must be added to
`HumanDecisionType`. This requires a GD. Pre-approve for Session 20.

### Screen 4 — Individual Workstyle Elicitation

A private, user-scoped elicitation interface. Accessible only to the analyst
themselves — not visible to administrators or other users. Presents a structured
dialogue guided by `flowpath.interviewer` operating in individual elicitation
mode: shorter sessions, focused on personal preferences rather than organizational
process, with reflective prompts that help the analyst articulate practices they
may have never needed to explain before.

The interface shows the analyst's current Workstyle Profile (if one exists) and
offers three entry points: initial elicitation (new analysts), post-review
reflection (short update after a significant review), and annual refresh (full
re-elicitation).

Any threshold conflicts identified by `flowpath.validator` are surfaced here in
plain prose: "Your personal cost variance threshold is 10 percent, but the
organizational standard is 8 percent. This means the platform will alert you
later than your colleagues on cost variance findings. Would you like to adjust
your threshold?" The analyst resolves the conflict before the session closes.

**Gap 6 compliance:**
- Category 1 (amber): threshold conflict notices (temporary — resolved before
  session closes), boundary violations
- Category 2 (blue): privacy notice ("Your workstyle profile is visible only to
  you. It is never shared with administrators or used in performance evaluation.")
- Category 3 (primary): the elicitation dialogue and the emerging profile

**Privacy note:** This screen must enforce the `data_classification: user` tag
on all profile data at the rendering layer, not just the data layer. No profile
content should be sent to any Logger event that isn't explicitly user-scoped.

---

## §7 — FLOWPATH in the PPBE Integration

FLOWPATH occupies a central role in the PPBE integration as described in
`SOVEREIGN_PPBE_Integration_Architecture_Draft1.md`. This section summarizes
FLOWPATH's PPBE-specific responsibilities.

FLOWPATH elicits and produces four PPBE-specific artifact types in addition to
its general workflow elicitation capability:

**Phase Workflow Artifacts** — one structured workflow per PPBE phase, capturing
who does what, in what sequence, under what conditions, and with what outputs.
These become the executable blueprints that AgentOS governs through the PPBE cycle.

**Dependency Maps** — explicit documentation of every inter-phase dependency,
including the handoff standard, timing requirement, and quality threshold. These
feed the `ppbe-dependency-tracker` agent.

**Decision Criteria Artifacts** — formal documentation of the standards against
which programming and formulation proposals will be evaluated during PPBE review.
These anchor COUNSEL's decision framing for the four PPBE decision types
(Strategic Priority Ranking, Programming Trade-Off, Phase Transition Authorization,
Evaluation Finding Response).

**Governance Calendar Artifacts** — structured records of the signal conditions
and thresholds that trigger each PPBE governance event. These configure VIGIL's
signal-driven governance behavior for the PPBE authorization tiers.

The PPBE governance decisions (D-P1 through D-P6) must be recorded in the
Integration Brief before any PPBE-specific FLOWPATH build work begins. These
decisions are not FLOWPATH's to make — they require Project Principal approval
in Claude Chat.

---

## §8 — Logger Events (FLOWPATH-Specific)

All Logger events carry `workflow_step_id` (Constraint #6). All human decision
events carry `decision_type` (Constraint #4). No direct Anthropic API calls
(Constraint #5).

The following event types are required for FLOWPATH. These require a GD and
shell-contract change before the Session 20 build. **Pre-approval for GD-18
should be recorded in the Integration Brief before Session 20 opens.**

| Event Type | When Emitted | Required Fields |
|---|---|---|
| `FLOWPATH_SESSION_STARTED` | Elicitation session begins | `session_id`, `workflow_type`, `agent_id`, `workflow_step_id` |
| `FLOWPATH_SESSION_COMPLETE` | Elicitation session ends | `session_id`, `workflow_type`, `gate_passed`, `workflow_step_id` |
| `FLOWPATH_ARTIFACT_PRODUCED` | Mapper produces a workflow artifact | `session_id`, `artifact_type`, `agent_id`, `workflow_step_id` |
| `FLOWPATH_ARTIFACT_APPROVED` | Human reviewer approves artifact | `session_id`, `artifact_type`, `actor`, `actor_name`, `workflow_step_id` |
| `FLOWPATH_GATE_FAILED` | Five-Question Gate fails | `session_id`, `failed_questions`, `workflow_step_id` |
| `FLOWPATH_VOCABULARY_CAPTURED` | OrganizationalVocabulary record produced | `session_id`, `term_count`, `workflow_step_id` |
| `FLOWPATH_DATASOURCE_REGISTERED` | DataSourceRegistry entry added | `source_name`, `source_type`, `workflow_step_id` |
| `FLOWPATH_VALIDATION_CADENCE_SET` | ValidationCadenceRecord produced | `session_id`, `cadence_type`, `workflow_step_id` |
| `FLOWPATH_WORKSTYLE_ELICITED` | AnalystWorkstyleProfile produced or updated | `session_id`, `analyst_id` (hashed), `profile_version`, `workflow_step_id` · **data_classification: user** |
| `FLOWPATH_WORKSTYLE_BOUNDARY_CONFLICT` | Validator finds individual threshold looser than org standard | `session_id`, `conflict_type`, `workflow_step_id` · **data_classification: user** |

**New `HumanDecisionType` members required:**
- `WORKFLOW_APPROVAL` — human reviewer approves a FLOWPATH workflow artifact
- `VALIDATION_SIGN_OFF` — analyst signs off on an APEX pre-review validation cycle

Both must be added to `shell-contract.ts` `HumanDecisionType` and propagated to
`sovereign-data/src/shared-types.ts` (Constraint #11).

**GD-18 Impact Assessment (preliminary):**
- 10 new `SovereignEventType` members — emitted by `module-flowpath` only
  (8 organizational events + 2 individual workstyle events)
- 2 new `HumanDecisionType` members — propagate to `sovereign-data`
- 1 new user-scoped entity: `AnalystWorkstyleProfile` — tagged
  `data_classification: user`; stored in `sovereign-data` alongside `StyleProfile`
- No `AgentClass` change — all six FLOWPATH agents use existing Analytical class
- Additive only — no existing types renamed or removed
- Python logger sync required after GD-18 (Constraint #11)
- **Privacy note:** The two workstyle Logger events carry `data_classification: user`
  and must never appear in platform-wide audit queries without the user filter applied

---

## §9 — CPMI-VRS Certification Requirements for FLOWPATH

CPMI-VRS certification is required before Session 21 closes. FLOWPATH uses AI
(the `flowpath.interviewer` and `flowpath.analyzer`) for elicitation and analysis,
which places it under the CPMI-VRS governance standard.

**Gate 1 (AI Disclosure):** The Elicitation Dialogue Interface must display the
standard Gate 1 banner: all elicitation is AI-assisted, outputs are advisory, and
human review is required before any workflow artifact is committed.

**Gate 2 (Reasoning Transparency):** Three benchmark elicitation scenarios (A, B,
C) must be defined and validated before Walkthrough C. Scenarios:
- Scenario A: complete elicitation of a simple two-step operational workflow
- Scenario B: elicitation of a workflow with a conditional branch and a
  dependency on an external system
- Scenario C: elicitation of a PPBE Phase 1 (Strategic Direction) workflow with
  multiple stakeholders and a governance calendar artifact

All three must produce schema-valid `WorkflowArtifact` outputs and pass the
Five-Question Completeness Gate.

**Gate 3 (Human Attestation):** Project Principal step during Walkthrough C.

**Gate 4 (Monitoring Baseline):** Follows Gate 3.

---

## §10 — Shell-Contract Change — GD-18 (Pre-Approval Required Before Session 20)

GD-18 adds FLOWPATH event types and the two new `HumanDecisionType` members to
`shell-contract.ts`. This must be pre-approved in the Integration Brief before
Session 20 opens, following the same pattern as GD-16 for APEX.

The full GD-18 specification will be produced by the Governance Agent before
Session 20 and committed to `docs/15_FLOWPATH_Architecture.md` (this document,
updated) along with the FLOWPATH prompt specifications and any additional shell
types required during the Session 20 build planning.

---

## §11 — Done Condition

**D-FLOWPATH-1 — Scaffold and schema:**
- `module-flowpath/` directory created with standard SOVEREIGN module structure
- `shell-contract.ts` updated per GD-18, both copies verified, new SHA-256 recorded
- All six FLOWPATH AgentCards active (already registered — activate in code)
- All FLOWPATH prompts approved (prompts for `flowpath.interviewer`,
  `flowpath.validator`, `flowpath.analyzer`, `flowpath.domain-translator`
  authored and approved by Project Principal in Claude Chat before Session 20)
- `OrganizationalVocabulary`, `ValidationCadenceRecord`, `DataSourceRegistry`,
  `WorkflowArtifact` types defined and compile-clean in tsc

**D-FLOWPATH-2 — Elicitation Session Manager (Screen 1):**
- Session list renders with correct status indicators
- Gap 5/6 compliant

**D-FLOWPATH-3 — Elicitation Dialogue Interface (Screen 2):**
- Multi-turn dialogue with `flowpath.interviewer` via `createSovereignClient()`
- Five-Question Gate status visible throughout session
- `FLOWPATH_SESSION_STARTED` and `FLOWPATH_SESSION_COMPLETE` logged correctly

**D-FLOWPATH-4 — Workflow Artifact Production and Review (Screen 3):**
- `flowpath.mapper` produces a valid `WorkflowArtifact` from session output
- Artifact displays in plain prose for human review (Gap 5)
- Human approval gate enforced — `WORKFLOW_APPROVAL` logged before artifact
  is committed to registry
- `OrganizationalVocabulary` record produced alongside the workflow artifact
- `DataSourceRegistry` entries produced (DC-6)
- `ValidationCadenceRecord` produced (DC-5)

**D-FLOWPATH-4a — Individual Workstyle Elicitation (Screen 4):**
- Individual elicitation interface renders for authenticated analyst
- `flowpath.interviewer` conducts individual session in user-scoped mode
- `AnalystWorkstyleProfile` produced and stored with `data_classification: user`
- Boundary validation runs — threshold conflicts surfaced to analyst
- `FLOWPATH_WORKSTYLE_ELICITED` logged with hashed analyst_id
- Profile content not visible to any admin query or platform-wide audit
- Privacy notice (Category 2 blue, permanent) present on all profile screens

**D-FLOWPATH-5 — CPMI-VRS Benchmark Scenarios:**
- Scenarios A, B, C implemented and all produce schema-valid `WorkflowArtifact` outputs
- All pass the Five-Question Completeness Gate

**D-FLOWPATH-6 — Test suite:**
- Minimum 70 tests passing in `module-flowpath/`
- Tests cover: Five-Question Gate enforcement, schema validation, vocabulary
  capture, data source registration, validation cadence record production, human
  approval gate, Logger event emission

---

## §12 — Gap 5 and Gap 6 Compliance

Every FLOWPATH screen must pass the Gap 5 and Gap 6 standards defined in
`docs/14_HumanReviewerStandard.md` before Walkthrough C. Specific requirements:

**Gap 5 — Human Readability:**
- Elicitation questions written in the domain vocabulary of the subject matter
  expert, not SOVEREIGN internal terminology
- Workflow artifacts displayed as readable prose narratives, not data schemas
- Five-Question Gate feedback written as clear, plain-language guidance on what
  information is missing and how to provide it

**Gap 6 — Content Type Distinction:**
- Category 1 (amber): Five-Question Gate failure notices, session status
  warnings, temporary limitations
- Category 2 (blue): AI disclosure banner (always present), reminder that
  artifacts require human approval before committing
- Category 3 (primary): the elicitation dialogue, the emerging workflow
  structure, the artifact for review

---

## §13 — Codebase Facts Specific to FLOWPATH

- **No direct LLM calls.** All interviewer and analyzer calls route through
  `createSovereignClient()`. Prompts (PR-FLOWPATH-001 through PR-FLOWPATH-004)
  are registered before Session 20 opens.

- **ESM / Vite pattern.** `module-flowpath` follows the same pattern as
  `module-cpmi` and `module-apex`: isolated `anthropic-key.ts` reading
  `import.meta.env`, jest-mapped to a stub. Do NOT use `process.env`.

- **Vocabulary is calibration data, not governance data.** The
  `OrganizationalVocabulary` record is tagged `data_classification: user`
  (it reflects how a specific organization thinks). It does NOT belong in the
  World Model. It is stored in `sovereign-data` as a user-scoped entity.

- **DataSourceRegistry entries are configuration, not live connections.**
  FLOWPATH registers that "this organization uses Oracle Financials for obligation
  data." APEX uses that registration to know where to look. The actual API
  connection is deployment-time configuration, not a FLOWPATH build dependency.

- **`AnalystWorkstyleProfile` is `data_classification: user` without exception.**
  It is stored in `sovereign-data` alongside `StyleProfile`. It must never be
  queried without a user filter. It must never appear in any platform-wide audit
  view. It must never be passed to CPMI, VIGIL, or any governance product. The
  Logger events for workstyle elicitation carry `data_classification: user` and
  the analyst_id must be hashed before logging — never stored as a cleartext
  identifier in a platform-wide event.

- **Two-layer workflow validation is `flowpath.validator`'s responsibility.**
  The validator checks that individual Workstyle Profiles do not configure
  thresholds looser than organizational standards before the profile is saved.
  A profile that fails boundary validation is not stored until the analyst
  resolves the conflict. This is enforced at the data layer, not just the UI.

- **FLOWPATH `minimumRole`:** `AGENT_OPERATOR` or above. Program managers
  and analysts participate in elicitation; FLOWPATH does not require PLATFORM_ADMIN.

- **PPBE reserved field names still apply.** Do not use `fiscal_year`,
  `lifecycle_cost_estimate`, `obligation_plan`, or `performance_baseline` in
  any FLOWPATH-specific entity extensions until PPBE governance decisions
  D-P1 through D-P6 are recorded.

---

## §14 — Autonomous Operation Rules for Sessions 20–21

Claude Code MAY decide:
- Implementation details of the three FLOWPATH screens
- Structure of `module-flowpath/` directory and file organization
- Test strategy within `module-flowpath/`
- The internal schema of `WorkflowArtifact` beyond the required top-level fields
- How the Five-Question Gate is evaluated (stateful, scoring, or checklist)

Claude Code MUST stop and document in handoff:
- Any decision about `OrganizationalVocabulary` schema that conflicts with
  how the `StyleProfile` entity is structured in `sovereign-data` (the patterns
  should be consistent)
- Any case where producing a `DataSourceRegistry` requires a live API call
  rather than structured elicitation output
- Any case where the PPBE artifact types (Dependency Map, Decision Criteria
  Artifact, Governance Calendar Artifact) conflict with the general workflow
  artifact schema
- Any shell-contract change beyond GD-18 as pre-approved
- Any case where the `ValidationCadenceRecord` requires a new
  `SovereignEventType` beyond what GD-18 provides

---

## §15 — Session 20–21 Context Package

Claude Code requires these files at session open:

**Governance documents:**
- `SOVEREIGN_Platform_Integration_Brief_v1.NN.md` (current)
- `Agent_Identity_Standard.md` (FLOWPATH agents already registered — verify)
- `SOVEREIGN_Agent_to_Agent_Briefing.md`
- `AGENT_REFERENCE.md`

**Shell and types:**
- `sovereign-shell/shell-contract.ts` (updated per GD-18)

**Architecture specs:**
- `docs/15_FLOWPATH_Architecture.md` (this document — primary build target)
- `docs/14_HumanReviewerStandard.md` (Gap 5/6 standard)
- `docs/13_APEX_Architecture.md` (FLOWPATH feeds APEX — data flow reference)
- `docs/11_AgentOS_Architecture.md` (FLOWPATH workflows execute in AgentOS)
- `SOVEREIGN_PPBE_Integration_Architecture_Draft1.md` (PPBE artifact types)

**Prior session handoff:**
- `SOVEREIGN_SessionNN_Handoff.md` (most recent session — check repo root for current filename)

**Note on gather script file paths:** Before writing any gather script for a
FLOWPATH session, read the prior session's SBOM §New Components and use the exact
filenames Claude Code recorded. The spec uses logical names for files; Claude Code
may name them slightly differently. The SBOM is the source of truth. (Lesson 11 —
AGENT_REFERENCE.md)

**FLOWPATH prompt files** (must be authored and approved before Session 20):
- `docs/flowpath_prompts/` (to be produced by Governance Agent)

---

## §16 — FLOWPATH Agent Registration Update

The six FLOWPATH agents are already registered in `Agent_Identity_Standard.md`
from the original registration (May 2026). Their registration predates this spec.
The following updates to their scope are recorded here for the Session 20 build:

**`flowpath.interviewer` — scope extended:**
Now additionally elicits `OrganizationalVocabulary` (DC-7 calibration data) and
`ValidationCadenceRecord` (DC-5 operational validation schedule). These outputs
are produced alongside the primary elicitation transcript and passed to
`flowpath.mapper` for structuring.

**`flowpath.mapper` — scope extended:**
Now additionally produces `DataSourceRegistry` entries (DC-6 source system
inventory) and `ValidationCadenceRecord` structured objects from interviewer
output. The mapper's output bundle for each session contains: `WorkflowArtifact`,
`OrganizationalVocabulary`, `DataSourceRegistry`, and `ValidationCadenceRecord`.

**`flowpath.validator` — unchanged:**
Still runs the Five-Question Completeness Gate on mapper output before any
artifact is presented for human review.

**`flowpath.analyzer` — unchanged:**
Still produces bottleneck and exception findings from mapped workflow output.

**`flowpath.domain-translator` — unchanged:**
Still reviews all inter-agent content for vocabulary divergence and maintains
the terminology flag log.

**`flowpath.coordinator` — unchanged:**
Still orchestrates the full elicitation lifecycle.

All six agents use existing `Analytical` class. No new AgentClass required.
No shell-contract change required for agent registration.

---

*SOVEREIGN Platform — FLOWPATH Architecture Specification*
*Document 15 · Authored June 26, 2026 · Governance Agent*
*Pre-Decisional · Internal Working Document*
*Commit to `docs/15_FLOWPATH_Architecture.md` in monorepo root*
*Supersedes the FLOWPATH scope implied by the original Agent Identity Standard*
