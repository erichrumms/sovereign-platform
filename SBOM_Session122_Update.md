# SOVEREIGN Platform — SBOM Session Update
## Version 1.91 · August 19, 2026

**Supersedes:** v1.90 (`SBOM_Session121_Update.md`, Session 121). Version derived by scanning
all SBOM files on disk — highest was v1.90 — and adding one.
**Session:** 122 — all eight deliverables completed (D1–D8): the six fix-recommended Session
121 survey findings plus the platform-wide Gate 1 standardization (APEX, FLOWPATH, COUNSEL
consolidations). No shell-contract change, no new agents, no new event type.
**Build Agent close commit:** (see DOCUMENT_MANIFEST.tsv terminal HEAD row)

---

## 1 — Shell Contract

**v1.28 — unchanged.** Both copies byte-identical, SHA
`c99355cea43b63672615e76551aa835c3eb73a2f6435fbc43665f67d50ec681b`. Confirmed unchanged at open
AND close. No GD raised (next GD remains **GD-43**).

---

## 2 — Agent and Prompt Registry

**Agents: 44 — unchanged.** **Prompts: 20 (19 approved + 1 pending) — unchanged.**

---

## 3 — Test Counts

| Suite | Count | Confidence |
|---|---|---|
| JS/TS | 2090 | High — all 15 workspaces run individually this session, every exit code 0 |
| Python | 195 | High — real run this session (pytest exit code 0) |
| **Platform total** | **2285** | **High** |

**Change from v1.90:** **+8 JS/TS** (2082 → 2090): module-vigil +2 (banner presence +
single-instance across tabs), module-scribe +1 (GD-10 banner), module-lens +1 (disclosure
sentence), module-apex +2 (ReportCharts status-colour bar; ApexApp all-tabs single-instance),
module-flowpath +1 (FlowpathApp all-tabs single-instance), module-counsel +1 (full-flow strip
persistence). Count methodology unchanged; the 4 key-gated e2e live smokes remain skipped and
excluded.

---

## 4 — Third-Party Dependencies

**Zero new production dependencies.**

---

## 5 — Source Changed This Session

| D | Files | Nature |
|---|---|---|
| D1 | `module-vigil/src/banners.tsx` (**new**), `VigilApp.tsx` | App-wide Gate 1 banner, F-20 pattern |
| D2 | `module-nexus/src/NexusApp.tsx` | GD-10 inline banner → corrected F-18 wording (intake framing kept) |
| D3 | `module-scribe/src/banners.tsx`, `ScribeApp.tsx` | `ClassificationBoundaryBanner` added at composition root beside Gate 1 |
| D4 | `module-lens/src/LensApp.tsx` | Banner sentence extended: Explainer answers AI-generated/advisory |
| D5 | `module-apex/src/ReportCharts.tsx` | Completion bar keyed to program status (F-47 map) |
| D6 | `module-apex/src/ApexApp.tsx`, `PortfolioDashboard.tsx`, `GateRunnerPanel.tsx`, `ReportGenerationPanel.tsx` | Gate 1 consolidated to root (5 tabs); 3 panel instances removed |
| D7 | `module-flowpath/src/FlowpathApp.tsx`, `SessionManager.tsx`, `ElicitationDialogue.tsx`, `GateRunnerPanel.tsx` | Gate 1 consolidated to root (5 tabs); 3 panel instances removed |
| D8 | `module-counsel/src/DecisionFramer.tsx`, `CounselApp.tsx` | `Gate1DisclosureStrip` extracted; rendered at root for all post-framing stages; acknowledge gate untouched |
| — | 9 test files across the six modules | +8 tests; 4 panel-level pins updated to the consolidated pattern |

---

## 6 — Items Outstanding for the Project Principal / Governance Agent

1. **Survey correction recorded:** FLOWPATH had THREE panel-level Gate 1 instances, not the
   five the Session 121 survey stated (five was the GD-10 surface count). Handoff has detail.
2. **Follow-on observation (not acted on):** with Gate 1 consolidated to the APEX/FLOWPATH
   roots, the GD-10 banners still render at panel level in both modules — a placement
   asymmetry. Consolidating GD-10 the same way was NOT in this session's scope; flagged for a
   decision.
3. **Gate 1 coverage is now uniform** across all seven AI-assisted modules (SCRIBE, NEXUS,
   VIGIL, LENS, APEX, FLOWPATH, COUNSEL); ARIA/AgentOS correctly carry none (deterministic /
   orchestration).
4. **F-25 / F-44 / Gate 3 / `.sovereign_check_baseline`:** untouched.

---

*SOVEREIGN Platform — SBOM Session 122 Update v1.91 · August 19, 2026*
*Supersedes v1.90 (Session 121) · Pre-Decisional · Internal Working Document*
