# Berbagi

Aplikasi berbagi file belajar berbasis Next.js dan Supabase. Supabase Auth menangani akun dan sesi; Supabase Postgres menyimpan tugas dan metadata file; Supabase Storage menyimpan file privat tiap user.

## Menjalankan

1. Buat project di [Supabase](https://supabase.com/dashboard).
2. Salin `.env.example` ke `.env.local`, lalu isi Project URL dan anon/publishable key dari **Project Settings → API**.
3. Di Supabase **SQL Editor**, jalankan `supabase/schema.sql` dan `supabase/files.sql`.
4. Pastikan **Authentication → Providers → Email** aktif. Untuk pengujian lokal paling mudah, nonaktifkan konfirmasi email.
5. Jalankan:

```bash
npm install
npm run dev
```

Buka <http://localhost:3000>, buat akun, lalu gunakan halaman file. Jangan pernah mengirimkan `service_role` key ke browser atau memasukkannya ke variabel `NEXT_PUBLIC_*`.

## Database dan keamanan

- `public.tasks`: tugas per user, dengan UUID, tenggat, prioritas, status selesai, dan waktu pembuatan/perubahan.
- `public.user_files`: metadata file beserta jumlah unduhan.
- Storage bucket `user-files`: bucket privat untuk file upload.
- Row Level Security membatasi setiap user hanya pada baris dan object miliknya. Server Actions dan API memeriksa sesi Supabase; RLS menjadi lapisan perlindungan database.
- File lokal SQLite sebelumnya tidak dipindahkan otomatis. Jika ada data lokal yang ingin dipertahankan, ekspor dan impor secara terpisah setelah akun pemilik ditentukan.

Untuk instruksi setup dan format file, lihat [supabase/README.md](supabase/README.md).

## Fitur

- Daftar dan masuk dengan email/password.
- Upload serta unduh file privat: DOCX, PDF, JPG/JPEG, PSD, PNG, ODT, XLSX, PPT/PPTX; batas awal 50 MB.
- Halaman file terbaru dan populer.
- CRUD tugas melalui Server Actions dan REST API, dengan data per akun.
- Landing page responsif dan navigasi mobile-first.

## Pemeriksaan

```bash
npm run typecheck
npm run build
```
