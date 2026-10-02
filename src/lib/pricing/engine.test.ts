import { describe, expect, it } from "vitest";
import {
  DEFAULT_PRICING,
  partsMarkupPercent,
  priceCharge,
  priceWorkOrder,
  type ChargeLine,
  type Task,
  type WorkOrder,
} from "./index";

const S = DEFAULT_PRICING;

function task(overrides: Partial<Task> & Pick<Task, "id">): Task {
  return {
    code: overrides.id.toUpperCase(),
    title: "Task",
    status: "completed",
    billing: "time_and_materials",
    ...overrides,
  };
}

function charge(overrides: Partial<ChargeLine> & Pick<ChargeLine, "id" | "unitCostCents">): ChargeLine {
  return { taskId: "t1", kind: "part", description: "Part", quantity: 1, ...overrides };
}

function workOrder(overrides: Partial<WorkOrder> = {}): WorkOrder {
  return {
    id: "wo1",
    number: "WO-TEST",
    tasks: [task({ id: "t1" })],
    timeEntries: [],
    charges: [],
    payments: [],
    ...overrides,
  };
}

describe("parts markup tiers", () => {
  it.each([
    [1, 100],
    [9999, 100], // $99.99
    [10000, 25], // exactly $100.00 moves to the 25% tier
    [99999, 25], // $999.99
    [100000, 20], // exactly $1,000.00 moves to the 20% tier
    [5_000_000, 20],
  ])("unit cost %i cents gets %i%%", (cost, pct) => {
    expect(partsMarkupPercent(cost, S)).toBe(pct);
  });

  it("prices each tier to the cent", () => {
    expect(priceCharge(charge({ id: "a", unitCostCents: 9999 }), S).unitPriceCents).toBe(19998);
    expect(priceCharge(charge({ id: "b", unitCostCents: 10000 }), S).unitPriceCents).toBe(12500);
    expect(priceCharge(charge({ id: "c", unitCostCents: 99999 }), S).unitPriceCents).toBe(124999);
    expect(priceCharge(charge({ id: "d", unitCostCents: 100000 }), S).unitPriceCents).toBe(120000);
  });

  it("picks the tier from the unit cost, not the line total", () => {
    // 10 x $50 = $500 of parts, but each unit is under $100, so +100%.
    const p = priceCharge(charge({ id: "a", unitCostCents: 5000, quantity: 10 }), S);
    expect(p.markupPercent).toBe(100);
    expect(p.extendedPriceCents).toBe(100000);
    expect(p.extendedCostCents).toBe(50000);
  });
});

describe("other charge markups", () => {
  it("adds 20% to shipping and fuel", () => {
    expect(priceCharge(charge({ id: "s", kind: "shipping", unitCostCents: 5000 }), S).unitPriceCents).toBe(6000);
    const fuel = priceCharge(charge({ id: "f", kind: "fuel", unitCostCents: 452, quantity: 550 }), S);
    expect(fuel.unitPriceCents).toBe(542); // $4.52 + 20% = $5.424, rounded to $5.42
    expect(fuel.extendedPriceCents).toBe(298100);
  });

  it("does not mark up outside labor unless a markup is entered on that line", () => {
    const plain = priceCharge(charge({ id: "o", kind: "outside_service", unitCostCents: 3834600 }), S);
    expect(plain.unitPriceCents).toBe(3834600);
    const marked = priceCharge(
      charge({
        id: "o2",
        kind: "outside_service",
        unitCostCents: 3834600,
        override: { type: "markup_percent", percent: 10, reason: "Agreed with customer" },
      }),
      S,
    );
    expect(marked.unitPriceCents).toBe(4218060);
    expect(marked.overridden).toBe(true);
  });

  it("bills misc lines at the entered amount", () => {
    expect(priceCharge(charge({ id: "m", kind: "misc", unitCostCents: 550000 }), S).unitPriceCents).toBe(550000);
  });

  it("honours a fixed unit-price override and reports the resulting markup", () => {
    const p = priceCharge(
      charge({ id: "a", unitCostCents: 121000, override: { type: "unit_price", unitPriceCents: 140000, reason: "Quoted price" } }),
      S,
    );
    expect(p.unitPriceCents).toBe(140000);
    expect(p.markupPercent).toBeCloseTo(15.70, 2);
  });
});

