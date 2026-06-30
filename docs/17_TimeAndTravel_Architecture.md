# SOVEREIGN Platform — Time & Travel Workflow Layer Architecture
## docs/17_TimeAndTravel_Architecture.md

**Version:** 1.0
**Date:** June 29, 2026
**Classification:** Pre-Decisional · Internal Working Document
**Status:** APPROVED — commit to `docs/` before Time & Travel Phase I build opens
**Governing Document:** SOVEREIGN Platform Integration Brief v1.34
**Governance Decisions:** D-TT1 through D-TT6 (June 29, 2026)
**Build Sessions:** After Stage 6 (ARIA Suite) complete and Walkthrough D done

---

## 1. What Time & Travel Is

Time & Travel is a governed workflow layer — not a new product — that brings two
AI-enabled administrative tools into the SOVEREIGN Platform:

**The Travel Management Tool** automates policy compliance analysis for travel
requests, routes approvals to the correct authority level, and pre-drafts all
associated communications. It eliminates wrong-authority approvals structurally
and reduces travel approval cycle time by approximately 90%.

**The Time & Expense Tool** detects labor charging errors and compliance gaps in
time records, communicates correction requirements to employees, and escalates
recurring issues — all before a manager opens a single record. It transforms
reactive, document-by-document review into proactive, pre-populated queue management.

**The governing principle across both tools:** The system prepares. The human decides.

No approval, denial, correction, or escalation is automated. Every consequential
action is a human decision. What changes is the time required to make a well-informed
decision and the consistency with which policy is applied across the organization.

---

## 2. Pipeline Position

Time & Travel is a workflow layer, not a pipeline stage. It runs on top of existing
SOVEREIGN products rather than occupying its own position in the pipeline:

```
FLOWPATH (policy elicitation) → Time & Travel compliance engines
                                → NEXUS (queue management)
                                → SCRIBE (communication drafting)
                                → VIGIL (escalation authorization)
                                → ARIA Suite (federal compliance)
                                → APEX (analytics)
                                → COUNSEL (high-stakes decisions)
```

No new module directory. No new shell route. No new pipeline position.

---

## 3. The Eight Agents

All eight agents are registered in `Agent_Identity_Standard.md`. Four are
deterministic (no LLM, no prompt). Two require prompt approval before their build
sessions. Two are monitoring-only with no communication authority.

| Agent ID | Class | LLM | Build Phase |
|---|---|---|---|
| `tt.travel-compliance-engine` | Governance | No | Phase I |
| `tt.travel-router` | Operational | No | Phase I |
| `tt.time-compliance-engine` | Governance | No | Phase I |
| `tt.pattern-analyst` | Monitoring | No | Phase I |
| `tt.escalation-monitor` | Monitoring | No | Phase I |
| `tt.audit-reporter` | Governance | No | Phase I |
| `tt.travel-drafter` | Operational | Yes | Phase II — prompt required |
| `tt.time-drafter` | Operational | Yes | Phase II — prompt required |

**Critical design note:** The two compliance engines (`tt.travel-compliance-engine`
and `tt.time-compliance-engine`) are fully deterministic — same design as
`aria.rules-engine`. They do not call `sovereign-api-client`. Same input always
produces same output. This is a deliberate design choice that ensures auditability,
predictability, and maintainability. Policy changes are implemented by running a new
FLOWPATH elicitation session — not by retraining a model.

---

## 4. FLOWPATH Integration — Policy Rule Elicitation

FLOWPATH is the entry point for Time & Travel rule configuration. This is the
architectural decision that makes policy changes a business process rather than a
development cycle.

### Travel Policy Elicitation

A FLOWPATH session with travel policy owners produces a `TravelPolicy` entity
containing the configurable rule set:

**Hard exception rules (override cost-based routing regardless of dollar amount):**
- Personal day inclusion
- International destination
- Special authority travel categories

**Routing rules (cost-based thresholds per authority level):**
- Manager-level approval threshold (dollar amount)
- Director-level approval threshold
- Executive-level approval threshold

**Soft flags (require awareness but do not escalate authority):**
- Advance booking window thresholds (14+ days / 7–13 days / < 7 days / < 48 hours)
- Conference or training fee threshold
- Budget proximity percentage

**Output:** A validated `TravelPolicy` entity committed to the data dictionary.
`tt.travel-compliance-engine` loads this policy at startup.

### Time & Expense Policy Elicitation

A FLOWPATH session with finance and compliance owners produces the time and expense
rule configuration:

- Overtime threshold (daily and weekly hours)
- Holiday direct charge definition
- Authorized charge account lists per employee role
- Recurrence threshold (which occurrence triggers formal escalation)
- Pattern drift threshold (percentage deviation from baseline)
- Period hour minimum per employment classification

