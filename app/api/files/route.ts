import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_FILE_SIZE = 50 * 1024 * 1024;
const MIME_TYPES: Record<string, string[]> = {
  docx: ["application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
  pdf: ["application/pdf"],
  jpg: ["image/jpeg"],
  jpeg: ["image/jpeg"],
  psd: ["image/vnd.adobe.photoshop", "application/vnd.adobe.photoshop", "application/photoshop", "image/x-photoshop"],
  png: ["image/png"],
  odt: ["application/vnd.oasis.opendocument.text"],
  xlsx: ["application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"],
  ppt: ["application/vnd.ms-powerpoint"],
  pptx: ["application/vnd.openxmlformats-officedocument.presentationml.presentation"],
};

export async function POST(request: Request) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return NextResponse.json({ error: "Supabase belum dikonfigurasi." }, { status: 503 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Silakan sign in untuk mengunggah file." }, { status: 401 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Form upload tidak valid." }, { status: 400 });
  }

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "Pilih file yang akan diunggah." }, { status: 400 });
  }
  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: "Ukuran maksimal file adalah 50 MB." }, { status: 413 });
  }

  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
  const acceptedMimeTypes = MIME_TYPES[extension];
  const mimeType = file.type.toLowerCase();
  if (!acceptedMimeTypes || !acceptedMimeTypes.includes(mimeType)) {
    return NextResponse.json({ error: "Format file tidak didukung atau MIME type tidak sesuai." }, { status: 415 });
  }

  const storagePath = `${user.id}/${crypto.randomUUID()}.${extension}`;
  const { error: uploadError } = await supabase.storage
    .from("user-files")
    .upload(storagePath, file, { contentType: mimeType, upsert: false });

  if (uploadError) {
    console.error("[file-upload] Storage upload failed", uploadError.message);
    return NextResponse.json({ error: "File gagal disimpan. Pastikan bucket user-files sudah dibuat." }, { status: 502 });
  }

  const { data: savedFile, error: metadataError } = await supabase
    .from("user_files")
    .insert({
      user_id: user.id,
      storage_path: storagePath,
      original_name: file.name,
      extension,
      mime_type: mimeType,
      size_bytes: file.size,
    })
    .select("id")
    .single();

  if (metadataError) {
    await supabase.storage.from("user-files").remove([storagePath]);
    console.error("[file-upload] Metadata insert failed", metadataError.message);
    return NextResponse.json({ error: "Metadata file gagal disimpan. Jalankan schema files.sql." }, { status: 502 });
  }

  return NextResponse.json({ data: { id: savedFile.id, name: file.name } }, { status: 201 });
}
