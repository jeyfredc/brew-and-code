# Brew and Co — Guía de estilos

Referencia visual: `docs/design/references/1.png` (landing de cafetería "Onea": fondo durazno-crema, titulares gruesos en chocolate, producto en vaso sobre un disco naranja, burbujas de categoría, miniaturas circulares de producto, botón píldora oscuro).
Stack: Next.js 16 (App Router) · React 19 · Tailwind CSS v4 · TypeScript.

## 1. Idea rectora

**"Cálido, redondo, servido al momento."** Todo el sistema sale de una taza: formas circulares, colores de café con leche y chocolate, un único acento naranja. El producto es el protagonista; la interfaz se queda quieta alrededor.

Lo que hace memorable la marca (y lo único que puede "gritar"): **el disco de color detrás del producto**. Cada producto vive sobre un círculo de color. El resto es sobrio.

Qué tomamos de la referencia y qué cambiamos:

| Referencia | Brew and Co |
|---|---|
| Paleta crema + chocolate + naranja | Se mantiene (es el brief). Acento naranja usado con disciplina: relleno, nunca texto pequeño. |
| Sans geométrica genérica | **Bricolage Grotesque** en titulares: más carácter, sigue siendo redonda y gruesa. |
| Logo "Onea." con punto | Wordmark **Brew and Co** con "and" en `naranja-fuerte` como detalle (ver §7). |
| Solo modo claro | Se añade modo oscuro "café tostado" (el proyecto ya usa `prefers-color-scheme`). |

## 2. Color

### Paleta base
| Token | Hex | Uso |
|---|---|---|
| `crema` | `#F6E6D6` | Fondo de página / hero |
| `espuma` | `#FFF4EE` | Franja secundaria, tarjetas, campo de búsqueda |
| `espresso` | `#2A1810` | Texto principal, botón primario |
| `cacao` | `#5A2E1C` | Titulares secundarios |
| `tostado` | `#6B5245` | Texto secundario |
| `linea` | `#D9C2AE` | Divisores, bordes suaves |
| `naranja` | `#E2702F` | Acento de marca (relleno: discos, badges, play) |
| `naranja-fuerte` | `#C4511A` | Acento para texto grande, subrayados, anillo de foco y rellenos de botón |
| `naranja-profundo` | `#A94215` | Hover del botón de acento |
| `precio` | `#8A2E14` | Precios |

### Halos de categoría (discos detrás de producto)
`mostaza #EDB95A` Espresso drinks · `menta #2F7D5B` Cold drinks · `durazno #F2936B` Sandwiches · `frambuesa #C9476A` Pastries · `naranja #E2702F` destacado/promo.

### Contraste (WCAG 2.2 AA, calculado)
| Combinación | Ratio | Uso permitido |
|---|---|---|
| `espresso` sobre `crema` | ≈ 14:1 | Todo |
| `tostado` sobre `crema` | ≈ 5.8:1 | Texto secundario |
| `espresso` sobre `naranja` | ≈ 5.3:1 | Texto sobre relleno naranja |
| Blanco sobre `naranja-fuerte` | ≈ 4.6:1 | Botón de acento |
| Blanco sobre `naranja-profundo` | ≈ 6:1 | Hover del botón de acento |
| `naranja-fuerte` sobre `crema` | ≈ 3.75:1 | Solo texto grande (≥ 24px, o ≥ 18.66px en negrita), subrayados, anillo de foco, rellenos |
| `precio` sobre `crema` / `espuma` | ≈ 7.8:1 | Texto pequeño, enlaces, precios y mensajes de error |
| Blanco sobre `naranja` | ≈ 3.3:1 | **Prohibido** para texto < 24px |

Regla: el naranja claro nunca lleva texto blanco. Verifica con una herramienta de contraste antes de añadir combinaciones nuevas.

### Modo oscuro
Fondo `#1C110B`, superficie `#2A1810`, texto `#F6E6D6`, texto suave `#CDB5A2`, línea `#4A3426`, precio `#F2A07A`. Los halos de producto no cambian.

## 3. Tipografía

- **Display — Bricolage Grotesque** (700/800): titulares, logo, nombres de producto, precios.
- **Cuerpo — Figtree** (400/500/600): navegación, botones, párrafos, formularios.
- **Mono — Geist Mono**: solo bloques de código (contenido del blog "Code"). No se usa para etiquetas ni precios.

Carga con `next/font/google` (ver §8).

### Escala
| Token | Tamaño | Interlineado | Uso |
|---|---|---|---|
| `5xl` | 44–80px fluido | 1.02 | Titular del hero |
| `4xl` | 36–56px fluido | 1.08 | Titular de sección |
| `3xl` | 36px | 1.15 | Títulos de página interior |
| `2xl` | 28px | 1.2 | Subtítulos |
| `xl` | 22px | 1.35 | Nombre de producto destacado |
| `lg` | 18px | 1.6 | Texto de entrada (lead) |
| `base` | 16px | 1.65 | Párrafos, UI |
| `sm` | 14px | 1.45 | Metadatos, ayuda |
| `xs` | 12px | 1.4 | Leyendas de burbuja de categoría |

Reglas:
- Titulares: peso 800, tracking `-0.02em`, alineados a la izquierda, máx. 3 líneas.
- Párrafos: máx. 60 caracteres por línea (`max-w-[34ch]` a `max-w-prose`), color `tostado`.
- Sentence case en todo. Sin mayúsculas sostenidas, salvo las leyendas de 12px bajo las burbujas de categoría (herencia de la referencia; son texto corto y fijo).
- No resaltar una sola palabra del titular con otro color o cursiva.
- Precios: Bricolage 700, color `precio`, en libras: `£3.60` (en-GB) y `3,60 £` (es-ES), siempre con `Intl.NumberFormat`.

