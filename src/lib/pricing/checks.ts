import { isBilled } from "./engine";
import type { PricedWorkOrder, WorkOrder } from "./types";

export type DocumentKind = "quote" | "invoice";

export interface Issue {
  severity: "error" | "warning";
  code: string;
  message: string;
  taskId?: string;
  lineId?: string;
}

const PLACEHOLDER = /\{\{\s*[\w.]+\s*\}\}|\[(?:[a-z]+_)+[a-z]+\]/g;

/** Finds template blanks like `{{deposit_amount}}` or `[contact_email]` left in document text. */
export function findUnfilledPlaceholders(text: string): string[] {
  return [...new Set(text.match(PLACEHOLDER) ?? [])];
}

/**
 * Checks that must pass before a quote or invoice can be sent. Errors block sending;
 * warnings are shown to the admin for a decision.
 */
export function checkWorkOrder(
  wo: WorkOrder,
  priced: PricedWorkOrder,
  kind: DocumentKind,
  documentText = "",
): Issue[] {
  const issues: Issue[] = [];
  const tasksById = new Map(wo.tasks.map((t) => [t.id, t]));

  for (const task of wo.tasks) {
    if (task.billing === "flat_rate" && task.flatRateCents === undefined) {
      issues.push({
        severity: "error",
        code: "flat_rate_missing",
        message: `${task.code} is flat rate but has no flat-rate amount.`,
        taskId: task.id,
      });
    }
  }

  for (const line of wo.charges) {
    const task = tasksById.get(line.taskId);
    if (!task) {
      issues.push({
        severity: "error",
        code: "orphan_line",
        message: `"${line.description}" is not attached to a task on this work order.`,
        lineId: line.id,
      });
      continue;
    }
    if (line.quantity <= 0 || line.unitCostCents < 0) {
      issues.push({
        severity: "error",
        code: "invalid_quantity_or_cost",
        message: `"${line.description}" has a zero/negative quantity or a negative cost.`,
        taskId: task.id,
        lineId: line.id,
      });
    }
    if (line.override && line.override.reason.trim() === "") {
      issues.push({
        severity: "error",
        code: "override_without_reason",
        message: `"${line.description}" has a manual price change with no reason.`,
        taskId: task.id,
        lineId: line.id,
      });
    }
    if (line.costPending && isBilled(task)) {
      issues.push({
        severity: kind === "invoice" ? "error" : "warning",
        code: "cost_pending",
        message: `"${line.description}" has no cost yet, so it is priced at $0.`,
        taskId: task.id,
        lineId: line.id,
      });
    }
    if (kind === "invoice" && line.notInstalled && isBilled(task)) {
      issues.push({
        severity: "warning",
        code: "part_not_installed",
        message: `"${line.description}" is billed but not marked installed.`,
        taskId: task.id,
        lineId: line.id,
      });
    }
    if (task.billing === "internal") {
      issues.push({
        severity: "warning",
        code: "charge_on_internal_task",
        message: `"${line.description}" is on internal task ${task.code} and will not be billed.`,
        taskId: task.id,
        lineId: line.id,
      });
    }
  }

  for (const task of priced.tasks) {
    for (const c of task.charges) {
      if (task.billed && c.unitPriceCents < c.unitCostCents) {
        issues.push({
          severity: "error",
          code: "below_cost",
          message: `"${c.description}" is priced below what it costs.`,
          taskId: task.taskId,
          lineId: c.lineId,
        });
      }
    }
    if (kind === "invoice" && task.billed && task.status !== "completed") {
      issues.push({
        severity: "error",
        code: "unfinished_task_on_invoice",
        message: `${task.code} "${task.title}" is still ${task.status.replace("_", " ")}. Complete, defer or decline it before final invoicing.`,
        taskId: task.taskId,
      });
    }
    if (
      task.billing === "time_and_materials" &&
      task.billed &&
      task.actualHours === 0 &&
      task.charges.length === 0 &&
      kind === "invoice"
    ) {
      issues.push({
        severity: "warning",
        code: "empty_task",
        message: `${task.code} "${task.title}" has no hours or charges.`,
        taskId: task.taskId,
      });
    }
  }

  for (const blank of findUnfilledPlaceholders(documentText)) {
    issues.push({
      severity: "error",
      code: "unfilled_placeholder",
      message: `The document still contains the blank ${blank}.`,
    });
  }

  return issues;
}
