# SOVEREIGN Platform — Human Reviewer Experience Standard
## Document 14 · Platform-Wide Design Standard
## Authored: June 25, 2026 · Status: APPROVED · Effective: Session 17

**Classification:** Pre-Decisional · Internal Working Document
**Authority:** Project Principal · SOVEREIGN Platform Governance Authority
**Origin:** Walkthrough A — Gap 5 and Gap 6 (June 25, 2026)
**Scope:** All six primary products · All four companion modules · Every walkthrough
**Enforcement:** No product passes Walkthrough validation without meeting this standard

---

## §1 — Why This Standard Exists

Walkthrough A found things that 934 automated tests could not find. Tests verify
that a system works. They cannot verify that a human can understand what the system
is telling them.

Two of the six gaps identified in Walkthrough A are not bugs. They are design
failures that would have propagated forward into every remaining product if not
addressed now. Screenshot 9 (the VIGIL P1 approval brief) and Screenshot 11 (the
CPMI reasoning chain output) demonstrated both failures simultaneously: an
AI-generated output written in machine-style formatting that a non-technical
reviewer would struggle to parse, with system status notices and governance
guardrails visually intermixed with the substantive content the reviewer was
supposed to act on.

The SOVEREIGN Platform serves federal program managers, defense program offices,
and enterprise governance professionals. These are not software engineers. They are
experienced domain experts who make consequential decisions — model deployments,
resource commitments, program re-baselines, regulatory certifications — based on
what the platform surfaces to them. If the platform cannot communicate clearly with
a non-technical reviewer, the governance architecture fails at the moment it matters
most: when a human is trying to decide.

This document defines two platform-wide standards — Gap 5 (Human Readability) and
Gap 6 (Content Type Distinction) — with enough specificity that they can be
implemented consistently by Claude Code, verified during walkthroughs, and enforced
as pass/fail gates at each validation.

---

## §2 — The Two Standards

### Standard 1 — Human Readability (Gap 5)

**Statement:** All text surfaced to a human reviewer by the SOVEREIGN Platform must
be written in plain prose readable by a non-technical domain expert. Compressed
machine-style formatting is prohibited in any output that a human reviewer sees.

**What this standard requires:**

Every AI-generated output, system message, brief, reasoning chain, constraint
explanation, recommendation, risk finding, and governance notice that appears on
a screen must be written in complete sentences with clear, plain-language
explanations. A reviewer who is expert in their domain — program management,
federal acquisition, defense operations — but not in software systems or AI must
be able to read and act on the output without translation assistance.

**What this standard prohibits:**

The following formatting patterns are prohibited in any human-facing output. They
may appear in internal data structures, Logger events, and machine-to-machine
communication — but not on screens.

Colon-separated field-value pairs as the primary means of conveying information:
```
PROHIBITED:  Risk: M3_DELAY | Severity: P1 | Delta: -2W | Owner: PM-Jones
REQUIRED:    Milestone 3 is two weeks behind schedule. This is a Priority 1 risk.
             The responsible party is Program Manager Jones.
```

Semicolon-chained lists where each item needs individual explanation:
```
PROHIBITED:  Constraints: FAR 15.2; DoD 5000.02; OMB A-11; ADA
REQUIRED:    This program operates under four regulatory constraints: the Federal
             Acquisition Regulation (FAR 15.2), DoD Instruction 5000.02, OMB
             Circular A-11, and the Anti-Deficiency Act. Each imposes specific
             obligations on program execution that are described below.
```

Shorthand abbreviations that a non-software-specialist would not immediately
recognize:
```
PROHIBITED:  Status: EXEC_62_PCT | M3: AT_RISK | CVA: UNFAV_TREND
REQUIRED:    The program is 62 percent through its execution phase. Milestone 3
             is at risk due to a two-week schedule slip. Cost variance is trending
             unfavorably, meaning actual costs are running higher than planned.
```

Structured output labels that create the appearance of a form rather than a
communication:
```
PROHIBITED:  [STATIC] Brief assembled from raw request fields. Live service
             unavailable. Reversibility: not stated.
REQUIRED:    This brief was prepared from the available request information
             because the live analysis service is temporarily unavailable. The
             request does not state whether this action can be reversed. A
             reviewer should confirm reversibility before approving.
```

**The test for compliance:**

Before any screen is submitted for walkthrough validation, apply this test: read
the output aloud as if presenting it verbally to a federal program manager who
has never seen the platform before. If any sentence would require you to pause
and explain what it means, the output fails this standard.

---

### Standard 2 — Content Type Distinction (Gap 6)

**Statement:** Every screen that surfaces text to a human reviewer must visually
distinguish between three categories of content. A reviewer must be able to orient
themselves within five seconds of opening any screen.

