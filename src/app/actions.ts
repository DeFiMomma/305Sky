"use server";

import { and, eq, isNull, max, sql } from "drizzle-orm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db, schema } from "@/db";
import { loadWorkOrder, pricingSettings, toPricingInput } from "@/lib/data";
import { parseMoney } from "@/lib/format";
import { checkWorkOrder, priceWorkOrder } from "@/lib/pricing";

const { aircraft, charges, customers, payments, quotes, shifts, tasks, timeEntries, workOrders } = schema;

function str(fd: FormData, key: string) {
  const v = fd.get(key);
  return typeof v === "string" ? v.trim() : "";
}
function optNum(fd: FormData, key: string) {
  const v = str(fd, key);
  return v === "" ? null : Number(v);
}

function refreshWorkOrder(woId: number) {
  revalidatePath(`/work-orders/${woId}`);
  revalidatePath("/work-orders");
  revalidatePath("/tech");
}

async function nextTaskSeq(woId: number) {
  const [row] = await db.select({ m: max(tasks.seq) }).from(tasks).where(eq(tasks.workOrderId, woId));
  return (row?.m ?? 0) + 1;
}

// ---------- Work orders ----------

export async function createWorkOrder(fd: FormData) {
  const tail = str(fd, "tailNumber").toUpperCase();
  if (!tail) throw new Error("Tail number is required");

  let customerId = optNum(fd, "customerId");
  const newCustomer = str(fd, "newCustomerName");
  if (!customerId && newCustomer) {
    const [c] = await db
      .insert(customers)
      .values({
        name: newCustomer,
        contactName: str(fd, "newCustomerContact") || null,
        email: str(fd, "newCustomerEmail") || null,
        phone: str(fd, "newCustomerPhone") || null,
      })
      .returning();
    customerId = c!.id;
  }

  let [ac] = await db.select().from(aircraft).where(eq(aircraft.tailNumber, tail));
  if (!ac) {
    [ac] = await db
      .insert(aircraft)
      .values({
        tailNumber: tail,
        make: str(fd, "make") || null,
        model: str(fd, "model") || null,
        year: optNum(fd, "year"),
        serialNumber: str(fd, "serialNumber") || null,
        customerId,
      })
      .returning();
  }

  const [{ last }] = (
    await db.execute(sql`select coalesce(max(substring(number from 'WO-(\d+)')::int), 0) as last from work_orders`)
  ).rows as [{ last: number }];
  const number = `WO-${String(Number(last) + 1).padStart(5, "0")}-${tail}`;
  const [wo] = await db
    .insert(workOrders)
    .values({
      number,
      title: str(fd, "title") || "Maintenance",
      aircraftId: ac!.id,
      customerId,
      aog: fd.get("aog") === "on",
      customerReference: str(fd, "customerReference") || null,
      status: "active",
    })
    .returning();

  const discrepancies = str(fd, "discrepancies")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  if (discrepancies.length) {
    await db.insert(tasks).values(
      discrepancies.map((title, i) => ({ workOrderId: wo!.id, seq: i + 1, title, category: "discrepancy" as const })),
    );
  }
  revalidatePath("/work-orders");
  redirect(`/work-orders/${wo!.id}`);
}

export async function setWorkOrderStatus(woId: number, status: "pending" | "active" | "awaiting_payment" | "closed") {
  await db.update(workOrders).set({ status }).where(eq(workOrders.id, woId));
  refreshWorkOrder(woId);
}

export async function toggleAog(woId: number, aog: boolean) {
  await db.update(workOrders).set({ aog }).where(eq(workOrders.id, woId));
  refreshWorkOrder(woId);
}

// ---------- Tasks ----------

export async function addTask(woId: number, fd: FormData) {
  const title = str(fd, "title");
  if (!title) return;
  const billing = (str(fd, "billing") || "time_and_materials") as "time_and_materials" | "flat_rate" | "internal";
  await db.insert(tasks).values({
    workOrderId: woId,
    seq: await nextTaskSeq(woId),
    title,
    description: str(fd, "description") || null,
    category: (str(fd, "category") || "discrepancy") as "inspection" | "discrepancy" | "general",
    billing,
    flatRateCents: billing === "flat_rate" ? parseMoney(str(fd, "flatRate")) : null,
    estimatedHours: optNum(fd, "estimatedHours"),
  });
  refreshWorkOrder(woId);
}

