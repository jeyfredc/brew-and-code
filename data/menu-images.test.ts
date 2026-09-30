import { existsSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { describe, expect, test } from "vitest";
import { categoryIds, getMenu, menuImageSrc } from "./menu";

const publicFile = (src: string) => path.join(process.cwd(), "public", src);
const required = [
  ...new Set([
    "/images/hero.jpg",
    "/images/about.jpg",
    ...categoryIds.map((c) => `/images/categories/${c}.jpg`),
    ...getMenu().map((item) => menuImageSrc(item)),
  ]),
];

describe.each(required)("imagen %s", (src) => {
  test("existe, es un JPEG y pesa entre 10 KB y 500 KB", () => {
    expect(existsSync(publicFile(src))).toBe(true);
    const bytes = readFileSync(publicFile(src));
    expect([...bytes.subarray(0, 3)]).toEqual([0xff, 0xd8, 0xff]);
    const size = statSync(publicFile(src)).size;
    expect(size).toBeGreaterThan(10_000);
    expect(size).toBeLessThan(500_000);
  });
});

test("todas las imágenes están acreditadas en CREDITS.md", () => {
  const credits = readFileSync(publicFile("/images/CREDITS.md"), "utf8");
  for (const src of required) expect(credits, src).toContain(src.replace("/images/", ""));
});
