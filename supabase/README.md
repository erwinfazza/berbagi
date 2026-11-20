# Supabase setup

## Database

1. Buat project di Supabase.
2. Buka **SQL Editor**, lalu jalankan isi `schema.sql`.
3. Schema membuat tabel `public.tasks`, indeks, trigger `updated_at`, serta Row Level Security (RLS). Data tugas dibatasi per user melalui `user_id` dan `auth.uid()`.
4. Aktifkan metode autentikasi yang akan dipakai pada **Authentication → Providers**.

## Penyimpanan file per user

1. Jalankan atau jalankan ulang `files.sql` di **SQL Editor** untuk membuat bucket privat `user-files`, tabel metadata `public.user_files`, kebijakan RLS/Storage, dan migrasi penghitung download.
2. Format yang diterima: `.docx`, `.pdf`, `.jpg`/`.jpeg`, `.psd`, `.png`, `.odt`, `.xlsx`, `.ppt`, dan `.pptx`.
3. Batas ukuran awal adalah 50 MB per file. Ubah `file_size_limit` dan batas `size_bytes` dalam SQL jika ingin nilai lain.
4. Simpan object dengan path `<user_id>/<nama-objek-unik>` (contohnya `<auth.uid()>/a1b2c3.pdf`). User yang sudah login dapat mengunggah, membaca/mengunduh, dan menghapus hanya object di foldernya sendiri. Untuk bucket privat, aplikasi dapat membuat signed URL setelah user terautentikasi.
5. Metadata disimpan di `public.user_files`. Kolom `download_count` ditambah melalui migrasi dan diperbarui dengan RPC aman saat endpoint download menerbitkan signed URL.

Ekstensi file dibatasi di bucket dan kolom metadata; validasi isi/magic bytes tetap perlu dilakukan di aplikasi/server karena MIME type dan ekstensi yang dikirim client dapat dipalsukan.

## Environment

Salin `.env.example` ke `.env.local`, lalu isi:

- `NEXT_PUBLIC_SUPABASE_URL`: Project URL dari **Project Settings → API**.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: anon/publishable key dari halaman yang sama.

Gunakan **Authentication → URL Configuration** untuk mengatur Site URL dan redirect URL aplikasi. Metode Email harus aktif. Jika konfirmasi email aktif, user harus mengonfirmasi email sebelum sign in.

Jangan pernah menaruh `service_role` key di variabel `NEXT_PUBLIC_*` atau mengirimkannya ke browser. RLS pada schema mengharuskan request menggunakan sesi user terautentikasi.

## Alur aplikasi

- `/signin` menyediakan pendaftaran, sign in, dan setelah login mengarahkan user ke `/files`.
- `/files` hanya dapat dibuka oleh user yang sudah sign in; user dapat upload dan download file.
- `/baru` menampilkan 50 file milik user dengan upload terbaru di atas.
- `/populer` mengurutkan file milik user berdasarkan `download_count`.
- API upload/download memeriksa sesi di server, sementara RLS membatasi metadata dan objek Storage berdasarkan `auth.uid()`.
- Server Actions dan endpoint `/api/tasks` serta `/api/stats` menyimpan data tugas pada `public.tasks`; seluruh operasi dibatasi pada user yang sedang masuk.
- Tombol **Sign out** mengakhiri sesi Supabase.

Upload dibatasi 50 MB. Validasi ekstensi/MIME di aplikasi tidak menggantikan pemindaian konten file; untuk produksi dengan file publik/berisiko, tambahkan pemeriksaan malware dan validasi signature file.
