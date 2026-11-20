import { z } from "zod";
import { PRIORITIES, type Priority, type TaskFilter } from "./types";

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

function isValidIsoDate(value: string): boolean {
  if (!ISO_DATE.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

const dueDateSchema = z
  .union([z.literal(""), z.null(), z.string()])
  .transform((value) => (value ? value.trim() : null))
  .refine((value) => value === null || isValidIsoDate(value), {
    message: "Tanggal tidak valid (gunakan format YYYY-MM-DD).",
  });

const titleSchema = z
  .string()
  .trim()
  .min(1, "Judul tugas wajib diisi.")
  .max(120, "Judul maksimal 120 karakter.");

const descriptionSchema = z
  .string()
  .trim()
  .max(500, "Deskripsi maksimal 500 karakter.");

export const taskInputSchema = z.object({
  title: titleSchema,
  description: descriptionSchema.default(""),
  priority: z.enum(PRIORITIES).default("medium"),
  dueDate: dueDateSchema.default(null),
});

export const taskPatchSchema = z
  .object({
    title: titleSchema.optional(),
    description: descriptionSchema.optional(),
    priority: z.enum(PRIORITIES).optional(),
    dueDate: dueDateSchema.optional(),
    completed: z.boolean().optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "Tidak ada perubahan yang dikirim.",
  });

export type TaskInput = z.infer<typeof taskInputSchema>;
export type TaskPatch = z.infer<typeof taskPatchSchema>;

function asString(value: FormDataEntryValue | null): string {
  return typeof value === "string" ? value : "";
}

/** Ambil data form mentah lalu biarkan zod yang memvalidasi. */
export function formDataToTaskInput(formData: FormData) {
  return {
    title: asString(formData.get("title")),
    description: asString(formData.get("description")),
    priority: asString(formData.get("priority")) || "medium",
    dueDate: asString(formData.get("dueDate")),
  };
}

export function fieldErrorsFrom(error: z.ZodError): Record<string, string> {
  const fieldErrors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    if (!fieldErrors[key]) fieldErrors[key] = issue.message;
  }
  return fieldErrors;
}

export function parseTaskFilter(input: {
  status?: string | null;
  priority?: string | null;
  q?: string | null;
}): TaskFilter {
  const status =
    input.status === "active" || input.status === "completed"
      ? input.status
      : "all";

  const priority: Priority | "all" = (PRIORITIES as readonly string[]).includes(
    input.priority ?? "",
  )
    ? (input.priority as Priority)
    : "all";

  return {
    status,
    priority,
    q: (input.q ?? "").trim().slice(0, 120),
  };
}
