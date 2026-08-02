# docs/32 (provisional) — SysAdmin Cost & Operations Dashboard, v1

**Prepared by:** Governance Agent, August 1, 2026
**Status:** Pre-Decisional · Internal Working Document — **blocked on Build Session 1 (`docs/31`)
completing first; the data this screen reads does not exist until then.**
**Governance Decision:** **GD-32 (provisional — same numbering caveat as `docs/31`; confirm
against the live registry before either is formally assigned).**
**Design authority:** `docs/22_Informed_Decision_Making.md`'s curated-context principle, and
`docs/28`'s established honest-disclosure convention for session-scoped data — this spec follows
both, not a new philosophy.
**Build order:** **Session 2 of 2.** Do not start until Session 1 — including any follow-on build
it needs to fully close — is actually done, not just first-pass complete.

---

## 1 — What this is, and the one hard dependency

A `SYSTEM_ADMIN`-facing (and `PLATFORM_ADMIN`) view of real token/cost usage, aggregated from the
Logger's session-scoped buffer. **This cannot be built or meaningfully mocked before `docs/31`
ships** — there is no real `token_usage` data to read until Session 1 threads it through.

## 2 — The honest scope limit, stated up front, not discovered mid-build

**This is a session-scoped view, not a permanent cost history.** `ctx.logger.getEntries()` reads
an in-memory buffer that lives only as long as the browser tab (`docs/28`, reconfirmed by direct
code read July 31, 2026 — `SOVEREIGN_LOGGER_ENDPOINT` is still unset; Stage 2 still doesn't
exist). This screen answers **"what has this session cost so far"** — not "what did we spend last
month." That's the same honest limit the Activity & Decisions tab already discloses, via the same
UI convention (a prominent banner). This screen should reuse that exact pattern rather than invent
new wording for the same underlying fact.

## 3 — Where this lives: recommended default, worth confirming before build

**Recommendation: a new tab inside the existing Reviewer's Workspace module, gated to
`SYSTEM_ADMIN`/`PLATFORM_ADMIN` only — not a new top-level module.** This directly follows the
scoping call already made and recorded when the Activity & Decisions tab was added: *"not a new
top-level module — a real scoping call made at the time, since the Workspace already exists as a
`SovereignProduct` (GD-26), avoiding a second new-product governance decision"* (`docs/28` §4).
The same reasoning applies here.

**Worth a quick confirmation before build, not treated as decided here:** if there's a real reason
a dedicated top-level module makes more sense (e.g. anticipated growth beyond what a tab can
hold), that's a cheap, explicit decision to make up front — not something to default past.

## 4 — The technical design

**Data source:** the same `ctx.logger.getEntries()` call site pattern already in use
(`WorkspaceApp.tsx:186,646`), filtered client-side to `event_type === "AGENT_STEP_COMPLETE"` and
`token_usage` present. No new server-side query method needed.

**Aggregations, all computed client-side from that filtered set:**
- Running session total: sum of `input_tokens`, `output_tokens`, `estimated_cost_usd`.
- Breakdown by `product` (already a field on every event — no new plumbing required).
- Breakdown by `agent_id` (already present on `AGENT_STEP_COMPLETE` events).
- Fallback/retry rate: count of `FALLBACK_ACTIVATED` events per `workflow_step_id`, shown as its
  own distinct "wasted spend" line — not folded silently into the cost total. A fallback that
  still incurred a partial live-tier cost before failing over should be visible, not hidden.

**Role gating:** `SYSTEM_ADMIN`, `PLATFORM_ADMIN` — the same two roles already gating VIGIL
Approvals inside this same module (`docs/23` §3), reusing the existing per-section
`TAB_ROLES`/`canAccessTab` mechanism already implemented for `AriaApp.tsx` and the Workspace
itself. No new gating mechanism.

**Coverage honesty:** if `docs/31` shipped with any emission sites excluded (its own §4 flags two
candidates), this screen's disclosure banner states that explicitly — e.g. "reflects usage from N
of M instrumented agent steps" — rather than presenting a total that silently omits real cost.

## 5 — What this deliberately does not attempt in v1

- **Trends, history, or anything spanning more than the current session** — blocked on the Stage 2
  persistence decision (`docs/28` §5), which remains genuinely open and is not re-opened here.
- **A manual-process cost baseline for comparison** — a real, separate data-gathering exercise,
  not something the platform can compute internally.
- **Budget alerts or threshold configuration** — possible future work, not v1.
- **Any change to `token_usage` itself, or how it's computed** — that's `docs/31`'s scope; this
  session consumes the field exactly as shipped.

## 6 — Done Condition

1. New tab added to the Reviewer's Workspace (or the confirmed alternative from §3), gated
   `SYSTEM_ADMIN`/`PLATFORM_ADMIN`, with an honest disabled/hidden state for other roles matching
   the existing `LockedTabNotice` convention (`docs/23` §3).
2. Running-total, per-product, and per-agent views implemented, reading real `token_usage` data
   via `getEntries()` — no placeholder or synthetic figures anywhere in v1.
3. Fallback/retry count shown as a distinct line, never merged into the cost total.
4. Session-scope disclosure banner present, matching the Activity & Decisions tab's existing
   convention exactly — same wording pattern, not a new one.
5. Coverage disclosure present if `docs/31` shipped with any excluded emission sites.
6. A convergence test: publish a mix of real `AGENT_STEP_COMPLETE` (with `token_usage`) and
   `FALLBACK_ACTIVATED` events into a test logger, and confirm the dashboard's aggregates match by
   direct calculation — not visually eyeballed.

---

*docs/32 (provisional) — SysAdmin Cost & Operations Dashboard, v1 · August 1, 2026 · Governance Agent*
*Pre-Decisional · Internal Working Document*
*Build Session 2 of 2 — depends on docs/31 (Build Session 1) completing first*
