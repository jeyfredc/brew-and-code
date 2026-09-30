import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import en from "@/dictionaries/en.json";
import { submitBooking } from "@/lib/booking/submit-booking";
import { BookingDialog } from "./BookingDialog";

vi.mock("@/lib/booking/submit-booking", () => ({ submitBooking: vi.fn() }));
const submit = vi.mocked(submitBooking);

const dialog = () => document.querySelector("dialog") as HTMLDialogElement;
const open = () => fireEvent.click(screen.getByRole("button", { name: "Reserve a table" }));
const field = (label: string) => screen.getByLabelText(label) as HTMLInputElement;

function fillValid() {
  fireEvent.change(field("Your name"), { target: { value: "Ana" } });
  fireEvent.change(field("Number of people"), { target: { value: "4" } });
  fireEvent.change(field("Date"), { target: { value: "2026-10-02" } });
  fireEvent.change(field("Time"), { target: { value: "19:00" } });
}
const send = () => fireEvent.click(screen.getByRole("button", { name: "Reserve table" }));

beforeEach(() => {
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date("2026-09-30T12:00:00Z"));
  submit.mockResolvedValue({ ok: true });
  render(<BookingDialog labels={en.booking} lang="en" />);
});
afterEach(() => {
  vi.useRealTimers();
  submit.mockReset();
});

describe("BookingDialog", () => {
  test("el botón abre el diálogo", () => {
    expect(dialog()).not.toHaveAttribute("open");
    open();
    expect(dialog()).toHaveAttribute("open");
  });

  test("limita la fecha a hoy … hoy + 60 días (hora de Londres)", () => {
    open();
    expect(field("Date")).toHaveAttribute("min", "2026-09-30");
    expect(field("Date")).toHaveAttribute("max", "2026-11-29");
  });

  test("enviar vacío muestra errores, enfoca el primer campo inválido y no envía", () => {
    open();
    send();
    expect(screen.getByText("Enter your name (2 to 60 characters).")).toBeInTheDocument();
    expect(screen.getByText("Enter a valid date.")).toBeInTheDocument();
    expect(field("Your name")).toHaveFocus();
    expect(field("Your name")).toHaveAttribute("aria-invalid", "true");
    expect(field("Your name")).toHaveAccessibleDescription("Enter your name (2 to 60 characters).");
    expect(submit).not.toHaveBeenCalled();
  });

  test("corregir un campo borra su error", () => {
    open();
    send();
    fireEvent.change(field("Your name"), { target: { value: "Ana" } });
    expect(screen.queryByText("Enter your name (2 to 60 characters).")).not.toBeInTheDocument();
  });

  test("una reserva válida se envía y muestra la confirmación con el resumen", async () => {
    open();
    fillValid();
    send();
    expect(await screen.findByText("Table reserved")).toBeInTheDocument();
    expect(screen.getByText(/Thanks, Ana\. We've noted a table for 4 on Friday.*2 October at 19:00\./)).toBeInTheDocument();
    expect(submit).toHaveBeenCalledWith({ name: "Ana", partySize: 4, date: "2026-10-02", time: "19:00" });
  });

  test("mientras envía, el botón se desactiva y no permite un segundo envío", async () => {
    let resolve!: (v: { ok: true }) => void;
    submit.mockReturnValue(new Promise((r) => (resolve = r)));
    open();
    fillValid();
    send();
    const button = await screen.findByRole("button", { name: "Sending…" });
    expect(button).toBeDisabled();
    fireEvent.click(button);
    expect(submit).toHaveBeenCalledTimes(1);
    await act(async () => resolve({ ok: true }));
    expect(await screen.findByText("Table reserved")).toBeInTheDocument();
  });

  test("si el envío falla, muestra el error y permite reintentar", async () => {
    submit.mockRejectedValueOnce(new Error("network"));
    open();
    fillValid();
    send();
    expect(await screen.findByText("We couldn't send your request. Try again in a moment.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Reserve table" })).toBeEnabled();
  });

  test("el botón Cerrar y el clic en el fondo cierran el diálogo", () => {
    open();
    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    expect(dialog()).not.toHaveAttribute("open");
    open();
    fireEvent.click(dialog()); // clic en el backdrop: el objetivo es el propio <dialog>
    expect(dialog()).not.toHaveAttribute("open");
  });

  test("al volver a abrir tras una reserva, el formulario está limpio", async () => {
    open();
    fillValid();
    send();
    await screen.findByText("Table reserved");
    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    open();
    expect(field("Your name").value).toBe("");
    expect(screen.queryByText("Table reserved")).not.toBeInTheDocument();
  });

  test("tras confirmar, el foco pasa al título de confirmación (no se pierde en el body)", async () => {
    open();
    fillValid();
    send();
    const heading = await screen.findByRole("heading", { name: "Table reserved" });
    await waitFor(() => expect(heading).toHaveFocus()); // el foco se mueve en un efecto
  });

  test.each([
    ["Ana $&", "Thanks, Ana $&. We've noted a table for 4"],
    ["Jo $'", "Thanks, Jo $'. We've noted a table for 4"],
    ["{time}", "Thanks, {time}. We've noted a table for 4"],
  ])("el nombre %j se muestra tal cual en la confirmación", async (name, expected) => {
    open();
    fillValid();
    fireEvent.change(field("Your name"), { target: { value: name } });
    send();
    await screen.findByText("Table reserved");
    expect(screen.getByText(new RegExp(expected.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")))).toBeInTheDocument();
    expect(screen.getByText(/on Friday.*2 October at 19:00\.$/)).toBeInTheDocument();
  });
});
