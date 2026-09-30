# Brew & Code — Especificaciones de componentes

Stack: React 19 + Next.js 16 (App Router) + Tailwind v4 + TypeScript. Tokens en `tokens.css` / `design-tokens.json`.

## Convenciones

- Ubicación: `components/ui/` (primitivos) y `components/sections/` (bloques de página). Un archivo por componente, export nombrado, PascalCase.
- Server Components por defecto. Añadir `"use client"` solo si hay estado/eventos (`SearchField`, `CartButton`, menú móvil).
- Props tipadas con `interface`; extender atributos nativos (`React.ComponentProps<"button">`).
- Variantes con un mapa de clases (`Record<Variant, string>`); sin librerías extra salvo que se acuerde (`clsx` opcional).
- Sin estilos inline ni valores mágicos: usar clases de token.
- Estados obligatorios en todo interactivo: default · hover · focus-visible · active · disabled.
- Textos de usuario en español.

---

## Button

| Prop | Tipo | Default |
|---|---|---|
| `variant` | `"primary" \| "accent" \| "ghost"` | `"primary"` |
| `size` | `"md" \| "lg"` | `"md"` |
| `icon` | `ReactNode` (opcional, al final) | — |
| `asChild` / `href` | renderiza `<a>`/`Link` si hay `href` | — |

- Forma: `rounded-full`, alto `md` 44px · `lg` 52px, padding-x 24px (`px-6`), `font-sans font-semibold text-base`.
- `primary`: `bg-espresso text-espuma`; hover `bg-cacao`. (Referencia: "Get Promo".)
- `accent`: `bg-naranja-fuerte text-white`; hover `bg-[#A94215]`.
- `ghost`: `border border-line text-foreground`; hover `bg-surface`.
- `icon`: círculo de 24px `bg-naranja text-espresso` dentro del botón (el "play" de la referencia). Decorativo (`aria-hidden`).
- Disabled: `opacity-50 cursor-not-allowed`, sin hover.
- Transición `colors 120ms`.
- Es `<button type="button">` por defecto; si navega, es enlace.

```tsx
<Button variant="primary" size="lg" icon={<PlayIcon />}>Ver promo</Button>
```

## SiteHeader

- Contenedor `max-w-page`, alto 72px, `border-b border-line`.
- Izquierda: `Logo`. Centro: `NavLinks` (Inicio, Tienda, Menú, Blog). Derecha: `SearchField` + `CartButton`.
- Enlaces: `font-semibold text-sm text-foreground`; activo = subrayado 2px `naranja-fuerte` con offset 6px (`aria-current="page"`). Hover: color `naranja-fuerte`.
- Móvil (< md): logo + `CartButton` + botón hamburguesa (44px). Menú como panel a pantalla completa, fondo `background`, enlaces en `2xl` display. Cierra con Esc y devuelve el foco al botón.
- Es `<header>` con `<nav aria-label="Principal">`.

## Logo

- Icono vaso 24px en círculo `espresso` + texto "Brew & Code" (Bricolage 800, 24px). "&" en `naranja-fuerte`.
- Siempre enlaza a `/`; `aria-label="Brew & Code, inicio"`.

## SearchField (client)

- `<form role="search">` con `<label class="sr-only">Buscar en el menú</label>`.
- Píldora `bg-surface shadow-search`, alto 40px, ancho 240px (escritorio) / icono-solo con expansión en móvil.
- Icono lupa 16px a la izquierda, input `text-sm`, placeholder "Buscar" en `muted`.
- Foco: anillo `naranja-fuerte` (no quitar outline).
- Vacío sin resultados: "No encontramos “{q}”. Prueba con otra palabra."

## CartButton (client)

- Botón 44×44 circular `border border-line`, icono bolsa 20px. Badge de cantidad: círculo 18px `bg-naranja-fuerte text-white text-xs`, arriba a la derecha; oculto si 0.
- `aria-label="Carrito, {n} productos"`. Pulso 200ms al cambiar `n` (respeta reduced-motion).

## Hero