export async function updateTask(taskId: number, fd: FormData) {
  const [t] = await db.select().from(tasks).where(eq(tasks.id, taskId));
  if (!t) return;
  const billing = (str(fd, "billing") || t.billing) as typeof t.billing;
  await db
    .update(tasks)
    .set({
      title: str(fd, "title") || t.title,
      description: str(fd, "description") || null,
      status: (str(fd, "status") || t.status) as typeof t.status,
      billing,
      flatRateCents: billing === "flat_rate" ? parseMoney(str(fd, "flatRate")) : null,
      estimatedHours: optNum(fd, "estimatedHours"),
    })
    .where(eq(tasks.id, taskId));
  refreshWorkOrder(t.workOrderId);
}

export async function setTaskStatus(taskId: number, status: (typeof tasks.$inferSelect)["status"]) {
  const [t] = await db.update(tasks).set({ status }).where(eq(tasks.id, taskId)).returning();
  if (t) refreshWorkOrder(t.workOrderId);
}

// ---------- Charges (parts, shipping, fuel, outside labor, misc) ----------

async function woIdForTask(taskId: number) {
  const [t] = await db.select({ woId: tasks.workOrderId }).from(tasks).where(eq(tasks.id, taskId));
  return t!.woId;
}

export async function addCharge(taskId: number, fd: FormData) {
  const description = str(fd, "description");
  if (!description) return;
  const kind = str(fd, "kind") as (typeof charges.$inferSelect)["kind"];
  const cost = str(fd, "unitCost");
  const overrideType = str(fd, "overrideType") as "" | "markup_percent" | "unit_price";
  const overrideRaw = str(fd, "overrideValue");
  await db.insert(charges).values({
    taskId,
    kind,
    description,
    partNumber: str(fd, "partNumber") || null,
    quantity: Number(str(fd, "quantity") || 1),
    unitCostCents: cost === "" ? null : parseMoney(cost),
    overrideType: overrideType && overrideRaw ? overrideType : null,
    overrideValue:
      overrideType && overrideRaw
        ? overrideType === "unit_price"
          ? parseMoney(overrideRaw)
          : Number(overrideRaw)
        : null,
    overrideReason: str(fd, "overrideReason") || null,
    status: kind === "part" ? ((str(fd, "status") || "installed") as "installed") : "installed",
    vendor: str(fd, "vendor") || null,
  });
  refreshWorkOrder(await woIdForTask(taskId));
}

export async function updatePart(chargeId: number, fd: FormData) {
  const [c] = await db.select().from(charges).where(eq(charges.id, chargeId));
  if (!c) return;
  const cost = str(fd, "unitCost");
  await db
    .update(charges)
    .set({
      status: (str(fd, "status") || c.status) as typeof c.status,
      unitCostCents: cost === "" ? c.unitCostCents : parseMoney(cost),
      vendor: str(fd, "vendor") || c.vendor,
      has8130: fd.has("has8130") ? fd.get("has8130") === "on" : c.has8130,
    })
    .where(eq(charges.id, chargeId));
  refreshWorkOrder(await woIdForTask(c.taskId));
  revalidatePath("/parts");
}

export async function deleteCharge(chargeId: number) {
  const [c] = await db.delete(charges).where(eq(charges.id, chargeId)).returning();
  if (c) refreshWorkOrder(await woIdForTask(c.taskId));
}

// ---------- Payments & quotes ----------

export async function addPayment(woId: number, fd: FormData) {
  const amountCents = parseMoney(str(fd, "amount"));
  if (!amountCents) return;
  await db.insert(payments).values({
    workOrderId: woId,
    date: str(fd, "date") || new Date().toISOString().slice(0, 10),
    type: (str(fd, "type") || "deposit") as "deposit",
    method: str(fd, "method") || "Wire",
    amountCents,
  });
  refreshWorkOrder(woId);
}

