import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CategoryNav } from "@/components/sections/CategoryNav";
import { MenuSection } from "@/components/sections/MenuSection";
import { Container } from "@/components/ui/Container";
import { getMenu, groupByCategory } from "@/data/menu";
import { getDictionary } from "@/dictionaries/get-dictionary";
import { hasLocale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata({ params }: PageProps<"/[lang]/menu">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return pageMetadata({ lang, path: "/menu", title: dict.meta.menu.title, description: dict.meta.menu.description });
}

export default async function MenuPage({ params }: PageProps<"/[lang]/menu">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  const groups = groupByCategory(getMenu());

  return (
    <main id="main">
      <Container className="pb-8 pt-14 lg:pt-20">
        <h1 className="font-display text-5xl font-extrabold">{dict.menu.title}</h1>
        <p className="mt-4 max-w-[52ch] text-lg text-muted">{dict.menu.intro}</p>
      </Container>
      <CategoryNav dict={dict} categories={groups.map((g) => g.category)} />
      {groups.map((group) => (
        <MenuSection key={group.category} category={group.category} items={group.items} lang={lang} dict={dict} />
      ))}
    </main>
  );
}
