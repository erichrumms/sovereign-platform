# SOVEREIGN Platform — SBOM Session Update
## Version 1.85 · August 17, 2026

**Supersedes:** v1.84 (`SBOM_Session115_Update.md`, Session 115). Version derived by scanning
all SBOM files on disk — highest was v1.84 — and adding one.
**Session:** 116 — Demonstration-surface repair (D1 investigations, D2 text fixes, D3/D4 optional
polish). No shell-contract change, no new agents, no architecture change.
**Build Agent close commit:** (see DOCUMENT_MANIFEST.tsv terminal HEAD row)

---

## 1 — Shell Contract

**v1.28 — unchanged.** Both copies byte-identical, SHA
`c99355cea43b63672615e76551aa835c3eb73a2f6435fbc43665f67d50ec681b`. Confirmed unchanged at open
AND close. No GD raised (next GD remains **GD-43**). No Constraint #11 propagation — no contract
change.

---

## 2 — Agent and Prompt Registry

**Agents: 44 — unchanged.** No new agents. **Prompts: 20 (19 approved + 1 pending) — unchanged.**

---

## 3 — Test Counts

| Suite | Count | Confidence |
|---|---|---|
| JS/TS | 2059 | High — all 15 suites pass, real exit codes via `sovereign_session_verify.sh` |
| Python | 195 | High — real run this session (pytest exit code 0) |
| **Platform total** | **2254** | **High** |

**Change from v1.84:** none net. Five apex assertions and one shell snapshot set were **updated in
place** to match the intentional F-9/F-11 narrative change and the F-10 label; no tests added or
removed. `rate_percent` computation remains unit-tested.

---

## 4 — Third-Party Dependencies

**Zero new production dependencies.** No packages added or removed. Vulnerability posture unchanged.

---

## 5 — Source Changed This Session (demonstration-surface repair)

| File | Finding(s) | Nature |
|---|---|---|
| `module-apex/src/banners.tsx` | F-18 | Banner text — classification refusal wording |
| `module-aria/src/banners.tsx` | F-18 | Banner text |
| `module-flowpath/src/banners.tsx` | F-18 | Banner text |
| `module-workspace/src/WorkspaceApp.tsx` | F-32, F-35 | Banner text; cost-coverage plain-English + `<details>` toggle |
| `module-scribe/src/TTManagerReview.tsx` | F-37 | Draft header text |
| `sovereign-shell/src/main.tsx` | F-1 | Dev-user clearance reseed CUI → UNCLASSIFIED (data) |
| `module-apex/src/ppbe-dashboard.ts` | F-9, F-11 | `obligationRate()` narrative — currency format, percent de-dup |
| `sovereign-shell/src/PlatformHome.tsx` | F-10 | "As of FY 2026 Q4" reporting-period label |
| `module-nexus/src/NexusApp.tsx` | F-16 | GD-10 boundary colour amber → blue guardrail |
| `module-apex/tests/*` (5 files), `sovereign-shell/…/*.snap` | F-9/F-11/F-10 | Test/snapshot updates for intentional changes |
| `verify_engineering_profile.sh` | F-4 | Now tracked (pre-existing read-only audit script) |

No new files created except the two close artifacts (this update + the handoff). No `.sh` manifest
row required (F-4 — manifest tracks zero `.sh` files).

---

## 6 — Items Outstanding for the Project Principal / Governance Agent

1. **F-25 (structural):** SCRIBE's six product-aligned drafting modes navigate to the destination
   product but never publish an item into its queue. Needs a cross-module publish surface +
   destination ingestion (+ likely a new `SovereignEventType`) — a governance decision, not a
   Build Agent repair. Reported in the handoff; not attempted.
2. **F-20:** SCRIBE AI-disclosure banner — investigated, ready to build, not applied (placement
   scope is a Governance/Principal call). Recommended implementation in the handoff.
3. **F-37 follow-on:** real edit capability for the Time & Travel Review draft (roadmap).
4. **`.sovereign_check_baseline`:** the pre-commit Tier-1 hook suggested raising
   `EVENTTYPE_NOT_PROPAGATED` (79) and `LOGGER_EVENTS_UNROUTED` (94). **Not actioned** —
   opening-prompt §5 forbids raising any baseline; these reflect pre-existing Stage-4-unbuilt
   scope (Lessons 41–44).
5. **Report-only findings** (F-8, F-22, F-31, F-39): several are Q&A material; none are build items.

---

*SOVEREIGN Platform — SBOM Session 116 Update v1.85 · August 17, 2026*
*Supersedes v1.84 (Session 115) · Pre-Decisional · Internal Working Document*
