"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

export type AuthActionState = { error?: string };

const credentialsSchema = z.object({
  email: z.email("Masukkan email yang valid.").trim(),
  password: z.string().min(8, "Password minimal 8 karakter."),
});

function safeDestination(value: FormDataEntryValue | null): string {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//")) {
    return "/files";
  }
  return value;
}

function parseCredentials(formData: FormData) {
  return credentialsSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
}

export async function signInAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = parseCredentials(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data login tidak valid." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) return { error: "Email atau password salah." };

  redirect(safeDestination(formData.get("next")));
}

export async function signUpAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = parseCredentials(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data pendaftaran tidak valid." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp(parsed.data);
  if (error) return { error: "Akun gagal dibuat. Periksa email atau coba lagi." };

  if (!data.session) redirect("/signin?registered=1");
  redirect(safeDestination(formData.get("next")));
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/signin");
}
