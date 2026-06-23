/** @jest-environment jsdom */
/**
 * module-lens — PipelineNavigator.test.tsx
 * Static orientation surface (no LLM call): derives the current product from
 * currentPath, lets the user pick any product, and renders that product's pipeline
 * orientation. Honest "no agents" copy for primary products.
 */
import { render, screen, fireEvent } from "@testing-library/react";

import { PipelineNavigator } from "../src/PipelineNavigator";
import { makeCtx } from "./test-helpers";

describe("PipelineNavigator", () => {
  it("orients on the product derived from currentPath", () => {
    render(<PipelineNavigator ctx={makeCtx({ currentPath: "/apex" })} />);
    expect(screen.getByText(/You are currently in APEX/)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "APEX", level: 3 })).toBeInTheDocument();
  });

  it("prompts the user to pick a product on a companion route", () => {
    render(<PipelineNavigator ctx={makeCtx({ currentPath: "/lens" })} />);
    expect(screen.getByText(/Pick a product below/)).toBeInTheDocument();
    // Defaults to the head of the pipeline.
    expect(screen.getByRole("heading", { name: "FLOWPATH", level: 3 })).toBeInTheDocument();
  });

  it("switches orientation when a pipeline chip is clicked", () => {
    render(<PipelineNavigator ctx={makeCtx({ currentPath: "/lens" })} />);
    fireEvent.click(screen.getByRole("button", { name: "CPMI" }));
    expect(screen.getByRole("heading", { name: "CPMI", level: 3 })).toBeInTheDocument();
  });

  it("is honest that no AI agents run inside primary products yet", () => {
    render(<PipelineNavigator ctx={makeCtx({ currentPath: "/nexus" })} />);
    expect(screen.getByLabelText("NEXUS orientation")).toHaveTextContent(
      /No AI agents are registered inside this product yet/i
    );
  });
});
