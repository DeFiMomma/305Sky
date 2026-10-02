import Link from "next/link";
import { updatePart } from "@/app/actions";
import { AutoRefresh } from "@/components/auto-refresh";
import { Empty, PageHeader, StatusPill } from "@/components/ui";
import { partsQueue, taskCode } from "@/lib/data";
import { STATUS_LABEL, money, shortDate } from "@/lib/format";

const GROUPS = [
  { title: "Needs sourcing", statuses: ["requested", "sourcing"] },
  { title: "Quoted & on order", statuses: ["quoted", "ordered"] },
  { title: "Received — ready to install", statuses: ["received"] },
] as const;

function rfqMailto(p: Awaited<ReturnType<typeof partsQueue>>[number]) {
  const tail = p.ac?.tailNumber ?? "";
  const subject = `RFQ ${p.charge.partNumber ?? p.charge.description} – ${tail}`;
  const body = [
    "Hello,",
    "",
    "Please quote price, condition, certification (8130-3) and lead time for:",
    "",
    `Part #: ${p.charge.partNumber ?? "(see description)"}`,
    `Description: ${p.charge.description}`,
    `Qty: ${p.charge.quantity}`,
    `Aircraft: ${tail} ${[p.ac?.make, p.ac?.model].filter(Boolean).join(" ")}`,
    p.charge.priority === "aog" ? "Priority: AOG" : "",
    "",
    "Thank you,",
    "305 SKY LLC",
  ]
    .filter((l) => l !== null)
    .join("\n");
  return `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export default async function PartsPage() {
  const rows = await partsQueue();
  return (
    <>
      <AutoRefresh seconds={20} />
      <PageHeader title="Parts" subtitle="Requests from technicians, sourcing and receiving." />
      <div className="space-y-8">
        {GROUPS.map((g) => {
          const items = rows.filter((r) => (g.statuses as readonly string[]).includes(r.charge.status));
          return (
            <section key={g.title}>
              <h2 className="mb-2 font-semibold">
                {g.title} <span className="text-gray-400">({items.length})</span>
              </h2>
              <div className="card divide-y divide-gray-100">
                {items.length === 0 ? (
                  <Empty>Nothing here.</Empty>
                ) : (
                  items.map((p) => (
                    <div key={p.charge.id} className="flex flex-wrap items-center gap-4 px-4 py-3">
                      <div className="min-w-56 flex-1">
                        <div className="flex items-center gap-2 font-medium">
                          {p.charge.priority === "aog" ? <span className="pill bg-red-600 text-white">AOG</span> : null}
                          {p.charge.description}
                          <span className="font-normal text-gray-500">× {p.charge.quantity}</span>
                        </div>
                        <div className="text-xs text-gray-500">
                          {p.charge.partNumber ? `P/N ${p.charge.partNumber} · ` : ""}
                          <Link href={`/work-orders/${p.wo.id}`} className="underline">
                            {p.ac?.tailNumber ?? p.wo.number}
                          </Link>{" "}
                          · {taskCode(p.task.seq)} {p.task.title}
                          {p.requestedBy ? ` · requested by ${p.requestedBy} ${shortDate(p.charge.createdAt)}` : ""}
                        </div>
                      </div>
                      <StatusPill status={p.charge.status} />
                      <form action={updatePart.bind(null, p.charge.id)} className="flex flex-wrap items-center gap-2">
                        <input name="vendor" defaultValue={p.charge.vendor ?? ""} placeholder="Vendor" className="input w-32" />
                        <input
                          name="unitCost"
                          defaultValue={p.charge.unitCostCents !== null ? p.charge.unitCostCents / 100 : ""}
                          placeholder="Our cost $"
                          inputMode="decimal"
                          className="input w-28"
                        />
                        <select name="status" defaultValue={p.charge.status} className="input w-32">
                          {(["requested", "sourcing", "quoted", "ordered", "received", "installed", "cancelled"] as const).map((s) => (
                            <option key={s} value={s}>{STATUS_LABEL[s]}</option>
                          ))}
                        </select>
                        <button className="btn-secondary">Save</button>
                        <a href={rfqMailto(p)} className="btn-ghost text-xs">Email RFQ</a>
                      </form>
                      {p.charge.unitCostCents !== null ? (
                        <div className="w-full text-xs text-gray-500 sm:w-auto">Cost {money(p.charge.unitCostCents)}</div>
                      ) : null}
                    </div>
                  ))
                )}
              </div>
            </section>
          );
        })}
      </div>
    </>
  );
}