**The three content categories:**

**Category 1 — Temporary System Status Notices**

Content that reflects the current operational state of the platform and may change
as conditions change. These are notices, not policies. They are present because
something is currently true, not because it is always true. When the condition
resolves, the notice disappears or changes.

Examples:
- "The live reasoning service is currently unavailable. This brief was prepared
  from available data as a fallback."
- "Report generation is paused because a CPMI monitoring threshold was breached.
  A reviewer must clear the alert in VIGIL before generation can continue."
- "This screen is not yet active. Execution monitoring will be available when PPBE
  Phase II is integrated."

Visual treatment: amber or yellow background, clearly dismissible or time-bounded
framing, positioned above the primary content area so it does not obscure the
content a reviewer needs to act on.

**Category 2 — Permanent Governance Guardrails**

Content that is always present by design, regardless of program state, session
state, or operational conditions. These are not notices about current limitations.
They are statements of what the platform always does and always enforces. They do
not disappear when conditions change.

Examples:
- "All analysis produced by this product is AI-assisted. Outputs are advisory
  until reviewed and approved by a qualified human reviewer." (CPMI-VRS Gate 1)
- "This platform processes UNCLASSIFIED data only. Attempts to process CUI,
  SECRET, or TOP SECRET data will be blocked and logged." (GD-10)
- "No agent action executes without a logged human decision." (AgentOS governance
  statement)

Visual treatment: blue background or left border, labeled as a governance notice,
always visible but not dominant, not dismissible. A reviewer who has used the
platform for months will recognize these banners and look past them. A reviewer
opening the platform for the first time will read them and understand the
governance context.

**Category 3 — Substantive Operational Content**

The content the reviewer is actually here to act on. Program status, risk findings,
approval briefs, reasoning chain outputs, report sections, world model data. This
is the reason the reviewer opened the screen. It must be visually primary.

Visual treatment: the default screen content — no colored background, no banner
framing. Standard typography at full contrast. The absence of Category 1 and 2
styling is itself a signal: this is the content that matters.

**The five-second test:**

Open any SOVEREIGN product screen as if for the first time. Within five seconds,
a reviewer must be able to answer three questions without scrolling or reading
every word:

1. Is there anything wrong with the system right now that affects what I am
   looking at? (Category 1 — temporary notices, if present)
2. What governance rules always apply to this screen? (Category 2 — permanent
   guardrails, always present)
3. What is the actual content I need to read and decide on? (Category 3 —
   substantive content, visually primary)

If a reviewer cannot answer all three within five seconds, the screen fails this
standard.

---

## §3 — Implementation Requirements by Product

These requirements apply to every product at the stage it is built. They are
not retroactive corrections after the fact — they are build requirements that
Claude Code applies during initial construction.

### NEXUS

**Gap 5 requirements:**
- Request queue table: each entry renders as a brief prose description of the
  request, not as a row of typed fields. "OilShield Q3 Compliance Document Review —
  submitted June 25 — document review type — pending routing" not a table of
  `REQUEST_TYPE: DOC_REVIEW | STATUS: PENDING`.
- Classification boundary banner text must use plain language: "This platform
  processes unclassified data only" not "GD-10: UNCLASSIFIED_ONLY."

**Gap 6 requirements:**
- Category 1: queue rendering failures, submission confirmation states
- Category 2: AI disclosure banner (CPMI-VRS Gate 1), classification boundary
  banner (GD-10) — both always present, blue treatment
- Category 3: the request queue and intake form — primary screen content

### AgentOS

**Gap 5 requirements:**
- Task table: task title, classification, agent assignment, and approval status
  rendered in readable prose or clearly labeled plain-language columns, not
  machine-code field pairs.
- Task lifecycle status uses human terms: "Awaiting approval" not "PENDING_VIGIL"

**Gap 6 requirements:**
- Category 1: any state indicating pipeline degradation or service unavailability
- Category 2: governance inheritance banner ("Agents operating in this environment
  inherit SOVEREIGN security and governance constraints") — always present
- Category 3: the task dispatch form and task lifecycle table

### VIGIL

**Gap 5 requirements:**
- Approval brief: every field in an approval brief is rendered as a complete prose
  sentence, not a label-value pair. The reversibility note, agent context, and
  action detail are paragraphs, not fields.
- STATIC fallback label: replaced with a clearly worded prose notice (see
  prohibited example in §2).
- Decision note placeholder: "Describe your reasoning for this decision (required,
  minimum 10 characters)" not "NOTE: required | MIN: 10"

**Gap 6 requirements:**
- Category 1: STATIC brief fallback notice, service unavailability states,
  any triage analysis fallback
- Category 2: "No agent action proceeds without a logged human decision" — always
  present at bottom of every approval brief, styled as governance notice
