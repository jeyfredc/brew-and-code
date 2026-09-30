import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";

test("jsdom, RTL y jest-dom funcionan", () => {
  render(<button>Hola</button>);
  expect(screen.getByRole("button", { name: "Hola" })).toBeInTheDocument();
});

test("el polyfill de <dialog> abre y cierra", () => {
  const dialog = document.createElement("dialog");
  dialog.showModal();
  expect(dialog.hasAttribute("open")).toBe(true);
  dialog.close();
  expect(dialog.hasAttribute("open")).toBe(false);
});
