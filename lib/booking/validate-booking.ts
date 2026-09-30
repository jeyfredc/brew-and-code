import { addDays, londonTimeOfDay, londonToday } from "@/lib/london-time";
import { openingHours } from "./opening-hours";

export const MAX_PARTY_SIZE = 12;
export const MAX_DAYS_AHEAD = 60;
const LAST_SLOT_BEFORE_CLOSE_MINUTES = 30;

export interface BookingInput { name: string; partySize: string; date: string; time: string }
export type BookingField = keyof BookingInput;
export type BookingErrorCode =
  | "nameLength" | "partySizeRange" | "dateInvalid" | "datePast" | "dateTooFar"
  | "timeInvalid" | "timeClosed" | "timePast";
export type BookingErrors = Partial<Record<BookingField, BookingErrorCode>>;
export interface Booking { name: string; partySize: number; date: string; time: string }
export type BookingResult = { ok: true; value: Booking } | { ok: false; errors: BookingErrors };

const toMinutes = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};

function isRealDate(iso: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return false;
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  return date.getUTCFullYear() === y && date.getUTCMonth() === m - 1 && date.getUTCDate() === d;
}

/** Validación pura; `now` se inyecta para poder probar fechas. Reutilizable en servidor. */
export function validateBooking(input: BookingInput, now: Date): BookingResult {
  const errors: BookingErrors = {};

  const name = input.name.trim();
  if (name.length < 2 || name.length > 60) errors.name = "nameLength";

  const sizeText = input.partySize.trim();
  const partySize = /^\d+$/.test(sizeText) ? Number(sizeText) : Number.NaN;
  if (!(partySize >= 1 && partySize <= MAX_PARTY_SIZE)) errors.partySize = "partySizeRange";

  const today = londonToday(now);
  const dateOk = isRealDate(input.date);
  if (!dateOk) errors.date = "dateInvalid";
  else if (input.date < today) errors.date = "datePast";
  else if (input.date > addDays(today, MAX_DAYS_AHEAD)) errors.date = "dateTooFar";

  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(input.time)) {
    errors.time = "timeInvalid";
  } else if (dateOk) {
    const hours = openingHours[new Date(`${input.date}T00:00:00Z`).getUTCDay()];
    const minutes = toMinutes(input.time);
    if (minutes < toMinutes(hours.open) || minutes > toMinutes(hours.close) - LAST_SLOT_BEFORE_CLOSE_MINUTES) {
      errors.time = "timeClosed";
    } else if (input.date === today && minutes <= toMinutes(londonTimeOfDay(now))) {
      errors.time = "timePast";
    }
  }

  if (Object.keys(errors).length > 0) return { ok: false, errors };
  return { ok: true, value: { name, partySize, date: input.date, time: input.time } };
}
