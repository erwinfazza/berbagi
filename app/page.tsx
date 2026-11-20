import Link from "next/link";

import { getStats, listTasks } from "@/lib/tasks";
import { parseTaskFilter } from "@/lib/validation";

export const dynamic = "force-dynamic";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function first(value: string | string[] | undefined): string | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

const SECTION_TITLE = {
  all: "Semua tugas",
  active: "Tugas aktif",
  completed: "Tugas selesai",
} as const;

export default async function HomePage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const filter = parseTaskFilter({
    status: first(params.status),
    priority: first(params.priority),
    q: first(params.q),
  });

  const stats = getStats();
  const tasks = listTasks(filter);
  const isFiltered =
    filter.status !== "all" || filter.priority !== "all" || filter.q !== "";

  return (
    <>
      <main>
        <h1>Berbagi file apasaja untuk belajar</h1>
      </main>
    </>
  );
}
