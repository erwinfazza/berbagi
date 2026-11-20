import { redirect } from "next/navigation";
import UserFileList, { type UserFileItem } from "@/components/UserFileList";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const metadata = { title: "File terbaru" };
export const dynamic = "force-dynamic";

export default async function BaruPage() {
  if (!isSupabaseConfigured()) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-12">
        <section className="card p-6">
          <h1 className="text-2xl font-bold">Supabase belum dikonfigurasi</h1>
          <p className="mt-3 text-slate-600 dark:text-slate-300">Isi URL dan publishable key di <strong>.env.local</strong> untuk melihat file terbaru.</p>
        </section>
      </main>
    );
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/signin?next=%2Fbaru");

  const { data, error } = await supabase
    .from("user_files")
    .select("id, original_name, extension, size_bytes, download_count, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <main className="mx-auto grid max-w-4xl gap-6 px-4 py-10 sm:py-14">
      <header>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-700 dark:text-brand-300">Update terbaru</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">File baru</h1>
        <p className="mt-3 text-slate-600 dark:text-slate-300">File yang terakhir Anda unggah, paling baru ditampilkan lebih dahulu.</p>
      </header>
      {error ? (
        <p className="card p-5 text-sm text-rose-700 dark:text-rose-300">Jalankan atau perbarui <strong>supabase/files.sql</strong> untuk menyiapkan tabel file.</p>
      ) : (
        <UserFileList files={(data ?? []) as UserFileItem[]} emptyMessage="Belum ada file yang diunggah." />
      )}
    </main>
  );
}
