import { Container } from "@/components/ui/Container";
import type { CategoryId, MenuItem } from "@/data/menu";
import type { Dictionary } from "@/dictionaries/get-dictionary";
import type { Locale } from "@/lib/i18n";
import { MenuItemCard } from "./MenuItemCard";

export function MenuSection({
  category, items, lang, dict,
}: { category: CategoryId; items: MenuItem[]; lang: Locale; dict: Dictionary }) {
  return (
    <section id={category} aria-labelledby={`${category}-title`} className="scroll-mt-6 py-12 lg:py-16">
      <Container>
        <h2 id={`${category}-title`} className="font-display text-4xl font-extrabold">{dict.categories[category]}</h2>
        <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <li key={item.id}><MenuItemCard item={item} lang={lang} dict={dict} /></li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
