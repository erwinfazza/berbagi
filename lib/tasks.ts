import { getDb } from "./db";
import type { Priority, Task, TaskFilter, TaskStats } from "./types";

type TaskRow = {
  id: number;
  title: string;
  description: string;
  priority: Priority;
  completed: number;
  due_date: string | null;
  created_at: string;
  updated_at: string;
};

const ORDER_BY = `
  ORDER BY
    completed ASC,
    CASE priority WHEN 'high' THEN 0 WHEN 'medium' THEN 1 ELSE 2 END ASC,
    due_date IS NULL ASC,
    due_date ASC,
    created_at DESC,
    id DESC
`;

function mapRow(row: TaskRow): Task {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    priority: row.priority,
    completed: Number(row.completed) === 1,
    dueDate: row.due_date,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export type CreateTaskInput = {
  title: string;
  description?: string;
  priority?: Priority;
  dueDate?: string | null;
};

export type UpdateTaskInput = Partial<CreateTaskInput> & { completed?: boolean };

function escapeLike(value: string): string {
  return value.replace(/[\\%_]/g, (match) => `\\${match}`);
}

export function listTasks(filter: Partial<TaskFilter> = {}): Task[] {
  const db = getDb();
  const clauses: string[] = [];
  const params: Array<string | number> = [];

  if (filter.status === "active") clauses.push("completed = 0");
  if (filter.status === "completed") clauses.push("completed = 1");
  if (filter.priority && filter.priority !== "all") {
    clauses.push("priority = ?");
    params.push(filter.priority);
  }
  if (filter.q) {
    const term = `%${escapeLike(filter.q)}%`;
    clauses.push("(title LIKE ? ESCAPE '\\' OR description LIKE ? ESCAPE '\\')");
    params.push(term, term);
  }

  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  const rows = db
    .prepare(`SELECT * FROM tasks ${where} ${ORDER_BY}`)
    .all(...params) as unknown as TaskRow[];

  return rows.map(mapRow);
}

export function getTask(id: number): Task | null {
  const row = getDb()
    .prepare("SELECT * FROM tasks WHERE id = ?")
    .get(id) as unknown as TaskRow | undefined;
  return row ? mapRow(row) : null;
}

export function getStats(): TaskStats {
  const row = getDb()
    .prepare(
      `SELECT
         COUNT(*)                                                     AS total,
         COALESCE(SUM(completed), 0)                                  AS completed,
         COALESCE(SUM(1 - completed), 0)                              AS active,
         COALESCE(SUM(CASE WHEN priority = 'high' AND completed = 0
                           THEN 1 ELSE 0 END), 0)                     AS highPriority
       FROM tasks`,
    )
    .get() as unknown as
    | { total: number; completed: number; active: number; highPriority: number }
    | undefined;

  return {
    total: Number(row?.total ?? 0),
    completed: Number(row?.completed ?? 0),
    active: Number(row?.active ?? 0),
    highPriority: Number(row?.highPriority ?? 0),
  };
}

export function createTask(input: CreateTaskInput): Task {
  const result = getDb()
    .prepare(
      `INSERT INTO tasks (title, description, priority, due_date)
       VALUES (?, ?, ?, ?)`,
    )
    .run(
      input.title.trim(),
      input.description?.trim() ?? "",
      input.priority ?? "medium",
      input.dueDate?.trim() || null,
    );

  const created = getTask(Number(result.lastInsertRowid));
  if (!created) throw new Error("Gagal membuat tugas.");
  return created;
}

export function updateTask(id: number, patch: UpdateTaskInput): Task | null {
  if (!getTask(id)) return null;

  const sets: string[] = [];
  const params: Array<string | number | null> = [];

  if (patch.title !== undefined) {
    sets.push("title = ?");
    params.push(patch.title.trim());
  }
  if (patch.description !== undefined) {
    sets.push("description = ?");
    params.push(patch.description.trim());
  }
  if (patch.priority !== undefined) {
    sets.push("priority = ?");
    params.push(patch.priority);
  }
  if (patch.dueDate !== undefined) {
    sets.push("due_date = ?");
    params.push(patch.dueDate?.trim() || null);
  }
  if (patch.completed !== undefined) {
    sets.push("completed = ?");
    params.push(patch.completed ? 1 : 0);
  }

  if (sets.length === 0) return getTask(id);

  sets.push("updated_at = datetime('now')");
  params.push(id);

  getDb()
    .prepare(`UPDATE tasks SET ${sets.join(", ")} WHERE id = ?`)
    .run(...params);

  return getTask(id);
}

export function deleteTask(id: number): boolean {
  const result = getDb().prepare("DELETE FROM tasks WHERE id = ?").run(id);
  return Number(result.changes) > 0;
}

export function deleteCompletedTasks(): number {
  const result = getDb().prepare("DELETE FROM tasks WHERE completed = 1").run();
  return Number(result.changes);
}
