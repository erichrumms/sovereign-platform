# CPMI Stage 3 Completion — Session 12 Architecture
## Document ID: 09_CPMI_Stage3_Completion.md | Version 1.0 | June 23, 2026

**Classification:** Pre-Decisional · Internal Working Document
**Parent Brief:** SOVEREIGN Platform Integration Brief v1.18
**Status:** Approved for Session 12 Build

---

## §1 — Purpose and Scope

Session 12 completes Stage 3 by running the CPMI module through a full end-to-end
CPMI-VRS certification cycle on synthetic program data and wiring the live world model
port by configuration. Everything that can proceed without the Project Principal
proceeds autonomously. Gate 3 attestation — the one human decision in the cycle — is
prepared and surfaced; the Project Principal approves it on return.

**What Session 11 left ready:**
- Six-step reasoning chain — built and tested
- Gate runner (Gates 1–4) — built and tested
- VRS certification engine — built and tested
- Synthetic/dev WorldModelPort — in place
- All three CPMI agents — implemented

**What Session 12 adds:**
- D1: Known-answer benchmark suite for Gate 3 validation
- D2: End-to-end Gate 1 → Gate 2 → Gate 3 preparation → Gate 4 baseline
- D3: Notion-backed WorldModelPort wired by configuration (Constraint #3 —
  no CPMI rewrite)

**What Session 12 does NOT do:**
- Issue the Gate 3 attestation — that is a Project Principal human decision,
  performed on return
- Activate the Governance Clock
- Connect to any live external system beyond what configuration enables

---

## §2 — The Known-Answer Benchmark Suite (D1)

Gate 3 requires accuracy validation before the Project Principal can attest.
The benchmark suite provides the evidence base for that attestation.

### 2.1 What the Benchmark Does

The benchmark runs the CPMI reasoning chain against a set of program scenarios
with known correct governance outputs. It compares the chain's actual outputs
against the expected outputs and produces a structured report showing:

- Schema compliance rate (must be 100% — every output must be schema_valid: true)
- Step completion rate (must be 100% — all six steps must complete for every scenario)
- Recommendation alignment score (qualitative — how closely the recommendation
  matches the expected governance direction)
- Any steps where the chain produces unexpected or incomplete output

### 2.2 Benchmark Scenarios (Synthetic)

Three synthetic program scenarios covering the range of CPMI workloads:

**Scenario A — On-Track Program**
A program proceeding within schedule, cost, and performance parameters. Expected
governance output: no material risks, standard constraint mapping, recommendation
to continue with routine oversight.

**Scenario B — At-Risk Program**
A program with cost overrun and schedule slip. Expected governance output: P1/P2
risks identified, constraint mapping flags reprogramming approval requirements,
recommendation includes corrective action options with tradeoff analysis.

**Scenario C — Compliance Gap**
A program missing required documentation for a regulatory filing. Expected
governance output: P1 compliance risk, constraint mapping identifies the specific
regulatory requirement, recommendation prioritizes gap closure over other actions.

### 2.3 Benchmark Output Schema

```typescript
interface BenchmarkReport {
  run_id: string;
  run_at: string;           // ISO timestamp
  scenarios_run: number;    // must be 3
  schema_compliance_rate: number;   // must be 1.0 (100%)
  step_completion_rate: number;     // must be 1.0 (100%)
  scenario_results: ScenarioResult[];
  gate3_ready: boolean;     // true only if schema and step rates are both 1.0
  workflow_step_id: string;
}

interface ScenarioResult {
  scenario_id: 'A' | 'B' | 'C';
  schema_valid: boolean;
  steps_completed: number;  // must be 6
  recommendation_present: boolean;
  output: ReasoningChainOutput;
}
```

`gate3_ready: true` is the programmatic gate that allows the Gate 3 attestation
surface to activate. Claude Code does not issue the attestation — it surfaces the
benchmark report and enables the attestation UI for the Project Principal.

---

## §3 — End-to-End Certification Cycle (D2)

### 3.1 Gate 1 — Auto (Claude Code runs this)

Gate 1 verifies scope and boundary documentation is complete for the CPMI module
itself. For a self-certification of the CPMI module (the governance engine
certifying itself is the first certification event), Gate 1 checks:

- CPMI module's intended use is documented (08_CPMI_Architecture.md §1)
- Data classification routing is defined (synthetic/dev this session)
- Output schema is specified (ReasoningChainOutput in @sovereign/data)
- Agent registrations are on record (Agent_Identity_Standard.md v1.2)