**Output:** A validated time and expense policy configuration committed to the data
dictionary. `tt.time-compliance-engine` loads this configuration at startup.

### Policy Update Process

When organizational policy changes, policy owners run a new FLOWPATH elicitation
session. The updated `TravelPolicy` or time policy configuration is validated and
committed. The compliance engines load the updated policy at their next startup. No
code change. No development cycle.

---

## 5. Travel Management Tool — Detailed Design

### 5.1 Submission Interface

Staff members submit travel requests through NEXUS. The submission captures:
- Destination, travel dates, mission purpose
- Itemized cost breakdown (airfare, hotel, per diem, ground, registration fees)
- Exception flags (personal day, international, special authority categories)
- Justification narrative

Real-time policy preview during submission: as the form is completed,
`tt.travel-compliance-engine` evaluates the current state and surfaces which
requirements are met and which may trigger escalation. Travelers see potential
issues at the moment they arise.

### 5.2 Compliance Engine Evaluation

`tt.travel-compliance-engine` evaluates the submitted request against the active
`TravelPolicy`. Advance booking window adjusts review intensity:

| Lead Time | Indicative Exception Rate | Behavior |
|---|---|---|
| 14+ days | < 5% | Standard compliance check |
| 7–13 days | ~15% | Full analysis; budget proximity emphasized |
| < 7 days | ~35% | Short-notice flag activated |
| < 48 hours | > 60% | Escalation analysis intensified |

### 5.3 Routing Recommendations

Three routing tiers — determined by rule evaluation, not approver judgment:

**STANDARD:** All policy rules satisfied. No exceptions. Compliant for manager-level
approval.

**FLAGGED:** Soft flags present but no hard exceptions requiring elevated authority.
Manager may approve; flags are disclosed and documented.

**ESCALATE:** Hard exception present, or cost exceeds manager-level threshold.
Routing to director or executive level required.

`tt.travel-router` executes the routing in NEXUS based on the engine's output.

### 5.4 Communication Templates (Travel)

`tt.travel-drafter` pre-populates four templates before the approver opens the record:

1. **Approval Notice** — confirms authorization; notes any conditions
2. **Additional Information Request** — targets the specific unclear field
3. **Escalation Notice** — informs traveler of higher-authority routing
4. **Denial Notice** — formal denial with exact rule citation and options

Manager reviews, adjusts if needed, copies, sends. Average time to send: under 60
seconds. The tool name never appears in outgoing communications.

### 5.5 Federal Travel Integration

For federal deployments, `tt.travel-compliance-engine` evaluates requests against
both internal `TravelPolicy` and the applicable federal travel framework
simultaneously:

- GSA per diem rates by city (checked against hotel and per diem line items)
- Federal Travel Regulation requirements
- Grant-specific travel requirements where applicable

A request that clears internal policy but conflicts with federal regulations is
flagged before the traveler commits to a booking. ARIA Suite's CLEAR component
provides the ongoing regulatory compliance monitoring and export certification for
federal audit documentation.

---

## 6. Time & Expense Tool — Detailed Design

### 6.1 Ten Rule Categories

`tt.time-compliance-engine` evaluates every employee time record against ten
categories:

| Rule | Severity | Default Response |
|---|---|---|
| Unauthorized Charge Account | Error | Correction notice — required |
| Budget Exhaustion | Error | Correction notice — required |
| Direct/Indirect Mismatch | Error | Correction notice — required |
| Overtime Threshold | Warning | Clarification request |
| Holiday Direct Charge | Warning | Clarification request |
| Missing Hours | Warning | Clarification request |
| Justification Absence | Warning | Justification request |
| Off-Schedule Submission | Warning | Clarification request |
| Period Hour Minimum | Warning | Clarification request |
| Pattern Drift | Informational | Manager dashboard flag only — no automatic employee communication |

**Three severity levels:**
- **Error:** The charge as recorded is incorrect and must be changed before period
  close. Correction notice generated automatically, queued for manager review and send.
- **Warning:** The charge may be legitimate but requires employee response to confirm
  or correct. Clarification or justification request pre-populated.
- **Informational:** Pattern or contextual flag for manager awareness only. No
  automatic employee communication generated.

### 6.2 Recurrence Tracking

`tt.escalation-monitor` tracks rule trigger history per employee across a rolling
multi-period window:

| Occurrence | Communication Type |
|---|---|
| First | Standard correction or clarification |
| Second | Standard (recurrence noted) |
| Third and beyond | Formal escalation — routes to VIGIL for authorization |