- Fondo `bg-background`, padding-y 64/96.
- Grid `lg:grid-cols-[1.05fr_1fr_auto]`: texto · producto · categorías.
- Texto: `h1` (`font-display text-5xl font-extrabold text-espresso`, máx. 3 líneas), párrafo `text-lg text-muted max-w-[34ch]`, `Button`.
- Producto: `ProductDisc` tamaño hero (disco 360px `naranja`, imagen 420px desbordando arriba, sombra `float`). Única animación de entrada de la página.
- Categorías: `CategoryBubble` ×4 en arco (solo ≥ lg).
- Propiedades: `title`, `description`, `cta`, `product` (`{ image, alt }`). Copy de ejemplo: “Tu café y algo de código, servidos al momento.” / “Bebidas de especialidad, postres y un rincón para programar. Pide desde aquí y recógelo en el local.” / “Ver promo”.

## ProductDisc

Bloque base de marca: imagen de producto sobre un círculo de color.

| Prop | Tipo | Notas |
|---|---|---|
| `src`, `alt` | `string` | `alt` obligatorio y descriptivo |
| `tone` | `"naranja" \| "mostaza" \| "menta" \| "durazno" \| "frambuesa"` | color del disco |
| `size` | `"sm" \| "md" \| "lg" \| "hero"` | 72 · 96 · 128 · 360px de disco |

- Disco = `rounded-full` + `bg-{tone}`. Imagen `object-contain`, centrada, puede sobresalir ~12% por arriba (efecto "salir del disco").
- Usar `next/image` con `sizes`. Disco `aria-hidden`.

## CategoryBubble

- Círculo 72px `bg-{tone}` con icono/imagen 40px; leyenda debajo: `text-xs font-bold` mayúsculas, `text-espresso`, `mt-2`.
- Es enlace (`/menu?categoria=cafe`), objetivo táctil ≥ 72px. Hover: escala 1.06 (200ms). Seleccionada: anillo 3px `espresso` con offset 2px + `aria-current="true"`.
- Mapeo: Café→mostaza · Bebidas→menta · Té→durazno · Panadería→frambuesa.

## ProductListItem

Fila de la franja de productos (referencia: Nutella Mudslide, Caramel Frappuccino, Hot Chocolate).

- Layout horizontal: `ProductDisc size="md"` + bloque de texto, gap 16px.
- Nombre: `font-display text-xl font-bold text-espresso`, máx. 2 líneas. Precio: `font-display font-bold text-price mt-1`.
- Toda la fila es un enlace a `/producto/{slug}`; hover: nombre subrayado. Sin sombra ni borde.
- Sección: fondo `bg-surface`, grid `md:grid-cols-3`, gap 32px, padding-y 48px.

## ProductCard (catálogo/menú)

- Variante vertical para cuadrículas (2 col móvil, 3 md, 4 xl).
- Disco `lg` arriba centrado, nombre, descripción (1 línea, `text-sm text-muted`), precio y botón `Añadir` (variante `ghost`, size md, ancho completo).
- Fondo `bg-surface`, `rounded-md`, padding 24px. Sin sombra.
- Estados: agotado → disco en escala de grises, botón `disabled` con texto “Agotado”.

## Badge

- Píldora `text-xs font-semibold px-3 py-1`. Variantes: `nuevo` (`bg-naranja text-espresso`), `vegano` (`bg-menta text-white`), `agotado` (`bg-linea text-espresso`).

## Footer

- Fondo `bg-espresso text-espuma`, padding-y 64px, grid 4 col (marca · menú · ayuda · contacto), enlaces `text-sm` `text-espuma/80` hover `text-white`.
- Línea inferior `border-t border-white/15`: copyright y enlaces legales.

## Toast (feedback)

- Esquina inferior, `bg-espresso text-espuma rounded-md px-4 py-3`, `role="status"`. Éxito: icono check `menta`. Error: icono `frambuesa`, `role="alert"`. Autocierra a 4s; no bloquea el foco.

---

## Checklist de revisión (por componente)

- [ ] Usa solo tokens (sin hex sueltos)
- [ ] Estados hover / focus-visible / active / disabled
- [ ] Contraste AA verificado
- [ ] Objetivo táctil ≥ 44px
- [ ] Mobile-first; probado a 360px, 768px y 1280px
- [ ] `alt`/`aria-label` en español
- [ ] Sin animaciones fuera de la lista del style guide
- [ ] Server Component salvo necesidad de cliente
