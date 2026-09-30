export const locales = ["en", "es"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";

export function hasLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

/** Elige el idioma soportado con mayor prioridad en Accept-Language. */
export function pickLocale(acceptLanguage: string | null): Locale {
  if (!acceptLanguage) return defaultLocale;
  const ranked = acceptLanguage
    .split(",")
    .map((part) => {
      const [tag, ...params] = part.trim().split(";");
      const q = params.map((p) => p.trim()).find((p) => p.startsWith("q="));
      const weight = q ? Number(q.slice(2)) : 1;
      return {
        base: tag.trim().toLowerCase().split("-")[0],
        weight: Number.isNaN(weight) ? 0 : weight,
      };
    })
    .filter((entry) => entry.base && entry.weight > 0)
    .sort((a, b) => b.weight - a.weight);
  for (const { base } of ranked) {
    if (hasLocale(base)) return base;
  }
  return defaultLocale;
}

/** "/en/menu" + "es" → "/es/menu". Funciona también sin prefijo. */
export function switchLocalePath(pathname: string, target: Locale): string {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length > 0 && hasLocale(segments[0])) segments.shift();
  return "/" + [target, ...segments].join("/");
}
