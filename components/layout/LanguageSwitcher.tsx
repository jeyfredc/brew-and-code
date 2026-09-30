"use client";

import { usePathname } from "next/navigation";
import { locales, switchLocalePath, type Locale } from "@/lib/i18n";

export function LanguageSwitcher({
  lang, label, names,
}: { lang: Locale; label: string; names: Record<Locale, string> }) {
  const pathname = usePathname();
  return (
    <nav aria-label={label}>
      <ul className="flex gap-1">
        {locales.map((locale) => (
          <li key={locale}>
            {/* <a> y no <Link>: cambia el <html lang>, así que conviene una navegación completa */}
            <a
              href={switchLocalePath(pathname, locale)}
              hrefLang={locale}
              lang={locale}
              aria-current={locale === lang ? "true" : undefined}
              className="inline-flex min-h-11 items-center rounded-full px-3 text-sm font-semibold hover:bg-surface aria-[current=true]:bg-surface aria-[current=true]:underline aria-[current=true]:decoration-2 aria-[current=true]:decoration-naranja-fuerte aria-[current=true]:underline-offset-8"
            >
              {names[locale]}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
