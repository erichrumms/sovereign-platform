/**
 * SOVEREIGN Platform — module-apex
 * report-generator.ts — apex.report-generator: deterministic document assembly (pure, no LLM).
 *
 * apex.report-generator is Operational: it takes a valid ApexAnalysisOutput from
 * apex.ai-assistant and assembles a formatted report artifact (MSR / QPR) or a complete DC-2
 * program dossier. It NEVER calls the LLM (it has no prompt) and performs no analysis — it
 * formats governed data into prose a non-technical reviewer can read (Gap 5).
 *
 * The sovereignHold() gate (spec §6): the spec names a platform function `sovereignHold()`.
 * The codebase's platform hold function is SovereignShellContext.governance.isOnHold(product)
 * (shell-contract Section 7). RECONCILIATION (Constraint #2 — no divergent duplicate, and
 * "import/call, do not reimplement"): this module calls the platform's isOnHold via the thin
 * `evaluateHold` adapter below — it does NOT reimplement a hold engine. When a hold is active
 * the report-generator halts and the caller logs REPORT_GENERATION_HELD.
 *
 * Version: 1.0 · Session 17 · June 25, 2026
 */

import type {
  ApexAnalysisOutput,
  ApexProgramRecord,
  ApexReportType,
  ProgramDossier,
  ApexExportFormat,
  ReasoningChainSummary,
  GovernanceDecisionRecord,
  AgentTaskRecord,
} from "./apex-contract";

export interface ReportSection {
  heading: string;
  body: string;
}

export interface ReportArtifact {
  report_type: ApexReportType;
  program_id: string;
  program_name: string;
  title: string;
  sections: ReportSection[];
  generated_at: string;
}

export interface HoldEvaluation {
  held: boolean;
  /** Plain-prose explanation of the hold (Gap 5). Empty string when not held. */
  reason: string;
}

const REPORT_TITLES: Record<ApexReportType, string> = {
  MSR: "Monthly Status Report",
  QPR: "Quarterly Program Review",
  AD_HOC: "Program Analysis",
};

/**
 * Evaluate the platform hold gate for APEX. `isOnHold` is the platform function
 * (ctx.governance.isOnHold) — passed in, never reimplemented. APEX is held if APEX itself is
 * on hold, or if CPMI (which APEX's analysis depends on) is on hold.
 */
export function evaluateHold(isOnHold: (product: "APEX" | "CPMI") => boolean): HoldEvaluation {
  if (isOnHold("APEX")) {
    return {
      held: true,
      reason:
        "Report generation is paused because the APEX product is currently on hold in the platform " +
        "governance status. A reviewer should resolve the hold before a report is generated or exported.",
    };
  }
  if (isOnHold("CPMI")) {
    return {
      held: true,
      reason:
        "Report generation is paused because the CPMI governance engine is currently on hold, and APEX " +
        "analysis depends on CPMI. A reviewer should resolve the CPMI hold before a report is generated.",
    };
  }
  return { held: false, reason: "" };
}

/** Assemble a formatted MSR / QPR report from a schema-valid analysis (deterministic). */
export function assembleReport(
  analysis: ApexAnalysisOutput,
  program: ApexProgramRecord,
  nowIso: string
): ReportArtifact {
  const sections: ReportSection[] = [
    { heading: "Program Status", body: analysis.status_narrative },
  ];

  if (analysis.risk_findings.length > 0) {
    const body = analysis.risk_findings
      .map(
        (f) =>
          `${f.description} This is a Priority ${f.severity.slice(1)} issue. The source of this finding is ` +
          `${f.source_data} The expected value was: ${f.baseline} The responsible party is ${f.responsible_party}.`
      )
      .join("\n\n");
    sections.push({ heading: "Risk Findings", body });
  } else {
    sections.push({ heading: "Risk Findings", body: "There are no open risk findings for this program." });
  }

  sections.push({
    heading: "Recommendations for Human Review",
    body: analysis.recommendations.join("\n\n"),
  });

  return {
    report_type: analysis.report_type,
    program_id: program.program_id,
    program_name: program.program_name,
    title: `${REPORT_TITLES[analysis.report_type]} — ${program.program_name} (${program.program_id})`,
    sections,
    generated_at: nowIso,
  };
}

export interface DossierInputs {
  program: ApexProgramRecord;
  reasoning_chain_history: ReasoningChainSummary[];
  governance_decisions: GovernanceDecisionRecord[];
  task_history: AgentTaskRecord[];
}

/**
 * Assemble the complete DC-2 program dossier — the full package, not a summary. Every DC-2
 * field is present: World Model record, reasoning chain history, governance decisions, risk
 * register, regulatory constraints, and AgentOS task history.
 */
export function assembleDossier(inputs: DossierInputs, exportFormat: ApexExportFormat, nowIso: string): ProgramDossier {
  return {
    program: inputs.program,
    reasoning_chain_history: inputs.reasoning_chain_history,
    governance_decisions: inputs.governance_decisions,
    risk_register: inputs.program.risk_flags,
    regulatory_constraints: inputs.program.regulatory_context,
    task_history: inputs.task_history,
    generated_at: nowIso,
    export_format: exportFormat,
  };
}

/** The DC-2 completeness check — a dossier is complete only when every required field is present. */
export function isDossierComplete(dossier: ProgramDossier): boolean {
  return (
    !!dossier.program &&
    Array.isArray(dossier.reasoning_chain_history) &&
    Array.isArray(dossier.governance_decisions) &&
    Array.isArray(dossier.risk_register) &&
    Array.isArray(dossier.regulatory_constraints) &&
    Array.isArray(dossier.task_history) &&
    !!dossier.generated_at
  );
}
