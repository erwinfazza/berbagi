export const PRIORITIES = ["low", "medium", "high"] as const;

export type Priority = (typeof PRIORITIES)[number];

export type Task = {
  id: number;
  title: string;
  description: string;
  priority: Priority;
  completed: boolean;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
};

export type TaskFilter = {
  status: "all" | "active" | "completed";
  priority: Priority | "all";
  q: string;
};

export type TaskStats = {
  total: number;
  completed: number;
  active: number;
  highPriority: number;
};

export const PRIORITY_META: Record<
  Priority,
  { label: string; badge: string; dot: string; rank: number }
> = {
  high: {
    label: "Tinggi",
    badge:
      "bg-rose-50 text-rose-700 ring-rose-200 dark:bg-rose-500/10 dark:text-rose-300 dark:ring-rose-500/25",
    dot: "bg-rose-500",
    rank: 0,
  },
  medium: {
    label: "Sedang",
    badge:
      "bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-500/25",
    dot: "bg-amber-500",
    rank: 1,
  },
  low: {
    label: "Rendah",
    badge:
      "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/25",
    dot: "bg-emerald-500",
    rank: 2,
  },
};
