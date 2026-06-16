# SOVEREIGN Platform — Software Bill of Materials (SBOM)
**Maintained under Executive Order 14028 — Required for Federal Procurement**

Version: 1.2 — Session 1 Final Update
Last Updated: June 1, 2026
Classification: Pre-Decisional · Internal Working Document

---

## What This Document Is

The SBOM is the formal inventory of every software component in SOVEREIGN — every library, package, framework, and external service — with version numbers, licensing, and provenance. It is:

- **Required** by Executive Order 14028 for all software sold to federal agencies
- **The mechanism** that makes the "no non-U.S. controlled components in decision-critical paths" compliance requirement verifiable
- **Updated** at the end of every development session
- **Never reconstructed from memory** — built from Session 1 forward

---

## Session 1 — Confirmed Installed Dependencies (June 1, 2026)

All packages below were installed and confirmed on the development machine during Session 1.

### Python Dependencies — Security Framework

| Package | Version | Type | Product(s) | Date Installed | Purpose | License | Installed |
|---|---|---|---|---|---|---|---|
| pyyaml | 6.0.3 | Python | Security Framework · All products | 2026-06-01 | YAML config parsing for sovereign_config.yaml | MIT | ✓ 2026-06-01 |
| pytest | 9.0.3 | Python | Security Framework (testing) | 2026-06-01 | Unit test framework — 127 tests across 4 modules | MIT | ✓ 2026-06-01 |
| requests | 2.33.1 | Python | Security Framework | 2026-06-01 | HTTP client for Honeytoken webhook and Alert Dispatcher delivery | Apache 2.0 | ✓ 2026-06-01 |
| scikit-learn | 1.8.0 | Python | Security Framework | 2026-06-01 | IsolationForest anomaly detection — per-product baselines | BSD 3-Clause | ✓ 2026-06-01 |
| numpy | 2.4.4 | Python | Security Framework | 2026-06-01 | Feature vector construction for anomaly detection | BSD 3-Clause | ✓ 2026-06-01 |
| joblib | 1.5.3 | Python | Security Framework | 2026-06-01 | IsolationForest model serialization and persistence | BSD 3-Clause | ✓ 2026-06-01 |
| structlog | 25.5.0 | Python | Security Framework | 2026-06-01 | Structured operational logging for Alert Dispatcher | MIT | ✓ 2026-06-01 |

### Files Produced This Session

| File | Type | Location in Monorepo | Purpose |
|---|---|---|---|
| `shell-contract.ts` | TypeScript governance document | `sovereign-shell/shell-contract.ts` | Complete shell-to-module interface contract |
| `sovereign_logger.py` | Python | `sovereign-security/sovereign_logger.py` | Logger — 41 tests passing |
| `test_sovereign_logger.py` | Python | `sovereign-security/tests/test_sovereign_logger.py` | Logger test suite |
| `sovereign_honeytoken.py` | Python | `sovereign-security/sovereign_honeytoken.py` | Honeytoken Manager — 24 tests passing |
| `test_sovereign_honeytoken.py` | Python | `sovereign-security/tests/test_sovereign_honeytoken.py` | Honeytoken test suite |
| `sovereign_anomaly.py` | Python | `sovereign-security/sovereign_anomaly.py` | Anomaly Detector — 29 tests passing |
| `test_sovereign_anomaly.py` | Python | `sovereign-security/tests/test_sovereign_anomaly.py` | Anomaly Detector test suite |
| `sovereign_alerts.py` | Python | `sovereign-security/sovereign_alerts.py` | Alert Dispatcher — 33 tests passing |
| `test_sovereign_alerts.py` | Python | `sovereign-security/tests/test_sovereign_alerts.py` | Alert Dispatcher test suite |
| `sovereign_config.yaml` | YAML | `sovereign-security/sovereign_config.yaml` | Platform-wide Security Framework configuration |
| `__init__.py` | Python | `sovereign-security/__init__.py` | Package scaffold — SovereignSecurityFramework bundle |

**Total tests: 127 passing, 0 failing.**

---

## Session 0 — Baseline Registry (May 31, 2026)

### Python Dependencies (AgentOS and Security Framework — Documented Intent)

