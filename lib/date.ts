const DAY_MS = 86_400_000;

function toUtcDate(isoDate: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate);
  if (!match) return null;
  const [, year, month, day] = match;
  const date = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
  return Number.isNaN(date.getTime()) ? null : date;
}

/** Tanggal hari ini (zona waktu lokal) dalam format YYYY-MM-DD. */
export function todayISO(): string {
  const now = new Date();
  const offsetMs = now.getTimezoneOffset() * 60_000;
  return new Date(now.getTime() - offsetMs).toISOString().slice(0, 10);
}

export function formatFullDate(isoDate: string): string {
  const date = toUtcDate(isoDate);
  if (!date) return isoDate;
  return new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export function formatShortDate(isoDate: string): string {
  const date = toUtcDate(isoDate);
  if (!date) return isoDate;
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export type DueInfo = {
  label: string;
  tone: "overdue" | "today" | "soon" | "normal";
};

/** Label tenggat yang ramah dibaca, mis. "Hari ini", "Besok", "Terlambat 2 hari". */
export function describeDueDate(isoDate: string): DueInfo {
  const date = toUtcDate(isoDate);
  if (!date) return { label: isoDate, tone: "normal" };

  const today = toUtcDate(todayISO());
  if (!today) return { label: formatShortDate(isoDate), tone: "normal" };

  const diffDays = Math.round((date.getTime() - today.getTime()) / DAY_MS);

  if (diffDays < 0) {
    return {
      label: diffDays === -1 ? "Terlambat 1 hari" : `Terlambat ${Math.abs(diffDays)} hari`,
      tone: "overdue",
    };
  }
  if (diffDays === 0) return { label: "Hari ini", tone: "today" };
  if (diffDays === 1) return { label: "Besok", tone: "soon" };
  if (diffDays <= 6) return { label: `${diffDays} hari lagi`, tone: "soon" };
  return { label: formatShortDate(isoDate), tone: "normal" };
}
