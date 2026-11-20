import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const dynamic = "force-dynamic";

const formats = ["DOCX", "PDF", "JPG", "PSD", "PNG", "ODT", "XLSX", "PPT"];

export default async function HomePage() {
  const user = isSupabaseConfigured()
    ? (await (await createClient()).auth.getUser()).data.user
    : null;
  const primaryHref = user ? "/files" : "/signin?next=%2Ffiles";

  return (
    <main
      id="konten"
      className="mx-auto grid max-w-7xl gap-16 px-4 py-8 sm:px-6 sm:py-12 lg:gap-24 lg:px-8"
    >
      <section className="relative isolate overflow-hidden rounded-[2rem] bg-[#07110b] px-6 py-12 text-white shadow-2xl shadow-black/20 sm:px-10 sm:py-16 lg:grid lg:min-h-[560px] lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:px-16 lg:py-20">
        <div
          aria-hidden="true"
          className="absolute -right-28 -top-32 -z-10 size-[30rem] rounded-full bg-green-500/30 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="absolute -bottom-48 left-1/4 -z-10 size-[28rem] rounded-full bg-lime-400/10 blur-3xl"
        />

        <div className="relative z-10 max-w-2xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.07] px-3.5 py-2 text-xs font-medium text-green-100 sm:text-sm">
            <span className="size-2 rounded-full bg-emerald-400 shadow-[0_0_14px_rgba(52,211,153,0.8)]" />
            Ruang berbagi untuk proses belajar
          </div>
          <h1 className="text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">
            File belajar,
            <br />
            <span className="bg-gradient-to-r from-green-300 via-lime-200 to-emerald-100 bg-clip-text text-transparent">
              lebih mudah dibagi.
            </span>
          </h1>
          <p className="mt-6 max-w-xl text-base leading-7 text-slate-300 sm:text-lg sm:leading-8">
            Simpan materi, temukan file terbaru, dan akses kembali kapan saja.
            Satu tempat sederhana untuk semua format yang kamu butuhkan.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href={primaryHref}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-green-400 px-5 py-3 text-sm font-bold text-[#07110b] shadow-lg shadow-black/15 transition hover:-translate-y-0.5 hover:bg-green-300 focus-visible:outline-white"
            >
              {user ? "Buka file saya" : "Mulai berbagi file"}
              <svg
                aria-hidden="true"
                viewBox="0 0 20 20"
                className="size-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <path d="M4 10h12m-5-5 5 5-5 5" />
              </svg>
            </Link>
            <Link
              href="/baru"
              className="inline-flex min-h-12 items-center justify-center rounded-xl border border-white/20 px-5 py-3 text-sm font-semibold text-white transition hover:border-green-300/50 hover:bg-green-300/10"
            >
              Jelajahi file terbaru
            </Link>
          </div>
          <div className="mt-8 flex items-center gap-3 text-sm text-slate-300">
            <div className="flex -space-x-2" aria-hidden="true">
              <span className="grid size-8 place-items-center rounded-full border-2 border-[#07110b] bg-green-300 text-xs font-bold text-green-950">
                D
              </span>
              <span className="grid size-8 place-items-center rounded-full border-2 border-[#07110b] bg-lime-300 text-xs font-bold text-lime-950">
                B
              </span>
              <span className="grid size-8 place-items-center rounded-full border-2 border-[#07110b] bg-emerald-200 text-xs font-bold text-emerald-950">
                K
              </span>
            </div>
            <span>Untuk belajar, berkarya, dan berbagi.</span>
          </div>
        </div>

        <div
          aria-label="Ilustrasi file yang tersimpan"
          className="relative mx-auto mt-12 flex min-h-[310px] w-full max-w-[430px] items-center justify-center lg:mt-0 lg:min-h-[420px]"
        >
          <div
            aria-hidden="true"
            className="absolute size-[min(74vw,360px)] rounded-full border border-white/10 bg-white/[0.025]"
          />
          <div
            aria-hidden="true"
            className="absolute size-[min(56vw,270px)] rounded-full border border-white/10"
          />
          <div className="absolute left-[3%] top-[14%] rotate-[-9deg] rounded-2xl border border-white/15 bg-white/10 p-4 shadow-xl backdrop-blur-md sm:left-[6%]">
            <div className="grid size-11 place-items-center rounded-xl bg-green-300/20 text-green-200">
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="size-6"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
              >
                <path d="M7 3.75h7l5 5v11.5H7a2 2 0 0 1-2-2v-12a2.5 2.5 0 0 1 2-2.5Z" />
                <path d="M14 4v5h5M8 14h8M8 17h6" />
              </svg>
            </div>
            <p className="mt-2 text-xs font-semibold">Materi.pdf</p>
            <p className="mt-1 text-[10px] text-slate-300">12.4 MB</p>
          </div>
          <div className="absolute right-[1%] top-[23%] rotate-[8deg] rounded-2xl border border-white/15 bg-white/10 p-4 shadow-xl backdrop-blur-md sm:right-[5%]">
            <div className="grid size-11 place-items-center rounded-xl bg-lime-300/20 text-lime-100">
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="size-6"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
              >
                <rect x="4" y="4" width="16" height="16" rx="2" />
                <circle cx="9" cy="9" r="1.5" />
                <path d="m20 15-4-4L6 20" />
              </svg>
            </div>
            <p className="mt-2 text-xs font-semibold">Referensi.png</p>
            <p className="mt-1 text-[10px] text-slate-300">Gambar</p>
          </div>
          <div className="relative z-10 w-[min(76vw,310px)] rounded-[1.75rem] border border-white/20 bg-white/[0.12] p-5 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-green-200">
                  Penyimpanan kamu
                </p>
                <p className="mt-1 text-lg font-bold">Semua file rapi.</p>
              </div>
              <span className="grid size-10 place-items-center rounded-xl bg-white/10 text-green-100">
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  className="size-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                >
                  <path d="M3.75 7.5h6l2 2h8.5v8.75a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2V7.5Z" />
                  <path d="M3.75 9.5h16.5" />
                </svg>
              </span>
            </div>
            <div className="mt-5 grid grid-cols-4 gap-2">
              {formats.slice(0, 4).map((format, index) => (
                <div
                  key={format}
                  className="rounded-xl border border-white/10 bg-white/[0.07] px-2 py-3 text-center"
                >
                  <span
                    className={`mx-auto grid size-8 place-items-center rounded-lg text-[9px] font-black ${index % 2 ? "bg-lime-300/20 text-lime-200" : "bg-green-300/20 text-green-100"}`}
                  >
                    {format.slice(0, 3)}
                  </span>
                  <span className="mt-2 block text-[9px] text-slate-300">
                    file.{format.toLowerCase()}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center gap-3 rounded-xl bg-black/15 p-3">
              <span className="grid size-9 place-items-center rounded-lg bg-emerald-300/15 text-emerald-200">
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  className="size-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <path d="M12 3.5 19 6v5.5c0 4.2-2.9 7.5-7 9-4.1-1.5-7-4.8-7-9V6l7-2.5Z" />
                  <path d="m9 12 2 2 4-4" />
                </svg>
              </span>
              <div>
                <p className="text-xs font-semibold">Privat dan aman</p>
                <p className="mt-0.5 text-[10px] text-slate-300">
                  File hanya untuk akunmu
                </p>
              </div>
              <span className="ml-auto size-2 rounded-full bg-emerald-300" />
            </div>
          </div>
          <div className="absolute bottom-[7%] left-[5%] rounded-full border border-white/15 bg-[#102017]/90 px-3.5 py-2 text-xs font-semibold text-white shadow-lg backdrop-blur sm:left-[12%]">
            ✦ Siap dibagikan
          </div>
        </div>
      </section>

      <section className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-brand-700 dark:text-brand-300">
            Dibuat untuk kamu
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            Belajar bareng, jadi lebih ringan.
          </h2>
        </div>
        <p className="max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-300 lg:justify-self-end">
          Tidak perlu mencari file di banyak tempat. Unggah materi, lihat apa
          yang baru, lalu unduh lagi saat dibutuhkan.
        </p>
      </section>

      <section
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        aria-label="Fitur utama"
      >
        <article className="card p-6 sm:p-7">
          <span className="grid size-12 place-items-center rounded-2xl bg-green-100 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300">
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              className="size-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path d="M12 16V4m0 0L7.5 8.5M12 4l4.5 4.5" />
              <path d="M5 14.5v4A1.5 1.5 0 0 0 6.5 20h11a1.5 1.5 0 0 0 1.5-1.5v-4" />
            </svg>
          </span>
          <h3 className="mt-5 text-lg font-bold">Upload tanpa ribet</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
            Simpan dokumen, presentasi, spreadsheet, dan gambar di satu tempat.
          </p>
        </article>
        <article className="card p-6 sm:p-7">
          <span className="grid size-12 place-items-center rounded-2xl bg-lime-100 text-lime-800 dark:bg-lime-400/10 dark:text-lime-300">
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              className="size-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path d="M4 7h16M4 12h10M4 17h7" />
              <circle cx="18" cy="16" r="3" />
              <path d="m20.2 18.2 1.3 1.3" />
            </svg>
          </span>
          <h3 className="mt-5 text-lg font-bold">Temukan lebih cepat</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
            Lihat unggahan terbaru atau urutkan file yang paling sering diunduh.
          </p>
          <div className="mt-5 flex gap-2">
            <Link
              href="/baru"
              className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-brand-50 hover:text-brand-700 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-brand-500/15"
            >
              File baru →
            </Link>
            <Link
              href="/populer"
              className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-brand-50 hover:text-brand-700 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-brand-500/15"
            >
              Populer →
            </Link>
          </div>
        </article>
        <article className="card p-6 sm:col-span-2 sm:p-7 lg:col-span-1">
          <span className="grid size-12 place-items-center rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300">
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              className="size-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path d="M12 3.5 19 6v5.5c0 4.2-2.9 7.5-7 9-4.1-1.5-7-4.8-7-9V6l7-2.5Z" />
              <path d="m9 12 2 2 4-4" />
            </svg>
          </span>
          <h3 className="mt-5 text-lg font-bold">Ruang pribadi</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
            Masuk ke akunmu untuk mengelola file yang tersimpan dengan akses
            privat.
          </p>
        </article>
      </section>

      <section className="card flex flex-col gap-6 p-6 sm:p-8 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-brand-700 dark:text-brand-300">
            Banyak format, satu ruang
          </p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight">
            Bawa file yang kamu perlukan.
          </h2>
        </div>
        <div
          className="flex flex-wrap gap-2"
          aria-label="Format file yang didukung"
        >
          {formats.map((format) => (
            <span
              key={format}
              className="rounded-lg border border-slate-200 bg-white/70 px-3 py-2 text-xs font-bold tracking-wide text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300"
            >
              .{format.toLowerCase()}
            </span>
          ))}
        </div>
      </section>

      <section className="overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#07110b] via-green-950 to-green-800 px-6 py-10 text-white shadow-xl shadow-green-950/20 sm:px-10 sm:py-12 lg:flex lg:items-center lg:justify-between lg:px-14">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold text-green-200">
            Mulai dari sekarang
          </p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            Materi siap, belajar pun lancar.
          </h2>
          <p className="mt-3 text-sm leading-6 text-green-100 sm:text-base">
            Masuk untuk mengunggah dan mengakses file belajarmu kapan saja.
          </p>
        </div>
        <Link
          href={primaryHref}
          className="mt-6 inline-flex min-h-12 shrink-0 items-center justify-center rounded-xl bg-green-400 px-5 py-3 text-sm font-bold text-green-950 transition hover:-translate-y-0.5 hover:bg-green-300 lg:ml-8 lg:mt-0"
        >
          {user ? "Ke file saya" : "Masuk / buat akun"}
        </Link>
      </section>
    </main>
  );
}
