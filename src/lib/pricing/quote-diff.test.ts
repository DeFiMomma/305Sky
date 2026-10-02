import { describe, expect, it } from "vitest";
import { DEFAULT_PRICING, diffAgainstQuote, priceWorkOrder, type WorkOrder } from "./index";

const quotedWo: WorkOrder = {
  id: "wo1",
  number: "WO-TEST",
  tasks: [
    { id: "t1", code: "T001", title: "Annual", status: "open", billing: "flat_rate", flatRateCents: 500000 },
    { id: "t2", code: "T002", title: "Left tire worn", status: "open", billing: "time_and_materials" },
  ],
  timeEntries: [{ id: "e1", taskId: "t2", technicianId: "u1", hours: 1 }],
  charges: [],
  payments: [],
};

describe("diffAgainstQuote", () => {
  it("is empty when nothing changed", () => {
    const p = priceWorkOrder(quotedWo, DEFAULT_PRICING);
    expect(diffAgainstQuote(p, p)).toMatchObject({ differenceCents: 0, changes: [] });
  });

  it("lists added, changed and removed (deferred) items and the total difference", () => {
    const quoted = priceWorkOrder(quotedWo, DEFAULT_PRICING);
    const current = priceWorkOrder(
      {
        ...quotedWo,
        tasks: [
          quotedWo.tasks[0]!,
          { ...quotedWo.tasks[1]!, status: "deferred" },
          { id: "t3", code: "T003", title: "Wing boot PRC", status: "open", billing: "time_and_materials" },
        ],
        timeEntries: [...quotedWo.timeEntries, { id: "e2", taskId: "t3", technicianId: "u1", hours: 2 }],
        charges: [{ id: "c1", taskId: "t1", kind: "part", description: "Filter", quantity: 2, unitCostCents: 48312 }],
      },
      DEFAULT_PRICING,
    );
    const diff = diffAgainstQuote(quoted, current);
    expect(diff.changes.map((c) => [c.code, c.change])).toEqual([
      ["T001", "changed"],
      ["T003", "added"],
      ["T002", "removed"],
    ]);
    expect(diff.differenceCents).toBe(current.totals.totalCents - quoted.totals.totalCents);
  });

  it("ignores small drift below the tolerance", () => {
    const quoted = priceWorkOrder(quotedWo, DEFAULT_PRICING);
    const current = priceWorkOrder(
      { ...quotedWo, timeEntries: [{ id: "e1", taskId: "t2", technicianId: "u1", hours: 1.25 }] },
      DEFAULT_PRICING,
    );
    expect(diffAgainstQuote(quoted, current, 5000).changes).toEqual([]);
    expect(diffAgainstQuote(quoted, current).changes).toHaveLength(1);
  });
});
