import Link from "next/link";
import type { Locale } from "@/lib/i18n";

export function Logo({ lang, homeLabel }: { lang: Locale; homeLabel: string }) {
  return (
    <Link href={`/${lang}`} aria-label={`Brew and Co, ${homeLabel}`} className="inline-flex items-center gap-2">
      <span className="grid size-8 place-items-center rounded-full bg-foreground text-background">
        <svg viewBox="0 0 24 24" aria-hidden className="size-4">
          <path fill="currentColor" d="M6 8h12l-1.2 11a2 2 0 0 1-2 1.8H9.2a2 2 0 0 1-2-1.8L6 8Zm-1-3h14v2H5V5Z" />
        </svg>
      </span>
      <span className="font-display text-2xl font-extrabold tracking-tight">
        Brew <span className="text-naranja-fuerte">and</span> Co
      </span>
    </Link>
  );
}
