# SOVEREIGN Platform — Design Recommendations
## New Scope, Not Findings

**Date:** July 18, 2026
**Prepared by:** Governance Agent, with the Project Principal operating the live platform
**Document type:** Design Recommendation (per the convention established in the original Walkthrough F document — new scope proposed for a better platform, distinct from findings against existing intended behavior)
**Status:** Pre-Decisional · Internal Working Document

---

## DR-1 — Multi-Persona Login for Testing and Demo

### The problem

The platform currently has exactly one identity, hardcoded at boot:

```
const DEV_USER: SovereignUser = {
  employee_id: "dev-0001",
  name: "Platform Developer",
  role: "SYSTEM_ADMIN",
  ...
};
```

This is intentional, documented technical debt — the source comment explains real login is meant to be EAMS SAML 2.0 SSO, not yet wired, so a synthetic admin user is seeded for local development. But it means every screen tested to date, including this entire walkthrough, has been seen exclusively through an administrator's eyes. Nothing confirms what the platform actually looks or behaves like for the roles it's actually built for — most concretely, SCRIBE's Time & Travel Review screen is explicitly specified as a manager's tool (`docs/17 §14`: "Manager review interface"), and nobody has ever opened it as a manager.

### What's confirmed

- No role-switching mechanism exists anywhere in the codebase.
- The platform's actual role taxonomy (`SovereignRole` in `shell-contract.ts`): `PROGRAM_MANAGER`, `ANALYST`, `COMPLIANCE_OFFICER`, `AGENT_OPERATOR`, `INDEPENDENT_REVIEWER`, `SYSTEM_ADMIN`, `READ_ONLY`, `PLATFORM_ADMIN`.
- **There is no staff/employee-facing role at all.** The taxonomy has no concept of the person whose time record or travel request is under review logging in themselves — they're only ever the subject of a communication, never a user.

### Recommendation

Not real SSO — that's genuinely out of scope for a demo and belongs with the Stage 3 EAMS work already tracked elsewhere. Instead: a lightweight, dev-only persona switcher that swaps which synthetic identity is active, in the same spirit as every other honest "not live yet" pattern already used across this platform (the STATIC badges, the disclosed placeholders).

