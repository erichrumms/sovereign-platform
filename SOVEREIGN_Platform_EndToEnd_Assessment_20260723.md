# SOVEREIGN Platform — End-to-End Verification, Validation, and R/E/S Assessment
## Session 60 · July 23, 2026

**Classification:** Pre-Decisional · Internal Working Document
**Produced by:** Build Agent, Session 60, against HEAD `12601c7` (shell-contract v1.23,
`6f52449c37b639029023b24055d504182ab2e3ac8edd44d8965799d90847d0d9`, both copies verified identical).
**Nature of this session:** findings only — **nothing found by this audit was fixed** (per the
Session 60 opening prompt §5). The one code change this session is D5 (test coverage for Session
59's reason-code chips), which was pre-scoped and unrelated to any finding here.

---

## 0 — What this assessment is, and is not

This machine has **no browser automation** (confirmed Session 54, Finding F4 — no Playwright, no
scriptable Chrome). Everything in this report is a **code-level and data-level** audit: real
component rendering under jsdom test, real data-path tracing from component to source, real static
analysis, real test-suite and audit-tool runs. **Nothing in this report is "visually confirmed."
No screen was seen rendering in a browser during this session.** Where this report says a screen
"has real data wired," it means the data path was traced end-to-end in source — not that a human
watched it render. The live human Walkthrough repeat pass on the Home Dashboard (open since
Session 54) remains the only true visual/interactive verification step, and this session does not
replace it.

**Efficiency findings are code-review-level only.** No profiling tools exist here. Every
efficiency item below is a flagged *candidate* (an anti-pattern visible in source), not a measured
performance problem.

### Coverage statement (honest, per the opening prompt's own fallback guidance)

Mid-session, four of six parallel audit passes were lost to a compute-availability limit before
producing output. Coverage was re-prioritized per the opening prompt's stated order rather than
spread thin:

| Coverage tier | Modules | What it means |
|---|---|---|
| **Full treatment** | Home Dashboard/shell, Reviewer's Workspace, VIGIL, ARIA | Every tab and data path traced; every finding evidence-cited; load-bearing findings independently re-verified against source by a second pass |
| **Deep targeted** | SCRIBE, APEX | All tabs inventoried; the demo-critical claims (export gate, WG-6 periods, WG-15 fix, disclosure conventions, audit-trail emission) verified directly in source |
| **Targeted** | COUNSEL, LENS, CPMI, AgentOS, NEXUS, FLOWPATH | Role gates, data sources, audit-trail emission, and the platform-wide bug pattern checked directly; not an exhaustive tab-by-tab trace |

Cross-cutting security sweeps (RBAC, secrets, GD-10, npm audit) covered the **whole repo** regardless
of tier.

---

## 1 — Executive summary

**The platform is in genuinely good shape at the infrastructure level.** All 15 workspace test
suites pass with real exit codes (2,069 tests passed, 4 deliberately-skipped opt-in live tests);
`tsc --noEmit` is clean in all 15 workspaces; `npm audit --omit=dev` reports **0 vulnerabilities**;
**all eleven module role gates match `SOVEREIGN_Role_Access_Matrix_20260721.md` exactly**, including
ARIA's per-tab and the Workspace's per-section gates; GD-10 is enforced centrally with the exact
canonical error message; no hardcoded secrets exist anywhere in the repo.

**The one systemic reliability theme: session-state resurrection.** Sessions 54–55 fixed the
"module state resets on remount" bug for VIGIL *approvals* (WG-13), SCRIBE sent-items (WG-15), and
Home (WG-16/17) — but the same class of bug exists, unfixed, in **four other places**, one of them
HIGH severity:

1. **VIGIL Alert Queue (HIGH)** — acknowledged/resolved alerts resurrect on every remount.
2. **ARIA CPMI-VRS Gates 3/4 (MED)** — a "permanent" Gate 3 attestation resets on remount and can
   be re-attested, emitting a duplicate `GATE_3_ATTESTATION` event.
3. **NEXUS Travel & Time queues (MED)** — decided TT items reappear on remount.
4. **FLOWPATH approved sessions (MED)** — artifact approvals revert to pending on remount.

**The second theme: Home/landing navigation gaps.** There is no way to return to the Home
Dashboard after entering a module (the breadcrumb "Home" is a misleading no-op); `navigateToModule`
leaves the sidebar highlight stale; and a `navigateToModule` call to an inaccessible module blanks
the screen (currently unreachable, but unguarded).

**Security posture: solid with three notes.** The Anthropic key pattern
(`VITE_ANTHROPIC_API_KEY` via `import.meta.env`, identical in 7 modules) compiles any configured key
into the browser bundle — dev-only today, but a platform-level fix note before any real key exists.
The ARIA/VIGIL GD-10 banner claims CUI+ processing "is blocked and logged," but the actual blocking
lives at the api-client/NEXUS-intake seam, not in these modules — the banner overclaims relative to
what the TS layer enforces. Audit-trail coverage of consequential human actions is complete in every
audited module, with two already-documented taxonomy gaps (VIGIL `INVESTIGATING`, TRACER/ARC
Python-only event types).

Findings were **not fixed**. Recommended next step: a prioritized fix session for the
session-state-resurrection family (one shared pattern, four applications), and a small navigation
session for the Home-return path.

---

## 2 — D2: Synthetic data completeness scorecard

Status codes: **(a)** real synthetic data wired and reachable · **(b)** honestly-disclosed
placeholder (acceptable by platform convention) · **(c)** broken/silently empty, no disclosure.

| Screen / tab | Status | Evidence (traced path) |
|---|---|---|
| **Home** — Program Health | (a) | `startup-publish.ts:69` → `programStatusSurface` → `PlatformHome.tsx:310` |
| **Home** — Module Orientation | (a) | live registry + subscribed WorkQueueSurface counts (`PlatformHome.tsx:247-296`) |
| **Home** — Flagged Programs | (a) | derived filter, honest non-privileged disclosure (`PlatformHome.tsx:311,406-409`) |
| **Home** — To Do / Review | (a) | subscribed `workQueueSurface`, startup-seeded (`startup-publish.ts:77-114`) |
| **Home** — Governance indicator / CPMI-VRS overlay | (b) | synthetic all-NOT_STARTED + "Placeholder view · Synthetic data" banner (`shell.ts:338-354`, `CPMIVRSDashboard.tsx:124-125`) |
| **Shell** — sidebar module health dots | **(c)-adjacent** | polling never started; dots permanently "unknown" (`module-loader/index.ts:419-439` defined, never called) — see D3-6 |
| **Workspace** — VIGIL / ARIA / SCRIBE sections | (a) | `reviewerWorkspaceSurface` → `useReviewerWorkspaceItems` → real embedded components |
| **Workspace** — Activity & Decisions | (a) | live `ctx.logger.getEntries()` with session-scope disclosure (`WorkspaceApp.tsx:446-450`) |
| **VIGIL** — Unacknowledged-alerts card | (b) | "—" + "endpoint not configured" when unconfigured (`VigilApp.tsx:158-159`) — but see D3-8 |
| **VIGIL** — Pending-approvals card / Approvals tab | (a) | session-store-seeded queue (`vigil-approval-session.ts:74-105`) |
| **VIGIL** — Pipeline health card | (b) | "—" + "wired in a later session" (`VigilApp.tsx:166`) |
| **VIGIL** — Alert Queue / Alert Detail / Triage | (a) | seeded ARIA+TT alerts; triage 3-tier with disclosed static checklist (`triage-engine.ts:90-200`) |
| **ARIA** — CLEAR Dashboard | (a)/(b) | DEMO sets live-joined to `ctx.aria`; GD-10 synthetic banner on every screen |
| **ARIA** — Certification Queue | (a) | deterministic `evaluateDocument` over CLEAR_DEMO_ITEMS; "Synthetic preview" labeled |
| **ARIA** — TRACER | (a) | real entity-resolved chains from `@sovereign/data` seeds (`tracer-integration.ts:40-43,253-259`) |
| **ARIA** — ARC | (a) | modeled against typed DEPENDENCY_MODEL using real CLEAR rule_ids; "Modeled projection" marker |
| **ARIA** — CPMI-VRS Gates | (a) | live determinism verification (six scenarios, engines run twice) |
| **SCRIBE** — six drafting modes | (a) | capture → draft → schema validation; static tier explicitly labeled "placeholder template to edit, not a generated draft" (`DraftWorkspace.tsx:43`) |
| **SCRIBE** — synthesis / framing | (b) | honest static-tier intermediate prose (per registry deferral note) |
| **SCRIBE** — Style DNA | (a) | session-scoped store, disclosed "stores the profile for this session" (`StyleDNAManager.tsx:119`) |
| **SCRIBE** — T&T Review | (a) | `DEMO_TT_REVIEW_ITEMS` filtered by sent-session store (WG-15 fix verified at `ScribeApp.tsx` mount publishers) |
| **SCRIBE** — PPBE Exhibits | (a) | export gate genuinely reads `ctx.aria.isCertified` (`useExport.ts:81`) |
| **APEX** — Portfolio / Program Detail / Report Gen / Gates | (a) | synthetic adapter; unselected Program Detail shows an honest hint |
| **APEX** — Execution Monitoring (PPBE) | (a) | full FY2026 Q1–Q4 periods, actuals derived not restated (`sovereign-data/src/synthetic/ppbe-seed.ts:59`) — WG-6 confirmed resolved in code |
| **APEX** — PPBE Program Detail (WG-11/WG-8) | (a) | separate `ppbeDetailProgram` state; old World-Model misroute gone (`ApexApp.tsx` Session 57 wiring) |
| **APEX** — per-site breakdown | (b) | disclosed placeholder (`PPBEDashboard.tsx:5,532`) |
| **NEXUS** — Intake / Queue / TT Queue | (a) | seeded SYNTH_TT_* data; GD-10 refusal at intake (`useRequestRegistry.ts:99`) — but see D3-3 |
| **NEXUS** — PPBE Coordination | (a) | real open-item data; publishes work-queue count on tab mount (`PPBECoordinationPanel.tsx:60-65`) |
| **AgentOS** — Task Registry / Dispatch | (a) | reads `ctx.taskSurface`; honest empty state "No tasks yet. Create one above" |
| **CPMI** — Reasoning / World Model / Gates | (a) | synthetic dev world-model port, disclosed in banner (`world-model-port.ts:66-73`) |
| **FLOWPATH** — all five tabs | (a) | `SYNTHETIC_SESSIONS` seeds (`SessionManager.tsx:89`); workstyle uses hashed analyst id — but see D3-4 |
| **COUNSEL** — full decision flow | (a) | targeted verification: `HUMAN_DECISION` emitted on confirm (`DecisionRecordPanel.tsx:8,70`) |
| **LENS** — Governance Explainer | (a)* | 3-tier fallback with disclosure — but grounded on only **2 of the 6** registry-required source documents; see D4-6 |
| **LENS** — Pipeline Navigator | (b) | static, non-LLM by design (corrected registry entry) |
| **LENS** — AI Transparency | (a) | session event capture via logger wrap |

*No screen audited was found in silent category (c) with real user impact; the single (c)-adjacent
item is the shell health-dot feature (dead code rendering an honest "unknown").*

---

## 3 — D3: Platform-wide reliability findings

**D3-1 · HIGH — VIGIL Alert Queue resurrects on remount (the unfixed sibling of WG-13).**
`useAlertQueue.ts:77` holds alerts purely in React state seeded from static constants at
`VigilApp.tsx:76`; `applyResponse` mutates only the React copy. Navigate away and back → every
acknowledged/resolved/false-positive'd alert returns as UNACKNOWLEDGED. Session 54's session-store
fix (`vigil-approval-session.ts`) was applied to approvals only, never to alerts. CONFIRMED
(independently re-verified: no alert-side session store exists in `module-vigil/src/`).

**D3-2 · MED — ARIA CPMI-VRS Gate 3/4 state resets on remount; duplicate permanent attestations
possible.** `AriaVrsGates.tsx:77-78` holds gate state in plain `useState`. The UI says Gate 3 "is
recorded permanently … cannot be undone" — yet after remount it shows PENDING again and a second
`GATE_3_ATTESTATION` `HUMAN_DECISION` can be emitted for the same gate in the same session.
CONFIRMED (re-verified in source).

**D3-3 · MED — NEXUS Travel & Time queues resurrect on remount.** `useTTIntake.ts:156` seeds
React state from `ports.seedTravel`/`seedTime` on every mount; no session store exists in
`module-nexus/src/`. Decided travel/time items reappear after navigating away and back. Same class
as D3-1. CONFIRMED (state initialization traced; absence of store verified).

**D3-4 · MED — FLOWPATH approvals revert on remount.** `FlowpathApp.tsx` holds
`approvedSessionIds` in module-local `useState`; `SessionManager.tsx:89` re-seeds from
`SYNTHETIC_SESSIONS`. An approved artifact (a `WORKFLOW_APPROVAL` already logged) shows as
unapproved after remount, permitting a duplicate approval event. CONFIRMED at the state level.

> **The pattern behind D3-1..4:** module-local React state seeded from static constants, with the
> Logger event as the only durable record. The proven fix shape already exists twice in the
> codebase (`vigil-approval-session.ts`, `scribe-sent-session.ts`) — one future session could apply
> it four times.

**D3-5 · MED — No way back to the Home Dashboard; breadcrumb "Home" is a misleading no-op.**
`hasSelectedModule` is set true in `openModule` (`main.tsx:152`) and never reset anywhere.
Clicking the always-rendered "Home" crumb only changes `currentPath` — the mounted module stays
visible, the sidebar highlight clears, and PlatformHome (with its WG-17 expiry sweep) never renders
again for the rest of the session. CONFIRMED (re-verified: `setHasSelectedModule` has exactly one
call site, always `true`).

**D3-6 · LOW — Module health dots are dead code.** `loader.startHealthPolling()`/`pollAll()`
(`module-loader/index.ts:419-439`) are never called; every dot renders "unknown" forever.
Honest-ish (it says unknown), but a wired-looking feature that never functions. CONFIRMED.

**D3-7 · MED — `ctx.navigateToModule` leaves navigation state inconsistent.** (i) The host
handler calls the navigation provider directly (`main.tsx:195`), bypassing `useNavigationState`'s
mirror — the sidebar keeps highlighting the previous module after "Open in VIGIL/ARIA/SCRIBE".
(ii) A `navigateToModule` to a registered-but-inaccessible module unmounts everything, then fails
the mount, leaving a blank outlet + error banner (`main.tsx:166-175`, `module-loader/index.ts:376-388`).
(ii) is currently unreachable — all existing callers are role-consistent by construction
(Workspace section roles ⊆ target module roles) — but nothing enforces that invariant. CONFIRMED.

**D3-8 · LOW — VIGIL discloses inconsistently between Home and itself.** `VigilApp.tsx:113-122`
publishes seeded alert counts to the work-queue surface while VIGIL's own summary card shows "—
endpoint not configured". Home says "Unacknowledged Alerts: 3"; VIGIL says it can't see alerts.
Also, the spec-required "cannot see the alert state" notice (`AlertQueue.tsx:35-52`) is unreachable
while seeds exist. CONFIRMED.

**D3-9 · MED (latent) — Two correctness properties depend on "exactly one module mounted at a
time".** The no-double-emit property of the three VIGIL expiry sweeps, and the "Workspace decision
reflected in VigilApp" property (reflection happens only at mount-time seeding — no subscribe on
the session store), both hold today *only* because the shell mounts one module at a time and the
landing never returns. Any shell change (e.g., fixing D3-5 naively, or a split view) silently
re-opens both. CONFIRMED mechanism; latent by structure.

