import type { Locale } from "@/lib/i18n";
import { LONDON_TZ } from "@/lib/london-time";

export const intlLocale: Record<Locale, string> = { en: "en-GB", es: "es-ES" };

export function formatPrice(amount: number, locale: Locale): string {
  return new Intl.NumberFormat(intlLocale[locale], {
    style: "currency",
    currency: "GBP",
    currencyDisplay: "narrowSymbol", // en es-ES el símbolo por defecto sería "GBP"
  }).format(amount);
}

export function formatEventDate(date: Date, locale: Locale): string {
  return new Intl.DateTimeFormat(intlLocale[locale], {
    weekday: "long", day: "numeric", month: "long", timeZone: LONDON_TZ,
  }).format(date);
}

export function formatEventTime(start: Date, end: Date, locale: Locale): string {
  const f = new Intl.DateTimeFormat(intlLocale[locale], {
    hour: "2-digit", minute: "2-digit", hourCycle: "h23", timeZone: LONDON_TZ,
  });
  return `${f.format(start)} – ${f.format(end)}`;
}

/** Nombre de día abreviado; 0 = domingo. Se calcula en UTC para no depender de la zona del servidor. */
export function formatDayRange(days: number[], locale: Locale): string {
  const f = new Intl.DateTimeFormat(intlLocale[locale], { weekday: "short", timeZone: "UTC" });
  const name = (day: number) => f.format(new Date(Date.UTC(2026, 0, 4 + day))); // 4 ene 2026 es domingo
  return days.length === 1 ? name(days[0]) : `${name(days[0])} – ${name(days[days.length - 1])}`;
}

export function formatIsoDate(iso: string, locale: Locale): string {
  return new Intl.DateTimeFormat(intlLocale[locale], {
    weekday: "long", day: "numeric", month: "long", timeZone: "UTC",
  }).format(new Date(`${iso}T12:00:00Z`));
}
