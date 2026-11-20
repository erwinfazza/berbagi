import { redirect } from "next/navigation";
import UserFileList, { type UserFileItem } from "@/components/UserFileList";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "File populer" };
export const dynamic = "force-dynamic";

export default async function PopulerPage() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-12">
        <section className="card p-6">
          <h1 className="text-2xl font-bold">Supabase belum dikonfigurasi</h1>
          <p className="mt-3 text-slate-600 dark:text-slate-300">Isi URL dan anon key di <strong>.env.local</strong> untuk melihat file populer.</p>
        </section>
      </main>
    );
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/signin?next=%2Fpopuler");

  const { data, error } = await supabase
    .from("user_files")
    .select("id, original_name, extension, size_bytes, download_count, created_at")
    .eq("user_id", user.id)
    .order("download_count", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <main className="mx-auto grid max-w-4xl gap-6 px-4 py-10 sm:py-14">
      <header>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-700 dark:text-brand-300">Paling sering diunduh</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">File populer</h1>
        <p className="mt-3 text-slate-600 dark:text-slate-300">Peringkat berdasarkan jumlah download file di akun Anda.</p>
      </header>
      {error ? (
        <p className="card p-5 text-sm text-rose-700 dark:text-rose-300">Jalankan atau perbarui <strong>supabase/files.sql</strong> untuk menyiapkan statistik download.</p>
      ) : (
        <UserFileList files={(data ?? []) as UserFileItem[]} emptyMessage="Belum ada file yang diunggah." />
      )}
    </main>
  );
}
