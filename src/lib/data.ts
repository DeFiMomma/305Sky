import "server-only";
import { and, asc, desc, eq, gte, inArray, isNull, or } from "drizzle-orm";
import { db, schema } from "@/db";
import {
  DEFAULT_PRICING,
  checkWorkOrder,
  diffAgainstQuote,
  priceWorkOrder,
  type ChargeLine,
  type PricedWorkOrder,
  type WorkOrder as PricingWorkOrder,
} from "@/lib/pricing";

const { aircraft, charges, customers, payments, quotes, shifts, tasks, timeEntries, users, workOrders } =
  schema;

export const pricingSettings = DEFAULT_PRICING;

/** Per-task change that counts as "changed since quote". */
const QUOTE_DRIFT_TOLERANCE_CENTS = 5000;

export function taskCode(seq: number) {
  return `T${String(seq).padStart(3, "0")}`;
}

/** Hours for a time entry; a running clock counts up to `now`. */
export function entryHours(
  e: { startedAt: Date; endedAt: Date | null; hoursOverride: number | null },
  now = new Date(),
) {
  if (e.hoursOverride !== null) return e.hoursOverride;
  const end = e.endedAt ?? now;
  return Math.max(0, Math.round(((end.getTime() - e.startedAt.getTime()) / 3_600_000) * 100) / 100);
}

export async function listUsers(role?: "admin" | "tech") {
  return db
    .select()
    .from(users)
    .where(role ? and(eq(users.role, role), eq(users.active, true)) : eq(users.active, true))
    .orderBy(asc(users.name));
}

export async function listCustomers() {
  return db.select().from(customers).orderBy(asc(customers.name));
}

export async function findAircraftByTail(tail: string) {
  const [row] = await db.select().from(aircraft).where(eq(aircraft.tailNumber, tail.toUpperCase()));
  return row ?? null;
}

export type WorkOrderStatus = (typeof workOrders.$inferSelect)["status"];

export async function loadWorkOrder(id: number) {
  const [wo] = await db.select().from(workOrders).where(eq(workOrders.id, id));
  if (!wo) return null;

  const [ac] = wo.aircraftId ? await db.select().from(aircraft).where(eq(aircraft.id, wo.aircraftId)) : [];
  const [cust] = wo.customerId ? await db.select().from(customers).where(eq(customers.id, wo.customerId)) : [];
  const taskRows = await db.select().from(tasks).where(eq(tasks.workOrderId, id)).orderBy(asc(tasks.seq));
  const taskIds = taskRows.map((t) => t.id);
  const entryRows = taskIds.length
    ? await db
        .select({ entry: timeEntries, userName: users.name })
        .from(timeEntries)
        .innerJoin(users, eq(users.id, timeEntries.userId))
        .where(inArray(timeEntries.taskId, taskIds))
        .orderBy(desc(timeEntries.startedAt))
    : [];
  const chargeRows = taskIds.length
    ? await db.select().from(charges).where(inArray(charges.taskId, taskIds)).orderBy(asc(charges.id))
    : [];
  const paymentRows = await db.select().from(payments).where(eq(payments.workOrderId, id)).orderBy(asc(payments.date));
  const quoteRows = await db.select().from(quotes).where(eq(quotes.workOrderId, id)).orderBy(desc(quotes.version));

  return {
    workOrder: wo,
    aircraft: ac ?? null,
    customer: cust ?? null,
    tasks: taskRows,
    entries: entryRows,
    charges: chargeRows,
    payments: paymentRows,
    quotes: quoteRows,
  };
}

export type LoadedWorkOrder = NonNullable<Awaited<ReturnType<typeof loadWorkOrder>>>;

/** Converts stored rows into the shape the pricing calculation expects. */
export function toPricingInput(l: LoadedWorkOrder, now = new Date()): PricingWorkOrder {
  const live = l.charges.filter((c) => c.status !== "cancelled");
  return {
    id: String(l.workOrder.id),
    number: l.workOrder.number,
    laborRateCents: l.workOrder.laborRateCents ?? l.customer?.laborRateCents ?? undefined,
    tasks: l.tasks.map((t) => ({
      id: String(t.id),
      code: taskCode(t.seq),
      title: t.title,
      status: t.status,
      billing: t.billing,
      flatRateCents: t.flatRateCents ?? undefined,
      estimatedHours: t.estimatedHours ?? undefined,
      laborRateCents: t.laborRateCents ?? undefined,
    })),
    timeEntries: l.entries.map(({ entry }) => ({
      id: String(entry.id),
      taskId: String(entry.taskId),
      technicianId: String(entry.userId),
      hours: entryHours(entry, now),
    })),
    charges: live.map((c): ChargeLine => {
      const line: ChargeLine = {
        id: String(c.id),
        taskId: String(c.taskId),
        kind: c.kind,
        description: c.description,
        partNumber: c.partNumber ?? undefined,
        quantity: c.quantity,
        unitCostCents: c.unitCostCents ?? 0,
        costPending: c.unitCostCents === null,
        notInstalled: c.kind === "part" && c.status !== "installed",
      };
      if (c.overrideType && c.overrideValue !== null) {
        const reason = c.overrideReason ?? "";
        line.override =
          c.overrideType === "unit_price"
            ? { type: "unit_price", unitPriceCents: c.overrideValue, reason }
            : { type: "markup_percent", percent: c.overrideValue, reason };
      }
      return line;
    }),
    payments: l.payments.map((p) => ({
      id: String(p.id),
      date: p.date,
      type: p.type,
      method: p.method,
      amountCents: p.amountCents,
    })),
    consumablesOverride:
      l.workOrder.consumablesOverrideCents !== null
        ? { amountCents: l.workOrder.consumablesOverrideCents, reason: l.workOrder.consumablesOverrideReason ?? "" }
        : undefined,
  };
}

