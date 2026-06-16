# SOVEREIGN Platform — Visual Design Summary
**UI/UX Design System Reference | All Products and Shell**
Version 2.0 | May 2026

---

## 1. Platform Design Philosophy

SOVEREIGN is a federal enterprise platform. Its visual design must communicate competence, trustworthiness, and operational clarity. The design system serves three goals:

1. **Credibility** — looks like a system federal buyers can trust with sensitive operations
2. **Legibility** — dense information rendered cleanly; users can find what they need under operational pressure
3. **Consistency** — users moving between products feel they are in one platform, not six separate tools

The approved presentation palette (from the SOVEREIGN platform deck) is the authoritative source for external-facing materials. Product-specific palettes govern the product UIs.

---

## 2. Platform Presentation Palette (Shell and Marketing)

Used in: sovereign-shell navigation, platform-level dashboards, presentations, print materials.

| Token | Hex | Usage |
|---|---|---|
| `--sovereign-navy` | `#0D1B2A` | Primary dark — dominant (60%), slide backgrounds, headers |
| `--sovereign-steel` | `#1B6CA8` | Steel blue accent (20%), CTAs, active states, borders |
| `--sovereign-teal` | `#1A7A6E` | Secondary accent, AI Services layer, confirmation states |
| `--sovereign-purple` | `#5C3D99` | Tertiary accent, Data Layer, Intelligence Layer references |
| `--sovereign-gold` | `#E8A020` | Highlight sparingly — labels, callouts (dark backgrounds) |
| `--sovereign-gold-print` | `#B07010` | Gold on white backgrounds (print-friendly version) |
| `--sovereign-ice` | `#D6E8F7` | Light blue — secondary text on dark backgrounds |
| `--sovereign-white` | `#FFFFFF` | Text on dark, card backgrounds |
| `--sovereign-mid` | `#8FA4B8` | Supporting text, subtitles |
| `--sovereign-light-bg` | `#F2F6FB` | Light slide backgrounds, print version |
| `--sovereign-border` | `#C8D8E8` | Borders on light backgrounds |

**Print / ink-efficient version:** All backgrounds white. Accent strips only (7pt top rule, left card strips). Panel fills at ~8% saturation (`#EBF2F9`, `#EAF5F3`, `#F0EDF8`). All body text near-black (`#1C2B3A`).

**Typography (presentation):** Trebuchet MS (headers) · Calibri (body)

---

## 3. Product-Specific Design Systems

### 3.1 FLOWPATH Design System (Stable — Do Not Change)

**Design mandate:** Dark enterprise. Federal AI platform aesthetic.

| Token | Value | Usage |
|---|---|---|
| Identity purple | `#6B4FA0` | **Structural framing ONLY**: header stripe, active sidebar item, card header left border, page title left border. This is the complete list. |
| Background 0 | `#0D1018` | Outermost background |
| Background 1 | `#13161F` | Sidebar, primary panels |
| Background 2 | `#191D2A` | Cards, inner panels |
| Background 3 | `#252A3A` | Sub-panels, nested components |
| Green (complete) | `#22C55E` | Completed steps, passing gates |
| Amber (warning) | `#F59E0B` | Warnings, pending review |
| Red (escalate) | `#EF4444` | Escalation required, failures |
| Blue (info) | `#3B82F6` | Informational, Lane Owner accent |
| Teal (Lane Owner) | `#14B8A6` | Lane Owner role indicator |

**Typography:** DM Sans (prose, labels, UI text) · DM Mono (data values, IDs, metrics, code)

**Critical identity color rule:** Purple is for structural framing only — header stripe, active sidebar item, card header left border, page title left border. That is the complete list. Any functional meaning (complete, warning, escalate, role) uses a semantic color. A color that means everything means nothing.

**Icon library:** React Icons `fa` set (FontAwesome subset available in sandbox)

**Interaction patterns:**
- ConfirmBar — permanent decision record bar, appears at top of screen on significant decisions
- Five-Question Completeness Gate — interactive checklist in VVR validation
- Role reassignment — interactive with ConfirmBar confirmation
- Domain Translator — standalone showcase with 5 activation points, 3 interactive examples

### 3.2 ARIA Suite Design System (Stable — Do Not Change)

**Three modules, shared nav, two theme families:**

**Shared navigation:** Dark navy `#1E1A3A` — appears identically in ARC, TRACER, and CLEAR. Navigation token must not diverge.

**ARC — Dark Enterprise Theme:**

| Token | Value | Usage |
|---|---|---|
| Background | `#0D1018` stack | Same as FLOWPATH |
| Accent | `#6B4FA0` | Authorization type chips, structural |
| AUDIT_HOLD red | `#EF4444` | Banner, paused chain indicator |
| Anomaly bar green | `#22C55E` | Score 0.00–0.50 (CLEAN) |
| Anomaly bar amber | `#F59E0B` | Score 0.50–0.75 (FLAGGED) |
| Anomaly bar red | `#EF4444` | Score ≥ 0.75 (AUDIT_HOLD) |

**TRACER + CLEAR — Light Enterprise Theme:**

| Token | Value | Usage |
|---|---|---|
| Background | `#F4F5F8` | Page background |
| Primary text | `#1A1A2E` | All body text |
| Accent | `#4a3f8f` | *Note: canonical should be `#6B4FA0` — unify in next pass* |
| Approve green | `#16A34A` | APPROVE recommendation |
| Awareness amber | `#D97706` | APPROVE WITH AWARENESS |
| Escalate red | `#DC2626` | ESCALATE |

