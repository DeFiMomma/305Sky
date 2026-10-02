import { describe, expect, it } from "vitest";
import { utilizationRows } from "./utilization";

describe("utilizationRows", () => {
  it("measures aircraft hours against clocked hours with an 80% target", () => {
    const [a, b, c] = utilizationRows([
      { userId: 1, name: "Mateo", shiftHours: 8, aircraftHours: 4, internalHours: 4.5 },
      { userId: 2, name: "Enriquillo", shiftHours: 8, aircraftHours: 7, internalHours: 0.5 },
      { userId: 3, name: "Off today", shiftHours: 0, aircraftHours: 0, internalHours: 0 },
    ]);
    expect(a).toMatchObject({ name: "Enriquillo", utilization: 0.875, meetsTarget: true, unassignedHours: 0.5 });
    expect(b).toMatchObject({ name: "Mateo", utilization: 0.5, meetsTarget: false, unassignedHours: 0 });
    expect(c).toMatchObject({ utilization: null, meetsTarget: false });
  });
});
