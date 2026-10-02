"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function NavLink({ href, badge, children }: { href: string; badge?: number; children: React.ReactNode }) {
  const active = usePathname().startsWith(href);
  return (
    <Link
      href={href}
      className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 whitespace-nowrap ${
        active ? "bg-gray-900 text-white" : "text-gray-600 hover:bg-gray-100"
      }`}
    >
      {children}
      {badge ? (
        <span className="rounded-full bg-red-600 px-1.5 text-[11px] leading-4 font-semibold text-white">{badge}</span>
      ) : null}
    </Link>
  );
}
