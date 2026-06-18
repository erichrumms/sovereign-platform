# LENS Orientation Module — Architecture Specification
## `03_LENS_Orientation_Module.md` · Version 1.0 · June 18, 2026
**Classification:** Pre-Decisional · Internal Working Document
**Claude Code build reference — load in LENS core build session**
**File location:** `7 - SOVEREIGN/Companion Suite/Governance/` and `~/sovereign-platform/docs/`

---

## §1 — What LENS Is

LENS is the fourth companion module of the SOVEREIGN Platform. Where COUNSEL supports
human decision-making and SCRIBE supports human writing, LENS supports human
understanding — it explains what is happening in the platform, why it matters, and what
the user should do next.

LENS is the primary mitigation for Risk R4 (federal client workforce transition). Its
goal is to reduce the learning curve for users who are new to the platform, new to
AI-assisted operations, or encountering an unfamiliar workflow state. LENS does not
make decisions, draft documents, or take actions. It orients, explains, and answers.

LENS runs inside the unified shell (Option C architecture) at the route `/lens`, mounted
as `module-lens` via `ModuleLoader`. It mounts for any user with `READ_ONLY` role or
above — the broadest access of any companion module, because orientation is appropriate
for every user.

---

## §2 — Three LENS Surfaces

LENS presents three surfaces, each powered by a distinct agent or behavior:

### §2.1 — Governance Explainer (`lens-explainer`)

**What it does:** Answers plain-language questions about how the SOVEREIGN Platform
works — security alerts, agent approvals, governance events, and the roles that govern
them. Grounded exclusively in the two source documents:
- `docs/vigil_alert_response.md`
- `docs/vigil_agent_approvals.md`

**Agent:** `lens-explainer` · **Class: Analytical** (explains; does not take action).
*Note: registered as Operational in the Session 7 scaffold — correct to Analytical here.
Update the agent card in the LENS core build session.*

**Interaction model:** The user types a question in plain language. `lens-explainer`
receives the question plus the two source documents as context, and returns a clear,
accurate explanation. It does not answer questions beyond its source documents — if the
question is out of scope, it says so and suggests where to look.

**Prompt:** PR-LENS-001 (`explainer-system-v1.0.md`) — APPROVED June 18, 2026.

**Three-tier fallback:** Live → cached → static. Static tier returns a neutral
"I'm not able to reach the explanation service right now — here is a summary of the
relevant source document" message plus a condensed plain-language summary of the
relevant source doc content. Never throws.

**Schema:** `LensExplanation` — `question` (string), `answer` (string),
`source_document` (`vigil_alert_response` | `vigil_agent_approvals` | `both` | `none`),
`confidence` (`high` | `medium` | `low`), `out_of_scope` (boolean).
Validated via `validateLensExplanation` before display.

**Logger events:** `AGENT_STEP_START` / `AGENT_STEP_COMPLETE` / `FALLBACK_ACTIVATED`.
`workflow_step_id`: `lens-explain-<uuid>`. No `HUMAN_DECISION` (no human-gated action).

### §2.2 — Pipeline Navigator (`lens-orientation`)

**What it does:** Shows the user where they are in the SOVEREIGN Platform pipeline,
what the current product does, and what comes next. Oriented around the six-product
pipeline: FLOWPATH → [Intelligence Layer] → CPMI → AgentOS → NEXUS/APEX → ARIA Suite.

**Agent:** `lens-orientation` · **Class: Analytical**.

**Interaction model:** The user arrives at LENS from any product. LENS reads
`ctx.navigation.currentProduct` and renders an orientation panel showing:
- The current product's role in the pipeline
- What this product's outputs feed into
- What the user is expected to do here
- A plain-language explanation of what AI agents are doing in this product (if any)

This surface makes no LLM call — it renders from a static product knowledge base
built from the Integration Brief's pipeline description and the six product summaries.
PR-LENS-002 (orientation system prompt) is deferred — if a dynamic orientation
surface is needed later, it would use this agent.

**Logger events:** None for static renders. If an LLM call is added later,
`AGENT_STEP_START` / `AGENT_STEP_COMPLETE` apply.

### §2.3 — AI Transparency Panel (no agent — static render)

**What it does:** Shows the user a plain-language account of what AI agents have
done in the current session — what they were asked, what they produced, whether they
operated live or in fallback mode, and what a human decided.

**Data source:** Logger events from `ctx.logger` in the current session —
specifically `AGENT_STEP_COMPLETE` and `HUMAN_DECISION` events. No LLM call.

**Interaction model:** The panel reads the session's Logger event stream and
renders a human-readable timeline: "At 2:14 PM, the COUNSEL analysis agent analyzed
your program narrative. It operated at full capacity. You reviewed the analysis and
approved the decision at 2:22 PM." Events with no human-readable summary are
suppressed. Fallback events render as "The agent operated in offline mode."

**Logger events:** None (read-only).

---

## §3 — Data Model

### LensExplanation (canonical `@sovereign/data` entity)

```typescript
interface LensExplanation {
  question: string;
  answer: string;
  source_document: 'vigil_alert_response' | 'vigil_agent_approvals' | 'both' | 'none';
  confidence: 'high' | 'medium' | 'low';
  out_of_scope: boolean;
}
```