describe("labor", () => {
  it("bills time and materials at $165/hr by default", () => {
    const wo = workOrder({
      timeEntries: [
        { id: "e1", taskId: "t1", technicianId: "u1", hours: 1.5 },
        { id: "e2", taskId: "t1", technicianId: "u2", hours: 1.25 },
      ],
    });
    const t = priceWorkOrder(wo, S).tasks[0]!;
    expect(t.actualHours).toBe(2.75);
    expect(t.laborCents).toBe(45375);
  });

  it("uses task rate over customer rate over shop rate", () => {
    const entries = [
      { id: "e1", taskId: "t1", technicianId: "u1", hours: 1 },
      { id: "e2", taskId: "t2", technicianId: "u1", hours: 1 },
    ];
    const wo = workOrder({
      laborRateCents: 15000,
      tasks: [task({ id: "t1", laborRateCents: 14500 }), task({ id: "t2" })],
      timeEntries: entries,
    });
    const [t1, t2] = priceWorkOrder(wo, S).tasks;
    expect(t1!.laborCents).toBe(14500);
    expect(t2!.laborCents).toBe(15000);
    expect(priceWorkOrder({ ...wo, laborRateCents: undefined }, S).tasks[1]!.laborCents).toBe(16500);
  });

  it("bills flat rate regardless of hours, but tracks the overrun", () => {
    const wo = workOrder({
      tasks: [task({ id: "t1", billing: "flat_rate", flatRateCents: 2_500_000, estimatedHours: 180 })],
      timeEntries: [{ id: "e1", taskId: "t1", technicianId: "u1", hours: 210 }],
    });
    const t = priceWorkOrder(wo, S).tasks[0]!;
    expect(t.laborCents).toBe(2_500_000);
    expect(t.hoursVariance).toBe(30);
    expect(t.effectiveHourlyRateCents).toBe(11905); // earned ~$119.05/hr vs $165 target
  });

  it("does not let float drift creep into summed hours", () => {
    const wo = workOrder({
      timeEntries: [0.1, 0.2, 0.25].map((h, i) => ({ id: `e${i}`, taskId: "t1", technicianId: "u", hours: h })),
    });
    expect(priceWorkOrder(wo, S).tasks[0]!.actualHours).toBe(0.55);
  });
});

describe("what gets billed", () => {
  it("never bills internal tasks (odd jobs, meetings) even with hours logged", () => {
    const wo = workOrder({
      tasks: [task({ id: "t1", billing: "internal", title: "Morning meeting" })],
      timeEntries: [{ id: "e1", taskId: "t1", technicianId: "u1", hours: 1.25 }],
    });
    const p = priceWorkOrder(wo, S);
    expect(p.tasks[0]!.billed).toBe(false);
    expect(p.tasks[0]!.actualHours).toBe(1.25);
    expect(p.totals.totalCents).toBe(0);
  });

  it("excludes deferred and declined discrepancies", () => {
    const wo = workOrder({
      tasks: [task({ id: "t1", status: "deferred" }), task({ id: "t2", status: "declined" })],
      timeEntries: [{ id: "e1", taskId: "t1", technicianId: "u1", hours: 2 }],
      charges: [charge({ id: "c1", taskId: "t2", unitCostCents: 50000 })],
    });
    expect(priceWorkOrder(wo, S).totals.totalCents).toBe(0);
  });
});

describe("consumables fee", () => {
  const withLabor = (hours: number) =>
    workOrder({ timeEntries: [{ id: "e1", taskId: "t1", technicianId: "u1", hours }] });

  it("is 4% of the whole invoice", () => {
    // 100 hrs x $165 = $16,500 -> 4% = $660
    const t = priceWorkOrder(withLabor(100), S).totals;
    expect(t.subtotalCents).toBe(1_650_000);
    expect(t.consumablesCents).toBe(66_000);
    expect(t.totalCents).toBe(1_716_000);
    expect(t.consumablesCapped).toBe(false);
  });

  it("includes parts, shipping, fuel and outside labor in the base", () => {
    const wo = workOrder({
      charges: [
        charge({ id: "p", unitCostCents: 100000 }), // $1,200
        charge({ id: "s", kind: "shipping", unitCostCents: 10000 }), // $120
        charge({ id: "o", kind: "outside_service", unitCostCents: 68000 }), // $680
      ],
    });
    const t = priceWorkOrder(wo, S).totals;
    expect(t.subtotalCents).toBe(200_000);
    expect(t.consumablesCents).toBe(8_000);
  });

  it("caps at $5,000", () => {
    const t = priceWorkOrder(workOrder({ charges: [charge({ id: "m", kind: "misc", unitCostCents: 20_000_000 })] }), S).totals;
    expect(t.consumablesCents).toBe(500_000);
    expect(t.consumablesCapped).toBe(true);
  });

  it("is exactly $5,000 and not flagged as capped at a $125,000 subtotal", () => {
    const t = priceWorkOrder(workOrder({ charges: [charge({ id: "m", kind: "misc", unitCostCents: 12_500_000 })] }), S).totals;
    expect(t.consumablesCents).toBe(500_000);
    expect(t.consumablesCapped).toBe(false);
  });

  it("can be overridden for a work order", () => {
    const wo = { ...withLabor(100), consumablesOverride: { amountCents: 0, reason: "Waived" } };
    expect(priceWorkOrder(wo, S).totals.consumablesCents).toBe(0);
  });
});