Gate 1 auto-records `CPMI_VRS_GATE_1_PASSED` Logger event.

### 3.2 Gate 2 — Auto (Claude Code runs this)

Gate 2 verifies transparency — model identity, prompt registration, agent
registration, SBOM entry.

- Model identity: Anthropic claude-sonnet via createSovereignClient() — confirmed
- Prompt: PR-CPMI-001 APPROVED June 23, 2026 — confirmed
- Agents: cpmi.reasoning-chain, cpmi.world-model-api, cpmi.vrs-certification
  — all in Agent_Identity_Standard.md v1.2
- SBOM entry: module-cpmi v1.0.0 in SBOM_Registry v1.12

Gate 2 auto-records `CPMI_VRS_GATE_2_PASSED` Logger event.

### 3.3 Gate 3 — Human attestation (Project Principal on return)

Gate 3 requires the Project Principal to review the benchmark report and attest
that the accuracy is acceptable. Claude Code:

1. Runs the known-answer benchmark suite (D1)
2. Produces the `BenchmarkReport`
3. Verifies `gate3_ready: true`
4. Displays the benchmark report in the `GateRunnerPanel`
5. Enables the Gate 3 attestation button
6. **STOPS AND WAITS** — does not proceed to Gate 4

The Project Principal reviews the report and approves Gate 3 attestation on return.
The attestation emits `CPMI_VRS_GATE_3_ATTESTED` with `decision_type: GATE_3_ATTESTATION`.
After attestation, `RE_EXECUTE` fires — the reasoning chain runs once more with fresh
world model data before the Gate 4 baseline is established.

### 3.4 Gate 4 — Auto (Claude Code runs this AFTER Gate 3 attestation)

Gate 4 establishes the Anomaly Detector baseline and confirms VIGIL alert routing.

- Runs the reasoning chain three times on synthetic data to establish a behavioral
  baseline (latency, output variance, schema compliance rate)
- Registers the baseline with the Anomaly Detector at the 0.7× threshold
- Confirms `CPMI_DRIFT_DETECTED` routes to VIGIL as P1 (synthetic test alert)
- Records `CPMI_VRS_GATE_4_PASSED` Logger event

After Gate 4, `cpmi.vrs-certification` issues the first VRS certificate in the
platform's history. The certificate records:

```typescript
interface VRSCertificate {
  certificate_id: string;       // UUID
  product_id: 'cpmi';
  issued_at: string;            // ISO timestamp
  issued_by: 'cpmi.vrs-certification';
  gate_1_event_id: string;
  gate_2_event_id: string;
  gate_3_attestation_event_id: string;
  gate_4_event_id: string;
  attesting_principal: string;  // Project Principal
  certificate_status: 'ACTIVE';
  workflow_step_id: string;
}
```

**This is the first VRS certificate in the SOVEREIGN Platform.** It authorizes CPMI
to serve as the governance engine for all subsequent product builds. It does not
authorize any other product — each product earns its own certificate through its
own gate sequence.

---

## §4 — World Model Port Wiring (D3)

