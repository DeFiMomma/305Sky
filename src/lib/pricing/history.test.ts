import { describe, expect, it } from "vitest";
import { summarizeJobHistory } from "./history";

describe("summarizeJobHistory", () => {
  it("suggests hours and a flat rate from what past jobs actually took", () => {
    const key = "CL604 | 050024 2400 Hour Check";
    const [s] = summarizeJobHistory(
      [
        { jobKey: key, workOrderNumber: "WO-1", estimatedHours: 150, actualHours: 172, flatRateCents: 2_500_000 },
        { jobKey: key, workOrderNumber: "WO-2", estimatedHours: 150, actualHours: 160.1, flatRateCents: 2_500_000 },
        { jobKey: key, workOrderNumber: "WO-3", estimatedHours: 150, actualHours: 140, flatRateCents: 2_500_000 },
      ],
      16500,
    );
    expect(s!.samples).toBe(3);
    expect(s!.medianActualHours).toBe(160.1);
    expect(s!.suggestedHours).toBe(160.25);
    expect(s!.overEstimateRate).toBeCloseTo(2 / 3);
    expect(s!.suggestedFlatRateCents).toBe(2_644_125); // 160.25 h x $165
  });
});
