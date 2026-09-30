import type { Metadata } from "next";
import { Bricolage_Grotesque, Figtree, Geist_Mono } from "next/font/google";
import { notFound } from "next/navigation";
import { Footer } from "@/components/layout/Footer";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { getDictionary } from "@/dictionaries/get-dictionary";
import { hasLocale, locales } from "@/lib/i18n";
import { siteUrl } from "@/lib/site";
import "../globals.css";

const bricolage = Bricolage_Grotesque({ variable: "--font-bricolage", subsets: ["latin"], weight: ["700", "800"] });
const figtree = Figtree({ variable: "--font-figtree", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const dynamicParams = false;

export const metadata: Metadata = { metadataBase: new URL(siteUrl) };

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export default async function RootLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);

  return (
    <html
      lang={lang}
      className={`${bricolage.variable} ${figtree.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-foreground focus:px-4 focus:py-2 focus:text-background"
        >
          {dict.skipToContent}
        </a>
        <SiteHeader lang={lang} dict={dict} />
        {children}
        <Footer lang={lang} dict={dict} />
      </body>
    </html>
  );
}
