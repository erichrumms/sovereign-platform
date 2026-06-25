/**
 * module-nexus — request-router.test.ts
 * The routing table: each of the five work-request types maps to the specified agent class
 * and approval requirement.
 */
import { routeRequest, routingTable } from "../src/request-router";

describe("routeRequest", () => {
  it("DOCUMENT_REVIEW → Analytical · no approval", () => {
    expect(routeRequest("DOCUMENT_REVIEW")).toEqual({ agent_class: "Analytical", requires_approval: false });
  });
  it("DATA_ANALYSIS → Analytical · no approval", () => {
    expect(routeRequest("DATA_ANALYSIS")).toEqual({ agent_class: "Analytical", requires_approval: false });
  });
  it("COMPLIANCE_CHECK → Governance · requires approval", () => {
    expect(routeRequest("COMPLIANCE_CHECK")).toEqual({ agent_class: "Governance", requires_approval: true });
  });
  it("REPORT_GENERATION → Operational · no approval", () => {
    expect(routeRequest("REPORT_GENERATION")).toEqual({ agent_class: "Operational", requires_approval: false });
  });
  it("GOVERNANCE_QUERY → Governance · requires approval", () => {
    expect(routeRequest("GOVERNANCE_QUERY")).toEqual({ agent_class: "Governance", requires_approval: true });
  });

  it("only COMPLIANCE_CHECK and GOVERNANCE_QUERY require approval", () => {
    const table = routingTable();
    const requireApproval = Object.entries(table).filter(([, d]) => d.requires_approval).map(([t]) => t).sort();
    expect(requireApproval).toEqual(["COMPLIANCE_CHECK", "GOVERNANCE_QUERY"]);
  });
});