describe("totals", () => {
  it("subtracts payments to get the balance", () => {
    const wo = workOrder({
      timeEntries: [{ id: "e1", taskId: "t1", technicianId: "u1", hours: 10 }],
      payments: [{ id: "p1", date: "2026-10-01", type: "deposit", method: "Wire", amountCents: 100_000 }],
    });
    const t = priceWorkOrder(wo, S).totals;
    expect(t.totalCents).toBe(171_600); // $1,650 + 4% = $1,716
    expect(t.balanceCents).toBe(71_600);
  });

  it("always equals the sum of its task lines plus consumables", () => {
    const wo = workOrder({
      tasks: [task({ id: "t1" }), task({ id: "t2", billing: "flat_rate", flatRateCents: 60000 }), task({ id: "t3", billing: "internal" })],
      timeEntries: [
        { id: "e1", taskId: "t1", technicianId: "u1", hours: 3.75 },
        { id: "e2", taskId: "t3", technicianId: "u1", hours: 1 },
      ],
      charges: [
        charge({ id: "c1", taskId: "t1", unitCostCents: 6259 }),
        charge({ id: "c2", taskId: "t1", kind: "shipping", unitCostCents: 4511 }),
        charge({ id: "c3", taskId: "t2", unitCostCents: 98890, quantity: 2 }),
        charge({ id: "c4", taskId: "t3", unitCostCents: 1000 }),
      ],
    });
    const p = priceWorkOrder(wo, S);
    const lineSum = p.tasks.filter((t) => t.billed).reduce((a, t) => a + t.totalCents, 0);
    const t = p.totals;
    expect(t.subtotalCents).toBe(lineSum);
    expect(t.subtotalCents).toBe(t.laborCents + t.partsCents + t.shippingCents + t.fuelCents + t.outsideServicesCents + t.miscCents);
    expect(t.totalCents).toBe(t.subtotalCents + t.consumablesCents);
  });
});

describe("regression: WO-00030-N604XT task T307 'Additional Parts'", () => {
  // Aerokeeper billed these eight parts at cost: $7,700.99.
  const parts: [string, number, number][] = [
    ["7592389-101 FILTER, SCAVENGE", 29700, 2],
    ["559S6 ELEMENT, DISPOSABLE", 53350, 2],
    ["600-10185-3 SEAL, RUBBER MOULDED", 51480, 2],
    ["600-19091-1 SEAL, DOOR, TANK ACCESS", 6259, 1],
    ["600-14532-8 SEAL", 98890, 1],
    ["K600-14006-1 SEAL (LH)", 171270, 1],
    ["BD1-0028-001 LIGHT, SERVICE FLOOD", 125730, 1],
    ["600-14532-7 SEAL", 98890, 1],
  ];
  const wo = workOrder({
    tasks: [task({ id: "t307", code: "T307", title: "ADDITIONAL PARTS" })],
    charges: parts.map(([description, unitCostCents, quantity], i) =>
      charge({ id: `p${i}`, taskId: "t307", description, unitCostCents, quantity }),
    ),
  });

  it("costs $7,700.99 and now bills $9,524.70 under the tiered markup", () => {
    const t = priceWorkOrder(wo, S).totals;
    expect(t.chargesCostCents).toBe(770_099);
    expect(t.partsCents).toBe(952_470);
  });
});
