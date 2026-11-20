"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

export default function UploadForm() {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setMessage("");
    setPending(true);

    try {
      const response = await fetch("/api/files", {
        method: "POST",
        body: new FormData(form),
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) {
        setMessage(result.error ?? "File gagal diunggah.");
        return;
      }

      form.reset();
      setMessage("File berhasil diunggah.");
      router.refresh();
    } catch {
      setMessage("Tidak dapat terhubung ke server. Coba lagi.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="card grid gap-4 p-5 sm:grid-cols-[1fr_auto] sm:items-end" onSubmit={handleSubmit}>
      <label className="grid gap-2 text-sm font-medium" htmlFor="file-upload">
        Pilih file (maksimal 50 MB)
        <input
          id="file-upload"
          className="field file:mr-3 file:rounded-lg file:border-0 file:bg-brand-50 file:px-3 file:py-2 file:font-semibold file:text-brand-700"
          name="file"
          type="file"
          accept=".docx,.pdf,.jpg,.jpeg,.psd,.png,.odt,.xlsx,.ppt,.pptx"
          required
        />
        <span className="text-xs font-normal text-slate-500">
          DOCX, PDF, JPG, PSD, PNG, ODT, XLSX, PPT, PPTX
        </span>
      </label>
      <button
        className="rounded-xl bg-brand-600 px-5 py-3 font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
        disabled={pending}
        type="submit"
      >
        {pending ? "Mengunggah..." : "Upload file"}
      </button>
      {message && (
        <p aria-live="polite" className="text-sm sm:col-span-2">
          {message}
        </p>
      )}
    </form>
  );
}
