import { NextResponse } from "next/server";
import { getStats } from "@/lib/tasks";

export const dynamic = "force-dynamic";

/** GET /api/stats — ringkasan jumlah tugas. */
export async function GET() {
  return NextResponse.json({ data: getStats() });
}
