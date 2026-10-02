export interface DayHours { open: string; close: string }

/** 0 = domingo … 6 = sábado. PLACEHOLDER: horario de ejemplo hasta tener el real. */
export const openingHours: Record<number, DayHours> = {
  0: { open: "08:30", close: "16:00" },
  1: { open: "06:00", close: "20:00" },
  2: { open: "06:00", close: "20:00" },
  3: { open: "06:00", close: "20:00" },
  4: { open: "06:00", close: "20:00" },
  5: { open: "07:30", close: "21:30" },
  6: { open: "08:00", close: "17:00" },
};

export interface HoursGroup { days: number[]; open: string; close: string }

const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0];

/** Agrupa días consecutivos (lunes→domingo) con el mismo horario. */
export function groupOpeningHours(): HoursGroup[] {
  const groups: HoursGroup[] = [];
  for (const day of WEEK_ORDER) {
    const hours = openingHours[day];
    const last = groups.at(-1);
    if (last && last.open === hours.open && last.close === hours.close) last.days.push(day);
    else groups.push({ days: [day], open: hours.open, close: hours.close });
  }
  return groups;
}
