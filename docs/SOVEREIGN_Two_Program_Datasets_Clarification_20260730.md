# SOVEREIGN Platform — Two Program Datasets: Architecture Clarification
## July 30, 2026 · Governance Agent
## New reference — this distinction has caused real confusion more than once and deserves a standalone explainer

**Why this document exists:** APEX contains two genuinely separate, unlinked
representations of "programs," and every time this has surfaced in a walkthrough or a
screenshot review, it's prompted a real question about whether it's a bug. It isn't —
but it's confusing enough, and consequential enough for demo narration, to deserve its
own clear explanation rather than a footnote in a Handoff.

---

## The two datasets

**The "World Model" — P-100 series.** Programs like P-100 (Joint Logistics
Modernization), P-200, P-150, P-300, with named responsible parties (Dana Jones, Robin
Vasquez, etc.), rich risk registers, reasoning-chain history, and governance-decision
records. Reached via APEX's **Portfolio Dashboard** and its own, separate **Program
Detail** view. This system has been deliberately left untouched for the platform's
entire Session 54-76 arc — it predates the PPBE-specific work and is a distinct,
older subsystem.

**The PPBE-native series — SYNTH-PRG-ALPHA/BRAVO/CHARLIE/DELTA/ECHO.** The dataset built
and substantially expanded during this arc (WG-6's multi-year expansion, WH-5's Program
Health redesign, WH-23's ARC reframe). Reached via **Home Dashboard's Program Health**
tiles, APEX's **Execution Monitoring**, and ARC's program selector. This is the dataset
every WH finding from Sessions 71-76 touches — WH-34's obligation-rate fix, WH-37's
BY/BY+1 gating, WH-5's point-of-contact data, all apply exclusively to this series.

## Why they're separate, and why that's deliberate

Walkthrough H's own script tests both paths as genuinely distinct systems: opening a
program from the Portfolio Dashboard is explicitly expected to open the World Model's
own Program Detail view, "not the old error, and not the native PPBE view" — the script
treats confusing the two as the actual defect to check for, not the separation itself.

## What this means for demo narration

A CTO watching a live demo could reasonably click into a program from either surface and
expect the same underlying data. They won't get it — Portfolio Dashboard's programs and
Execution Monitoring's programs are different program universes with different naming
conventions (`P-100` vs. `SYNTH-PRG-ALPHA`) and no cross-reference between them. **This
is worth naming plainly if it comes up, not treating as a slip.** A reasonable framing:
the World Model represents an earlier, broader program-governance capability; the
PPBE-native series is the purpose-built execution-monitoring layer this arc has been
developing in depth. They're on a path to eventual integration, not yet unified.

## Practical implication for anyone touching this code

Any new feature that reads "program" data needs to be explicit about which series it
means. `SYNTH_PPBE_PROGRAMS` and the P-100-family records are not interchangeable, share
no common ID scheme, and a session that assumes otherwise will produce confusing or
broken results. If a future session's scope isn't clear on this point, it's worth
confirming explicitly before writing code, the same way `docs/18`'s phase table should
be read before touching year-scoping logic.

---

*Two Program Datasets: Architecture Clarification · July 30, 2026 · Governance Agent*
*Pre-Decisional · Internal Working Document*
