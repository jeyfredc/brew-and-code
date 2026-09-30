import { expect, test } from "vitest";
import { cafeJsonLd, jsonLdString } from "./structured-data";

test("CafeOrCoffeeShop con horario agrupado", () => {
  const data = cafeJsonLd();
  expect(data["@type"]).toBe("CafeOrCoffeeShop");
  expect(data.openingHoursSpecification[0]).toMatchObject({
    dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday"], opens: "07:30", closes: "17:00",
  });
  expect(data.address.addressCountry).toBe("GB");
});

test("jsonLdString escapa '<' para no cerrar el <script>", () => {
  expect(jsonLdString({ a: "</script><script>alert(1)</script>" })).not.toContain("<");
});
