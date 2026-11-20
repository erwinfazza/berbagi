import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import {
  fieldErrorsFrom,
  parseTaskFilter,
  taskInputSchema,
} from "@/lib/validation";
import { createTask, listTasks } from "@/lib/tasks";

export const dynamic = "force-dynamic";

/**
 * GET /api/tasks?status=all|active|completed&priority=low|medium|high&q=cari
 * Mengembalikan daftar tugas sesuai filter.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const filter = parseTaskFilter({
    status: searchParams.get("status"),
    priority: searchParams.get("priority"),
    q: searchParams.get("q"),
  });

  const tasks = listTasks(filter);

  return NextResponse.json({
    data: tasks,
    meta: { count: tasks.length, filter },
  });
}

/**
 * POST /api/tasks
 * Body: { title, description?, priority?, dueDate? }
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Body request harus berupa JSON yang valid." },
      { status: 400 },
    );
  }

  const parsed = taskInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Data tugas tidak valid.",
        fieldErrors: fieldErrorsFrom(parsed.error),
      },
      { status: 422 },
    );
  }

  const task = createTask(parsed.data);
  revalidatePath("/");

  return NextResponse.json(
    { data: task },
    { status: 201, headers: { Location: `/api/tasks/${task.id}` } },
  );
}
