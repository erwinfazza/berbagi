import { mkdirSync } from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";

/**
 * Satu koneksi SQLite dipakai ulang lintas request (dan lintas HMR saat dev)
 * supaya file database tidak dibuka berkali-kali.
 */
const globalForDb = globalThis as unknown as { __ruangTugasDb?: DatabaseSync };

const SCHEMA = `
  CREATE TABLE IF NOT EXISTS tasks (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    title       TEXT    NOT NULL,
    description TEXT    NOT NULL DEFAULT '',
    priority    TEXT    NOT NULL DEFAULT 'medium'
                CHECK (priority IN ('low', 'medium', 'high')),
    completed   INTEGER NOT NULL DEFAULT 0 CHECK (completed IN (0, 1)),
    due_date    TEXT,
    created_at  TEXT    NOT NULL DEFAULT (datetime('now')),
    updated_at  TEXT    NOT NULL DEFAULT (datetime('now'))
  );

  CREATE INDEX IF NOT EXISTS idx_tasks_completed ON tasks (completed);
  CREATE INDEX IF NOT EXISTS idx_tasks_priority  ON tasks (priority);
`;

function resolveDatabasePath(): string {
  const configured = process.env.DATABASE_PATH?.trim() || ".data/ruang-tugas.db";
  return path.isAbsolute(configured)
    ? configured
    : path.join(/* turbopackIgnore: true */ process.cwd(), configured);
}

function seed(db: DatabaseSync) {
  const row = db.prepare("SELECT COUNT(*) AS count FROM tasks").get() as
    | { count: number }
    | undefined;
  if (row && Number(row.count) > 0) return;

  const today = new Date();
  const iso = (offsetDays: number) => {
    const date = new Date(today);
    date.setDate(today.getDate() + offsetDays);
    return date.toISOString().slice(0, 10);
  };

  const insert = db.prepare(
    `INSERT INTO tasks (title, description, priority, completed, due_date)
     VALUES (?, ?, ?, ?, ?)`,
  );

  const demo: Array<[string, string, string, number, string | null]> = [
    [
      "Rapikan landing page portofolio",
      "Perbaiki hierarki tipografi, tambah section studi kasus, dan cek ulang responsivitas di layar kecil.",
      "high",
      0,
      iso(1),
    ],
    [
      "Review pull request tim frontend",
      "Fokus ke komponen form dan penanganan error pada alur checkout.",
      "medium",
      0,
      iso(0),
    ],
    [
      "Tulis dokumentasi API v2",
      "Lengkapi contoh request/response untuk endpoint tasks dan autentikasi.",
      "medium",
      0,
      iso(3),
    ],
    [
      "Setup analytics dashboard",
      "Pasang event tracking dasar dan verifikasi data masuk ke dashboard.",
      "low",
      1,
      iso(-2),
    ],
    [
      "Belanja kebutuhan bulanan",
      "Kopi, oat milk, sabun, dan cemilan untuk stok kerja seminggu.",
      "low",
      0,
      null,
    ],
  ];

  for (const item of demo) {
    insert.run(item[0], item[1], item[2], item[3], item[4]);
  }
}

export function getDb(): DatabaseSync {
  if (globalForDb.__ruangTugasDb) return globalForDb.__ruangTugasDb;

  const file = resolveDatabasePath();
  mkdirSync(path.dirname(file), { recursive: true });

  const db = new DatabaseSync(file);
  db.exec("PRAGMA journal_mode = WAL;");
  db.exec("PRAGMA busy_timeout = 5000;");
  db.exec(SCHEMA);
  seed(db);

  globalForDb.__ruangTugasDb = db;
  return db;
}
