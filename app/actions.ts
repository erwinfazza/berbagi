"use server";

import { revalidatePath } from "next/cache";
import type { ActionState } from "@/lib/action-state";
import {
  createTask,
  deleteCompletedTasks,
  deleteTask,
  getTaskContext,
  TaskAuthRequiredError,
  updateTask,
} from "@/lib/tasks";
import {
  fieldErrorsFrom,
  formDataToTaskInput,
  taskInputSchema,
} from "@/lib/validation";

function isValidId(id: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
}

export async function createTaskAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = taskInputSchema.safeParse(formDataToTaskInput(formData));

  if (!parsed.success) {
    return {
      status: "error",
      message: "Periksa kembali data tugas.",
      fieldErrors: fieldErrorsFrom(parsed.error),
    };
  }

  try {
    const { supabase, user } = await getTaskContext();
    const task = await createTask(supabase, user.id, parsed.data);
    revalidatePath("/");
    return {
      status: "success",
      message: `Tugas “${task.title}” berhasil ditambahkan.`,
      fieldErrors: {},
    };
  } catch (error) {
    if (error instanceof TaskAuthRequiredError) {
      return { status: "error", message: "Silakan sign in untuk mengelola tugas.", fieldErrors: {} };
    }
    console.error("[createTaskAction]", error);
    return {
      status: "error",
      message: "Tugas gagal disimpan. Coba lagi.",
      fieldErrors: {},
    };
  }
}

export async function toggleTaskAction(
  id: string,
  completed: boolean,
): Promise<ActionState> {
  if (!isValidId(id)) {
    return { status: "error", message: "Tugas tidak ditemukan.", fieldErrors: {} };
  }

  try {
    const { supabase, user } = await getTaskContext();
    const task = await updateTask(supabase, user.id, id, { completed });
    if (!task) {
      return { status: "error", message: "Tugas tidak ditemukan.", fieldErrors: {} };
    }
    revalidatePath("/");
    return {
      status: "success",
      message: task.completed
        ? `“${task.title}” ditandai selesai.`
        : `“${task.title}” dibuka kembali.`,
      fieldErrors: {},
    };
  } catch (error) {
    if (error instanceof TaskAuthRequiredError) {
      return { status: "error", message: "Silakan sign in untuk mengelola tugas.", fieldErrors: {} };
    }
    console.error("[toggleTaskAction]", error);
    return {
      status: "error",
      message: "Status tugas gagal diubah.",
      fieldErrors: {},
    };
  }
}

export async function deleteTaskAction(id: string): Promise<ActionState> {
  if (!isValidId(id)) {
    return { status: "error", message: "Tugas tidak ditemukan.", fieldErrors: {} };
  }

  try {
    const { supabase, user } = await getTaskContext();
    const deleted = await deleteTask(supabase, user.id, id);
    if (!deleted) {
      return { status: "error", message: "Tugas tidak ditemukan.", fieldErrors: {} };
    }
    revalidatePath("/");
    return { status: "success", message: "Tugas dihapus.", fieldErrors: {} };
  } catch (error) {
    if (error instanceof TaskAuthRequiredError) {
      return { status: "error", message: "Silakan sign in untuk mengelola tugas.", fieldErrors: {} };
    }
    console.error("[deleteTaskAction]", error);
    return { status: "error", message: "Tugas gagal dihapus.", fieldErrors: {} };
  }
}

export async function clearCompletedAction(): Promise<ActionState> {
  try {
    const { supabase, user } = await getTaskContext();
    const count = await deleteCompletedTasks(supabase, user.id);
    revalidatePath("/");
    return {
      status: "success",
      message:
        count > 0
          ? `${count} tugas selesai dibersihkan.`
          : "Tidak ada tugas selesai untuk dibersihkan.",
      fieldErrors: {},
    };
  } catch (error) {
    if (error instanceof TaskAuthRequiredError) {
      return { status: "error", message: "Silakan sign in untuk mengelola tugas.", fieldErrors: {} };
    }
    console.error("[clearCompletedAction]", error);
    return {
      status: "error",
      message: "Gagal membersihkan tugas selesai.",
      fieldErrors: {},
    };
  }
}
