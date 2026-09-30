import type { Metadata } from "next";
import { locales, type Locale } from "@/lib/i18n";

export function pageMetadata({
  lang, path, title, description,
}: { lang: Locale; path: string; title: string; description: string }): Metadata {
  return {
    title,
    description,
    alternates: {
      canonical: `/${lang}${path}`,
      languages: Object.fromEntries(locales.map((l) => [l, `/${l}${path}`])),
    },
    openGraph: {
      title,
      description,
      type: "website",
      locale: lang === "es" ? "es_ES" : "en_GB",
      images: [{ url: "/images/hero.jpg", width: 1920, height: 1080 }],
    },
  };
}
