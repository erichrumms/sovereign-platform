/**
 * SOVEREIGN Platform — sovereign-shell
 * navigation/Breadcrumb.tsx
 *
 * Renders the navigation breadcrumb trail from ctx.navigation.breadcrumb.
 * Every crumb except the last is a clickable link back up the path.
 *
 * Version: 1.0 · Session 2B · June 2, 2026
 */

import type { CSSProperties } from "react";
import { SOVEREIGN_THEME as T } from "./theme";

interface Crumb {
  label: string;
  path: string;
}

export interface BreadcrumbProps {
  trail: Crumb[];
  onNavigate: (path: string) => void;
}

export function Breadcrumb({ trail, onNavigate }: BreadcrumbProps): JSX.Element {
  return (
    <nav
      aria-label="Breadcrumb"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        fontFamily: T.font.sans,
        fontSize: 13,
      }}
    >
      {trail.map((crumb, i) => {
        const isLast = i === trail.length - 1;
        return (
          <span
            key={crumb.path}
            style={{ display: "flex", alignItems: "center", gap: 6 }}
          >
            {i > 0 && <span style={{ color: T.text.muted }}>/</span>}
            {isLast ? (
              <span style={{ color: T.text.primary, fontWeight: 600 }}>
                {crumb.label}
              </span>
            ) : (
              <button
                type="button"
                onClick={() => onNavigate(crumb.path)}
                style={crumbLinkStyle}
              >
                {crumb.label}
              </button>
            )}
          </span>
        );
      })}
    </nav>
  );
}

const crumbLinkStyle: CSSProperties = {
  background: "none",
  border: "none",
  padding: 0,
  margin: 0,
  cursor: "pointer",
  color: T.text.secondary,
  font: "inherit",
};
