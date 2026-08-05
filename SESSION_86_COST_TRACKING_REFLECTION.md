# SESSION 86 — Cost Tracking Reflection and Proposal
**Build Agent → Governance Agent**
**Session type:** Reflection and proposal — no code changed; no SBOM update needed
**Date:** August 4, 2026
**Grounded in:** Direct code reads across Sessions 80–85, including the full live
investigation of every agent-calling site, the FALLBACK_ACTIVATED taxonomy, and the
GD-31/GD-32 implementation just shipped

---

## What this is

GD-31 and GD-32 are shipped. The Cost Dashboard shows real token counts and estimated
cost per session, broken down by product and agent, with a raw fallback count as a
separate line. That is the floor, not the ceiling. This document asks what the next
layer of routine data collection would look like — the things that would make cost and
operational tracking meaningfully more complete — grounded in what the real
infrastructure actually does, not what it is expected to do.

Five candidates are examined. Each carries a clear statement of what it adds, roughly
how large the change would be, and any real tradeoff. The document closes with a
priority call: which one or two to build first and why.

---

## F1 — Failure Categorization

**What the current state actually is, by direct read:**

`base-client.ts` catch block (lines 362–373) already sets `reason` to either
`"timeout"` or `"provider_error"` and puts the full error message in `detail`. The
message is a reconstructed string: `"Anthropic API error 401
(authentication_error): invalid x-api-key"`. `AnthropicAPIError` (anthropic-client.ts
line 125) already has `this.status` (the HTTP numeric code) and `this.error_type`
(the Anthropic error type string) as separate fields — but by the time the error
reaches the base-class catch block, both have been folded into the message string
and are not re-extracted.

The Cost Dashboard currently renders the fallback count as a single number — "N
fallback activations." Session 85's root cause (a credential failure) was invisible
at the UI level until a direct `curl` was run. The browser console had the 401 message
on every attempt; the dashboard showed zero cost.

**What categorization would add:**

A structured `fallback_category` on each `FALLBACK_ACTIVATED` event —
`"auth_failure"`, `"rate_limited"`, `"server_error"` (5xx), `"timeout"`, or
`"network_or_parse"` — derived from the already-available status code and error type.
The Cost Dashboard could then render: "Auth failures: 3 — check API key" rather than
"Fallbacks: 3." A credential problem like Session 85's would be surfaced immediately,
session-session, without requiring a curl.

**How large the change is:**

SMALL. `AnthropicAPIError.status` is already there. The base-client catch block
needs one branching check — `instanceof AnthropicAPIError → inspect .status` vs
`instanceof SovereignTimeoutError → "timeout"` vs anything else → `"network_or_parse"`.
One new optional field on `FALLBACK_ACTIVATED`'s auxiliary payload shape in
shell-contract, or structured at the payload level without a contract bump (payload is
`Record<string, unknown>`). A shell-contract v1.26 bump with a typed auxiliary shape
would be cleaner and more honest.

The GovCloud client would need the same treatment — it has its own error taxonomy.

**Tradeoff:**

None significant. The data is already in the infrastructure; this surfaces it. The only
risk is a string-matching approach if `AnthropicAPIError` is inspected by message
text rather than by instance type and `.status` — that would be fragile. Inspecting
`instanceof` and the numeric `.status` directly avoids the fragility entirely.

---

## F2 — Latency / Response Time

**What the current state actually is, by direct read:**

`_wrapResponse` sets `responded_at: new Date().toISOString()` on
`SovereignLLMResponse.sovereign_metadata`. There is no `requested_at`. Duration is
not computable from anything in the current log.

`responded_at` IS captured at the response object level — it is not currently forwarded
to `AGENT_STEP_COMPLETE` events, even though it is available on the response.

**What duration capture would add:**

`duration_ms` on live `AGENT_STEP_COMPLETE` events: the wall-clock time of the
provider call. Enables "cost per second" analysis and distinguishes slow-but-cheap
from fast-but-expensive agent patterns. At the Cost Dashboard level, the immediate
usefulness is flagging that a particular agent step took 18 seconds — potentially
masking a retry or a model under load — rather than just showing what it cost.

**How large the change is:**

SMALL-MEDIUM. Requires adding `const requestedAt = performance.now()` (or
`Date.now()`) before `callProvider()` in `base-client.ts`, computing `duration_ms`
inside `_wrapResponse`, threading it into `SovereignLLMResponse` (a new optional
field), and then including it in the `token_usage` block or as a sibling field on
`AGENT_STEP_COMPLETE` in shell-contract. Shell-contract v1.26 bump.