/** Everything the work order screen needs: rows, live pricing, checks and quote drift. */
export async function workOrderView(id: number) {
  const loaded = await loadWorkOrder(id);
  if (!loaded) return null;
  const input = toPricingInput(loaded);
  const priced = priceWorkOrder(input, pricingSettings);
  const projected = priceWorkOrder(input, pricingSettings, "projected");
  const latestQuote = loaded.quotes[0] ?? null;
  return {
    ...loaded,
    priced,
    projected,
    quoteChecks: checkWorkOrder(input, priced, "quote"),
    invoiceChecks: checkWorkOrder(input, priced, "invoice"),
    quoteDiff: latestQuote ? diffAgainstQuote(latestQuote.snapshot as PricedWorkOrder, projected, QUOTE_DRIFT_TOLERANCE_CENTS) : null,
    latestQuote,
  };
}

export async function listWorkOrders(filter: "active" | "pending" | "awaiting_payment" | "all" | "aog") {
  const where =
    filter === "all"
      ? undefined
      : filter === "aog"
        ? and(eq(workOrders.aog, true), or(eq(workOrders.status, "active"), eq(workOrders.status, "pending")))
        : eq(workOrders.status, filter);
  const rows = await db
    .select({ wo: workOrders, ac: aircraft, cust: customers })
    .from(workOrders)
    .leftJoin(aircraft, eq(aircraft.id, workOrders.aircraftId))
    .leftJoin(customers, eq(customers.id, workOrders.customerId))
    .where(where)
    .orderBy(desc(workOrders.aog), desc(workOrders.id));

  return Promise.all(
    rows.map(async (r) => {
      const view = await workOrderView(r.wo.id);
      const t = view!.tasks;
      return {
        ...r,
        totalCents: view!.priced.totals.totalCents,
        balanceCents: view!.priced.totals.balanceCents,
        taskCount: t.length,
        openTasks: t.filter((x) => x.status === "open" || x.status === "in_progress").length,
        quoteDriftCents: view!.quoteDiff?.changes.length ? view!.quoteDiff.differenceCents : null,
      };
    }),
  );
}

// ---------- Technician app ----------

export async function openShift(userId: number) {
  const [s] = await db
    .select()
    .from(shifts)
    .where(and(eq(shifts.userId, userId), isNull(shifts.clockOut)));
  return s ?? null;
}

export async function runningEntry(userId: number) {
  const [row] = await db
    .select({ entry: timeEntries, task: tasks, wo: workOrders })
    .from(timeEntries)
    .innerJoin(tasks, eq(tasks.id, timeEntries.taskId))
    .innerJoin(workOrders, eq(workOrders.id, tasks.workOrderId))
    .where(and(eq(timeEntries.userId, userId), isNull(timeEntries.endedAt)));
  return row ?? null;
}

export async function workOrdersForTechs() {
  return db
    .select({ wo: workOrders, ac: aircraft })
    .from(workOrders)
    .leftJoin(aircraft, eq(aircraft.id, workOrders.aircraftId))
    .where(eq(workOrders.status, "active"))
    .orderBy(asc(workOrders.internal), desc(workOrders.aog), asc(workOrders.number));
}

export async function tasksForTechs(workOrderId: number) {
  return db
    .select()
    .from(tasks)
    .where(and(eq(tasks.workOrderId, workOrderId), inArray(tasks.status, ["open", "in_progress"])))
    .orderBy(asc(tasks.seq));
}

// ---------- Labor & utilization ----------

export async function laborSince(since: Date) {
  const rows = await db
    .select({ entry: timeEntries, task: tasks, wo: workOrders, user: users })
    .from(timeEntries)
    .innerJoin(tasks, eq(tasks.id, timeEntries.taskId))
    .innerJoin(workOrders, eq(workOrders.id, tasks.workOrderId))
    .innerJoin(users, eq(users.id, timeEntries.userId))
    .where(gte(timeEntries.startedAt, since))
    .orderBy(desc(timeEntries.startedAt));
  const shiftRows = await db
    .select({ shift: shifts, user: users })
    .from(shifts)
    .innerJoin(users, eq(users.id, shifts.userId))
    .where(gte(shifts.clockIn, since));
  return { entries: rows, shifts: shiftRows };
}

export async function partsQueue() {
  return db
    .select({ charge: charges, task: tasks, wo: workOrders, ac: aircraft, requestedBy: users.name })
    .from(charges)
    .innerJoin(tasks, eq(tasks.id, charges.taskId))
    .innerJoin(workOrders, eq(workOrders.id, tasks.workOrderId))
    .leftJoin(aircraft, eq(aircraft.id, workOrders.aircraftId))
    .leftJoin(users, eq(users.id, charges.requestedById))
    .where(eq(charges.kind, "part"))
    .orderBy(desc(charges.priority), desc(charges.id));
}

export async function openPartsRequestCount() {
  const rows = await db
    .select({ id: charges.id })
    .from(charges)
    .where(and(eq(charges.kind, "part"), eq(charges.status, "requested")));
  return rows.length;
}