The Notion-backed WorldModelPort is wired by configuration — no CPMI rewrite
(Constraint #3). This is identical in pattern to the VIGIL_ALERT_ENDPOINT wiring
in Session 9.

**What changes:**
- New `cpmi-world-model-endpoint.ts` — isolated reader for
  `VITE_CPMI_WORLD_MODEL_ENDPOINT` and `VITE_NOTION_API_KEY`, mirroring the
  `vigil-endpoint.ts` pattern
- `world-model-port.ts` sources the endpoint from the reader — default null
  preserves synthetic/dev backing
- When `VITE_CPMI_WORLD_MODEL_ENDPOINT` is set, the port connects to the live
  Notion world model; when null, synthetic backing remains

**What does not change:** The reasoning engine, the gate runner, the UI panels,
or any other CPMI component. This is a configuration seam, not a rewrite.

**Synthetic/dev backing remains the default** — Governance Clock is OFF, all data
SYNTHETIC. Setting the endpoint activates live operation and is a future governance
decision.

---

## §5 — New Files

| File | Purpose |
|---|---|
| `module-cpmi/src/benchmark.ts` | Known-answer benchmark suite — three scenarios, BenchmarkReport schema, gate3_ready logic |
| `module-cpmi/src/useBenchmark.ts` | Benchmark hook — runs suite, Logger emission, surfaces report |
| `module-cpmi/src/BenchmarkPanel.tsx` | Benchmark results UI — scenario results, compliance rates, Gate 3 attestation surface |
| `module-cpmi/src/cpmi-world-model-endpoint.ts` | Isolated reader for world model endpoint config |
| `module-cpmi/tests/benchmark.test.ts` | Benchmark suite tests |
| `module-cpmi/tests/useBenchmark.test.ts` | Benchmark hook tests |
| `module-cpmi/tests/BenchmarkPanel.test.tsx` | Benchmark UI tests |

**Changed files:**
- `module-cpmi/src/world-model-port.ts` — sources endpoint from config reader
- `module-cpmi/src/GateRunnerPanel.tsx` — adds BenchmarkPanel tab, Gates 1/2
  auto-run UI, Gate 3 attestation activation (enabled only when gate3_ready: true)
- `module-cpmi/src/CpmiApp.tsx` — wires benchmark into the gate runner flow

**No shell-contract change.** All event types needed (`CPMI_VRS_GATE_*`,
`CPMI_REASONING_CHAIN_COMPLETE`, `GATE_3_ATTESTATION`) are already in v1.5.

---

## §6 — Session 12 Done Condition

**D1 — Known-Answer Benchmark Suite**
- Three synthetic scenarios (A: on-track, B: at-risk, C: compliance gap)
- `BenchmarkReport` schema with `gate3_ready` boolean
- All three scenarios produce `schema_valid: true` and `steps_completed: 6`
- `gate3_ready: true` confirmed before Gate 3 surface activates
- Full test coverage

**D2 — End-to-End Gate Cycle (autonomous portion)**
- Gate 1 auto-runs and records `CPMI_VRS_GATE_1_PASSED`
- Gate 2 auto-runs and records `CPMI_VRS_GATE_2_PASSED`
- Benchmark suite runs, `gate3_ready: true` confirmed
- Gate 3 attestation surface enabled and displayed — **Claude Code stops here**
- Session handoff produced with Gate 3 attestation instructions for Project Principal

**D3 — World Model Port Configuration Wiring**
- `cpmi-world-model-endpoint.ts` built
- `world-model-port.ts` sources from config reader
- Default null preserves synthetic/dev backing
- Live Notion endpoint activates by setting `VITE_CPMI_WORLD_MODEL_ENDPOINT`
- Tests updated

**Gate 3 attestation and Gate 4 baseline** are performed by the Project Principal
on return — they are not part of the autonomous done condition. The handoff document
must include exact instructions for the Project Principal to complete Gate 3 and
trigger Gate 4.

**Close requirements:**
- Full test suite — all JS suites including test:cpmi
- tsc --noEmit in sovereign-shell and module-cpmi — zero errors
- npm audit --omit=dev — zero production vulnerabilities
- Verify both shell-contract copies SHA-256 identical at v1.5 hash
  `8f50399cf5e03c33f3d2a809ff5a5c66167b98ba7aa980b418c259b1d4537a7a`
- Commit D1, D2, D3 to main (D1 and D2 may be one commit; D3 separate)
- Push to origin
- Produce Session 12 Handoff with Gate 3 attestation instructions
- Produce SBOM_Session12_Update.md

---

## §7 — Gate 3 Attestation Instructions (for Project Principal on return)

When Claude Code produces the handoff, it must include these instructions verbatim:

1. Open the SOVEREIGN dev server: `cd ~/Developer/sovereign-platform/sovereign-shell && npm run dev`
2. Navigate to the CPMI module
3. Open the Gate Runner panel
4. Review the Benchmark Report — confirm all three scenarios show schema_valid: true
   and steps_completed: 6
5. If the benchmark report is satisfactory, click the Gate 3 Attestation button
6. Enter attestation notes (minimum 10 characters)
7. Confirm — this emits `CPMI_VRS_GATE_3_ATTESTED` with `decision_type: GATE_3_ATTESTATION`
8. The reasoning chain will RE_EXECUTE automatically
9. Gate 4 baseline establishment runs automatically after RE_EXECUTE completes
10. The VRS certificate is issued automatically after Gate 4 passes
11. Return to Claude Chat and upload the Session 12 Handoff for the post-session cycle

---

*SOVEREIGN Platform · 09_CPMI_Stage3_Completion.md · v1.0 · June 23, 2026*
*Pre-Decisional · Internal Working Document*
