# Sistema de diseño — Brew & Code

| Archivo | Contenido |
|---|---|
| [`style-guide.md`](./style-guide.md) | Principios, color, tipografía, layout, forma, movimiento, accesibilidad, voz |
| [`design-tokens.json`](./design-tokens.json) | Tokens en formato agnóstico (fuente de verdad) |
| [`tokens.css`](./tokens.css) | Mismos tokens listos para Tailwind v4 (`@theme`) |
| [`components.md`](./components.md) | Especificación de componentes React/Next.js |
| [`references/1.png`](./references/1.png) | Imagen de inspiración |

## Cómo aplicarlo

1. Fuentes en `app/layout.tsx` (ver style-guide §8).
2. `app/globals.css` → `@import "tailwindcss";` + `@import "../docs/design/tokens.css";`
3. Construir componentes en `components/ui/` siguiendo `components.md`.

## Mantenimiento

`design-tokens.json` y `tokens.css` deben mantenerse sincronizados. Todo color o tamaño nuevo entra primero como token.