Formal escalation produces two versions: employee direct and supervisor notification.
Manager selects which to send. Both versions require VIGIL authorization before send.

### 6.3 Pattern Analysis

`tt.pattern-analyst` maintains two analysis levels:
- **Individual baseline:** 4-week rolling average by account category per employee
- **Peer comparison:** Employee charging vs. others in same program or function

Pattern flags are informational only. `tt.pattern-analyst` never generates automatic
employee communications. Individual baseline data is `data_classification: user` —
employee ID hashed before logging, no admin read path.

### 6.4 Communication Templates (Time & Expense)

`tt.time-drafter` pre-populates five templates:

1. **Error Correction Notice** — step-by-step instructions in the specific time
   system; policy section cited; no accusatory language
2. **Clarification Request** — two to three likely explanations offered
3. **Justification Request** — example language plus system-specific instructions
4. **Pattern Flag Notice** — conversational check-in framing; manager notes what
   to verify before sending
5. **Formal Escalation Notice** — two versions (employee + supervisor); cites
   prior occurrence count

Four non-negotiable communication principles: no accusatory language, correction
path always included, policy reference always cited, tool is invisible.

---

## 7. VIGIL Integration

VIGIL gates consequential Time & Travel actions on human authorization:

**Tier B — Escalation authorization:** Any formal escalation notice (employee direct
or supervisor notification) requires manager authorization in the VIGIL Agent
Approval Queue before the communication is sent. `tt.escalation-monitor` routes the
case; the manager approves, rejects, or defers.

**Tier C — Not applicable:** Time & Travel does not involve resource commitments or
budget submissions requiring Tier C authorization. That is PPBE scope.

**VIGIL alert types from Time & Travel:**
- `TT_ESCALATION_ROUTED` — formal escalation requiring manager authorization
- `TT_BUDGET_EXHAUSTION` — charge account at zero remaining budget (P1 alert)
- `TT_AUDIT_DEADLINE` — period close approaching with unresolved flags

---

## 8. SCRIBE Integration

SCRIBE handles all Time & Travel communication drafting through two new drafting
modes added to the existing SCRIBE drafting engine:

- **Travel Management Mode** — four communication templates for travel approvals
- **Time & Expense Mode** — five communication templates for compliance flags

Both modes follow SCRIBE's existing constraints: schema-validated before display,
human-reviewed before send, grounded in governed `TravelRequest` and `ComplianceFlag`
data, traceable to source records. The tool name never appears in outgoing
communications. Exports are gated on human manager action.

---

## 9. ARIA Suite Integration (Federal Deployments)

For federal deployments, ARIA Suite's three components address Time & Travel
compliance:

**CLEAR** monitors travel requests against federal travel regulations continuously —
GSA per diem rates, FTR requirements, grant-specific constraints. A travel request
that clears internal policy but conflicts with federal regulations is flagged at
submission. CLEAR certification is required before any travel approval record is
exported for federal audit purposes.

**TRACER** provides traceability chains for travel approvals — every approval
decision traced to its regulatory basis (internal policy section + applicable FTR
citation). This is the audit answer federal IGs and congressional reviewers require.

**ARC** models the impact of federal travel regulation changes before they take
effect — which requests would be affected, which thresholds shift, what manager
training is required.

---

## 10. APEX Integration

APEX produces the Time & Travel analytics layer:

- Flag volume trends by rule category and time period
- Resolution rates by manager and program
- Pattern drift trends across the workforce
- Period-close compliance dashboards
- Audit preparation metrics (unresolved flags by severity, deadline tracking)
- Travel approval cycle time and escalation rates

These are visible in the APEX portfolio dashboard alongside program analytics.

---

## 11. COUNSEL Integration

COUNSEL supports high-stakes Time & Travel decisions:

- Formal escalations involving personnel matters where the manager needs structured
  decision support before taking action
- Cases where the correct response is genuinely ambiguous (legitimate vs. pattern
  of mischarging)
- Decisions that may have HR, legal, or contractual implications

The manager requests a COUNSEL session for the specific case. COUNSEL produces a
structured Decision Record with alternatives considered, pre-mortem analysis, and
the manager's signed decision. The Decision Record is attached to the
`CorrectionRecord` in the Logger.

---

## 12. Logger Event Types (Time & Travel)

Six new event types extend `sovereign_logger.py` `APPROVED_EVENT_TYPES`. These are
**Logger-only additions — do not add to `shell-contract.ts`.**

