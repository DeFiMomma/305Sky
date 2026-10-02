/**
 * Creates/updates the database schema, then loads sample data (based on real 305 SKY
 * work orders) if the database is empty. Run with: npm run db:setup
 * Pass --reset to wipe the local database first.
 */
import { mkdirSync, rmSync } from "node:fs";
import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { migrate } from "drizzle-orm/pglite/migrator";
import * as schema from "../src/db/schema";
import { DEFAULT_PRICING, priceWorkOrder } from "../src/lib/pricing";

const DATA_DIR = process.env.PGLITE_DIR ?? ".data/pglite";
if (process.argv.includes("--reset")) rmSync(DATA_DIR, { recursive: true, force: true });
mkdirSync(DATA_DIR, { recursive: true });

const client = new PGlite(DATA_DIR);
const db = drizzle(client, { schema });
const { users, customers, aircraft, workOrders, tasks, shifts, timeEntries, charges, payments, quotes } = schema;

await migrate(db, { migrationsFolder: "drizzle" });
console.log("Schema up to date.");

const existing = await db.select().from(users);
if (existing.length) {
  console.log("Database already has data; skipping sample data. Use --reset to start over.");
  process.exit(0);
}

// ---------- People ----------
const techNames = ["Christopher Perez", "Mateo Moreno", "Enriquillo Munoz", "Marcelo Rodrigues", "Eduardo Gutierrez", "Rodrigo Cunha"];
const techRows = await db.insert(users).values(techNames.map((name) => ({ name, role: "tech" as const }))).returning();
await db.insert(users).values([
  { name: "Stephanie Nickolich", role: "admin" },
  { name: "Ryan Willis", role: "admin" },
]);
const tech = Object.fromEntries(techRows.map((t) => [t.name.split(" ")[0]!, t.id]));

// ---------- Customers & aircraft ----------
const cust = Object.fromEntries(
  (
    await db
      .insert(customers)
      .values([
        { name: "GILLEN DIESEL AVIATION LLC" },
        { name: "J TURBINES INC", contactName: "J TURBINES INC", email: "john@j-turbines.com", phone: "(713) 254-9299", address: "251 Little Falls Dr Unit 6665", city: "Wilmington", state: "DE", zip: "19808-1674" },
        { name: "Tomahawk 360, LLC", contactName: "Steve Clements" },
        { name: "PRISM AVIATION, LLC", contactName: "James Deppert" },
        { name: "M4 AVIATION", contactName: "Greg Miller" },
      ])
      .returning()
  ).map((c) => [c.name.split(/[ ,]/)[0]!, c.id]),
);

const ac = Object.fromEntries(
  (
    await db
      .insert(aircraft)
      .values([
        { tailNumber: "N477DD", year: 1981, make: "MITSUBISHI", model: "MU-2B-40", customerId: cust.GILLEN },
        { tailNumber: "N604XT", year: 1996, make: "BOMBARDIER", model: "CHALLENGER 604", serialNumber: "5307", customerId: cust.J },
        { tailNumber: "N68VJ", make: "BEECHCRAFT", model: "KING AIR B300", customerId: cust.Tomahawk },
        { tailNumber: "N843GX", year: 1999, make: "BOMBARDIER", model: "BD-700-1A10", customerId: cust.PRISM },
        { tailNumber: "N5481T", year: 2001, make: "BOMBARDIER", model: "CL-600-2B16 CHALLENGER 604", customerId: cust.M4 },
      ])
      .returning()
  ).map((a) => [a.tailNumber, a.id]),
);

// ---------- Helpers ----------
// "Today" starts 6 hours ago so the sample shift is in progress whenever this runs.
const today = new Date(Date.now() - 6 * 3_600_000);
today.setSeconds(0, 0);
const at = (hoursAfter7am: number, dayOffset = 0) => new Date(today.getTime() + (dayOffset * 24 + hoursAfter7am) * 3_600_000);

