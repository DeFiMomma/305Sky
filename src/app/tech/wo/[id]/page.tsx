import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { addDiscrepancy, startTask } from "@/app/actions";
import { db, schema } from "@/db";
import { runningEntry, taskCode, tasksForTechs } from "@/lib/data";
import { STATUS_LABEL } from "@/lib/format";
import { currentTech } from "../../current-tech";

export default async function TechWorkOrder({ params }: { params: Promise<{ id: string }> }) {
  const tech = await currentTech();
  if (!tech) redirect("/tech");
  const id = Number((await params).id);
  const [row] = await db
    .select({ wo: schema.workOrders, ac: schema.aircraft })
    .from(schema.workOrders)
    .leftJoin(schema.aircraft, eq(schema.aircraft.id, schema.workOrders.aircraftId))
    .where(eq(schema.workOrders.id, id));
  if (!row) notFound();
  const [taskList, running] = await Promise.all([tasksForTechs(id), runningEntry(tech.id)]);

  return (
    <div className="space-y-4">
      <Link href="/tech" className="text-sm text-gray-500">← Back</Link>
      <div>
        <h1 className="text-2xl font-bold">{row.wo.internal ? "Shop time" : row.ac?.tailNumber}</h1>
        <div className="text-gray-600">{row.wo.internal ? "Odd jobs, meetings, admin — not billed" : row.wo.title}</div>
      </div>

      <div className="card divide-y divide-gray-100">
        {taskList.length === 0 ? <div className="p-4 text-sm text-gray-500">No open tasks.</div> : null}
        {taskList.map((t) => {
          const isRunning = running?.task.id === t.id;
          return (
            <div key={t.id} className="flex items-center gap-3 px-4 py-3">
              <div className="min-w-0 flex-1">
                <div className="font-medium">{t.title}</div>
                <div className="text-xs text-gray-500">{taskCode(t.seq)} · {STATUS_LABEL[t.status]}</div>
              </div>
              {isRunning ? (
                <span className="text-sm font-medium text-green-700">Running</span>
              ) : (
                <form action={startTask.bind(null, t.id)}>
                  <button className="btn bg-green-600 px-5 py-3 text-white">Start</button>
                </form>
              )}
            </div>
          );
        })}
      </div>

      {!row.wo.internal ? (
        <div id="found" className="card p-4">
          <h2 className="mb-2 font-semibold">Found a discrepancy?</h2>
          <form action={addDiscrepancy.bind(null, id)} className="space-y-2">
            <input name="title" required placeholder="What did you find?" className="input py-3 text-base" />
            <textarea name="description" rows={3} placeholder="Location, details…" className="input text-base" />
            <button className="btn-primary w-full py-3 text-base">Add to work order</button>
          </form>
          <p className="mt-2 text-xs text-gray-500">The office sees it right away and can add it to the next quote.</p>
        </div>
      ) : null}
    </div>
  );
}
