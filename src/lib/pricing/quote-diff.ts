import type { Cents, PricedTask, PricedWorkOrder } from "./types";

export interface TaskChange {
  taskId: string;
  code: string;
  title: string;
  change: "added" | "removed" | "changed";
  quotedCents: Cents;
  currentCents: Cents;
}

export interface QuoteDiff {
  quotedTotalCents: Cents;
  currentTotalCents: Cents;
  differenceCents: Cents;
  changes: TaskChange[];
}

/**
 * What has changed on the work order since a quote was frozen. Price changes on a task
 * smaller than `toleranceCents` (e.g. a clock ticking on a job past its estimate) are ignored.
 */
export function diffAgainstQuote(quoted: PricedWorkOrder, current: PricedWorkOrder, toleranceCents = 0): QuoteDiff {
  const billedById = (p: PricedWorkOrder) =>
    new Map(p.tasks.filter((t) => t.billed).map((t) => [t.taskId, t] as [string, PricedTask]));
  const before = billedById(quoted);
  const after = billedById(current);
  const changes: TaskChange[] = [];

  for (const [id, t] of after) {
    const q = before.get(id);
    if (!q) {
      changes.push({ taskId: id, code: t.code, title: t.title, change: "added", quotedCents: 0, currentCents: t.totalCents });
    } else if (q.totalCents !== t.totalCents && Math.abs(t.totalCents - q.totalCents) >= toleranceCents) {
      changes.push({ taskId: id, code: t.code, title: t.title, change: "changed", quotedCents: q.totalCents, currentCents: t.totalCents });
    }
  }
  for (const [id, q] of before) {
    if (!after.has(id)) {
      changes.push({ taskId: id, code: q.code, title: q.title, change: "removed", quotedCents: q.totalCents, currentCents: 0 });
    }
  }

  return {
    quotedTotalCents: quoted.totals.totalCents,
    currentTotalCents: current.totals.totalCents,
    differenceCents: current.totals.totalCents - quoted.totals.totalCents,
    changes,
  };
}
