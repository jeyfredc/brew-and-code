# Brew and Co — Diseño del sitio web

Fecha: 2026-09-30 · Estado: pendiente de revisión · Ruta: arquitectónica

## 1. Objetivo

Sitio de 3 páginas para **Brew and Co**, cafetería de barrio en Londres (café de especialidad, pasteles frescos, almuerzos ligeros). Debe transmitir calidez y autenticidad y llevar al visitante a reservar una mesa o asistir a un evento.

Éxito: el visitante entiende qué es el café en segundos, ve lo más pedido y los próximos eventos, puede abrir el formulario de reserva desde Inicio, y hojea el menú completo como una carta real. Funciona en EN y ES.

## 2. Decisiones acordadas

| Tema | Decisión |
|---|---|
| Stack | Next.js 16 (App Router), React 19, Tailwind v4, TypeScript (proyecto `brew-and-code/`) |
| Sistema de diseño | `docs/design/` reutilizado; se renombra la marca a **Brew and Co** |
| Idiomas | Bilingüe EN/ES, rutas `/en` y `/es`, diccionarios JSON propios (sin librería i18n) |
| Moneda | £ (GBP). Precios numéricos en datos, formato con `Intl.NumberFormat` |
| Reserva | Solo maqueta: valida y confirma en pantalla, no guarda ni envía nada |
| Imágenes | Fotos de Pexels descargadas a `public/images/`, servidas con `next/image`; créditos registrados |
| Fuera de alcance | Pedidos online, pagos, cuentas, panel de administración, envío real de reservas, analítica |

## 3. Estructura

```
app/
  [lang]/
    layout.tsx          <html lang>, fuentes, header, footer, LanguageSwitcher
    page.tsx            Inicio
    about/page.tsx      Sobre nosotros
    menu/page.tsx       Menú
  proxy.ts              redirige rutas sin idioma a /en o /es (Accept-Language)
dictionaries/
  en.json  es.json      textos de interfaz, hero, eventos, historia
  get-dictionary.ts     carga server-only
data/
  menu-items.csv        columnas: category, name_en, name_es, description_en,
                        description_es, price_gbp, badge, image
  menu.ts               lee y valida el CSV → MenuItem[] tipado
  events.ts             eventos recurrentes + próximas fechas (Europe/London)
components/
  ui/        Button, Badge, ProductDisc, CategoryBubble
  sections/  Hero, PopularItems, UpcomingEvents, MenuSection, FoundersStory
  booking/   BookingDialog (client), booking-validation.ts
public/images/   fotos + CREDITS.md
```

Rutas: `/en`, `/en/about`, `/en/menu`, `/es`, `/es/about`, `/es/menu`. Páginas estáticas con `generateStaticParams`. Idioma inválido → `notFound()`. Antes de escribir `proxy.ts` y las rutas, consultar la documentación incluida en `node_modules/next/dist/docs` (Next.js 16 es reciente).

## 4. Páginas

### Inicio
1. **Hero**: foto de fondo a pantalla completa (interior cálido), capa oscura semitransparente para contraste AA, titular corto, línea de apoyo, botones "Reservar una mesa" (abre diálogo) y "Ver el menú".
2. **Lo más pedido**: 4 artículos con insignia (Popular / Favorito de la casa), sobre disco de color de categoría, con precio.
3. **Próximos eventos**: tarjetas con las próximas fechas de Open Mic (viernes, tarde) y Coffee Tasting (sábado, mañana) + botón de reserva.
4. **Footer**: dirección, horario, selector EN/ES.

### Sobre nosotros
Foto de los fundadores (stock) e historia en 4–5 párrafos cortos en primera persona plural: por qué abrieron, cómo encontraron el local, por qué café de especialidad, cómo nacieron el open mic y las catas. Fundadores ficticios (**Maya Okafor** y **Tom Hargreaves**), marcados en el código como placeholders a sustituir. Cierre con llamada a reservar.

### Menú
Encabezado con 4 burbujas de categoría (Espresso drinks, Pastries, Sandwiches, Cold drinks) que hacen scroll al bloque. Cada categoría: título y rejilla de artículos (1/2/3 columnas) con foto, nombre, descripción, precio e insignia. Sin botón de compra. Foto específica para los artículos reconocibles y foto representativa por categoría para el resto.

## 5. Componentes