All 10 GD-31 emission sites would need a one-line change to forward the new field —
the same mechanical threading pattern already done for `token_usage`.

**Tradeoff:**

For a session-scoped in-memory view, latency data is useful for profiling but less
immediately actionable than failure categorization. A SysAdmin seeing "this call took
22 seconds" has no recourse in the moment. The primary use is comparative — across
products and agents — which means the value compounds as more sessions accumulate data.
Against a session-scoped (in-memory) buffer that's wiped on reload, cumulative latency
patterns can't build up. The value therefore depends in part on whether Stage 2
persistence (docs/28 §5) ever ships; without it, latency data is useful only within a
single session.

---

## F3 — Truncation / stop_reason

**What the current state actually is, by direct read:**

`AnthropicResponse` (anthropic-client.ts line 105) includes `stop_reason: string` from
the Anthropic wire response. `_parseResponse` returns only `{ content, usage }` —
`stop_reason` is silently discarded. Whether a response ended because the model
finished (`end_turn`) or because it hit the token ceiling (`max_tokens`) is invisible
anywhere in the platform.

The default `max_tokens` is 1,000 (base-client.ts line 303, via `config.max_tokens ??
1_000`). Session 35 flagged this as a known truncation risk for long PPBE and APEX
outputs. Session 85 noted it again. The risk is real: a 1,000-token ceiling on a
multi-finding synthesis output is tight.

**What surfacing stop_reason would add:**

A `stop_reason` field on `AGENT_STEP_COMPLETE` events (or within `token_usage`),
populated from the Anthropic wire response. The Cost Dashboard could flag any event
where `stop_reason === "max_tokens"` — "this output may be truncated." More usefully,
it would make the 1,000-token ceiling's effect observable: if PPBE Exhibit or APEX
synthesis outputs routinely hit max_tokens, that's a signal to revisit the default
before it produces a consequential truncated output that looks complete.

**How large the change is:**

SMALL. `_parseResponse` returns a `{ content, usage }` struct; adding `stop_reason?`
as a third field requires one line. Threading it through `_wrapResponse` into
`SovereignLLMResponse` requires one new optional field. Then the 10 GD-31 emission
sites each include it in their `AGENT_STEP_COMPLETE` payload — same mechanical pattern
as `duration_ms` above. Shell-contract v1.26 bump covers both this and F2 in one.

**Tradeoff:**

Interpreting `max_tokens` as "truncated" is almost always correct for summarization
contexts but is not guaranteed — the model could finish exactly at the token limit.
Labeling it "may be truncated" in the UI is honest about this. The actual risk is
under-reaction: people see the flag and assume it's noise, so they stop noticing. A
design choice about how prominently to surface it in the dashboard is worth settling
at spec time, not left to the implementation.

---

## F4 — Rate Limiting as a Separate Category

**This is subsumed by F1.** HTTP 429 with `error_type: "rate_limit_error"` from the
Anthropic API is distinguishable by status code within the F1 categorization scheme.
No separate work item is needed; a clean F1 implementation produces rate-limit
visibility as a natural consequence.

---

## F5 — The Three Untracked Advisory Sites

**What the current state actually is, by direct read:**

`PPBEExhibitPanel` (module-scribe), `PPBECoordinationPanel` (module-nexus), and
`PPBEAgentsPanel` (module-apex) each call `client.complete()` directly in their
event handlers — not through a hook, not through an engine that the dashboard can
observe. All three receive `ctx: SovereignShellContext` as a prop but discard it
(`_ctx`, or unused). They call `createSovereignClient()` fresh per call with only
`readAnthropicKey()` — they are not wired to `ctx.logger`.

PPBEAgentsPanel runs two separate agent calls (evidence synthesis + scenario
analysis), so it is actually two untracked live-call paths, not one.

The Cost Dashboard's coverage disclosure currently reads: "all 10 in-scope
AGENT_STEP_COMPLETE emission sites are instrumented." That claim is accurate as
written — the disclosure says "in-scope," and these three panels were explicitly
excluded. But any session that uses all three PPBE panels will accrue real token cost
that is invisible to the dashboard.

**What tracking these sites would add:**

4 additional real live-call paths (PPBEExhibit: 1, PPBECoordination: 1, PPBEAgents:
2) contributing to visible session totals. The "coverage: 10 of 10" disclosure would
become "coverage: 14 of 14," or more honestly, "coverage: all sites."

