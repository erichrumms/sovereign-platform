# Anti-Deficiency Act (ADA)

**Source ID:** `anti-deficiency-act`
**Authority:** 31 U.S.C. §§ 1341, 1342, 1517
**Scope (CLEAR):** Obligations against available appropriations; no over-obligation.

> SYNTHETIC SUMMARY — not a legally complete restatement of the Anti-Deficiency Act.
> These are the specific, deterministic rules the CLEAR engine evaluates an output
> against. A working subset for demonstration on synthetic data only.

## Rules CLEAR evaluates

1. **R-ADA-1 — Obligation coverage.** Any output that records or relies on an
   obligation must show that the obligation is covered by available budget authority.
   An obligation without coverage (an over-obligation) is a priority (P1) violation —
   the Anti-Deficiency Act admits no de-minimis exception.

2. **R-ADA-2 — Funds availability stated.** An exhibit that commits resources must
   state the appropriation and the availability period it draws against. A commitment
   with no stated funds availability is non-compliant.

## Notes

ADA findings are the highest-severity compliance class CLEAR surfaces: an
over-obligation is always red, never amber. CLEAR flags it; a human reviewer and the
comptroller resolve it.
