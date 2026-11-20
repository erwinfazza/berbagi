import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getSupabasePublicConfig } from "./config";

export async function createClient() {
  const config = getSupabasePublicConfig();

  if (!config) {
    throw new Error("Konfigurasi Supabase belum lengkap. Isi URL dan publishable key di .env.local.");
  }

  const cookieStore = await cookies();

  return createServerClient(config.url, config.key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Server Components tidak dapat menulis cookie; proxy.ts memperbarui sesi.
        }
      },
    },
  });
}
