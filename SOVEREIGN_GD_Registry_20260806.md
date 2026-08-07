# SOVEREIGN Platform — Governance Decision Registry
## Update — August 6, 2026 · Governance Agent
## Supersedes SOVEREIGN_GD_Registry_20260730.md

**What changed:** GD-34 and GD-35 are real, already-executed governance decisions
— confirmed by their real shell-contract and test consequences — that were never
entered into this registry. The prior version stopped at GD-33 and read "next
available: GD-34," despite both having already shipped. This update adds them
and corrects the next-available number. Nothing else in the prior registry is
changed; GD-31 through GD-33's entries, including the GD-32/"GD-31 Build Session
2" historical-inconsistency note, are carried forward unmodified.

---

## Entries GD-31 through GD-33 — unchanged, see v20260730 for full text

---

## GD-34 — Cost Telemetry Depth (NEW, this update)

**Session:** 87
**Subject:** Cost-tracking observability depth — `fallback_category?`,
`duration_ms?`, `stop_reason?`, `responded_at?` added to
`SovereignLogEvent.token_usage`
**Shell contract:** v1.26 → v1.27
**Status:** Approved and executed — confirmed directly against the real
`shell-contract.ts` changelog and both file copies (hash `c99355ce...`,
matching) this reconciliation pass.
**Docs/SBOM/Handoff references:** Not confirmed in this reconciliation pass —
the exact filenames (analogous to `docs/31`/`SBOM_TCO1_Update.md` for GD-31)
were not part of the gathered evidence. Confirm and fill in when this entry is
placed in the repo, rather than inferring a plausible-looking filename.

---

## GD-35 — F5, PPBE Advisory Panels Instrumented (NEW, this update)

**Session:** 88
**Subject:** Four PPBE advisory-panel call sites wired to Logger-instrumented
hooks; 12 new tests added. Brought Cost Dashboard coverage from 10 to 14 real
live-call sites.
**Shell contract:** No version bump — confirmed this was an instrumentation
change only, not a shape change to `SovereignLogEvent` or any other exported
type.
**Docs/SBOM/Handoff references:** Not confirmed in this reconciliation pass —
same caveat as GD-34 above.

---

## Next available number

**GD-36** (corrected from the prior registry's stale "next available: GD-34").

---

*SOVEREIGN Platform — GD Registry Update · August 6, 2026 · Governance Agent*
*GD-34 and GD-35 confirmed via direct repo evidence (shell-contract diff, test
count) — not taken from any session's self-report*
*Pre-Decisional · Internal Working Document*
