// All money is stored as integer cents to avoid floating-point drift.
// $165.00 is 16500. Never store dollars as decimals.
export type Cents = number;

export interface MarkupTier {
  /** Applies to unit costs strictly below this amount. `null` means no upper limit. */
  belowCents: Cents | null;
  percent: number;
}

export interface PricingSettings {
  shopLaborRateCents: Cents;
  /** Checked in order; the first tier whose `belowCents` exceeds the unit cost wins. */
  partsMarkupTiers: MarkupTier[];
  shippingMarkupPercent: number;
  fuelMarkupPercent: number;
  /** Outside labor is marked up case by case, so the default is normally 0. */
  outsideServiceMarkupPercent: number;
  consumablesPercent: number;
  consumablesCapCents: Cents | null;
}

export type TaskStatus = "open" | "in_progress" | "completed" | "deferred" | "declined";

/**
 * - time_and_materials: labor billed as hours x rate.
 * - flat_rate: labor billed at `flatRateCents` regardless of hours; hours are still tracked.
 * - internal: shop overhead (odd jobs, meetings, admin). Never billed; counts as non-aircraft time.
 */
export type TaskBilling = "time_and_materials" | "flat_rate" | "internal";

export interface Task {
  id: string;
  code: string;
  title: string;
  status: TaskStatus;
  billing: TaskBilling;
  flatRateCents?: Cents;
  /** Expected hours, used to compare against actual hours (flat-rate tracking, quoting accuracy). */
  estimatedHours?: number;
  /** Overrides the work order and shop labor rate for this task only. */
  laborRateCents?: Cents;
}

export interface TimeEntry {
  id: string;
  taskId: string;
  technicianId: string;
  hours: number;
}

export type ChargeKind = "part" | "shipping" | "fuel" | "outside_service" | "misc";

/** A manual price change. A reason is required so every override is explainable later. */
export type PriceOverride =
  | { type: "markup_percent"; percent: number; reason: string }
  | { type: "unit_price"; unitPriceCents: Cents; reason: string };

export interface ChargeLine {
  id: string;
  taskId: string;
  kind: ChargeKind;
  description: string;
  partNumber?: string;
  quantity: number;
  /**
   * What 305 SKY pays per unit. For `misc` lines with no underlying cost
   * (e.g. a ferry permit fee), enter the amount to bill here; misc has no default markup.
   */
  unitCostCents: Cents;
  override?: PriceOverride;
}

export interface Payment {
  id: string;
  date: string;
  type: "deposit" | "progress" | "final" | "other";
  method: string;
  amountCents: Cents;
}

export interface WorkOrder {
  id: string;
  number: string;
  /** Customer-specific labor rate, if one was agreed. Falls back to the shop rate. */
  laborRateCents?: Cents;
  tasks: Task[];
  timeEntries: TimeEntry[];
  charges: ChargeLine[];
  payments: Payment[];
  consumablesOverride?: { amountCents: Cents; reason: string };
}

export interface PricedCharge {
  lineId: string;
  kind: ChargeKind;
  description: string;
  quantity: number;
  unitCostCents: Cents;
  markupPercent: number;
  unitPriceCents: Cents;
  extendedCostCents: Cents;
  extendedPriceCents: Cents;
  overridden: boolean;
}

export interface PricedTask {
  taskId: string;
  code: string;
  title: string;
  status: TaskStatus;
  billing: TaskBilling;
  /** False for deferred, declined and internal tasks; they are shown but never billed. */
  billed: boolean;
  actualHours: number;
  estimatedHours?: number;
  /** actualHours - estimatedHours. Positive means the job ran over. */
  hoursVariance?: number;
  laborRateCents: Cents;
  laborCents: Cents;
  /** For flat-rate tasks: what the shop actually earned per hour worked. */
  effectiveHourlyRateCents?: Cents;
  charges: PricedCharge[];
  chargesCents: Cents;
  totalCents: Cents;
}

export interface Totals {
  laborCents: Cents;
  partsCents: Cents;
  shippingCents: Cents;
  fuelCents: Cents;
  outsideServicesCents: Cents;
  miscCents: Cents;
  subtotalCents: Cents;
  consumablesCents: Cents;
  consumablesCapped: boolean;
  totalCents: Cents;
  paymentsCents: Cents;
  balanceCents: Cents;
  /** What the billed charges cost 305 SKY (excludes technician labor). */
  chargesCostCents: Cents;
  billedHours: number;
}

export interface PricedWorkOrder {
  workOrderId: string;
  tasks: PricedTask[];
  totals: Totals;
}
