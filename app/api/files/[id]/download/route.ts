import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: RouteContext) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase belum dikonfigurasi." }, { status: 503 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Silakan sign in untuk mengunduh file." }, { status: 401 });
  }

  const { id } = await params;
  const { data: file } = await supabase
    .from("user_files")
    .select("storage_path, original_name")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!file) return NextResponse.json({ error: "File tidak ditemukan." }, { status: 404 });

  const { data, error } = await supabase.storage
    .from("user-files")
    .createSignedUrl(file.storage_path, 60, { download: file.original_name });

  if (error || !data?.signedUrl) {
    return NextResponse.json({ error: "Link download gagal dibuat." }, { status: 502 });
  }

  const { error: countError } = await supabase.rpc("record_file_download", {
    p_file_id: id,
  });
  if (countError) {
    console.error("[file-download] Count update failed", countError.message);
    return NextResponse.json(
      { error: "Statistik download gagal diperbarui. Jalankan ulang supabase/files.sql." },
      { status: 502 },
    );
  }

  return NextResponse.redirect(data.signedUrl);
}
