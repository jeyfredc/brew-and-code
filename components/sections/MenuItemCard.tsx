import Image from "next/image";
import { Badge } from "@/components/ui/Badge";
import { menuImageSrc, type MenuItem } from "@/data/menu";
import type { Dictionary } from "@/dictionaries/get-dictionary";
import { formatPrice } from "@/lib/format";
import type { Locale } from "@/lib/i18n";

export function MenuItemCard({ item, lang, dict }: { item: MenuItem; lang: Locale; dict: Dictionary }) {
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-md bg-surface">
      <div className="relative aspect-[4/3]">
        <Image
          src={menuImageSrc(item)}
          alt={item.name[lang]}
          fill
          sizes="(min-width: 1024px) 360px, (min-width: 640px) 50vw, 100vw"
          className="object-cover"
        />
        {item.badge && (
          <div className="absolute left-3 top-3">
            <Badge kind={item.badge} label={dict.badges[item.badge]} />
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-5">
        <div className="flex items-baseline justify-between gap-4">
          <h3 className="font-display text-xl font-bold">{item.name[lang]}</h3>
          <p className="shrink-0 font-display text-lg font-bold text-price">{formatPrice(item.priceGbp, lang)}</p>
        </div>
        <p className="text-sm text-muted">{item.description[lang]}</p>
      </div>
    </article>
  );
}
