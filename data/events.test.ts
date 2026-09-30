import { describe, expect, test } from "vitest";
import { getUpcomingEvents } from "./events";

const iso = (events: ReturnType<typeof getUpcomingEvents>) =>
  events.map((e) => `${e.id} ${e.startsAt.toISOString()}`);

describe("getUpcomingEvents", () => {
  test("devuelve las próximas ocurrencias en orden (verano, BST)", () => {
    const events = getUpcomingEvents(new Date("2026-09-30T12:00:00Z"), 4); // miércoles
    expect(iso(events)).toEqual([
      "openMic 2026-10-02T16:30:00.000Z",
      "tasting 2026-10-03T09:00:00.000Z",
      "openMic 2026-10-09T16:30:00.000Z",
      "tasting 2026-10-10T09:00:00.000Z",
    ]);
  });
  test("un evento en curso sigue apareciendo hasta que termina", () => {
    const during = getUpcomingEvents(new Date("2026-10-02T17:00:00Z"), 1);
    expect(iso(during)).toEqual(["openMic 2026-10-02T16:30:00.000Z"]);
    const after = getUpcomingEvents(new Date("2026-10-02T19:30:00Z"), 1);
    expect(iso(after)).toEqual(["tasting 2026-10-03T09:00:00.000Z"]);
  });
  test("cambio de hora de otoño (25 oct 2026): el mismo horario local en GMT", () => {
    const events = getUpcomingEvents(new Date("2026-10-24T12:00:00Z"), 2);
    expect(iso(events)).toEqual([
      "openMic 2026-10-30T17:30:00.000Z",
      "tasting 2026-10-31T10:00:00.000Z",
    ]);
  });
  test("cambio de hora de primavera (29 mar 2026)", () => {
    const events = getUpcomingEvents(new Date("2026-03-27T00:00:00Z"), 3);
    expect(iso(events)).toEqual([
      "openMic 2026-03-27T17:30:00.000Z",
      "tasting 2026-03-28T10:00:00.000Z",
      "openMic 2026-04-03T16:30:00.000Z",
    ]);
  });
  test("count 0 o negativo devuelve lista vacía", () => {
    expect(getUpcomingEvents(new Date("2026-09-30T12:00:00Z"), 0)).toEqual([]);
    expect(getUpcomingEvents(new Date("2026-09-30T12:00:00Z"), -2)).toEqual([]);
  });
});