```python
# Time & Travel workflow layer event types (added to APPROVED_EVENT_TYPES)
"TT_TRAVEL_COMPLIANCE_CHECK"    # every travel request evaluated by compliance engine
"TT_TRAVEL_ESCALATION_FLAGGED"  # every hard-exception or threshold escalation
"TT_TRAVEL_ROUTED"              # every routing decision with destination authority
"TT_TIME_COMPLIANCE_CHECK"      # every time record period evaluated
"TT_TIME_FLAG_RAISED"           # every rule trigger with severity and recurrence count
"TT_PATTERN_FLAG_RAISED"        # every pattern drift detection surfaced to dashboard
"TT_ESCALATION_TRIGGERED"       # every recurrence threshold breach
"TT_ESCALATION_ROUTED"          # every formal escalation routed to VIGIL
"TT_AUDIT_EXPORT_PRODUCED"      # every audit report generated
"TT_BUDGET_EXHAUSTION"          # charge account at zero budget (P1 VIGIL alert)
"TT_AUDIT_DEADLINE"             # period close approaching with unresolved flags
```

One new `HumanDecisionType` member (requires shell-contract GD when added):
```
"TRAVEL_APPROVAL"               # manager approving/denying/escalating a travel request
"TIME_CORRECTION_SENT"          # manager sending a time record correction communication
"ESCALATION_AUTHORIZED"         # manager authorizing a formal escalation notice
```

**Note:** The three `HumanDecisionType` additions above require a shell-contract
change (GD) before the Time & Travel build session that needs them. Unlike the
Logger event types, `HumanDecisionType` is part of the shell contract. This GD
will be raised and pre-approved before the relevant build session opens — it is
not pre-approved by this architecture document.

---

## 13. Shell-Contract Impact

**Current assessment: no shell-contract change required for Phase I.**

Phase I builds the deterministic engines, queue management, and VIGIL/APEX
integration. None of these require new `SovereignEventType`, `HumanDecisionType`,
or shell context exports beyond what already exists.

**Phase II (communication drafting) will require a GD** for the three
`HumanDecisionType` additions listed in §12. This GD will be authored and
pre-approved in Claude Chat before Phase II opens. The pattern is identical to
GD-20 for ARIA Suite.

If any Phase I build reveals an unanticipated shell-contract need: STOP. Surface
in handoff. Do not act without a GD.

---

## 14. Build Sequence

### Phase I — Core Engines and Queue Management

Scope (one or two build sessions after Walkthrough D):
- Six deterministic agents implemented and carded
- NEXUS travel request queue and time/expense flag queue
- `tt.travel-compliance-engine` and `tt.time-compliance-engine` with FLOWPATH-loaded
  policy configuration
- `tt.pattern-analyst` individual and peer baseline tracking
- `tt.escalation-monitor` recurrence tracking and VIGIL routing
- `tt.audit-reporter` period-close and session exports
- VIGIL integration (escalation authorization tier)
- APEX dashboard (flag volume, resolution rates, pattern trends)
- Logger event types added to `sovereign_logger.py`
- Real-time policy preview during NEXUS submission

**Done condition for Phase I:** Travel request submitted in NEXUS → compliance
engine evaluates → routing decision produced → correct authority queue populated.
Time record period evaluated → flag raised with correct severity and recurrence
count → manager dashboard populated. VIGIL authorization gate confirmed for formal
escalations. All tests passing.

### Phase II — Communication Drafting

Scope (one build session, after Phase I complete):
- GD for `HumanDecisionType` additions pre-approved before session opens
- `tt.travel-drafter` — four travel communication modes in SCRIBE
- `tt.time-drafter` — five time/expense communication modes in SCRIBE
- Manager review interface — split-panel queue with pre-populated analysis and draft
- ARIA Suite CLEAR certification for federal audit export (if federal deployment)
- Complete end-to-end test: travel request → compliance check → draft communication →
  manager review → send

---

## 15. Autonomous Operation Rules (Build Sessions)

**Claude Code may decide independently:**
- Internal component structure within the Time & Travel workflow layer
- Test file organization within established patterns
- Order of Phase I deliverables if sequence is ambiguous given actual codebase state

**Claude Code must surface and stop for:**
- Any discovery that Phase I requires a shell-contract change
- Any discovery that a deterministic agent needs to call `sovereign-api-client`
- Any policy rule configuration that cannot be represented as a FLOWPATH elicitation
  output
- Any VIGIL integration requiring changes to the VIGIL alert schema beyond
  `sourceProduct: "TIME_TRAVEL"` (verify `SovereignProduct` includes this value)
- Agent count discrepancy at session open

---

*Time & Travel Workflow Layer Architecture · docs/17_TimeAndTravel_Architecture.md*
*Version 1.0 · June 29, 2026*
*Pre-Decisional · Internal Working Document*
*Commit to `docs/` before Time & Travel Phase I build opens*
