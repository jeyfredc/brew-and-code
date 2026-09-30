import { expect, test } from "vitest";
import { pageMetadata } from "./seo";

test("canonical, alternates por idioma y Open Graph", () => {
  const meta = pageMetadata({ lang: "es", path: "/menu", title: "Menú | Brew and Co", description: "desc" });
  expect(meta.alternates).toEqual({
    canonical: "/es/menu",
    languages: { en: "/en/menu", es: "/es/menu" },
  });
  expect(meta.openGraph).toMatchObject({ title: "Menú | Brew and Co", locale: "es_ES", type: "website" });
});

test("la home usa ruta vacía", () => {
  const meta = pageMetadata({ lang: "en", path: "", title: "t", description: "d" });
  expect(meta.alternates?.canonical).toBe("/en");
});
