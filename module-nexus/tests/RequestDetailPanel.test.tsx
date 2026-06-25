/** @jest-environment jsdom */
/**
 * module-nexus — RequestDetailPanel.test.tsx
 * The detail surface reads the AgentOS task status through the injectable port once the
 * request has been handed off; before hand-off it shows the not-handed-off placeholder.
 */
import { render, screen } from "@testing-library/react";

import { RequestDetailPanel } from "../src/RequestDetailPanel";
import { createSyntheticAgentOSPort, nexusAgentOSTaskId } from "../src/agentos-port";
import { createRequest, markRouted, markInProgress } from "../src/request-registry";
import { routeRequest } from "../src/request-router";
import type { WorkRequest } from "../src/nexus-contract";

const NOW = "2026-06-24T12:00:00.000Z";

function baseRequest(): WorkRequest {
  return createRequest(
    { request_id: "req-1", title: "Review SOW", description: "d", request_type: "DATA_ANALYSIS", data_classification: "UNCLASSIFIED", requester_id: "E-900" },
    NOW
  );
}

describe("RequestDetailPanel", () => {
  it("shows the not-handed-off placeholder before AgentOS submission", () => {
    render(<RequestDetailPanel request={baseRequest()} port={createSyntheticAgentOSPort()} />);
    expect(screen.getByText("Detail — req-1")).toBeInTheDocument();
    expect(screen.getAllByText(/not handed off|not routed/).length).toBeGreaterThan(0);
  });

  it("reads the AgentOS task status through the port after hand-off", () => {
    const port = createSyntheticAgentOSPort();
    const taskId = nexusAgentOSTaskId("req-1");
    port.submitTask({ request_id: "req-1", request_type: "DATA_ANALYSIS", agent_class: "Analytical", requires_approval: false, data_classification: "UNCLASSIFIED", workflow_step_id: "nexus-request-req-1" });

    let reqs = [baseRequest()];
    reqs = markRouted(reqs, "req-1", routeRequest("DATA_ANALYSIS"), NOW);
    reqs = markInProgress(reqs, "req-1", taskId, NOW);

    render(<RequestDetailPanel request={reqs[0]} port={port} />);
    expect(screen.getByText(taskId)).toBeInTheDocument();
    expect(screen.getByText("ASSIGNED")).toBeInTheDocument();
  });
});
