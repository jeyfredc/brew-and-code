import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { ProductDisc } from "@/components/ui/ProductDisc";
import { categoryTone } from "@/components/ui/tones";
import { menuImageSrc, type MenuItem } from "@/data/menu";
import type { Dictionary } from "@/dictionaries/get-dictionary";
import { formatPrice } from "@/lib/format";
import type { Locale } from "@/lib/i18n";

export function PopularItems({ lang, dict, items }: { lang: Locale; dict: Dictionary; items: MenuItem[] }) {
  return (
    <section aria-labelledby="popular-title" className="bg-surface py-16 lg:py-24">
      <Container>
        <h2 id="popular-title" className="font-display text-4xl font-extrabold">{dict.popular.title}</h2>
        <p className="mt-3 max-w-[40ch] text-lg text-muted">{dict.popular.intro}</p>
        <ul className="mt-10 grid gap-8 md:grid-cols-2">
          {items.map((item) => (
            <li key={item.id} className="flex items-center gap-5">
              <ProductDisc src={menuImageSrc(item)} alt={item.name[lang]} tone={categoryTone[item.category]} size="lg" />
              <div className="space-y-1">
                {item.badge && <Badge kind={item.badge} label={dict.badges[item.badge]} />}
                <h3 className="font-display text-xl font-bold">{item.name[lang]}</h3>
                <p className="font-display text-lg font-bold text-price">{formatPrice(item.priceGbp, lang)}</p>
              </div>
            </li>
          ))}
        </ul>
        <div className="mt-10">
          <ButtonLink href={`/${lang}/menu`} variant="primary">{dict.popular.viewAll}</ButtonLink>
        </div>
      </Container>
    </section>
  );
}
