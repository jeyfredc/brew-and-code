export const LONDON_TZ = "Europe/London";

const formatter = new Intl.DateTimeFormat("en-GB", {
  timeZone: LONDON_TZ,
  year: "numeric", month: "2-digit", day: "2-digit",
  hour: "2-digit", minute: "2-digit",
  hourCycle: "h23",
});

export interface LondonParts { year: number; month: number; day: number; hour: number; minute: number }

/** Componentes de fecha y hora de un instante, vistos desde Londres. */
export function londonParts(date: Date): LondonParts {
  const parts: Record<string, string> = {};
  for (const p of formatter.formatToParts(date)) parts[p.type] = p.value;
  return {
    year: Number(parts.year), month: Number(parts.month), day: Number(parts.day),
    hour: Number(parts.hour), minute: Number(parts.minute),
  };
}

/** Instante (UTC) que corresponde a una hora local de Londres, con GMT/BST correcto. */
export function londonLocalToDate(year: number, month: number, day: number, hour: number, minute: number): Date {
  const wanted = Date.UTC(year, month - 1, day, hour, minute);
  let guess = wanted;
  for (let i = 0; i < 2; i++) {
    const p = londonParts(new Date(guess));
    guess += wanted - Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute);
  }
  return new Date(guess);
}

const pad = (n: number) => String(n).padStart(2, "0");

export function londonToday(now: Date): string {
  const p = londonParts(now);
  return `${p.year}-${pad(p.month)}-${pad(p.day)}`;
}

export function londonTimeOfDay(now: Date): string {
  const p = londonParts(now);
  return `${pad(p.hour)}:${pad(p.minute)}`;
}

export function addDays(iso: string, days: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + days)).toISOString().slice(0, 10);
}
