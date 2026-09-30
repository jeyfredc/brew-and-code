import Image from "next/image";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BookingDialog } from "@/components/booking/BookingDialog";
import { Container } from "@/components/ui/Container";
import { getDictionary } from "@/dictionaries/get-dictionary";
import { hasLocale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata({ params }: PageProps<"/[lang]/about">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return pageMetadata({ lang, path: "/about", title: dict.meta.about.title, description: dict.meta.about.description });
}

export default async function AboutPage({ params }: PageProps<"/[lang]/about">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  const [lead, ...rest] = dict.about.paragraphs;

  return (
    <main id="main">
      <Container className="grid items-start gap-12 py-14 lg:grid-cols-2 lg:gap-16 lg:py-20">
        <div>
          <h1 className="font-display text-4xl font-extrabold">{dict.about.title}</h1>
          <div className="mt-8 max-w-[60ch] space-y-5 text-lg leading-relaxed">
            <p className="text-xl">{lead}</p>
            {rest.map((paragraph) => (
              <p key={paragraph} className="text-muted">{paragraph}</p>
            ))}
          </div>
          <p className="mt-8 max-w-[34ch] font-display text-2xl font-bold">{dict.about.closing}</p>
          <div className="mt-6">
            <BookingDialog labels={dict.booking} lang={lang} variant="accent" />
          </div>
        </div>
        <figure>
          {/* PLACEHOLDER: foto de stock; sustituir por una foto real de los fundadores. */}
          <div className="relative aspect-[4/5] overflow-hidden rounded-lg">
            <Image src="/images/about.jpg" alt={dict.about.imageAlt} fill priority sizes="(min-width: 1024px) 520px, 100vw" className="object-cover" />
          </div>
          <figcaption className="mt-3 text-sm text-muted">{dict.about.caption}</figcaption>
        </figure>
      </Container>
    </main>
  );
}