| Componente | Tipo | Notas |
|---|---|---|
| `Hero` | Server | `next/image` `fill` + `priority` + `sizes`; única animación de entrada |
| `MenuItemCard` | Server | foto, nombre, descripción, `Badge`, precio |
| `CategoryNav` | Server | anclas con `aria-label` |
| `EventCard` | Server | `Intl.DateTimeFormat(lang, { timeZone: "Europe/London" })` |
| `LanguageSwitcher` | Server | `<a hreflang>`, conserva la ruta actual |
| `BookingDialog` | Client | `<dialog>` + `showModal()`, cierre con Esc/clic fuera, devuelve el foco al botón |

## 6. Formulario de reserva

- **Nombre**: requerido, 2–60 caracteres.
- **Grupo**: 1–12. Para más, el mensaje indica llamar al café.
- **Fecha**: desde hoy hasta 60 días; sin fechas pasadas (calculado en hora de Londres).
- **Hora**: dentro del horario de apertura (valor de ejemplo hasta tener el real).
- Validación en una función pura `validateBooking()`, reutilizable en servidor cuando exista backend.
- Envío: `submitBooking()` aislada; en esta versión devuelve éxito simulado. Botón "Enviando…" desactivado durante el envío; confirmación con resumen de lo elegido.
- Errores bajo cada campo, en texto que explica cómo arreglarlo, con `aria-invalid` y `aria-describedby`.
- Privacidad: no se guarda nada. Antes de conectar un backend: aviso de privacidad (UK GDPR) y política de retención.

## 7. Datos

- **Menú**: `data/menu-items.csv` sustituye a `docs/menu-items.csv`. Las 20 filas actuales se traducen/convierten: nombres y descripciones EN/ES y precios en £ realistas para Londres. `menu.ts` valida cada fila y **falla el build** indicando fila y columna si falta un campo, la categoría o la insignia no son válidas, o el precio no es numérico.
- **Insignias válidas**: vacío, `popular`, `house-favourite`. La sección "Lo más pedido" toma los artículos con insignia.
- **Eventos**: definidos como reglas recurrentes (día de la semana, hora, duración, textos EN/ES). `events.ts` devuelve las próximas N ocurrencias desde "ahora" en `Europe/London`, correcto en cambios GMT/BST.
- **Placeholders**: dirección, horario, teléfono y nombres de fundadores son ficticios y se marcan con comentarios `PLACEHOLDER`.

## 8. Accesibilidad, SEO y rendimiento

- Checklist completo de `docs/design/style-guide.md` §9: foco visible, objetivos ≥ 44px, contraste AA, `prefers-reduced-motion`.
- Fondo del hero decorativo (`alt=""`), texto en HTML real. `alt` de productos en el idioma de la página.
- `lang` correcto en `<html>`, `alternates.languages` y `hreflang` entre versiones.
- Metadatos por página e idioma, Open Graph con imagen del hero, datos estructurados `CafeOrCoffeeShop` (con datos de ejemplo).
- Imágenes optimizadas con `next/image`; `priority` solo en la del hero.

## 9. Manejo de fallos

- Fila inválida del CSV → error de build claro.
- Falta la foto de un artículo → imagen representativa de su categoría.
- Idioma desconocido → 404.
- Falla `localStorage`/JS → la carta y las páginas siguen siendo legibles (contenido renderizado en servidor); solo el diálogo de reserva requiere JS.

## 10. Pruebas y verificación

- **Vitest**: `menu.ts` (parseo, validación, formato £), `events.ts` (próximas fechas, cambio GMT/BST), `validateBooking()`.
- **Testing Library**: `BookingDialog` (abrir, errores, confirmar, cerrar con Esc, foco devuelto).
- **Final**: `npm run build`, `npm run lint`, revisión con el agente **design-enforcer**, y comprobación visual en navegador a 360/768/1280px en EN y ES.

## 11. Riesgos

- Las fotos de Pexels requieren buscar y descargar con herramientas de navegación; si alguna falla, se deja marcador y lista de lo pendiente. Cada foto se revisa antes de usarla.
- "Próximo viernes" debe calcularse en Europe/London, no en la zona del servidor.
- Todo el contenido inventado (copy, historia, eventos) requiere revisión humana antes de publicarse.
- Precios en £ son estimaciones; el café debe confirmarlos.
