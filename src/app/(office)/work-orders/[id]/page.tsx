import Link from "next/link";
import { notFound } from "next/navigation";
import { addPayment, addTask, createQuote, setWorkOrderStatus, toggleAog } from "@/app/actions";
import { AutoRefresh } from "@/components/auto-refresh";
import { AutoSubmitSelect } from "@/components/auto-submit";
import { AogPill, StatusPill } from "@/components/ui";
import { workOrderView } from "@/lib/data";
import { STATUS_LABEL, money, moneyDelta, shortDate } from "@/lib/format";
import type { Issue } from "@/lib/pricing";
import { TaskCard } from "./task-card";

export default async function WorkOrderPage({ params }: { params: Promise<{ id: string }> }) {
  const view = await workOrderView(Number((await params).id));
  if (!view) notFound();
  const { workOrder: wo, aircraft: ac, customer, priced, projected, quoteDiff, latestQuote } = view;
  const t = priced.totals;

  const issuesByTask = new Map<string, Issue[]>();
  for (const i of view.quoteChecks) {
    if (i.taskId) issuesByTask.set(i.taskId, [...(issuesByTask.get(i.taskId) ?? []), i]);
  }
  const pricedById = new Map(priced.tasks.map((p) => [p.taskId, p]));
  const activeTasks = view.tasks.filter((x) => x.status !== "deferred" && x.status !== "declined");
  const setAsideTasks = view.tasks.filter((x) => x.status === "deferred" || x.status === "declined");
  const drifted = quoteDiff && quoteDiff.changes.length > 0;
  const quoteBlocked = view.quoteChecks.some((i) => i.severity === "error");

  const card = (task: (typeof view.tasks)[number]) => (
    <TaskCard
      key={task.id}
      task={task}
      priced={pricedById.get(String(task.id))!}
      entries={view.entries.filter((e) => e.entry.taskId === task.id)}
      charges={view.charges.filter((c) => c.taskId === task.id)}
      issues={issuesByTask.get(String(task.id)) ?? []}
    />
  );

  return (
    <>
      <AutoRefresh seconds={15} />
      <Link href="/work-orders" className="text-sm text-gray-500 hover:text-gray-900">
        ← Work orders
      </Link>

      {/* Header */}
      <div className="mt-2 mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">{ac?.tailNumber ?? "Shop"}</h1>
            {wo.aog ? <AogPill /> : null}
            <StatusPill status={wo.status} />
          </div>
          <div className="mt-1 text-gray-600">
            {ac ? [ac.year, ac.make, ac.model].filter(Boolean).join(" ") : "Internal work order"}
            {ac?.serialNumber ? ` · S/N ${ac.serialNumber}` : ""}
          </div>
          <div className="mt-1 text-sm text-gray-500">
            {wo.title} · {wo.number}
            {customer ? ` · ${customer.name}` : ""}
            {wo.customerReference ? ` · Customer W/O ${wo.customerReference}` : ""}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <form action={toggleAog.bind(null, wo.id, !wo.aog)}>
            <button className="btn-secondary">{wo.aog ? "Clear AOG" : "Mark AOG"}</button>
          </form>
          <form action={async (fd: FormData) => {
            "use server";
            await setWorkOrderStatus(wo.id, fd.get("status") as typeof wo.status);
          }}>
            <AutoSubmitSelect name="status" defaultValue={wo.status} className="input w-48">
              {(["pending", "active", "awaiting_payment", "closed"] as const).map((s) => (
                <option key={s} value={s}>{STATUS_LABEL[s]}</option>
              ))}
            </AutoSubmitSelect>
          </form>
        </div>
      </div>

      {drifted ? (
        <div className="mb-6 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="font-semibold">
                {quoteDiff.differenceCents > 0 ? "Heading over" : "Changed from"} Quote v{latestQuote!.version}
              </span>{" "}
              ({shortDate(latestQuote!.createdAt)}): quoted{" "}
              {money(quoteDiff.quotedTotalCents)}, now projected {money(quoteDiff.currentTotalCents)}{" "}
              <span className="font-semibold">({moneyDelta(quoteDiff.differenceCents)})</span>
            </div>
            <a href="#quotes" className="font-medium underline">Make Quote v{latestQuote!.version + 1}</a>
          </div>
          {quoteDiff.changes.length ? (
            <ul className="mt-2 space-y-0.5 text-amber-800">
              {quoteDiff.changes.slice(0, 6).map((c) => (
                <li key={c.taskId}>
                  {c.code} {c.title} —{" "}
                  {c.change === "added"
                    ? c.currentCents
                      ? `new, ${money(c.currentCents)}`
                      : "new, not priced yet"
                    : c.change === "removed"
                      ? `removed / deferred (was ${money(c.quotedCents)})`
                      : `${money(c.quotedCents)} → ${money(c.currentCents)}`}
                </li>
              ))}
              {quoteDiff.changes.length > 6 ? <li>…and {quoteDiff.changes.length - 6} more</li> : null}
            </ul>
          ) : null}
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Tasks */}
        <div className="space-y-3 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Tasks &amp; discrepancies ({activeTasks.length})</h2>
          </div>
          {activeTasks.map(card)}

          <details className="card">
            <summary className="cursor-pointer px-4 py-3 text-sm font-medium">+ Add task or discrepancy</summary>
            <form action={addTask.bind(null, wo.id)} className="grid gap-2 border-t border-gray-100 p-4 sm:grid-cols-4">
              <input name="title" placeholder="e.g. COMPLY WITH TASK CODE 050013 – 400 Hour Check" required className="input sm:col-span-4" />
              <textarea name="description" placeholder="Details (optional)" rows={2} className="input sm:col-span-4" />
              <select name="category" className="input" defaultValue="discrepancy">
                <option value="discrepancy">Discrepancy</option>
                <option value="inspection">Inspection</option>
                <option value="general">General</option>
              </select>
              <select name="billing" className="input" defaultValue="time_and_materials">
                <option value="time_and_materials">Time &amp; materials</option>
                <option value="flat_rate">Flat rate</option>
                <option value="internal">Internal (not billed)</option>
              </select>
              <input name="flatRate" placeholder="Flat rate $ (if flat)" inputMode="decimal" className="input" />
              <input name="estimatedHours" placeholder="Estimated hours" inputMode="decimal" className="input" />
              <button className="btn-primary sm:col-span-4">Add</button>
            </form>
          </details>

          {setAsideTasks.length ? (
            <div className="pt-4">
              <h2 className="mb-2 text-sm font-semibold text-gray-500">Deferred &amp; declined ({setAsideTasks.length}) — not billed</h2>
              <div className="space-y-3">{setAsideTasks.map(card)}</div>
            </div>
          ) : null}
        </div>

        {/* Summary */}
        <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
          {wo.internal ? (
            <div className="card p-4 text-sm text-gray-600">
              Internal work order for shop time (odd jobs, meetings, admin). Hours here are tracked but never billed.
            </div>
          ) : (
            <>
              <div className="card p-4">
                <h3 className="font-semibold">Billed to date</h3>
                <p className="mb-3 text-xs text-gray-500">Hours actually logged, parts and charges entered so far.</p>
                <dl className="space-y-1.5 text-sm">
                  <Row label="Labor" value={t.laborCents} />
                  <Row label="Parts" value={t.partsCents} />
                  <Row label="Outside labor" value={t.outsideServicesCents} />
                  <Row label="Shipping" value={t.shippingCents} />
                  <Row label="Fuel" value={t.fuelCents} />
                  <Row label="Misc & fees" value={t.miscCents} />
                  <div className="border-t border-gray-100 pt-1.5">
                    <Row label="Subtotal" value={t.subtotalCents} />
                  </div>
                  <Row label={`Consumables 4%${t.consumablesCapped ? " (capped)" : ""}`} value={t.consumablesCents} />
                  <div className="flex justify-between border-t border-gray-200 pt-2 text-base font-semibold">
                    <dt>Total</dt>
                    <dd className="tabular-nums">{money(t.totalCents)}</dd>
                  </div>
                  {t.paymentsCents ? (
                    <>
                      <Row label="Payments received" value={-t.paymentsCents} />
                      <div className="flex justify-between font-semibold text-red-700">
                        <dt>Balance due</dt>
                        <dd className="tabular-nums">{money(t.balanceCents)}</dd>
                      </div>
                    </>
                  ) : null}
                </dl>
                {projected.totals.totalCents !== t.totalCents ? (
                  <div className="mt-3 flex justify-between rounded-lg bg-gray-50 px-3 py-2 text-sm">
                    <span className="text-gray-600">Projected at completion</span>
                    <span className="font-medium tabular-nums">{money(projected.totals.totalCents)}</span>
                  </div>
                ) : null}
                <p className="mt-3 text-xs text-gray-500">
                  {t.billedHours} hours logged · updates live as technicians clock time
                </p>
              </div>

              <ReadyCard title="Ready to quote?" issues={view.quoteChecks} />
              <ReadyCard title="Ready to invoice?" issues={view.invoiceChecks} />
              <Link href={`/work-orders/${wo.id}/invoice`} className="btn-secondary w-full">
                Preview invoice
              </Link>

              <div id="quotes" className="card p-4">
                <h3 className="mb-3 font-semibold">Quotes</h3>
                {view.quotes.length ? (
                  <ul className="mb-3 divide-y divide-gray-100 text-sm">
                    {view.quotes.map((q) => (
                      <li key={q.id} className="flex justify-between py-1.5">
                        <Link href={`/work-orders/${wo.id}/quotes/${q.version}`} className="underline">
                          Quote v{q.version}
                        </Link>
                        <span className="text-gray-500">
                          {shortDate(q.createdAt)} · <span className="tabular-nums">{money(q.totalCents)}</span>
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mb-3 text-sm text-gray-500">No quote yet.</p>
                )}
                <form action={createQuote.bind(null, wo.id)} className="flex gap-2">
                  <input name="deposit" placeholder="Deposit requested $" inputMode="decimal" className="input" />
                  <button className="btn-primary whitespace-nowrap" disabled={quoteBlocked}>
                    Make quote v{(latestQuote?.version ?? 0) + 1}
                  </button>
                </form>
                {quoteBlocked ? (
                  <p className="mt-2 text-xs text-red-700">Fix the items under &ldquo;Ready to quote?&rdquo; first.</p>
                ) : null}
                <p className="mt-2 text-xs text-gray-500">Freezes today&apos;s estimate (estimated hours, parts and charges) so later changes are tracked against it.</p>
              </div>

              <div className="card p-4">
                <h3 className="mb-3 font-semibold">Payments</h3>
                {view.payments.length ? (
                  <ul className="mb-3 divide-y divide-gray-100 text-sm">
                    {view.payments.map((p) => (
                      <li key={p.id} className="flex justify-between py-1.5">
                        <span>{shortDate(p.date)} · {p.type} · {p.method}</span>
                        <span className="tabular-nums">{money(p.amountCents)}</span>
                      </li>
                    ))}
                  </ul>
                ) : null}
                <form action={addPayment.bind(null, wo.id)} className="grid grid-cols-2 gap-2">
                  <input name="amount" placeholder="Amount $" inputMode="decimal" required className="input" />
                  <input name="date" type="date" className="input" />
                  <select name="type" className="input" defaultValue="deposit">
                    <option value="deposit">Deposit</option>
                    <option value="progress">Progress</option>
                    <option value="final">Final</option>
                    <option value="other">Other</option>
                  </select>
                  <input name="method" placeholder="Wire / ACH / Card" className="input" />
                  <button className="btn-secondary col-span-2">Record payment</button>
                </form>
              </div>
            </>
          )}
        </aside>
      </div>
    </>
  );
}

function Row({ label, value }: { label: string; value: number }) {
  if (!value) return null;
  return (
    <div className="flex justify-between text-gray-700">
      <dt>{label}</dt>
      <dd className="tabular-nums">{money(value)}</dd>
    </div>
  );
}

function ReadyCard({ title, issues }: { title: string; issues: Issue[] }) {
  const errors = issues.filter((i) => i.severity === "error");
  const warnings = issues.filter((i) => i.severity === "warning");
  const ok = errors.length === 0;
  return (
    <details className={`card ${ok ? "" : "border-red-200"}`}>
      <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 text-sm">
        <span className="font-semibold">{title}</span>
        {ok && warnings.length === 0 ? (
          <span className="text-green-700">✓ All checks pass</span>
        ) : (
          <span className={ok ? "text-amber-700" : "text-red-700"}>
            {errors.length ? `${errors.length} to fix` : ""}
            {errors.length && warnings.length ? " · " : ""}
            {warnings.length ? `${warnings.length} to review` : ""}
          </span>
        )}
      </summary>
      {issues.length ? (
        <ul className="space-y-1.5 border-t border-gray-100 px-4 py-3 text-sm">
          {[...errors, ...warnings].map((i, n) => (
            <li key={n} className={i.severity === "error" ? "text-red-700" : "text-amber-700"}>
              {i.message}
            </li>
          ))}
        </ul>
      ) : null}
    </details>
  );
}
