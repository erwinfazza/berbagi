import Link from "next/link";

export default function Footer() {
    return (
        <footer className="border-t border-slate-200/70 dark:border-white/10">
            <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-7 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
                <Link href="/" className="font-bold tracking-wide text-slate-800 dark:text-slate-200">
                    BERBAGI
                </Link>
                <p>Ruang sederhana untuk berbagi materi belajar.</p>
                <nav aria-label="Navigasi footer" className="flex gap-4">
                    <Link className="transition hover:text-brand-600" href="/baru">File baru</Link>
                    <Link className="transition hover:text-brand-600" href="/populer">Populer</Link>
                </nav>
            </div>
        </footer>
    );
}