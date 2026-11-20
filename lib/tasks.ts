import { createClient } from "@/lib/supabase/server";
import type { Priority, Task, TaskFilter, TaskStats } from "./types";

type TaskRow = {
  id: string;
  user_id: string;
  title: string;
  description: string;
  priority: Priority;
  completed: boolean;
  due_date: string | null;
  created_at: string;
  updated_at: string;
};

type TaskSupabaseClient = Awaited<ReturnType<typeof createClient>>;

export class TaskAuthRequiredError extends Error {
  constructor() {
    super("Silakan sign in untuk mengakses tugas.");
    this.name = "TaskAuthRequiredError";
  }
}

export async function getTaskContext() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) throw new TaskAuthRequiredError();
  return { supabase, user };
}

function mapRow(row: TaskRow): Task {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    priority: row.priority,
    completed: row.completed,
    dueDate: row.due_date,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

const priorityRank: Record<Priority, number> = { high: 0, medium: 1, low: 2 };

function compareTasks(a: Task, b: Task): number {
  if (a.completed !== b.completed) return Number(a.completed) - Number(b.completed);
  if (priorityRank[a.priority] !== priorityRank[b.priority]) {
    return priorityRank[a.priority] - priorityRank[b.priority];
  }
  if (a.dueDate === null && b.dueDate !== null) return 1;
  if (a.dueDate !== null && b.dueDate === null) return -1;
  if (a.dueDate && b.dueDate && a.dueDate !== b.dueDate) {
    return a.dueDate.localeCompare(b.dueDate);
  }
  const createdDifference = Date.parse(b.createdAt) - Date.parse(a.createdAt);
  return createdDifference || b.id.localeCompare(a.id);
}

export type CreateTaskInput = {
  title: string;
  description?: string;
  priority?: Priority;
  dueDate?: string | null;
};

export type UpdateTaskInput = Partial<CreateTaskInput> & { completed?: boolean };

export async function listTasks(
  supabase: TaskSupabaseClient,
  userId: string,
  filter: Partial<TaskFilter> = {},
): Promise<Task[]> {
  const { data, error } = await supabase
    .from("tasks")
    .select("id, user_id, title, description, priority, completed, due_date, created_at, updated_at")
    .eq("user_id", userId);

  if (error) throw new Error(error.message);

  const query = filter.q?.trim().toLocaleLowerCase();
  return ((data ?? []) as TaskRow[])
    .map(mapRow)
    .filter((task) => {
      if (filter.status === "active" && task.completed) return false;
      if (filter.status === "completed" && !task.completed) return false;
      if (filter.priority && filter.priority !== "all" && task.priority !== filter.priority) {
        return false;
      }
      if (query && !`${task.title}\n${task.description}`.toLocaleLowerCase().includes(query)) {
        return false;
      }
      return true;
    })
    .sort(compareTasks);
}

export async function getTask(
  supabase: TaskSupabaseClient,
  userId: string,
  id: string,
): Promise<Task | null> {
  const { data, error } = await supabase
    .from("tasks")
    .select("id, user_id, title, description, priority, completed, due_date, created_at, updated_at")
    .eq("user_id", userId)
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data ? mapRow(data as TaskRow) : null;
}

export async function getStats(
  supabase: TaskSupabaseClient,
  userId: string,
): Promise<TaskStats> {
  const { data, error } = await supabase
    .from("tasks")
    .select("completed, priority")
    .eq("user_id", userId);

  if (error) throw new Error(error.message);

  return (data ?? []).reduce<TaskStats>(
    (stats, task) => {
      stats.total += 1;
      if (task.completed) stats.completed += 1;
      else {
        stats.active += 1;
        if (task.priority === "high") stats.highPriority += 1;
      }
      return stats;
    },
    { total: 0, completed: 0, active: 0, highPriority: 0 },
  );
}

export async function createTask(
  supabase: TaskSupabaseClient,
  userId: string,
  input: CreateTaskInput,
): Promise<Task> {
  const { data, error } = await supabase
    .from("tasks")
    .insert({
      user_id: userId,
      title: input.title.trim(),
      description: input.description?.trim() ?? "",
      priority: input.priority ?? "medium",
      due_date: input.dueDate?.trim() || null,
    })
    .select("id, user_id, title, description, priority, completed, due_date, created_at, updated_at")
    .single();

  if (error || !data) throw new Error(error?.message ?? "Gagal membuat tugas.");
  return mapRow(data as TaskRow);
}

export async function updateTask(
  supabase: TaskSupabaseClient,
  userId: string,
  id: string,
  patch: UpdateTaskInput,
): Promise<Task | null> {
  const updates: Record<string, string | boolean | null> = {};
  if (patch.title !== undefined) updates.title = patch.title.trim();
  if (patch.description !== undefined) updates.description = patch.description.trim();
  if (patch.priority !== undefined) updates.priority = patch.priority;
  if (patch.dueDate !== undefined) updates.due_date = patch.dueDate?.trim() || null;
  if (patch.completed !== undefined) updates.completed = patch.completed;

  if (Object.keys(updates).length === 0) return getTask(supabase, userId, id);

  const { data, error } = await supabase
    .from("tasks")
    .update(updates)
    .eq("user_id", userId)
    .eq("id", id)
    .select("id, user_id, title, description, priority, completed, due_date, created_at, updated_at")
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data ? mapRow(data as TaskRow) : null;
}

export async function deleteTask(
  supabase: TaskSupabaseClient,
  userId: string,
  id: string,
): Promise<boolean> {
  const { data, error } = await supabase
    .from("tasks")
    .delete()
    .eq("user_id", userId)
    .eq("id", id)
    .select("id");

  if (error) throw new Error(error.message);
  return (data?.length ?? 0) > 0;
}

export async function deleteCompletedTasks(
  supabase: TaskSupabaseClient,
  userId: string,
): Promise<number> {
  const { data, error } = await supabase
    .from("tasks")
    .delete()
    .eq("user_id", userId)
    .eq("completed", true)
    .select("id");

  if (error) throw new Error(error.message);
  return data?.length ?? 0;
}
