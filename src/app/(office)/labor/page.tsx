import Link from "next/link";
import { AutoRefresh } from "@/components/auto-refresh";
import { Empty, PageHeader } from "@/components/ui";
import { entryHours, laborSince, listUsers, taskCode } from "@/lib/data";
import { clockTime, hours, shortDate } from "@/lib/format";
import { UTILIZATION_TARGET, utilizationRows } from "@/lib/utilization";

function periodStart(period: string) {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  if (period === "week") d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); // Monday
  if (period === "month") d.setDate(1);
  return d;
}

const round2 = (n: number) => Math.round(n * 100) / 100;

export default async function LaborPage({ searchParams }: { searchParams: Promise<{ period?: string }> }) {
  const period = (await searchParams).period ?? "today";
  const since = periodStart(period);
  const now = new Date();
  const [{ entries, shifts }, techs] = await Promise.all([laborSince(since), listUsers("tech")]);

  const rows = utilizationRows(
    techs.map((u) => {
      const mine = entries.filter((e) => e.user.id === u.id);
      const onAircraft = mine.filter((e) => !e.wo.internal && e.task.billing !== "internal");
      return {
        userId: u.id,
        name: u.name,
        shiftHours: round2(
          shifts
            .filter((s) => s.user.id === u.id)
            .reduce((a, s) => a + ((s.shift.clockOut ?? now).getTime() - s.shift.clockIn.getTime()) / 3_600_000, 0),
        ),
        aircraftHours: round2(onAircraft.reduce((a, e) => a + entryHours(e.entry, now), 0)),
        internalHours: round2(mine.filter((e) => !onAircraft.includes(e)).reduce((a, e) => a + entryHours(e.entry, now), 0)),
      };
    }),
  );
  const totals = rows.reduce(
    (a, r) => ({ shift: a.shift + r.shiftHours, aircraft: a.aircraft + r.aircraftHours }),
    { shift: 0, aircraft: 0 },
  );
  const shopUtil = totals.shift ? totals.aircraft / totals.shift : null;

  return (
    <>
      <AutoRefresh seconds={30} />
      <PageHeader
        title="Labor"
        subtitle={`Since ${shortDate(since)} · target ${UTILIZATION_TARGET * 100}% of clocked time on aircraft`}
        actions={
          <div className="flex rounded-lg border border-gray-200 bg-white p-1 text-sm">
            {(["today", "week", "month"] as const).map((p) => (
              <Link key={p} href={`/labor?period=${p}`} className={`rounded-md px-3 py-1.5 capitalize ${p === period ? "bg-gray-900 text-white" : "text-gray-600 hover:bg-gray-100"}`}>
                {p === "week" ? "This week" : p === "month" ? "This month" : "Today"}
              </Link>
            ))}
          </div>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Stat label="Shop utilization" value={shopUtil === null ? "—" : `${Math.round(shopUtil * 100)}%`} good={shopUtil !== null && shopUtil >= UTILIZATION_TARGET} />
        <Stat label="Hours on aircraft" value={hours(round2(totals.aircraft))} />
        <Stat label="Hours clocked" value={hours(round2(totals.shift))} />
      </div>

      <div className="card mb-8 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-gray-200 bg-gray-50 text-left text-xs text-gray-500">
            <tr>
              <th className="px-4 py-2.5 font-medium">Technician</th>
              <th className="px-4 py-2.5 text-right font-medium">Clocked</th>
              <th className="px-4 py-2.5 text-right font-medium">On aircraft</th>
              <th className="hidden px-4 py-2.5 text-right font-medium sm:table-cell">Shop / internal</th>
              <th className="hidden px-4 py-2.5 text-right font-medium sm:table-cell">Not on a task</th>
              <th className="w-48 px-4 py-2.5 font-medium">Utilization</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rows.map((r) => (
              <tr key={r.userId}>
                <td className="px-4 py-3 font-medium">{r.name}</td>
                <td className="px-4 py-3 text-right tabular-nums">{hours(r.shiftHours)}</td>
                <td className="px-4 py-3 text-right tabular-nums">{hours(r.aircraftHours)}</td>
                <td className="hidden px-4 py-3 text-right tabular-nums sm:table-cell">{hours(r.internalHours)}</td>
                <td className="hidden px-4 py-3 text-right tabular-nums sm:table-cell">{hours(r.unassignedHours)}</td>
                <td className="px-4 py-3">
                  {r.utilization === null ? (
                    <span className="text-gray-400">Not clocked in</span>
                  ) : (
                    <div className="flex items-center gap-2">
                      <div className="relative h-2 flex-1 rounded-full bg-gray-100">
                        <div
                          className={`h-2 rounded-full ${r.meetsTarget ? "bg-green-600" : "bg-amber-500"}`}
                          style={{ width: `${Math.min(100, r.utilization * 100)}%` }}
                        />
                        <div className="absolute -top-1 h-4 w-px bg-gray-500" style={{ left: `${UTILIZATION_TARGET * 100}%` }} />
                      </div>
                      <span className={`w-10 text-right tabular-nums ${r.meetsTarget ? "text-green-700" : "text-amber-700"}`}>
                        {Math.round(r.utilization * 100)}%
                      </span>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="mb-2 font-semibold">Time entries</h2>
      <div className="card overflow-x-auto">
        {entries.length === 0 ? (
          <Empty>No time logged in this period.</Empty>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-gray-200 bg-gray-50 text-left text-xs text-gray-500">
              <tr>
                <th className="px-4 py-2.5 font-medium">When</th>
                <th className="px-4 py-2.5 font-medium">Technician</th>
                <th className="px-4 py-2.5 font-medium">Work order / task</th>
                <th className="px-4 py-2.5 text-right font-medium">Hours</th>
                <th className="px-4 py-2.5 font-medium">Billable</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {entries.map(({ entry, task, wo, user }) => {
                const billable = !wo.internal && task.billing !== "internal";
                return (
                  <tr key={entry.id}>
                    <td className="px-4 py-2.5 whitespace-nowrap text-gray-600">
                      {shortDate(entry.startedAt)} {clockTime(entry.startedAt)}
                    </td>
                    <td className="px-4 py-2.5">{user.name}</td>
                    <td className="px-4 py-2.5">
                      <Link href={`/work-orders/${wo.id}`} className="underline">{wo.number}</Link>
                      <div className="text-xs text-gray-500">{taskCode(task.seq)} · {task.title}</div>
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums">
                      {hours(entryHours(entry, now))}
                      {entry.endedAt === null ? <div className="text-xs text-green-700">running</div> : null}
                    </td>
                    <td className="px-4 py-2.5">
                      {billable ? <span className="pill bg-green-50 text-green-700">Yes</span> : <span className="pill bg-gray-100 text-gray-500">No · internal</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}

function Stat({ label, value, good }: { label: string; value: string; good?: boolean }) {
  return (
    <div className="card p-4">
      <div className="text-xs text-gray-500">{label}</div>
      <div className={`mt-1 text-2xl font-semibold tabular-nums ${good === undefined ? "" : good ? "text-green-700" : "text-amber-700"}`}>
        {value}
      </div>
    </div>
  );
}
