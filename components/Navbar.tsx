import Link from "next/link";
import { signOutAction } from "@/app/auth-actions";
import { createClient } from "@/lib/supabase/server";
import NavbarLink from "@/components/NavbarLink";
import MobileNavbar from "@/components/MobileNavbar";

async function Navbar() {
  const isSupabaseConfigured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
  const user = isSupabaseConfigured
    ? (await (await createClient()).auth.getUser()).data.user
    : null;

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/85 backdrop-blur-xl dark:border-white/10 dark:bg-[#050807]/90">
      <div className="relative mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <Link href="/" className="flex shrink-0 items-center gap-2.5 font-bold tracking-wide">
          <span className="grid size-9 place-items-center rounded-xl bg-brand-600 text-lg text-white shadow-sm">B</span>
          <span>BERBAGI</span>
        </Link>
        <nav aria-label="Navigasi utama" className="hidden items-center justify-end gap-1 md:flex">
          <NavbarLink href="/" exact>Beranda</NavbarLink>
          <NavbarLink href="/baru">Baru</NavbarLink>
          <NavbarLink href="/populer">Populer</NavbarLink>
          <NavbarLink href="/files">File saya</NavbarLink>
        {user ? (
          <>
            <span className="mx-2 hidden max-w-36 truncate text-xs text-slate-500 lg:inline">{user.email}</span>
            <form action={signOutAction}>
              <button className="rounded-full px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white" type="submit">Sign out</button>
            </form>
          </>
        ) : (
          <Link className="ml-1 rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700" href="/signin">
            Sign in
          </Link>
        )}
        </nav>
        <MobileNavbar isAuthenticated={Boolean(user)} email={user?.email ?? undefined} />
      </div>
    </header>
  );
}

export default Navbar;
