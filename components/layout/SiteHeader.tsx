import { Container } from "@/components/ui/Container";
import type { Dictionary } from "@/dictionaries/get-dictionary";
import type { Locale } from "@/lib/i18n";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { Logo } from "./Logo";
import { NavLinks } from "./NavLinks";

export function SiteHeader({ lang, dict }: { lang: Locale; dict: Dictionary }) {
  return (
    <header className="border-b border-line bg-background">
      <Container className="flex flex-wrap items-center justify-between gap-x-6 gap-y-1 py-3">
        <Logo lang={lang} homeLabel={dict.nav.home} />
        <div className="order-last w-full sm:order-none sm:w-auto">
          <NavLinks
            lang={lang}
            label={dict.nav.label}
            links={[
              { path: "", label: dict.nav.home },
              { path: "/menu", label: dict.nav.menu },
              { path: "/about", label: dict.nav.about },
            ]}
          />
        </div>
        <LanguageSwitcher lang={lang} label={dict.language.label} names={{ en: dict.language.en, es: dict.language.es }} />
      </Container>
    </header>
  );
}
