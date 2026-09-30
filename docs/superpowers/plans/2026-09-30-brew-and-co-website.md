# Brew and Co Website Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a bilingual (EN/ES) 3-page website for Brew and Co, a specialty coffee shop in London: Home (hero, popular items, upcoming events, reservation dialog), About us (founders' story) and Menu (all items from `data/menu-items.csv`).

**Architecture:** Next.js 16 App Router with every route under `app/[lang]` (`en` | `es`), a `proxy.ts` that redirects unprefixed URLs using `Accept-Language`, and JSON dictionaries loaded on the server. Pure, unit-tested modules hold the logic (CSV parsing/validation, London-time recurring events, booking validation, formatting); Server Components render pages; the only stateful client components are `BookingDialog`, `NavLinks` and `LanguageSwitcher`. Styling uses the Tailwind v4 tokens from `docs/design/tokens.css`.

**Tech Stack:** Next.js 16.3.8, React 19.2.8, Tailwind CSS v4, TypeScript 5, Vitest + React Testing Library (added in Task 1), `next/font/google` (Bricolage Grotesque, Figtree, Geist Mono), `next/image`.

**Spec:** `docs/superpowers/specs/2026-09-30-brew-and-co-website-design.md`. Design system: `docs/design/` (style-guide.md, components.md, design-tokens.json, tokens.css).

## Global Constraints

- Brand name is always **Brew and Co** (never "Brew & Code" in UI or docs after Task 2; the folder/package stays `brew-and-code`).
- This is NOT the Next.js you know: before writing code that touches a Next.js API, read the matching guide in `node_modules/next/dist/docs/` (see `AGENTS.md`). Use `proxy.ts` (not `middleware.ts`), `await params`, `PageProps<"/[lang]">` / `LayoutProps<"/[lang]">` helpers.
- Languages: `en` and `es` only; default `en`. Currency: GBP (£), prices stored as numbers in `price_gbp`, formatted with `Intl.NumberFormat`. Timezone for events/bookings: `Europe/London`.
- Styling only with design tokens / Tailwind token classes (`bg-background`, `text-muted`, `bg-naranja`, `font-display`, `rounded-frame`, `max-w-page`, …). No raw hex in components, no default Tailwind palette (`zinc-*`, `gray-*`…).
- Contrast: never white text on `naranja` (#E2702F); text on `naranja` is `espresso`. `naranja-fuerte` (#C4511A) is for large text, underlines, focus rings and button fills only (3.75:1 on crema); small text/errors use `text-price`.
- Accessibility: visible focus, touch targets ≥ 44px, `alt` in the page language (decorative images `alt=""`), one `<h1>` per page, landmarks, `prefers-reduced-motion` respected.
- No credentials or API keys in code or docs. The Pexels API key, if ever used, comes from `PEXELS_API_KEY` in the environment. The only env var used by the app is `NEXT_PUBLIC_SITE_URL` (not secret).
- Copy, founders (Maya Okafor, Tom Hargreaves), address, phone, hours and £ prices are invented placeholders (phone uses the Ofcom fictional range `020 7946 0xxx`). Every one is listed in `docs/PLACEHOLDERS.md` (Task 14). A human must review all copy before publication.
- The booking form is a mock: it stores and sends nothing, yet its confirmation says a table was noted. Do not deploy publicly until `submitBooking` is connected to a real channel.
- Every commit message ends with the trailer `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>` (pass it as a second `-m`).
- Internal docs and code comments are in Spanish; UI copy follows the page language; code identifiers in English.

**Deviations from the spec (intentional):** `LanguageSwitcher` is a small client component (needs `usePathname`) and lives in the header instead of the footer; `CategoryBubble` is folded into `CategoryNav` (YAGNI); address/phone live in `lib/site.ts` (one source for footer and JSON-LD) instead of the dictionaries.

## Review Focus

Inputs/conditions the spec implies but does not spell out; each has a test in the named task.

1. **Upcoming events frozen at build time.** A static page built on Monday would keep showing last week's events. Expected: the list refreshes within an hour (ISR `revalidate = 3600`) — Task 10, verified in build output.
2. **Clock changes (GMT/BST).** Events must start at 17:30 / 10:00 London time on both sides of 29 Mar and 25 Oct, regardless of server timezone — Task 5 tests.
3. **London date vs UTC date.** At 00:30 BST the UTC date is still "yesterday"; a booking for "today" (London) must be judged against the London date, and "today after closing time" must be rejected — Task 6 tests.
4. **Messy CSV.** Commas and escaped quotes inside descriptions, CRLF, BOM, blank lines, missing columns, bad category/badge/price, duplicate names: the build must fail with row + column, never render a broken menu — Task 4 tests.
5. **Missing or unsupported language.** No `Accept-Language`, `*`, `q=0`, `fr-FR`, or a URL like `/fr/menu` must land on `/en` or return 404, never crash — Task 3 tests + build check.

---

## File Structure

```
app/
  [lang]/layout.tsx            root layout: <html lang>, fonts, header/footer, skip link
  [lang]/page.tsx              Home
  [lang]/menu/page.tsx         Menu
  [lang]/about/page.tsx        About us
  sitemap.ts  robots.ts
proxy.ts
dictionaries/ en.json es.json get-dictionary.ts dictionaries.test.ts
data/ menu-items.csv menu.ts menu.test.ts menu-images.test.ts events.ts events.test.ts
lib/
  i18n.ts  format.ts  london-time.ts  site.ts  seo.ts  structured-data.ts  (+ *.test.ts)
  booking/ opening-hours.ts validate-booking.ts submit-booking.ts (+ *.test.ts)
components/
  ui/ Container.tsx Button.tsx Badge.tsx ProductDisc.tsx tones.ts
  layout/ Logo.tsx SiteHeader.tsx NavLinks.tsx LanguageSwitcher.tsx Footer.tsx
  booking/ BookingDialog.tsx
  sections/ Hero.tsx PopularItems.tsx UpcomingEvents.tsx CategoryNav.tsx MenuSection.tsx MenuItemCard.tsx
public/images/ hero.jpg about.jpg categories/*.jpg menu/*.jpg CREDITS.md
docs/PLACEHOLDERS.md
vitest.config.ts vitest.setup.ts .env.example
```

---

### Task 1: Test tooling

**Files:**
- Modify: `package.json`
- Create: `vitest.config.ts`, `vitest.setup.ts`, `tests/tooling.test.tsx`

**Interfaces:**
- Produces: `npm test` (vitest run), `npm run typecheck`, alias `@/` → project root in tests, jsdom with a working `HTMLDialogElement.showModal()/close()` polyfill and jest-dom matchers.

- [ ] **Step 1: Baseline the repo**

Run (from `brew-and-code/`):
```bash
git status --short
```
If `docs/`, `AGENTS.md`, `CLAUDE.md` show as untracked, commit them first so later diffs are clean:
```bash
git add docs AGENTS.md CLAUDE.md
git commit -m "chore: add design docs and project baseline" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

- [ ] **Step 2: Install dev dependencies**

```bash
npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/dom @testing-library/user-event @testing-library/jest-dom
```

- [ ] **Step 3: Add scripts to `package.json`** (inside `"scripts"`)

```json
"test": "vitest run",
"test:watch": "vitest",
"typecheck": "tsc --noEmit"
```

- [ ] **Step 4: Create `vitest.config.ts`**

```ts
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  resolve: { alias: { "@": fileURLToPath(new URL("./", import.meta.url)) } },
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    include: ["**/*.test.{ts,tsx}"],
    exclude: ["node_modules/**", ".next/**"],
  },
});
```

- [ ] **Step 5: Create `vitest.setup.ts`**

```ts
import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

afterEach(() => cleanup());

// jsdom no implementa <dialog>.showModal()/close(); simulamos lo esencial.
HTMLDialogElement.prototype.showModal = function (this: HTMLDialogElement) {
  this.setAttribute("open", "");
};
HTMLDialogElement.prototype.close = function (this: HTMLDialogElement) {
  if (!this.hasAttribute("open")) return;
  this.removeAttribute("open");
  this.dispatchEvent(new Event("close"));
};
```

- [ ] **Step 6: Write a tooling smoke test** `tests/tooling.test.tsx`

```tsx
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
```

- [ ] **Step 7: Run tests**

Run: `npm test`
Expected: 2 passed.

- [ ] **Step 8: Commit**

```bash
git add package.json package-lock.json vitest.config.ts vitest.setup.ts tests/tooling.test.tsx
git commit -m "chore: add vitest and testing-library tooling" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

### Task 2: Brand rename, tokens and global CSS

**Files:**
- Modify: `docs/design/style-guide.md`, `docs/design/components.md`, `docs/design/design-tokens.json`, `docs/design/tokens.css`, `docs/design/README.md`, `app/globals.css`

**Interfaces:**
- Produces: Tailwind token classes used by every later task, incl. new `naranja-profundo` (`bg-naranja-profundo`). `app/globals.css` imports `docs/design/tokens.css`.

- [ ] **Step 1: Rename the brand in the design docs**

```bash
sed -i 's/Brew & Code/Brew and Co/g' docs/design/style-guide.md docs/design/components.md docs/design/design-tokens.json docs/design/tokens.css docs/design/README.md
grep -rn "Brew & Code\|brew-and-code\|\"&\"" docs/design
```
Expected after sed: no "Brew & Code" left. Fix what the grep still shows:
- `style-guide.md` §1 table row for the logo and §7: the wordmark is "Brew and Co" in Bricolage 800 with **"and" in `naranja-fuerte`** (24px bold = large text, passes 3:1); remove every mention of the "&" as a detail.
- `components.md` → `Logo`: same change ("and" in `naranja-fuerte`); `aria-label="Brew and Co, inicio"`.

- [ ] **Step 2: Correct the contrast guidance (`naranja-fuerte` fails 4.5:1 on crema)**

In `style-guide.md` §2 contrast table add the row `| naranja-fuerte sobre crema | ≈ 3.75:1 | Solo texto grande (≥ 24px, o ≥ 18.66px en negrita), subrayados, anillo de foco, rellenos |` and the row `| blanco sobre naranja-profundo | ≈ 6:1 | Hover del botón de acento |`. Add the rule: "Texto pequeño, enlaces y mensajes de error usan `precio` (#8A2E14, ≈ 7.8:1)". In `design-tokens.json` and the token table change the `naranja-fuerte` description from "texto/enlaces/focus" to "texto grande, subrayados, focus, fills". In `components.md` SearchField/forms: errors use `text-price`.

- [ ] **Step 3: Add the `naranja-profundo` token**

`design-tokens.json` (inside `"color"`): `"naranja-profundo": { "$value": "#A94215", "$description": "Hover del botón de acento (6:1 con blanco)" },`
`tokens.css` (inside `@theme inline`, after `--color-naranja-fuerte`): `--color-naranja-profundo: #a94215;`

- [ ] **Step 4: Update category tones, prices, button variants**

- `style-guide.md` §2 "Halos de categoría": `Espresso drinks → mostaza · Cold drinks → menta · Sandwiches → durazno · Pastries → frambuesa · naranja = destacado`. Same mapping in `components.md` → `CategoryBubble`.
- `style-guide.md` §3 precios: replace the COP rule with "Precios en libras: `£3.60` (en-GB) y `3,60 £` (es-ES), siempre con `Intl.NumberFormat`".
- `components.md` → `Button`: add variant `light` (`bg-espuma text-espresso hover:bg-crema`, para fondos oscuros/fotos); accent hover is `bg-naranja-profundo`; primary is `bg-foreground text-background` (invierte en modo oscuro); remove the `icon` prop (no implementado).
- `components.md` → `ProductDisc`: clarify that, with stock photos (rectangulares, sin fondo transparente), the image is cropped into a circle over a larger disc of the tone color.

- [ ] **Step 5: Point `app/globals.css` at the tokens**

Replace the whole file with:
```css
@import "tailwindcss";
@import "../docs/design/tokens.css";
```

- [ ] **Step 6: Verify Tailwind resolves the import and tokens**

Run: `npm run build`
Expected: build succeeds. If it fails with a message about the `@import` path or `@theme`, copy the content of `docs/design/tokens.css` into `app/globals.css` below `@import "tailwindcss";` instead (keep the docs file as the reference) and rerun. (The temporary template page still renders; fonts are wired in Task 3.)

- [ ] **Step 7: Commit**

```bash
git add docs/design app/globals.css
git commit -m "feat(design): rename brand to Brew and Co, fix contrast rules, wire tokens" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

### Task 3: i18n core, dictionaries and root layout

**Files:**
- Create: `lib/i18n.ts`, `lib/i18n.test.ts`, `proxy.ts`, `dictionaries/en.json`, `dictionaries/es.json`, `dictionaries/get-dictionary.ts`, `dictionaries/dictionaries.test.ts`, `app/[lang]/layout.tsx`, `app/[lang]/page.tsx` (temporary)
- Delete: `app/layout.tsx`, `app/page.tsx`

**Interfaces:**
- Produces:
  - `lib/i18n.ts`: `locales: readonly ["en","es"]`, `type Locale`, `defaultLocale: Locale`, `hasLocale(v: string): v is Locale`, `pickLocale(acceptLanguage: string | null): Locale`, `switchLocalePath(pathname: string, target: Locale): string`.
  - `dictionaries/get-dictionary.ts`: `type Dictionary`, `getDictionary(locale: Locale): Promise<Dictionary>`.
  - Dictionary keys used by later tasks (complete shape below).

- [ ] **Step 1: Write the failing tests** `lib/i18n.test.ts`

```ts
import { describe, expect, test } from "vitest";
import { defaultLocale, hasLocale, pickLocale, switchLocalePath } from "./i18n";

describe("hasLocale", () => {
  test("acepta solo en y es", () => {
    expect(hasLocale("en")).toBe(true);
    expect(hasLocale("es")).toBe(true);
    expect(hasLocale("fr")).toBe(false);
    expect(hasLocale("")).toBe(false);
  });
});

describe("pickLocale", () => {
  test("sin cabecera usa el idioma por defecto", () => {
    expect(pickLocale(null)).toBe(defaultLocale);
    expect(pickLocale("")).toBe(defaultLocale);
  });
  test("elige el idioma soportado con mayor peso", () => {
    expect(pickLocale("es-CO,es;q=0.9,en;q=0.8")).toBe("es");
    expect(pickLocale("en;q=0.5,es;q=0.9")).toBe("es");
  });
  test("ignora idiomas no soportados, comodín y q=0", () => {
    expect(pickLocale("fr-FR,fr;q=0.9")).toBe("en");
    expect(pickLocale("*")).toBe("en");
    expect(pickLocale("es;q=0")).toBe("en");
    expect(pickLocale("es;q=abc")).toBe("en");
  });
});

