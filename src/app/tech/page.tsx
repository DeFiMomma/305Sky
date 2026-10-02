import Link from "next/link";
import { chooseTech, clockIn, clockOut, stopTask, switchTech } from "@/app/actions";
import { Elapsed } from "@/components/elapsed";
import { entryHours, laborSince, listUsers, openShift, runningEntry, taskCode, workOrdersForTechs } from "@/lib/data";
import { clockTime, hours } from "@/lib/format";
import { currentTech } from "./current-tech";

export default async function TechHome({ searchParams }: { searchParams: Promise<{ sent?: string }> }) {
  const tech = await currentTech();
  if (!tech) return <PickTech />;

  const sent = (await searchParams).sent;
  const [shift, running, workOrders] = await Promise.all([openShift(tech.id), runningEntry(tech.id), workOrdersForTechs()]);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const { entries, shifts } = await laborSince(today);
  const mine = entries.filter((e) => e.user.id === tech.id);
  const aircraftHrs = mine.filter((e) => !e.wo.internal && e.task.billing !== "internal").reduce((a, e) => a + entryHours(e.entry), 0);
  const clockedHrs = shifts
    .filter((s) => s.user.id === tech.id)
    .reduce((a, s) => a + ((s.shift.clockOut ?? new Date()).getTime() - s.shift.clockIn.getTime()) / 3_600_000, 0);
  const util = clockedHrs > 0 ? Math.round((aircraftHrs / clockedHrs) * 100) : null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-lg font-semibold">Hi, {tech.name.split(" ")[0]}</div>
        <form action={switchTech}>
          <button className="text-sm text-gray-500 underline">Not you?</button>
        </form>
      </div>

      {sent ? (
        <div className="rounded-xl bg-green-50 px-4 py-3 text-sm text-green-800">
          {sent === "part" ? "Part request sent to the office." : "Discrepancy added to the work order."}
        </div>
      ) : null}

      {/* Shift */}
      <div className="card flex items-center justify-between p-4">
        {shift ? (
          <>
            <div>
              <div className="text-sm text-gray-500">Clocked in since {clockTime(shift.clockIn)}</div>
              <div className="text-xl font-semibold"><Elapsed since={shift.clockIn.toISOString()} /></div>
            </div>
            <form action={clockOut}>
              <button className="btn-secondary px-5 py-3">Clock out</button>
            </form>
          </>
        ) : (
          <form action={clockIn} className="w-full">
            <button className="btn w-full bg-green-600 py-4 text-lg text-white hover:bg-green-700">Clock in</button>
          </form>
        )}
      </div>

      {/* Current job */}
      {running ? (
        <div className="card border-green-300 p-4">
          <div className="text-xs font-semibold tracking-wide text-green-700 uppercase">Working on</div>
          <div className="mt-1 text-xl font-bold">{running.wo.internal ? "Shop time" : running.wo.number.split("-").slice(2).join("-")}</div>
          <div className="text-gray-700">{taskCode(running.task.seq)} · {running.task.title}</div>
          <div className="my-3 text-4xl font-semibold text-green-700"><Elapsed since={running.entry.startedAt.toISOString()} /></div>
          <div className="grid grid-cols-2 gap-2">
            <form action={stopTask} className="col-span-2">
              <button className="btn w-full bg-gray-900 py-3 text-base text-white">Stop</button>
            </form>
            {!running.wo.internal ? (
              <>
                <Link href={`/tech/task/${running.task.id}`} className="btn-secondary py-3">Request part</Link>
                <Link href={`/tech/wo/${running.wo.id}#found`} className="btn-secondary py-3">Found a squawk</Link>
              </>
            ) : null}
          </div>
        </div>
      ) : null}

      {/* Start a job */}
      <div>
        <h2 className="mb-2 text-sm font-semibold text-gray-600">{running ? "Switch to another job" : "Start a job"}</h2>
        <div className="card divide-y divide-gray-100">
          {workOrders.map(({ wo, ac }) => (
            <Link key={wo.id} href={`/tech/wo/${wo.id}`} className="flex items-center justify-between px-4 py-4 active:bg-gray-50">
              <div>
                <div className="flex items-center gap-2 text-lg font-semibold">
                  {wo.internal ? "Shop time" : ac?.tailNumber}
                  {wo.aog ? <span className="pill bg-red-600 text-white">AOG</span> : null}
                </div>
                <div className="text-sm text-gray-500">{wo.internal ? "Odd jobs, meetings, admin" : wo.title}</div>
              </div>
              <span className="text-2xl text-gray-300">›</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Today */}
      <div className="card p-4 text-sm">
        <div className="mb-1 font-semibold">Today</div>
        <div className="flex justify-between text-gray-600">
          <span>On aircraft</span>
          <span className="tabular-nums">{hours(Math.round(aircraftHrs * 100) / 100)}</span>
        </div>
        <div className="flex justify-between text-gray-600">
          <span>Clocked</span>
          <span className="tabular-nums">{hours(Math.round(clockedHrs * 100) / 100)}</span>
        </div>
        {util !== null ? (
          <div className={`mt-1 flex justify-between font-medium ${util >= 80 ? "text-green-700" : "text-amber-700"}`}>
            <span>On aircraft (goal 80%)</span>
            <span>{util}%</span>
          </div>
        ) : null}
      </div>
    </div>
  );
}

async function PickTech() {
  const techs = await listUsers("tech");
  return (
    <div>
      <h1 className="mb-4 text-center text-xl font-semibold">Who&apos;s working?</h1>
      <div className="grid grid-cols-2 gap-3">
        {techs.map((t) => (
          <form key={t.id} action={chooseTech}>
            <input type="hidden" name="userId" value={t.id} />
            <button className="card w-full px-3 py-5 text-base font-medium active:bg-gray-50">{t.name}</button>
          </form>
        ))}
      </div>
      <p className="mt-6 text-center text-xs text-gray-400">Individual logins will replace this screen.</p>
    </div>
  );
}
