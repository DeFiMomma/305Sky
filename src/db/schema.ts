import {
  boolean,
  integer,
  jsonb,
  numeric,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  role: text("role", { enum: ["admin", "tech"] }).notNull(),
  active: boolean("active").notNull().default(true),
});

export const customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  contactName: text("contact_name"),
  email: text("email"),
  phone: text("phone"),
  address: text("address"),
  city: text("city"),
  state: text("state"),
  zip: text("zip"),
  /** Agreed labor rate for this customer; null means the shop rate. */
  laborRateCents: integer("labor_rate_cents"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const aircraft = pgTable("aircraft", {
  id: serial("id").primaryKey(),
  tailNumber: text("tail_number").notNull().unique(),
  make: text("make"),
  model: text("model"),
  year: integer("year"),
  serialNumber: text("serial_number"),
  customerId: integer("customer_id").references(() => customers.id),
  /** Raw FAA registry record, kept for reference. */
  faaRecord: jsonb("faa_record"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const workOrders = pgTable("work_orders", {
  id: serial("id").primaryKey(),
  number: text("number").notNull().unique(),
  title: text("title").notNull(),
  /** Null for the shop's internal work order (odd jobs, meetings, admin). */
  aircraftId: integer("aircraft_id").references(() => aircraft.id),
  customerId: integer("customer_id").references(() => customers.id),
  internal: boolean("internal").notNull().default(false),
  status: text("status", { enum: ["pending", "active", "awaiting_payment", "closed"] })
    .notNull()
    .default("active"),
  aog: boolean("aog").notNull().default(false),
  customerReference: text("customer_reference"),
  laborRateCents: integer("labor_rate_cents"),
  consumablesOverrideCents: integer("consumables_override_cents"),
  consumablesOverrideReason: text("consumables_override_reason"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const tasks = pgTable(
  "tasks",
  {
    id: serial("id").primaryKey(),
    workOrderId: integer("work_order_id")
      .notNull()
      .references(() => workOrders.id),
    /** Per-work-order sequence; shown as T001, T002, … */
    seq: integer("seq").notNull(),
    title: text("title").notNull(),
    description: text("description"),
    category: text("category", { enum: ["inspection", "discrepancy", "general"] })
      .notNull()
      .default("discrepancy"),
    status: text("status", { enum: ["open", "in_progress", "completed", "deferred", "declined"] })
      .notNull()
      .default("open"),
    billing: text("billing", { enum: ["time_and_materials", "flat_rate", "internal"] })
      .notNull()
      .default("time_and_materials"),
    flatRateCents: integer("flat_rate_cents"),
    estimatedHours: numeric("estimated_hours", { mode: "number" }),
    laborRateCents: integer("labor_rate_cents"),
    /** True when a technician found it after the work order was opened. */
    foundDuringWork: boolean("found_during_work").notNull().default(false),
    createdById: integer("created_by_id").references(() => users.id),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("tasks_wo_seq").on(t.workOrderId, t.seq)],
);

/** Clock in/out of the app for the day. Utilization = task time / shift time. */
export const shifts = pgTable("shifts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  clockIn: timestamp("clock_in", { withTimezone: true }).notNull().defaultNow(),
  clockOut: timestamp("clock_out", { withTimezone: true }),
});

/** Time on a specific task. A null `endedAt` means the clock is running. */
export const timeEntries = pgTable("time_entries", {
  id: serial("id").primaryKey(),
  taskId: integer("task_id")
    .notNull()
    .references(() => tasks.id),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  startedAt: timestamp("started_at", { withTimezone: true }).notNull().defaultNow(),
  endedAt: timestamp("ended_at", { withTimezone: true }),
  /** Set when an admin corrects an entry; otherwise hours come from start/end. */
  hoursOverride: numeric("hours_override", { mode: "number" }),
  note: text("note"),
});

export const charges = pgTable("charges", {
  id: serial("id").primaryKey(),
  taskId: integer("task_id")
    .notNull()
    .references(() => tasks.id),
  kind: text("kind", { enum: ["part", "shipping", "fuel", "outside_service", "misc"] }).notNull(),
  description: text("description").notNull(),
  partNumber: text("part_number"),
  quantity: numeric("quantity", { mode: "number" }).notNull().default(1),
  /** What 305 SKY pays per unit. Null while a part is still being sourced. */
  unitCostCents: integer("unit_cost_cents"),
  overrideType: text("override_type", { enum: ["markup_percent", "unit_price"] }),
  overrideValue: numeric("override_value", { mode: "number" }),
  overrideReason: text("override_reason"),
  /** Parts workflow. Non-part charges are created as "installed". */
  status: text("status", {
    enum: ["requested", "sourcing", "quoted", "ordered", "received", "installed", "cancelled"],
  })
    .notNull()
    .default("installed"),
  priority: text("priority", { enum: ["normal", "aog"] }).notNull().default("normal"),
  vendor: text("vendor"),
  has8130: boolean("has_8130").notNull().default(false),
  requestedById: integer("requested_by_id").references(() => users.id),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  workOrderId: integer("work_order_id")
    .notNull()
    .references(() => workOrders.id),
  date: text("date").notNull(),
  type: text("type", { enum: ["deposit", "progress", "final", "other"] }).notNull(),
  method: text("method").notNull(),
  amountCents: integer("amount_cents").notNull(),
});

/** A frozen copy of the priced work order at the moment a quote was made. */
export const quotes = pgTable(
  "quotes",
  {
    id: serial("id").primaryKey(),
    workOrderId: integer("work_order_id")
      .notNull()
      .references(() => workOrders.id),
    version: integer("version").notNull(),
    status: text("status", { enum: ["draft", "sent", "accepted"] }).notNull().default("draft"),
    depositCents: integer("deposit_cents"),
    totalCents: integer("total_cents").notNull(),
    snapshot: jsonb("snapshot").notNull(),
    createdById: integer("created_by_id").references(() => users.id),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("quotes_wo_version").on(t.workOrderId, t.version)],
);
