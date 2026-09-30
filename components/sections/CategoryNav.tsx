import { Container } from "@/components/ui/Container";
import { ProductDisc } from "@/components/ui/ProductDisc";
import { categoryTone } from "@/components/ui/tones";
import type { CategoryId } from "@/data/menu";
import type { Dictionary } from "@/dictionaries/get-dictionary";

export function CategoryNav({ dict, categories }: { dict: Dictionary; categories: CategoryId[] }) {
  return (
    <nav aria-label={dict.menu.jumpTo} className="border-b border-line">
      <Container>
        <ul className="flex gap-6 overflow-x-auto py-6 sm:gap-10">
          {categories.map((category) => (
            <li key={category} className="shrink-0">
              <a href={`#${category}`} className="flex w-24 flex-col items-center gap-2 text-center text-sm font-semibold hover:underline">
                <ProductDisc src={`/images/categories/${category}.jpg`} alt="" tone={categoryTone[category]} size="sm" />
                {dict.categories[category]}
              </a>
            </li>
          ))}
        </ul>
      </Container>
    </nav>
  );
}
