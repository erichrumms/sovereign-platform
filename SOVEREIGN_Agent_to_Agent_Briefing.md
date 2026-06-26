# SOVEREIGN Platform — Agent-to-Agent Briefing
## For Any Claude Instance Opening a SOVEREIGN Session
## Updated June 26, 2026 — reflects Session 18 close, APEX complete, Walkthrough B ready

---

## Who You Are Talking To

The Project Principal is the sole human decision-maker on this project. Non-technical
background, highly engaged, learning fast. He thinks in big pictures first and
components second — always orient before you detail. He makes confident decisions when
options are clearly framed with what each closes and what it leaves open. He pastes
Terminal output directly into chat; read it carefully, it always contains useful
information. One question at a time. Never assume he knows where a file is.

---

## What SOVEREIGN Is

SOVEREIGN is a governed, AI-aligned operations platform for enterprise and federal
organizations — six integrated core products (NEXUS, CPMI, APEX, FLOWPATH, AgentOS,
ARIA Suite) plus four companion modules (COUNSEL, SCRIBE, LENS, VIGIL) and a future
seventh product called the Intelligence Layer that must never be lost. Every current
product builds toward it.

Three non-negotiable design outcomes govern every build decision: integration
reliability, operational efficiency, and end-to-end security observability.

---

## Current Build State — As of Session 18 (June 26, 2026)

| Item | State |
|---|---|
| Last completed session | Session 18 (autonomous, 17 min) |
| HEAD / origin/main | `aab61ac` |
| shell-contract.ts | **v1.12 · SHA `61594a698da07a4a748259fe23cf2be03d8e6aeaea5c72502f04e0d3e246dfe3`** |
| shell-contract status | **UNCHANGED through Session 18** |
| Integration Brief | v1.27 |
| SBOM Registry | v1.19 |
| JS tests passing | 893 (+ 142 Python = 1035 total) |
| Stage 1–4 | COMPLETE |
| Stage 5a (APEX) | **COMPLETE — Walkthrough B READY** |
| All data | SYNTHETIC — Governance Clock not activated |

**Session 18 deliverables — ALL COMPLETE:**
- D1: GD-17 — APPROVED_PRODUCTS companion re-sync (COUNSEL/SCRIBE/LENS/VIGIL added; Item 55 closed)
- D2: APEX CPMI-VRS Gates tab — fifth tab with GateRunnerPanel; Gates 1/2 auto-pass; Gate 3/4 await Project Principal during Walkthrough B
- D3: NEXUS→AgentOS live backing — `createAgentOSBackedPort` (module-agentos); UI convergence deferred (shell-contract decision needed)
- D4: E2E Walkthrough B scenario — Scenario 5 (e2e 4→5)
- D5: Gap 5/6 scan — no fixes required; all APEX screens compliant

**Next action: Walkthrough B** — Project Principal operates APEX in browser. Gate 3
attestation and Gate 4 completion are the Project Principal's steps in the CPMI-VRS
Certification tab. After Walkthrough B: Session 19.

---

## Shell Contract — v1.12 (UNCHANGED through Session 18)

| | Hash |
|---|---|
| **Current (v1.12)** | `61594a698da07a4a748259fe23cf2be03d8e6aeaea5c72502f04e0d3e246dfe3` |
| Retired (v1.11) | `78709b213ff9976ecadd4066645a897ece55fb9b3ffb049b59dd02d19c0162db` |

Every session must verify both copies match the v1.12 hash before any build work begins.
No shell-contract change was made in Session 18. The next authorized shell-contract
change will be a future GD — likely related to the NEXUS→AgentOS shared task surface
decision (Item 57).

---

## Monorepo Location

```
~/Developer/sovereign-platform/        ← MONOREPO ROOT
```

**Absolute path:** `/Users/developmentsystem/Developer/sovereign-platform/`
**GitHub remote:** `https://github.com/erichrumms/sovereign-platform.git`
**Branch:** `main` · HEAD: `aab61ac`

**Open Claude Code with:**
```bash
cd ~/Developer/sovereign-platform
caffeinate -i claude --dangerously-skip-permissions
```

---

## The Two Claude Environments — Never Cross These

**Claude Chat** — governance only. Authors documents, merges SBOMs, approves prompts,
produces session opening prompts, authors architecture specs, runs walkthroughs. Never
writes code.

**Claude Code** — code only. Writes, tests, and commits code. Produces session handoff
and SBOM update at close. Never authors governance documents.

The Project Principal is the bridge.

---

## The Invariant Constraints

