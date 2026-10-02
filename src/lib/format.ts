const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

export function money(cents: number) {
  return usd.format(cents / 100);
}

/** Signed money for differences: +$1,234.00 / −$50.00 */
export function moneyDelta(cents: number) {
  return `${cents >= 0 ? "+" : "−"}${usd.format(Math.abs(cents) / 100)}`;
}

/** "1,234.56", "$1234.5" or "1234" -> cents. Invalid input becomes 0. */
export function parseMoney(input: string): number {
  const n = Number(input.replace(/[$,\s]/g, ""));
  return Number.isFinite(n) ? Math.round(n * 100) : 0;
}

export function hours(h: number) {
  return `${Number.isInteger(h) ? h : h.toFixed(2).replace(/0$/, "")} h`;
}

export function shortDate(d: Date | string) {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function clockTime(d: Date | string) {
  return new Date(d).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

export const STATUS_LABEL: Record<string, string> = {
  open: "Open",
  in_progress: "In progress",
  completed: "Completed",
  deferred: "Deferred",
  declined: "Declined",
  pending: "Pending",
  active: "Active",
  awaiting_payment: "Awaiting payment",
  closed: "Closed",
  requested: "Requested",
  sourcing: "Sourcing",
  quoted: "Quoted",
  ordered: "Ordered",
  received: "Received",
  installed: "Installed",
  cancelled: "Cancelled",
};

export const KIND_LABEL: Record<string, string> = {
  part: "Part",
  shipping: "Shipping",
  fuel: "Fuel",
  outside_service: "Outside labor",
  misc: "Misc",
};
