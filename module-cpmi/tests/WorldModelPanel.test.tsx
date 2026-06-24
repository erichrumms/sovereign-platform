/** @jest-environment jsdom */
/**
 * module-cpmi — WorldModelPanel.test.tsx
 * Read-only world-model query: renders a program record and discloses that updates are
 * human-gated and not enabled this session. No run/LLM control.
 */
import { render, screen } from "@testing-library/react";

import { WorldModelPanel } from "../src/WorldModelPanel";

describe("WorldModelPanel", () => {
  it("renders the selected program record and the read-only disclosure", () => {
    render(<WorldModelPanel />);
    expect(screen.getByLabelText("World Model")).toHaveTextContent(/read-only/i);
    expect(screen.getByLabelText("World Model")).toHaveTextContent(/WORLD_MODEL_UPDATE/);
    expect(screen.getByText(/Joint Logistics Modernization/)).toBeInTheDocument();
  });
});