- Category 3: the approval brief content itself — request detail, action summary,
  agent context — visually primary

### CPMI

**Gap 5 requirements:**
- Reasoning chain output: the six-step reasoning chain is written as connected
  prose paragraphs, not as a structured output schema dump. Context, risk register,
  constraints, options, recommendation, and alternatives are each a labeled section
  with prose content.
- Risk register entries: each risk described in a complete sentence. "The program's
  milestone 3 schedule is currently two weeks behind plan, which the platform
  classifies as a Priority 2 risk" not "M3_DELAY: -2W | P2."
- Constraint entries: each regulatory constraint named in full and briefly explained.
  "Federal Acquisition Regulation section 15.2, which governs source selection
  procedures" not "FAR 15.2."
- STATIC/fallback label: replaced with prose notice (see §2 prohibited examples).
- Gate status text: "Gate 3 is ready for attestation. The benchmark ran three
  scenarios and all passed. Please review the results and provide your attestation
  note below" not "gate3_ready — Gate 3 attestation is available."

**Gap 6 requirements:**
- Category 1: STATIC fallback notice, reasoning service unavailability, any
  degraded-mode indicator
- Category 2: CPMI-VRS Gate 1 governance banner, enhanced monitoring status
  indicator — both always present
- Category 3: the reasoning chain output, world model data, and VRS gate results —
  visually primary

### APEX

**Gap 5 requirements:**
- All status descriptions use complete prose sentences (see §2).
- Risk findings written as described findings, not as field-value pairs.
- `sovereignHold()` explanations: full prose stating what is held, why, and what
  action resolves the hold.
- Report sections: readable by a non-technical reviewer without additional context.
- Provenance panel: each field labeled in plain language ("Source record" not
  "src_ref", "Date last updated" not "ts_updated").
- Program Dossier: the exported document reads as a professional briefing document,
  not a data export. Sections have headings. Content is in prose paragraphs.

**Gap 6 requirements:**
- Category 1: hold states, service fallbacks, Execution Monitoring stub notice
- Category 2: CPMI-VRS Gate 1 governance banner, classification boundary —
  present on Portfolio Dashboard and Report Generation screens
- Category 3: program data, risk findings, report content — visually primary

### FLOWPATH

**Gap 5 requirements (to be specified in FLOWPATH architecture spec):**
- Elicitation output: workflow maps and structured artifacts presented in a form
  that the program office professional who participated in the elicitation can
  recognize as an accurate representation of what they described.
- Domain terminology: FLOWPATH output uses the vocabulary of the organization
  being mapped, not SOVEREIGN-internal vocabulary.

**Gap 6 requirements (to be specified in FLOWPATH architecture spec):**
- Follows the same three-category model as all products.
- FLOWPATH-specific Category 1 notices: elicitation session state, completion
  status, any service limitations during the mapping process.

### ARIA Suite (CLEAR, TRACER, ARC)

**Gap 5 requirements (to be specified in ARIA architecture spec):**
- Compliance findings written as human-readable observations, not as rule
  violation codes. "This program's Q2 obligation rate of 48 percent is 17 points
  below the plan rate of 65 percent, which triggers a CLEAR monitoring alert"
  not "OBL_RATE_VAR: -17PCT | THRESHOLD: EXCEEDED."

