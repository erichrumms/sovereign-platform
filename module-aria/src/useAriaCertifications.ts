/**
 * SOVEREIGN Platform — module-aria
 * useAriaCertifications.ts — a React hook over the shell's ctx.aria certification surface.
 *
 * Subscribes to ctx.aria (the tenth shell export, GD-20) so a CLEAR panel re-renders
 * whenever a certification or flag is recorded. Returns the current snapshot plus a
 * helper that maps a document_id to its certification status (pending / certified /
 * flagged) for the Compliance Dashboard. The surface carries no governance authority of
 * its own (Constraint #1) — recording a decision still emits its own governed event in
 * the Certification Queue; this hook only reflects the surface state into the UI.
 *
 * Version: 1.0 · Session 23 · June 29, 2026
 */

import { useCallback, useEffect, useState } from "react";

import type { AriaCertification, SovereignShellContext } from "../../sovereign-shell/shell-contract";
import type { CertStatus } from "./clear-types";

export interface UseAriaCertifications {
  /** Snapshot of every recorded certification (re-rendered on change). */
  certifications: readonly AriaCertification[];
  /** The certification status of a document: certified / flagged / pending (no record). */
  statusOf: (documentId: string) => CertStatus;
}

export function useAriaCertifications(ctx: SovereignShellContext): UseAriaCertifications {
  const [certifications, setCertifications] = useState<readonly AriaCertification[]>(() => ctx.aria.list());

  useEffect(() => {
    // Re-sync on mount in case a decision landed between the initial read and subscribe.
    setCertifications(ctx.aria.list());
    return ctx.aria.subscribe((certs) => setCertifications(certs));
  }, [ctx]);

  const statusOf = useCallback(
    (documentId: string): CertStatus => {
      const record = ctx.aria.get(documentId);
      if (!record) return "pending";
      return record.certified ? "certified" : "flagged";
    },
    // Recompute when the snapshot changes so the dashboard reflects new decisions.
    [ctx, certifications]
  );

  return { certifications, statusOf };
}