describe("switchLocalePath", () => {
  test("cambia el prefijo conservando la ruta", () => {
    expect(switchLocalePath("/en/menu", "es")).toBe("/es/menu");
    expect(switchLocalePath("/es/about", "en")).toBe("/en/about");
    expect(switchLocalePath("/en", "es")).toBe("/es");
    expect(switchLocalePath("/", "es")).toBe("/es");
  });
});
```

- [ ] **Step 2: Run to verify failure**

Run: `npx vitest run lib/i18n.test.ts`
Expected: FAIL (cannot find `./i18n`).

- [ ] **Step 3: Implement** `lib/i18n.ts`

```ts
export const locales = ["en", "es"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";

export function hasLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

/** Elige el idioma soportado con mayor prioridad en Accept-Language. */
export function pickLocale(acceptLanguage: string | null): Locale {
  if (!acceptLanguage) return defaultLocale;
  const ranked = acceptLanguage
    .split(",")
    .map((part) => {
      const [tag, ...params] = part.trim().split(";");
      const q = params.map((p) => p.trim()).find((p) => p.startsWith("q="));
      const weight = q ? Number(q.slice(2)) : 1;
      return {
        base: tag.trim().toLowerCase().split("-")[0],
        weight: Number.isNaN(weight) ? 0 : weight,
      };
    })
    .filter((entry) => entry.base && entry.weight > 0)
    .sort((a, b) => b.weight - a.weight);
  for (const { base } of ranked) {
    if (hasLocale(base)) return base;
  }
  return defaultLocale;
}

/** "/en/menu" + "es" → "/es/menu". Funciona también sin prefijo. */
export function switchLocalePath(pathname: string, target: Locale): string {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length > 0 && hasLocale(segments[0])) segments.shift();
  return "/" + [target, ...segments].join("/");
}
```

- [ ] **Step 4: Run to verify pass**

Run: `npx vitest run lib/i18n.test.ts`
Expected: all pass.

- [ ] **Step 5: Create `dictionaries/en.json`** (complete shape; later tasks only read from it)

```json
{
  "meta": {
    "siteName": "Brew and Co",
    "home": {
      "title": "Brew and Co | Specialty coffee in London",
      "description": "Neighbourhood café serving specialty coffee, fresh pastries and light lunches. Open mic every Friday, coffee tasting every Saturday."
    },
    "about": {
      "title": "Our story | Brew and Co",
      "description": "Meet the two friends who opened Brew and Co, a neighbourhood specialty coffee shop in London."
    },
    "menu": {
      "title": "Menu | Brew and Co",
      "description": "Espresso drinks, fresh pastries, sandwiches and cold drinks. See the full Brew and Co menu with prices."
    }
  },
  "skipToContent": "Skip to content",
  "nav": { "label": "Main", "home": "Home", "menu": "Menu", "about": "About us" },
  "language": { "label": "Language", "en": "English", "es": "Español" },
  "hero": {
    "title": "Your neighbourhood coffee, done properly.",
    "subtitle": "Specialty coffee, pastries baked this morning and light lunches, right on your corner.",
    "viewMenu": "See the menu"
  },
  "popular": {
    "title": "Most ordered",
    "intro": "What our regulars ask for first.",
    "viewAll": "See the full menu"
  },
  "events": {
    "title": "What's on",
    "intro": "Every week, come for the coffee and stay for the company.",
    "items": {
      "openMic": {
        "title": "Open mic night",
        "description": "Sign up at the counter and play, read or sing. Everyone listens, everyone claps."
      },
      "tasting": {
        "title": "Saturday coffee tasting",
        "description": "Taste three single-origin coffees with our roaster and learn what to look for in the cup."
      }
    }
  },
  "badges": { "popular": "Popular", "house-favourite": "House favourite" },
  "categories": {
    "espresso": "Espresso drinks",
    "pastries": "Pastries",
    "sandwiches": "Sandwiches",
    "cold": "Cold drinks"
  },
  "menu": {
    "title": "Our menu",
    "intro": "Coffee from small roasters, pastries baked each morning and lunches made to order. Prices in pounds.",
    "jumpTo": "Jump to a category"
  },
  "about": {
    "title": "Two friends, one corner, a lot of coffee",
    "imageAlt": "Two baristas working behind a café counter",
    "caption": "Maya Okafor and Tom Hargreaves, founders of Brew and Co.",
    "paragraphs": [
      "Maya spent six years pulling shots in other people's cafés. Tom spent them in an office three streets from the market stall where she served coffee on Saturdays. He was her most regular regular.",
      "In 2019, over a cup that went cold while they talked, they decided the neighbourhood needed a café that took coffee seriously without taking itself seriously.",
      "It took two years to find the corner, one winter to paint it and a great many borrowed ladders. We opened with four tables, one grinder and a hand-written menu.",
      "We buy from small roasters we have visited, and we bake every morning: the croissants before seven, the brownies while the first customers are already at the door. Lunches are simple, made to order and usually finished by whoever is nearest the kitchen.",
      "The open mic began because a regular asked if she could play one song. Now it fills the room every Friday. The Saturday tastings began because we couldn't stop talking about coffee, and someone said we should invite people to taste along."
    ],
    "closing": "Come and say hello. The kettle is always on, and there is usually a seat by the window."
  },
  "booking": {
    "open": "Reserve a table",
    "title": "Reserve a table",
    "description": "Tell us when you'd like to come and we'll have a table ready.",
    "fields": {
      "name": "Your name",
      "partySize": "Number of people",
      "partySizeHint": "For more than 12 people, please call us.",
      "date": "Date",
      "time": "Time"
    },
    "personOne": "1 person",
    "personMany": "{n} people",
    "submit": "Reserve table",
    "submitting": "Sending…",
    "close": "Close",
    "success": {
      "title": "Table reserved",
      "message": "Thanks, {name}. We've noted a table for {partySize} on {date} at {time}."
    },
    "errors": {
      "nameLength": "Enter your name (2 to 60 characters).",
      "partySizeRange": "Choose between 1 and 12 people.",
      "dateInvalid": "Enter a valid date.",
      "datePast": "Choose today or a later date.",
      "dateTooFar": "We take reservations up to 60 days ahead.",
      "timeInvalid": "Enter a valid time, for example 18:30.",
      "timeClosed": "We're closed at that time. Choose a time during opening hours.",
      "timePast": "Choose a time later than now.",
      "submitFailed": "We couldn't send your request. Try again in a moment."
    }
  },
  "footer": {
    "visit": "Visit us",
    "hoursTitle": "Opening hours",
    "phoneLabel": "Phone",
    "rights": "© {year} Brew and Co"
  }
}
```

- [ ] **Step 6: Create `dictionaries/es.json`** (same keys)

```json
{
  "meta": {
    "siteName": "Brew and Co",
    "home": {
      "title": "Brew and Co | Café de especialidad en Londres",
      "description": "Cafetería de barrio con café de especialidad, pasteles frescos y almuerzos ligeros. Micrófono abierto los viernes y cata de café los sábados."
    },
    "about": {
      "title": "Nuestra historia | Brew and Co",
      "description": "Conoce a los dos amigos que abrieron Brew and Co, una cafetería de especialidad de barrio en Londres."
    },
    "menu": {
      "title": "Menú | Brew and Co",
      "description": "Bebidas espresso, pasteles frescos, sándwiches y bebidas frías. Consulta el menú completo de Brew and Co con precios."
    }
  },
  "skipToContent": "Saltar al contenido",
  "nav": { "label": "Principal", "home": "Inicio", "menu": "Menú", "about": "Nosotros" },
  "language": { "label": "Idioma", "en": "English", "es": "Español" },
  "hero": {
    "title": "El café de tu barrio, hecho como debe ser.",
    "subtitle": "Café de especialidad, pasteles horneados esta mañana y almuerzos ligeros, en tu esquina.",
    "viewMenu": "Ver el menú"
  },
  "popular": {
    "title": "Lo más pedido",
    "intro": "Lo primero que piden nuestros clientes habituales.",
    "viewAll": "Ver el menú completo"
  },
  "events": {
    "title": "Próximos eventos",
    "intro": "Cada semana, ven por el café y quédate por la compañía.",
    "items": {
      "openMic": {
        "title": "Noche de micrófono abierto",
        "description": "Apúntate en el mostrador y toca, lee o canta. Todos escuchan, todos aplauden."
      },
      "tasting": {
        "title": "Cata de café del sábado",
        "description": "Prueba tres cafés de origen único con nuestro tostador y aprende qué buscar en la taza."
      }
    }
  },
  "badges": { "popular": "Popular", "house-favourite": "Favorito de la casa" },
  "categories": {
    "espresso": "Bebidas espresso",
    "pastries": "Pasteles",
    "sandwiches": "Sándwiches",
    "cold": "Bebidas frías"
  },
  "menu": {
    "title": "Nuestro menú",
    "intro": "Café de pequeños tostadores, pasteles horneados cada mañana y almuerzos hechos al momento. Precios en libras.",
    "jumpTo": "Ir a una categoría"
  },
  "about": {
    "title": "Dos amigos, una esquina y mucho café",
    "imageAlt": "Dos baristas trabajando detrás del mostrador de una cafetería",
    "caption": "Maya Okafor y Tom Hargreaves, fundadores de Brew and Co.",
    "paragraphs": [
      "Maya pasó seis años sacando espressos en cafeterías ajenas. Tom los pasó en una oficina a tres calles del puesto del mercado donde ella servía café los sábados. Era su cliente más fiel.",
      "En 2019, sobre una taza que se enfrió mientras hablaban, decidieron que el barrio necesitaba una cafetería que se tomara el café en serio sin tomarse a sí misma demasiado en serio.",
      "Tardaron dos años en encontrar la esquina, un invierno en pintarla y muchas escaleras prestadas. Abrimos con cuatro mesas, un molino y un menú escrito a mano.",
      "Compramos a pequeños tostadores que hemos visitado y horneamos cada mañana: los croissants antes de las siete, los brownies cuando ya hay clientes en la puerta. Los almuerzos son sencillos, hechos al momento y los termina quien esté más cerca de la cocina.",
      "El micrófono abierto empezó porque una clienta preguntó si podía tocar una canción. Ahora llena el local cada viernes. Las catas del sábado empezaron porque no parábamos de hablar de café y alguien dijo que deberíamos invitar a la gente a probarlo con nosotros."
    ],
    "closing": "Ven a saludarnos. La tetera siempre está caliente y casi siempre queda un sitio junto a la ventana."
  },
  "booking": {
    "open": "Reservar una mesa",
    "title": "Reservar una mesa",
    "description": "Dinos cuándo quieres venir y tendremos una mesa lista.",
    "fields": {
      "name": "Tu nombre",
      "partySize": "Número de personas",
      "partySizeHint": "Para más de 12 personas, llámanos.",
      "date": "Fecha",
      "time": "Hora"
    },
    "personOne": "1 persona",
    "personMany": "{n} personas",
    "submit": "Reservar mesa",
    "submitting": "Enviando…",
    "close": "Cerrar",
    "success": {
      "title": "Mesa reservada",
      "message": "Gracias, {name}. Hemos anotado una mesa para {partySize} el {date} a las {time}."
    },
    "errors": {
      "nameLength": "Escribe tu nombre (de 2 a 60 caracteres).",
      "partySizeRange": "Elige entre 1 y 12 personas.",
      "dateInvalid": "Escribe una fecha válida.",
      "datePast": "Elige hoy o una fecha posterior.",
      "dateTooFar": "Aceptamos reservas hasta con 60 días de antelación.",
      "timeInvalid": "Escribe una hora válida, por ejemplo 18:30.",
      "timeClosed": "A esa hora estamos cerrados. Elige una hora dentro del horario.",
      "timePast": "Elige una hora posterior a la actual.",
      "submitFailed": "No pudimos enviar tu solicitud. Inténtalo de nuevo en un momento."
    }
  },
  "footer": {
    "visit": "Visítanos",
    "hoursTitle": "Horario",
    "phoneLabel": "Teléfono",
    "rights": "© {year} Brew and Co"
  }
}
```

- [ ] **Step 7: Write the dictionary parity test** `dictionaries/dictionaries.test.ts`

```ts
import { describe, expect, test } from "vitest";
import en from "./en.json";
import es from "./es.json";

function leaves(value: unknown, prefix = ""): [string, string][] {
  if (Array.isArray(value)) {
    return [[`${prefix}.length=${value.length}`, ""], ...value.flatMap((v, i) => leaves(v, `${prefix}[${i}]`))];
  }
  if (value && typeof value === "object") {
    return Object.entries(value).flatMap(([k, v]) => leaves(v, prefix ? `${prefix}.${k}` : k));
  }
  return [[prefix, String(value)]];
}

const enLeaves = leaves(en);
const esLeaves = leaves(es);

describe("diccionarios", () => {
  test("en y es tienen exactamente las mismas claves", () => {
    expect(esLeaves.map(([k]) => k).sort()).toEqual(enLeaves.map(([k]) => k).sort());
  });

  test("ningún texto está vacío", () => {
    for (const [key, value] of [...enLeaves, ...esLeaves]) {
      if (key.includes(".length=")) continue; // entradas sintéticas de longitud de arrays
      expect(value, key).not.toBe("");
    }
  });

  test("los marcadores {x} coinciden entre idiomas", () => {
    const tokens = (entries: [string, string][]) =>
      Object.fromEntries(entries.map(([k, v]) => [k, (v.match(/\{\w+\}/g) ?? []).sort().join(",")]));
    expect(tokens(esLeaves)).toEqual(tokens(enLeaves));
  });
});
```

- [ ] **Step 8: Run to verify pass**

Run: `npx vitest run dictionaries`
Expected: 3 passed.

- [ ] **Step 9: Create `dictionaries/get-dictionary.ts`**

```ts
import "server-only";
import type { Locale } from "@/lib/i18n";

const loaders = {
  en: () => import("./en.json").then((m) => m.default),
  es: () => import("./es.json").then((m) => m.default),
} satisfies Record<Locale, () => Promise<unknown>>;

export type Dictionary = Awaited<ReturnType<(typeof loaders)["en"]>>;

export const getDictionary = (locale: Locale): Promise<Dictionary> => loaders[locale]();
```

- [ ] **Step 10: Create `proxy.ts`** (project root)

```ts
import { NextResponse, type NextRequest } from "next/server";
import { hasLocale, pickLocale } from "@/lib/i18n";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const first = pathname.split("/")[1];
  if (hasLocale(first)) return;

  const locale = pickLocale(request.headers.get("accept-language"));
  request.nextUrl.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(request.nextUrl);
}

export const config = {
  // Excluye _next, api y cualquier archivo con extensión (imágenes, sitemap.xml, robots.txt…).
  matcher: ["/((?!_next|api|.*\\..*).*)"],
};
```

- [ ] **Step 11: Replace the root layout with `app/[lang]/layout.tsx`**

```bash
mkdir -p "app/[lang]"
git rm app/layout.tsx app/page.tsx
```
`app/[lang]/layout.tsx`:
```tsx
import { Bricolage_Grotesque, Figtree, Geist_Mono } from "next/font/google";
import { notFound } from "next/navigation";
import { getDictionary } from "@/dictionaries/get-dictionary";
import { hasLocale, locales } from "@/lib/i18n";
import "../globals.css";

