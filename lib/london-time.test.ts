import { describe, expect, test } from "vitest";
import { addDays, londonLocalToDate, londonTimeOfDay, londonToday } from "./london-time";

describe("londonToday / londonTimeOfDay", () => {
  test("usa la fecha de Londres, no la de UTC", () => {
    expect(londonToday(new Date("2026-09-30T23:30:00Z"))).toBe("2026-10-01"); // 00:30 BST
    expect(londonToday(new Date("2026-12-31T23:30:00Z"))).toBe("2026-12-31"); // GMT
    expect(londonTimeOfDay(new Date("2026-09-30T23:30:00Z"))).toBe("00:30");
  });
});

describe("londonLocalToDate", () => {
  test("verano (BST, UTC+1)", () => {
    expect(londonLocalToDate(2026, 7, 1, 12, 0).toISOString()).toBe("2026-07-01T11:00:00.000Z");
  });
  test("invierno (GMT, UTC+0)", () => {
    expect(londonLocalToDate(2026, 12, 1, 12, 0).toISOString()).toBe("2026-12-01T12:00:00.000Z");
  });
});

describe("addDays", () => {
  test("suma días cruzando mes y año", () => {
    expect(addDays("2026-09-30", 60)).toBe("2026-11-29");
    expect(addDays("2026-12-31", 1)).toBe("2027-01-01");
  });
});
