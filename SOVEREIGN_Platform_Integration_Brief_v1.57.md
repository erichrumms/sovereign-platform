# SOVEREIGN Platform Integration Brief
## Version 1.57 | July 30, 2026

**Classification:** Pre-Decisional · Internal Working Document
**Supersedes:** Integration Brief v1.56
**Changed this version:** Session 76's supplemental cross-module checks closed a real
test-coverage gap between WH-49 and WH-37 (not a functional bug — precise
characterization matters here), confirmed WH-48's table respects the same BY/BY+1 gate,
and — most significantly — extended WH-50's reassurance from two event types to every
`HUMAN_DECISION` emission site on the platform. WH-43's live count comparison remains
the one thing this Brief is still waiting on.

---

## §1-§10 — unchanged, see v1.45

---

## §11 — Current Build Status

**HEAD as of this Brief:** `0c0ac5a`. Session 76's full chain: `d4e3447` (WH-49) →
`9b718f4` (WH-48) → `c59ea68` (Handoff/SBOM) → `eaaaf14` (supplemental interaction
tests) → `0c0ac5a` (Handoff/SBOM addendum).

**Test count: 2,137 passing** — independently re-summed: 89+228+150+100+58+151+61+166
+232+211+28+175+125+19 = 1,793 JS/TS, exact match, + 149 e2e passing (4 skipped) + 195
Python. The +2 over Session 76's earlier 2,135 is the two new cross-fix interaction
tests, both accounted for.

**Shell contract: v1.24, unchanged.** Hash
`487054e2b66473ccbbd87e333db70910127549570ce449210a29afd444b4152f`, verified at open
and close.

---

## §12 — unchanged, see v1.50

---

## §13 — Open Governance Items

**CLOSED this version (supplemental checks):**
- **WH-49 × WH-37 interaction — test-coverage gap closed, not a functional bug.**
  Precise characterization: no production code changed. The underlying behavior was
  traced and confirmed already correct (a carried Budget-Year selection correctly
  triggers WH-37's planning notice on multi-year programs), and a new test locks that
  in. This Brief records it this way deliberately — "gap found and fixed" in a Handoff
  summary can read as a bug fix when the real story is untested-but-correct behavior
  now proven.
- **WH-48 × WH-37 interaction — confirmed clean, no gap.** The variance table sits
  inside the same `isBudgetYear` branch that already suppressed the prose narrative and
  the chart. Existing tests updated to explicitly assert the table's absence under
  BY/BY+1, rather than simply not checking for it.

**SUBSTANTIALLY STRENGTHENED — WH-50, now a platform-wide finding, not a two-event-type
one:**
- Every `HUMAN_DECISION` emission site on the platform was surveyed — VIGIL's approval
  decision, FLOWPATH's artifact approval and gate attestation/completion, ARIA's CLEAR
  certification/violation flag, NEXUS's travel decision, SCRIBE's send — and every one
  fires exclusively from a `useCallback` or direct handler invoked by a button click,
  never from a `useEffect`. This is a materially stronger claim than Session 76's
  original WH-50 finding, which was scoped to exactly the two event types the
  walkthrough happened to observe. **The Activity & Decisions log's structural
  integrity — that every entry corresponds to one real click, platform-wide — now has
  real, comprehensive evidence behind it.** The one thing this doesn't answer, and
  still can't: whether the specific 7 entries the Project Principal saw during
  Walkthrough I came entirely from scripted steps. The clean, isolated re-test remains
  the final, now very-likely-to-pass, confirming step.
- Noted, not a finding: `FLOWPATH_GATE_FAILED` and the `AGENT_STEP_*` events emit
  without `actor_name`, making them invisible to the per-user Activity filter. This
  doesn't threaten the log's accuracy — nothing gets misattributed — it's a scope note
  on what that view does and doesn't surface.

**Rule 12 search, negative result, recorded:** no other instance of WH-49's root-cause
pattern (two components independently initializing shared state a user expects to
carry across navigation) was found anywhere else in the platform.

**UNCHANGED, still open:** **WH-43's live count comparison — still never attempted.**
This remains the single item this Brief is waiting on before the readiness score can be
responsibly restated. WH-51, D3-6/F2/D4-6, and the rest of the standing backlog are
unchanged.

---

## §14 — SBOM Status

**Gap now covers Sessions 54 through 76.**

---

## §21 — CTO Demo Readiness Track

**Still not restated — but the evidentiary picture behind the audit-trail claim
specifically is now about as strong as code-level verification can make it.** WH-50 has
gone from "an isolated, unresolved observation" to "a platform-wide, comprehensively
surveyed non-issue at the code level, with one small confirming test still outstanding."
That's real progress on one of the platform's central claims. It does not substitute
for **WH-43's live count comparison**, which remains completely untouched and is still
the one thing standing between here and a real, earned readiness score.

---

## Key Lessons — Current

Lessons 1-37: see v1.51-v1.56.

**Lesson 38 — "gap found and fixed" needs to specify whether the gap was in behavior or
in test coverage, because a reader will assume the worse one.** Session 76's own
supplemental Handoff used "gap found and fixed" as a header for a finding that, read
closely, involved zero production code changes — the gap was in test coverage for
already-correct behavior. This isn't a criticism of the finding, which is real and
valuable. It's a naming precision point: the same words describe two very different
claims about the platform's prior state, and the more serious-sounding one isn't always
the true one. Worth a standing habit in how findings get headlined, not just how
they're explained in the body.

---

*SOVEREIGN Platform Integration Brief v1.57 · July 30, 2026*
*Pre-Decisional · Internal Working Document*
