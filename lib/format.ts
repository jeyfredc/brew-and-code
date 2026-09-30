import type { Locale } from "@/lib/i18n";

export const intlLocale: Record<Locale, string> = { en: "en-GB", es: "es-ES" };

export function formatPrice(amount: number, locale: Locale): string {
  return new Intl.NumberFormat(intlLocale[locale], {
    style: "currency",
    currency: "GBP",
    currencyDisplay: "narrowSymbol", // en es-ES el símbolo por defecto sería "GBP"
  }).format(amount);
}