Validated by `validateLensExplanation` (to be added to `sovereign-data` in the LENS
core build session). Field names must not be redefined locally (Constraint #2).

### ProductOrientation (module-local — not a canonical entity)

```typescript
interface ProductOrientation {
  product: SovereignProduct;
  role_in_pipeline: string;
  feeds_into: SovereignProduct[];
  receives_from: SovereignProduct[];
  user_action: string;
  active_agents: string[];
}
```

This is a static knowledge object, not a `@sovereign/data` entity — it does not
cross product boundaries or require canonical validation.

---

## §4 — Module Structure

```
module-lens/
├── package.json
├── tsconfig.json
├── src/
│   ├── index.ts                    ← SovereignModuleContract (scaffold; update agent class)
│   ├── LensApp.tsx                 ← shell: three surface tabs
│   ├── GovernanceExplainer.tsx     ← §2.1 — LENS core
│   ├── PipelineNavigator.tsx       ← §2.2 — LENS core
│   ├── AITransparencyPanel.tsx     ← §2.3 — LENS core
│   ├── lens-contract.ts            ← LensExplanation schema + validator + PR binding
│   ├── explanation-engine.ts       ← three-tier fallback
│   ├── useExplanation.ts           ← hook: one createSovereignClient() per question
│   ├── orientation-data.ts         ← static ProductOrientation knowledge base
│   └── prompts/
│       └── explainer-system.prompt.ts   ← runtime copy of PR-LENS-001 (create this session)
├── prompts/
│   ├── explainer-system-v1.0.md    ← PR-LENS-001 (APPROVED — scaffold)
│   └── CHANGELOG.md
└── tests/
    ├── lens-contract.test.ts
    ├── explanation-engine.test.ts
    ├── useExplanation.test.tsx
    ├── GovernanceExplainer.test.tsx
    ├── PipelineNavigator.test.tsx
    ├── AITransparencyPanel.test.tsx
    └── [setup-dom.ts, test-helpers.tsx]
```

---

## §5 — Build Sequence (LENS core session)

Follow the COUNSEL/SCRIBE/VIGIL scaffold→core sequence. Build one component at a time
with Project Principal confirmation between each.

**D1 — Governance Explainer**
1. Add `LensExplanation` to `sovereign-data` and `validateLensExplanation`
2. `lens-contract.ts` — schema, validator, PR_LENS_001 binding
3. `explanation-engine.ts` — three-tier fallback with static summaries per source doc
4. `useExplanation.ts` — one `createSovereignClient()` per question, Logger emission
5. `GovernanceExplainer.tsx` — question input → answer display
6. `src/prompts/explainer-system.prompt.ts` — runtime copy of PR-LENS-001
7. Update `index.ts` — correct `lens-explainer` class to Analytical
8. Tests

**D2 — Pipeline Navigator**
1. `orientation-data.ts` — static `ProductOrientation` knowledge base (six products)
2. `PipelineNavigator.tsx` — reads `ctx.navigation.currentProduct`, renders panel
3. Tests

**D3 — AI Transparency Panel**
1. `AITransparencyPanel.tsx` — reads Logger event stream, renders timeline
2. Tests

---

## §6 — Constraints and Integration Notes

**No shell-contract change required.** LENS is already in `SovereignProduct` (GD-5).
`AGENT_STEP_*` and `FALLBACK_ACTIVATED` are already approved event types. No new
`SovereignEventType` needed.

**`sovereign-data` addition required.** `LensExplanation` and `validateLensExplanation`
must be added to the `sovereign-data` package in the LENS core build session. This
follows the same pattern as `StyleProfile` / `validateStyleProfile` in Session 6.

**Source documents are the only grounding for `lens-explainer`.** It must not
answer questions beyond `vigil_alert_response.md` and `vigil_agent_approvals.md`.
Out-of-scope questions receive an honest "I can only explain VIGIL alert response and
agent approval topics" response.

**`lens-orientation` makes no LLM call** in the initial build. PR-LENS-002 is deferred.
If a dynamic orientation surface is added later, author and register PR-LENS-002 first
(same prompt governance protocol as all other prompts).

**AI Transparency Panel is read-only.** It reads Logger events from the current session
context. It does not write, emit, or modify any state.

**`minimumRole: READ_ONLY` is correct for LENS.** No structural mount gate (unlike
VIGIL). Decision 24 remains open for all READ_ONLY modules.

---

## §7 — Intelligence Layer Exposure

LENS surfaces human behavior that is valuable for the Intelligence Layer:

- Questions asked of `lens-explainer` — indicates which governance concepts users
  find opaque (IL Judgment Detection: what humans need explained before deciding)
- Pipeline Navigator views — indicates where users pause to orient (IL Task
  Decomposition Engine: workflow comprehension patterns)
- AI Transparency Panel engagement — indicates how closely users scrutinize agent
  actions (IL Automatability Scorer: human oversight intensity)

None of these require new `SovereignEventType` values beyond what is already approved.
`AGENT_STEP_COMPLETE` events from `lens-explainer` carry `workflow_step_id` — sufficient
for IL indexing.

---

*03_LENS_Orientation_Module.md · Version 1.0 · June 18, 2026*
*LENS architecture specification — load in LENS core build session alongside Integration Brief*
*Pre-Decisional · Internal Working Document*
