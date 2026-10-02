import { describe, expect, it } from "vitest";
import { DEFAULT_PRICING, checkWorkOrder, findUnfilledPlaceholders, priceWorkOrder, type WorkOrder } from "./index";

function run(wo: WorkOrder, kind: "quote" | "invoice", text = "") {
  return checkWorkOrder(wo, priceWorkOrder(wo, DEFAULT_PRICING), kind, text).map((i) => i.code);
}

const base: WorkOrder = {
  id: "wo1",
  number: "WO-TEST",
  tasks: [{ id: "t1", code: "T001", title: "Inspect", status: "completed", billing: "time_and_materials" }],
  timeEntries: [{ id: "e1", taskId: "t1", technicianId: "u1", hours: 1 }],
  charges: [],
  payments: [],
};

describe("findUnfilledPlaceholders", () => {
  it("catches both placeholder styles seen on real documents", () => {
    expect(findUnfilledPlaceholders("Contact us at [contact_email] or [contact_phone]")).toEqual([
      "[contact_email]",
      "[contact_phone]",
    ]);
    expect(findUnfilledPlaceholders("A deposit of {{deposit_amount}} is required")).toEqual(["{{deposit_amount}}"]);
  });

  it("ignores ordinary bracketed text", () => {
    expect(findUnfilledPlaceholders("Seal [LH] qty 2 [see photo]")).toEqual([]);
  });
});

describe("checkWorkOrder", () => {
  it("passes a clean, completed work order", () => {
    expect(run(base, "invoice")).toEqual([]);
  });

  it("blocks a final invoice while tasks are still open", () => {
    const wo = { ...base, tasks: [{ ...base.tasks[0]!, status: "in_progress" as const }] };
    expect(run(wo, "invoice")).toContain("unfinished_task_on_invoice");
    expect(run(wo, "quote")).not.toContain("unfinished_task_on_invoice");
  });

  it("does not complain about open tasks that are deferred or internal", () => {
    const wo: WorkOrder = {
      ...base,
      tasks: [
        ...base.tasks,
        { id: "t2", code: "T002", title: "Odd jobs", status: "in_progress", billing: "internal" },
        { id: "t3", code: "T003", title: "Floor panel", status: "deferred", billing: "time_and_materials" },
      ],
    };
    expect(run(wo, "invoice")).toEqual([]);
  });

  it("blocks a part priced below cost", () => {
    const wo: WorkOrder = {
      ...base,
      charges: [
        {
          id: "c1", taskId: "t1", kind: "part", description: "Oven control panel", quantity: 1, unitCostCents: 140000,
          override: { type: "unit_price", unitPriceCents: 121000, reason: "Matched old quote" },
        },
      ],
    };
    expect(run(wo, "invoice")).toContain("below_cost");
  });

  it("requires a reason for every manual price change", () => {
    const wo: WorkOrder = {
      ...base,
      charges: [
        { id: "c1", taskId: "t1", kind: "part", description: "Seal", quantity: 1, unitCostCents: 5000, override: { type: "markup_percent", percent: 50, reason: " " } },
      ],
    };
    expect(run(wo, "quote")).toContain("override_without_reason");
  });

  it("flags a flat-rate task with no amount", () => {
    const wo = { ...base, tasks: [{ ...base.tasks[0]!, billing: "flat_rate" as const }] };
    expect(run(wo, "quote")).toContain("flat_rate_missing");
  });

  it("blocks documents with unfilled blanks", () => {
    expect(run(base, "invoice", "Questions? Contact us at [contact_email]")).toContain("unfilled_placeholder");
  });

  it("warns on a quote, and blocks an invoice, when a part has no cost yet", () => {
    const wo: WorkOrder = {
      ...base,
      charges: [{ id: "c1", taskId: "t1", kind: "part", description: "Starter generator", quantity: 1, unitCostCents: 0, costPending: true }],
    };
    const quote = checkWorkOrder(wo, priceWorkOrder(wo, DEFAULT_PRICING), "quote");
    expect(quote.find((i) => i.code === "cost_pending")?.severity).toBe("warning");
    const invoice = checkWorkOrder(wo, priceWorkOrder(wo, DEFAULT_PRICING), "invoice");
    expect(invoice.find((i) => i.code === "cost_pending")?.severity).toBe("error");
  });

  it("warns when charges are attached to an internal task", () => {
    const wo: WorkOrder = {
      ...base,
      tasks: [...base.tasks, { id: "t2", code: "T002", title: "Odd jobs", status: "completed", billing: "internal" }],
      charges: [{ id: "c1", taskId: "t2", kind: "part", description: "Rags", quantity: 1, unitCostCents: 2000 }],
    };
    expect(run(wo, "invoice")).toContain("charge_on_internal_task");
  });
});
