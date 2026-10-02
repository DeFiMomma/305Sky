import Link from "next/link";
import { listWorkOrders } from "@/lib/data";
import { money, moneyDelta } from "@/lib/format";
import { AogPill, Empty, PageHeader, StatusPill } from "@/components/ui";

const FILTERS = [
  ["active", "Active"],
  ["pending", "Pending"],
  ["awaiting_payment", "Awaiting payment"],
  ["aog", "AOG"],
  ["all", "All"],
] as const;
type Filter = (typeof FILTERS)[number][0];

export default async function WorkOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string; q?: string }>;
}) {
  const sp = await searchParams;
  const filter = (FILTERS.some(([f]) => f === sp.filter) ? sp.filter : "active") as Filter;
  const q = (sp.q ?? "").trim().toLowerCase();
  const rows = (await listWorkOrders(filter)).filter(
    (r) =>
      !q ||
      [r.wo.number, r.wo.title, r.ac?.tailNumber, r.ac?.model, r.cust?.name]
        .filter(Boolean)
        .some((s) => s!.toLowerCase().includes(q)),
  );

  return (
    <>
      <PageHeader
        title="Work orders"
        subtitle={`${rows.length} ${filter === "all" ? "total" : filter.replace("_", " ")}`}
        actions={
          <Link href="/work-orders/new" className="btn-primary">
            + New work order
          </Link>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="flex rounded-lg border border-gray-200 bg-white p-1 text-sm">
          {FILTERS.map(([f, label]) => (
            <Link
              key={f}
              href={`/work-orders?filter=${f}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
              className={`rounded-md px-3 py-1.5 ${f === filter ? "bg-gray-900 text-white" : "text-gray-600 hover:bg-gray-100"}`}
            >
              {label}
            </Link>
          ))}
        </div>
        <form className="min-w-60 flex-1">
          <input type="hidden" name="filter" value={filter} />
          <input name="q" defaultValue={sp.q} placeholder="Search tail number, customer, WO #…" className="input" />
        </form>
      </div>

      <div className="card overflow-hidden">
        {rows.length === 0 ? (
          <Empty>No work orders here.</Empty>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-gray-200 bg-gray-50 text-left text-xs text-gray-500">
              <tr>
                <th className="px-4 py-2.5 font-medium">Aircraft</th>
                <th className="px-4 py-2.5 font-medium">Work order</th>
                <th className="hidden px-4 py-2.5 font-medium md:table-cell">Customer</th>
                <th className="hidden px-4 py-2.5 font-medium sm:table-cell">Open items</th>
                <th className="px-4 py-2.5 font-medium">Status</th>
                <th className="px-4 py-2.5 text-right font-medium">Current total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.map((r) => (
                <tr key={r.wo.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <Link href={`/work-orders/${r.wo.id}`} className="block">
                      <div className="font-semibold">{r.ac?.tailNumber ?? "Shop"}</div>
                      <div className="text-xs text-gray-500">{r.ac ? [r.ac.year, r.ac.make, r.ac.model].filter(Boolean).join(" ") : "Internal"}</div>
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/work-orders/${r.wo.id}`} className="block">
                      <div className="flex items-center gap-2">
                        {r.wo.aog ? <AogPill /> : null}
                        <span className="font-medium">{r.wo.title}</span>
                      </div>
                      <div className="text-xs text-gray-500">{r.wo.number}</div>
                    </Link>
                  </td>
                  <td className="hidden px-4 py-3 text-gray-700 md:table-cell">{r.cust?.name ?? "—"}</td>
                  <td className="hidden px-4 py-3 text-gray-700 sm:table-cell">
                    {r.openTasks} of {r.taskCount}
                  </td>
                  <td className="px-4 py-3">
                    <StatusPill status={r.wo.status} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="font-medium tabular-nums">{r.wo.internal ? "—" : money(r.totalCents)}</div>
                    {r.quoteDriftCents ? (
                      <div className="text-xs text-amber-700 tabular-nums">{moneyDelta(r.quoteDriftCents)} vs quote</div>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
