"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Locale } from "@/lib/i18n";

export function NavLinks({
  lang, label, links,
}: { lang: Locale; label: string; links: { path: string; label: string }[] }) {
  const pathname = usePathname();
  return (
    <nav aria-label={label}>
      <ul className="flex gap-6">
        {links.map((link) => {
          const href = `/${lang}${link.path}`;
          const active = link.path === "" ? pathname === href : pathname.startsWith(href);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className="inline-flex min-h-11 items-center text-sm font-semibold underline-offset-8 hover:underline aria-[current=page]:underline aria-[current=page]:decoration-2 aria-[current=page]:decoration-naranja-fuerte"
              >
                {link.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
