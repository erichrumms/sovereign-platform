/**
 * SOVEREIGN Platform — module-apex
 * useReportGenerator.ts — the apex.report-generator hook (deterministic; no LLM).
 *
 * Drives the document-production flow and its Logger emission (GD-16):
 *   - generateReport: enforces the platform hold gate (ctx.governance.isOnHold via
 *     evaluateHold — the spec's sovereignHold(); imported/called, never reimplemented). When
 *     held it logs REPORT_GENERATION_HELD and surfaces a plain-prose reason (Gap 5) and does
 *     NOT produce a report. Otherwise it assembles the report and logs APEX_REPORT_GENERATED.
 *   - attest: logs the REPORT_ATTESTATION human decision (Constraint #4 — decision_type,
 *     actor "human", actor_name). Required before any export.
 *   - exportDossier: requires the hold clear AND a logged attestation, then assembles the
 *     complete DC-2 dossier and logs APEX_DOSSIER_EXPORTED.
 *
 * Gate 2 (fail-closed): a failed Logger emit surfaces an error and blocks the action.
 *
 * Version: 1.0 · Session 17 · June 25, 2026
 */

import { useCallback, useState } from "react";

import type { SovereignShellContext } from "../../sovereign-shell/shell-contract";
import {
  APEX_REPORT_GENERATOR,
  dossierWorkflowStep,
  reportWorkflowStep,
  type ApexAnalysisOutput,
  type ApexExportFormat,
  type ApexProgramRecord,
  type ApexReportType,
  type ProgramDossier,
} from "./apex-contract";
import {
  assembleDossier,
  assembleReport,
  evaluateHold,
  type HoldEvaluation,
  type ReportArtifact,
} from "./report-generator";
import { createSyntheticApexDataAdapter, type ApexDataAdapter } from "./apex-data-adapter";

export interface UseReportGenerator {
  report: ReportArtifact | null;
  dossier: ProgramDossier | null;
  hold: HoldEvaluation | null;
  attested: boolean;
  error: string | null;
  /** Assemble a report from a schema-valid analysis. Blocked (logged) if a hold is active. */
  generateReport: (program: ApexProgramRecord, analysis: ApexAnalysisOutput) => void;
  /** Log the REPORT_ATTESTATION human decision. Required before export. */
  attest: (programId: string, reportType: ApexReportType, note: string) => void;
  /** Export the complete DC-2 dossier. Requires hold clear + a logged attestation. */
  exportDossier: (programId: string, exportFormat?: ApexExportFormat) => void;
  reset: () => void;
}

export interface UseReportGeneratorOptions {
  adapter?: ApexDataAdapter;
}

