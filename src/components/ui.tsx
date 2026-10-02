import { STATUS_LABEL } from "@/lib/format";

const STATUS_STYLE: Record<string, string> = {
  open: "bg-gray-100 text-gray-700",
  in_progress: "bg-blue-50 text-blue-700",
  completed: "bg-green-50 text-green-700",
  deferred: "bg-amber-50 text-amber-700",
  declined: "bg-gray-100 text-gray-400 line-through",
  pending: "bg-gray-100 text-gray-700",
  active: "bg-blue-50 text-blue-700",
  awaiting_payment: "bg-amber-50 text-amber-700",
  closed: "bg-green-50 text-green-700",
  requested: "bg-red-50 text-red-700",
  sourcing: "bg-amber-50 text-amber-700",
  quoted: "bg-sky-50 text-sky-700",
  ordered: "bg-indigo-50 text-indigo-700",
  received: "bg-teal-50 text-teal-700",
  installed: "bg-green-50 text-green-700",
  cancelled: "bg-gray-100 text-gray-400",
};

export function StatusPill({ status }: { status: string }) {
  return <span className={`pill ${STATUS_STYLE[status] ?? "bg-gray-100"}`}>{STATUS_LABEL[status] ?? status}</span>;
}

export function AogPill() {
  return <span className="pill bg-red-600 text-white">AOG</span>;
}

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: React.ReactNode; actions?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {subtitle ? <div className="mt-1 text-sm text-gray-500">{subtitle}</div> : null}
      </div>
      {actions}
    </div>
  );
}

export function Empty({ children }: { children: React.ReactNode }) {
  return <div className="px-4 py-10 text-center text-sm text-gray-500">{children}</div>;
}
