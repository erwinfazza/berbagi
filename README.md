# Ruang Tugas

Aplikasi manajemen tugas **fullstack** yang siap dijalankan: Next.js (App Router) + Tailwind CSS + SQLite. Tanpa layanan eksternal, tanpa API key — database langsung dibuat otomatis saat pertama kali dijalankan.

![stack](https://img.shields.io/badge/Next.js-16-black) ![stack](https://img.shields.io/badge/React-19-149eca) ![stack](https://img.shields.io/badge/Tailwind_CSS-4-38bdf8) ![stack](https://img.shields.io/badge/SQLite-node%3Asqlite-003b57)

## Fitur

- **CRUD penuh** — tambah, centang selesai, hapus, dan bersihkan tugas selesai.
- **Prioritas & tenggat** — rendah / sedang / tinggi, plus penanda "Hari ini", "Besok", "Terlambat N hari".
- **Filter & pencarian** — status (semua/aktif/selesai), prioritas, dan kata kunci; tersimpan di URL sehingga bisa di-bookmark.
- **Dashboard ringkas** — total, selesai, aktif, prioritas tinggi, dan progress bar.
- **Dua jalur data** — Server Actions untuk UI, REST API (`/api/tasks`) untuk integrasi eksternal.
- **Dark mode** — mengikuti preferensi sistem, bisa diubah manual, tanpa flash saat memuat.
- **Responsif & accessible** — mobile-first, focus ring, `aria-*`, skip link, navigasi keyboard.
- **Validasi berlapis** — Zod di server (form & API), pesan error per field di UI.

## Menjalankan

```bash
npm install
npm run dev
```

Buka <http://localhost:3000>. Database SQLite dibuat otomatis di `.data/ruang-tugas.db` beserta 5 tugas contoh.

Build produksi:

```bash
npm run build
npm run start
```

Cek tipe:

```bash
npm run typecheck
```

> **Butuh Node.js 22.5+** karena memakai modul bawaan `node:sqlite` (tanpa dependency native). Diuji pada Node.js 24.

## Struktur proyek

```
app/
  actions.ts              # Server Actions: create, toggle, delete, clear
  layout.tsx              # Shell HTML + inisialisasi tema (anti-flash)
  page.tsx                # Dashboard (Server Component, baca DB langsung)
  globals.css             # Tailwind v4 + design token + komponen dasar
  api/
    tasks/route.ts        # GET (list + filter) & POST (create)
    tasks/[id]/route.ts   # GET, PATCH, DELETE per tugas
    stats/route.ts        # Ringkasan angka
components/
  task-form.tsx           # Form + useActionState + validasi feedback
  task-item.tsx           # Toggle/hapus dengan optimistic update
  task-filters.tsx        # Pencarian debounce, filter status/prioritas
  task-list.tsx           # Daftar + empty state
  stats-overview.tsx      # Kartu statistik + progress bar
  site-header.tsx         # Brand, tanggal, theme toggle
  theme-toggle.tsx        # Light/dark persisten (localStorage)
lib/
  db.ts                   # Koneksi SQLite, skema, seed data
  tasks.ts                # Query & mutasi (lapisan data)
  validation.ts           # Skema Zod + helper FormData/URL
  date.ts                 # Format tanggal & label tenggat (id-ID)
  types.ts                # Tipe bersama + metadata prioritas
```

Alurnya sederhana: **Server Component** membaca langsung dari `lib/tasks` (tanpa `fetch` internal), **Client Component** mengirim perubahan lewat Server Action, lalu `revalidatePath("/")` menyegarkan tampilan.

## REST API

Semua response JSON. Contoh dengan `curl`:

```bash
# Daftar tugas (bisa difilter)
curl "http://localhost:3000/api/tasks?status=active&priority=high"

# Buat tugas
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"Rapat sprint","priority":"high","dueDate":"2026-12-01"}'

# Tandai selesai
curl -X PATCH http://localhost:3000/api/tasks/1 \
  -H "Content-Type: application/json" \
  -d '{"completed":true}'

# Hapus
curl -X DELETE http://localhost:3000/api/tasks/1

# Statistik
curl http://localhost:3000/api/stats
```

| Method | Endpoint          | Keterangan                                        |
| ------ | ----------------- | ------------------------------------------------- |
| GET    | `/api/tasks`      | List; query `status`, `priority`, `q`             |
| POST   | `/api/tasks`      | Buat tugas (`title` wajib)                        |
| GET    | `/api/tasks/:id`  | Detail satu tugas                                 |
| PATCH  | `/api/tasks/:id`  | Ubah `title`, `description`, `priority`, `dueDate`, `completed` |
| DELETE | `/api/tasks/:id`  | Hapus tugas                                       |
| GET    | `/api/stats`      | `{ total, completed, active, highPriority }`      |

Kode status: `200` ok, `201` dibuat, `204` terhapus, `400` body/ID tidak valid, `404` tidak ditemukan, `422` validasi gagal (disertai `fieldErrors`).

## Konfigurasi

| Variabel        | Default                  | Keterangan                        |
| --------------- | ------------------------ | --------------------------------- |
| `DATABASE_PATH` | `./.data/ruang-tugas.db` | Lokasi file SQLite (relatif/absolut) |

Salin `.env.example` menjadi `.env.local` bila ingin mengubahnya:

```bash
cp .env.example .env.local
```

## Catatan teknis

- **Tanpa ORM**: query SQL langsung via `DatabaseSync` dari `node:sqlite`; koneksi disimpan di `globalThis` agar aman terhadap HMR Next.js.
- **Seed otomatis**: 5 tugas contoh hanya dimasukkan saat tabel masih kosong.
- **Zona waktu**: tanggal disimpan sebagai `YYYY-MM-DD` dan diformat dengan locale `id-ID` (aman dari pergeseran zona waktu).
- **Optimistic UI**: checkbox langsung berubah, lalu dikoreksi bila server menolak.
- **Data lokal**: folder `.data/` masuk `.gitignore`; hapus file DB untuk memulai dari nol (seed contoh akan dibuat ulang).
- **Demo tanpa autentikasi**: cocok untuk belajar/prototipe. Untuk produksi, tambahkan sesi/login sebelum dipakai bersama.

## Lisensi

MIT — bebas dipakai dan dimodifikasi.
