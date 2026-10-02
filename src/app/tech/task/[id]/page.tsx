import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { requestPart } from "@/app/actions";
import { db, schema } from "@/db";
import { taskCode } from "@/lib/data";
import { STATUS_LABEL } from "@/lib/format";
import { currentTech } from "../../current-tech";

export default async function RequestPartPage({ params }: { params: Promise<{ id: string }> }) {
  if (!(await currentTech())) redirect("/tech");
  const id = Number((await params).id);
  const [row] = await db
    .select({ task: schema.tasks, wo: schema.workOrders, ac: schema.aircraft })
    .from(schema.tasks)
    .innerJoin(schema.workOrders, eq(schema.workOrders.id, schema.tasks.workOrderId))
    .leftJoin(schema.aircraft, eq(schema.aircraft.id, schema.workOrders.aircraftId))
    .where(eq(schema.tasks.id, id));
  if (!row) notFound();
  const existing = await db.select().from(schema.charges).where(eq(schema.charges.taskId, id));
  const parts = existing.filter((c) => c.kind === "part");

  return (
    <div className="space-y-4">
      <Link href="/tech" className="text-sm text-gray-500">← Back</Link>
      <div>
        <h1 className="text-2xl font-bold">Request a part</h1>
        <div className="text-gray-600">
          {row.ac?.tailNumber} · {taskCode(row.task.seq)} {row.task.title}
        </div>
      </div>

      <form action={requestPart.bind(null, id)} className="card space-y-3 p-4">
        <div>
          <label className="label">Part number</label>
          <input name="partNumber" placeholder="e.g. 3001436-1" className="input py-3 text-base" autoCapitalize="characters" />
        </div>
        <div>
          <label className="label">Description</label>
          <input name="description" required placeholder="e.g. Filter" className="input py-3 text-base" />
        </div>
        <div>
          <label className="label">Quantity</label>
          <input name="quantity" defaultValue="1" inputMode="decimal" className="input py-3 text-base" />
        </div>
        <label className="flex items-center gap-2 text-base">
          <input type="checkbox" name="aog" className="size-5" /> Aircraft is grounded waiting on this (AOG)
        </label>
        <button className="btn-primary w-full py-3 text-base">Send to office</button>
      </form>

      {parts.length ? (
        <div className="card p-4 text-sm">
          <div className="mb-2 font-semibold">Already on this task</div>
          <ul className="space-y-1">
            {parts.map((p) => (
              <li key={p.id} className="flex justify-between">
                <span>{p.description} × {p.quantity}</span>
                <span className="text-gray-500">{STATUS_LABEL[p.status]}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