| Package | Version | Type | Product(s) | Date Documented | Purpose | License | Installed |
|---|---|---|---|---|---|---|---|
| mlflow | 2.x | Python | AgentOS | 2026-05-31 | ML experiment tracking and model registry | Apache 2.0 | Pending Stage 1 |
| scikit-learn | 1.x | Python | AgentOS · Security Framework | 2026-05-31 | IsolationForest anomaly detection | BSD 3-Clause | ✓ 2026-06-01 (v1.8.0) |
| pandas | 2.x | Python | AgentOS | 2026-05-31 | Data manipulation and feature engineering | BSD 3-Clause | Pending Stage 1 |
| numpy | 1.x | Python | AgentOS | 2026-05-31 | Numerical operations for ML pipeline | BSD 3-Clause | ✓ 2026-06-01 (v2.4.4) |
| scipy | 1.x | Python | AgentOS · Security Framework | 2026-05-31 | PSI + KS statistical tests for drift detection | BSD 3-Clause | Pending Stage 2 |
| pandera | 0.x | Python | AgentOS | 2026-05-31 | Data quality gate schema validation | MIT | Pending Stage 1 |
| pyyaml | 6.x | Python | AgentOS · Security Framework | 2026-05-31 | YAML config parsing | MIT | ✓ 2026-06-01 (v6.0.3) |
| joblib | 1.x | Python | AgentOS | 2026-05-31 | Model serialization and parallel processing | BSD 3-Clause | ✓ 2026-06-01 (v1.5.3) |
| structlog | 23.x | Python | Security Framework | 2026-05-31 | Structured logging for Alert Dispatcher | MIT | ✓ 2026-06-01 (v25.5.0) |
| requests | 2.x | Python | Security Framework | 2026-05-31 | HTTP client for Alert Dispatcher webhook delivery | Apache 2.0 | ✓ 2026-06-01 (v2.33.1) |
| fastapi | 0.1xx | Python | NEXUS | 2026-05-31 | Python API layer (port 8001) | MIT | Pending Stage 5 |
| uvicorn | 0.x | Python | NEXUS | 2026-05-31 | ASGI server for FastAPI | BSD 3-Clause | Pending Stage 5 |

### Node.js / npm Dependencies (Pending)

| Package | Version | Type | Product(s) | Date Documented | Purpose | License | Installed |
|---|---|---|---|---|---|---|---|
| express | 4.x | npm | NEXUS API | 2026-05-31 | Node.js HTTP server framework | MIT | Pending Stage 5 |
| react | 18.x | npm | Shell · All modules | 2026-05-31 | UI component framework | MIT | Pending Stage 1 |
| vite | 5.x | npm | Shell · NEXUS frontend | 2026-05-31 | Build tool and dev server | MIT | Pending Stage 1 |
| typescript | 5.x | npm | Shell · sovereign-data · sovereign-api-client | 2026-05-31 | Type-safe JavaScript | Apache 2.0 | Pending Stage 1 |
| pg | 8.x | npm | NEXUS | 2026-05-31 | PostgreSQL client | MIT | Pending Stage 5 |
| pgvector | 0.x | npm | NEXUS | 2026-05-31 | pgvector extension client | MIT | Pending Stage 5 |
| passport-saml | 3.x | npm | NEXUS | 2026-05-31 | EAMS SAML 2.0 authentication | MIT | Pending Stage 5 |

### Databases and Infrastructure

| Component | Version | Type | Product(s) | Date Documented | Purpose | License | Installed |
|---|---|---|---|---|---|---|---|
| PostgreSQL | 15 | System | NEXUS · APEX · ARIA | 2026-05-31 | Primary relational database | PostgreSQL License | Pending Stage 5 |
| SQLite (via sql.js) | v4 WebAssembly | npm | APEX (prototype) | 2026-05-31 | In-browser persistence | MIT | Prototype only |
| SQLite (native) | 3.x | System | AgentOS | 2026-05-31 | Per-application feature store | Public Domain | Confirmed on Mac Mini |

### External API Services

