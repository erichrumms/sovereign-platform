# SOVEREIGN Platform — FedRAMP and Infrastructure Strategy
**Cloud Authorization, Data Classification Tiers, and Federal Deployment Position**

Document Type: Governance Strategy Record  
Version: 1.0 — May 2026  
Authority: Project Principal · SOVEREIGN Platform Governance Authority  
Status: APPROVED — incorporated into Integration Brief v1.3  
Classification: Pre-Decisional · Internal Working Document

---

## 1. The Question This Document Answers

SOVEREIGN is described as running on local or cloud hardware. Federal agencies and defense contractors will ask before any procurement: what is your FedRAMP authorization status, at what impact level, and what is the timeline? Silence on this question is not a gap that customers overlook during procurement.

This document states SOVEREIGN's infrastructure strategy, defines the three deployment tiers, and records the decisions that must be made before federal production deployment.

---

## 2. The Three-Tier Infrastructure Architecture

SOVEREIGN operates across three infrastructure tiers. Each tier has a distinct authorization profile, a distinct set of capable LLM providers, and distinct operational procedures. Data movement between tiers requires explicit authorization and is logged to the SOVEREIGN audit trail.

### Tier 1 — Commercial

**What it supports:** Uncontrolled information. Internal operations. Demonstrations. Prototype development. Development and staging environments.

**Authorization:** No government authorization required. Standard commercial cloud (AWS, Railway, or equivalent).

**LLM access:** Full range of commercially available models via standard API. Anthropic claude-sonnet-4 is the primary model for AI-dependent products.

**Current SOVEREIGN status:** All six products currently operate in Tier 1 with synthetic data. This is the correct state for the current development phase.

**Products in this tier:** All six products in prototype and development configurations.

---

### Tier 2 — Controlled Unclassified Information (CUI)

**What it supports:** CUI data as defined by the National Archives CUI Registry. Federal program management data. Personally Identifiable Information. Controlled technical information that is not classified.

**Authorization required:** FedRAMP Moderate authorization for all cloud components. For NEXUS at federal agency scale, this means AWS GovCloud (us-gov-east-1 or us-gov-west-1) with FedRAMP Moderate authorization. For LLM access, the commercial Anthropic API (`api.anthropic.com`) is **not** in the GovCloud boundary and cannot be used for CUI data processing.

**LLM access at Tier 2:** Options under evaluation:
- Self-hosted open-source model on government-controlled infrastructure (eliminates API dependency; requires MLOps capability)
- FedRAMP-authorized LLM provider (limited availability as of May 2026 — requires confirmation before Stage 5)
- Government-provided inference endpoint (agency-specific arrangement)

**This is the open architectural decision that must be resolved before Stage 5.** The sovereign-api-client abstraction layer (Architecture Section 14.2) is designed to make this substitution a configuration change rather than a rewrite. But the decision about which Tier 2 LLM solution to use must be made before NEXUS production architecture is locked.

**Products targeting this tier:** NEXUS (federal agency deployment), APEX (federal program data), FLOWPATH (CUI-Personnel), ARIA Suite (CUI compliance records), CPMI (when governing CUI programs).

---

### Tier 3 — Classified

**What it supports:** Classified national security information at SECRET or above. ITAR-controlled technical data. Compartmented program information.

**Authorization required:** Government-owned or government-controlled infrastructure only. No commercial cloud. Agency-specific security assessment and authorization under NIST RMF. Program-specific security requirements. US-person operational controls throughout.

**LLM access at Tier 3:** Fine-tuned and evaluated models on government-controlled infrastructure only. No external API calls. The model evaluation and approval process is program-specific and government-controlled.

**Current SOVEREIGN status:** Tier 3 deployment architecture is not yet designed. SOVEREIGN does not currently have a classified deployment path. This is an explicit gap — not an omission, a deferred design decision.

**Products targeting this tier:** NEXUS (SECRET-tier task routing), CPMI (classified program governance). Other products may follow depending on customer requirements.

**Government customer engagement required:** Before any Tier 3 deployment, government customer engagement on the questions in the Agent Identity Standard (clearance equivalence, insider threat monitoring) must be completed. This engagement should begin no later than Stage 3.

---

## 3. FedRAMP Authorization Strategy

### Current Status

SOVEREIGN has not initiated FedRAMP authorization. All products operate with synthetic data in Tier 1. The Governance Clock has not activated.

### The Timeline Reality

FedRAMP authorization for a new cloud service typically takes 12–18 months from initiation to authorization. This timeline is government-controlled, not development-controlled. It runs in parallel with development — it is not a post-development step.

This means: FedRAMP authorization preparation should begin at Stage 5 (NEXUS Production Build), which is the first stage targeting federal production deployment. If preparation begins at Stage 5, authorization may be granted by Stage 9 or Stage 10 — timing that allows a production federal deployment after full pipeline integration testing is complete.