export async function createQuote(woId: number, fd: FormData) {
  const loaded = await loadWorkOrder(woId);
  if (!loaded) return;
  // A quote is an estimate: hourly tasks use estimated hours, or hours already logged if more.
  const input = toPricingInput(loaded);
  const priced = priceWorkOrder(input, pricingSettings, "projected");
  if (checkWorkOrder(input, priced, "quote").some((i) => i.severity === "error")) {
    throw new Error("Fix the items listed under “Ready to quote?” before making a quote.");
  }
  const version = (loaded.quotes[0]?.version ?? 0) + 1;
  const deposit = str(fd, "deposit");
  await db.insert(quotes).values({
    workOrderId: woId,
    version,
    totalCents: priced.totals.totalCents,
    depositCents: deposit ? parseMoney(deposit) : null,
    snapshot: priced,
  });
  refreshWorkOrder(woId);
  redirect(`/work-orders/${woId}/quotes/${version}`);
}

// ---------- Technician app ----------

const TECH_COOKIE = "techId";

export async function chooseTech(fd: FormData) {
  (await cookies()).set(TECH_COOKIE, str(fd, "userId"), { httpOnly: true, sameSite: "lax", maxAge: 60 * 60 * 24 * 30 });
  redirect("/tech");
}

export async function switchTech() {
  (await cookies()).delete(TECH_COOKIE);
  redirect("/tech");
}

async function currentTechId() {
  const v = (await cookies()).get(TECH_COOKIE)?.value;
  if (!v) throw new Error("No technician selected");
  return Number(v);
}

async function stopRunning(userId: number) {
  await db
    .update(timeEntries)
    .set({ endedAt: new Date() })
    .where(and(eq(timeEntries.userId, userId), isNull(timeEntries.endedAt)));
}

export async function clockIn() {
  const userId = await currentTechId();
  const [open] = await db.select().from(shifts).where(and(eq(shifts.userId, userId), isNull(shifts.clockOut)));
  if (!open) await db.insert(shifts).values({ userId });
  revalidatePath("/tech");
  revalidatePath("/labor");
}

export async function clockOut() {
  const userId = await currentTechId();
  await stopRunning(userId);
  await db
    .update(shifts)
    .set({ clockOut: new Date() })
    .where(and(eq(shifts.userId, userId), isNull(shifts.clockOut)));
  revalidatePath("/tech");
  revalidatePath("/labor");
}

/** Starts the clock on a task. Stops any other running task and clocks in if needed. */
export async function startTask(taskId: number) {
  const userId = await currentTechId();
  await stopRunning(userId);
  const [open] = await db.select().from(shifts).where(and(eq(shifts.userId, userId), isNull(shifts.clockOut)));
  if (!open) await db.insert(shifts).values({ userId });
  await db.insert(timeEntries).values({ taskId, userId });
  const [t] = await db.select().from(tasks).where(eq(tasks.id, taskId));
  if (t?.status === "open") await db.update(tasks).set({ status: "in_progress" }).where(eq(tasks.id, taskId));
  refreshWorkOrder(t!.workOrderId);
  revalidatePath("/labor");
  redirect("/tech");
}

export async function stopTask() {
  const userId = await currentTechId();
  await stopRunning(userId);
  revalidatePath("/tech");
  revalidatePath("/labor");
  revalidatePath("/work-orders", "layout");
}

export async function requestPart(taskId: number, fd: FormData) {
  const userId = await currentTechId();
  const description = str(fd, "description");
  if (!description) return;
  await db.insert(charges).values({
    taskId,
    kind: "part",
    description,
    partNumber: str(fd, "partNumber") || null,
    quantity: Number(str(fd, "quantity") || 1),
    status: "requested",
    priority: fd.get("aog") === "on" ? "aog" : "normal",
    requestedById: userId,
  });
  refreshWorkOrder(await woIdForTask(taskId));
  revalidatePath("/parts");
  redirect("/tech?sent=part");
}

export async function addDiscrepancy(woId: number, fd: FormData) {
  const userId = await currentTechId();
  const title = str(fd, "title");
  if (!title) return;
  await db.insert(tasks).values({
    workOrderId: woId,
    seq: await nextTaskSeq(woId),
    title,
    description: str(fd, "description") || null,
    category: "discrepancy",
    foundDuringWork: true,
    createdById: userId,
  });
  refreshWorkOrder(woId);
  redirect("/tech?sent=discrepancy");
}
