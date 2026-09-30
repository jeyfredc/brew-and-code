import { addDays, londonLocalToDate, londonToday } from "@/lib/london-time";

export type EventId = "openMic" | "tasting";

interface EventRule {
  id: EventId;
  weekday: number; // 0 = domingo … 6 = sábado
  hour: number;
  minute: number;
  durationMinutes: number;
}

// PLACEHOLDER: días y horas de ejemplo hasta confirmar los reales.
export const eventRules: readonly EventRule[] = [
  { id: "openMic", weekday: 5, hour: 17, minute: 30, durationMinutes: 150 }, // viernes 17:30–20:00
  { id: "tasting", weekday: 6, hour: 10, minute: 0, durationMinutes: 90 }, // sábado 10:00–11:30
];

export interface EventOccurrence { id: EventId; startsAt: Date; endsAt: Date }

const SEARCH_DAYS = 28;

/** Próximas ocurrencias (incluye la que está en curso), calculadas en hora de Londres. */
export function getUpcomingEvents(now: Date, count: number): EventOccurrence[] {
  const today = londonToday(now);
  const found: EventOccurrence[] = [];
  for (let offset = 0; offset < SEARCH_DAYS; offset++) {
    const [year, month, day] = addDays(today, offset).split("-").map(Number);
    const weekday = new Date(Date.UTC(year, month - 1, day)).getUTCDay();
    for (const rule of eventRules) {
      if (rule.weekday !== weekday) continue;
      const startsAt = londonLocalToDate(year, month, day, rule.hour, rule.minute);
      const endsAt = new Date(startsAt.getTime() + rule.durationMinutes * 60_000);
      if (endsAt > now) found.push({ id: rule.id, startsAt, endsAt });
    }
  }
  found.sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime());
  return found.slice(0, Math.max(0, count));
}
