import type { PricingSettings } from "./types";

/** 305 SKY standard pricing as of Oct 2026. Every value here is editable in the app's settings. */
export const DEFAULT_PRICING: PricingSettings = {
  shopLaborRateCents: 16500,
  partsMarkupTiers: [
    { belowCents: 10000, percent: 100 }, // under $100: +100%
    { belowCents: 100000, percent: 25 }, // $100 to under $1,000: +25%
    { belowCents: null, percent: 20 }, // $1,000 and up: +20%
  ],
  shippingMarkupPercent: 20,
  fuelMarkupPercent: 20,
  outsideServiceMarkupPercent: 0,
  consumablesPercent: 4,
  consumablesCapCents: 500000,
};
