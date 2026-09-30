import type { MetadataRoute } from "next";
import { locales } from "@/lib/i18n";
import { siteUrl } from "@/lib/site";

const paths = ["", "/menu", "/about"];

export default function sitemap(): MetadataRoute.Sitemap {
  return locales.flatMap((lang) =>
    paths.map((path) => ({
      url: `${siteUrl}/${lang}${path}`,
      alternates: { languages: Object.fromEntries(locales.map((l) => [l, `${siteUrl}/${l}${path}`])) },
    })),
  );
}