type TaskSeed = Omit<typeof tasks.$inferInsert, "workOrderId" | "seq">;
async function createWo(wo: Omit<typeof workOrders.$inferInsert, "id">, taskSeeds: TaskSeed[]) {
  const [w] = await db.insert(workOrders).values(wo).returning();
  const ts = taskSeeds.length
    ? await db.insert(tasks).values(taskSeeds.map((t, i) => ({ ...t, workOrderId: w!.id, seq: i + 1 }))).returning()
    : [];
  return { wo: w!, t: ts };
}
async function log(userId: number, taskId: number, start: number, hrs: number | null, day = 0) {
  await db.insert(timeEntries).values({ userId, taskId, startedAt: at(start, day), endedAt: hrs === null ? null : at(start + hrs, day) });
}

// ---------- Shop (internal) ----------
const shop = await createWo({ number: "WO-00013-305 SKY", title: "Shop time", internal: true }, [
  { title: "MORNING MEETING", billing: "internal", category: "general", status: "in_progress" },
  { title: "ODD JOBS", billing: "internal", category: "general", status: "in_progress" },
  { title: "ADMIN / TRAINING", billing: "internal", category: "general", status: "in_progress" },
]);
const [meeting, oddJobs] = shop.t;

// ---------- N477DD annual (has a quote that is now out of date) ----------
const n477 = await createWo(
  { number: "WO-00063-N477DD", title: "Annual maintenance", aircraftId: ac.N477DD, customerId: cust.GILLEN, customerReference: "2682044" },
  [
    { title: "COMPLY WITH TASK CODE – 1 Year Special Inspection", category: "inspection", billing: "flat_rate", flatRateCents: 495000, estimatedHours: 30, status: "in_progress" },
    { title: "COMPLY WITH TASK CODE – 100 Hour Inspection", category: "inspection", billing: "flat_rate", flatRateCents: 330000, estimatedHours: 20, status: "in_progress" },
    { title: "Left tire worn", estimatedHours: 3, status: "in_progress" },
    { title: "WINGS BOOT NEED PRC L/H & R/H", estimatedHours: 4, status: "in_progress" },
  ],
);
const [special, hundred, tire, boots] = n477.t;
await db.insert(charges).values([
  { taskId: tire!.id, kind: "part", description: "Main tire 22x6.75-10", partNumber: "301-625-9", quantity: 1, unitCostCents: 61840, status: "installed" },
  { taskId: hundred!.id, kind: "part", description: "Filter", partNumber: "3001436-1", quantity: 2, unitCostCents: 48312, status: "installed" },
]);
await log(tech.Enriquillo!, special!.id, 0, 6, -2);
await log(tech.Marcelo!, special!.id, 0, 8, -1);
await log(tech.Enriquillo!, hundred!.id, 0, 7, -1);

// Freeze Quote v1 now, before the inspection turned up more work.
{
  const { loadForQuote } = await quoteHelpers();
  const snap = await loadForQuote(n477.wo.id);
  await db.insert(quotes).values({ workOrderId: n477.wo.id, version: 1, totalCents: snap.totals.totalCents, depositCents: 1000000, snapshot: snap, status: "sent", createdAt: at(-20, -2) });
}

// Found during the inspection, after the quote went out:
const [starter1, starter2, bulb] = await db
  .insert(tasks)
  .values([
    { workOrderId: n477.wo.id, seq: 5, title: "#1 Engine starter generator", foundDuringWork: true, createdById: tech.Marcelo, estimatedHours: 6 },
    { workOrderId: n477.wo.id, seq: 6, title: "#2 Engine starter generator", foundDuringWork: true, createdById: tech.Marcelo, estimatedHours: 6 },
    { workOrderId: n477.wo.id, seq: 7, title: "SPARE KIT MISSING 1EA BULB NUMBER 327", foundDuringWork: true, createdById: tech.Eduardo },
  ])
  .returning();