**Two tiers of this, worth deciding separately:**
1. **Admin vs. Manager contrast** — achievable now, no new role needed. Swap `DEV_USER` between `SYSTEM_ADMIN` and `PROGRAM_MANAGER` and confirm what actually differs (access, visible modules, this specific screen's presentation).
2. **A genuine staff-facing view** — bigger, real scope. Requires deciding what a staff role would even mean in this platform's model (read-only visibility into their own flagged items? nothing at all, by design?) before it can be built. Don't default into this without a deliberate decision — it's a new product surface, not a login toggle.

---

## DR-2 — Outlook / Teams Integration Path

### The problem

SCRIBE's drafting screens (confirmed directly, source comment in `TTManagerReview.tsx`): *"A draft is NEVER sent by this interface's machinery — 'Send' records that the MANAGER sent it."* The platform prepares a draft, and the human is expected to copy it, send it themselves through Outlook, and come back to click a confirmation button. That round trip is real friction on every single communication the platform generates.

### What's confirmed

- `nexus.routing-agent`'s registry entry already declares an intended credential type — *"M365 GCC High service credential (via shell)"* — so this was architected for, on paper, at the governance layer.
- A full codebase search for any Graph API, Outlook, or Teams integration code found **nothing real.** The only two textual hits were the word "outlook" used as an unrelated report-section name (a program's forward-looking outlook). This is genuinely unstarted, not partially built.
- GCC High specifically implies a federal government cloud tenant — meaning full integration carries its own procurement and security-review timeline, separate from ordinary engineering effort.

### Recommendation

Don't attempt real integration for the demo — the honest, well-scoped move is closer to what's already working well elsewhere in this platform:

1. **A "Copy draft" button** — one click, removes the actual retyping/reformatting friction, no integration required.
2. **A visibly disabled "Send via Outlook — Coming Soon" button** next to it — states the intended direction honestly, matching the same disclosure pattern already used well throughout SOVEREIGN (STATIC badges, "wired in a later session" language), rather than either hiding the gap or overclaiming readiness.

Full production integration is a real, separately-scoped roadmap item once GCC High procurement and security review are underway — not a build-session task.

---

## DR-3 — Cross-Module Workflow Cohesion

### The problem, stated plainly

A single real decision — reviewing a flagged issue, understanding its context, and acting on it — currently requires visiting multiple, separately-built modules with no shared thread connecting them. Concretely, from what we've directly observed this session:

- **VIGIL** shows you a request needs a decision.
- **APEX** is where the financial or program context that decision actually depends on lives.
- **SCRIBE** is where the resulting communication gets drafted.
- **Outlook** (per DR-2, once wired) is where it would actually get sent.

Four separate places for one continuous piece of work. Right now, three of those four require the human to physically navigate away and remember what they saw before, and the fourth (Outlook) requires leaving the platform entirely.

### Concrete evidence this is already causing real problems, not a hypothetical

**WF-20 is the clearest example, and it happened during this very build session.** The original finding recommended VIGIL's obligation approval pull in a one-line rollup of the target program's financial health from APEX — because a manager approving a dollar amount needs to know whether it pushes a program over its ceiling, and that data already exists elsewhere in the platform. What actually got built instead: `cost_code` and `obligation_id` were added to the brief's sentence — real, but data that was **already sitting in the request's own local fields**, not the cross-module APEX context that was the actual point. This isn't a criticism of the execution — it's the natural result of a platform organized by product rather than by task: the easy fix was local, the valuable fix required reaching across a module boundary that nothing currently makes easy.

**SCRIBE's T&T Review screen shows the same shape at a smaller scale**, discussed earlier this session: Compliance Analysis and the drafted communication already sit in one screen together (a real, working example of doing this right, worth learning from) — but the *moment of sending* still requires leaving the platform for Outlook. Even the good example still has one hop out of it.

### Recommendation — options, not a final answer, since this is a genuine product decision

**A. Task-oriented assembled views.** For specific high-frequency decision types (e.g., "obligation decision"), build a screen that pulls the relevant panels from each module that decision actually depends on into one place, rather than requiring the reviewer to reconstruct context by visiting each module separately. Highest value, highest effort.

**B. Lightweight cross-module context embedding.** Keep modules separate, but let a screen like VIGIL's approval brief directly embed a live summary pulled from another module's data (exactly what WF-20 originally asked for) rather than only ever displaying its own local fields. Lower effort than (A), addresses the sharpest pain point directly.

**C. Navigation reorganized around work, not around product.** A more fundamental rethink — closer in spirit to the already-deferred Home page redesign — where the entry point is "what do I need to decide today" rather than a list of ten product names in a sidebar. Highest effort, most transformative, and probably not a near-term demo item.

**Suggested near-term move, if this needs to show real progress before a demo:** (B), scoped specifically to VIGIL's `ppbe_obligation` brief pulling the actual APEX program summary — which both correctly completes WF-20 as originally intended, and gives a concrete, demonstrable answer to "does this platform actually save a reviewer from bouncing around," rather than leaving it as an abstract concern.

---

## How these three relate

DR-3 is the umbrella concern; DR-1 and DR-2 are specific instances of the same underlying friction — DR-1 is about not being able to see the platform as its real users would, and DR-2 is about the platform stopping one step short of where the user's actual task ends. None of these are small — recommend they join the existing deferred-design list (Home page redesign, PPBE Monitoring redesign, module hover-hint) rather than getting folded into the WF-numbered remediation work, which is intentionally scoped to fixing what's already specified, not proposing what should be built next.

---

*SOVEREIGN Platform · Design Recommendations · July 18, 2026*
*Pre-Decisional · Internal Working Document*
