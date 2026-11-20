import { redirect } from "next/navigation";
import UploadForm from "./upload-form";
import { createClient } from "@/lib/supabase/server";
import UserFileList, { type UserFileItem } from "@/components/UserFileList";

export const metadata = { title: "File saya" };
export const dynamic = "force-dynamic";

export default async function FilesPage() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-12">
        <section className="card p-6">
          <h1 className="text-2xl font-bold">Supabase belum dikonfigurasi</h1>
          <p className="mt-3 text-slate-600 dark:text-slate-300">
            Isi URL dan anon key Supabase di <strong>.env.local</strong>, lalu jalankan SQL pada folder supabase.
          </p>
        </section>
      </main>
    );
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/signin?next=%2Ffiles");

  const { data: files, error } = await supabase
    .from("user_files")
    .select("id, original_name, extension, size_bytes, download_count, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <main className="mx-auto grid max-w-4xl gap-8 px-4 py-10 sm:py-14">
      <header>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-700 dark:text-brand-300">Penyimpanan privat</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">File saya</h1>
        <p className="mt-3 text-slate-600 dark:text-slate-300">File hanya dapat dilihat dan diunduh oleh akun Anda.</p>
      </header>

      <UploadForm />

      <section className="grid gap-3" aria-labelledby="uploaded-files-heading">
        <h2 id="uploaded-files-heading" className="text-xl font-semibold">File yang diunggah</h2>
        {error ? (
          <div className="card p-5 text-sm text-rose-700 dark:text-rose-300">
            Tabel file belum siap. Jalankan <strong>supabase/files.sql</strong> di Supabase SQL Editor.
          </div>
        ) : (
          <UserFileList files={(files ?? []) as UserFileItem[]} emptyMessage="Belum ada file. Unggah file pertama Anda di atas." />
        )}
      </section>
    </main>
  );
}
