/** @jest-environment jsdom */
/**
 * module-scribe — useExport.test.tsx (Session 23 · D6)
 * The CLEAR export gate (ARIA Suite, GD-20): an existing pipeline document cannot be
 * exported until it holds a positive CLEAR certification on ctx.aria. A new draft with no
 * documentId is not subject to the gate. After certification the export proceeds.
 */
import { act, renderHook } from "@testing-library/react";

import { useExport, type ExportInput } from "../src/useExport";
import { makeCtx } from "./test-helpers";

// A schema-valid governance_memo draft (so the only thing under test is the CLEAR gate).
const VALID_MEMO = {
  subject: "Quarterly governance memo",
  cpmi_reference: "CPMI-2026-Q2",
  decision: "Proceed with the recommended option.",
  reasoning: "The evaluation supports the recommendation.",
  decision_type: "HUMAN_APPROVAL" as const,
};

function exportInput(documentId?: string): ExportInput {
  return {
    mode: "governance_memo",
    draft: VALID_MEMO,
    source: {
      mode: "governance_memo",
      capturedMaterial: "notes",
      context: { workflowStepId: "scribe-gate-test-1", ...(documentId ? { documentId } : {}) },
    },
    targetProduct: "CPMI",
  };
}

describe("useExport — CLEAR export gate (GD-20)", () => {
  it("blocks export of an uncertified pipeline document", () => {
    const navigateTo = jest.fn();
    const ctx = makeCtx({ navigateTo });
    const { result } = renderHook(() => useExport(ctx));

    let ok = true;
    act(() => {
      ok = result.current.approve(exportInput("DOC-NEEDS-CERT"));
    });
    expect(ok).toBe(false);
    expect(result.current.status).toBe("error");
    expect(result.current.error).toMatch(/not been certified by CLEAR/i);
    expect(navigateTo).not.toHaveBeenCalled();
  });

  it("opens export once the document is CLEAR-certified", () => {
    const navigateTo = jest.fn();
    const ctx = makeCtx({ navigateTo, certifiedDocumentIds: ["DOC-NEEDS-CERT"] });
    const { result } = renderHook(() => useExport(ctx));

    let ok = false;
    act(() => {
      ok = result.current.approve(exportInput("DOC-NEEDS-CERT"));
    });
    expect(ok).toBe(true);
    expect(result.current.status).toBe("exported");
    expect(navigateTo).toHaveBeenCalledWith("/cpmi");
  });

  it("does not gate a new draft that has no pipeline documentId", () => {
    const navigateTo = jest.fn();
    const ctx = makeCtx({ navigateTo });
    const { result } = renderHook(() => useExport(ctx));

    let ok = false;
    act(() => {
      ok = result.current.approve(exportInput()); // no documentId
    });
    expect(ok).toBe(true);
    expect(result.current.status).toBe("exported");
    expect(navigateTo).toHaveBeenCalledWith("/cpmi");
  });
});