await db.insert(charges).values([
  { taskId: starter1!.id, kind: "part", description: "STARTER GENERATOR", partNumber: "23046-028", quantity: 1, unitCostCents: 288000, status: "quoted", vendor: "Precision Aero", requestedById: tech.Marcelo },
  { taskId: starter2!.id, kind: "part", description: "STARTER GENERATOR", partNumber: "23046-028", quantity: 1, unitCostCents: 288000, status: "quoted", vendor: "Precision Aero", requestedById: tech.Marcelo },
  { taskId: bulb!.id, kind: "part", description: "BULB", partNumber: "327", quantity: 1, unitCostCents: null, status: "requested", requestedById: tech.Eduardo },
  { taskId: starter1!.id, kind: "shipping", description: "Overnight shipping – starter generator", quantity: 1, unitCostCents: 18500 },
]);
await log(tech.Enriquillo!, special!.id, 0, 1.25);
await log(tech.Marcelo!, tire!.id, 0, 2.5);
await log(tech.Eduardo!, boots!.id, 1, 2.25);
await log(tech.Enriquillo!, tire!.id, 1.5, 0.25);
await log(tech.Eduardo!, boots!.id, 3.5, 0.25);
await log(tech.Marcelo!, tire!.id, 3, 1.5);
await log(tech.Enriquillo!, tire!.id, 2, null); // clock still running
await db.insert(payments).values({ workOrderId: n477.wo.id, date: today.toISOString().slice(0, 10), type: "deposit", method: "Wire", amountCents: 1000000 });

// ---------- N604XT ----------
const n604 = await createWo(
  { number: "WO-00030-N604XT", title: "Inspection & interior refurbishment", aircraftId: ac.N604XT, customerId: cust.J, customerReference: "2682010" },
  [
    { title: "COMPRESSOR WASH – ENGINE (LEFT)", category: "general", billing: "flat_rate", flatRateCents: 60000, estimatedHours: 3, status: "completed" },
    { title: "COMPRESSOR WASH – ENGINE (RIGHT)", category: "general", billing: "flat_rate", flatRateCents: 60000, estimatedHours: 3, status: "completed" },
    { title: "COMPLY WITH TASK CODE 050013 – 400 Hour Check", category: "inspection", billing: "flat_rate", flatRateCents: 1044000, estimatedHours: 72, status: "in_progress" },
    { title: "FERRY PILOT | OUTSIDE LABOR", category: "general", status: "completed" },
    { title: "FUEL CHARGES", category: "general", status: "completed" },
    { title: "ADDITIONAL PARTS", category: "general", status: "in_progress" },
    { title: "CAMP DISCREPANCY N604XT-250828-4 – GALLEY OVEN INOP", status: "completed" },
    { title: "AFT EQUIPMENT BAY FLOOR BOARD PANEL BENT / CRACKED", status: "deferred" },
  ],
);
const [cwL, cwR, check400, ferry, fuel, addl, oven] = n604.t;
await log(tech.Rodrigo!, cwL!.id, 0, 3.5, -3);
await log(tech.Rodrigo!, cwR!.id, 0, 2.75, -2);
await log(tech.Christopher!, check400!.id, 0, 8, -3);
await log(tech.Christopher!, check400!.id, 0, 8, -2);
await log(tech.Christopher!, check400!.id, 0, 8, -1);
await log(tech.Mateo!, check400!.id, 0, 8, -1);
await log(tech.Mateo!, oven!.id, 0, 5.75, -2);
await db.insert(charges).values([
  { taskId: ferry!.id, kind: "outside_service", description: "Ferry pilot – flat fee", quantity: 1, unitCostCents: 340000 },
  { taskId: fuel!.id, kind: "fuel", description: "Jet A", quantity: 550, unitCostCents: 452 },
  { taskId: oven!.id, kind: "part", description: "OVEN CONTROL PANEL", partNumber: "72038000", quantity: 1, unitCostCents: 140000, has8130: true },
  ...(
    [
      ["FILTER, SCAVENGE", "7592389-101", 29700, 2],
      ["ELEMENT, DISPOSABLE", "559S6", 53350, 2],
      ["SEAL, RUBBER MOULDED", "600-10185-3", 51480, 2],
      ["SEAL, DOOR, TANK ACCESS", "600-19091-1", 6259, 1],
      ["SEAL", "600-14532-8", 98890, 1],
      ["SEAL (LH)", "K600-14006-1", 171270, 1],
      ["LIGHT, SERVICE FLOOD", "BD1-0028-001", 125730, 1],
      ["SEAL", "600-14532-7", 98890, 1],
    ] as const
  ).map(([description, partNumber, unitCostCents, quantity]) => ({ taskId: addl!.id, kind: "part" as const, description, partNumber, unitCostCents, quantity })),
  { taskId: check400!.id, kind: "part", description: "AL21SG Water Filter Cartridge", partNumber: "AL21SG", quantity: 1, unitCostCents: 20833 },
  { taskId: check400!.id, kind: "part", description: "ADAPTIVE FLIGHT DISPLAY", partNumber: "822-3065-001", quantity: 1, unitCostCents: null, status: "sourcing" },
]);
await db.insert(payments).values({ workOrderId: n604.wo.id, date: at(0, -10).toISOString().slice(0, 10), type: "deposit", method: "Wire", amountCents: 2500000 });

