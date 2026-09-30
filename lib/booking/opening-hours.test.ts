import { expect, test } from "vitest";
import { groupOpeningHours, openingHours } from "./opening-hours";

test("agrupa días consecutivos con el mismo horario (lunes a domingo)", () => {
  expect(groupOpeningHours().map((g) => g.days)).toEqual([[1, 2, 3, 4], [5], [6], [0]]);
  expect(groupOpeningHours()[1]).toEqual({ days: [5], open: "07:30", close: "21:30" });
});

test("hay horario para los 7 días", () => {
  for (let d = 0; d < 7; d++) expect(openingHours[d]).toBeDefined();
});
