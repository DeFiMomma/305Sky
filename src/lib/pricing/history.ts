/**
 * Learns from completed jobs: how long a given kind of task really takes versus
 * what was estimated or flat-rated. Feeds suggested hours into new quotes.
 */
export interface CompletedTaskRecord {
  /** Groups the same job across work orders, e.g. "CL604 | 050024 2400 Hour Check". */
  jobKey: string;
  workOrderNumber: string;
  estimatedHours?: number;
  actualHours: number;
  flatRateCents?: number;
}

export interface JobHistorySummary {
  jobKey: string;
  samples: number;
  medianActualHours: number;
  minActualHours: number;
  maxActualHours: number;
  /** Share of jobs with an estimate that ran over it (0 to 1). */
  overEstimateRate: number | null;
  /** Hours to quote next time: the median of past actuals, rounded up to the quarter hour. */
  suggestedHours: number;
  /** Flat rate that would have earned `targetRateCents` per hour at the median actual hours. */
  suggestedFlatRateCents: number;
}

function median(sorted: number[]): number {
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid]! : (sorted[mid - 1]! + sorted[mid]!) / 2;
}

export function summarizeJobHistory(
  records: CompletedTaskRecord[],
  targetRateCents: number,
): JobHistorySummary[] {
  const byJob = new Map<string, CompletedTaskRecord[]>();
  for (const r of records) byJob.set(r.jobKey, [...(byJob.get(r.jobKey) ?? []), r]);

  return [...byJob.entries()].map(([jobKey, rs]) => {
    const actuals = rs.map((r) => r.actualHours).sort((a, b) => a - b);
    const withEstimate = rs.filter((r) => r.estimatedHours !== undefined);
    const med = median(actuals);
    const suggestedHours = Math.ceil(med * 4) / 4;
    return {
      jobKey,
      samples: rs.length,
      medianActualHours: med,
      minActualHours: actuals[0]!,
      maxActualHours: actuals[actuals.length - 1]!,
      overEstimateRate: withEstimate.length
        ? withEstimate.filter((r) => r.actualHours > r.estimatedHours!).length / withEstimate.length
        : null,
      suggestedHours,
      suggestedFlatRateCents: Math.round(suggestedHours * targetRateCents),
    };
  });
}
