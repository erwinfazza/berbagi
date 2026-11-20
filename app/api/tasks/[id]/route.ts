import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import {
  deleteTask,
  getTask,
  getTaskContext,
  TaskAuthRequiredError,
  updateTask,
} from "@/lib/tasks";
import { fieldErrorsFrom, taskPatchSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

function parseId(raw: string): string | null {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(raw)
    ? raw
    : null;
}

function notFound() {
  return NextResponse.json({ error: "Tugas tidak ditemukan." }, { status: 404 });
}

/** GET /api/tasks/:id */
export async function GET(_request: Request, { params }: RouteContext) {
  const { id: rawId } = await params;
  const id = parseId(rawId);

  if (id === null) {
    return NextResponse.json({ error: "ID tidak valid." }, { status: 400 });
  }

  try {
    const { supabase, user } = await getTaskContext();
    const task = await getTask(supabase, user.id, id);
    return task ? NextResponse.json({ data: task }) : notFound();
  } catch (error) {
    if (error instanceof TaskAuthRequiredError) {
      return NextResponse.json({ error: "Silakan sign in untuk mengakses tugas." }, { status: 401 });
    }
    console.error("[GET /api/tasks/:id]", error);
    return NextResponse.json({ error: "Tugas gagal dimuat." }, { status: 500 });
  }
}

/** PATCH /api/tasks/:id — ubah sebagian field, termasuk `completed`. */
export async function PATCH(request: Request, { params }: RouteContext) {
  const { id: rawId } = await params;
  const id = parseId(rawId);

  if (id === null) {
    return NextResponse.json({ error: "ID tidak valid." }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Body request harus berupa JSON yang valid." },
      { status: 400 },
    );
  }

  const parsed = taskPatchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Data perubahan tidak valid.",
        fieldErrors: fieldErrorsFrom(parsed.error),
      },
      { status: 422 },
    );
  }

  try {
    const { supabase, user } = await getTaskContext();
    const task = await updateTask(supabase, user.id, id, parsed.data);
    if (!task) return notFound();

    revalidatePath("/");
    return NextResponse.json({ data: task });
  } catch (error) {
    if (error instanceof TaskAuthRequiredError) {
      return NextResponse.json({ error: "Silakan sign in untuk mengubah tugas." }, { status: 401 });
    }
    console.error("[PATCH /api/tasks/:id]", error);
    return NextResponse.json({ error: "Tugas gagal diubah." }, { status: 500 });
  }
}

/** DELETE /api/tasks/:id */
export async function DELETE(_request: Request, { params }: RouteContext) {
  const { id: rawId } = await params;
  const id = parseId(rawId);

  if (id === null) {
    return NextResponse.json({ error: "ID tidak valid." }, { status: 400 });
  }

  try {
    const { supabase, user } = await getTaskContext();
    const deleted = await deleteTask(supabase, user.id, id);
    if (!deleted) return notFound();

    revalidatePath("/");
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    if (error instanceof TaskAuthRequiredError) {
      return NextResponse.json({ error: "Silakan sign in untuk menghapus tugas." }, { status: 401 });
    }
    console.error("[DELETE /api/tasks/:id]", error);
    return NextResponse.json({ error: "Tugas gagal dihapus." }, { status: 500 });
  }
}
