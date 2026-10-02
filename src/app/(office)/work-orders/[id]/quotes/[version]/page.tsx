import Link from "next/link";
import { notFound } from "next/navigation";
import { MaintenanceDocument } from "@/components/document/maintenance-document";
import { PrintButton } from "@/components/print-button";
import { SECTION_ORDER, loadWorkOrder } from "@/lib/data";
import type { PricedWorkOrder } from "@/lib/pricing";
import { loadTerms } from "@/lib/terms";

export default async function QuotePage({ params }: { params: Promise<{ id: string; version: string }> }) {
  const { id, version } = await params;
  const loaded = await loadWorkOrder(Number(id));
  const quote = loaded?.quotes.find((q) => q.version === Number(version));
  if (!loaded || !quote) notFound();
  const snap = quote.snapshot as PricedWorkOrder;
  const { workOrder: wo } = loaded;

  return (
    <div>
      <div className="no-print mx-auto mb-4 flex max-w-[8.5in] items-center justify-between">
        <Link href={`/work-orders/${wo.id}`} className="text-sm text-gray-500 hover:text-gray-900">
          ← Back to work order
        </Link>
        <PrintButton />
      </div>
      <MaintenanceDocument
        kind="quote"
        number={`Q-${wo.number}-v${quote.version}`}
        date={quote.createdAt}
        workOrderNumber={wo.number}
        customerReference={wo.customerReference}
        customer={loaded.customer}
        aircraft={loaded.aircraft}
        tasks={snap.tasks}
        totals={snap.totals}
        payments={[]}
        depositCents={quote.depositCents}
        sectionOrder={SECTION_ORDER}
        terms={loadTerms("quote")}
        printedAt={new Date()}
      />
    </div>
  );
}
