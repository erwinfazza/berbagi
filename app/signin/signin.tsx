"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signInAction, signUpAction } from "@/app/auth-actions";

type SignInProps = { nextPath: string; registered: boolean; configured: boolean };

export default function SignIn({ nextPath, registered, configured }: SignInProps) {
  const [signInState, signInFormAction, signInPending] = useActionState(
    signInAction,
    {},
  );
  const [signUpState, signUpFormAction, signUpPending] = useActionState(
    signUpAction,
    {},
  );

  return (
    <main className="mx-auto grid min-h-[70vh] max-w-5xl gap-6 px-4 py-12 md:grid-cols-2 md:items-center">
      <section className="max-w-lg">
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-brand-700 dark:text-brand-300">
          Ruang berbagi file
        </p>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Masuk untuk mengelola file Anda.
        </h1>
        <p className="mt-4 leading-7 text-slate-600 dark:text-slate-300">
          Hanya pengguna yang sudah masuk dapat mengunggah dan mengunduh file.
          File disimpan privat dan hanya bisa diakses pemiliknya.
        </p>
        <Link className="mt-6 inline-flex font-semibold text-brand-700 hover:underline dark:text-brand-300" href="/">
          Kembali ke beranda
        </Link>
      </section>

      <section className="card grid gap-8 p-6 sm:p-8">
        {!configured && (
          <p role="alert" className="rounded-xl bg-amber-50 p-3 text-sm text-amber-900 dark:bg-amber-500/10 dark:text-amber-200">
            Isi URL dan anon key Supabase di <strong>.env.local</strong> sebelum sign in atau membuat akun.
          </p>
        )}
        {registered && (
          <p role="status" className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-200">
            Akun berhasil dibuat. Periksa email untuk konfirmasi, lalu masuk.
          </p>
        )}

        <form action={signInFormAction} className="grid gap-4">
          <input type="hidden" name="next" value={nextPath} />
          <h2 className="text-xl font-semibold">Sign in</h2>
          <label className="grid gap-1.5 text-sm font-medium" htmlFor="signin-email">
            Email
            <input id="signin-email" className="field" name="email" type="email" autoComplete="email" required />
          </label>
          <label className="grid gap-1.5 text-sm font-medium" htmlFor="signin-password">
            Password
            <input id="signin-password" className="field" name="password" type="password" autoComplete="current-password" minLength={8} required />
          </label>
          {signInState.error && <p role="alert" className="text-sm text-rose-600">{signInState.error}</p>}
          <button className="rounded-xl bg-brand-600 px-4 py-3 font-semibold text-white transition hover:bg-brand-700 disabled:opacity-60" disabled={signInPending || !configured}>
            {signInPending ? "Memproses..." : "Masuk"}
          </button>
        </form>

        <form action={signUpFormAction} className="grid gap-4 border-t border-slate-200 pt-6 dark:border-white/10">
          <input type="hidden" name="next" value={nextPath} />
          <h2 className="text-xl font-semibold">Buat akun</h2>
          <label className="grid gap-1.5 text-sm font-medium" htmlFor="signup-email">
            Email
            <input id="signup-email" className="field" name="email" type="email" autoComplete="email" required />
          </label>
          <label className="grid gap-1.5 text-sm font-medium" htmlFor="signup-password">
            Password (minimal 8 karakter)
            <input id="signup-password" className="field" name="password" type="password" autoComplete="new-password" minLength={8} required />
          </label>
          {signUpState.error && <p role="alert" className="text-sm text-rose-600">{signUpState.error}</p>}
          <button className="rounded-xl border border-slate-300 px-4 py-3 font-semibold transition hover:bg-slate-50 disabled:opacity-60 dark:border-white/15 dark:hover:bg-white/5" disabled={signUpPending || !configured}>
            {signUpPending ? "Memproses..." : "Daftar"}
          </button>
        </form>
      </section>
    </main>
  );
}