const bricolage = Bricolage_Grotesque({ variable: "--font-bricolage", subsets: ["latin"], weight: ["700", "800"] });
const figtree = Figtree({ variable: "--font-figtree", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const dynamicParams = false;

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export default async function RootLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);

  return (
    <html
      lang={lang}
      className={`${bricolage.variable} ${figtree.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-foreground focus:px-4 focus:py-2 focus:text-background"
        >
          {dict.skipToContent}
        </a>
        {children}
      </body>
    </html>
  );
}
```
Temporary `app/[lang]/page.tsx`:
```tsx
import { notFound } from "next/navigation";
import { getDictionary } from "@/dictionaries/get-dictionary";
import { hasLocale } from "@/lib/i18n";

export default async function HomePage({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  return (
    <main id="main" className="p-8">
      <h1 className="font-display text-5xl font-extrabold">{dict.hero.title}</h1>
    </main>
  );
}
```

- [ ] **Step 12: Generate route types and verify build + redirects**

```bash
npx next typegen
npm run typecheck
npm run build
```
Expected: typecheck clean; build lists `/en` and `/es` as static (●). If `next typegen` is unknown, skip it (build generates the types).

Then test the proxy:
```bash
npx next start -p 3100 &
sleep 4
curl -s -o /dev/null -w "%{http_code} %{redirect_url}\n" http://localhost:3100/
curl -s -o /dev/null -w "%{http_code} %{redirect_url}\n" -H "Accept-Language: es-CO,es;q=0.9" http://localhost:3100/
curl -s -o /dev/null -w "%{http_code} %{redirect_url}\n" -H "Accept-Language: *" http://localhost:3100/menu
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3100/fr/menu
curl -s http://localhost:3100/es | grep -o '<html lang="[a-z]*"'
kill %1
```
Expected: `307 …/en`; `307 …/es`; `307 …/en/menu`; `404`; `<html lang="es"`.

- [ ] **Step 13: Commit**

```bash
git add lib/i18n.ts lib/i18n.test.ts proxy.ts dictionaries "app/[lang]"
git commit -m "feat(i18n): locale routing, dictionaries and root layout" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```
(`git rm` already staged the deletions of `app/layout.tsx` and `app/page.tsx`.)

---

### Task 4: Menu data (CSV parser, validation, helpers)

**Files:**
- Create: `data/menu-items.csv` (moved from `docs/menu-items.csv` and rewritten), `data/menu.ts`, `data/menu.test.ts`, `lib/format.ts`, `lib/format.test.ts`
- Delete: `docs/menu-items.csv`

**Interfaces:**
- Consumes: `Locale` from `lib/i18n`.
- Produces:
  - `data/menu.ts`: `categoryIds` (`["espresso","pastries","sandwiches","cold"]`), `type CategoryId`, `badgeIds` (`["popular","house-favourite"]`), `type BadgeId`, `interface MenuItem { id: string; category: CategoryId; name: Record<Locale,string>; description: Record<Locale,string>; priceGbp: number; badge: BadgeId | null; image: string | null }`, `parseCsv(text): string[][]`, `parseMenu(text): MenuItem[]`, `getMenu(): MenuItem[]`, `groupByCategory(items): { category: CategoryId; items: MenuItem[] }[]`, `getFeatured(items, count): MenuItem[]`, `menuImageSrc(item): string`.
  - `lib/format.ts`: `intlLocale: Record<Locale,string>`, `formatPrice(amount: number, locale: Locale): string`.

- [ ] **Step 1: Write the failing tests** `data/menu.test.ts`

```ts
import { describe, expect, test } from "vitest";
import {
  categoryIds, getFeatured, getMenu, groupByCategory, menuImageSrc, parseCsv, parseMenu,
} from "./menu";

const HEADER = "category,name_en,name_es,description_en,description_es,price_gbp,badge,image";
const row = (over: Partial<Record<string, string>> = {}) => {
  const v = { category: "espresso", name_en: "Espresso", name_es: "Espresso", description_en: "Strong.", description_es: "Fuerte.", price_gbp: "3.00", badge: "", image: "", ...over };
  return [v.category, v.name_en, v.name_es, v.description_en, v.description_es, v.price_gbp, v.badge, v.image].join(",");
};

describe("parseCsv", () => {
  test("parsea filas simples", () => {
    expect(parseCsv("a,b\nc,d")).toEqual([["a", "b"], ["c", "d"]]);
  });
  test("respeta comas y comillas escapadas dentro de comillas", () => {
    expect(parseCsv('a,"b, c","say ""hi"""\n')).toEqual([["a", "b, c", 'say "hi"']]);
  });
  test("acepta CRLF, BOM, línea final y líneas en blanco", () => {
    expect(parseCsv("\uFEFFa,b\r\n\r\nc,d\r\n")).toEqual([["a", "b"], ["c", "d"]]);
  });
  test("conserva campos vacíos al final", () => {
    expect(parseCsv("a,,")).toEqual([["a", "", ""]]);
  });
  test("falla con comillas sin cerrar", () => {
    expect(() => parseCsv('a,"b')).toThrow(/unterminated/i);
  });
});

describe("parseMenu", () => {
  test("convierte una fila válida en un MenuItem", () => {
    const [item] = parseMenu(`${HEADER}\n${row({ badge: "popular", image: "cappuccino", name_en: "Flat white", price_gbp: "3.90" })}\n`);
    expect(item).toEqual({
      id: "flat-white", category: "espresso",
      name: { en: "Flat white", es: "Espresso" },
      description: { en: "Strong.", es: "Fuerte." },
      priceGbp: 3.9, badge: "popular", image: "cappuccino",
    });
  });
  test("badge e image vacíos se convierten en null", () => {
    const [item] = parseMenu(`${HEADER}\n${row()}`);
    expect(item.badge).toBeNull();
    expect(item.image).toBeNull();
  });
  test.each([
    ["category", { category: "tea" }, /row 2, column "category"/],
    ["name_en", { name_en: "" }, /row 2, column "name_en"/],
    ["description_es", { description_es: "" }, /row 2, column "description_es"/],
    ["price_gbp", { price_gbp: "abc" }, /row 2, column "price_gbp"/],
    ["price_gbp", { price_gbp: "0" }, /row 2, column "price_gbp"/],
    ["price_gbp", { price_gbp: "3.999" }, /row 2, column "price_gbp"/],
    ["badge", { badge: "hot" }, /row 2, column "badge"/],
    ["image", { image: "Cap Puccino.jpg" }, /row 2, column "image"/],
  ])("rechaza %s inválido indicando fila y columna", (_col, over, message) => {
    expect(() => parseMenu(`${HEADER}\n${row(over)}`)).toThrow(message);
  });
  test("rechaza filas con columnas de más o de menos", () => {
    expect(() => parseMenu(`${HEADER}\nespresso,Only,Two`)).toThrow(/row 2: expected 8 columns, found 3/);
  });
  test("rechaza cabecera distinta", () => {
    expect(() => parseMenu("category,name\nx,y")).toThrow(/row 1/);
  });
  test("rechaza nombres duplicados", () => {
    expect(() => parseMenu(`${HEADER}\n${row()}\n${row()}`)).toThrow(/row 3, column "name_en".*duplicate/);
  });
});

describe("helpers", () => {
  const menu = getMenu();
  test("el menú real tiene 20 artículos válidos en 4 categorías", () => {
    expect(menu).toHaveLength(20);
    expect(groupByCategory(menu).map((g) => g.category)).toEqual([...categoryIds]);
    for (const group of groupByCategory(menu)) expect(group.items.length).toBeGreaterThanOrEqual(4);
  });
  test("hay 4 populares y 4 favoritos de la casa", () => {
    expect(menu.filter((i) => i.badge === "popular")).toHaveLength(4);
    expect(menu.filter((i) => i.badge === "house-favourite")).toHaveLength(4);
  });
  test("getFeatured reparte entre categorías y solo devuelve artículos con insignia", () => {
    const featured = getFeatured(menu, 4);
    expect(featured).toHaveLength(4);
    expect(featured.every((i) => i.badge !== null)).toBe(true);
    expect(new Set(featured.map((i) => i.category)).size).toBe(4);
  });
  test("getFeatured no inventa artículos si hay pocos", () => {
    expect(getFeatured(menu.filter((i) => i.badge === null), 4)).toEqual([]);
    expect(getFeatured(menu, 0)).toEqual([]);
  });
  test("menuImageSrc usa la foto del artículo o la de su categoría", () => {
    const withImage = menu.find((i) => i.image)!;
    const without = menu.find((i) => !i.image)!;
    expect(menuImageSrc(withImage)).toBe(`/images/menu/${withImage.image}.jpg`);
    expect(menuImageSrc(without)).toBe(`/images/categories/${without.category}.jpg`);
  });
});
```
`lib/format.test.ts` (price part; event formatters are added in Task 5/7):
```ts
import { describe, expect, test } from "vitest";
import { formatPrice } from "./format";

describe("formatPrice", () => {
  test("en: £3.60", () => expect(formatPrice(3.6, "en")).toBe("£3.60"));
  test("es: 3,60 £", () => expect(formatPrice(3.6, "es")).toMatch(/^3,60\s£$/));
});
```

- [ ] **Step 2: Run to verify failure**

Run: `npx vitest run data lib/format.test.ts`
Expected: FAIL (modules not found).

- [ ] **Step 3: Move and rewrite the CSV**

```bash
mkdir -p data
git mv docs/menu-items.csv data/menu-items.csv
```
Overwrite `data/menu-items.csv` with:
```csv
category,name_en,name_es,description_en,description_es,price_gbp,badge,image
espresso,Espresso,Espresso,"Double shot of single-origin espresso, intense with a thick crema.","Shot doble de espresso de origen único, intenso y con crema espesa.",3.00,,
espresso,Americano,Americano,"Espresso lengthened with hot water, smooth and clean in the cup.","Espresso alargado con agua caliente, suave y limpio en taza.",3.30,,
espresso,Cappuccino,Cappuccino,"Espresso with steamed milk under a thick layer of creamy foam.","Espresso con leche vaporizada y una capa gruesa de espuma cremosa.",3.80,popular,cappuccino
espresso,Vanilla latte,Latte de vainilla,"Espresso with silky steamed milk and house-made vanilla syrup.","Espresso con leche texturizada y sirope artesanal de vainilla.",4.40,,latte
espresso,Flat white,Flat white,"Double ristretto with velvety milk and fine microfoam, served in a short cup.","Doble ristretto con leche sedosa y microespuma, servido en taza corta.",3.90,,
espresso,House mocha,Mocha de la casa,"Espresso, melted dark chocolate and milk, finished with whipped cream.","Espresso, chocolate oscuro derretido y leche, coronado con crema batida.",4.60,house-favourite,
espresso,Caramel macchiato,Macchiato de caramelo,"Espresso marked with foamed milk and a ribbon of salted caramel.","Espresso manchado con leche espumada y un hilo de caramelo salado.",4.20,,
pastries,Butter croissant,Croissant de mantequilla,"Flaky and golden, baked every morning with French butter.","Hojaldrado y dorado, horneado cada mañana con mantequilla francesa.",3.20,popular,croissant
pastries,Chocolate brownie,Brownie de chocolate,"Dense 70% cocoa brownie with walnuts and a soft centre.","Brownie denso de cacao 70% con nueces y centro húmedo.",3.50,house-favourite,brownie
pastries,Carrot cake,Torta de zanahoria,"A slice of carrot cake with walnuts and cream cheese frosting.","Porción de torta con nueces y frosting de queso crema.",4.50,,
pastries,Berry cheesecake,Cheesecake de frutos rojos,"Biscuit base, silky cream cheese and a strawberry and blackberry sauce.","Base de galleta, crema suave y salsa de fresa y mora.",5.20,,cheesecake
pastries,Chocolate chip cookie,Galleta de chips de chocolate,"A big cookie, crisp at the edges and soft in the middle.","Galleta grande, crujiente por fuera y suave por dentro.",2.60,,
sandwiches,Chicken and pesto sandwich,Sándwich de pollo y pesto,"Grilled chicken breast, basil pesto, tomato and mozzarella on ciabatta.","Pechuga de pollo a la plancha, pesto de albahaca, tomate y mozzarella en pan ciabatta.",7.50,popular,
sandwiches,Ham and cheese club,Club de jamón y queso,"Serrano ham, Dutch cheese, lettuce and tomato on toasted sandwich bread.","Jamón serrano, queso holandés, lechuga y tomate en pan de molde tostado.",6.90,,
sandwiches,Avocado toast,Tostada de aguacate,"Sourdough with avocado, a poached egg and sesame seeds.","Pan de masa madre con aguacate, huevo pochado y semillas de sésamo.",8.20,house-favourite,avocado-toast
sandwiches,Ham and cheese croissant,Croissant de jamón y queso,"Butter croissant filled with ham and melted cheese, served warm.","Croissant relleno de jamón y queso gratinado, servido caliente.",5.50,,
cold,Cold brew,Cold brew,"Coffee steeped cold for 16 hours and served over ice. No sugar added.","Café infusionado en frío durante 16 horas, servido con hielo. Sin azúcar.",4.20,popular,cold-brew
cold,Chocolate frappé,Frappé de chocolate,"Chocolate, milk and ice blended together, topped with whipped cream and cocoa sauce.","Chocolate, leche y hielo licuados, con crema batida y salsa de cacao.",5.20,house-favourite,
cold,Peach iced tea,Té helado de durazno,"Black tea infused with fresh peach and served over ice. Dairy free.","Té negro infusionado con durazno natural y hielo. Sin lácteos.",3.60,,iced-tea
cold,Coconut lemonade,Limonada de coco,"Fresh lemon, coconut cream and ice, blended to order.","Limón natural, crema de coco y hielo, batida al momento.",4.00,,
```

- [ ] **Step 4: Implement `lib/format.ts`**

```ts
import type { Locale } from "@/lib/i18n";

export const intlLocale: Record<Locale, string> = { en: "en-GB", es: "es-ES" };

export function formatPrice(amount: number, locale: Locale): string {
  return new Intl.NumberFormat(intlLocale[locale], { style: "currency", currency: "GBP" }).format(amount);
}
```

- [ ] **Step 5: Implement `data/menu.ts`**

```ts
import { readFileSync } from "node:fs";
import path from "node:path";
import type { Locale } from "@/lib/i18n";

export const categoryIds = ["espresso", "pastries", "sandwiches", "cold"] as const;
export type CategoryId = (typeof categoryIds)[number];
export const badgeIds = ["popular", "house-favourite"] as const;
export type BadgeId = (typeof badgeIds)[number];

export interface MenuItem {
  id: string;
  category: CategoryId;
  name: Record<Locale, string>;
  description: Record<Locale, string>;
  priceGbp: number;
  badge: BadgeId | null;
  image: string | null;
}

const COLUMNS = ["category", "name_en", "name_es", "description_en", "description_es", "price_gbp", "badge", "image"] as const;
type Column = (typeof COLUMNS)[number];

const isCategoryId = (v: string): v is CategoryId => (categoryIds as readonly string[]).includes(v);
const isBadgeId = (v: string): v is BadgeId => (badgeIds as readonly string[]).includes(v);

/** Parser CSV mínimo: comillas dobles, "" escapado, CRLF, BOM y líneas en blanco. */
export function parseCsv(input: string): string[][] {
  const text = input.replace(/^\uFEFF/, "");
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; } else inQuotes = false;
      } else field += c;
    } else if (c === '"') inQuotes = true;
    else if (c === ",") { row.push(field); field = ""; }
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(field); rows.push(row); row = []; field = "";
    } else field += c;
  }
  if (inQuotes) throw new Error("CSV: unterminated quoted field");
  if (field !== "" || row.length > 0) { row.push(field); rows.push(row); }
  return rows.filter((r) => !(r.length === 1 && r[0] === ""));
}

const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

/** Valida y convierte el CSV. Lanza un Error con fila y columna ante cualquier problema. */
export function parseMenu(text: string): MenuItem[] {
  const [header, ...records] = parseCsv(text);
  if (!header || header.join(",") !== COLUMNS.join(",")) {
    throw new Error(`menu-items.csv row 1: expected header "${COLUMNS.join(",")}"`);
  }
  const seen = new Set<string>();
  return records.map((cells, index): MenuItem => {
    const rowNumber = index + 2;
    const fail = (column: Column, message: string): never => {
      throw new Error(`menu-items.csv row ${rowNumber}, column "${column}": ${message}`);
    };
    if (cells.length !== COLUMNS.length) {
      throw new Error(`menu-items.csv row ${rowNumber}: expected ${COLUMNS.length} columns, found ${cells.length}`);
    }
    const [category, nameEn, nameEs, descEn, descEs, price, badge, image] = cells.map((c) => c.trim());

    if (!isCategoryId(category)) return fail("category", `"${category}" is not one of ${categoryIds.join(", ")}`);
    if (!nameEn) return fail("name_en", "required");
    if (!nameEs) return fail("name_es", "required");
    if (!descEn) return fail("description_en", "required");
    if (!descEs) return fail("description_es", "required");
    if (!/^\d+(\.\d{1,2})?$/.test(price) || Number(price) <= 0) {
      return fail("price_gbp", `"${price}" must be a positive number with at most 2 decimals`);
    }
    if (badge !== "" && !isBadgeId(badge)) return fail("badge", `"${badge}" must be empty or one of ${badgeIds.join(", ")}`);
    if (image !== "" && !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(image)) {
      return fail("image", `"${image}" must be a lowercase file name without extension, e.g. cold-brew`);
    }
    const id = slugify(nameEn);
    if (seen.has(id)) return fail("name_en", `duplicate item "${nameEn}"`);
    seen.add(id);

    return {
      id, category,
      name: { en: nameEn, es: nameEs },
      description: { en: descEn, es: descEs },
      priceGbp: Number(price),
      badge: badge === "" ? null : (badge as BadgeId),
      image: image === "" ? null : image,
    };
  });
}

let cache: MenuItem[] | undefined;
export function getMenu(): MenuItem[] {
  cache ??= parseMenu(readFileSync(path.join(process.cwd(), "data", "menu-items.csv"), "utf8"));
  return cache;
}

export function groupByCategory(items: MenuItem[]): { category: CategoryId; items: MenuItem[] }[] {
  return categoryIds
    .map((category) => ({ category, items: items.filter((i) => i.category === category) }))
    .filter((g) => g.items.length > 0);
}

/** Artículos con insignia, repartidos por categoría (una por categoría antes de repetir). */
export function getFeatured(items: MenuItem[], count: number): MenuItem[] {
  const queues = categoryIds.map((c) => items.filter((i) => i.category === c && i.badge !== null));
  const result: MenuItem[] = [];
  while (result.length < count && queues.some((q) => q.length > 0)) {
    for (const queue of queues) {
      const next = queue.shift();
      if (next && result.length < count) result.push(next);
    }
  }
  return result;
}

export function menuImageSrc(item: MenuItem): string {
  return item.image ? `/images/menu/${item.image}.jpg` : `/images/categories/${item.category}.jpg`;
}
```

- [ ] **Step 6: Run to verify pass**

Run: `npx vitest run data lib/format.test.ts`
Expected: all pass. (`getMenu` tests read `data/menu-items.csv` via `process.cwd()`; run vitest from the project root.)

- [ ] **Step 7: Commit**

```bash
git add data lib/format.ts lib/format.test.ts
git commit -m "feat(menu): bilingual GBP menu CSV with validating parser" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```
(`git mv` already staged the move out of `docs/`.)

---

### Task 5: London time helpers and recurring events

**Files:**
- Create: `lib/london-time.ts`, `lib/london-time.test.ts`, `data/events.ts`, `data/events.test.ts`
- Modify: `lib/format.ts`, `lib/format.test.ts`

**Interfaces:**
- Produces:
  - `lib/london-time.ts`: `LONDON_TZ`, `londonParts(date): { year; month; day; hour; minute }`, `londonLocalToDate(year, month, day, hour, minute): Date`, `londonToday(now: Date): string` (`YYYY-MM-DD`), `londonTimeOfDay(now: Date): string` (`HH:MM`), `addDays(iso: string, days: number): string`.
  - `data/events.ts`: `type EventId = "openMic" | "tasting"`, `interface EventOccurrence { id: EventId; startsAt: Date; endsAt: Date }`, `getUpcomingEvents(now: Date, count: number): EventOccurrence[]`.
  - `lib/format.ts`: `formatEventDate(date: Date, locale: Locale): string`, `formatEventTime(start: Date, end: Date, locale: Locale): string`.

- [ ] **Step 1: Write the failing tests**

`lib/london-time.test.ts`:
```ts
import { describe, expect, test } from "vitest";
import { addDays, londonLocalToDate, londonTimeOfDay, londonToday } from "./london-time";

describe("londonToday / londonTimeOfDay", () => {
  test("usa la fecha de Londres, no la de UTC", () => {
    expect(londonToday(new Date("2026-09-30T23:30:00Z"))).toBe("2026-10-01"); // 00:30 BST
    expect(londonToday(new Date("2026-12-31T23:30:00Z"))).toBe("2026-12-31"); // GMT
    expect(londonTimeOfDay(new Date("2026-09-30T23:30:00Z"))).toBe("00:30");
  });
});

describe("londonLocalToDate", () => {
  test("verano (BST, UTC+1)", () => {
    expect(londonLocalToDate(2026, 7, 1, 12, 0).toISOString()).toBe("2026-07-01T11:00:00.000Z");
  });
  test("invierno (GMT, UTC+0)", () => {
    expect(londonLocalToDate(2026, 12, 1, 12, 0).toISOString()).toBe("2026-12-01T12:00:00.000Z");
  });
});

describe("addDays", () => {
  test("suma días cruzando mes y año", () => {
    expect(addDays("2026-09-30", 60)).toBe("2026-11-29");
    expect(addDays("2026-12-31", 1)).toBe("2027-01-01");
  });
});
```
`data/events.test.ts`:
```ts
import { describe, expect, test } from "vitest";
import { getUpcomingEvents } from "./events";

const iso = (events: ReturnType<typeof getUpcomingEvents>) =>
  events.map((e) => `${e.id} ${e.startsAt.toISOString()}`);

describe("getUpcomingEvents", () => {
  test("devuelve las próximas ocurrencias en orden (verano, BST)", () => {
    const events = getUpcomingEvents(new Date("2026-09-30T12:00:00Z"), 4); // miércoles
    expect(iso(events)).toEqual([
      "openMic 2026-10-02T16:30:00.000Z",
      "tasting 2026-10-03T09:00:00.000Z",
      "openMic 2026-10-09T16:30:00.000Z",
      "tasting 2026-10-10T09:00:00.000Z",
    ]);
  });
  test("un evento en curso sigue apareciendo hasta que termina", () => {
    const during = getUpcomingEvents(new Date("2026-10-02T17:00:00Z"), 1);
    expect(iso(during)).toEqual(["openMic 2026-10-02T16:30:00.000Z"]);
    const after = getUpcomingEvents(new Date("2026-10-02T19:30:00Z"), 1);
    expect(iso(after)).toEqual(["tasting 2026-10-03T09:00:00.000Z"]);
  });
  test("cambio de hora de otoño (25 oct 2026): el mismo horario local en GMT", () => {
    const events = getUpcomingEvents(new Date("2026-10-24T12:00:00Z"), 2);
    expect(iso(events)).toEqual([
      "openMic 2026-10-30T17:30:00.000Z",
      "tasting 2026-10-31T10:00:00.000Z",
    ]);
  });
  test("cambio de hora de primavera (29 mar 2026)", () => {
    const events = getUpcomingEvents(new Date("2026-03-27T00:00:00Z"), 3);
    expect(iso(events)).toEqual([
      "openMic 2026-03-27T17:30:00.000Z",
      "tasting 2026-03-28T10:00:00.000Z",
      "openMic 2026-04-03T16:30:00.000Z",
    ]);
  });
  test("count 0 o negativo devuelve lista vacía", () => {
    expect(getUpcomingEvents(new Date("2026-09-30T12:00:00Z"), 0)).toEqual([]);
    expect(getUpcomingEvents(new Date("2026-09-30T12:00:00Z"), -2)).toEqual([]);
  });
});
```
Add to `lib/format.test.ts`:
```ts
import { formatEventDate, formatEventTime } from "./format";

describe("formatEventDate / formatEventTime", () => {
  const start = new Date("2026-10-02T16:30:00Z"); // 17:30 BST
  const end = new Date("2026-10-02T19:00:00Z"); // 20:00 BST
  test("fecha en inglés y español", () => {
    expect(formatEventDate(start, "en")).toMatch(/Friday.*2 October/);
    expect(formatEventDate(start, "es")).toMatch(/viernes.*2 de octubre/);
  });
  test("rango horario en hora de Londres, 24 h", () => {
    expect(formatEventTime(start, end, "en")).toBe("17:30 – 20:00");
    expect(formatEventTime(start, end, "es")).toBe("17:30 – 20:00");
  });
});
```

- [ ] **Step 2: Run to verify failure**

Run: `npx vitest run lib data/events.test.ts`
Expected: FAIL (modules/exports not found).

- [ ] **Step 3: Implement `lib/london-time.ts`**

```ts
export const LONDON_TZ = "Europe/London";

const formatter = new Intl.DateTimeFormat("en-GB", {
  timeZone: LONDON_TZ,
  year: "numeric", month: "2-digit", day: "2-digit",
  hour: "2-digit", minute: "2-digit",
  hourCycle: "h23",
});

export interface LondonParts { year: number; month: number; day: number; hour: number; minute: number }

/** Componentes de fecha y hora de un instante, vistos desde Londres. */
export function londonParts(date: Date): LondonParts {
  const parts: Record<string, string> = {};
  for (const p of formatter.formatToParts(date)) parts[p.type] = p.value;
  return {
    year: Number(parts.year), month: Number(parts.month), day: Number(parts.day),
    hour: Number(parts.hour), minute: Number(parts.minute),
  };
}

/** Instante (UTC) que corresponde a una hora local de Londres, con GMT/BST correcto. */
export function londonLocalToDate(year: number, month: number, day: number, hour: number, minute: number): Date {
  const wanted = Date.UTC(year, month - 1, day, hour, minute);
  let guess = wanted;
  for (let i = 0; i < 2; i++) {
    const p = londonParts(new Date(guess));
    guess += wanted - Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute);
  }
  return new Date(guess);
}

const pad = (n: number) => String(n).padStart(2, "0");

export function londonToday(now: Date): string {
  const p = londonParts(now);
  return `${p.year}-${pad(p.month)}-${pad(p.day)}`;
}

export function londonTimeOfDay(now: Date): string {
  const p = londonParts(now);
  return `${pad(p.hour)}:${pad(p.minute)}`;
}

export function addDays(iso: string, days: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + days)).toISOString().slice(0, 10);
}
```

- [ ] **Step 4: Implement `data/events.ts`**

```ts
import { addDays, londonLocalToDate, londonToday } from "@/lib/london-time";

export type EventId = "openMic" | "tasting";

interface EventRule {
  id: EventId;
  weekday: number; // 0 = domingo … 6 = sábado
  hour: number;
  minute: number;
  durationMinutes: number;
}

export const eventRules: readonly EventRule[] = [
  { id: "openMic", weekday: 5, hour: 17, minute: 30, durationMinutes: 150 }, // viernes 17:30–20:00
  { id: "tasting", weekday: 6, hour: 10, minute: 0, durationMinutes: 90 }, // sábado 10:00–11:30
];

export interface EventOccurrence { id: EventId; startsAt: Date; endsAt: Date }

const SEARCH_DAYS = 28;

/** Próximas ocurrencias (incluye la que está en curso), calculadas en hora de Londres. */
export function getUpcomingEvents(now: Date, count: number): EventOccurrence[] {
  const today = londonToday(now);
  const found: EventOccurrence[] = [];
  for (let offset = 0; offset < SEARCH_DAYS; offset++) {
    const [year, month, day] = addDays(today, offset).split("-").map(Number);
    const weekday = new Date(Date.UTC(year, month - 1, day)).getUTCDay();
    for (const rule of eventRules) {
      if (rule.weekday !== weekday) continue;
      const startsAt = londonLocalToDate(year, month, day, rule.hour, rule.minute);
      const endsAt = new Date(startsAt.getTime() + rule.durationMinutes * 60_000);
      if (endsAt > now) found.push({ id: rule.id, startsAt, endsAt });
    }
  }
  found.sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime());
  return found.slice(0, Math.max(0, count));
}
```

- [ ] **Step 5: Extend `lib/format.ts`** (append; add the import at the top)

```ts
import { LONDON_TZ } from "@/lib/london-time";

export function formatEventDate(date: Date, locale: Locale): string {
  return new Intl.DateTimeFormat(intlLocale[locale], {
    weekday: "long", day: "numeric", month: "long", timeZone: LONDON_TZ,
  }).format(date);
}

export function formatEventTime(start: Date, end: Date, locale: Locale): string {
  const f = new Intl.DateTimeFormat(intlLocale[locale], {
    hour: "2-digit", minute: "2-digit", hourCycle: "h23", timeZone: LONDON_TZ,
  });
  return `${f.format(start)} – ${f.format(end)}`;
}
```

- [ ] **Step 6: Run to verify pass**

Run: `npx vitest run lib data`
Expected: all pass.

- [ ] **Step 7: Commit**

```bash
git add lib/london-time.ts lib/london-time.test.ts lib/format.ts lib/format.test.ts data/events.ts data/events.test.ts
git commit -m "feat(events): London-time recurring events with DST-safe dates" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

### Task 6: Booking domain (opening hours, validation, mock submit)

**Files:**
- Create: `lib/booking/opening-hours.ts`, `lib/booking/opening-hours.test.ts`, `lib/booking/validate-booking.ts`, `lib/booking/validate-booking.test.ts`, `lib/booking/submit-booking.ts`, `lib/booking/submit-booking.test.ts`

**Interfaces:**
- Consumes: `addDays`, `londonToday`, `londonTimeOfDay` from `lib/london-time`.
- Produces:
  - `opening-hours.ts`: `interface DayHours { open: string; close: string }`, `openingHours: Record<number, DayHours>` (0 = Sunday), `interface HoursGroup { days: number[]; open: string; close: string }`, `groupOpeningHours(): HoursGroup[]` (Mon→Sun order).
  - `validate-booking.ts`: `MAX_PARTY_SIZE = 12`, `MAX_DAYS_AHEAD = 60`, `interface BookingInput { name: string; partySize: string; date: string; time: string }`, `type BookingField = keyof BookingInput`, `type BookingErrorCode = "nameLength" | "partySizeRange" | "dateInvalid" | "datePast" | "dateTooFar" | "timeInvalid" | "timeClosed" | "timePast"`, `type BookingErrors = Partial<Record<BookingField, BookingErrorCode>>`, `interface Booking { name: string; partySize: number; date: string; time: string }`, `type BookingResult = { ok: true; value: Booking } | { ok: false; errors: BookingErrors }`, `validateBooking(input: BookingInput, now: Date): BookingResult`.
  - `submit-booking.ts`: `submitBooking(booking: Booking): Promise<{ ok: true }>`.

- [ ] **Step 1: Write the failing tests**

`lib/booking/opening-hours.test.ts`:
```ts
import { expect, test } from "vitest";
import { groupOpeningHours, openingHours } from "./opening-hours";

test("agrupa días consecutivos con el mismo horario (lunes a domingo)", () => {
  expect(groupOpeningHours().map((g) => g.days)).toEqual([[1, 2, 3, 4], [5], [6], [0]]);
  expect(groupOpeningHours()[1]).toEqual({ days: [5], open: "07:30", close: "21:30" });
});

test("hay horario para los 7 días", () => {
  for (let d = 0; d < 7; d++) expect(openingHours[d]).toBeDefined();
});
```
`lib/booking/validate-booking.test.ts`:
```ts
import { describe, expect, test } from "vitest";
import { validateBooking, type BookingInput } from "./validate-booking";

const NOW = new Date("2026-09-30T12:00:00Z"); // miércoles 13:00 BST
const ok: BookingInput = { name: "Ana", partySize: "4", date: "2026-10-02", time: "19:00" }; // viernes

const errorsOf = (over: Partial<BookingInput>, now = NOW) => {
  const result = validateBooking({ ...ok, ...over }, now);
  return result.ok ? {} : result.errors;
};

describe("validateBooking", () => {
  test("acepta una reserva válida y normaliza el nombre y el tamaño", () => {
    expect(validateBooking({ ...ok, name: "  Ana  " }, NOW)).toEqual({
      ok: true, value: { name: "Ana", partySize: 4, date: "2026-10-02", time: "19:00" },
    });
  });

  test("nombre: entre 2 y 60 caracteres tras recortar", () => {
    expect(errorsOf({ name: "A" }).name).toBe("nameLength");
    expect(errorsOf({ name: "   " }).name).toBe("nameLength");
    expect(errorsOf({ name: "x".repeat(61) }).name).toBe("nameLength");
    expect(errorsOf({ name: "x".repeat(60) }).name).toBeUndefined();
  });

  test.each(["0", "13", "2.5", "abc", "", "-1"])("tamaño de grupo inválido: %j", (partySize) => {
    expect(errorsOf({ partySize }).partySize).toBe("partySizeRange");
  });
  test.each(["1", "12"])("tamaño de grupo válido: %s", (partySize) => {
    expect(errorsOf({ partySize }).partySize).toBeUndefined();
  });

  test.each(["", "30/09/2026", "2026-02-30", "2026-13-01", "hoy"])("fecha inválida: %j", (date) => {
    expect(errorsOf({ date }).date).toBe("dateInvalid");
  });
  test("fecha pasada y demasiado lejana (hoy + 60 días es el límite)", () => {
    expect(errorsOf({ date: "2026-09-29" }).date).toBe("datePast");
    expect(errorsOf({ date: "2026-11-29" }).date).toBeUndefined();
    expect(errorsOf({ date: "2026-11-30" }).date).toBe("dateTooFar");
  });

  test.each(["7:00", "25:00", "19:60", "", "19:00:00"])("hora con formato inválido: %j", (time) => {
    expect(errorsOf({ time }).time).toBe("timeInvalid");
  });
  test("horario de apertura: último turno 30 min antes del cierre", () => {
    // miércoles 2026-10-07: 07:30–17:00
    expect(errorsOf({ date: "2026-10-07", time: "07:29" }).time).toBe("timeClosed");
    expect(errorsOf({ date: "2026-10-07", time: "07:30" }).time).toBeUndefined();
    expect(errorsOf({ date: "2026-10-07", time: "16:30" }).time).toBeUndefined();
    expect(errorsOf({ date: "2026-10-07", time: "16:31" }).time).toBe("timeClosed");
    // viernes cierra a las 21:30; domingo 2026-10-04 08:30–16:00
    expect(errorsOf({ date: "2026-10-02", time: "21:00" }).time).toBeUndefined();
    expect(errorsOf({ date: "2026-10-04", time: "15:31" }).time).toBe("timeClosed");
  });

  test("hoy: la hora debe ser posterior a la actual de Londres", () => {
    expect(errorsOf({ date: "2026-09-30", time: "12:00" }).time).toBe("timePast"); // ya son las 13:00
    expect(errorsOf({ date: "2026-09-30", time: "15:00" }).time).toBeUndefined();
  });
  test("hoy después del cierre: rechazada", () => {
    const evening = new Date("2026-09-30T17:00:00Z"); // 18:00 BST, cerrado desde las 17:00
    expect(errorsOf({ date: "2026-09-30", time: "18:30" }, evening).time).toBe("timeClosed");
  });
  test("la fecha de 'hoy' es la de Londres, no la de UTC", () => {
    const justAfterMidnightLondon = new Date("2026-09-30T23:30:00Z"); // 1 oct 00:30 BST
    expect(errorsOf({ date: "2026-09-30", time: "15:00" }, justAfterMidnightLondon).date).toBe("datePast");
    expect(errorsOf({ date: "2026-10-01", time: "15:00" }, justAfterMidnightLondon).date).toBeUndefined();
  });

  test("devuelve varios errores a la vez", () => {
    const result = validateBooking({ name: "", partySize: "0", date: "", time: "" }, NOW);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(Object.keys(result.errors).sort()).toEqual(["date", "name", "partySize", "time"]);
  });
});
```
`lib/booking/submit-booking.test.ts`:
```ts
import { afterEach, expect, test, vi } from "vitest";
import { submitBooking } from "./submit-booking";

afterEach(() => vi.useRealTimers());

test("la maqueta resuelve con éxito tras una breve espera", async () => {
  vi.useFakeTimers();
  const pending = submitBooking({ name: "Ana", partySize: 2, date: "2026-10-02", time: "19:00" });
  await vi.advanceTimersByTimeAsync(400);
  await expect(pending).resolves.toEqual({ ok: true });
});
```

- [ ] **Step 2: Run to verify failure**

Run: `npx vitest run lib/booking`
Expected: FAIL (modules not found).

- [ ] **Step 3: Implement `lib/booking/opening-hours.ts`**

```ts
export interface DayHours { open: string; close: string }

/** 0 = domingo … 6 = sábado. PLACEHOLDER: horario de ejemplo hasta tener el real. */
export const openingHours: Record<number, DayHours> = {
  0: { open: "08:30", close: "16:00" },
  1: { open: "07:30", close: "17:00" },
  2: { open: "07:30", close: "17:00" },
  3: { open: "07:30", close: "17:00" },
  4: { open: "07:30", close: "17:00" },
  5: { open: "07:30", close: "21:30" },
  6: { open: "08:00", close: "17:00" },
};

export interface HoursGroup { days: number[]; open: string; close: string }

const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0];

/** Agrupa días consecutivos (lunes→domingo) con el mismo horario. */
export function groupOpeningHours(): HoursGroup[] {
  const groups: HoursGroup[] = [];
  for (const day of WEEK_ORDER) {
    const hours = openingHours[day];
    const last = groups.at(-1);
    if (last && last.open === hours.open && last.close === hours.close) last.days.push(day);
    else groups.push({ days: [day], open: hours.open, close: hours.close });
  }
  return groups;
}
```

- [ ] **Step 4: Implement `lib/booking/validate-booking.ts`**

```ts
import { addDays, londonTimeOfDay, londonToday } from "@/lib/london-time";
import { openingHours } from "./opening-hours";

export const MAX_PARTY_SIZE = 12;
export const MAX_DAYS_AHEAD = 60;
const LAST_SLOT_BEFORE_CLOSE_MINUTES = 30;

export interface BookingInput { name: string; partySize: string; date: string; time: string }
export type BookingField = keyof BookingInput;
export type BookingErrorCode =
  | "nameLength" | "partySizeRange" | "dateInvalid" | "datePast" | "dateTooFar"
  | "timeInvalid" | "timeClosed" | "timePast";
export type BookingErrors = Partial<Record<BookingField, BookingErrorCode>>;
export interface Booking { name: string; partySize: number; date: string; time: string }
export type BookingResult = { ok: true; value: Booking } | { ok: false; errors: BookingErrors };

const toMinutes = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};

function isRealDate(iso: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return false;
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  return date.getUTCFullYear() === y && date.getUTCMonth() === m - 1 && date.getUTCDate() === d;
}

/** Validación pura; `now` se inyecta para poder probar fechas. Reutilizable en servidor. */
export function validateBooking(input: BookingInput, now: Date): BookingResult {
  const errors: BookingErrors = {};

  const name = input.name.trim();
  if (name.length < 2 || name.length > 60) errors.name = "nameLength";

  const sizeText = input.partySize.trim();
  const partySize = /^\d+$/.test(sizeText) ? Number(sizeText) : Number.NaN;
  if (!(partySize >= 1 && partySize <= MAX_PARTY_SIZE)) errors.partySize = "partySizeRange";

  const today = londonToday(now);
  const dateOk = isRealDate(input.date);
  if (!dateOk) errors.date = "dateInvalid";
  else if (input.date < today) errors.date = "datePast";
  else if (input.date > addDays(today, MAX_DAYS_AHEAD)) errors.date = "dateTooFar";

  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(input.time)) {
    errors.time = "timeInvalid";
  } else if (dateOk) {
    const hours = openingHours[new Date(`${input.date}T00:00:00Z`).getUTCDay()];
    const minutes = toMinutes(input.time);
    if (minutes < toMinutes(hours.open) || minutes > toMinutes(hours.close) - LAST_SLOT_BEFORE_CLOSE_MINUTES) {
      errors.time = "timeClosed";
    } else if (input.date === today && minutes <= toMinutes(londonTimeOfDay(now))) {
      errors.time = "timePast";
    }
  }

  if (Object.keys(errors).length > 0) return { ok: false, errors };
  return { ok: true, value: { name, partySize, date: input.date, time: input.time } };
}
```

- [ ] **Step 5: Implement `lib/booking/submit-booking.ts`**

```ts
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
```

- [ ] **Step 6: Run to verify pass**

Run: `npx vitest run lib/booking`
Expected: all pass.

- [ ] **Step 7: Commit**

```bash
git add lib/booking
git commit -m "feat(booking): opening hours, London-aware validation, mock submit" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