| Service | Version | Type | Product(s) | Date Documented | Purpose | Provider Jurisdiction | Installed |
|---|---|---|---|---|---|---|---|
| Anthropic API (claude-sonnet-4) | 20250514 | API | CPMI · FLOWPATH · APEX | 2026-05-31 | AI reasoning — Tier 1 only. NOT authorized for CUI. | USA | Active (Tier 1 only) |
| Notion API (MCP) | v1 | API | CPMI Track B | 2026-05-31 | CPMI Track B operational database | USA | Active |
| M365 GCC High Graph API | v1 | API | NEXUS | 2026-05-31 | Microsoft 365 integration — GCC High only | USA (GovCloud) | Pending Stage 5 |

---

## Supply Chain Compliance Notes

All components are from U.S.-origin providers or open-source projects with U.S.-based governance. Anthropic commercial API restricted to Tier 1 only. Tier 2 LLM provider decision remains open — tracked in FedRAMP Infrastructure Strategy.

---

## Session 2A — sovereign-api-client (June 2, 2026)

Detail: `sovereign-api-client/SBOM_Session2A_Update.md`. All **devDependencies** — zero production runtime npm deps (uses Node 18+ built-in `fetch`).

| Package | Version | Type | Product(s) | Date | Purpose | License | Installed |
|---|---|---|---|---|---|---|---|
| typescript | 5.9.3 | npm (devDep) | api-client · shell | 2026-06-02 | TS compiler | Apache 2.0 | ✓ |
| jest | 29.7.0 | npm (devDep) | api-client (test) | 2026-06-02 | Unit tests (143) | MIT | ✓ |
| ts-jest | 29.4.11 | npm (devDep) | api-client (test) | 2026-06-02 | TS preprocessor for Jest | MIT | ✓ |
| @types/jest | 29.5.14 | npm (devDep) | api-client (test) | 2026-06-02 | Jest types | MIT | ✓ |
| @types/node | 20.19.41 | npm (devDep) | api-client (test) | 2026-06-02 | Node built-in types | MIT | ✓ |

## Session 2B — sovereign-shell (June 2, 2026)

Detail: `sovereign-shell/SBOM_Session2B_Update.md`. First **production-runtime** npm deps in the platform (react, react-dom). Lockfile: `sovereign-shell/package-lock.json` (67 transitive packages).

| Package | Version | Type | Product(s) | Date | Purpose | License | Installed |
|---|---|---|---|---|---|---|---|
| react | 18.3.1 | npm (runtime) | shell · all modules | 2026-06-02 | UI framework | MIT | ✓ |
| react-dom | 18.3.1 | npm (runtime) | shell · all modules | 2026-06-02 | DOM renderer | MIT | ✓ |
| @types/react | 18.3.30 | npm (devDep) | shell | 2026-06-02 | React 18 types | MIT | ✓ |
| @types/react-dom | 18.3.7 | npm (devDep) | shell | 2026-06-02 | React-DOM types | MIT | ✓ |
| @vitejs/plugin-react | 4.7.0 | npm (devDep) | shell | 2026-06-02 | Vite React plugin | MIT | ✓ |
| vite | 5.4.21 | npm (devDep) | shell · NEXUS frontend | 2026-06-02 | Build tool (Vite 5) | MIT | ✓ |

**Baseline reconciliation:** the Session 0 "Pending Stage 1" entries for `react`, `vite`, and `typescript` are now **installed** at the versions above.

**Known advisory (recorded, not remediated):** 2 moderate `esbuild` ≤0.24.2 advisories (GHSA-67mh-4wv8-2f99), transitive via Vite 5 — **dev-server-only**, no production-runtime path; the only fix forces Vite 8 (breaking, violates Vite-5 spec). Revisit at the pre-production Vite major-version review (Stage 5+).

**Supply chain:** all Session 2A/2B packages MIT or Apache 2.0; U.S.-governed (Meta, Microsoft, OpenJS/VoidZero). No non-U.S.-controlled components introduced.

---

*SOVEREIGN SBOM Registry v1.3 · Session 2B · June 2, 2026 — Stage 1 npm toolchain installed*
*Pre-Decisional · Internal Working Document*
*Required under Executive Order 14028*
