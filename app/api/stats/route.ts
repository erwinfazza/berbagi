import { NextResponse } from "next/server";
import { getStats, getTaskContext, TaskAuthRequiredError } from "@/lib/tasks";

export const dynamic = "force-dynamic";

/** GET /api/stats — ringkasan jumlah tugas. */
export async function GET() {
  try {
    const { supabase, user } = await getTaskContext();
    return NextResponse.json({ data: await getStats(supabase, user.id) });
  } catch (error) {
    if (error instanceof TaskAuthRequiredError) {
      return NextResponse.json({ error: "Silakan sign in untuk melihat statistik." }, { status: 401 });
    }
    console.error("[GET /api/stats]", error);
    return NextResponse.json({ error: "Statistik gagal dimuat." }, { status: 500 });
  }
}
