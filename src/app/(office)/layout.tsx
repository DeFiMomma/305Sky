import Link from "next/link";
import { openPartsRequestCount } from "@/lib/data";
import { NavLink } from "@/components/nav-link";

export const dynamic = "force-dynamic";

export default async function OfficeLayout({ children }: { children: React.ReactNode }) {
  const partsWaiting = await openPartsRequestCount();
  return (
    <div className="min-h-screen">
      <header className="no-print sticky top-0 z-20 border-b border-gray-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-7xl items-center gap-6 px-4">
          <Link href="/work-orders" className="text-lg font-bold tracking-tight">
            305 <span className="text-brand">SKY</span>
          </Link>
          <nav className="flex items-center gap-1 overflow-x-auto text-sm">
            <NavLink href="/work-orders">Work orders</NavLink>
            <NavLink href="/parts" badge={partsWaiting}>
              Parts
            </NavLink>
            <NavLink href="/labor">Labor</NavLink>
          </nav>
          <div className="ml-auto">
            <Link href="/tech" className="btn-ghost text-xs">
              Technician app →
            </Link>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6">{children}</main>
    </div>
  );
}