### Task 7: UI primitives, site chrome and formatting helpers

**Files:**
- Create: `lib/site.ts`, `components/ui/Container.tsx`, `components/ui/Button.tsx`, `components/ui/Badge.tsx`, `components/ui/ProductDisc.tsx`, `components/ui/tones.ts`, `components/layout/Logo.tsx`, `components/layout/NavLinks.tsx`, `components/layout/LanguageSwitcher.tsx`, `components/layout/SiteHeader.tsx`, `components/layout/Footer.tsx`, `components/layout/chrome.test.tsx`, `.env.example`
- Modify: `lib/format.ts`, `lib/format.test.ts`, `app/[lang]/layout.tsx`

**Interfaces:**
- Consumes: `Dictionary`, `Locale`, `locales`, `switchLocalePath`, `groupOpeningHours`, `CategoryId`, `BadgeId`.
- Produces:
  - `lib/site.ts`: `siteInfo`, `siteUrl`.
  - `lib/format.ts`: `formatDayRange(days: number[], locale: Locale): string`, `formatIsoDate(iso: string, locale: Locale): string`.
  - `Container`, `Button` (`variant: "primary"|"accent"|"light"|"ghost"`, `size: "md"|"lg"`), `ButtonLink` (same props + `href`), `buttonClasses(variant?, size?, extra?)`, `Badge({ kind: BadgeId; label: string })`, `ProductDisc({ src; alt; tone: Tone; size?: "sm"|"md"|"lg" })`, `categoryTone: Record<CategoryId, Tone>`, `toneBg`.
  - `SiteHeader({ lang, dict })`, `Footer({ lang, dict })`.

