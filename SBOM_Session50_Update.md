# SBOM Update — Session 50 (GD-25: Reviewer's Workspace, v1)
Date: 2026-07-20 | Companion to: `SOVEREIGN_Session50_Handoff.md`

---

## Summary

**No new third-party dependencies. No third-party version changes.** Session 50 adds one
first-party workspace package (`@sovereign/module-workspace`) whose dependency set is a strict
subset of the versions already resolved in `package-lock.json` for the other ten modules.

---

## New First-Party Package

| Package | Version | Description |
|---|---|---|
| `@sovereign/module-workspace` | 1.0.0 | Reviewer's Workspace module (GD-25, docs/23) — embeds VIGIL `ApprovalDetail`, ARIA `ClearCertificationQueue`, SCRIBE `TTManagerReview` over the new `ReviewerWorkspaceSurface` |

### Its dependencies (all pre-existing in the lockfile at the same resolved versions)

| Dependency | Declared range | Status |
|---|---|---|
| `@sovereign/api-client` | ^1.0.0 | first-party, existing |
| `@sovereign/data` | ^1.0.0 | first-party, existing |
| `react` | ^18.3.1 | existing |
| `react-dom` | ^18.3.1 | existing |

### Its devDependencies (identical set/ranges to module-aria and the other modules)

`@testing-library/dom` ^10.4.1 · `@testing-library/jest-dom` ^6.9.1 · `@testing-library/react` ^16.3.2 ·
`@types/jest` ^29.5.0 · `@types/react` ^18.3.12 · `@types/react-dom` ^18.3.1 · `jest` ^29.5.0 ·
`jest-environment-jsdom` ^29.7.0 · `ts-jest` ^29.1.0 · `typescript` ^5.9.3

All resolve to versions already present in the lockfile — no new artifacts are fetched.

---

## Lockfile

`package-lock.json` change is limited to the npm-workspaces linkage entries for
`module-workspace` (the `node_modules/@sovereign/module-workspace` symlink record and its
package stanza). No third-party integrity hashes added, removed, or changed.

---

## Root Manifest

- `package.json` — `workspaces`: + `"module-workspace"`; `scripts`: + `"test:workspace"`.

---

## Shell Contract Version of Record

- shell-contract **v1.20** (GD-25), both copies SHA-256:
  `22ee233525ac2c636153cb604ec6a7c1822889a02f9d38bfbc0dda3d921f63d3`

---

*SOVEREIGN Platform · SBOM Session 50 Update · July 20, 2026*
