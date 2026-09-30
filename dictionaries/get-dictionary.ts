import "server-only";
import type { Locale } from "@/lib/i18n";

// Sin `satisfies`: el contexto `Promise<unknown>` degradaba el tipo inferido de los JSON.
// Indexar con `Locale` ya obliga a que exista un loader por cada idioma.
const loaders = {
  en: () => import("./en.json").then((m) => m.default),
  es: () => import("./es.json").then((m) => m.default),
};

export type Dictionary = Awaited<ReturnType<typeof loaders.en>>;

export const getDictionary = (locale: Locale): Promise<Dictionary> => loaders[locale]();
