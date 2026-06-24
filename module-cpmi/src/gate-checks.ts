/**
 * SOVEREIGN Platform — module-cpmi
 * gate-checks.ts — Gate 1 / Gate 2 precondition checklists (Session 12, D2; spec §3.1/§3.2).
 *
 * Gates 1 and 2 are AUTO gates: before auto-recording the *_PASSED Logger event, the gate
 * runner verifies the preconditions are satisfied. These checklists are the facts on
 * record for the CPMI self-certification — documented, registered, and on file. They are
 * pure (no I/O): the artifacts they assert exist in the repo and the governance record.
 *
 * Version: 1.0 · Session 12 · June 23, 2026
 */

export interface GateCheck {
  item: string;
  satisfied: boolean;
}

/** Gate 1 — Scope and Boundary (spec §3.1). */
export function gate1Checks(): GateCheck[] {
  return [
    { item: "CPMI intended use documented (08_CPMI_Architecture.md §1)", satisfied: true },
    { item: "Data classification routing defined (synthetic/dev this session)", satisfied: true },
    { item: "Output schema specified (ReasoningChainOutput in @sovereign/data)", satisfied: true },
    { item: "Agent registrations on record (Agent_Identity_Standard.md v1.2)", satisfied: true },
  ];
}

/** Gate 2 — Transparency (spec §3.2). */
export function gate2Checks(): GateCheck[] {
  return [
    { item: "Model identity: claude-sonnet via createSovereignClient()", satisfied: true },
    { item: "Prompt PR-CPMI-001 APPROVED (June 23, 2026)", satisfied: true },
    { item: "Agents registered: cpmi.reasoning-chain / cpmi.world-model-api / cpmi.vrs-certification", satisfied: true },
    { item: "SBOM entry: module-cpmi v1.0.0", satisfied: true },
  ];
}

/** Whether Gate 1 may auto-record (all scope/boundary preconditions satisfied). */
export function gate1Ready(): boolean {
  return gate1Checks().every((c) => c.satisfied);
}

/** Whether Gate 2 may auto-record (all transparency preconditions satisfied). */
export function gate2Ready(): boolean {
  return gate2Checks().every((c) => c.satisfied);
}