1. No independent security, governance, or audit systems — use the platform's
2. No shared entity field-name divergence from the data dictionary
3. No rewrite debt — connections are configuration changes
4. Every human decision event carries `decision_type`
5. No direct Anthropic API calls — `createSovereignClient()` only
6. `workflow_step_id` on every Logger event
7. Shell context frozen at eight exports
8. `shell-contract.ts` is a governance document — v1.12, SHA above. Changes require
   governance decision, version increment, changelog, impact assessment, SHA-256
   verification of both copies, and propagation to all synced shared-type copies
9. All prompts registered before build — 10 APPROVED
10. All agents registered before build — 18 registered (all AgentCards active)
11. Five synced copies of shared artifacts — changes must propagate to all copies

**Critical codebase facts — updated through Session 18:**
- `sovereignHold()` does not exist — use `ctx.governance.isOnHold(product)` instead
- ESM modules (module-cpmi, module-apex) use `import.meta.env` via isolated
  `anthropic-key.ts` with jest stub — do NOT change to `process.env` in those modules
- APEX `minimumRole` is `PLATFORM_ADMIN`
- PPBE reserved field names (never use): `fiscal_year`, `lifecycle_cost_estimate`,
  `obligation_plan`, `performance_baseline`
- `createAgentOSBackedPort` (module-agentos) is the live NEXUS→AgentOS port — injectable
  by configuration; NEXUS default still uses synthetic port pending shell-contract decision
- **Gate 3 `decision_type` correction queued (Item 56):** APEX GateRunnerPanel logs
  `REPORT_ATTESTATION` for Gate 3; correct type is `GATE_3_ATTESTATION` (already in
  contract). One-line fix — Session 19 first deliverable.

---

## Open Governance Items — Priority Order for Session 19

1. **Item 56** — Gate 3 `decision_type` correction (one line; first deliverable Session 19)
2. **Item 57** — NEXUS→AgentOS shared task surface (shell-contract design decision)
3. **PPBE six decisions** (D-P1 through D-P6) — Claude Chat governance session
4. **Item 53** — AgentOS §5.2 evaluate gates spec section
5. **Item 54** — evaluate.py cross-runtime adapter

---

## The Registered Agents (18 total — unchanged)

All 18 AgentCards active. See Integration Brief v1.27 §18 for full registry.
Key additions from Sessions 17–18: `apex.ai-assistant` (Analytical) and
`apex.report-generator` (Operational) — both implemented and exercised by the Gates tab.

---

## The Approved Prompts (10 total — unchanged)

PR-COUNSEL-001/002/003 · PR-SCRIBE-001 · PR-SCRIBE-004 · PR-VIGIL-001 ·
PR-VIGIL-002 · PR-LENS-001 · PR-CPMI-001 · PR-APEX-001

---

## What Makes a Session Go Badly — and How to Prevent It

| Problem | Prevention |
|---|---|
| Wrong shell-contract hash | Verify v1.12 hash `61594a69…46dfe3` before any build work |
| Using `process.env` in ESM module | module-cpmi / module-apex use `import.meta.env` via `anthropic-key.ts` |
| Calling `sovereignHold()` | Doesn't exist — use `ctx.governance.isOnHold(product)` |
| Using PPBE reserved field names | Never: `fiscal_year`, `lifecycle_cost_estimate`, `obligation_plan`, `performance_baseline` |
| Wiring NEXUS→AgentOS UI without a shell decision | Live backing exists; UI convergence needs Item 57 resolved first |
| Prompt runs before approval | Register as PENDING, approve in Claude Chat, never self-approve |
| Session closes without handoff | Non-negotiable — always produce the handoff |
| Shell-contract change without full governance | Version increment + changelog + impact assessment + dual-copy SHA + Constraint #11 |

---

## The Post-Session Rhythm — Every Session

```
Claude Code closes → handoff + SBOM committed + pushed
        ↓
Project Principal copies close artifacts → uploads to Claude Chat
        ↓
Claude Chat produces → merged SBOM + updated Integration Brief
                     + updated Agent-to-Agent Briefing + system prompt (if hash changed)
        ↓
Project Principal downloads → copies Brief to monorepo root
                            → commits + pushes → places files in iCloud
        ↓
Next session → gather script → Claude Code → context paste → opening prompt
```

---

*SOVEREIGN Platform · Agent-to-Agent Briefing · Updated June 26, 2026*
*Supersedes the June 25, 2026 version — Session 18 complete, APEX Stage 5a complete,
Walkthrough B ready, shell-contract v1.12 unchanged*
*Pre-Decisional · Internal Working Document*
