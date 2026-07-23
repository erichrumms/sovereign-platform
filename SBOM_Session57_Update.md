# SBOM Update — Session 57

**Date:** 2026-07-23  
**Session:** 57  
**Commit:** `baa27b0`

---

## New Source Files

| File | Package | Version | License | Purpose |
|---|---|---|---|---|
| `module-apex/src/PPBEProgramDetail.tsx` | @sovereign/module-apex | 1.0 | Internal | PPBE single-program detail view (D1/WG-11+WG-8) |
| `module-apex/tests/PPBEProgramDetail.test.tsx` | @sovereign/module-apex | 1.0 | Internal | Tests for PPBEProgramDetail (10 tests) |

## Modified Source Files

| File | Package | Change Summary |
|---|---|---|
| `module-apex/src/ApexApp.tsx` | @sovereign/module-apex | Add ppbeDetailProgram state; import PPBEProgramDetail; wire execution tab |
| `sovereign-shell/src/PlatformHome.tsx` | @sovereign/shell | ModuleOrientationPanel D2 (live counts) + D3 (clickable rows); remove MODULE_INFO import |
| `sovereign-shell/tests/__snapshots__/shell-nav-snapshots.test.tsx.snap` | @sovereign/shell | 6 snapshots updated for new ModuleOrientationPanel rendering |

## Dependency Changes

None. No new npm packages added or removed this session.

## Shell-Contract

v1.22 — unchanged. SHA-256: `28ca61d1b761e1805dac200f15e73489dbf3d995e2e7d1063d9ee09646e94443` (both copies).

## Security

`npm audit --omit=dev`: 0 vulnerabilities.

## Governance Decisions Applied

- **GD-29** (docs/29): WG-11 root cause — separate PPBE detail view, no force-merge of synthetic IDs
- **GD-24** (shell-contract v1.19): WorkQueueSurface.listForModule — live counts for D2/WG-7
- **GD-27** (shell-contract v1.22): navigateToModule — D3 clickable module rows

---

*Build Agent — Session 57 — 2026-07-23*
