import { describe, expect, test } from "vitest";
import {
  categoryIds, getFeatured, getMenu, groupByCategory, menuImageSrc, parseCsv, parseMenu,
} from "./menu";

const HEADER = "category,name_en,name_es,description_en,description_es,price_gbp,badge,image";
const row = (over: Partial<Record<string, string>> = {}) => {
  const v = { category: "espresso", name_en: "Espresso", name_es: "Espresso", description_en: "Strong.", description_es: "Fuerte.", price_gbp: "3.00", badge: "", image: "", ...over };
  return [v.category, v.name_en, v.name_es, v.description_en, v.description_es, v.price_gbp, v.badge, v.image].join(",");
};

describe("parseCsv", () => {
  test("parsea filas simples", () => {
    expect(parseCsv("a,b\nc,d")).toEqual([["a", "b"], ["c", "d"]]);
  });
  test("respeta comas y comillas escapadas dentro de comillas", () => {
    expect(parseCsv('a,"b, c","say ""hi"""\n')).toEqual([["a", "b, c", 'say "hi"']]);
  });
  test("acepta CRLF, BOM, línea final y líneas en blanco", () => {
    expect(parseCsv("﻿a,b\r\n\r\nc,d\r\n")).toEqual([["a", "b"], ["c", "d"]]);
  });
  test("conserva campos vacíos al final", () => {
    expect(parseCsv("a,,")).toEqual([["a", "", ""]]);
  });
  test("falla con comillas sin cerrar", () => {
    expect(() => parseCsv('a,"b')).toThrow(/unterminated/i);
  });
});

describe("parseMenu", () => {
  test("convierte una fila válida en un MenuItem", () => {
    const [item] = parseMenu(`${HEADER}\n${row({ badge: "popular", image: "cappuccino", name_en: "Flat white", price_gbp: "3.90" })}\n`);
    expect(item).toEqual({
      id: "flat-white", category: "espresso",
      name: { en: "Flat white", es: "Espresso" },
      description: { en: "Strong.", es: "Fuerte." },
      priceGbp: 3.9, badge: "popular", image: "cappuccino",
    });
  });
  test("badge e image vacíos se convierten en null", () => {
    const [item] = parseMenu(`${HEADER}\n${row()}`);
    expect(item.badge).toBeNull();
    expect(item.image).toBeNull();
  });
  test.each([
    ["category", { category: "tea" }, /row 2, column "category"/],
    ["name_en", { name_en: "" }, /row 2, column "name_en"/],
    ["description_es", { description_es: "" }, /row 2, column "description_es"/],
    ["price_gbp", { price_gbp: "abc" }, /row 2, column "price_gbp"/],
    ["price_gbp", { price_gbp: "0" }, /row 2, column "price_gbp"/],
    ["price_gbp", { price_gbp: "3.999" }, /row 2, column "price_gbp"/],
    ["badge", { badge: "hot" }, /row 2, column "badge"/],
    ["image", { image: "Cap Puccino.jpg" }, /row 2, column "image"/],
  ])("rechaza %s inválido indicando fila y columna", (_col, over, message) => {
    expect(() => parseMenu(`${HEADER}\n${row(over)}`)).toThrow(message);
  });
  test("rechaza filas con columnas de más o de menos", () => {
    expect(() => parseMenu(`${HEADER}\nespresso,Only,Two`)).toThrow(/row 2: expected 8 columns, found 3/);
  });
  test("rechaza cabecera distinta", () => {
    expect(() => parseMenu("category,name\nx,y")).toThrow(/row 1/);
  });
  test("rechaza nombres duplicados", () => {
    expect(() => parseMenu(`${HEADER}\n${row()}\n${row()}`)).toThrow(/row 3, column "name_en".*duplicate/);
  });
});

describe("helpers", () => {
  const menu = getMenu();
  test("el menú real tiene 20 artículos válidos en 4 categorías", () => {
    expect(menu).toHaveLength(20);
    expect(groupByCategory(menu).map((g) => g.category)).toEqual([...categoryIds]);
    for (const group of groupByCategory(menu)) expect(group.items.length).toBeGreaterThanOrEqual(4);
  });
  test("hay 4 populares y 4 favoritos de la casa", () => {
    expect(menu.filter((i) => i.badge === "popular")).toHaveLength(4);
    expect(menu.filter((i) => i.badge === "house-favourite")).toHaveLength(4);
  });
  test("getFeatured reparte entre categorías y solo devuelve artículos con insignia", () => {
    const featured = getFeatured(menu, 4);
    expect(featured).toHaveLength(4);
    expect(featured.every((i) => i.badge !== null)).toBe(true);
    expect(new Set(featured.map((i) => i.category)).size).toBe(4);
  });
  test("getFeatured no inventa artículos si hay pocos", () => {
    expect(getFeatured(menu.filter((i) => i.badge === null), 4)).toEqual([]);
    expect(getFeatured(menu, 0)).toEqual([]);
  });
  test("menuImageSrc usa la foto del artículo o la de su categoría", () => {
    const withImage = menu.find((i) => i.image)!;
    const without = menu.find((i) => !i.image)!;
    expect(menuImageSrc(withImage)).toBe(`/images/menu/${withImage.image}.jpg`);
    expect(menuImageSrc(without)).toBe(`/images/categories/${without.category}.jpg`);
  });
});
