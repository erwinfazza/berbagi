"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

type NavbarLinkProps = {
  href: string;
  children: ReactNode;
  exact?: boolean;
  onClick?: () => void;
};

export default function NavbarLink({ href, children, exact = false, onClick }: NavbarLinkProps) {
  const pathname = usePathname();
  const active = exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      onClick={onClick}
      className={`rounded-full px-3 py-2 text-sm font-medium transition-colors ${
        active
          ? "bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-200"
          : "text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white"
      }`}
    >
      {children}
    </Link>
  );
}
