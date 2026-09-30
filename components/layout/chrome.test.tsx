import { render, screen, within } from "@testing-library/react";
import type { ComponentProps } from "react";
import { describe, expect, test, vi } from "vitest";
import en from "@/dictionaries/en.json";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { NavLinks } from "./NavLinks";

let mockPath = "/en/menu";
vi.mock("next/navigation", () => ({ usePathname: () => mockPath }));
vi.mock("next/link", () => ({
  default: ({ href, children, ...rest }: ComponentProps<"a"> & { href: string }) => (
    <a href={href} {...rest}>{children}</a>
  ),
}));

const links = [
  { path: "", label: en.nav.home },
  { path: "/menu", label: en.nav.menu },
  { path: "/about", label: en.nav.about },
];

describe("NavLinks", () => {
  test("marca solo la página actual con aria-current", () => {
    mockPath = "/en/menu";
    render(<NavLinks lang="en" label={en.nav.label} links={links} />);
    expect(screen.getByRole("link", { name: "Menu" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "Home" })).not.toHaveAttribute("aria-current");
  });
  test("inicio es activo solo en la raíz del idioma", () => {
    mockPath = "/en";
    render(<NavLinks lang="en" label={en.nav.label} links={links} />);
    expect(screen.getByRole("link", { name: "Home" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "Menu" })).not.toHaveAttribute("aria-current");
  });
});

describe("LanguageSwitcher", () => {
  test("enlaza a la misma página en el otro idioma y marca el actual", () => {
    mockPath = "/en/menu";
    render(<LanguageSwitcher lang="en" label={en.language.label} names={{ en: "English", es: "Español" }} />);
    const nav = screen.getByRole("navigation", { name: "Language" });
    expect(within(nav).getByRole("link", { name: "Español" })).toHaveAttribute("href", "/es/menu");
    expect(within(nav).getByRole("link", { name: "Español" })).toHaveAttribute("hreflang", "es");
    expect(within(nav).getByRole("link", { name: "English" })).toHaveAttribute("aria-current", "true");
  });
});