**How large the change is:**

MEDIUM — but structurally different from GD-31. GD-31's pattern is: engine exposes
`usage?` on its Outcome type → hook threads `usage` to `AGENT_STEP_COMPLETE`. These
panels call engines directly in event handlers and have no hook layer. The choices are:
(a) add inline Logger calls directly in each panel's event handlers — faster but a
different pattern from the rest of the platform, (b) extract a thin hook per panel
that can be tested independently — matches the platform pattern but adds 3 new hooks,
or (c) wire `ctx.logger` into the `createSovereignClient()` call — which is not the
current API for the factory.

**The real tradeoff:**

These panels are explicitly designated "advisory only" (docs/18 §6) and their current
header comments say "Static fallback expected in dev." The architectural intent was
advisory outputs with no recorded consequence. Adding Logger integration changes what
they are: they become observed calls, not advisory-and-invisible ones.

Nothing in docs/18 or the shell contract explicitly prohibits logging from advisory
panels — the "advisory" label applies to the AI output, not the call. But the omission
from GD-31's scope was not a technical oversight; it was a deliberate scope boundary.
Crossing it here deserves an explicit decision, not a build-session assumption.

**The specific question for the Governance Agent:**

Does "advisory" mean the AI output is non-binding (current, unchanged interpretation),
or does it also mean the call should be unobserved (additional constraint not currently
stated anywhere)? If the former, logging is straightforward. If the latter, these panels
should stay excluded and the coverage disclosure should say "excludes 3 advisory panels
by design."

---

## F6 — Two Additional Observations Not in the Reflection Prompt

**6a — Unknown model IDs produce silent cost-estimate gaps**

`computeEstimatedCostUSD` returns `undefined` for any model not in the four-entry
RATE_TABLE. The Cost Dashboard sums `estimated_cost_usd ?? 0`, so a GovCloud call
(whose model ID is a different string, possibly unresolved at build time) contributes
zero to the dollar total with no indication that it was excluded. Sessions using the
GovCloud path would show artificially low cost estimates. A one-line note in the
coverage disclosure — "GovCloud model rates not yet in rate table — cost estimates
exclude GovCloud calls" — would be honest and would not require a rate-table change.

**6b — `responded_at` exists on every response but is not in the log**

`SovereignLLMResponse.sovereign_metadata.responded_at` is already set to
`new Date().toISOString()` on every live response. It is not currently forwarded to
`AGENT_STEP_COMPLETE` events. If it were, the Cost Dashboard could answer "when did
this cost happen?" — enabling a session timeline view. This is a one-field add with
no new computation: the timestamp is already there.

---

## Priority Call

**Build first: F1 (failure categorization).**

The Session 85 root cause — a credential failure invisible at the UI level for an
entire evening of attempts — was the clearest operational gap this platform has had
since it went live. Fallback categorization closes it. The data is already in the
infrastructure (AnthropicAPIError.status, AnthropicAPIError.error_type); the change is
small; and the operational value is high: a SysAdmin can distinguish an auth failure
from a rate limit from a timeout without running curl. This is the one change that
would have materially shortened Session 85's diagnostic work.

**Build second: F3 (stop_reason / truncation), combined with F2 (duration_ms) in a
single shell-contract v1.26 bump.**

These two are small enough to do together, and combining them avoids a second
shell-contract bump. The stop_reason case is operationally important because the
1,000-token default is a real risk on PPBE outputs — and without surfacing it, a
truncated output looks exactly like a complete one. Duration adds comparative profiling
value that compounds over time (more valuable if persistence ships). Neither is
emergency-grade, but both fill genuine observability gaps.

**Do not build F5 without a governance decision first.**

The PPBE panels are a legitimate architectural question, not a straightforward gap.
The right first step is an explicit statement from the Governance Agent on whether
"advisory" constrains observability. Building first and resolving the question later
would repeat the kind of silent scope-expansion this project has worked to avoid.

**Address F6a immediately — no build needed.**

The coverage disclosure in WorkspaceApp.tsx can add a sentence about GovCloud rate
exclusion in the next session that touches the file. This is a documentation correction,
not a build item.

**F6b (responded_at forwarding)** is low-friction if it happens alongside F2; not
worth its own session.

---

*SESSION 86 — Cost Tracking Reflection and Proposal*
*No code changed · No SBOM update required*
*Build Agent → Governance Agent · August 4, 2026*
