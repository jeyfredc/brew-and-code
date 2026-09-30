import { describe, expect, test } from "vitest";
import { formatEventDate, formatEventTime, formatPrice } from "./format";

describe("formatPrice", () => {
  test("en: £3.60", () => expect(formatPrice(3.6, "en")).toBe("£3.60"));
  test("es: 3,60 £", () => expect(formatPrice(3.6, "es")).toMatch(/^3,60\s£$/));
});

describe("formatEventDate / formatEventTime", () => {
  const start = new Date("2026-10-02T16:30:00Z"); // 17:30 BST
  const end = new Date("2026-10-02T19:00:00Z"); // 20:00 BST
  test("fecha en inglés y español", () => {
    expect(formatEventDate(start, "en")).toMatch(/Friday.*2 October/);
    expect(formatEventDate(start, "es")).toMatch(/viernes.*2 de octubre/);
  });
  test("rango horario en hora de Londres, 24 h", () => {
    expect(formatEventTime(start, end, "en")).toBe("17:30 – 20:00");
    expect(formatEventTime(start, end, "es")).toBe("17:30 – 20:00");
  });
});
