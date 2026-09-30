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