## 4. Espaciado y layout

- Base de 4px. Escala: 4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 · 96 · 128.
- Contenedor: `max-w-[1120px]`, márgenes laterales 16px (móvil) · 32px (tablet) · 40px (escritorio).
- Alineación: contenido **alineado a la izquierda**. El centrado se reserva para el producto en el hero y para estados vacíos.
- Ritmo vertical entre secciones: 64px móvil · 96px escritorio.
- Breakpoints Tailwind por defecto (`sm 640 · md 768 · lg 1024 · xl 1280`). Mobile-first.

### Hero (escritorio ≥ lg)
```
┌────────────────────────────────────────────────────────┐
│ ▢ Brew and Co      Inicio Tienda Menú Blog    (Buscar) │
│ ────────────────────────────────────────────────────── │
│ Titular grande                     ╭──────╮   ● Café   │
│ en tres líneas                     │ VASO │   ● Bebidas│
│                                    │ sobre│   ● Té     │
│ Párrafo corto (34ch)               │ disco│   ● Panad. │
│ [ Ver promo ● ]                    ╰──────╯            │
├────────────────────────────────────────────────────────┤  ← cambio de fondo crema → espuma
│ (●) Nombre     (●) Nombre     (●) Nombre               │
│     £3.80          £3.20          £7.50                 │
└────────────────────────────────────────────────────────┘
```
Móvil: columna única. Orden: navegación → producto sobre disco → titular → párrafo → CTA → burbujas de categoría en fila con scroll horizontal → productos en lista vertical.

Las burbujas de categoría van en arco a la derecha del producto en escritorio (desplazamiento escalonado en X: 0 / +24 / +8 / +32 px); en móvil, en línea recta.

## 5. Forma, bordes y sombras

- **Círculo** para producto y categorías (`rounded-full`). Es la forma de marca.
- **Píldora** para botones, campo de búsqueda y badges.
- Radio `md 16px` para tarjetas y menús; `frame 24px` para el marco de la página en escritorio (opcional).
- Bordes: 1px `linea`. Sin bordes en botones rellenos.
- Sombras solo dos: `search` (campo flotante) y `float` (producto en hero, elíptica bajo el vaso). Nada de sombras en tarjetas de lista.
- Sin degradados decorativos. El color se aplica plano.

## 6. Movimiento

- Un solo momento orquestado: al cargar, el producto del hero entra con un ascenso corto (420ms, `ease-out-soft`) y el disco se escala de 0.9 a 1.
- Respuesta a acciones: hover/focus de botón (120ms), apertura de menú (200ms), añadir al carrito (el badge de cantidad hace un pulso de 200ms).
- Sin entradas "fade-up" en cada sección ni hover-lift en cada tarjeta.
- Respetar `prefers-reduced-motion` (ya incluido en `tokens.css`).

## 7. Logo y marca

- Wordmark: "Brew and Co" en Bricolage 800. "and" en `naranja-fuerte` (24px en negrita = texto grande). Icono: vaso de papel dentro de un círculo `espresso` (24px en cabecera).
- Nombre siempre "Brew and Co" (en código y URLs: `brew-and-code`).
- Espacio libre mínimo alrededor del logo: alto del "B".

## 8. Implementación en el stack

1. **Fuentes** — `app/layout.tsx`:
```tsx
import { Bricolage_Grotesque, Figtree, Geist_Mono } from "next/font/google";

const bricolage = Bricolage_Grotesque({ variable: "--font-bricolage", subsets: ["latin"], weight: ["700", "800"] });
const figtree = Figtree({ variable: "--font-figtree", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

// <html lang="es" className={`${bricolage.variable} ${figtree.variable} ${geistMono.variable} antialiased`}>
```
2. **Tokens** — reemplazar el contenido de `app/globals.css` por `@import "tailwindcss";` + el contenido de `docs/design/tokens.css` (o importarlo).
3. **Clases resultantes**: `bg-background`, `bg-surface`, `text-foreground`, `text-muted`, `text-price`, `border-line`, `bg-naranja`, `bg-mostaza`, `font-display`, `rounded-frame`, `shadow-float`, `max-w-page`.
4. Idioma del documento: `lang="es"`; metadata en español.
5. Imágenes de producto: `next/image`, PNG/WebP con fondo transparente, cuadradas, `sizes` explícito.

## 9. Accesibilidad (mínimos obligatorios)

- Foco visible en todo elemento interactivo (anillo naranja-fuerte 3px, offset 3px).
- Objetivos táctiles ≥ 44×44px (burbujas de categoría y botones cumplen; los iconos de 24px llevan padding).
- Imágenes de producto con `alt` descriptivo ("Frappé de chocolate con crema y fresa"); los halos son decorativos (`aria-hidden`).
- El color nunca es el único indicador de categoría: siempre lleva texto.
- Navegación por teclado completa; el campo de búsqueda con `<label>` (visible u oculto con `sr-only`).

## 10. Tono de voz (microcopy)

Cercano, directo, sin florituras. Sentence case. Verbos claros.
- Botones: "Ver promo", "Añadir al carrito", "Pedir ahora". Misma acción = mismo nombre en todo el flujo ("Añadir" → toast "Añadido").
- Vacío: "Tu carrito está vacío. Explora el menú." + botón "Ver menú".
- Error: "No pudimos cargar el menú. Revisa tu conexión y vuelve a intentar." + botón "Reintentar".
- Contenido para publicación externa debe ser revisado por una persona antes de salir.
