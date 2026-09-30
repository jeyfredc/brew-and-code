import { groupOpeningHours } from "@/lib/booking/opening-hours";
import { siteInfo, siteUrl } from "@/lib/site";

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

/** PLACEHOLDER: usa los datos de ejemplo de lib/site.ts; no publicar hasta sustituirlos. */
export function cafeJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "CafeOrCoffeeShop" as const,
    name: siteInfo.name,
    url: siteUrl,
    image: `${siteUrl}/images/hero.jpg`,
    telephone: siteInfo.phone,
    servesCuisine: "Coffee",
    address: {
      "@type": "PostalAddress",
      streetAddress: siteInfo.streetAddress,
      addressLocality: siteInfo.locality,
      postalCode: siteInfo.postalCode,
      addressCountry: siteInfo.country,
    },
    openingHoursSpecification: groupOpeningHours().map((g) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: g.days.map((d) => DAY_NAMES[d]),
      opens: g.open,
      closes: g.close,
    })),
  };
}

/** Serializa para incrustar en <script type="application/ld+json"> sin permitir cerrar la etiqueta. */
export function jsonLdString(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