**D3-10 · LOW — Workspace expiry-sweep hole + Activity staleness.** The VIGIL expiry sweep runs
only while the Workspace's VIGIL section is the rendered section (`WorkspaceApp.tsx:232,266-276`);
a user parked on ARIA/SCRIBE/Activity (or any non-admin who can never render it) runs no sweep —
expiry is delayed, not lost. The Activity tab/badge reads a subscription-less logger
(`shell.ts:222-225`) and refreshes only on unrelated re-renders. CONFIRMED design; specific stale
triggers HYPOTHESIS.

**D3-11 · Efficiency candidates (flagged only, no measurement claims).**
`PlatformHome.tsx:310` reads `programStatusSurface.list()` per-render with no subscription (safe
today only because APEX can't be mounted concurrently); `WorkspaceApp.tsx:150-152` recomputes the
activity filter unmemoized per render over an unbounded append-only buffer; minor duplicate calls
(`ApprovalQueue.tsx:120-121`) and O(n·m)/O(n²) shapes over currently-tiny collections
(`useApprovalQueue.ts:101`, `ClearCertificationQueue.tsx:229`). Publishers across VIGIL/ARIA/
Workspace are correctly effect-gated on value changes, not per-render. Nothing warrants action at
current data sizes.

---

## 4 — D4: Platform-wide security findings

### 4.1 RBAC consistency — PASS, 11/11

Every module's actual `minimumRole` array was extracted from its `index.ts` and compared against
`SOVEREIGN_Role_Access_Matrix_20260721.md`:

| Module | Matrix | Code | Verdict |
|---|---|---|---|
| COUNSEL | PA, SA, PM, AN, CO, IR | same (`module-counsel/src/index.ts`) | MATCH |
| SCRIBE | PA, SA, PM, AN | same | MATCH |
| LENS | all eight roles | all eight (`module-lens/src/index.ts:103-112`) | MATCH |
| NEXUS | PA, SA, AO, PM, CO | same | MATCH |
| APEX | PA, SA, PM, AN | same | MATCH |
| FLOWPATH | PA, SA, AO, AN, PM | same | MATCH |
| VIGIL | PA, SA | same | MATCH |
| CPMI | PA, SA | same | MATCH |
| AgentOS | PA, SA | same | MATCH |
| ARIA | per-tab (union PA, SA, CO, PM, AN) | union + `TAB_ROLES` exact (`AriaApp.tsx:70-75`) | MATCH |
| Workspace | per-section (union PA, SA, CO, PM, AN) | union + `SECTION_ROLES` exact (`WorkspaceApp.tsx:98-103`) | MATCH |

(PA=PLATFORM_ADMIN, SA=SYSTEM_ADMIN, AO=AGENT_OPERATOR, PM=PROGRAM_MANAGER, AN=ANALYST,
CO=COMPLIANCE_OFFICER, IR=INDEPENDENT_REVIEWER.) Per-tab gates cannot be bypassed by GD-27
navigation intents (`AriaApp.tsx:104-107`); locked tabs hide count badges (no cross-role leakage).

**D4-1 · LOW — stale role-gate documentation in ~7 `index.ts` headers.** The header comments of
VIGIL/CPMI/AgentOS/NEXUS/APEX/FLOWPATH/ARIA/LENS index files still describe pre-GD-22 single-role
gates and say "the authoritative role→module matrix (Decision 24) remains open" — the matrix has
existed since July 18 and the code matches it. Documentation drift only; code is correct.

**D4-2 · INFO — the Workspace Activity tab's role list is an unratified access decision.**
GD-28 postdates the July 21 matrix; `SECTION_ROLES.activity` (`WorkspaceApp.tsx:102`) uses the
module union — defensible, but the matrix has no row for it. Governance follow-up, not a defect.

### 4.2 Audit-trail coverage — complete for consequential actions, two documented taxonomy gaps

Verified emit sites (all with correct `decision_type` / actor fields): VIGIL approve/reject/
escalate (`useApprovalDecision.ts:69-88`, AGENT_APPROVAL), obligation approve/reject
(`ppbe-authorization.ts:431-449`, HUMAN_APPROVAL/HUMAN_DENIAL), alert
acknowledge/resolve/escalate/false-positive (`useAlertResponse.ts:113-131`), expiry auto-reject
(single shared builder `approval-contract.ts:77-93`, system actor), ARIA certify/flag
(`ClearCertificationQueue.tsx:176-215`, COMPLIANCE_CERTIFICATION), Gate 3/4
(`AriaVrsGates.tsx:102-142`, GATE_3_ATTESTATION / documented HUMAN_APPROVAL stand-in), SCRIBE TT
send (`TTManagerReview.tsx:164`, TIME_CORRECTION_SENT), travel decisions (routed to NEXUS
`recordTravelDecision`, TRAVEL_APPROVAL), APEX attestation/hold
(`useReportGenerator.ts:50,93`), COUNSEL decision record (`DecisionRecordPanel.tsx` /
useDecisionRecord), FLOWPATH workstyle (hashed `actor_id`, `IndividualWorkstyle.tsx:96`).

**D4-3 · LOW (documented) —** VIGIL's `INVESTIGATING` transition emits nothing — a known
governance taxonomy gap recorded in-file (`useAlertResponse.ts:18-21`). **D4-4 · INFO
(documented) —** TRACER chain assembly and ARC modeling emit no TS-side events (their event types
are Python-only); these are read/model operations, not decisions. No consequential human action in
any audited module is silent.

### 4.3 GD-10 classification boundary — enforced centrally; one overclaia note

Enforcement lives in `sovereign-api-client/src/routing.ts:40-64`: `ClassificationNotAuthorizedError`
with the **exact canonical message** ("This classification level is not authorized for processing in
SOVEREIGN. Contact your system administrator."), thrown by `assertClassificationAuthorized` for
anything above UNCLASSIFIED, called before provider selection. NEXUS intake reuses it
(`useRequestRegistry.ts:23,99`) — no divergent duplicate. The dev user's `clearance_level: "CUI"`
in `main.tsx` is an auth attribute (what the *user* may see), distinct from `data_classification`
(what a *request* carries) — not a boundary violation.

**D4-5 · LOW — the ARIA/VIGIL banner overclaims blocking.** `module-aria/src/banners.tsx:86-89`
says CUI+/classified "attempts … are blocked and logged," but no classification screening exists in
`module-aria` or `module-vigil` source; free-text inputs are unscreened and enforcement lives at
the api-client/intake seam. The claim is true of the platform's LLM/intake paths, not of these
modules' own inputs. **D4-7 · INFO —** VIGIL agent cards declare
`data_classification_ceiling: "CUI"` (`module-vigil/src/index.ts:88,109`) — an apparent pre-GD-10
declaration never revisited; no runtime effect observed.

### 4.4 Secrets and dependency hygiene

- **Hardcoded secrets: none.** Repo-wide scan for key/token/password/private-key patterns found
  nothing real. `token: "dev-token-synthetic"` (`main.tsx:108`) is disclosed synthetic auth. No
  `.env` files exist in the repo.
- **D4-6 · MED (platform-wide posture) — the Anthropic key pattern ships to the browser.**
  Seven modules share an identical `anthropic-key.ts` reading `VITE_ANTHROPIC_API_KEY` via
  `import.meta.env`; any `VITE_`-prefixed var compiles into client-served JS. Dev/synthetic-only
  today (no key configured anywhere), but this needs a platform-level answer (server-side proxy or
  runtime injection) before any real key ever exists. One shared finding, not seven.
- **D4-8 · LOW (posture) — governed writes from the landing page, role-blind.** PlatformHome's
  WG-17 expiry sweep runs for every role including READ_ONLY: it auto-expires VIGIL requests, emits
  `AGENT_ACTION_EXPIRED` (system-attributed — no false user attribution), and republishes queues
  (`PlatformHome.tsx:329-353`). Deliberate per WG-17; noted as posture, not defect. The same is
  true of startup publishing (`startup-publish.ts`, documented as intended).
- **LENS grounding gap (also a data finding): D4-9 · LOW —** the lens-explainer registry entry
  requires six governance explanation source documents; `module-lens/src/source-documents.ts:22`
  defines exactly **two** (`vigil_alert_response`, `vigil_agent_approvals`), neither of which is in
  the registry's list of six. Explainer grounding is real but limited to VIGIL topics; the 3-tier
  fallback discloses degradation. The registry's build dependency is unmet.
- **Workspace Activity view:** non-admins see only their own `actor_name`-matched events (equality
  filter, `WorkspaceApp.tsx:441`); `actor_name` is structurally guaranteed on HUMAN_DECISION events
  (logger rejects them without it, `shell.ts:236-253`). No cross-user leakage; admin "everyone"
  toggle is explicit and labeled. LOW note: system events (expiries, fallbacks) are invisible to
  non-admins with no disclosure that the view excludes them.
- **`npm audit --omit=dev`** (exact command): `found 0 vulnerabilities`.

### 4.5 Process observations (not code)

- **Correction, added at Governance Agent review (July 23):** this bullet originally claimed
  `docs/Session55_Handoff.md` and `docs/Session55_SBOM_Update.md` sit untracked in `docs/`. That
  claim was checked directly and is wrong — both files are committed at the **repo root**
  (`./Session55_Handoff.md`, `./Session55_SBOM_Update.md`), placed there several sessions ago
  specifically so Session 56's gather script could reach them; `git status` shows a clean working
  tree. No action needed on this item.
- The stale `SOVEREIGN_Role_Access_Matrix_20260718.md` still sits at the repo root beside the
  corrected `_20260721` version — a "current version only" folder-rule candidate for disposal.

---

## 5 — Per-module findings

Modules not listed under a finding had none beyond what §3/§4 already state. Full-treatment
modules first.

### 5.1 Home Dashboard / shell — full treatment
Findings D3-5, D3-6, D3-7, D3-9, D3-11, D4-8. Additional: To Do/Review badge sums all accessible
queues but renders only four hardcoded module groups — a fifth publisher's items would be counted
but invisible (INFO, HYPOTHESIS — no fifth publisher exists); `module-workspace` is missing from
the sidebar's `MODULE_INFO` map, so it renders without a three-word label or ⓘ popover (INFO,
guarded — no crash); a rapid double module selection could theoretically interleave mounts (LOW,
HYPOTHESIS — needs runtime verification). Verified-fine: startup-publish respects both session
stores and the ARIA surface; StrictMode double-effects are all safe; empty states are honest;
`PROGRAM_DATA_ROLES` matches the matrix.

### 5.2 Reviewer's Workspace — full treatment
Findings D3-10, D4-2, and the Activity notes in §4.4. Additional: payload narrowing is unvalidated
`as` casts trusting the `module_id` discriminant — the documented platform pattern, flagged INFO;
"Open in module" targets are role-consistent by construction, not by check (INFO — breaks silently
if section/module role lists ever diverge); WG-16 count republishing is redundant-but-harmless
(last-write-wins). Verified-fine: the WG-5 "never mounted at once" claim genuinely holds; the
embedded components own all governed emits; `useReviewerWorkspaceItems` closes its subscribe race.

### 5.3 VIGIL — full treatment
Findings D3-1 (HIGH), D3-8, D3-9, D4-3, D4-6, D4-7. Additional: a Workspace decision is reflected
in VigilApp only via mount-time seeding — no live subscription on the session store (MED, masked
today by single-mounting; part of D3-9). Verified-fine: role gate exact; GD-27 initialState
narrowing safe on unknown ids; expiry emits use the single shared builder; failed Logger emits
fail closed and are surfaced, not swallowed.

### 5.4 ARIA — full treatment
Findings D3-2 (MED), D4-5. Additional: the CLEAR Dashboard lists `DOC-EVAL-PRG014` with a "Review
in Certification Queue →" link, but the queue's item set does not contain it — a permanently
pending document linking to a queue that can't certify it (LOW; inside a globally-disclosed
synthetic screen, trending (c)). Verified-fine: CLEAR certification state lives on the shell
surface and survives remounts (the hypothesized ARIA remount gap does **not** exist for CLEAR);
per-tab gates exact and unbypassable; ARC's non-routing buttons disclose "manual step in this
build"; TRACER's orphaned COUNSEL chain is deliberate honest reconciliation.