- [ ] **Step 1: Write the failing tests** — add to `lib/format.test.ts`

```ts
import { formatDayRange, formatIsoDate } from "./format";

describe("formatDayRange / formatIsoDate", () => {
  test("rango de días de la semana", () => {
    expect(formatDayRange([1, 2, 3, 4], "en")).toMatch(/^Mon\s–\sThu$/);
    expect(formatDayRange([1, 2, 3, 4], "es")).toMatch(/^lun\.?\s–\sjue\.?$/);
    expect(formatDayRange([5], "en")).toBe("Fri");
  });
  test("fecha ISO con nombre de día, sin desfase de zona horaria", () => {
    expect(formatIsoDate("2026-10-02", "en")).toMatch(/Friday.*2 October/);
    expect(formatIsoDate("2026-10-02", "es")).toMatch(/viernes.*2 de octubre/);
  });
});
```
`components/layout/chrome.test.tsx`:
```tsx
import { render, screen, within } from "@testing-library/react";
import type { ComponentProps } from "react";
import { describe, expect, test, vi } from "vitest";
import en from "@/dictionaries/en.json";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { NavLinks } from "./NavLinks";

let mockPath = "/en/menu";
vi.mock("next/navigation", () => ({ usePathname: () => mockPath }));
vi.mock("next/link", () => ({
  default: ({ href, children, ...rest }: ComponentProps<"a"> & { href: string }) => (
    <a href={href} {...rest}>{children}</a>
  ),
}));

const links = [
  { path: "", label: en.nav.home },
  { path: "/menu", label: en.nav.menu },
  { path: "/about", label: en.nav.about },
];

describe("NavLinks", () => {
  test("marca solo la página actual con aria-current", () => {
    mockPath = "/en/menu";
    render(<NavLinks lang="en" label={en.nav.label} links={links} />);
    expect(screen.getByRole("link", { name: "Menu" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "Home" })).not.toHaveAttribute("aria-current");
  });
  test("inicio es activo solo en la raíz del idioma", () => {
    mockPath = "/en";
    render(<NavLinks lang="en" label={en.nav.label} links={links} />);
    expect(screen.getByRole("link", { name: "Home" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "Menu" })).not.toHaveAttribute("aria-current");
  });
});

describe("LanguageSwitcher", () => {
  test("enlaza a la misma página en el otro idioma y marca el actual", () => {
    mockPath = "/en/menu";
    render(<LanguageSwitcher lang="en" label={en.language.label} names={{ en: "English", es: "Español" }} />);
    const nav = screen.getByRole("navigation", { name: "Language" });
    expect(within(nav).getByRole("link", { name: "Español" })).toHaveAttribute("href", "/es/menu");
    expect(within(nav).getByRole("link", { name: "Español" })).toHaveAttribute("hreflang", "es");
    expect(within(nav).getByRole("link", { name: "English" })).toHaveAttribute("aria-current", "true");
  });
});
```

- [ ] **Step 2: Run to verify failure**

Run: `npx vitest run lib/format.test.ts components`
Expected: FAIL.

- [ ] **Step 3: Extend `lib/format.ts`** (append)

```ts
/** Nombre de día abreviado; 0 = domingo. Se calcula en UTC para no depender de la zona del servidor. */
export function formatDayRange(days: number[], locale: Locale): string {
  const f = new Intl.DateTimeFormat(intlLocale[locale], { weekday: "short", timeZone: "UTC" });
  const name = (day: number) => f.format(new Date(Date.UTC(2026, 0, 4 + day))); // 4 ene 2026 es domingo
  return days.length === 1 ? name(days[0]) : `${name(days[0])} – ${name(days[days.length - 1])}`;
}

export function formatIsoDate(iso: string, locale: Locale): string {
  return new Intl.DateTimeFormat(intlLocale[locale], {
    weekday: "long", day: "numeric", month: "long", timeZone: "UTC",
  }).format(new Date(`${iso}T12:00:00Z`));
}
```

- [ ] **Step 4: `lib/site.ts`, `.env.example`**

```ts
// PLACEHOLDER: datos de ejemplo (teléfono del rango ficticio de Ofcom). Sustituir por los reales.
export const siteInfo = {
  name: "Brew and Co",
  streetAddress: "12 Example Street",
  locality: "London",
  postalCode: "N1 0AA",
  country: "GB",
  phone: "020 7946 0000",
} as const;

export const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
```
`.env.example`:
```
# URL pública del sitio (sitemap, Open Graph, datos estructurados). No es un secreto.
NEXT_PUBLIC_SITE_URL=https://www.example.com
```
Confirm `.gitignore` ignores `.env*` but allows `.env.example` (`git check-ignore -v .env.example`; if ignored, add `!.env.example` to `.gitignore`).

- [ ] **Step 5: UI primitives**

`components/ui/Container.tsx`:
```tsx
import type { ComponentProps } from "react";

export function Container({ className = "", ...props }: ComponentProps<"div">) {
  return <div className={`mx-auto w-full max-w-page px-4 sm:px-8 lg:px-10 ${className}`} {...props} />;
}
```
`components/ui/Button.tsx`:
```tsx
import Link from "next/link";
import type { ComponentProps } from "react";

export type ButtonVariant = "primary" | "accent" | "light" | "ghost";
export type ButtonSize = "md" | "lg";

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-foreground text-background hover:bg-cacao dark:hover:bg-espuma",
  accent: "bg-naranja-fuerte text-white hover:bg-naranja-profundo",
  light: "bg-espuma text-espresso hover:bg-crema",
  ghost: "border border-line text-foreground hover:bg-surface",
};
const sizeClasses: Record<ButtonSize, string> = { md: "h-11 px-6", lg: "h-[52px] px-7" };

export function buttonClasses(variant: ButtonVariant = "primary", size: ButtonSize = "md", extra = "") {
  return `inline-flex items-center justify-center gap-3 rounded-full text-base font-semibold tracking-[0.01em] transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-50 ${variantClasses[variant]} ${sizeClasses[size]} ${extra}`.trim();
}

type Shared = { variant?: ButtonVariant; size?: ButtonSize };

export function Button({ variant, size, className, type = "button", ...props }: Shared & ComponentProps<"button">) {
  return <button type={type} className={buttonClasses(variant, size, className)} {...props} />;
}

export function ButtonLink({ variant, size, className, ...props }: Shared & ComponentProps<typeof Link>) {
  return <Link className={buttonClasses(variant, size, className)} {...props} />;
}
```
`components/ui/tones.ts`:
```ts
import type { CategoryId } from "@/data/menu";

export type Tone = "naranja" | "mostaza" | "menta" | "durazno" | "frambuesa";

export const categoryTone: Record<CategoryId, Tone> = {
  espresso: "mostaza",
  pastries: "frambuesa",
  sandwiches: "durazno",
  cold: "menta",
};

export const toneBg: Record<Tone, string> = {
  naranja: "bg-naranja",
  mostaza: "bg-mostaza",
  menta: "bg-menta",
  durazno: "bg-durazno",
  frambuesa: "bg-frambuesa",
};
```
`components/ui/Badge.tsx`:
```tsx
import type { BadgeId } from "@/data/menu";

const styles: Record<BadgeId, string> = {
  popular: "bg-naranja text-espresso",
  "house-favourite": "bg-foreground text-background",
};

export function Badge({ kind, label }: { kind: BadgeId; label: string }) {
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${styles[kind]}`}>
      {label}
    </span>
  );
}
```
`components/ui/ProductDisc.tsx`:
```tsx
import Image from "next/image";
import { toneBg, type Tone } from "./tones";