// ---------- Other work orders ----------
const n843 = await createWo(
  { number: "WO-00065-N843GX", title: "PRE-FLIGHT CHECK", aircraftId: ac.N843GX, customerId: cust.PRISM, aog: true },
  [{ title: "PRE-FLIGHT INSPECTION", category: "inspection", status: "in_progress", estimatedHours: 5 }],
);
await log(tech.Christopher!, n843.t[0]!.id, 1.25, 1.5);
await createWo({ number: "WO-00056-N68VJ", title: "N68VJ DISCREPANCIES", aircraftId: ac.N68VJ, customerId: cust.Tomahawk, status: "pending" }, [
  { title: "Customer squawk list – evaluate" },
]);
const n548 = await createWo(
  { number: "WO-00067-N5481T", title: "TIRE – MFD", aircraftId: ac.N5481T, customerId: cust.M4, status: "awaiting_payment" },
  [
    { title: "Replace nose tire", status: "completed" },
    { title: "MFD intermittent – troubleshoot", status: "completed" },
  ],
);
await log(tech.Rodrigo!, n548.t[0]!.id, 0, 2, -5);
await log(tech.Rodrigo!, n548.t[1]!.id, 0, 6.5, -5);
await db.insert(charges).values({ taskId: n548.t[0]!.id, kind: "part", description: "Nose tire", partNumber: "070-311-0", quantity: 1, unitCostCents: 41200 });

// ---------- Today's internal time and shifts ----------
for (const [name, h] of [["Mateo", 1], ["Christopher", 1.25], ["Eduardo", 1]] as const) await log(tech[name]!, meeting!.id, 0, h);
await log(tech.Christopher!, oddJobs!.id, 2.75, 2.75);
await log(tech.Mateo!, oddJobs!.id, 1, 3.5);
await log(tech.Rodrigo!, oddJobs!.id, 0, 3.5);
for (const name of ["Christopher", "Mateo", "Enriquillo", "Marcelo", "Eduardo", "Rodrigo"]) {
  await db.insert(shifts).values({ userId: tech[name]!, clockIn: at(0), clockOut: name === "Enriquillo" ? null : at(5) });
}

console.log("Sample data loaded.");
await client.close();

async function quoteHelpers() {
  const { eq, inArray } = await import("drizzle-orm");
  return {
    async loadForQuote(woId: number) {
      const ts = await db.select().from(tasks).where(eq(tasks.workOrderId, woId));
      const ids = ts.map((t) => t.id);
      const es = await db.select().from(timeEntries).where(inArray(timeEntries.taskId, ids));
      const cs = await db.select().from(charges).where(inArray(charges.taskId, ids));
      return priceWorkOrder(
        {
          id: String(woId),
          number: "",
          tasks: ts.map((t) => ({
            id: String(t.id),
            code: `T${String(t.seq).padStart(3, "0")}`,
            title: t.title,
            status: t.status,
            billing: t.billing,
            flatRateCents: t.flatRateCents ?? undefined,
            estimatedHours: t.estimatedHours ?? undefined,
          })),
          timeEntries: es.map((e) => ({
            id: String(e.id),
            taskId: String(e.taskId),
            technicianId: String(e.userId),
            hours: Math.round(((e.endedAt!.getTime() - e.startedAt.getTime()) / 3_600_000) * 100) / 100,
          })),
          charges: cs.map((c) => ({ id: String(c.id), taskId: String(c.taskId), kind: c.kind, description: c.description, quantity: c.quantity, unitCostCents: c.unitCostCents ?? 0 })),
          payments: [],
        },
        DEFAULT_PRICING,
        "projected",
      );
    },
  };
}