**Gap 6 requirements (to be specified in ARIA architecture spec):**
- Follows the same three-category model.
- ARIA-specific Category 2: the regulatory boundary statement ("Compliance
  monitoring is continuous — findings reflect the state of regulatory requirements
  as of the date shown") is a permanent governance guardrail, not a temporary notice.

---

## §4 — Companion Suite Requirements

The companion suite (COUNSEL, SCRIBE, LENS, VIGIL) was built before this standard
was formally written. The following requirements govern any future changes to
companion suite screens and must be applied retroactively in the Session 17 contrast
and readability pass.

**COUNSEL:** Decision Record outputs are structured documents, not data schemas.
Each section (alternatives considered, pre-mortem findings, recommendation) is a
prose paragraph. Labels for each section are plain English headings.

**SCRIBE:** Draft outputs are prose. The drafting mode selector is labeled in
plain language ("Write a program narrative" not "MODE: PROG_NARR"). Export
confirmation is a plain-language statement of what is being exported and where.

**LENS:** Governance explanations are plain prose explanations, not glossary
entries. The daily brief is a readable summary, not a structured report schema.

**VIGIL:** Already covered in §3 above as a primary product.

---

## §5 — Walkthrough Validation Gate

This standard is a pass/fail gate at every walkthrough (A through F). No product
passes its walkthrough validation if either standard is not met.

**The validation process at each walkthrough:**

The Project Principal operates the live platform in a browser. For each screen
reviewed, two checks are applied before moving to the next:

**Gap 5 check:** The Project Principal reads one section of AI-generated or
system-generated output aloud. If any sentence requires explanation or
re-reading to understand, the screen fails Gap 5. The walkthrough report records
the specific output and the nature of the failure.

**Gap 6 check:** The Project Principal opens the screen and, without reading
any content, identifies which visual elements are Category 1 (temporary notices),
Category 2 (permanent guardrails), and Category 3 (substantive content). If any
category cannot be identified within five seconds, or if content from two
categories is visually indistinguishable, the screen fails Gap 6.

**Failure consequence:** A failed screen is recorded in the walkthrough gap log
and becomes a Session N+1 first deliverable before any new product build begins.
The walkthrough is not rerun immediately — the gap is logged, the session
continues, and the fix is verified in the next build session's opening pass.

---

## §6 — The Intelligence Layer Connection

These standards are not merely UX requirements. They are governance requirements
that directly affect the quality of data the Intelligence Layer will eventually
consume.

The Intelligence Layer's Judgment Detection component learns from human decisions
made in VIGIL — specifically from the decision notes reviewers write when
approving, rejecting, or escalating agent actions. If those notes are written in
the same machine-style shorthand that the platform was producing before Walkthrough A,
the Judgment Detection model learns from low-quality, ambiguous decision rationale.

If those notes are written by reviewers who understood what they were approving —
because the approval brief was written in plain prose that clearly explained the
action, the risk, and the context — the Judgment Detection model learns from
high-quality, unambiguous decision rationale.

Human readability is not a UX nicety. It is the mechanism by which human judgment
enters the platform as high-quality training signal. Every Gap 5 and Gap 6 failure
degrades the Intelligence Layer before it is built.

---

## §7 — Relationship to Existing Platform Standards

This standard does not replace or modify any existing platform constraint. It adds
a design requirement layer on top of the existing technical constraints.

The existing constraints that interact with this standard:

**Constraint #5 (no direct LLM calls):** All AI-generated output routes through
`createSovereignClient()`. The prompt registered for each agent (Constraints #9)
is where the Gap 5 plain-prose requirement is enforced at generation time — the
prompt must instruct the agent to produce plain prose. The screen is the second
enforcement point — the UI must render what the agent produces without
reintroducing machine formatting.

**Constraint #4 (every human decision event carries `decision_type`):** The
decision type field is a machine field in the Logger. It does not appear on the
screen as a machine label. The screen shows "What type of decision are you making?"
with human-readable options, not "SELECT decision_type FROM ENUM."

**GD-10 (classification boundary):** The classification boundary notice is a
Category 2 permanent governance guardrail. Its content is written in plain prose
("This platform processes unclassified data only") rather than as a governance
code reference ("GD-10: UNCLASSIFIED_ONLY enforced").

---

## §8 — Version History and Forward Application

This standard takes effect at Session 17. It applies retroactively to all existing
products as part of the Session 17 contrast and readability pass (Gap 3 audit).

For all future products (APEX, FLOWPATH, ARIA Suite, Intelligence Layer): this
standard is a build requirement from the first line of code. It is not a review
to be conducted before walkthrough — it is a design constraint applied during
construction.

Every architecture specification document (docs/NN_ProductName_Architecture.md)
must include a Gap 5 / Gap 6 compliance section that translates these platform-wide
standards into product-specific implementation requirements. APEX (§12 of
`docs/13_APEX_Architecture.md`) is the model for how this is done.

---

## §9 — Governing Note for Claude Code

This document is authoritative for all UI build decisions in SOVEREIGN. When a
build decision involves how text is presented to a human reviewer, this standard
takes precedence over convenience, over brevity, and over any prior pattern in
the codebase that conflicts with it.

Claude Code is not expected to rewrite the entire companion suite in a single
session. The Session 17 Gap 3 contrast audit addresses rendering failures (contrast,
color, legibility). The Gap 5 and Gap 6 prose and categorization requirements are
applied to new APEX screens from day one, and applied to existing screens through
the targeted fixes in Session 17.

When Claude Code encounters a case where implementing this standard conflicts with
a technical constraint or requires a significant deviation from the specified
approach, it surfaces the conflict in the handoff findings rather than resolving it
independently. The standard is not negotiable — the implementation approach may need
Governance Agent review.

---

*SOVEREIGN Platform — Human Reviewer Experience Standard*
*Document 14 · Authored June 25, 2026 · Governance Agent*
*Pre-Decisional · Internal Working Document*
*Commit to `docs/14_HumanReviewerStandard.md` in monorepo root*
*Effective: Session 17 · Applies to all products through Walkthrough F*