const discSize = { sm: "size-18", md: "size-24", lg: "size-32" } as const;
const imageSizes = { sm: "72px", md: "96px", lg: "128px" } as const;

/** Foto recortada en círculo sobre un disco de color: el elemento de marca. */
export function ProductDisc({
  src, alt, tone, size = "md",
}: { src: string; alt: string; tone: Tone; size?: keyof typeof discSize }) {
  return (
    <span className={`relative block shrink-0 ${discSize[size]}`}>
      <span aria-hidden className={`absolute inset-0 rounded-full ${toneBg[tone]}`} />
      <span className="absolute inset-2 overflow-hidden rounded-full">
        <Image src={src} alt={alt} fill sizes={imageSizes[size]} className="object-cover" />
      </span>
    </span>
  );
}
```

- [ ] **Step 6: Layout components**

`components/layout/Logo.tsx`:
```tsx
import Link from "next/link";
import type { Locale } from "@/lib/i18n";

export function Logo({ lang, homeLabel }: { lang: Locale; homeLabel: string }) {
  return (
    <Link href={`/${lang}`} aria-label={`Brew and Co, ${homeLabel}`} className="inline-flex items-center gap-2">
      <span className="grid size-8 place-items-center rounded-full bg-foreground text-background">
        <svg viewBox="0 0 24 24" aria-hidden className="size-4">
          <path fill="currentColor" d="M6 8h12l-1.2 11a2 2 0 0 1-2 1.8H9.2a2 2 0 0 1-2-1.8L6 8Zm-1-3h14v2H5V5Z" />
        </svg>
      </span>
      <span className="font-display text-2xl font-extrabold tracking-tight">
        Brew <span className="text-naranja-fuerte">and</span> Co
      </span>
    </Link>
  );
}
```
`components/layout/NavLinks.tsx`:
```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Locale } from "@/lib/i18n";