If FedRAMP preparation is deferred until after Stage 9, the gap between "development complete" and "deployment authorized" is 12–18 months of waiting.

### Authorization Path

**Impact Level target:** FedRAMP Moderate as the baseline. This covers the majority of federal agency CUI use cases. FedRAMP High may be required for specific agency deployments — this is determined by the agency's data classification, not by SOVEREIGN's design.

**Authorization approach:** Agency Authorization (A-ATO) with a sponsoring agency is faster than the Joint Authorization Board (JAB) path for a platform of SOVEREIGN's current scale and customer profile. The first federal agency customer engagement is the natural sponsoring agency opportunity.

**ATO boundary:** Under Option C (Unified Shell + Module Apps), the ATO boundary is the shell. All modules operate within the shell's ATO authority. This means one System Security Plan, one penetration test, one AO review cycle — not one per product. This is a significant efficiency advantage of the Option C architecture.

---

## 4. On-Premise Deployment

SOVEREIGN's Option C monorepo architecture supports on-premise deployment for agencies that require it. AgentOS already demonstrates the local deployment model (Mac Mini M-series hardware). For NEXUS at federal scale, on-premise deployment requires:

- Agency-provided infrastructure meeting NIST SP 800-53 control requirements
- Agency IT operations ownership of deployment and patching
- SOVEREIGN providing the software stack; agency providing the infrastructure authorization
- Separate System Security Plan for on-premise vs. cloud deployment

On-premise deployment eliminates the FedRAMP requirement but creates a different authorization path (FISMA ATO through the agency's own ISSO and AO). Timeline is comparable.

---

## 5. What Prospective Federal Customers Should Understand

**SOVEREIGN will be honest with prospective federal customers about the following:**

1. Current status is development-phase with synthetic data. No federal data has entered any product. No ATO exists.

2. FedRAMP authorization at Moderate impact level is the target for Tier 2 cloud deployment. The 12–18 month authorization timeline begins when initiated — not when the software is complete.

3. The Tier 2 LLM provider decision is an open architectural question. SOVEREIGN will not make representations about which AI models process federal data until that decision is resolved and authorized.

4. Tier 3 (classified) deployment architecture is not yet designed. SOVEREIGN does not currently support classified environments. Classified deployment is a future capability requiring government customer engagement and program-specific security approval.

5. The Federal Records Act, FedRAMP, FISMA, and ITAR compliance requirements are designed into SOVEREIGN's architecture — not retrofitted. The records management position (see companion document) reflects this.

---

## 6. Open Decisions (Must Resolve Before Stage 5)

| Decision | Blocker For | Resolution Path |
|---|---|---|
| Tier 2 LLM provider selection | NEXUS federal production deployment | Stage 4 architectural decision; sovereign-api-client abstraction makes this a config change |
| FedRAMP sponsoring agency identification | Authorization timeline | First federal customer engagement; begin Stage 5 |
| ATO boundary definition (NEXUS specifically) | ISSO engagement | Stage 5 prerequisite — governance record completion |
| Tier 3 architecture design | Classified program deployment | Deferred — requires government customer engagement |
| SBOM completeness verification | FedRAMP authorization package | SBOM_Registry.md maintained via End of Session Prompt from Session 1; verified complete at Stage 5 |

## 7. SBOM Requirement

**Software Bill of Materials (SBOM)** is a formal, machine-readable inventory of every software component in SOVEREIGN — every library, package, framework, and dependency — with version numbers, licensing, and provenance information.

**Why it is required:**

Executive Order 14028 (Improving the Nation's Cybersecurity, May 2021) requires that software sold to federal agencies include an SBOM. This is a procurement requirement, not advisory guidance. Without a complete SBOM, SOVEREIGN cannot be sold to federal agencies through most contract vehicles.

**What it enables:**

- **Vulnerability response:** When a vulnerability is discovered in a library (e.g., Log4Shell), an SBOM allows immediate determination of whether SOVEREIGN is affected. Without one, the assessment requires an expensive manual audit under time pressure.
- **Supply chain verification:** The SBOM makes the "no non-U.S. controlled components in decision-critical paths" requirement verifiable. Without it, that compliance checklist item cannot be checked.
- **License compliance:** Confirms that all component licenses are compatible with federal use and with SOVEREIGN's licensing terms.

**How it is maintained:**

SBOM_Registry.md is updated at the end of every development session via the End of Session Prompt SBOM step. Every `pip install`, `npm install`, new API endpoint, and new external service is logged with package name, version, type, product(s) using it, date added, purpose, and licensing. The SBOM is built from Session 1 — never reconstructed from memory.

**FedRAMP authorization package:** The SBOM is a required component of the FedRAMP authorization package. A complete, current SBOM at Stage 5 means it is ready for the authorization package without additional effort. A reconstructed SBOM is never fully accurate and will be challenged during review.

---

*SOVEREIGN FedRAMP and Infrastructure Strategy v1.0 · May 2026*  
*Pre-Decisional · Internal Working Document*
