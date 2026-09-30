import type { Booking } from "./validate-booking";

/**
 * PLACEHOLDER (maqueta): no guarda ni envía nada.
 * Para producción, sustituir el cuerpo por una llamada a un Route Handler / webhook
 * (credenciales en variables de entorno) y añadir aviso de privacidad (UK GDPR).
 */
export async function submitBooking(booking: Booking): Promise<{ ok: true }> {
  void booking;
  await new Promise((resolve) => setTimeout(resolve, 400));
  return { ok: true };
}
