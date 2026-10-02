import { addCharge, deleteCharge, setTaskStatus, updateTask } from "@/app/actions";
import { AutoSubmitSelect, ConfirmButton } from "@/components/auto-submit";
import { StatusPill } from "@/components/ui";
import type { LoadedWorkOrder } from "@/lib/data";
import { entryHours, taskCode } from "@/lib/data";
import { KIND_LABEL, STATUS_LABEL, hours, money, shortDate } from "@/lib/format";
import type { Issue, PricedTask } from "@/lib/pricing";

type Task = LoadedWorkOrder["tasks"][number];

export function TaskCard({
  task,
  priced,
  entries,
  charges,
  issues,
}: {
  task: Task;
  priced: PricedTask;
  entries: LoadedWorkOrder["entries"];
  charges: LoadedWorkOrder["charges"];
  issues: Issue[];
}) {
  const running = entries.some((e) => e.entry.endedAt === null);
  const pricedById = new Map(priced.charges.map((c) => [c.lineId, c]));
  const overHours = priced.hoursVariance !== undefined && priced.hoursVariance > 0;

  return (
    <details className="card group" open={issues.some((i) => i.severity === "error") || undefined}>
      <summary className="flex cursor-pointer list-none items-center gap-3 px-4 py-3 select-none">
        <span className="w-10 shrink-0 text-xs text-gray-400 tabular-nums">{taskCode(task.seq)}</span>
        <div className="min-w-0 flex-1">
          <div className={`truncate font-medium ${priced.billed ? "" : "text-gray-400"}`}>{task.title}</div>
          <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
            <StatusPill status={task.status} />
            {task.billing === "flat_rate" ? <span>Flat rate {money(task.flatRateCents ?? 0)}</span> : null}
            {task.billing === "internal" ? <span>Internal · not billed</span> : null}
            {task.foundDuringWork ? <span className="text-amber-700">Found during work</span> : null}
            {running ? <span className="font-medium text-green-700">● Clock running</span> : null}
            {issues.length ? <span className="text-red-600">{issues.length} to fix</span> : null}
          </div>
        </div>
        <div className="text-right text-xs text-gray-500 tabular-nums">
          <div className={overHours ? "font-medium text-amber-700" : ""}>
            {hours(priced.actualHours)}
            {priced.estimatedHours !== undefined ? ` / ${hours(priced.estimatedHours)} est` : ""}
          </div>
        </div>
        <div className="w-28 text-right font-semibold tabular-nums">{priced.billed ? money(priced.totalCents) : "—"}</div>
        <span className="text-gray-400 transition-transform group-open:rotate-90">›</span>
      </summary>

      <div className="space-y-5 border-t border-gray-100 px-4 py-4 text-sm">
        {issues.length ? (
          <ul className="space-y-1 rounded-lg bg-red-50 px-3 py-2 text-red-800">
            {issues.map((i, n) => (
              <li key={n}>{i.message}</li>
            ))}
          </ul>
        ) : null}

        {task.description ? <p className="text-gray-700">{task.description}</p> : null}

        {/* Labor */}
        <div>
          <h4 className="mb-2 text-xs font-semibold tracking-wide text-gray-500 uppercase">Labor</h4>
          {entries.length === 0 ? (
            <p className="text-gray-500">No time logged yet.</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {entries.map(({ entry, userName }) => (
                <li key={entry.id} className="flex justify-between py-1.5">
                  <span>
                    {userName} <span className="text-gray-400">· {shortDate(entry.startedAt)}</span>
                    {entry.endedAt === null ? <span className="ml-2 text-green-700">running</span> : null}
                  </span>
                  <span className="tabular-nums">{hours(entryHours(entry))}</span>
                </li>
              ))}
            </ul>
          )}
          <p className="mt-2 text-xs text-gray-500">
            {task.billing === "flat_rate"
              ? `Billed at the flat rate. ${priced.effectiveHourlyRateCents ? `Earning ${money(priced.effectiveHourlyRateCents)}/hr so far.` : ""}`
              : task.billing === "internal"
                ? "Internal time is never billed."
                : `${hours(priced.actualHours)} × ${money(priced.laborRateCents)}/hr = ${money(priced.laborCents)}`}
          </p>
        </div>

        {/* Charges */}
        <div>
          <h4 className="mb-2 text-xs font-semibold tracking-wide text-gray-500 uppercase">Parts &amp; charges</h4>
          {charges.length ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-xs text-gray-500">
                  <tr>
                    <th className="py-1 font-medium">Item</th>
                    <th className="py-1 text-right font-medium">Qty</th>
                    <th className="py-1 text-right font-medium">Cost</th>
                    <th className="py-1 text-right font-medium">Markup</th>
                    <th className="py-1 text-right font-medium">Price</th>
                    <th className="py-1 text-right font-medium">Total</th>
                    <th />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {charges.map((c) => {
                    const p = pricedById.get(String(c.id));
                    return (
                      <tr key={c.id} className={c.status === "cancelled" ? "text-gray-400 line-through" : ""}>
                        <td className="py-1.5 pr-3">
                          <div>{c.description}</div>
                          <div className="text-xs text-gray-500">
                            {KIND_LABEL[c.kind]}
                            {c.partNumber ? ` · P/N ${c.partNumber}` : ""}
                            {c.kind === "part" ? ` · ${STATUS_LABEL[c.status]}` : ""}
                            {c.overrideReason ? ` · Override: ${c.overrideReason}` : ""}
                          </div>
                        </td>
                        <td className="py-1.5 text-right tabular-nums">{c.quantity}</td>
                        <td className="py-1.5 text-right tabular-nums">
                          {c.unitCostCents === null ? <span className="text-amber-700">pending</span> : money(c.unitCostCents)}
                        </td>
                        <td className="py-1.5 text-right tabular-nums">{p ? `${Math.round(p.markupPercent * 10) / 10}%` : "—"}</td>
                        <td className="py-1.5 text-right tabular-nums">{p ? money(p.unitPriceCents) : "—"}</td>
                        <td className="py-1.5 text-right font-medium tabular-nums">{p ? money(p.extendedPriceCents) : "—"}</td>
                        <td className="py-1.5 pl-2 text-right">
                          <form action={deleteCharge.bind(null, c.id)}>
                            <ConfirmButton message={`Remove "${c.description}"?`} className="text-xs text-gray-400 hover:text-red-600">
                              ✕
                            </ConfirmButton>
                          </form>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500">None yet.</p>
          )}

          <details className="mt-3">
            <summary className="cursor-pointer text-sm font-medium text-gray-700">+ Add part or charge</summary>
            <form action={addCharge.bind(null, task.id)} className="mt-3 grid grid-cols-2 gap-2 rounded-lg bg-gray-50 p-3 sm:grid-cols-6">
              <select name="kind" className="input sm:col-span-2" defaultValue="part">
                <option value="part">Part</option>
                <option value="shipping">Shipping</option>
                <option value="fuel">Fuel</option>
                <option value="outside_service">Outside labor</option>
                <option value="misc">Misc / fee</option>
              </select>
              <input name="description" placeholder="Description" required className="input col-span-2 sm:col-span-4" />
              <input name="partNumber" placeholder="Part #" className="input sm:col-span-2" />
              <input name="quantity" placeholder="Qty" defaultValue="1" inputMode="decimal" className="input" />
              <input name="unitCost" placeholder="Our cost / unit" inputMode="decimal" className="input sm:col-span-2" />
              <select name="status" className="input" defaultValue="installed">
                <option value="installed">Installed</option>
                <option value="ordered">Ordered</option>
                <option value="sourcing">Sourcing</option>
              </select>
              <select name="overrideType" className="input sm:col-span-2" defaultValue="">
                <option value="">Standard markup</option>
                <option value="markup_percent">Custom markup %</option>
                <option value="unit_price">Fixed price / unit</option>
              </select>
              <input name="overrideValue" placeholder="% or $" inputMode="decimal" className="input" />
              <input name="overrideReason" placeholder="Reason (required for custom)" className="input col-span-2 sm:col-span-3" />
              <button className="btn-primary col-span-2 sm:col-span-6">Add</button>
              <p className="col-span-2 text-xs text-gray-500 sm:col-span-6">
                Markup is applied automatically: parts by unit cost (100% / 25% / 20%), shipping &amp; fuel 20%, outside labor none unless you set one.
              </p>
            </form>
          </details>
        </div>

        {/* Task settings */}
        <div className="flex flex-wrap items-end gap-3 border-t border-gray-100 pt-4">
          <form action={async (fd: FormData) => {
            "use server";
            await setTaskStatus(task.id, fd.get("status") as Task["status"]);
          }}>
            <label className="label">Status</label>
            <AutoSubmitSelect name="status" defaultValue={task.status} className="input w-40">
              {(["open", "in_progress", "completed", "deferred", "declined"] as const).map((s) => (
                <option key={s} value={s}>{STATUS_LABEL[s]}</option>
              ))}
            </AutoSubmitSelect>
          </form>
          <details className="flex-1">
            <summary className="cursor-pointer text-sm text-gray-600">Edit task &amp; billing</summary>
            <form action={updateTask.bind(null, task.id)} className="mt-3 grid gap-2 sm:grid-cols-4">
              <input name="title" defaultValue={task.title} className="input sm:col-span-4" />
              <textarea name="description" defaultValue={task.description ?? ""} placeholder="Description" rows={2} className="input sm:col-span-4" />
              <select name="billing" defaultValue={task.billing} className="input">
                <option value="time_and_materials">Time &amp; materials</option>
                <option value="flat_rate">Flat rate</option>
                <option value="internal">Internal (not billed)</option>
              </select>
              <input name="flatRate" placeholder="Flat rate $" defaultValue={task.flatRateCents ? task.flatRateCents / 100 : ""} inputMode="decimal" className="input" />
              <input name="estimatedHours" placeholder="Estimated hours" defaultValue={task.estimatedHours ?? ""} inputMode="decimal" className="input" />
              <input type="hidden" name="status" value={task.status} />
              <button className="btn-secondary">Save</button>
            </form>
          </details>
        </div>
      </div>
    </details>
  );
}
