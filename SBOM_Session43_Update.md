# SBOM — Session 43 Update
## SOVEREIGN Platform Software Bill of Materials — Incremental Update

**Date:** July 19, 2026
**Session:** 43
**HEAD at update:** `3c35131` (content commit) + handoff commit
**Prepared by:** Build Agent
**Status:** Pre-Decisional · Internal Working Document

---

## Files Modified

### sovereign-shell/src/PlatformHome.tsx
- **Change:** `factDetailStyle` color `#94a3b8` → `#475569` (D1, WF-14)
- **Line:** 331
- **Reason:** WCAG AA contrast failure (was 2.56:1; now 7.58:1 on `#ffffff`)

### module-apex/src/PPBEAgentsPanel.tsx
- **Change:** `btnDisabledStyle` color `#94a3b8` → `#475569`; `tierBadgeStyle` default return color `#94a3b8` → `#475569` (D1, WF-14)
- **Lines:** 240, 247
- **Reason:** WCAG AA contrast failures (2.08:1 on `#e2e8f0`; 2.34:1 on `#f1f5f9`); now 6.15:1 and 6.92:1 respectively

### module-counsel/src/PreMortemStudio.tsx
- **Change:** `sourceTagStyle` color `#94a3b8` → `#475569` (D1, WF-14)
- **Line:** 206

### module-counsel/src/CounterargumentPanel.tsx
- **Change:** `sourceTagStyle` color `#94a3b8` → `#475569` (D1, WF-14)
- **Line:** 279

### module-counsel/src/DecisionFramer.tsx
- **Change:** `fieldHintStyle` and `hintStyle` colors `#94a3b8` → `#475569` (D1, WF-14)
- **Lines:** 235, 305

### module-counsel/src/AnalysisPanel.tsx
- **Change:** `sourceTagStyle` color `#94a3b8` → `#475569` (D1, WF-14)
- **Line:** 178

### e2e/tests/wcag-contrast.test.ts
- **Change:** Added 8 new audit-inventory pairs for the WF-14 locations (D1)
- **Test count:** 60 → 68 tests
- **New pairs added:**
  - `#475569 / #ffffff / 12px / non-bold` — PlatformHome factDetailStyle
  - `#475569 / #e2e8f0 / 12px / bold` — APEX PPBEAgentsPanel disabled button
  - `#475569 / #f1f5f9 / 10px / bold` — APEX PPBEAgentsPanel tier badge NOT-RUN
  - `#475569 / #ffffff / 11px / non-bold` — COUNSEL PreMortemStudio source tag
  - `#475569 / #f8fafc / 11px / non-bold` — COUNSEL CounterargumentPanel source tag (past-turn card)
  - `#475569 / #ffffff / 12px / non-bold` — COUNSEL DecisionFramer field hint
  - `#475569 / #ffffff / 12px / non-bold` — COUNSEL DecisionFramer incomplete-form hint
  - `#475569 / #ffffff / 11px / non-bold` — COUNSEL AnalysisPanel source tag

### sovereign_session_verify.sh
- **Change:** Updated to v3 — `EXPECTED_HEAD` `dd3e4fa` → `3c35131`; `EXPECTED_CONTRACT_HASH` old v1.16 value → `91da8c18...` (v1.17); header rewritten (D3)

---

## Files Removed

### 12_NEXUS_Architecture.md (repo root)
- **Change:** Deleted (D2)
- **Reason:** Byte-identical duplicate of `docs/12_NEXUS_Architecture.md`; root copy was stale residue per the File Location Reference. Canonical copy at `docs/12_NEXUS_Architecture.md` unchanged.

---

## No New Dependencies

No packages added or removed. No shell-contract changes. No agent registrations.

---

## SBOM Continuity

Prior SBOM: `SBOM_Session38_PromptFix_Update.md` (last known prior update in repo)
This update covers Session 43 only. Sessions 39–42 SBOM updates are in iCloud per
document manifest policy.

---

*SOVEREIGN Platform · SBOM Session 43 Update · July 19, 2026*
*Pre-Decisional · Internal Working Document*