export function NavLinks({
  lang, label, links,
}: { lang: Locale; label: string; links: { path: string; label: string }[] }) {
  const pathname = usePathname();
  return (
    <nav aria-label={label}>
      <ul className="flex gap-6">
        {links.map((link) => {
          const href = `/${lang}${link.path}`;
          const active = link.path === "" ? pathname === href : pathname.startsWith(href);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className="inline-flex min-h-11 items-center text-sm font-semibold underline-offset-8 hover:underline aria-[current=page]:underline aria-[current=page]:decoration-2 aria-[current=page]:decoration-naranja-fuerte"
              >
                {link.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
```
`components/layout/LanguageSwitcher.tsx`:
```tsx
"use client";

import { usePathname } from "next/navigation";
import { locales, switchLocalePath, type Locale } from "@/lib/i18n";

export function LanguageSwitcher({
  lang, label, names,
}: { lang: Locale; label: string; names: Record<Locale, string> }) {
  const pathname = usePathname();
  return (
    <nav aria-label={label}>
      <ul className="flex gap-1">
        {locales.map((locale) => (
          <li key={locale}>
            {/* <a> y no <Link>: cambia el <html lang>, así que conviene una navegación completa */}
            <a
              href={switchLocalePath(pathname, locale)}
              hrefLang={locale}
              lang={locale}
              aria-current={locale === lang ? "true" : undefined}
              className="inline-flex min-h-11 items-center rounded-full px-3 text-sm font-semibold hover:bg-surface aria-[current=true]:bg-surface aria-[current=true]:underline aria-[current=true]:decoration-2 aria-[current=true]:decoration-naranja-fuerte aria-[current=true]:underline-offset-8"
            >
              {names[locale]}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
```
`components/layout/SiteHeader.tsx`:
```tsx
import type { Dictionary } from "@/dictionaries/get-dictionary";
import type { Locale } from "@/lib/i18n";
import { Container } from "@/components/ui/Container";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { Logo } from "./Logo";
import { NavLinks } from "./NavLinks";

export function SiteHeader({ lang, dict }: { lang: Locale; dict: Dictionary }) {
  return (
    <header className="border-b border-line bg-background">
      <Container className="flex flex-wrap items-center justify-between gap-x-6 gap-y-1 py-3">
        <Logo lang={lang} homeLabel={dict.nav.home} />
        <div className="order-last w-full sm:order-none sm:w-auto">
          <NavLinks
            lang={lang}
            label={dict.nav.label}
            links={[
              { path: "", label: dict.nav.home },
              { path: "/menu", label: dict.nav.menu },
              { path: "/about", label: dict.nav.about },
            ]}
          />
        </div>
        <LanguageSwitcher lang={lang} label={dict.language.label} names={{ en: dict.language.en, es: dict.language.es }} />
      </Container>
    </header>
  );
}
```
`components/layout/Footer.tsx`:
```tsx
import { Container } from "@/components/ui/Container";
import type { Dictionary } from "@/dictionaries/get-dictionary";
import { groupOpeningHours } from "@/lib/booking/opening-hours";
import { formatDayRange } from "@/lib/format";
import type { Locale } from "@/lib/i18n";
import { siteInfo } from "@/lib/site";

export function Footer({ lang, dict }: { lang: Locale; dict: Dictionary }) {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-auto bg-espresso text-espuma">
      <Container className="grid gap-10 py-14 md:grid-cols-3">
        <div>
          <p className="font-display text-2xl font-extrabold">{siteInfo.name}</p>
          <h2 className="mt-6 font-display text-lg font-bold">{dict.footer.visit}</h2>
          <address className="mt-2 not-italic text-espuma/85">
            {siteInfo.streetAddress}
            <br />
            {siteInfo.locality} {siteInfo.postalCode}
          </address>
        </div>
        <div>
          <h2 className="font-display text-lg font-bold">{dict.footer.hoursTitle}</h2>
          <dl className="mt-2 space-y-1 text-espuma/85">
            {groupOpeningHours().map((group) => (
              <div key={group.days.join("-")} className="flex justify-between gap-4 max-w-64">
                <dt>{formatDayRange(group.days, lang)}</dt>
                <dd>{group.open} – {group.close}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div>
          <h2 className="font-display text-lg font-bold">{dict.footer.phoneLabel}</h2>
          <p className="mt-2 text-espuma/85">
            <a href={`tel:${siteInfo.phone.replace(/\s/g, "")}`} className="underline underline-offset-4">
              {siteInfo.phone}
            </a>
          </p>
        </div>
      </Container>
      <div className="border-t border-white/15">
        <Container className="py-4 text-sm text-espuma/75">{dict.footer.rights.replace("{year}", String(year))}</Container>
      </div>
    </footer>
  );
}
```
Modify `app/[lang]/layout.tsx`: import `SiteHeader` and `Footer`, and render `<SiteHeader lang={lang} dict={dict} />{children}<Footer lang={lang} dict={dict} />` inside `<body>` after the skip link.

- [ ] **Step 7: Run tests, typecheck, lint**

```bash
npx vitest run
npm run typecheck
npm run lint
```
Expected: all green. (If `text-espuma/85` style classes are flagged by nothing, fine; Tailwind v4 supports opacity modifiers on token colors.)

- [ ] **Step 8: Commit**

```bash
git add lib components app .env.example .gitignore
git commit -m "feat(ui): primitives, header, footer and language switcher" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

### Task 8: BookingDialog (client)

**Files:**
- Create: `components/booking/BookingDialog.tsx`, `components/booking/BookingDialog.test.tsx`

**Interfaces:**
- Consumes: `Button`, `ButtonVariant`, `ButtonSize`; `validateBooking`, `MAX_PARTY_SIZE`, `MAX_DAYS_AHEAD`, `Booking`, `BookingErrors`, `BookingField`, `BookingInput`; `submitBooking`; `londonToday`, `addDays`; `formatIsoDate`; `Dictionary["booking"]`.
- Produces: `BookingDialog({ labels: Dictionary["booking"]; lang: Locale; variant?: ButtonVariant; size?: ButtonSize })` — renders the trigger button and its own `<dialog>`.

- [ ] **Step 1: Write the failing tests** `components/booking/BookingDialog.test.tsx`

```tsx
import { act, fireEvent, render, screen } from "@testing-library/react";
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
});
```

- [ ] **Step 2: Run to verify failure**

Run: `npx vitest run components/booking`
Expected: FAIL (module not found).

- [ ] **Step 3: Implement `components/booking/BookingDialog.tsx`**

```tsx
"use client";

import { useId, useRef, useState, type FormEvent, type ReactNode } from "react";
import { Button, type ButtonSize, type ButtonVariant } from "@/components/ui/Button";
import type { Dictionary } from "@/dictionaries/get-dictionary";
import { submitBooking } from "@/lib/booking/submit-booking";
import {
  MAX_DAYS_AHEAD, MAX_PARTY_SIZE, validateBooking,
  type Booking, type BookingErrors, type BookingField, type BookingInput,
} from "@/lib/booking/validate-booking";
import { formatIsoDate } from "@/lib/format";
import type { Locale } from "@/lib/i18n";
import { addDays, londonToday } from "@/lib/london-time";

type Status = "idle" | "submitting" | "success";

const EMPTY: BookingInput = { name: "", partySize: "2", date: "", time: "" };
const FIELD_ORDER: BookingField[] = ["name", "partySize", "date", "time"];
const inputClasses =
  "h-11 w-full rounded-sm border border-line bg-background px-3 text-base text-foreground aria-invalid:border-2 aria-invalid:border-price";

interface Props {
  labels: Dictionary["booking"];
  lang: Locale;
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export function BookingDialog({ labels, lang, variant = "accent", size = "lg" }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const uid = useId();
  const titleId = `${uid}-title`;
  const [values, setValues] = useState<BookingInput>(EMPTY);
  const [errors, setErrors] = useState<BookingErrors>({});
  const [submitError, setSubmitError] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [range, setRange] = useState<{ min?: string; max?: string }>({});
  const [confirmed, setConfirmed] = useState<Booking | null>(null);

  function open() {
    const today = londonToday(new Date());
    setRange({ min: today, max: addDays(today, MAX_DAYS_AHEAD) });
    setValues(EMPTY);
    setErrors({});
    setSubmitError(false);
    setStatus("idle");
    setConfirmed(null);
    dialogRef.current?.showModal();
  }

  function close() {
    dialogRef.current?.close();
  }

  function update(field: BookingField, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => {
      const next = { ...current };
      delete next[field];
      return next;
    });
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "submitting") return;
    setSubmitError(false);

    const result = validateBooking(values, new Date());
    if (!result.ok) {
      setErrors(result.errors);
      const first = FIELD_ORDER.find((f) => result.errors[f]);
      if (first) formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
      return;
    }

    setStatus("submitting");
    try {
      await submitBooking(result.value);
      setConfirmed(result.value);
      setStatus("success");
    } catch {
      setSubmitError(true);
      setStatus("idle");
    }
  }

  function field(name: BookingField, label: string, control: (props: object) => ReactNode, hint?: string) {
    const id = `${uid}-${name}`;
    const error = errors[name];
    const describedBy = [error ? `${id}-error` : null, hint ? `${id}-hint` : null].filter(Boolean).join(" ") || undefined;
    return (
      <div>
        <label htmlFor={id} className="mb-1 block text-sm font-semibold">{label}</label>
        {control({ id, name, "aria-invalid": error ? true : undefined, "aria-describedby": describedBy, className: inputClasses })}
        {hint && <p id={`${id}-hint`} className="mt-1 text-sm text-muted">{hint}</p>}
        {error && <p id={`${id}-error`} className="mt-1 text-sm font-semibold text-price">{labels.errors[error]}</p>}
      </div>
    );
  }

  const partyOptions = Array.from({ length: MAX_PARTY_SIZE }, (_, i) => i + 1);

  return (
    <>
      <Button variant={variant} size={size} onClick={open}>{labels.open}</Button>
      <dialog
        ref={dialogRef}
        aria-labelledby={titleId}
        onClick={(event) => { if (event.target === event.currentTarget) close(); }}
        className="m-auto w-[min(92vw,30rem)] rounded-md bg-surface p-0 text-foreground shadow-float backdrop:bg-espresso/60"
      >
        <div className="p-6">
          {status === "success" && confirmed ? (
            <div role="status">
              <h2 id={titleId} className="font-display text-3xl font-bold">{labels.success.title}</h2>
              <p className="mt-3 text-lg">
                {labels.success.message
                  .replace("{name}", confirmed.name)
                  .replace("{partySize}", String(confirmed.partySize))
                  .replace("{date}", formatIsoDate(confirmed.date, lang))
                  .replace("{time}", confirmed.time)}
              </p>
              <div className="mt-6"><Button variant="primary" onClick={close}>{labels.close}</Button></div>
            </div>
          ) : (
            <form ref={formRef} noValidate onSubmit={onSubmit} className="space-y-4">
              <div>
                <h2 id={titleId} className="font-display text-3xl font-bold">{labels.title}</h2>
                <p className="mt-1 text-muted">{labels.description}</p>
              </div>
              {field("name", labels.fields.name, (p) => (
                <input {...p} type="text" autoComplete="name" maxLength={60} value={values.name}
                  onChange={(e) => update("name", e.target.value)} />
              ))}
              {field("partySize", labels.fields.partySize, (p) => (
                <select {...p} value={values.partySize} onChange={(e) => update("partySize", e.target.value)}>
                  {partyOptions.map((n) => (
                    <option key={n} value={String(n)}>
                      {n === 1 ? labels.personOne : labels.personMany.replace("{n}", String(n))}
                    </option>
                  ))}
                </select>
              ), labels.fields.partySizeHint)}
              {field("date", labels.fields.date, (p) => (
                <input {...p} type="date" min={range.min} max={range.max} value={values.date}
                  onChange={(e) => update("date", e.target.value)} />
              ))}
              {field("time", labels.fields.time, (p) => (
                <input {...p} type="time" step={900} value={values.time}
                  onChange={(e) => update("time", e.target.value)} />
              ))}
              {submitError && <p role="alert" className="text-sm font-semibold text-price">{labels.errors.submitFailed}</p>}
              <div className="flex flex-wrap gap-3 pt-2">
                <Button type="submit" variant="accent" disabled={status === "submitting"}>
                  {status === "submitting" ? labels.submitting : labels.submit}
                </Button>
                <Button variant="ghost" onClick={close}>{labels.close}</Button>
              </div>
            </form>
          )}
        </div>
      </dialog>
    </>
  );
}
```

- [ ] **Step 4: Run to verify pass**

Run: `npx vitest run components/booking`
Expected: all pass. If `toHaveAccessibleDescription` fails because the hint text is concatenated for the `partySize` field only, it does not affect `name` (no hint) — no change needed. If a test fails on `{...p}` typing, `npm run typecheck` will point to it; keep `control` typed as `(props: object) => ReactNode`.

- [ ] **Step 5: Typecheck and commit**

```bash
npm run typecheck
git add components/booking
git commit -m "feat(booking): accessible reservation dialog with validation" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

### Task 9: Pexels photos

**Files:**
- Create: `data/menu-images.test.ts`, `public/images/hero.jpg`, `public/images/about.jpg`, `public/images/categories/{espresso,pastries,sandwiches,cold}.jpg`, `public/images/menu/{cappuccino,latte,croissant,brownie,cheesecake,avocado-toast,cold-brew,iced-tea}.jpg`, `public/images/CREDITS.md`

**Interfaces:**
- Consumes: `getMenu`, `menuImageSrc`, `categoryIds`.
- Produces: every image path the pages reference exists on disk as a real JPEG.

- [ ] **Step 1: Write the failing test** `data/menu-images.test.ts`

```ts
import { existsSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { describe, expect, test } from "vitest";
import { categoryIds, getMenu, menuImageSrc } from "./menu";

const publicFile = (src: string) => path.join(process.cwd(), "public", src);
const required = [
  "/images/hero.jpg",
  "/images/about.jpg",
  ...categoryIds.map((c) => `/images/categories/${c}.jpg`),
  ...getMenu().map((item) => menuImageSrc(item)),
];

describe.each([...new Set(required)])("imagen %s", (src) => {
  test("existe, es un JPEG y pesa entre 10 KB y 500 KB", () => {
    expect(existsSync(publicFile(src))).toBe(true);
    const bytes = readFileSync(publicFile(src));
    expect([...bytes.subarray(0, 3)]).toEqual([0xff, 0xd8, 0xff]);
    const size = statSync(publicFile(src)).size;
    expect(size).toBeGreaterThan(10_000);
    expect(size).toBeLessThan(500_000);
  });
});

test("todas las imágenes están acreditadas en CREDITS.md", () => {
  const credits = readFileSync(publicFile("/images/CREDITS.md"), "utf8");
  for (const src of new Set(required)) expect(credits, src).toContain(src.replace("/images/", ""));
});
```

- [ ] **Step 2: Run to verify failure**

Run: `npx vitest run data/menu-images.test.ts`
Expected: FAIL (files missing).

- [ ] **Step 3: Find the photos on Pexels** (load the `claude-in-chrome` skill first if using the browser tools; WebSearch/WebFetch are the alternative)

Needed shots (search terms → target file):
| File | Search | Crop |
|---|---|---|
| `hero.jpg` | warm cozy coffee shop interior, window light | 1920×1080 |
| `about.jpg` | baristas behind coffee shop counter | 1200×1500 (4:5) |
| `categories/espresso.jpg` | espresso cup coffee | 600×600 |
| `categories/pastries.jpg` | assorted pastries bakery | 600×600 |
| `categories/sandwiches.jpg` | sandwich lunch cafe | 600×600 |
| `categories/cold.jpg` | iced coffee glass | 600×600 |
| `menu/cappuccino.jpg` | cappuccino latte art | 800×600 |
| `menu/latte.jpg` | vanilla latte glass | 800×600 |
| `menu/croissant.jpg` | butter croissant | 800×600 |
| `menu/brownie.jpg` | chocolate brownie | 800×600 |
| `menu/cheesecake.jpg` | berry cheesecake slice | 800×600 |
| `menu/avocado-toast.jpg` | avocado toast poached egg | 800×600 |
| `menu/cold-brew.jpg` | cold brew coffee ice | 800×600 |
| `menu/iced-tea.jpg` | peach iced tea | 800×600 |

For each candidate record the Pexels page URL, the photo ID and the **photographer name exactly as shown on the page** (never guess). Prefer images without identifiable faces, without visible brand logos and with no text. The photo must actually show what the file name says (a latte is not a cappuccino). If `PEXELS_API_KEY` is set in the environment the Pexels API may be used instead of the website; never write the key to any file or command history shown to the user.

- [ ] **Step 4: Download and size each photo**

For each chosen photo (example for the hero; substitute real ID/slug):
```bash
mkdir -p public/images/categories public/images/menu
curl -L --fail -o public/images/hero.jpg "https://images.pexels.com/photos/<ID>/pexels-photo-<ID>.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1920&h=1080"
```
Use `w=800&h=600` for menu items, `w=600&h=600` for categories, `w=1200&h=1500` for about. Keep each file under 500 KB (lower `w`/`h` if needed).

- [ ] **Step 5: Verify every photo visually**

Open each file with the Read tool (images are shown visually). Reject and replace any that does not match its name, has a logo, or is unusable as a circular crop (subject must sit near the centre for `categories/*` and `menu/*`). Report honestly any slot you could not fill; do not substitute a wrong image silently.

- [ ] **Step 6: Write `public/images/CREDITS.md`**

```md
# Créditos de imágenes

Todas las fotografías son de [Pexels](https://www.pexels.com) y se usan bajo la [Pexels License](https://www.pexels.com/license/) (uso gratuito, atribución no obligatoria pero registrada aquí).

| Archivo | Autor/a | Página en Pexels |
|---|---|---|
| hero.jpg | <nombre exacto> | <URL de la página de la foto> |
| about.jpg | … | … |
| categories/espresso.jpg | … | … |
| … una fila por cada archivo … | | |
```
Every file from Step 3's table must have a filled row (no placeholders left in the final file).

- [ ] **Step 7: Run to verify pass**

Run: `npx vitest run data/menu-images.test.ts`
Expected: all pass.

- [ ] **Step 8: Commit**

```bash
git add public/images data/menu-images.test.ts
git commit -m "feat(images): add Pexels photos with credits" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

### Task 10: Home page

**Files:**
- Create: `components/sections/Hero.tsx`, `components/sections/PopularItems.tsx`, `components/sections/UpcomingEvents.tsx`
- Modify: `app/[lang]/page.tsx`

**Interfaces:**
- Consumes: `BookingDialog`, `ButtonLink`, `Container`, `Badge`, `ProductDisc`, `categoryTone`, `getMenu`, `getFeatured`, `menuImageSrc`, `getUpcomingEvents`, `formatPrice`, `formatEventDate`, `formatEventTime`, `getDictionary`.
- Produces: the finished Home page.

- [ ] **Step 1: Confirm ISR behaviour in this Next version**

```bash
grep -n "revalidate" node_modules/next/dist/docs/01-app/02-guides/incremental-static-regeneration.md | head -20
grep -rn "cacheComponents" next.config.ts || echo "cacheComponents off"
```
Expected: `export const revalidate = <seconds>` documented for pages and `cacheComponents` off. If the guide says the segment config is unsupported in this setup, use `export const dynamic = "force-dynamic"` on the Home page instead and note it in the commit message.

- [ ] **Step 2: `components/sections/Hero.tsx`**

```tsx
import Image from "next/image";
import { BookingDialog } from "@/components/booking/BookingDialog";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import type { Dictionary } from "@/dictionaries/get-dictionary";
import type { Locale } from "@/lib/i18n";

export function Hero({ lang, dict }: { lang: Locale; dict: Dictionary }) {
  return (
    <section className="relative isolate flex min-h-[70vh] items-center overflow-hidden bg-espresso text-espuma">
      <Image src="/images/hero.jpg" alt="" fill priority sizes="100vw" className="-z-10 object-cover" />
      <div aria-hidden className="absolute inset-0 -z-10 bg-espresso/65" />
      <Container className="py-24">
        <h1 className="max-w-[16ch] font-display text-5xl font-extrabold">{dict.hero.title}</h1>
        <p className="mt-6 max-w-[34ch] text-lg text-espuma/90">{dict.hero.subtitle}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <BookingDialog labels={dict.booking} lang={lang} variant="accent" />
          <ButtonLink href={`/${lang}/menu`} variant="light" size="lg">{dict.hero.viewMenu}</ButtonLink>
        </div>
      </Container>
    </section>
  );
}
```

- [ ] **Step 3: `components/sections/PopularItems.tsx`**

```tsx
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { ProductDisc } from "@/components/ui/ProductDisc";
import { categoryTone } from "@/components/ui/tones";
import { menuImageSrc, type MenuItem } from "@/data/menu";
import type { Dictionary } from "@/dictionaries/get-dictionary";
import { formatPrice } from "@/lib/format";
import type { Locale } from "@/lib/i18n";

export function PopularItems({ lang, dict, items }: { lang: Locale; dict: Dictionary; items: MenuItem[] }) {
  return (
    <section aria-labelledby="popular-title" className="bg-surface py-16 lg:py-24">
      <Container>
        <h2 id="popular-title" className="font-display text-4xl font-extrabold">{dict.popular.title}</h2>
        <p className="mt-3 max-w-[40ch] text-lg text-muted">{dict.popular.intro}</p>
        <ul className="mt-10 grid gap-8 md:grid-cols-2">
          {items.map((item) => (
            <li key={item.id} className="flex items-center gap-5">
              <ProductDisc src={menuImageSrc(item)} alt={item.name[lang]} tone={categoryTone[item.category]} size="lg" />
              <div className="space-y-1">
                {item.badge && <Badge kind={item.badge} label={dict.badges[item.badge]} />}
                <h3 className="font-display text-xl font-bold">{item.name[lang]}</h3>
                <p className="font-display text-lg font-bold text-price">{formatPrice(item.priceGbp, lang)}</p>
              </div>
            </li>
          ))}
        </ul>
        <div className="mt-10">
          <ButtonLink href={`/${lang}/menu`} variant="primary">{dict.popular.viewAll}</ButtonLink>
        </div>
      </Container>
    </section>
  );
}
```

- [ ] **Step 4: `components/sections/UpcomingEvents.tsx`**

```tsx
import { BookingDialog } from "@/components/booking/BookingDialog";
import { Container } from "@/components/ui/Container";
import type { EventOccurrence } from "@/data/events";
import type { Dictionary } from "@/dictionaries/get-dictionary";
import { formatEventDate, formatEventTime } from "@/lib/format";
import type { Locale } from "@/lib/i18n";

export function UpcomingEvents({ lang, dict, events }: { lang: Locale; dict: Dictionary; events: EventOccurrence[] }) {
  return (
    <section aria-labelledby="events-title" className="py-16 lg:py-24">
      <Container>
        <h2 id="events-title" className="font-display text-4xl font-extrabold">{dict.events.title}</h2>
        <p className="mt-3 max-w-[40ch] text-lg text-muted">{dict.events.intro}</p>
        <ul className="mt-10 grid gap-6 md:grid-cols-2">
          {events.map((event) => {
            const copy = dict.events.items[event.id];
            return (
              <li key={event.startsAt.toISOString()} className="rounded-md border border-line bg-surface p-6">
                <time dateTime={event.startsAt.toISOString()} className="font-display text-xl font-bold">
                  {formatEventDate(event.startsAt, lang)}
                </time>
                <p className="mt-1 text-sm font-semibold text-muted">{formatEventTime(event.startsAt, event.endsAt, lang)}</p>
                <h3 className="mt-4 font-display text-2xl font-bold">{copy.title}</h3>
                <p className="mt-2 max-w-[45ch] text-muted">{copy.description}</p>
              </li>
            );
          })}
        </ul>
        <div className="mt-10">
          <BookingDialog labels={dict.booking} lang={lang} variant="primary" />
        </div>
      </Container>
    </section>
  );
}
```

- [ ] **Step 5: Replace `app/[lang]/page.tsx`**

```tsx
import { notFound } from "next/navigation";
import { Hero } from "@/components/sections/Hero";
import { PopularItems } from "@/components/sections/PopularItems";
import { UpcomingEvents } from "@/components/sections/UpcomingEvents";
import { getUpcomingEvents } from "@/data/events";
import { getFeatured, getMenu } from "@/data/menu";
import { getDictionary } from "@/dictionaries/get-dictionary";
import { hasLocale } from "@/lib/i18n";

// Los próximos eventos dependen de la fecha: regenerar la página cada hora.
export const revalidate = 3600;

export default async function HomePage({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);

  return (
    <main id="main">
      <Hero lang={lang} dict={dict} />
      <PopularItems lang={lang} dict={dict} items={getFeatured(getMenu(), 4)} />
      <UpcomingEvents lang={lang} dict={dict} events={getUpcomingEvents(new Date(), 4)} />
    </main>
  );
}
```

- [ ] **Step 6: Build and verify ISR + content**

```bash
npm run typecheck && npm run build
```
Expected: `/en` and `/es` appear with a revalidate time of `1h` in the route table. Then:
```bash
npx next start -p 3100 &
sleep 4
curl -s http://localhost:3100/en | grep -o "Open mic night\|Saturday coffee tasting\|Reserve a table" | sort | uniq -c
curl -s http://localhost:3100/es | grep -o "Noche de micrófono abierto\|Cata de café del sábado" | sort | uniq -c
kill %1
```
Expected: both event titles and "Reserve a table" appear in EN; the two event titles appear in ES.

- [ ] **Step 7: Commit**

```bash
git add components/sections "app/[lang]/page.tsx"
git commit -m "feat(home): hero, popular items and upcoming events" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

### Task 11: Menu page

**Files:**
- Create: `components/sections/CategoryNav.tsx`, `components/sections/MenuItemCard.tsx`, `components/sections/MenuSection.tsx`, `app/[lang]/menu/page.tsx`

**Interfaces:**
- Consumes: `groupByCategory`, `getMenu`, `menuImageSrc`, `categoryTone`, `ProductDisc`, `Badge`, `formatPrice`, dictionary keys `menu.*`, `categories.*`, `badges.*`.
- Produces: the finished Menu page (anchors `#espresso`, `#pastries`, `#sandwiches`, `#cold`).

- [ ] **Step 1: `components/sections/CategoryNav.tsx`**

```tsx
import { Container } from "@/components/ui/Container";
import { ProductDisc } from "@/components/ui/ProductDisc";
import { categoryTone } from "@/components/ui/tones";
import type { CategoryId } from "@/data/menu";
import type { Dictionary } from "@/dictionaries/get-dictionary";

export function CategoryNav({ dict, categories }: { dict: Dictionary; categories: CategoryId[] }) {
  return (
    <nav aria-label={dict.menu.jumpTo} className="border-b border-line">
      <Container>
        <ul className="flex gap-6 overflow-x-auto py-6 sm:gap-10">
          {categories.map((category) => (
            <li key={category} className="shrink-0">
              <a href={`#${category}`} className="flex w-24 flex-col items-center gap-2 text-center text-sm font-semibold hover:underline">
                <ProductDisc src={`/images/categories/${category}.jpg`} alt="" tone={categoryTone[category]} size="sm" />
                {dict.categories[category]}
              </a>
            </li>
          ))}
        </ul>
      </Container>
    </nav>
  );
}
```

- [ ] **Step 2: `components/sections/MenuItemCard.tsx`**

```tsx
import Image from "next/image";
import { Badge } from "@/components/ui/Badge";
import { menuImageSrc, type MenuItem } from "@/data/menu";
import type { Dictionary } from "@/dictionaries/get-dictionary";
import { formatPrice } from "@/lib/format";
import type { Locale } from "@/lib/i18n";

export function MenuItemCard({ item, lang, dict }: { item: MenuItem; lang: Locale; dict: Dictionary }) {
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-md bg-surface">
      <div className="relative aspect-[4/3]">
        <Image
          src={menuImageSrc(item)}
          alt={item.name[lang]}
          fill
          sizes="(min-width: 1024px) 360px, (min-width: 640px) 50vw, 100vw"
          className="object-cover"
        />
        {item.badge && (
          <div className="absolute left-3 top-3">
            <Badge kind={item.badge} label={dict.badges[item.badge]} />
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-5">
        <div className="flex items-baseline justify-between gap-4">
          <h3 className="font-display text-xl font-bold">{item.name[lang]}</h3>
          <p className="shrink-0 font-display text-lg font-bold text-price">{formatPrice(item.priceGbp, lang)}</p>
        </div>
        <p className="text-sm text-muted">{item.description[lang]}</p>
      </div>
    </article>
  );
}
```

- [ ] **Step 3: `components/sections/MenuSection.tsx`**

```tsx
import { Container } from "@/components/ui/Container";
import type { CategoryId, MenuItem } from "@/data/menu";
import type { Dictionary } from "@/dictionaries/get-dictionary";
import type { Locale } from "@/lib/i18n";
import { MenuItemCard } from "./MenuItemCard";

export function MenuSection({
  category, items, lang, dict,
}: { category: CategoryId; items: MenuItem[]; lang: Locale; dict: Dictionary }) {
  return (
    <section id={category} aria-labelledby={`${category}-title`} className="scroll-mt-6 py-12 lg:py-16">
      <Container>
        <h2 id={`${category}-title`} className="font-display text-4xl font-extrabold">{dict.categories[category]}</h2>
        <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <li key={item.id}><MenuItemCard item={item} lang={lang} dict={dict} /></li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
```

- [ ] **Step 4: `app/[lang]/menu/page.tsx`**

```tsx
import { notFound } from "next/navigation";
import { CategoryNav } from "@/components/sections/CategoryNav";
import { MenuSection } from "@/components/sections/MenuSection";
import { Container } from "@/components/ui/Container";
import { getMenu, groupByCategory } from "@/data/menu";
import { getDictionary } from "@/dictionaries/get-dictionary";
import { hasLocale } from "@/lib/i18n";

export default async function MenuPage({ params }: PageProps<"/[lang]/menu">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  const groups = groupByCategory(getMenu());

  return (
    <main id="main">
      <Container className="pb-8 pt-14 lg:pt-20">
        <h1 className="font-display text-5xl font-extrabold">{dict.menu.title}</h1>
        <p className="mt-4 max-w-[52ch] text-lg text-muted">{dict.menu.intro}</p>
      </Container>
      <CategoryNav dict={dict} categories={groups.map((g) => g.category)} />
      {groups.map((group) => (
        <MenuSection key={group.category} category={group.category} items={group.items} lang={lang} dict={dict} />
      ))}
    </main>
  );
}
```

- [ ] **Step 5: Build and verify**

```bash
npm run typecheck && npm run build
npx next start -p 3100 &
sleep 4
curl -s http://localhost:3100/en/menu | grep -o 'id="\(espresso\|pastries\|sandwiches\|cold\)"' | sort
curl -s http://localhost:3100/en/menu | grep -o "£[0-9.]*" | wc -l
curl -s http://localhost:3100/es/menu | grep -o "Latte de vainilla\|Tostada de aguacate" | sort -u
kill %1
```
Expected: the four anchors; 20 prices; both Spanish names present.

- [ ] **Step 6: Commit**

```bash
git add components/sections "app/[lang]/menu"
git commit -m "feat(menu): browsable menu page with categories" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

### Task 12: About page

**Files:**
- Create: `app/[lang]/about/page.tsx`

**Interfaces:**
- Consumes: `BookingDialog`, `Container`, dictionary `about.*`.

- [ ] **Step 1: `app/[lang]/about/page.tsx`**

```tsx
import Image from "next/image";
import { notFound } from "next/navigation";
import { BookingDialog } from "@/components/booking/BookingDialog";
import { Container } from "@/components/ui/Container";
import { getDictionary } from "@/dictionaries/get-dictionary";
import { hasLocale } from "@/lib/i18n";

export default async function AboutPage({ params }: PageProps<"/[lang]/about">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  const [lead, ...rest] = dict.about.paragraphs;

  return (
    <main id="main">
      <Container className="grid items-start gap-12 py-14 lg:grid-cols-2 lg:gap-16 lg:py-20">
        <div>
          <h1 className="font-display text-5xl font-extrabold">{dict.about.title}</h1>
          <div className="mt-8 max-w-[60ch] space-y-5 text-lg leading-relaxed">
            <p className="text-xl">{lead}</p>
            {rest.map((paragraph) => (
              <p key={paragraph} className="text-muted">{paragraph}</p>
            ))}
          </div>
          <p className="mt-8 max-w-[34ch] font-display text-2xl font-bold">{dict.about.closing}</p>
          <div className="mt-6">
            <BookingDialog labels={dict.booking} lang={lang} variant="accent" />
          </div>
        </div>
        <figure>
          {/* PLACEHOLDER: foto de stock; sustituir por una foto real de los fundadores. */}
          <div className="relative aspect-[4/5] overflow-hidden rounded-lg">
            <Image src="/images/about.jpg" alt={dict.about.imageAlt} fill priority sizes="(min-width: 1024px) 520px, 100vw" className="object-cover" />
          </div>
          <figcaption className="mt-3 text-sm text-muted">{dict.about.caption}</figcaption>
        </figure>
      </Container>
    </main>
  );
}
```

- [ ] **Step 2: Build and verify**

```bash
npm run typecheck && npm run build
npx next start -p 3100 &
sleep 4
curl -s http://localhost:3100/en/about | grep -c "Two friends, one corner"
curl -s http://localhost:3100/es/about | grep -c "Dos amigos, una esquina"
kill %1
```
Expected: `1` and `1` (or more).

- [ ] **Step 3: Commit**

```bash
git add "app/[lang]/about"
git commit -m "feat(about): founders story page" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

### Task 13: SEO (metadata, hreflang, JSON-LD, sitemap, robots)

**Files:**
- Create: `lib/seo.ts`, `lib/seo.test.ts`, `lib/structured-data.ts`, `lib/structured-data.test.ts`, `app/sitemap.ts`, `app/robots.ts`
- Modify: `app/[lang]/layout.tsx`, `app/[lang]/page.tsx`, `app/[lang]/menu/page.tsx`, `app/[lang]/about/page.tsx`

**Interfaces:**
- Produces: `pageMetadata({ lang, path, title, description }): Metadata`, `cafeJsonLd()`, `jsonLdString(data: unknown): string`.

- [ ] **Step 1: Write the failing tests**

`lib/seo.test.ts`:
```ts
import { expect, test } from "vitest";
import { pageMetadata } from "./seo";

test("canonical, alternates por idioma y Open Graph", () => {
  const meta = pageMetadata({ lang: "es", path: "/menu", title: "Menú | Brew and Co", description: "desc" });
  expect(meta.alternates).toEqual({
    canonical: "/es/menu",
    languages: { en: "/en/menu", es: "/es/menu" },
  });
  expect(meta.openGraph).toMatchObject({ title: "Menú | Brew and Co", locale: "es_ES", type: "website" });
});

test("la home usa ruta vacía", () => {
  const meta = pageMetadata({ lang: "en", path: "", title: "t", description: "d" });
  expect(meta.alternates?.canonical).toBe("/en");
});
```
`lib/structured-data.test.ts`:
```ts
import { expect, test } from "vitest";
import { cafeJsonLd, jsonLdString } from "./structured-data";

test("CafeOrCoffeeShop con horario agrupado", () => {
  const data = cafeJsonLd();
  expect(data["@type"]).toBe("CafeOrCoffeeShop");
  expect(data.openingHoursSpecification[0]).toMatchObject({
    dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday"], opens: "07:30", closes: "17:00",
  });
  expect(data.address.addressCountry).toBe("GB");
});

test("jsonLdString escapa '<' para no cerrar el <script>", () => {
  expect(jsonLdString({ a: "</script><script>alert(1)</script>" })).not.toContain("<");
});
```

- [ ] **Step 2: Run to verify failure**

Run: `npx vitest run lib/seo.test.ts lib/structured-data.test.ts`
Expected: FAIL.

- [ ] **Step 3: Implement**

`lib/seo.ts`:
```ts
import type { Metadata } from "next";
import { locales, type Locale } from "@/lib/i18n";

export function pageMetadata({
  lang, path, title, description,
}: { lang: Locale; path: string; title: string; description: string }): Metadata {
  return {
    title,
    description,
    alternates: {
      canonical: `/${lang}${path}`,
      languages: Object.fromEntries(locales.map((l) => [l, `/${l}${path}`])),
    },
    openGraph: {
      title,
      description,
      type: "website",
      locale: lang === "es" ? "es_ES" : "en_GB",
      images: [{ url: "/images/hero.jpg", width: 1920, height: 1080 }],
    },
  };
}
```
`lib/structured-data.ts`:
```ts
import { groupOpeningHours } from "@/lib/booking/opening-hours";
import { siteInfo, siteUrl } from "@/lib/site";

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

/** PLACEHOLDER: usa los datos de ejemplo de lib/site.ts; no publicar hasta sustituirlos. */
export function cafeJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "CafeOrCoffeeShop" as const,
    name: siteInfo.name,
    url: siteUrl,
    image: `${siteUrl}/images/hero.jpg`,
    telephone: siteInfo.phone,
    servesCuisine: "Coffee",
    address: {
      "@type": "PostalAddress",
      streetAddress: siteInfo.streetAddress,
      addressLocality: siteInfo.locality,
      postalCode: siteInfo.postalCode,
      addressCountry: siteInfo.country,
    },
    openingHoursSpecification: groupOpeningHours().map((g) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: g.days.map((d) => DAY_NAMES[d]),
      opens: g.open,
      closes: g.close,
    })),
  };
}

/** Serializa para incrustar en <script type="application/ld+json"> sin permitir cerrar la etiqueta. */
export function jsonLdString(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
```
`app/sitemap.ts`:
```ts
import type { MetadataRoute } from "next";
import { locales } from "@/lib/i18n";
import { siteUrl } from "@/lib/site";

const paths = ["", "/menu", "/about"];

export default function sitemap(): MetadataRoute.Sitemap {
  return locales.flatMap((lang) =>
    paths.map((path) => ({
      url: `${siteUrl}/${lang}${path}`,
      alternates: { languages: Object.fromEntries(locales.map((l) => [l, `${siteUrl}/${l}${path}`])) },
    })),
  );
}
```
`app/robots.ts`:
```ts
import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: "*", allow: "/" }, sitemap: `${siteUrl}/sitemap.xml` };
}
```

- [ ] **Step 4: Wire metadata into the layout and pages**

- `app/[lang]/layout.tsx`: add `import type { Metadata } from "next"; import { siteUrl } from "@/lib/site";` and `export const metadata: Metadata = { metadataBase: new URL(siteUrl) };`.
- In each page add (adjusting `meta.home|menu|about` and `path` `""|"/menu"|"/about"`):
```tsx
import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata({ params }: PageProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return pageMetadata({ lang, path: "", title: dict.meta.home.title, description: dict.meta.home.description });
}
```
(Use `PageProps<"/[lang]/menu">` and `PageProps<"/[lang]/about">` for the other two.)
- Home page only: render the JSON-LD inside `<main>` (first child):
```tsx
<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(cafeJsonLd()) }} />
```
with `import { cafeJsonLd, jsonLdString } from "@/lib/structured-data";`.

- [ ] **Step 5: Run tests, build and inspect output**

```bash
npx vitest run && npm run typecheck && npm run build
npx next start -p 3100 &
sleep 4
curl -s http://localhost:3100/en/menu | grep -o '<title>[^<]*</title>\|hrefLang="[a-z]*"\|rel="canonical" href="[^"]*"'
curl -s http://localhost:3100/sitemap.xml | grep -c "<loc>"
curl -s http://localhost:3100/robots.txt
curl -s http://localhost:3100/en | grep -o 'application/ld+json'
kill %1
```
Expected: title "Menu | Brew and Co", `hreflang` for `en` and `es`, canonical `/en/menu` (absolute via `metadataBase`), 6 `<loc>`, robots with the sitemap URL, one JSON-LD script on Home.

- [ ] **Step 6: Commit**

```bash
git add lib/seo.ts lib/seo.test.ts lib/structured-data.ts lib/structured-data.test.ts app
git commit -m "feat(seo): metadata, hreflang, JSON-LD, sitemap and robots" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

### Task 14: Documentation sync, design review and final verification

**Files:**
- Create: `docs/PLACEHOLDERS.md`
- Modify: `README.md`, `docs/design/README.md` (if drift), `C:\Dev\Curso Claude\.claude\agents\design-enforcer.md`

- [ ] **Step 1: Write `docs/PLACEHOLDERS.md`**

List, each with file and what to replace: founders' names and story (`dictionaries/*.json` → `about.*`); stock photo of "founders" (`public/images/about.jpg`, `about.caption`); address and phone (`lib/site.ts`); opening hours (`lib/booking/opening-hours.ts`); event days/times (`data/events.ts`); all menu copy and £ prices and claims such as "Dairy free", "No sugar added" (`data/menu-items.csv`); `NEXT_PUBLIC_SITE_URL`; mock `submitBooking` (`lib/booking/submit-booking.ts`) with the note "no deploy publicly until connected + privacy notice (UK GDPR)"; JSON-LD uses the placeholder data. State that a human must review all copy before publication.

- [ ] **Step 2: Replace the template `README.md`** with a short Spanish README: what the project is, `npm install`, `npm run dev`, `npm test`, `npm run build`, structure overview, pointer to `docs/design/`, `docs/superpowers/` and `docs/PLACEHOLDERS.md`, and the `.env.example` variable.

- [ ] **Step 3: Update the design-enforcer agent** (`C:\Dev\Curso Claude\.claude\agents\design-enforcer.md`)

Change the data source path to `brew-and-code/data/menu-items.csv`; the price rule `$9.500` → `£3.60` / `3,60 £`; brand "Brew & Code" → "Brew and Co"; add that `naranja-fuerte` must not be used for small text; add `lib/`, `data/` to the scope hints for hardcoded strings.

- [ ] **Step 4: Full automated verification**

```bash
npm test
npm run typecheck
npm run lint
npm run build
```
Expected: all green; build lists `/[lang]`, `/[lang]/menu`, `/[lang]/about` for `en` and `es`. Record the exact counts (tests passed, routes) for the report.

- [ ] **Step 5: Design review with the design-enforcer agent**

Invoke the `design-enforcer` subagent on `brew-and-code/app`, `components`, `lib`, `data` and `app/globals.css`. Fix every Critical and Important finding (re-run Step 4 afterwards); list Minor findings you choose not to fix in the final report.

- [ ] **Step 6: Manual browser check** (use the `claude-in-chrome` skill; start `npm run build && npx next start -p 3100`)

For `http://localhost:3100/en` and `/es`, at 360, 768 and 1280 px widths: no horizontal scroll; hero text readable over the photo; header wraps to two rows on mobile; category nav scrolls horizontally; open the booking dialog from Hero, Events and About; submit empty (errors + focus on name), submit valid (confirmation); close with Esc and confirm focus returns to the trigger; language switcher keeps the page; Tab through the page and confirm visible focus. Note anything not verified.

- [ ] **Step 7: Commit**

```bash
git add README.md docs
git commit -m "docs: README, placeholders list and design review fixes" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

## Self-Review Notes

- **Spec coverage:** hero with background image (T10), popular items (T4 `getFeatured` + T10), upcoming events recurring in London time (T5 + T10), reservation dialog with name/party/date/time (T6 + T8), About page (T3 copy + T12), Menu from CSV with categories and photos (T4 + T9 + T11), Pexels images with credits (T9), bilingual EN/ES with `proxy.ts` + dictionaries (T3), GBP formatting (T4), SEO/hreflang/JSON-LD/sitemap (T13), build failure on bad CSV (T4 tests + `getMenu` called at render), image fallback (T4 `menuImageSrc`), tests (T1, T3–T8, T13), design-enforcer + build/lint + browser check (T14).
- **Type consistency:** `Locale`, `Dictionary`, `MenuItem`, `BadgeId`, `CategoryId`, `Booking`, `BookingInput`, `BookingErrors`, `EventOccurrence` are defined once (T3, T4, T5, T6) and used with the same names later; `ButtonVariant`/`ButtonSize` exported from `Button.tsx` and imported by `BookingDialog`.
- **Known limits to report:** Menu items without their own photo reuse the category photo (several espresso/cold/sandwich/pastry items share an image); jsdom cannot verify native `<dialog>` focus return (covered manually in T14 Step 6).
