import { describe, expect, test } from "vitest";
import { validateBooking, type BookingInput } from "./validate-booking";

const NOW = new Date("2026-09-30T12:00:00Z"); // miércoles 13:00 BST
const ok: BookingInput = { name: "Ana", partySize: "4", date: "2026-10-02", time: "19:00" }; // viernes

const errorsOf = (over: Partial<BookingInput>, now = NOW) => {
  const result = validateBooking({ ...ok, ...over }, now);
  return result.ok ? {} : result.errors;
};

describe("validateBooking", () => {
  test("acepta una reserva válida y normaliza el nombre y el tamaño", () => {
    expect(validateBooking({ ...ok, name: "  Ana  " }, NOW)).toEqual({
      ok: true, value: { name: "Ana", partySize: 4, date: "2026-10-02", time: "19:00" },
    });
  });

  test("nombre: entre 2 y 60 caracteres tras recortar", () => {
    expect(errorsOf({ name: "A" }).name).toBe("nameLength");
    expect(errorsOf({ name: "   " }).name).toBe("nameLength");
    expect(errorsOf({ name: "x".repeat(61) }).name).toBe("nameLength");
    expect(errorsOf({ name: "x".repeat(60) }).name).toBeUndefined();
  });

  test.each(["0", "13", "2.5", "abc", "", "-1"])("tamaño de grupo inválido: %j", (partySize) => {
    expect(errorsOf({ partySize }).partySize).toBe("partySizeRange");
  });
  test.each(["1", "12"])("tamaño de grupo válido: %s", (partySize) => {
    expect(errorsOf({ partySize }).partySize).toBeUndefined();
  });

  test.each(["", "30/09/2026", "2026-02-30", "2026-13-01", "hoy"])("fecha inválida: %j", (date) => {
    expect(errorsOf({ date }).date).toBe("dateInvalid");
  });
  test("fecha pasada y demasiado lejana (hoy + 60 días es el límite)", () => {
    expect(errorsOf({ date: "2026-09-29" }).date).toBe("datePast");
    expect(errorsOf({ date: "2026-11-29" }).date).toBeUndefined();
    expect(errorsOf({ date: "2026-11-30" }).date).toBe("dateTooFar");
  });

  test.each(["7:00", "25:00", "19:60", "", "19:00:00"])("hora con formato inválido: %j", (time) => {
    expect(errorsOf({ time }).time).toBe("timeInvalid");
  });
  test("horario de apertura: último turno 30 min antes del cierre", () => {
    // miércoles 2026-10-07: 06:00–20:00
    expect(errorsOf({ date: "2026-10-07", time: "05:59" }).time).toBe("timeClosed");
    expect(errorsOf({ date: "2026-10-07", time: "06:00" }).time).toBeUndefined();
    expect(errorsOf({ date: "2026-10-07", time: "19:30" }).time).toBeUndefined();
    expect(errorsOf({ date: "2026-10-07", time: "19:31" }).time).toBe("timeClosed");
    // viernes cierra a las 21:30; domingo 2026-10-04 08:30–16:00
    expect(errorsOf({ date: "2026-10-02", time: "21:00" }).time).toBeUndefined();
    expect(errorsOf({ date: "2026-10-04", time: "15:31" }).time).toBe("timeClosed");
  });

  test("hoy: la hora debe ser posterior a la actual de Londres", () => {
    expect(errorsOf({ date: "2026-09-30", time: "12:00" }).time).toBe("timePast"); // ya son las 13:00
    expect(errorsOf({ date: "2026-09-30", time: "15:00" }).time).toBeUndefined();
  });
  test("hoy después del cierre: rechazada", () => {
    const evening = new Date("2026-09-30T19:30:00Z"); // 20:30 BST, cerrado desde las 20:00
    expect(errorsOf({ date: "2026-09-30", time: "21:00" }, evening).time).toBe("timeClosed");
  });
  test("la fecha de 'hoy' es la de Londres, no la de UTC", () => {
    const justAfterMidnightLondon = new Date("2026-09-30T23:30:00Z"); // 1 oct 00:30 BST
    expect(errorsOf({ date: "2026-09-30", time: "15:00" }, justAfterMidnightLondon).date).toBe("datePast");
    expect(errorsOf({ date: "2026-10-01", time: "15:00" }, justAfterMidnightLondon).date).toBeUndefined();
  });

  test("devuelve varios errores a la vez", () => {
    const result = validateBooking({ name: "", partySize: "0", date: "", time: "" }, NOW);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(Object.keys(result.errors).sort()).toEqual(["date", "name", "partySize", "time"]);
  });
});
