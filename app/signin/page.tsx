import SignIn from "./signin";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const metadata = { title: "Sign in" };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function safeNextPath(value: string | undefined): string {
  return value?.startsWith("/") && !value.startsWith("//") ? value : "/files";
}

export default async function SignInPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  return (
    <SignIn
      nextPath={safeNextPath(first(params.next))}
      registered={first(params.registered) === "1"}
      configured={isSupabaseConfigured()}
    />
  );
}
