# SOVEREIGN Platform — SBOM Session Update
## Version 1.92 · August 20, 2026

**Supersedes:** v1.91 (`SBOM_Session122_Update.md`, Session 122). Version derived by scanning
all SBOM files on disk — highest was v1.91 — and adding one.
**Session:** 123 — close the GD-10/Gate 1 placement asymmetry flagged by Session 122: GD-10
consolidated to the APEX and FLOWPATH composition roots (D1, D2). No shell-contract change,
no new agents, no new event type. Banner **placement** change only — GD-10 wording unchanged.
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
| JS/TS | 2089 | High — all 15 workspaces run individually this session, every exit code 0 |
| Python | 195 | High — real run this session (pytest exit code 0) |
| **Platform total** | **2284** | **High** |

**Change from v1.91:** **−1 JS/TS** (2090 → 2089). The two consolidations strengthened existing
assertions rather than adding tests (APEX panel pins now assert *neither* banner at panel level;
the APEX and FLOWPATH all-tabs single-instance tests now cover *both* banners). One obsolete
FLOWPATH test — `SessionManager` "renders the GD-10 classification boundary banner" — was
removed because GD-10 no longer renders at panel level; its coverage moves to the FlowpathApp
all-tabs test. Net −1. Count methodology unchanged; the 4 key-gated e2e live smokes remain
skipped and excluded.

---

## 4 — Third-Party Dependencies

**Zero new production dependencies.**

---

## 5 — Source Changed This Session

| D | Files | Nature |
|---|---|---|
| D1 | `module-apex/src/ApexApp.tsx` | `ClassificationBoundaryBanner` added at root beside `Gate1Banner` |
| D1 | `module-apex/src/PortfolioDashboard.tsx`, `GateRunnerPanel.tsx`, `ReportGenerationPanel.tsx` | Panel-level GD-10 instance + import removed (3 panels) |
| D2 | `module-flowpath/src/FlowpathApp.tsx` | `ClassificationBoundaryBanner` added at root beside `Gate1Banner` |
| D2 | `module-flowpath/src/SessionManager.tsx`, `ElicitationDialogue.tsx`, `WorkflowArtifactReview.tsx`, `IndividualWorkstyle.tsx`, `GateRunnerPanel.tsx` | Panel-level GD-10 instance + import removed (5 panels); IndividualWorkstyle comment trimmed |
| — | 6 test files (apex ×3, flowpath ×3) | 4 panel pins updated, 1 obsolete test removed, 2 all-tabs tests extended to both banners |

---

## 6 — Items Outstanding for the Project Principal / Governance Agent

1. **Premise correction recorded (Rule 8 / Lesson 26):** the opening prompt stated FLOWPATH's
   GD-10 sat at "three panel-level locations," matching Gate 1's former placement. In fact GD-10
   rendered on **all five** FLOWPATH tab-components. The consolidation still applies (five copies
   → one root instance), but in FLOWPATH it deduplicates rather than closing a coverage gap; only
   APEX had the two-uncovered-tabs gap the follow-on described. Handoff §D2 has the detail.
2. **Gate 1 + GD-10 placement is now symmetric** across the two modules that were flagged — both
   render both banners once at the composition root. This resolves the Session 122 follow-on.
3. **F-25 / F-44 / Gate 3 / `.sovereign_check_baseline`:** untouched. COUNSEL, VIGIL, LENS,
   NEXUS, SCRIBE: untouched, per the opening prompt.

---

*SOVEREIGN Platform — SBOM Session 123 Update v1.92 · August 20, 2026*
*Supersedes v1.91 (Session 122) · Pre-Decisional · Internal Working Document*
