import Link from "next/link";
import { notFound } from "next/navigation";
import { PrintButton } from "@/components/print-button";
import { COMPANY } from "@/lib/company";
import { loadWorkOrder } from "@/lib/data";
import { money, shortDate } from "@/lib/format";
import type { PricedWorkOrder } from "@/lib/pricing";

export default async function QuotePage({ params }: { params: Promise<{ id: string; version: string }> }) {
  const { id, version } = await params;
  const loaded = await loadWorkOrder(Number(id));
  const quote = loaded?.quotes.find((q) => q.version === Number(version));
  if (!loaded || !quote) notFound();

  const snap = quote.snapshot as PricedWorkOrder;
  const t = snap.totals;
  const { workOrder: wo, aircraft: ac, customer } = loaded;
  const lines = snap.tasks.filter((x) => x.billed);
  const quoteNumber = `Q-${wo.number}-v${quote.version}`;

  return (
    <div className="mx-auto max-w-4xl">
      <div className="no-print mb-4 flex items-center justify-between">
        <Link href={`/work-orders/${wo.id}`} className="text-sm text-gray-500 hover:text-gray-900">
          ← Back to work order
        </Link>
        <PrintButton />
      </div>

      <article className="card p-8 text-sm print:border-0 print:p-0">
        <header className="flex flex-wrap justify-between gap-6 border-b border-gray-200 pb-6">
          <div>
            <div className="text-2xl font-bold">
              305 <span className="text-brand">SKY</span>
            </div>
            <div className="mt-2 text-gray-600">
              {COMPANY.name}
              <br />
              {COMPANY.address}, {COMPANY.cityStateZip}
            </div>
          </div>
          <div className="text-right">
            <div className="text-xl font-semibold">ESTIMATE</div>
            <div className="text-gray-600">{quoteNumber}</div>
            <div className="text-gray-600">Date: {shortDate(quote.createdAt)}</div>
          </div>
        </header>

        <section className="grid gap-6 border-b border-gray-200 py-6 sm:grid-cols-2">
          <div>
            <div className="text-xs font-semibold text-gray-500 uppercase">Customer</div>
            <div className="mt-1 font-medium">{customer?.name ?? "—"}</div>
            {customer?.contactName ? <div>Attn: {customer.contactName}</div> : null}
            {customer?.email ? <div>{customer.email}</div> : null}
            {customer?.phone ? <div>{customer.phone}</div> : null}
            {wo.customerReference ? <div>Customer W/O: {wo.customerReference}</div> : null}
          </div>
          <div className="sm:text-right">
            <div className="text-xs font-semibold text-gray-500 uppercase">Aircraft</div>
            <div className="mt-1 font-medium">{ac?.tailNumber}</div>
            <div>{[ac?.year, ac?.make, ac?.model].filter(Boolean).join(" ")}</div>
            {ac?.serialNumber ? <div>Serial #: {ac.serialNumber}</div> : null}
          </div>
        </section>

        <table className="mt-6 w-full">
          <thead className="border-b border-gray-300 text-left text-xs text-gray-500">
            <tr>
              <th className="py-2 pr-2 font-medium">#</th>
              <th className="py-2 font-medium">Work</th>
              <th className="py-2 text-right font-medium">Labor</th>
              <th className="py-2 text-right font-medium">Parts &amp; other</th>
              <th className="py-2 text-right font-medium">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {lines.map((l) => (
              <tr key={l.taskId} className="align-top">
                <td className="py-2 pr-2 text-xs text-gray-400">{l.code}</td>
                <td className="py-2 pr-4">
                  <div className="font-medium">{l.title}</div>
                  {l.charges.length ? (
                    <ul className="mt-1 text-xs text-gray-500">
                      {l.charges.map((c) => (
                        <li key={c.lineId}>
                          {c.description} (Qty {c.quantity})
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </td>
                <td className="py-2 text-right tabular-nums">
                  {l.laborCents ? money(l.laborCents) : "—"}
                  <div className="text-xs text-gray-500">
                    {l.billing === "flat_rate" ? "Flat rate" : l.laborCents ? `${Math.round((l.laborCents / l.laborRateCents) * 100) / 100} hrs` : ""}
                  </div>
                </td>
                <td className="py-2 text-right tabular-nums">{l.chargesCents ? money(l.chargesCents) : "—"}</td>
                <td className="py-2 text-right font-medium tabular-nums">
                  {l.totalCents ? money(l.totalCents) : <span className="text-xs font-normal text-gray-500">To be quoted</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-6 ml-auto max-w-xs space-y-1">
          <TotalRow label="Labor" cents={t.laborCents} />
          <TotalRow label="Parts" cents={t.partsCents} />
          <TotalRow label="Outside services" cents={t.outsideServicesCents} />
          <TotalRow label="Shipping" cents={t.shippingCents} />
          <TotalRow label="Fuel" cents={t.fuelCents} />
          <TotalRow label="Misc & fees" cents={t.miscCents} />
          <TotalRow label="Consumables (4%)" cents={t.consumablesCents} />
          <div className="flex justify-between border-t border-gray-300 pt-2 text-base font-semibold">
            <span>Estimated total</span>
            <span className="tabular-nums">{money(t.totalCents)}</span>
          </div>
          {quote.depositCents ? (
            <div className="flex justify-between font-semibold text-brand-dark">
              <span>Deposit to begin work</span>
              <span className="tabular-nums">{money(quote.depositCents)}</span>
            </div>
          ) : null}
        </div>

        <p className="mt-8 text-xs text-gray-500">
          This is an estimate based on the work known today. Additional discrepancies found during inspection will be
          quoted separately for approval.
        </p>
        <div className="no-print mt-4 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
          Terms &amp; conditions will print here once the quote version of the terms is approved (see terms/quote-terms-DRAFT.md).
        </div>
      </article>
    </div>
  );
}

function TotalRow({ label, cents }: { label: string; cents: number }) {
  if (!cents) return null;
  return (
    <div className="flex justify-between text-gray-700">
      <span>{label}</span>
      <span className="tabular-nums">{money(cents)}</span>
    </div>
  );
}
