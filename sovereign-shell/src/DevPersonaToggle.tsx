/**
 * SOVEREIGN Platform — sovereign-shell
 * DevPersonaToggle.tsx — DEV-only role switcher extracted for testability (Session 45).
 *
 * Extracted from main.tsx (Session 40/41 origin) into its own file so snapshot tests
 * can import the component without pulling in main.tsx's module-scope bootstrap
 * (createRoot, registerPlatformModules, etc.). No behavior change.
 *
 * Clearly labeled DEV so it cannot be mistaken for product UI. On selection change:
 * writes to localStorage and reloads the page — the shell is re-created with the new
 * role, which is the only honest mechanism without a live auth layer.
 */

import type { CSSProperties } from "react";
import type { SovereignRole } from "../shell-contract";

export type DevPersonaRole = SovereignRole;

export const DEV_PERSONA_ROLES: readonly DevPersonaRole[] = [
  "PLATFORM_ADMIN",
  "SYSTEM_ADMIN",
  "PROGRAM_MANAGER",
  "ANALYST",
  "COMPLIANCE_OFFICER",
  "AGENT_OPERATOR",
  "INDEPENDENT_REVIEWER",
  "READ_ONLY",
];

export const DEV_PERSONA_KEY = "sovereign-dev-persona";

export function readDevPersona(): DevPersonaRole {
  const stored =
    typeof localStorage !== "undefined"
      ? localStorage.getItem(DEV_PERSONA_KEY)
      : null;
  return stored != null &&
    (DEV_PERSONA_ROLES as readonly string[]).includes(stored)
    ? (stored as DevPersonaRole)
    : "SYSTEM_ADMIN";
}

export const DEV_PERSONA_LABELS: Record<DevPersonaRole, string> = {
  PLATFORM_ADMIN: "Platform Admin (all modules)",
  SYSTEM_ADMIN: "System Admin (all access)",
  PROGRAM_MANAGER: "Program Manager",
  ANALYST: "Analyst",
  COMPLIANCE_OFFICER: "Compliance Officer",
  AGENT_OPERATOR: "Agent Operator",
  INDEPENDENT_REVIEWER: "Independent Reviewer",
  READ_ONLY: "Read Only",
};

export function DevPersonaToggle(): JSX.Element {
  const current = readDevPersona();

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>): void {
    const next = e.target.value as DevPersonaRole;
    localStorage.setItem(DEV_PERSONA_KEY, next);
    window.location.reload();
  }

  return (
    <div
      style={devToggleContainerStyle}
      title="Dev-only persona switcher — not visible in production"
    >
      <span style={devBadgeStyle}>DEV</span>
      <select
        value={current}
        onChange={handleChange}
        style={devSelectStyle}
        aria-label="Dev persona"
      >
        {DEV_PERSONA_ROLES.map((role) => (
          <option key={role} value={role}>
            {DEV_PERSONA_LABELS[role]}
          </option>
        ))}
      </select>
    </div>
  );
}

const devToggleContainerStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 6,
  padding: "3px 8px",
  background: "#fef9c3",
  border: "1px solid #fde047",
  borderRadius: 5,
  fontFamily: "system-ui, sans-serif",
};

const devBadgeStyle: CSSProperties = {
  fontSize: 10,
  fontWeight: 700,
  letterSpacing: 0.5,
  color: "#713f12",
  userSelect: "none",
};

const devSelectStyle: CSSProperties = {
  fontSize: 11,
  border: "none",
  background: "transparent",
  color: "#713f12",
  cursor: "pointer",
  fontFamily: "system-ui, sans-serif",
};
