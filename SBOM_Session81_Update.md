# SOVEREIGN Platform — SBOM Registry
## Version 1.49 · August 4, 2026

**Supersedes:** v1.48 (Session 80 — browser-safety hotfix)
**Adds:** Session 81 — platform-wide agent-plumbing audit (no code changes)

---

## 1 — Shell Contract / Agent / Prompt Registry History

| Version | Session | Change | SHA-256 (both copies) |
|---|---|---|---|
| v1.26 | GD-33 Build Session | Added `reports_to?: string` to `SovereignUser`. | `42a479cab397de93246d05bef7c90959d33f9a5b7d2fc4b74c39cd397951697b` |
| v1.26 | Session 80 | Unchanged. | `42a479cab397de93246d05bef7c90959d33f9a5b7d2fc4b74c39cd397951697b` |
| **v1.26** | **Session 81** | **Unchanged. Re-verified at close — both copies identical, matching recorded value.** | **`42a479cab397de93246d05bef7c90959d33f9a5b7d2fc4b74c39cd397951697b`** |

**Agents: 44 total — unchanged.**

**Prompts: 20 = 19 approved + 1 pending — unchanged.**

---

## 2 — Third-Party Dependencies

**Zero new production dependencies.** Session 81 changed no source files at all — it
was a read-only audit producing this SBOM update and the Session 81 Handoff. No new
imports, no `npm install`, no package.json changes. Zero-new-production-dependency
streak continues unbroken from Session 62.

**Audit posture:** unchanged — 5 vulnerabilities (1 moderate, 4 high) all in
dev-tooling dependencies, pre-existing.

---

## 3 — Test Totals

| Close point | JS/TS | e2e | Python | Platform Total | Confidence |
|---|---|---|---|---|---|
| Session 80 | 1,862 | 149 (4 skip) | 195 (carried) | 2,206 | High |
| **Session 81** | **1,862** | **149 (4 skip)** | **195 (full pytest run)** | **2,206** | **High — full 14-package run + e2e + full pytest at close; zero source changes, per-package counts identical to Session 80** |

Note on Python: Session 80 carried the 195 figure forward from GD-33 and flagged a
grep-count gap (192 by `def test_` grep). Session 81 ran the full pytest suite:
**195 passed** — the carried figure is confirmed by a real run; the grep gap is a
counting-method artifact (parameterized/class-method tests), not missing tests.

Note on typecheck: `tsc --noEmit` was run on all 15 workspaces at close. 14 clean;
`e2e` fails with one pre-existing TS6133 (unused import `SYNTH_PPBE_PROGRAMS`,
`e2e/tests/startup-publish-convergence.test.ts:22`, present since Session 72 at the
latest). Recorded as Finding F2 in `SESSION_81_HANDOFF.md`; deliberately not fixed
this session (outside the audit's fix scope).

---

## 4 — Session 81 Component Changes

**None.** No production or test source file was modified. Session deliverables:

| File | Change |
|------|--------|
| `SESSION_81_HANDOFF.md` | New — full audit findings report (sweep results, 18-site live-call enumeration, anthropic-key consistency, GovCloud posture, Findings F1/F2 with options) |
| `SBOM_Session81_Update.md` | This file — v1.49 |

### Audit summary (details and every file:line reference in the Handoff)

1. **Session 80 bug class (unguarded Node-only globals): zero unfixed instances
   platform-wide.** All `process.env` references in non-test source are guarded
   (`sovereign-api-client` ×3 files, `module-agentos/src/evaluate-endpoint.ts` with an
   equivalent variant guard). No `process.platform`/`__dirname`/`require()` in source.
2. **18 `createSovereignClient()` live-call sites traced** (all tier "standard"),
   plus deterministic-engine and display-only emitters. 17 structurally sound; one
   finding (F1: `module-nexus/src/NexusApp.tsx` travelDrafter emits Logger events
   without the Gate 2 try-catch its own header claims). The docs/31 "10 instrumented
   token_usage sites" claim confirmed exact.
3. **anthropic-key.ts ×7:** byte hashes differ (per-module headers), comment-stripped
   bodies all hash identically — no functional drift.
4. **GovCloud:** no `process.env` in `govcloud-client.ts` (no guard needed);
   unreachable from products (no `tier: "enhanced"` caller exists); dormant by design
   under the R7 placeholder; `sovereign_config.yaml` does not exist yet, matching the
   pre-R7 posture.

---

## 5 — Lineage and Audit Note

v1.49 methodology unchanged from v1.48: test count derived from a full per-package run
at close, not from session self-report. Confirmed 1,862 JS/TS + 149 e2e (4 skip) +
195 Python = 2,206 platform total.

**Session 81 is complete.**

---

*SOVEREIGN Platform — SBOM Registry v1.49 · August 4, 2026*
*Supersedes v1.48 (Session 80) · Adds Session 81 (agent-plumbing audit)*
*Pre-Decisional · Internal Working Document*
