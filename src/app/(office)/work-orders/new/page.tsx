import Link from "next/link";
import { listCustomers } from "@/lib/data";
import { PageHeader } from "@/components/ui";
import { NewWorkOrderForm } from "./form";

export default async function NewWorkOrderPage() {
  const customers = await listCustomers();
  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/work-orders" className="text-sm text-gray-500 hover:text-gray-900">
        ← Work orders
      </Link>
      <PageHeader title="New work order" subtitle="Aircraft, customer and the squawks they called in with." />
      <NewWorkOrderForm customers={customers.map((c) => ({ id: c.id, name: c.name }))} />
    </div>
  );
}
