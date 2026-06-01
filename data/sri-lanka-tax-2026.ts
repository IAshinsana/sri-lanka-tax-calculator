/**
 * Sri Lanka APIT (Advance Personal Income Tax) — Year of Assessment 2025/26.
 *
 * Source: Inland Revenue Department, Tax Chart for Y/A 2025/26.
 *   https://www.ird.gov.lk/en/publications/SitePages/tax_chart_2526.aspx?menuid=1404
 *   https://www.ird.gov.lk/en/publications/APIT_Tax_Tables/2025-2026/Table%20-%201/02.%20APIT_2526_Table_01_Text.pdf
 *
 * Statutory basis: Inland Revenue (Amendment) Act No. 2 of 2025.
 * Personal relief raised from Rs 1,200,000 to Rs 1,800,000; first slab widened
 * from Rs 500,000 to Rs 1,000,000; the 12% slab was removed.
 *
 * Verified worked examples in docs/decisions/004-tax-calculator-source.md.
 */

export const TAX_YEAR_LABEL = "2025/26";
export const TAX_YEAR_PERIOD = "1 April 2025 – 31 March 2026";
export const LAST_VERIFIED = "2026-05-10";

export const ANNUAL_RELIEF = 1_800_000;
export const MONTHLY_RELIEF = ANNUAL_RELIEF / 12;

export interface AnnualBracket {
  /** Inclusive lower bound of taxable income (after relief) in LKR. */
  from: number;
  /** Exclusive upper bound. Use Infinity for the top bracket. */
  to: number;
  rate: number;
}

/** Annual brackets applied to taxable income (gross − Rs 1,800,000 relief). */
export const ANNUAL_BRACKETS: AnnualBracket[] = [
  { from: 0, to: 1_000_000, rate: 0.06 },
  { from: 1_000_000, to: 1_500_000, rate: 0.18 },
  { from: 1_500_000, to: 2_000_000, rate: 0.24 },
  { from: 2_000_000, to: 2_500_000, rate: 0.30 },
  { from: 2_500_000, to: Infinity, rate: 0.36 },
];

interface MonthlyFormula {
  /** Inclusive lower bound of monthly remuneration in LKR. */
  from: number;
  /** Exclusive upper bound. Use Infinity for top bracket. */
  to: number;
  rate: number;
  /** Subtraction constant for the monthly APIT formula. */
  subtract: number;
}

/**
 * Monthly APIT formulas — equivalent to IRD Table 01.
 * Formula: APIT = rate × M − subtract, applied where bracket from < M ≤ to.
 */
export const MONTHLY_FORMULAS: MonthlyFormula[] = [
  { from: 0, to: 150_000, rate: 0, subtract: 0 },
  { from: 150_000, to: 233_333.33, rate: 0.06, subtract: 9_000 },
  { from: 233_333.33, to: 275_000, rate: 0.18, subtract: 37_000 },
  { from: 275_000, to: 316_666.67, rate: 0.24, subtract: 53_500 },
  { from: 316_666.67, to: 358_333.33, rate: 0.30, subtract: 72_500 },
  { from: 358_333.33, to: Infinity, rate: 0.36, subtract: 94_000 },
];

export interface BracketBreakdownRow {
  rate: number;
  rateLabel: string;
  /** Lower bound of bracket as applied to this taxpayer's annual income. */
  from: number;
  /** Upper bound capped at the taxpayer's taxable income. */
  to: number;
  /** Amount of taxable income falling within this bracket. */
  amountInBracket: number;
  /** Tax due on that portion. */
  taxOnBracket: number;
}

export interface TaxResult {
  /** Gross monthly remuneration entered by the user. */
  grossMonthly: number;
  /** Annualized gross (12 × monthly). */
  grossAnnual: number;
  /** Taxable income annually (gross − relief, floored at 0). */
  taxableAnnual: number;
  /** Annual APIT in LKR. */
  annualTax: number;
  /** Monthly APIT in LKR. */
  monthlyTax: number;
  /** Net (take-home) per month after APIT. */
  monthlyNet: number;
  /** Net annually. */
  annualNet: number;
  /** Effective tax rate (annualTax / grossAnnual). */
  effectiveRate: number;
  /** Top marginal rate touched by this income. */
  marginalRate: number;
  /** Per-bracket breakdown (annual basis). */
  breakdown: BracketBreakdownRow[];
}

/**
 * Compute Sri Lanka APIT for a given monthly gross remuneration.
 * Pure function, deterministic, scope-limited to regular employment income.
 */
export function calculateTax(grossMonthly: number): TaxResult {
  const safe = Number.isFinite(grossMonthly) && grossMonthly > 0 ? grossMonthly : 0;
  const grossAnnual = safe * 12;
  const taxableAnnual = Math.max(0, grossAnnual - ANNUAL_RELIEF);

  const breakdown: BracketBreakdownRow[] = [];
  let annualTax = 0;
  let marginalRate = 0;

  for (const b of ANNUAL_BRACKETS) {
    if (taxableAnnual <= b.from) break;
    const top = Math.min(taxableAnnual, b.to);
    const amount = top - b.from;
    const tax = amount * b.rate;
    annualTax += tax;
    marginalRate = b.rate;
    breakdown.push({
      rate: b.rate,
      rateLabel: `${(b.rate * 100).toFixed(0)}%`,
      from: b.from,
      to: top,
      amountInBracket: amount,
      taxOnBracket: tax,
    });
  }

  const monthlyTax = annualTax / 12;
  const monthlyNet = safe - monthlyTax;
  const annualNet = grossAnnual - annualTax;
  const effectiveRate = grossAnnual > 0 ? annualTax / grossAnnual : 0;

  return {
    grossMonthly: safe,
    grossAnnual,
    taxableAnnual,
    annualTax,
    monthlyTax,
    monthlyNet,
    annualNet,
    effectiveRate,
    marginalRate,
    breakdown,
  };
}

/**
 * Cross-check using the IRD's monthly formula. Returns the same monthly tax
 * as calculateTax(). Exposed so the calculator can show "verified by IRD
 * Table 01 formula" in the methodology section.
 */
export function calculateMonthlyByIRDFormula(grossMonthly: number): number {
  const safe = Number.isFinite(grossMonthly) && grossMonthly > 0 ? grossMonthly : 0;
  for (const f of MONTHLY_FORMULAS) {
    if (safe > f.from && safe <= f.to) {
      return Math.max(0, f.rate * safe - f.subtract);
    }
  }
  return 0;
}
