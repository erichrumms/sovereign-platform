/** @jest-environment jsdom */
/**
 * module-scribe — ScribeApp.test.tsx
 * The composition root renders the SCRIBE chrome and the eight-mode selector.
 * Selecting one of the six product-aligned modes opens the DraftWorkspace; the two
 * intermediate modes (synthesis, framing) open the IntermediateWorkspace.
 */
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

import { ScribeApp } from "../src/ScribeApp";
import { makeCtx } from "./test-helpers";
import {
  markScribeItemSent,
  resetScribeSessionForTests,
} from "../src/scribe-sent-session";
import { DEMO_TT_REVIEW_ITEMS } from "../src/tt-synthetic-review";
import { ttReviewItemKey } from "../src/TTManagerReview";
import { SCRIBE_WORKSPACE_MODULE_ID } from "../src/scribe-workspace-publisher";

describe("ScribeApp", () => {
  it("renders the SCRIBE chrome and the eight drafting modes", () => {
    render(<ScribeApp ctx={makeCtx()} />);
    expect(screen.getByRole("heading", { name: "SCRIBE", level: 1 })).toBeInTheDocument();
    expect(screen.getByText(/Drafting & Style DNA/)).toBeInTheDocument();
    const list = screen.getByRole("list", { name: /drafting modes/i });
    expect(list.querySelectorAll('[role="listitem"]')).toHaveLength(8);
  });

  it("opens the drafting workspace when a product-intake mode is selected", () => {
    render(<ScribeApp ctx={makeCtx()} />);
    // Click the mode-button label (unique before selection); the click bubbles to
    // the button's onClick.
    fireEvent.click(screen.getByText("Correspondence Draft"));
    expect(screen.getByRole("heading", { name: "Correspondence Draft" })).toBeInTheDocument();
    expect(screen.getByLabelText(/Captured material/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /generate draft/i })).toBeInTheDocument();
    expect(screen.getAllByText(/NEXUS/).length).toBeGreaterThan(0);
  });

  it("opens the intermediate workspace for synthesis/framing (no product export)", () => {
    render(<ScribeApp ctx={makeCtx()} />);
    fireEvent.click(screen.getByText("Synthesis"));
    // The intermediate workspace renders — no draft/export gate, a Synthesize action.
    expect(screen.getByRole("button", { name: /Synthesize material/i })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /generate draft/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /export to/i })).not.toBeInTheDocument();

    fireEvent.click(screen.getByText("Framing"));
    expect(screen.getByRole("button", { name: /Frame material/i })).toBeInTheDocument();
  });

  it("injects a saved Style DNA profile into the drafting workspace (D2)", async () => {
    render(<ScribeApp ctx={makeCtx()} />);

    // Analyse (static tier, key-less) then approve storage of the profile.
    fireEvent.change(screen.getByLabelText(/Writing samples/i), {
      target: { value: "Short. Direct. To the point." },
    });
    fireEvent.click(screen.getByRole("button", { name: /Analyse writing samples/i }));
    await waitFor(() => expect(screen.getByRole("button", { name: /Save profile/i })).toBeInTheDocument());
    fireEvent.click(screen.getByRole("button", { name: /Save profile/i }));
    expect(screen.getByText(/Active profile/i)).toBeInTheDocument();

    // Open a drafting mode — the workspace reflects the active Style DNA.
    fireEvent.click(screen.getByText("Correspondence Draft"));
    expect(screen.getByText(/Style DNA active/i)).toBeInTheDocument();
  });
});

describe("ScribeApp WG-15 — sent-session filtering on mount effects", () => {
  beforeEach(() => resetScribeSessionForTests());

  it("fresh session — mount effects publish the full DEMO_TT_REVIEW_ITEMS count to both surfaces", () => {
    const ctx = makeCtx();
    render(<ScribeApp ctx={ctx} />);

    // workQueueSurface receives the full pending count.
    const queue = ctx.workQueueSurface.listForModule("scribe");
    expect(queue).toHaveLength(1);
    expect(queue[0].count).toBe(DEMO_TT_REVIEW_ITEMS.length);

    // reviewerWorkspaceSurface receives all items.
    expect(ctx.reviewerWorkspaceSurface.listForModule(SCRIBE_WORKSPACE_MODULE_ID)).toHaveLength(
      DEMO_TT_REVIEW_ITEMS.length
    );
  });

  it("after markScribeItemSent, mount effects exclude that item from both published surfaces", () => {
    const sentItem = DEMO_TT_REVIEW_ITEMS[0];
    markScribeItemSent(ttReviewItemKey(sentItem));

    const ctx = makeCtx();
    render(<ScribeApp ctx={ctx} />);

    // workQueueSurface count is one fewer.
    const queue = ctx.workQueueSurface.listForModule("scribe");
    expect(queue[0].count).toBe(DEMO_TT_REVIEW_ITEMS.length - 1);

    // reviewerWorkspaceSurface is also missing that item.
    expect(ctx.reviewerWorkspaceSurface.listForModule(SCRIBE_WORKSPACE_MODULE_ID)).toHaveLength(
      DEMO_TT_REVIEW_ITEMS.length - 1
    );
  });
});
