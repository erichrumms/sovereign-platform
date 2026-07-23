# SOVEREIGN Platform — Session 55 SBOM Update

**Date:** 2026-07-22  
**Session:** 55  
**Commit:** `8e7c610`

---

## New Files

| File | Type | Purpose |
|------|------|---------|
| `module-scribe/src/scribe-sent-session.ts` | Module source (TypeScript) | Session-persistent sent-state store for SCRIBE T&T review items. Module-level singleton (`Set<string>`). No new dependencies. |

---

## Modified Files

| File | Change Description |
|------|--------------------|
| `sovereign-shell/src/PlatformHome.tsx` | Added VIGIL expiry sweep (D1/WG-17). Added imports from module-vigil. |
| `module-scribe/src/ScribeApp.tsx` | Session-store filtering in publish effects; markScribeItemSent on onSent (D2/WG-15). |
| `sovereign-shell/src/startup-publish.ts` | SCRIBE publish filtered through scribe-sent-session (D2/WG-15). Added import of ttReviewItemKey. |
| `module-workspace/src/WorkspaceApp.tsx` | D2: markScribeItemSent in ScribeWorkspaceSection.onSent. D3: post-decision republish effects for VIGIL/ARIA/SCRIBE sections. Added publisher imports. |
| `module-workspace/tests/test-helpers.tsx` | Added createInMemoryWorkQueueSurface + workQueueSurface to makeCtx. Test-only change. |

---

## Dependency Changes

**None.** No `package.json` files were modified. No new npm packages added or removed. All new cross-file imports reference existing modules already in the workspace dependency graph.

---

## No Shell-Contract Changes

Shell contract v1.22 SHA `28ca61d1b761e1805dac200f15e73489dbf3d995e2e7d1063d9ee09646e94443` is unchanged. No new exports on `SovereignShellContext`. No new types. No new agent classes, event types, or human decision types.
