import { readFileSync } from "node:fs";
import path from "node:path";
import type { Locale } from "@/lib/i18n";

export const categoryIds = ["espresso", "pastries", "sandwiches", "cold"] as const;
export type CategoryId = (typeof categoryIds)[number];
export const badgeIds = ["popular", "house-favourite"] as const;
export type BadgeId = (typeof badgeIds)[number];

export interface MenuItem {
  id: string;
  category: CategoryId;
  name: Record<Locale, string>;
  description: Record<Locale, string>;
  priceGbp: number;
  badge: BadgeId | null;
  image: string | null;
}

const COLUMNS = ["category", "name_en", "name_es", "description_en", "description_es", "price_gbp", "badge", "image"] as const;
type Column = (typeof COLUMNS)[number];

const isCategoryId = (v: string): v is CategoryId => (categoryIds as readonly string[]).includes(v);
const isBadgeId = (v: string): v is BadgeId => (badgeIds as readonly string[]).includes(v);

/** Parser CSV mínimo: comillas dobles, "" escapado, CRLF, BOM y líneas en blanco. */
export function parseCsv(input: string): string[][] {
  const text = input.replace(/^﻿/, "");
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; } else inQuotes = false;
      } else field += c;
    } else if (c === '"') inQuotes = true;
    else if (c === ",") { row.push(field); field = ""; }
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(field); rows.push(row); row = []; field = "";
    } else field += c;
  }
  if (inQuotes) throw new Error("CSV: unterminated quoted field");
  if (field !== "" || row.length > 0) { row.push(field); rows.push(row); }
  return rows.filter((r) => !(r.length === 1 && r[0] === ""));
}

const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

/** Valida y convierte el CSV. Lanza un Error con fila y columna ante cualquier problema. */
export function parseMenu(text: string): MenuItem[] {
  const [header, ...records] = parseCsv(text);
  if (!header || header.join(",") !== COLUMNS.join(",")) {
    throw new Error(`menu-items.csv row 1: expected header "${COLUMNS.join(",")}"`);
  }
  const seen = new Set<string>();
  return records.map((cells, index): MenuItem => {
    const rowNumber = index + 2;
    const fail = (column: Column, message: string): never => {
      throw new Error(`menu-items.csv row ${rowNumber}, column "${column}": ${message}`);
    };
    if (cells.length !== COLUMNS.length) {
      throw new Error(`menu-items.csv row ${rowNumber}: expected ${COLUMNS.length} columns, found ${cells.length}`);
    }
    const [category, nameEn, nameEs, descEn, descEs, price, badge, image] = cells.map((c) => c.trim());

    if (!isCategoryId(category)) return fail("category", `"${category}" is not one of ${categoryIds.join(", ")}`);
    if (!nameEn) return fail("name_en", "required");
    if (!nameEs) return fail("name_es", "required");
    if (!descEn) return fail("description_en", "required");
    if (!descEs) return fail("description_es", "required");
    if (!/^\d+(\.\d{1,2})?$/.test(price) || Number(price) <= 0) {
      return fail("price_gbp", `"${price}" must be a positive number with at most 2 decimals`);
    }
    if (badge !== "" && !isBadgeId(badge)) return fail("badge", `"${badge}" must be empty or one of ${badgeIds.join(", ")}`);
    if (image !== "" && !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(image)) {
      return fail("image", `"${image}" must be a lowercase file name without extension, e.g. cold-brew`);
    }
    const id = slugify(nameEn);
    if (seen.has(id)) return fail("name_en", `duplicate item "${nameEn}"`);
    seen.add(id);

    return {
      id, category,
      name: { en: nameEn, es: nameEs },
      description: { en: descEn, es: descEs },
      priceGbp: Number(price),
      badge: badge === "" ? null : (badge as BadgeId),
      image: image === "" ? null : image,
    };
  });
}

let cache: MenuItem[] | undefined;
export function getMenu(): MenuItem[] {
  cache ??= parseMenu(readFileSync(path.join(process.cwd(), "data", "menu-items.csv"), "utf8"));
  return cache;
}

export function groupByCategory(items: MenuItem[]): { category: CategoryId; items: MenuItem[] }[] {
  return categoryIds
    .map((category) => ({ category, items: items.filter((i) => i.category === category) }))
    .filter((g) => g.items.length > 0);
}

/** Artículos con insignia, repartidos por categoría (una por categoría antes de repetir). */
export function getFeatured(items: MenuItem[], count: number): MenuItem[] {
  const queues = categoryIds.map((c) => items.filter((i) => i.category === c && i.badge !== null));
  const result: MenuItem[] = [];
  while (result.length < count && queues.some((q) => q.length > 0)) {
    for (const queue of queues) {
      const next = queue.shift();
      if (next && result.length < count) result.push(next);
    }
  }
  return result;
}

export function menuImageSrc(item: MenuItem): string {
  return item.image ? `/images/menu/${item.image}.jpg` : `/images/categories/${item.category}.jpg`;
}
