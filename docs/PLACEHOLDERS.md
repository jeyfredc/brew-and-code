# Datos de ejemplo por sustituir antes de publicar

Todo lo de esta lista es inventado. Una persona del equipo debe revisar y aprobar todo el contenido antes de su publicación.

| Qué | Dónde | Qué hacer |
|---|---|---|
| Fundadores (Maya Okafor, Tom Hargreaves) y su historia | `dictionaries/en.json`, `dictionaries/es.json` → `about.*` | Sustituir por los reales; revisar el tono y los hechos (año, barrio, anécdotas) |
| Foto de "fundadores" | `public/images/about.jpg`, `about.caption` | Es una foto de stock de dos personas ajenas; usar una foto real |
| Dirección y teléfono | `lib/site.ts` (teléfono del rango ficticio `020 7946 0xxx`) | Datos reales; también alimentan el pie de página y el JSON-LD |
| Horario de apertura | `lib/booking/opening-hours.ts` | Horario real; define el pie, la validación de reservas y el JSON-LD |
| Días y horas de los eventos | `data/events.ts` (`eventRules`) | Confirmar viernes 17:30–20:00 (open mic) y sábado 10:00–11:30 (cata) |
| Menú: nombres, descripciones, precios en £, afirmaciones ("Dairy free", "No sugar added") | `data/menu-items.csv` | Precios y composición reales; revisar alérgenos antes de publicar |
| Fotos del menú | `public/images/**`, créditos en `public/images/CREDITS.md` | Las de stock son representativas; los artículos sin foto usan la de su categoría |
| URL pública | `NEXT_PUBLIC_SITE_URL` (ver `.env.example`) | Definirla en el entorno de despliegue |
| Datos estructurados (JSON-LD) | `lib/structured-data.ts` | Publica los datos de ejemplo hasta sustituir los de `lib/site.ts` |

## Reserva de mesa: es una maqueta

`lib/booking/submit-booking.ts` no guarda ni envía nada, pero la confirmación en pantalla dice "Mesa reservada". **No publicar el sitio hasta conectar un canal real** (por ejemplo un Route Handler o un webhook, con las credenciales en variables de entorno) y añadir el aviso de privacidad y la política de retención de datos (UK GDPR).
