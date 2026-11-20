import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import {
  fieldErrorsFrom,
  parseTaskFilter,
  taskInputSchema,
} from "@/lib/validation";
import {
  createTask,
  getTaskContext,
  listTasks,
  TaskAuthRequiredError,
} from "@/lib/tasks";

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

  try {
    const { supabase, user } = await getTaskContext();
    const tasks = await listTasks(supabase, user.id, filter);

    return NextResponse.json({
      data: tasks,
      meta: { count: tasks.length, filter },
    });
  } catch (error) {
    if (error instanceof TaskAuthRequiredError) {
      return NextResponse.json({ error: "Silakan sign in untuk mengakses tugas." }, { status: 401 });
    }
    console.error("[GET /api/tasks]", error);
    return NextResponse.json({ error: "Tugas gagal dimuat." }, { status: 500 });
  }
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

  try {
    const { supabase, user } = await getTaskContext();
    const task = await createTask(supabase, user.id, parsed.data);
    revalidatePath("/");

    return NextResponse.json(
      { data: task },
      { status: 201, headers: { Location: `/api/tasks/${task.id}` } },
    );
  } catch (error) {
    if (error instanceof TaskAuthRequiredError) {
      return NextResponse.json({ error: "Silakan sign in untuk membuat tugas." }, { status: 401 });
    }
    console.error("[POST /api/tasks]", error);
    return NextResponse.json({ error: "Tugas gagal disimpan." }, { status: 500 });
  }
}
