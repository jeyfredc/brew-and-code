import { describe, expect, test } from "vitest";
import en from "./en.json";
import es from "./es.json";

function leaves(value: unknown, prefix = ""): [string, string][] {
  if (Array.isArray(value)) {
    return [[`${prefix}.length=${value.length}`, ""], ...value.flatMap((v, i) => leaves(v, `${prefix}[${i}]`))];
  }
  if (value && typeof value === "object") {
    return Object.entries(value).flatMap(([k, v]) => leaves(v, prefix ? `${prefix}.${k}` : k));
  }
  return [[prefix, String(value)]];
}

const enLeaves = leaves(en);
const esLeaves = leaves(es);

describe("diccionarios", () => {
  test("en y es tienen exactamente las mismas claves", () => {
    expect(esLeaves.map(([k]) => k).sort()).toEqual(enLeaves.map(([k]) => k).sort());
  });

  test("ningún texto está vacío", () => {
    for (const [key, value] of [...enLeaves, ...esLeaves]) {
      if (key.includes(".length=")) continue; // entradas sintéticas de longitud de arrays
      expect(value, key).not.toBe("");
    }
  });

  test("los marcadores {x} coinciden entre idiomas", () => {
    const tokens = (entries: [string, string][]) =>
      Object.fromEntries(entries.map(([k, v]) => [k, (v.match(/\{\w+\}/g) ?? []).sort().join(",")]));
    expect(tokens(esLeaves)).toEqual(tokens(enLeaves));
  });
});
