import { describe, expect, test } from "vitest";
import { formatPrice } from "./format";

describe("formatPrice", () => {
  test("en: £3.60", () => expect(formatPrice(3.6, "en")).toBe("£3.60"));
  test("es: 3,60 £", () => expect(formatPrice(3.6, "es")).toMatch(/^3,60\s£$/));
});