**ARIA design canon (enforced structurally):**
- No self-approval: self-approval UI is replaced with an architectural notice component (not a disabled button)
- Role-gated: analyst decision UI is replaced with a role notice component (not hidden or disabled)
- Append-only: every audit panel displays a structural notice confirming immutability

**Known design issue to fix:** Purple hex inconsistency — ARC uses `#6B4FA0`, TRACER/CLEAR use `#4a3f8f`. Canonical is `#6B4FA0`. Unify in next ARIA source file session.

**Typography:** DM Sans + DM Mono (same as FLOWPATH)

### 3.3 NEXUS Design System (Production Target)

No formal visual design summary exists yet. Target characteristics:
- Clean, accessible, government-appropriate UI
- High-density task management view
- Role-based dashboard layouts
- Accessibility compliance required (508 compliance for federal deployment)
- Component library: TBD (recommend Radix UI primitives + custom SOVEREIGN theme layer)

### 3.4 Shell Design System (Option C — To Be Designed)

The shell navigation and platform chrome must be designed before any module begins production development. Target characteristics:
- Platform nav: SOVEREIGN navy `#0D1B2A` with steel blue `#1B6CA8` active states
- CPMI-VRS governance dashboard: always visible in shell header (certificate status per product)
- Module routing: smooth transition between modules — no full page reload
- Single SSO: user identity displayed in shell header throughout
- Breadcrumb shows: Platform → Module → Section

---

## 4. Key Screens and Flows

### FLOWPATH — 11 Navigable Modules
**Core System group:** Dashboard · Access Control · Action Triggers · Domain Translator Showcase
**Workflow Data group:** Engagements · Workflow Maps · Interviews · Agent Status · VVR Records · Domain Profiles · Analytics

**Critical flows:**
1. Engagement → Interview → Workflow Map → VVR Validation → CPMI Export
2. Action Trigger resolution (bottleneck_ticket / signoff_record / recommendation_task) → ConfirmBar → HUMAN_DECISION Logger event
3. Role reassignment → ConfirmBar confirmation → permanent record

### ARIA ARC — Authorization Lifecycle
1. Authorization queue → select authorization → view anomaly score + approval chain
2. If anomaly ≥ 0.75: AUDIT_HOLD banner → Compliance Officer notified → chain paused
3. Approver reviews → approve/deny → HUMAN_DECISION Logger event → AI-absence attestation

### ARIA TRACER — Travel Compliance
1. Request queue → select request → view reasoning chain (expandable rule dots)
2. Recommendation tier: APPROVE / APPROVE WITH AWARENESS / ESCALATE
3. Approver decision (PM role only) → email template generation → HUMAN_DECISION Logger event

### ARIA CLEAR — Timecard and Labor Charging Compliance
1. Employee queue → select employee → view timecard grid + flag history
2. Recurrence detection: 3rd occurrence → 3RD OCC badge → Recurring Error Escalation template
3. PM-only pattern flag → acknowledgment → HUMAN_DECISION Logger event

---

## 5. Interaction Patterns and Conventions

**Structural replacement (ARIA canon):** When a control cannot be used (self-approval, analyst role), the UI component is replaced with an architectural notice. Not disabled, not hidden, not warned. Replaced. This communicates "architectural fact" not "permission level you can escalate past."

**Reasoning chains (TRACER):** Every rule evaluation point is an expandable dot. Click expands to plain-English explanation: what triggered, what the actual value was, what the approver should verify. Self-documenting at point of decision.

**Anomaly score bar (ARC):** Continuous 0.00–1.00 scale with three zones. Not binary. The score and zone together communicate nuance that binary HOLD/PASS loses.

**ConfirmBar (FLOWPATH):** Appears at top of screen on significant decisions. Requires explicit confirmation. Creates a permanent record. The confirmation UI itself communicates "this cannot be undone."

**Append-only audit notice:** Every audit panel displays a notice confirming immutability. This is a UX signal, not just a backend fact — it builds approver trust in the audit trail.

---

## 6. Design Tools and Assets

- **Primary design tool:** Design decisions are documented in this file and implemented directly in code. No external design tool (Figma, Sketch) has been used.
- **Icon library:** React Icons (FontAwesome subset) — `import { FaBolt, FaShieldAlt, FaCogs, FaLock } from 'react-icons/fa'`
- **Charts:** Recharts — all charts wrapped in `<ResponsiveContainer>`
- **Fonts:** DM Sans + DM Mono (products) · Trebuchet MS + Calibri (presentations) — all loaded via Google Fonts CDN with ID guard

---

## 7. How the Style Should Be Maintained and Extended

**Rule 1:** Product-specific design systems are stable. Changes to FLOWPATH or ARIA visual design require explicit documentation and Project Principal awareness. The visual design summary is a governance document.

**Rule 2:** The shell design system must be specified before any module's production CSS is written. Shell chrome (nav, header, CPMI status bar) must be consistent across all modules.

**Rule 3:** Semantic colors convey meaning. Identity colors convey brand. Never mix these roles. Purple is structural framing in FLOWPATH and ARIA — using it to mean "error" or "complete" breaks the entire system.

**Rule 4:** New modules extend the shell design system; they do not introduce competing systems. A new product module must use `--sovereign-*` CSS variables from the shell for platform-level chrome, and may use its own palette for module-specific content.

**Rule 5:** The Intelligence Layer, when built, will have its own visual design. Document it separately. It should feel like SOVEREIGN but distinct from any current product — it is an analytical system, not an operational one.

---
*SOVEREIGN Platform Visual Design Summary v2.0 · May 2026*
*Pre-Decisional · Internal Working Document*
