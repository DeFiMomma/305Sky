import Link from "next/link";
import { notFound } from "next/navigation";
import { MaintenanceDocument } from "@/components/document/maintenance-document";
import { PrintButton } from "@/components/print-button";
import { SECTION_ORDER, workOrderView } from "@/lib/data";
import { loadTerms } from "@/lib/terms";

/** Live invoice preview, priced from the work order as it stands right now. */
export default async function InvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const view = await workOrderView(Number((await params).id));
  if (!view) notFound();
  const { workOrder: wo } = view;
  const errors = view.invoiceChecks.filter((i) => i.severity === "error");
  const warnings = view.invoiceChecks.filter((i) => i.severity === "warning");

  return (
    <div>
      <div className="no-print mx-auto mb-4 max-w-[8.5in] space-y-3">
        <div className="flex items-center justify-between">
          <Link href={`/work-orders/${wo.id}`} className="text-sm text-gray-500 hover:text-gray-900">
            ← Back to work order
          </Link>
          <PrintButton />
        </div>
        <div className={`rounded-lg px-4 py-3 text-sm ${errors.length ? "bg-red-50 text-red-800" : "bg-blue-50 text-blue-800"}`}>
          <strong>Draft invoice preview.</strong> It updates live from the work order and is not final until it is
          finalized and sent to QuickBooks (coming next).
          {errors.length ? (
            <>
              {" "}
              Fix these before invoicing:
              <ul className="mt-1 list-disc pl-5">
                {errors.map((e, i) => (
                  <li key={i}>{e.message}</li>
                ))}
              </ul>
            </>
          ) : null}
          {warnings.length ? (
            <div className="mt-1 text-amber-800">
              {warnings.length} item{warnings.length > 1 ? "s" : ""} to review: {warnings.map((w) => w.message).join(" ")}
            </div>
          ) : null}
        </div>
      </div>
      <MaintenanceDocument
        kind="invoice"
        number={`INV-${wo.number}-01`}
        date={new Date()}
        workOrderNumber={wo.number}
        customerReference={wo.customerReference}
        customer={view.customer}
        aircraft={view.aircraft}
        tasks={view.priced.tasks}
        totals={view.priced.totals}
        payments={view.payments}
        sectionOrder={SECTION_ORDER}
        terms={loadTerms("invoice")}
        printedAt={new Date()}
      />
    </div>
  );
}