export function useReportGenerator(
  ctx: SovereignShellContext,
  opts: UseReportGeneratorOptions = {}
): UseReportGenerator {
  const actorId = ctx.auth.user.employee_id;
  const actorName = ctx.auth.user.name;
  const adapter = opts.adapter ?? createSyntheticApexDataAdapter();

  const [report, setReport] = useState<ReportArtifact | null>(null);
  const [dossier, setDossier] = useState<ProgramDossier | null>(null);
  const [hold, setHold] = useState<HoldEvaluation | null>(null);
  const [attested, setAttested] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // The platform hold function (ctx.governance.isOnHold) — passed to evaluateHold, never reimplemented.
  const isOnHold = useCallback(
    (product: "APEX" | "CPMI"): boolean => ctx.governance.isOnHold(product),
    [ctx]
  );

  const generateReport = useCallback(
    (program: ApexProgramRecord, analysis: ApexAnalysisOutput): void => {
      setError(null);
      setAttested(false);
      setReport(null);
      const workflowStep = reportWorkflowStep(program.program_id, analysis.report_type);
      const holdEval = evaluateHold(isOnHold);

      if (holdEval.held) {
        setHold(holdEval);
        try {
          ctx.logger.log({
            event_type: "REPORT_GENERATION_HELD",
            workflow_step_id: workflowStep,
            sovereign_tier: "standard",
            product: "APEX",
            actor_id: actorId,
            agent_id: APEX_REPORT_GENERATOR,
            outcome: "report_generation_held",
            payload: { program_id: program.program_id, hold_reason: holdEval.reason, actor: actorName },
          });
        } catch (err) {
          return surfaceLoggerError(err);
        }
        return; // held — no document produced
      }

      setHold(holdEval);
      const artifact = assembleReport(analysis, program, new Date().toISOString());
      try {
        ctx.logger.log({
          event_type: "APEX_REPORT_GENERATED",
          workflow_step_id: workflowStep,
          sovereign_tier: "standard",
          product: "APEX",
          actor_id: actorId,
          agent_id: APEX_REPORT_GENERATOR,
          outcome: "apex_report_generated",
          payload: { program_id: program.program_id, report_type: analysis.report_type, export_format: "FORMATTED_DOCUMENT" },
        });
      } catch (err) {
        return surfaceLoggerError(err);
      }
      setReport(artifact);

      function surfaceLoggerError(err: unknown): void {
        setError(`Logger emission failed — report generation halted (Gate 2): ${err instanceof Error ? err.message : String(err)}`);
      }
    },
    [ctx, actorId, actorName, isOnHold]
  );

  const attest = useCallback(
    (programId: string, reportType: ApexReportType, note: string): void => {
      setError(null);
      const trimmed = note.trim();
      if (trimmed === "") {
        setError("An attestation note is required before the report can be exported.");
        return;
      }
      const workflowStep = reportWorkflowStep(programId, reportType);
      try {
        ctx.logger.log({
          event_type: "HUMAN_DECISION",
          workflow_step_id: workflowStep,
          sovereign_tier: "standard",
          product: "APEX",
          actor_id: actorId,
          outcome: "apex_report_attested",
          decision_type: "REPORT_ATTESTATION", // Constraint #4
          actor: "human",
          actor_name: actorName,
          payload: { program_id: programId, report_type: reportType, note: trimmed },
        });
      } catch (err) {
        setError(`Logger emission failed — attestation not recorded (Gate 2): ${err instanceof Error ? err.message : String(err)}`);
        return;
      }
      setAttested(true);
    },
    [ctx, actorId, actorName]
  );

  const exportDossier = useCallback(
    (programId: string, exportFormat: ApexExportFormat = "PDF"): void => {
      setError(null);
      const program = adapter.getProgram(programId);
      if (!program) {
        setError(`No program record for "${programId}".`);
        return;
      }
      const holdEval = evaluateHold(isOnHold);
      if (holdEval.held) {
        setHold(holdEval);
        try {
          ctx.logger.log({
            event_type: "REPORT_GENERATION_HELD",
            workflow_step_id: dossierWorkflowStep(programId),
            sovereign_tier: "standard",
            product: "APEX",
            actor_id: actorId,
            agent_id: APEX_REPORT_GENERATOR,
            outcome: "dossier_export_held",
            payload: { program_id: programId, hold_reason: holdEval.reason, actor: actorName },
          });
        } catch (err) {
          setError(`Logger emission failed — dossier export halted (Gate 2): ${err instanceof Error ? err.message : String(err)}`);
        }
        return;
      }
      if (!attested) {
        setError("A human attestation (REPORT_ATTESTATION) must be recorded before the dossier can be exported.");
        return;
      }
      const built = assembleDossier(
        {
          program,
          reasoning_chain_history: adapter.getReasoningChainHistory(programId),
          governance_decisions: adapter.getGovernanceDecisions(programId),
          task_history: adapter.getTaskHistory(programId),
        },
        exportFormat,
        new Date().toISOString()
      );
      try {
        ctx.logger.log({
          event_type: "APEX_DOSSIER_EXPORTED",
          workflow_step_id: dossierWorkflowStep(programId),
          sovereign_tier: "standard",
          product: "APEX",
          actor_id: actorId,
          agent_id: APEX_REPORT_GENERATOR,
          outcome: "apex_dossier_exported",
          payload: { program_id: programId, actor: "human", actor_name: actorName, export_format: exportFormat },
        });
      } catch (err) {
        setError(`Logger emission failed — dossier export halted (Gate 2): ${err instanceof Error ? err.message : String(err)}`);
        return;
      }
      setDossier(built);
    },
    [ctx, actorId, actorName, adapter, isOnHold, attested]
  );

  const reset = useCallback((): void => {
    setReport(null);
    setDossier(null);
    setHold(null);
    setAttested(false);
    setError(null);
  }, []);

  return { report, dossier, hold, attested, error, generateReport, attest, exportDossier, reset };
}
