"use server";

import { revalidatePath } from "next/cache";
import type { ActionState } from "@/lib/action-state";
import {
  createTask,
  deleteCompletedTasks,
  deleteTask,
  updateTask,
} from "@/lib/tasks";
import {
  fieldErrorsFrom,
  formDataToTaskInput,
  taskInputSchema,
} from "@/lib/validation";

function isValidId(id: number): boolean {
  return Number.isInteger(id) && id > 0;
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
    const task = createTask(parsed.data);
    revalidatePath("/");
    return {
      status: "success",
      message: `Tugas “${task.title}” berhasil ditambahkan.`,
      fieldErrors: {},
    };
  } catch (error) {
    console.error("[createTaskAction]", error);
    return {
      status: "error",
      message: "Tugas gagal disimpan. Coba lagi.",
      fieldErrors: {},
    };
  }
}

export async function toggleTaskAction(
  id: number,
  completed: boolean,
): Promise<ActionState> {
  if (!isValidId(id)) {
    return { status: "error", message: "Tugas tidak ditemukan.", fieldErrors: {} };
  }

  try {
    const task = updateTask(id, { completed });
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
    console.error("[toggleTaskAction]", error);
    return {
      status: "error",
      message: "Status tugas gagal diubah.",
      fieldErrors: {},
    };
  }
}

export async function deleteTaskAction(id: number): Promise<ActionState> {
  if (!isValidId(id)) {
    return { status: "error", message: "Tugas tidak ditemukan.", fieldErrors: {} };
  }

  try {
    const deleted = deleteTask(id);
    if (!deleted) {
      return { status: "error", message: "Tugas tidak ditemukan.", fieldErrors: {} };
    }
    revalidatePath("/");
    return { status: "success", message: "Tugas dihapus.", fieldErrors: {} };
  } catch (error) {
    console.error("[deleteTaskAction]", error);
    return { status: "error", message: "Tugas gagal dihapus.", fieldErrors: {} };
  }
}

export async function clearCompletedAction(): Promise<ActionState> {
  try {
    const count = deleteCompletedTasks();
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
    console.error("[clearCompletedAction]", error);
    return {
      status: "error",
      message: "Gagal membersihkan tugas selesai.",
      fieldErrors: {},
    };
  }
}
