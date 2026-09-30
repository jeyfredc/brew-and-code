import { notFound } from "next/navigation";
import { getDictionary } from "@/dictionaries/get-dictionary";
import { hasLocale } from "@/lib/i18n";

export default async function HomePage({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  return (
    <main id="main" className="p-8">
      <h1 className="font-display text-5xl font-extrabold">{dict.hero.title}</h1>
    </main>
  );
}
