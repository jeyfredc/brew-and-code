import { describe, expect, test } from "vitest";
import { defaultLocale, hasLocale, pickLocale, switchLocalePath } from "./i18n";

describe("hasLocale", () => {
  test("acepta solo en y es", () => {
    expect(hasLocale("en")).toBe(true);
    expect(hasLocale("es")).toBe(true);
    expect(hasLocale("fr")).toBe(false);
    expect(hasLocale("")).toBe(false);
  });
});

describe("pickLocale", () => {
  test("sin cabecera usa el idioma por defecto", () => {
    expect(pickLocale(null)).toBe(defaultLocale);
    expect(pickLocale("")).toBe(defaultLocale);
  });
  test("elige el idioma soportado con mayor peso", () => {
    expect(pickLocale("es-CO,es;q=0.9,en;q=0.8")).toBe("es");
    expect(pickLocale("en;q=0.5,es;q=0.9")).toBe("es");
  });
  test("ignora idiomas no soportados, comodín y q=0", () => {
    expect(pickLocale("fr-FR,fr;q=0.9")).toBe("en");
    expect(pickLocale("*")).toBe("en");
    expect(pickLocale("es;q=0")).toBe("en");
    expect(pickLocale("es;q=abc")).toBe("en");
  });
});

describe("switchLocalePath", () => {
  test("cambia el prefijo conservando la ruta", () => {
    expect(switchLocalePath("/en/menu", "es")).toBe("/es/menu");
    expect(switchLocalePath("/es/about", "en")).toBe("/en/about");
    expect(switchLocalePath("/en", "es")).toBe("/es");
    expect(switchLocalePath("/", "es")).toBe("/es");
  });
});
