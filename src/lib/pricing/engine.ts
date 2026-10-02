import type {
  Cents,
  ChargeLine,
  PricedCharge,
  PricedTask,
  PricedWorkOrder,
  PricingSettings,
  Task,
  Totals,
  WorkOrder,
} from "./types";

/** Percent of an amount, rounded half-up to the nearest cent. */
export function percentOf(amountCents: Cents, percent: number): Cents {
  return Math.round((amountCents * percent) / 100);
}

export function partsMarkupPercent(unitCostCents: Cents, settings: PricingSettings): number {
  for (const tier of settings.partsMarkupTiers) {
    if (tier.belowCents === null || unitCostCents < tier.belowCents) return tier.percent;
  }
  throw new Error("partsMarkupTiers must end with an open-ended tier (belowCents: null)");
}

function defaultMarkupPercent(line: ChargeLine, settings: PricingSettings): number {
  switch (line.kind) {
    case "part":
      return partsMarkupPercent(line.unitCostCents, settings);
    case "shipping":
      return settings.shippingMarkupPercent;
    case "fuel":
      return settings.fuelMarkupPercent;
    case "outside_service":
      return settings.outsideServiceMarkupPercent;
    case "misc":
      return 0;
  }
}

export function priceCharge(line: ChargeLine, settings: PricingSettings): PricedCharge {
  let markupPercent: number;
  let unitPriceCents: Cents;

  if (line.override?.type === "unit_price") {
    unitPriceCents = line.override.unitPriceCents;
    markupPercent =
      line.unitCostCents === 0
        ? 0
        : ((unitPriceCents - line.unitCostCents) / line.unitCostCents) * 100;
  } else {
    markupPercent =
      line.override?.type === "markup_percent"
        ? line.override.percent
        : defaultMarkupPercent(line, settings);
    unitPriceCents = line.unitCostCents + percentOf(line.unitCostCents, markupPercent);
  }

  return {
    lineId: line.id,
    kind: line.kind,
    description: line.description,
    quantity: line.quantity,
    unitCostCents: line.unitCostCents,
    markupPercent,
    unitPriceCents,
    extendedCostCents: Math.round(line.unitCostCents * line.quantity),
    extendedPriceCents: Math.round(unitPriceCents * line.quantity),
    overridden: line.override !== undefined,
    installed: !line.notInstalled,
  };
}

export function isBilled(task: Task): boolean {
  return task.billing !== "internal" && task.status !== "deferred" && task.status !== "declined";
}

function sum(values: number[]): number {
  return values.reduce((a, b) => a + b, 0);
}

/** Hours are summed in hundredths so 0.1 + 0.2 style float drift never shows up on a document. */
function sumHours(hours: number[]): number {
  return Math.round(sum(hours.map((h) => Math.round(h * 100)))) / 100;
}

/**
 * How hourly (time & materials) labor is counted. Flat-rate tasks are unaffected.
 * - actual: hours logged so far (what an invoice bills)
 * - projected: estimated hours, or hours logged once a job runs past its estimate
 *   (what a quote shows, and what later changes are compared against)
 */
export type LaborBasis = "actual" | "projected";

function billableHours(actual: number, estimated: number | undefined, basis: LaborBasis) {
  return basis === "projected" && estimated !== undefined ? Math.max(actual, estimated) : actual;
}

function priceTask(task: Task, wo: WorkOrder, settings: PricingSettings, basis: LaborBasis): PricedTask {
  const actualHours = sumHours(
    wo.timeEntries.filter((e) => e.taskId === task.id).map((e) => e.hours),
  );
  const laborRateCents = task.laborRateCents ?? wo.laborRateCents ?? settings.shopLaborRateCents;
  const billed = isBilled(task);
  const charges = wo.charges
    .filter((c) => c.taskId === task.id)
    .map((c) => priceCharge(c, settings));

  let laborCents = 0;
  if (billed) {
    laborCents =
      task.billing === "flat_rate"
        ? (task.flatRateCents ?? 0)
        : Math.round(billableHours(actualHours, task.estimatedHours, basis) * laborRateCents);
  }
  const chargesCents = billed ? sum(charges.map((c) => c.extendedPriceCents)) : 0;

  const priced: PricedTask = {
    taskId: task.id,
    code: task.code,
    title: task.title,
    description: task.description,
    section: task.section,
    status: task.status,
    billing: task.billing,
    billed,
    actualHours,
    laborRateCents,
    laborCents,
    charges,
    chargesCents,
    totalCents: laborCents + chargesCents,
  };
  if (task.estimatedHours !== undefined) {
    priced.estimatedHours = task.estimatedHours;
    priced.hoursVariance = sumHours([actualHours, -task.estimatedHours]);
  }
  if (task.billing === "flat_rate" && task.flatRateCents !== undefined && actualHours > 0) {
    priced.effectiveHourlyRateCents = Math.round(task.flatRateCents / actualHours);
  }
  return priced;
}

/**
 * The single pricing calculation. Quotes, invoices, the work order screen and the
 * QuickBooks export all call this, so they can never disagree with one another.
 */
export function priceWorkOrder(
  wo: WorkOrder,
  settings: PricingSettings,
  basis: LaborBasis = "actual",
): PricedWorkOrder {
  const tasks = wo.tasks.map((t) => priceTask(t, wo, settings, basis));
  const billedTasks = tasks.filter((t) => t.billed);
  const billedCharges = billedTasks.flatMap((t) => t.charges);
  const chargesOfKind = (kind: PricedCharge["kind"]) =>
    sum(billedCharges.filter((c) => c.kind === kind).map((c) => c.extendedPriceCents));

  const laborCents = sum(billedTasks.map((t) => t.laborCents));
  const subtotalCents = laborCents + sum(billedCharges.map((c) => c.extendedPriceCents));

  // Consumables apply to the whole invoice (every billed line), capped per work order.
  const uncapped = percentOf(subtotalCents, settings.consumablesPercent);
  const cap = settings.consumablesCapCents;
  const consumablesCapped = cap !== null && uncapped > cap;
  const consumablesCents =
    wo.consumablesOverride?.amountCents ?? (consumablesCapped ? (cap as Cents) : uncapped);

  const totalCents = subtotalCents + consumablesCents;
  const paymentsCents = sum(wo.payments.map((p) => p.amountCents));

  const totals: Totals = {
    laborCents,
    partsCents: chargesOfKind("part"),
    shippingCents: chargesOfKind("shipping"),
    fuelCents: chargesOfKind("fuel"),
    outsideServicesCents: chargesOfKind("outside_service"),
    miscCents: chargesOfKind("misc"),
    subtotalCents,
    consumablesCents,
    consumablesCapped: wo.consumablesOverride ? false : consumablesCapped,
    totalCents,
    paymentsCents,
    balanceCents: totalCents - paymentsCents,
    chargesCostCents: sum(billedCharges.map((c) => c.extendedCostCents)),
    billedHours: sumHours(billedTasks.map((t) => t.actualHours)),
  };

  return { workOrderId: wo.id, tasks, totals };
}
