# Sri Lanka Income Tax Calculator (2026)

> Reference implementation. Live: **https://induwara.lk/tools/sri-lanka-tax-calculator**

Compute personal income tax for Sri Lanka under the current **Inland Revenue
Department (IRD)** brackets, with the cited official tax schedule and a clean
React UI.

## What's in this repo

### `data/sri-lanka-tax-2026.ts`

The complete official tax bracket data — slabs, rates, personal relief,
employment income relief. Each constant cites the source IRD circular or
section of the Inland Revenue Act so you can verify against the original.

```ts
// Source: Inland Revenue Act No. 24 of 2017 (as amended).
// Last verified: 2026-XX-XX
export const PERSONAL_RELIEF_LKR_PER_YEAR = 1_200_000;
export const TAX_SLABS_2026 = [
  { upTo: 500_000,    rate: 0.06 },
  { upTo: 500_000,    rate: 0.12 },
  ...
];
```

If brackets change (annual budget), update this one file and the calculator
is current.

## Why publish this?

Sri Lankan personal-finance information online is fragmented. Most
"calculators" hard-code outdated rates with no source citation. This repo's
data file follows a simple discipline:

1. **Cite the source.** Every constant references the IRD circular or
   Inland Revenue Act section.
2. **Last verified date.** A constant at the top says when a human last
   confirmed the numbers against the source.
3. **Pure functions.** All math is testable; no UI dependency.

Useful as:
- A drop-in component for any Sri Lankan personal-finance / payroll / HR site
- A reference for accountants / consultants who want to verify their own calculators
- A teaching example of how to structure citation-friendly tax math

## Reuse

MIT licensed. If you embed this on a commercial site, please keep the source
citations intact so users can verify the numbers.

## Live

[induwara.lk/tools/sri-lanka-tax-calculator](https://induwara.lk/tools/sri-lanka-tax-calculator)

## Disclaimer

Educational tool only. Cross-check with the IRD or a chartered accountant
before filing.
