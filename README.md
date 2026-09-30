# Brew and Co

Sitio bilingüe (EN/ES) de una cafetería de especialidad de barrio en Londres. Tres páginas: inicio (hero, lo más pedido, próximos eventos y reserva de mesa), nosotros y menú.

**Stack:** Next.js 16 (App Router) · React 19 · Tailwind CSS v4 · TypeScript · Vitest + Testing Library.

## Puesta en marcha

```bash
npm install
npm run dev        # http://localhost:3000 (redirige a /en o /es según el idioma del navegador)
npm test           # tests
npm run typecheck
npm run lint
npm run build
```

Variable de entorno opcional: `NEXT_PUBLIC_SITE_URL` (ver `.env.example`).

## Estructura

- `app/[lang]/` — páginas y layout por idioma (`en`, `es`); `proxy.ts` redirige las rutas sin idioma.
- `dictionaries/` — textos de interfaz en JSON por idioma (un test comprueba que ambos tengan las mismas claves).
- `data/` — menú (`menu-items.csv`, validado al compilar), eventos recurrentes en hora de Londres.
- `lib/` — formato, i18n, hora de Londres, reservas (validación, horario), SEO.
- `components/` — `ui/`, `layout/`, `sections/`, `booking/`.
- `docs/design/` — sistema de diseño (guía de estilos, tokens, componentes).
- `docs/superpowers/` — especificación y plan de implementación.
- `docs/PLACEHOLDERS.md` — **datos de ejemplo que hay que sustituir antes de publicar**.

## Notas

- El menú se edita en `data/menu-items.csv`. Si una fila es inválida, el build falla indicando fila y columna.
- Las imágenes son de Pexels; los créditos están en `public/images/CREDITS.md`.
- La reserva de mesa es una maqueta: no guarda ni envía datos.
