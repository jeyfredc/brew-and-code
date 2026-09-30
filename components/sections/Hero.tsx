import Image from "next/image";
import { BookingDialog } from "@/components/booking/BookingDialog";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import type { Dictionary } from "@/dictionaries/get-dictionary";
import type { Locale } from "@/lib/i18n";

export function Hero({ lang, dict }: { lang: Locale; dict: Dictionary }) {
  return (
    <section className="relative isolate flex min-h-[70vh] items-center overflow-hidden bg-espresso text-espuma">
      <Image src="/images/hero.jpg" alt="" fill priority sizes="100vw" className="-z-10 object-cover" />
      <div aria-hidden className="absolute inset-0 -z-10 bg-espresso/65" />
      <Container className="py-24">
        <h1 className="max-w-[16ch] font-display text-5xl font-extrabold">{dict.hero.title}</h1>
        <p className="mt-6 max-w-[34ch] text-lg text-espuma/90">{dict.hero.subtitle}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <BookingDialog labels={dict.booking} lang={lang} variant="accent" />
          <ButtonLink href={`/${lang}/menu`} variant="light" size="lg">{dict.hero.viewMenu}</ButtonLink>
        </div>
      </Container>
    </section>
  );
}