### 5.5 SCRIBE — deep targeted
Verified: WG-15 sent-session filtering holds at both mount publishers (`ScribeApp.tsx`); the PPBE
export gate genuinely reads `ctx.aria.isCertified` (`useExport.ts:81`); static drafting tier is
honestly labeled; Style DNA session scope disclosed; TT send emits TIME_CORRECTION_SENT; travel
decisions route to NEXUS's TRAVEL_APPROVAL emitter. No new findings beyond D4-6 (shared key
pattern).

### 5.6 APEX — deep targeted
Verified: WG-6 is resolved in code — `SYNTH_PPBE_PERIODS` covers FY 2026 Q1–Q4 with actuals
*derived* from seeded obligations by `synthPeriodForTimestamp`, one source of truth
(`ppbe-seed.ts:59`, `ppbe-data-adapter.ts:51-60`); the WG-11 misroute is gone (PPBE bar-clicks use
separate `ppbeDetailProgram` state → `PPBEProgramDetail`; World-Model path untouched); site
breakdown remains an honest disclosed placeholder; REPORT_ATTESTATION and REPORT_GENERATION_HELD
emit correctly; `publishProgramStatuses` on mount is idempotent last-write-wins (harmless, unlike
D3-1's class). No new findings.

### 5.7 NEXUS — targeted
Finding D3-3 (MED). Verified: GD-10 refusal at intake reuses the canonical api-client error; the
PPBE Coordination publisher is effect-gated on count changes; cross-module engine imports
(module-apex compliance engine, module-scribe drafter) are the sanctioned composition-root
injection pattern (Item 57), not a boundary violation. LOW note: NEXUS's Home tile count only
updates at startup and while the PPBE Coordination tab is mounted.

### 5.8 FLOWPATH — targeted
Finding D3-4 (MED). Verified: workstyle events carry the hashed analyst id as `actor_id` — never
cleartext — and user data classification (`IndividualWorkstyle.tsx:67,96,106`); sessions seed from
`SYNTHETIC_SESSIONS`.

### 5.9 AgentOS — targeted
Verified: Task Registry reads `ctx.taskSurface` with an honest empty state; role gate exact. Not
exhaustively traced: the full dispatch → VIGIL approval round-trip (covered by its 89 passing
tests; flagged as untraced-this-session, not as a finding).

### 5.10 CPMI — targeted
Verified: World Model tab renders from the synthetic dev port (`world-model-port.ts:66-73`),
disclosed; role gate exact. Gate runner emission verified at the grep level (GATE_3_ATTESTATION
present); full reasoning-chain trace not repeated this session.

### 5.11 COUNSEL — targeted
Verified: decision confirm emits HUMAN_DECISION; role gate exact (six roles, matching the matrix
including INDEPENDENT_REVIEWER). Full five-panel flow trace not repeated this session.

### 5.12 LENS — targeted
Finding D4-9 (2-of-6 source documents). Verified: role gate is all eight roles (the header
comment's "READ_ONLY placeholder" text is stale — D4-1); Pipeline Navigator honestly static;
transparency capture reads only LENS's own wrapped emissions.

---

## 6 — D5 record (the one code change this session)

16 new tests covering Session 59's reason-code chips — chip click appends to the note (with
single-space separation and trim), does not submit any decision, does not bypass any existing gate
(≥10-char minimum, Tier C counselId requirement, certify's destination/recipient capture), is
scoped per-document in the CLEAR queue, and leaves free-text behavior unaffected:
`module-vigil/tests/ApprovalDecisionPanel.test.tsx` (+6), `module-vigil/tests/ObligationDecisionPanel.test.tsx`
(+5), `module-aria/tests/ClearCertificationQueue.test.tsx` (+5). All pass; totals in the Session 60
Handoff's close table.

---

*SOVEREIGN Platform — End-to-End Assessment · Session 60 · July 23, 2026*
*Findings only — no fixes applied. Pre-Decisional · Internal Working Document*
