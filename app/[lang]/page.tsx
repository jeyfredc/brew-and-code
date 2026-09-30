import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Hero } from "@/components/sections/Hero";
import { PopularItems } from "@/components/sections/PopularItems";
import { UpcomingEvents } from "@/components/sections/UpcomingEvents";
import { getUpcomingEvents } from "@/data/events";
import { getFeatured, getMenu } from "@/data/menu";
import { getDictionary } from "@/dictionaries/get-dictionary";
import { hasLocale } from "@/lib/i18n";
import { cafeJsonLd, jsonLdString } from "@/lib/structured-data";
import { pageMetadata } from "@/lib/seo";

// Los próximos eventos dependen de la fecha: regenerar la página cada hora.
export const revalidate = 3600;

export async function generateMetadata({ params }: PageProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return pageMetadata({ lang, path: "", title: dict.meta.home.title, description: dict.meta.home.description });
}

export default async function HomePage({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);

  return (
    <main id="main">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(cafeJsonLd()) }} />
      <Hero lang={lang} dict={dict} />
      <PopularItems lang={lang} dict={dict} items={getFeatured(getMenu(), 4)} />
      <UpcomingEvents lang={lang} dict={dict} events={getUpcomingEvents(new Date(), 4)} />
    </main>
  );
}
