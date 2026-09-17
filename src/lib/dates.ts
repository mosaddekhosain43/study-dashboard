// Date helpers — all dates are local "yyyy-mm-dd" keys (local app, single user).

export function dateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function todayKey(): string {
  return dateKey(new Date());
}

export function parseKey(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(key: string, days: number): string {
  const d = parseKey(key);
  d.setDate(d.getDate() + days);
  return dateKey(d);
}

export function diffDays(a: string, b: string): number {
  // b - a in days
  return Math.round(
    (parseKey(b).getTime() - parseKey(a).getTime()) / 86_400_000,
  );
}

/** Week starts on Saturday (Bangladesh study week). */
export function startOfWeek(key: string): string {
  const d = parseKey(key);
  const day = d.getDay(); // 6 = Saturday
  const offset = (day + 1) % 7; // days since Saturday
  d.setDate(d.getDate() - offset);
  return dateKey(d);
}

export function weekDates(weekStart: string): string[] {
  return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
}

const BN_DIGITS = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
export function toBnDigits(n: number | string): string {
  return String(n).replace(/[0-9]/g, (c) => BN_DIGITS[Number(c)]);
}

export function formatMinutes(mins: number): string {
  if (mins <= 0) return "0m";
  const h = Math.floor(mins / 60);
  const m = Math.round(mins % 60);
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

export function formatLong(key: string): string {
  const d = parseKey(key);
  return d.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatDayLabel(key: string): string {
  const t = todayKey();
  if (key === t) return "Today";
  if (key === addDays(t, -1)) return "Yesterday";
  if (key === addDays(t, 1)) return "Tomorrow";
  const d = parseKey(key);
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

export function relativeDay(key: string): string {
  const t = todayKey();
  const diff = diffDays(key, t);
  if (diff === 0) return "today";
  if (diff === 1) return "yesterday";
  if (diff > 1) return `${diff} days ago`;
  if (diff === -1) return "tomorrow";
  return `in ${-diff} days`;
}

export function examDefaults(): { examDate: string; targetDate: string } {
  const now = new Date();
  // Test exam is in January — default to the upcoming 10 January.
  let year = now.getFullYear();
  const jan10ThisYear = new Date(year, 0, 10);
  if (now > jan10ThisYear) year += 1;
  const exam = dateKey(new Date(year, 0, 10));
  const target = dateKey(new Date(year - 1, 11, 15)); // 15 December before it
  return { examDate: exam, targetDate: target };
}
