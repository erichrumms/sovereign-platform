/**
 * SOVEREIGN Platform — sovereign-shell
 * format-currency.ts — shared dollar-amount formatter (WH-30).
 *
 * Rules:
 *   abs(value) < 100,000  → "$X,XXX"  (full amount with $ and commas)
 *   abs(value) >= 100,000 → "$XXXk"   (rounded to nearest thousand)
 *
 * Negative values carry the minus sign before the $: "-$1,090" / "-$825k".
 */

export function formatCurrency(value: number): string {
  const abs = Math.abs(value);
  const sign = value < 0 ? "-" : "";
  if (abs >= 100_000) {
    return `${sign}$${Math.round(abs / 1000)}k`;
  }
  return `${sign}$${abs.toLocaleString()}`;
}
