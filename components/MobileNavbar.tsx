"use client";

import Link from "next/link";
import { useState } from "react";
import { signOutAction } from "@/app/auth-actions";
import NavbarLink from "@/components/NavbarLink";

type MobileNavbarProps = { isAuthenticated: boolean; email?: string };

export default function MobileNavbar({ isAuthenticated, email }: MobileNavbarProps) {
  const [isOpen, setIsOpen] = useState(false);

  function closeMenu() {
    setIsOpen(false);
  }

  return (
    <div className="md:hidden">
      <button
        type="button"
        className="grid size-10 place-items-center rounded-xl border border-slate-200 text-slate-700 transition hover:bg-slate-100 dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/10"
        aria-label={isOpen ? "Tutup menu navigasi" : "Buka menu navigasi"}
        aria-expanded={isOpen}
        aria-controls="mobile-navigation"
        onClick={() => setIsOpen((open) => !open)}
      >
        {isOpen ? (
          <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="m6 6 12 12M18 6 6 18" />
          </svg>
        ) : (
          <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 7h16M4 12h16M4 17h16" />
          </svg>
        )}
      </button>

      {isOpen && (
        <div
          id="mobile-navigation"
          className="absolute inset-x-0 top-full border-b border-slate-200 bg-white p-4 shadow-xl dark:border-white/10 dark:bg-[#0b130d]"
        >
          {email && (
            <p className="mb-3 truncate px-3 text-xs text-slate-500 dark:text-slate-400">
              Masuk sebagai {email}
            </p>
          )}
          <nav aria-label="Navigasi mobile" className="grid gap-1">
            <NavbarLink href="/" exact onClick={closeMenu}>Beranda</NavbarLink>
            <NavbarLink href="/baru" onClick={closeMenu}>Baru</NavbarLink>
            <NavbarLink href="/populer" onClick={closeMenu}>Populer</NavbarLink>
            <NavbarLink href="/files" onClick={closeMenu}>File saya</NavbarLink>
            {isAuthenticated ? (
              <form action={signOutAction} className="mt-2 border-t border-slate-200 pt-2 dark:border-white/10">
                <button className="w-full rounded-full px-3 py-2 text-left text-sm font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10" type="submit">
                  Sign out
                </button>
              </form>
            ) : (
              <Link
                href="/signin"
                onClick={closeMenu}
                className="mt-2 rounded-full bg-brand-600 px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-brand-700"
              >
                Sign in
              </Link>
            )}
          </nav>
        </div>
      )}
    </div>
  );
}
