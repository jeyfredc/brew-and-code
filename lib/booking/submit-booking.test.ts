import { afterEach, expect, test, vi } from "vitest";
import { submitBooking } from "./submit-booking";

afterEach(() => vi.useRealTimers());

test("la maqueta resuelve con éxito tras una breve espera", async () => {
  vi.useFakeTimers();
  const pending = submitBooking({ name: "Ana", partySize: 2, date: "2026-10-02", time: "19:00" });
  await vi.advanceTimersByTimeAsync(400);
  await expect(pending).resolves.toEqual({ ok: true });
});
