import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { deleteTask, getTask, updateTask } from "@/lib/tasks";
import { fieldErrorsFrom, taskPatchSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

function parseId(raw: string): number | null {
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
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

  const task = getTask(id);
  return task ? NextResponse.json({ data: task }) : notFound();
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

  const task = updateTask(id, parsed.data);
  if (!task) return notFound();

  revalidatePath("/");
  return NextResponse.json({ data: task });
}

/** DELETE /api/tasks/:id */
export async function DELETE(_request: Request, { params }: RouteContext) {
  const { id: rawId } = await params;
  const id = parseId(rawId);

  if (id === null) {
    return NextResponse.json({ error: "ID tidak valid." }, { status: 400 });
  }

  const deleted = deleteTask(id);
  if (!deleted) return notFound();

  revalidatePath("/");
  return new NextResponse(null, { status: 204 });
}
