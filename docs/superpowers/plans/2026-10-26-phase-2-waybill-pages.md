# Phase 2: Waybill design system and public pages, implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the responsive, bilingual (EN/SW structure) public website in the approved Waybill brand: Home, Services, Fleet, Routes, About, Contact, a Quote placeholder route, and the shared header and footer. There is no form backend yet; that is Phase 3.

**Architecture:**
- A Vite + React 19 single-page app.
- Declarative routes under a language prefix (`/en/...`, `/sw/...`).
- Site facts live in one typed content module, so phone numbers, hours, fleet and routes are written once.
- UI copy lives in typed per-language dictionaries, with English fallback.
- Brand tokens are Tailwind v4 `@theme` variables in `src/index.css`. That file is the single source of truth, and a test reads it to verify contrast.

**Tech Stack:** React 19, TypeScript 6, Vite 8, Tailwind CSS 4, react-router 8 (declarative mode), @fontsource (Kanit, Libre Franklin, Kalam), Vitest 5, Testing Library, axe-core.

**Spec:** `docs/superpowers/specs/2026-10-26-waybill-brand-design.md`.
**Visual reference (copy and layout source):** "Waybill Site Pages" canvas, https://claude.ai/artifact/QR4VzaK4x1ZhT1uViH5F8L.
**Scope source:** `docs/ROADMAP_AND_GATES.md`, Phase 2.

## Global Constraints

- Only confirmed facts in copy. Unknowns render through `<Pending>` (Task 5) as "[to be confirmed]" or "[to be supplied]". This covers payload, sizes, KRA PIN, cover, yard address, the company story and photos.
- Brand name in copy is "Kim's & Cargo's"; the legal name is "Kim's & Cargo's Logistics Company".
- Phones: `0745 822 788` and `0783 330 889`, both for calls and WhatsApp. WhatsApp CTA default is `0745 822 788`. Email: `kimsandcargos1@gmail.com`.
- Hours copy: "Monday to Saturday, 6 am to 7 pm. Sundays by arrangement."
- Preference copy (wherever a quote CTA describes the process): "Your chosen day is a request, not a booking. We'll call to confirm."
- Copy style:
  - sentence case;
  - no all-caps labels except the logo and signwriting;
  - no "·" joined strings;
  - no "→" appended to links.
- Colour rules:
  - Plate yellow `#F6C400` is a fill only, always with tarmac `#26292B` text.
  - Body text sits only on glass with ≥0.8 opacity or on solid surfaces.
- Touch targets are at least 44 px. Primary buttons are at least 52 px tall with a 4 px radius.
- Focus ring: a 3 px plate-yellow outline on dark surfaces and carbon-blue `#2B3990` on light, with a 2 px offset.
- Glass falls back to solid under `@supports not (backdrop-filter: blur(1px))` and `@media (prefers-reduced-transparency: reduce)`.
- No embedded maps; use a plain "Open in Google Maps" link. No analytics in this phase.
- Keep `<meta name="robots" content="noindex, nofollow">` (pre-launch).
- No new runtime dependencies beyond `react-router` and the three `@fontsource/*` packages. `axe-core` is a dev dependency.
- `npm run check` must pass at the end of every task.

## Review Focus

1. **Unknown or missing language prefix.** `/`, `/fr/fleet` and `/fleet` must redirect to the `/en/...` equivalent, not show a blank page. Owner: Task 4.
2. **Untranslated Swahili keys.** A `/sw` page must fall back to English text, never render `undefined` or an empty string. Owner: Task 3.
3. **WhatsApp and phone links with special characters.** Text containing `&`, apostrophes and newlines ("Kim's & Cargo's", multi-line) must be URL-encoded. Local numbers must become `+254...` and `254...` correctly. Owner: Task 2.
4. **Mobile menu with the keyboard.** Escape closes the menu and returns focus to the toggle. Choosing a link closes it. `aria-expanded` reflects the state. Owner: Task 4.
5. **Unconfirmed facts shown as real.** Fleet payload and size, and company details, must visibly read "[to be confirmed]" through `<Pending>`, never a number. Owner: Tasks 5 and 7.

---

## File structure

```
src/
  index.css                      # Tailwind import, @theme tokens, glass + focus utilities, fallbacks
  main.tsx                       # mounts <App/> inside <BrowserRouter>
  App.tsx                        # route table
  content/site.ts                # typed site facts (single source)
  lib/links.ts                   # telHref, waHref, mapsHref
  lib/contrast.ts                # WCAG contrast ratio (used by tests)
  i18n/types.ts                  # Messages type
  i18n/en.ts                     # English dictionary (complete)
  i18n/sw.ts                     # Swahili dictionary (Partial<Messages>, founder fills)
  i18n/locale.tsx                # LocaleProvider, useLocale, useT, localePath
  components/brand/Logo.tsx      # full or mark, light or dark
  components/brand/RoadScene.tsx # decorative SVG road background
  components/brand/ChevronBand.tsx
  components/ui/Button.tsx       # ButtonLink: primary | glass | outline | dark
  components/ui/GlassSheet.tsx   # frosted sheet + carbon copies
  components/ui/Pending.tsx
  components/layout/SiteHeader.tsx
  components/layout/SiteFooter.tsx
  components/layout/PageHead.tsx # road band + h1 + intro + chevron
  components/layout/Layout.tsx   # skip link, header, <main>, footer, document title
  pages/HomePage.tsx  ServicesPage.tsx  FleetPage.tsx  RoutesPage.tsx
  pages/AboutPage.tsx  ContactPage.tsx  QuotePage.tsx  NotFoundPage.tsx
  test/setup.ts  test/render.tsx  # renderAt(path) helper
vercel.json                      # SPA rewrite
```

Tests sit beside their source as `*.test.ts(x)`.

---

### Task 1: Brand tokens, fonts and the contrast guard

**Files:**
- Modify: `src/index.css`, `src/main.tsx` (font imports), `package.json`
- Create: `src/lib/contrast.ts`, `src/lib/contrast.test.ts`, `src/brand.tokens.test.ts`

**Interfaces:**
- Produces:
  - Tailwind colour utilities: `tarmac`, `road`, `road-2`, `cab`, `plate`, `chevron`, `carbon`, `ink`, `muted`, `muted-dark`, `muted-dark-2`, `rule`, `copy-yellow`, `copy-pink`.
  - Font utilities: `font-display` (Kanit), `font-sans` (Libre Franklin), `font-hand` (Kalam).
  - CSS classes: `.glass-sheet`, `.glass-bar`, `.glass-button`, `.focus-dark`, `.focus-light`.
  - `contrastRatio(a: string, b: string): number` in `src/lib/contrast.ts`.

- [ ] **Step 1: Install fonts.** Run `npm install @fontsource/kanit @fontsource/libre-franklin @fontsource/kalam` and `npm install -D axe-core`.

- [ ] **Step 2: Write the failing tests**

```ts
// src/lib/contrast.test.ts
expect(contrastRatio('#000000', '#FFFFFF')).toBeCloseTo(21, 1)
expect(contrastRatio('#FFFFFF', '#FFFFFF')).toBeCloseTo(1, 5)

// src/brand.tokens.test.ts: reads src/index.css with fs, parses `--color-<name>: #xxxxxx`
const pairs: [fg: string, bg: string][] = [
  ['tarmac', 'plate'], ['cab', 'tarmac'], ['ink', 'cab'], ['muted', 'cab'],
  ['carbon', 'cab'], ['chevron', 'cab'], ['muted-dark', 'tarmac'], ['muted-dark-2', 'road'],
]
for (const [fg, bg] of pairs) expect(contrastRatio(tok[fg], tok[bg])).toBeGreaterThanOrEqual(4.5)
expect(tok.plate).toBe('#F6C400'); expect(tok.tarmac).toBe('#26292B')
```

- [ ] **Step 3: Run `npm test`.** Expected: FAIL (no `contrast.ts`, tokens missing).

- [ ] **Step 4: Implement**
  - `contrastRatio` uses WCAG 2.1 relative luminance.
  - In `src/index.css`, add `@theme` with exactly these values:
    - `tarmac #26292B`, `road #2B2E30`, `road-2 #34383A`, `cab #FBFBF9`, `plate #F6C400`, `chevron #C8102E`, `carbon #2B3990`, `ink #1D1D1F`, `muted #454A57`, `muted-dark #C3C8CA`, `muted-dark-2 #D3D7D8`, `rule #C9CCD6`, `copy-yellow #FFF3B0`, `copy-pink #F8D7E3`;
    - fonts `--font-display: "Kanit", sans-serif`, `--font-sans: "Libre Franklin", system-ui, sans-serif`, `--font-hand: "Kalam", cursive`.
  - Glass recipes, from spec §7:
    - `.glass-sheet`: `rgb(255 255 255 / .86)`, `blur(22px) saturate(160%)`, `1px solid rgb(255 255 255 / .7)`.
    - `.glass-bar`: `rgb(38 41 43 / .6)`, `blur(16px) saturate(140%)`, bottom border `rgb(255 255 255 / .14)`.
    - `.glass-button`: `rgb(255 255 255 / .12)`, `blur(12px)`, `1px solid rgb(255 255 255 / .45)`.
    - Fallback blocks set solid `#FFFFFF` (sheet) and `#26292B` (bar and button).
  - Focus classes use `:focus-visible` with the global-constraint values.
  - Import font weights in `main.tsx`: Kanit 600/700, Libre Franklin 400/500/600/700/800/900, Kalam 400.

- [ ] **Step 5: Run `npm run check`.** Expected: lint, typecheck, tests and build all pass. If a pair fails the contrast test, report the failing pair to the founder instead of changing the spec colour silently.

- [ ] **Step 6: Commit.** `git commit -m "feat(brand): Waybill tokens, fonts, glass utilities and contrast guard"`

---

### Task 2: Site facts and link helpers

**Files:**
- Create: `src/content/site.ts`, `src/lib/links.ts`, `src/lib/links.test.ts`, `src/content/site.test.ts`

**Interfaces:**
- Produces:
  - `site` (a `const` object):
    - `legalName`, `brandName`;
    - `phones: readonly { display: string }[]` (index 0 is the WhatsApp default);
    - `email`;
    - `hours: { weekdays: '6 am to 7 pm', days: 'Monday to Saturday', sunday: 'by arrangement' }`;
    - `fleet: readonly FleetItem[]`;
    - `longRoutes: readonly string[][]`;
    - `areaGroups: readonly { id: 'nairobi'|'kajiado'|'machakos'|'thika'; places: string[] }[]`;
    - `pending: { payload: null; bedSize: null; kraPin: null; transitCover: null; yardAddress: null; companyStory: null }`.
  - `FleetItem = { id: 'isuzu-frr33'|'fuso-fh'; name: string; bodyKey: string; payload: string | null; size: string | null }`.
  - `telHref(display: string): string`, `waHref(display: string, text?: string): string`, `mapsHref(query: string | null): string | null`.

- [ ] **Step 1: Write the failing tests**

```ts
expect(telHref('0745 822 788')).toBe('tel:+254745822788')
expect(waHref('0783 330 889')).toBe('https://wa.me/254783330889')
expect(waHref('0745 822 788', "Hello Kim's & Cargo's\nPickup: Kitengela"))
  .toBe('https://wa.me/254745822788?text=' + encodeURIComponent("Hello Kim's & Cargo's\nPickup: Kitengela"))
expect(() => telHref('12345')).toThrow()                    // not a Kenyan mobile
expect(mapsHref(null)).toBeNull()
// site.test.ts
expect(site.phones.map(p => p.display)).toEqual(['0745 822 788', '0783 330 889'])
expect(site.fleet.every(f => f.payload === null && f.size === null)).toBe(true)
expect(site.longRoutes).toEqual([['Nairobi','Nakuru','Eldoret'],['Nairobi','Mombasa']])
expect(site.areaGroups.flatMap(g => g.places)).toEqual(expect.arrayContaining(
  ['Kitengela','Birika','Ongata Rongai','Kajiado Town','Athi River','Syokimau','Machakos Town','Thika','Juja','Ruiru','Gatundu']))
```

- [ ] **Step 2: Run `npm test`.** Expected: FAIL (modules missing).

- [ ] **Step 3: Implement.**
  - `telHref`: strip spaces, require `/^0[17]\d{8}$/`, and replace the leading 0 with `+254`.
  - `waHref`: the same check, using `254…` without the plus.
  - `mapsHref(q)` returns `https://www.google.com/maps/search/?api=1&query=` plus the encoded query, or `null` when there is no query.
  - The Nairobi group's place list is `['Nairobi metropolitan area']`.

- [ ] **Step 4: Run `npm test`.** Expected: PASS. Then run `npm run check`.

- [ ] **Step 5: Commit.** `git commit -m "feat(content): typed site facts and tel/WhatsApp/maps link helpers"`

---

### Task 3: Language dictionaries with English fallback

**Files:**
- Create: `src/i18n/types.ts`, `src/i18n/en.ts`, `src/i18n/sw.ts`, `src/i18n/locale.tsx`, `src/i18n/locale.test.tsx`

**Interfaces:**
- Consumes: nothing.
- Produces:
  - `type Locale = 'en' | 'sw'`; `const locales: readonly Locale[]`; `isLocale(x: string): x is Locale`.
  - `type Messages` (nested string records, keys grouped by page: `nav`, `footer`, `home`, `services`, `fleet`, `routes`, `about`, `contact`, `quote`, `notFound`, `common`).
  - `en: Messages` (complete); `sw: DeepPartial<Messages>`.
  - `<LocaleProvider locale={Locale}>`, `useLocale(): Locale`.
  - `useT(): (key: MessageKey) => string`, where `MessageKey` is the dotted-path union of `Messages`, for example `'home.headline'`.
  - `localePath(locale: Locale, path: string): string`, for example `localePath('sw','/fleet') === '/sw/fleet'` and `localePath('en','/') === '/en'`.

- [ ] **Step 1: Write the failing tests**

```tsx
// renders <Probe/> calling t('home.headline') inside <LocaleProvider locale="sw"> with sw = {}
expect(screen.getByText('Loaded from 6 am, Monday to Saturday')).toBeInTheDocument()   // English fallback
expect(localePath('sw', '/fleet')).toBe('/sw/fleet')
expect(localePath('en', '/')).toBe('/en')
expect(isLocale('fr')).toBe(false)
// type-level: en satisfies Messages (compile-time via `satisfies`)
```

- [ ] **Step 2: Run `npm test`.** Expected: FAIL.

- [ ] **Step 3: Implement.**
  - `useT` reads `sw` first and falls back to `en`, then to the key itself. In `import.meta.env.DEV` it logs `console.warn` once per missing key.
  - Fill `en.ts` with the copy from the canvas boards, verbatim. Key strings include:
    - `home.headline`: "Loaded from 6 am, Monday to Saturday".
    - `home.howTitle`: "How a quote works".
    - `common.requestQuote`: "Request a quote".
    - `common.preference`: "Your chosen day is a request, not a booking. We'll call to confirm."
    - `notFound.title`: "We can't find that page".
  - Leave `sw.ts` as `export const sw = {} satisfies DeepPartial<Messages>`, with a header comment saying the founder supplies translations (D-29).

- [ ] **Step 4: Run `npm test`, then `npm run check`.** Expected: PASS.

- [ ] **Step 5: Commit.** `git commit -m "feat(i18n): typed EN/SW dictionaries with English fallback"`

---

### Task 4: Routing, layout shell, header and footer

**Files:**
- Modify: `src/main.tsx`, `src/App.tsx`, `src/App.test.tsx`, `index.html` (`<title>`)
- Create: `src/components/layout/{Layout,SiteHeader,SiteFooter}.tsx`, `src/components/layout/SiteHeader.test.tsx`, `src/pages/NotFoundPage.tsx`, `src/test/render.tsx`, `vercel.json`, and minimal placeholder exports for every page in `src/pages/` (each returns its `<h1>`, replaced in Tasks 6–8)

**Interfaces:**
- Consumes: `useT`, `localePath`, `LocaleProvider`, `isLocale` (Task 3); `site`, `telHref`, `waHref` (Task 2); `Logo` is not available yet, so render the `<img src="/brand/mark-light.png">` directly and swap it in Task 5.
- Produces:
  - Routes `/:lang`, `/:lang/services|fleet|routes|about|contact|quote`, and `*`.
  - `renderAt(path: string): RenderResult` in `src/test/render.tsx`, which wraps `<MemoryRouter initialEntries={[path]}><App/></MemoryRouter>`.
  - Every page `<h1>` comes from `en.ts`. The Home placeholder already renders `home.headline`, and the other placeholders use their page titles (Services, Fleet, Service areas and routes, About us, Contact, Request a quote).
  - `<Layout title={string}>` sets `document.title` to `` `${title} | Kim's & Cargo's` `` and `document.documentElement.lang`.

- [ ] **Step 1: Install.** Run `npm install react-router@8`, and confirm its declarative exports (`BrowserRouter`, `MemoryRouter`, `Routes`, `Route`, `Navigate`, `useParams`, `NavLink`) in its type definitions.

- [ ] **Step 2: Write the failing tests**

```tsx
// App.test.tsx
renderAt('/');            expect(await screen.findByRole('heading', { level: 1, name: 'Loaded from 6 am, Monday to Saturday' })).toBeVisible()
renderAt('/fr/fleet');    expect(await screen.findByRole('heading', { level: 1, name: 'Fleet' })).toBeVisible()    // redirected to /en/fleet
renderAt('/en/nope');     expect(screen.getByRole('heading', { level: 1, name: "We can't find that page" })).toBeVisible()
renderAt('/sw/fleet');    expect(document.documentElement.lang).toBe('sw')
renderAt('/en/fleet');    expect(within(screen.getByRole('navigation', { name: 'Main' })).getByRole('link', { name: 'Fleet' })).toHaveAttribute('aria-current', 'page')
renderAt('/en');          expect(screen.getByRole('link', { name: 'Skip to content' })).toHaveAttribute('href', '#main')
// SiteHeader.test.tsx (mobile menu, Review Focus 4)
await user.click(screen.getByRole('button', { name: 'Open menu' }))
expect(screen.getByRole('button', { name: 'Close menu' })).toHaveAttribute('aria-expanded', 'true')
await user.keyboard('{Escape}')
expect(screen.getByRole('button', { name: 'Open menu' })).toHaveFocus()
await user.click(screen.getByRole('button', { name: 'Open menu' })); await user.click(within(screen.getByRole('navigation', { name: 'Main' })).getByRole('link', { name: 'Routes' }))
expect(screen.getByRole('button', { name: 'Open menu' })).toHaveAttribute('aria-expanded', 'false')
```

- [ ] **Step 3: Run `npm test`.** Expected: FAIL.

- [ ] **Step 4: Implement.**
  - **Routing:**
    - `/` and any path whose first segment isn't a locale redirect to `/en` plus the rest of the path. For `/fr/fleet`, the leading segment is dropped when it's a two-letter code.
    - The `:lang` element validates with `isLocale` and wraps the children in `LocaleProvider`.
  - **Header:**
    - Uses `.glass-bar`, the emblem plus "Kim's & Cargo's" in `font-display`, and `NavLink`s for Services, Fleet, Routes, About and Contact. The active link gets a 3 px plate-yellow underline.
    - Language switch: `lang="sw"` on the "Kiswahili" link, `lang="en"` on "English", pointing to the same page in the other locale.
    - Primary "Request a quote" button.
    - Below 900 px: a toggle button with `aria-controls`, `aria-expanded` and labels "Open menu" and "Close menu".
    - One `<nav aria-label="Main">` link list serves both desktop and mobile; CSS shows or hides it. Don't duplicate the links. The toggle is always in the DOM, hidden at ≥900 px with CSS, so jsdom tests can reach it.
    - The footer nav is `<nav aria-label="Footer">`, so tests can scope links with `within`.
  - **Footer:** the chevron band, the light logo, call/WhatsApp, loading hours, page links, "© {year} Kim's & Cargo's Logistics Company", and a "Privacy notice" link to `#privacy`. The privacy page itself is a Phase 4 launch item.
  - **`vercel.json`:** `{ "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }`.
  - Remove the Phase 1 placeholder `App` heading test.

- [ ] **Step 5: Run `npm test`, then `npm run check`.** Expected: PASS.

- [ ] **Step 6: Commit.** `git commit -m "feat(layout): locale routes, glass header with mobile menu, footer, 404"`

---

### Task 5: Brand components

**Files:**
- Create: `src/components/brand/{Logo,RoadScene,ChevronBand}.tsx`, `src/components/ui/{Button,GlassSheet,Pending}.tsx`, `src/components/layout/PageHead.tsx`, `src/components/brand/brand.test.tsx`
- Modify: `SiteHeader.tsx` and `SiteFooter.tsx` (use `Logo` and `ChevronBand`)

**Interfaces:**
- Produces:
  - `Logo({ kind: 'full'|'mark', tone: 'light'|'dark', className? })`. The full logo has alt "Kim's & Cargo's Logistics"; the mark has `alt=""` when the text sits beside it (prop `decorative?: boolean`).
  - `RoadScene({ variant: 'hero'|'band' })`: decorative SVG, `aria-hidden`, fills its parent.
  - `ChevronBand({ size?: 'lg'|'sm' })`: 16 px or 8 px, `aria-hidden`.
  - `ButtonLink({ to | href, variant: 'primary'|'glass'|'outline'|'dark', children })`: renders a router `Link` for internal paths and `<a>` otherwise. External `wa.me` links get `rel="noopener"` and `target="_blank"`.
  - `GlassSheet({ copies?: boolean, children, className? })`: `.glass-sheet` plus the pink and yellow copies behind it when `copies`.
  - `Pending({ kind: 'confirm'|'supply' })`: renders "[to be confirmed]" or "[to be supplied]" in `text-muted` inside a `<span data-pending>`.
  - `PageHead({ title, intro })`: road band, h1, intro and chevron band.

- [ ] **Step 1: Write the failing tests**

```tsx
render(<Logo kind="full" tone="light" />); expect(screen.getByRole('img', { name: "Kim's & Cargo's Logistics" })).toHaveAttribute('src', '/brand/logo-light.png')
render(<Pending kind="confirm" />);        expect(screen.getByText('[to be confirmed]')).toHaveAttribute('data-pending')
render(<MemoryRouter><ButtonLink to="/en/quote" variant="primary">Request a quote</ButtonLink></MemoryRouter>)
expect(screen.getByRole('link', { name: 'Request a quote' })).toHaveAttribute('href', '/en/quote')
render(<ButtonLink href="https://wa.me/254745822788" variant="glass">WhatsApp</ButtonLink>)
expect(screen.getByRole('link', { name: 'WhatsApp' })).toHaveAttribute('rel', expect.stringContaining('noopener'))
const { container } = render(<ChevronBand />); expect(container.firstChild).toHaveAttribute('aria-hidden', 'true')
```

- [ ] **Step 2: Run `npm test`.** Expected: FAIL.
- [ ] **Step 3: Implement the components.** Draw the road scene and chevron geometry to match the canvas boards. Chevrons use `repeating-linear-gradient(135deg, chevron 0 24px, cab 24px 48px)`, or 14/28 px for `sm`.
- [ ] **Step 4: Run `npm test`, then `npm run check`.** Expected: PASS.
- [ ] **Step 5: Commit.** `git commit -m "feat(brand): Logo, RoadScene, ChevronBand, ButtonLink, GlassSheet, Pending, PageHead"`

---

### Task 6: Home page

**Files:**
- Modify: `src/pages/HomePage.tsx`, `src/i18n/en.ts`
- Create: `src/pages/HomePage.test.tsx`

**Interfaces:**
- Consumes: Tasks 2–5.
- Produces: none.

The page follows the canvas "Home" board, in order:
1. Hero: road scene, full light logo, h1, intro, primary and glass WhatsApp buttons, and a `GlassSheet copies` "Start a quote" with Pickup, Drop-off and Preferred day fields plus a "Continue" button. The fields are not submitted. Continue navigates to `/:lang/quote` and carries the three values as query params, which Phase 3 reads. No request number.
2. Chevron band.
3. Three-column strip: Isuzu, Fuso, routes.
4. "What we carry": four items.
5. "How a quote works": an ordered list, 1–3.
6. Yellow "Rather talk it through?" band.

Mobile: the sections stack, and the start-a-quote sheet moves below the hero buttons.

- [ ] **Step 1: Write the failing tests**

```tsx
renderAt('/en')
expect(screen.getByRole('list', { name: 'How a quote works' }).querySelectorAll('li')).toHaveLength(3)
await user.type(screen.getByLabelText('Pickup'), 'Kitengela'); await user.click(screen.getByRole('button', { name: 'Continue' }))
expect(await screen.findByRole('heading', { level: 1, name: 'Request a quote' })).toBeVisible()
expect(screen.queryByText(/No\. \d+/)).not.toBeInTheDocument()            // no request number before submission
expect(within(screen.getByRole('main')).getAllByRole('link', { name: /WhatsApp/ })[0]).toHaveAttribute('href', 'https://wa.me/254745822788')
```

- [ ] **Step 2: Run the test.** Expected: FAIL.
- [ ] **Step 3: Implement.** Labels on the start-a-quote fields are visible `<label>`s. Typed text uses `font-hand text-carbon` per spec §6.
- [ ] **Step 4: Run `npm test`, then `npm run check`.** Expected: PASS.
- [ ] **Step 5: Commit.** `git commit -m "feat(pages): Waybill home page"`

---

### Task 7: Services and Fleet pages

**Files:**
- Modify: `src/pages/ServicesPage.tsx`, `src/pages/FleetPage.tsx`, `src/i18n/en.ts`
- Create: `src/pages/ServicesPage.test.tsx`, `src/pages/FleetPage.test.tsx`

**Interfaces:**
- Consumes: `site.fleet`, `Pending`, `PageHead`, `ButtonLink`.

**Services** has five `<article>`s, with the titles and "Usually on" lines copied from the canvas:
1. Construction and industrial haulage
2. Timber and hardware
3. Agricultural produce
4. Closed-box commercial distribution
5. General, on-demand and contract haulage

It ends with a dark "Not sure which lorry you need?" band.

**Fleet** has two articles built from `site.fleet`. Each has a photo placeholder box with the alt-intent caption from the canvas, and a details table: Body, Payload, Size, Best for.

- [ ] **Step 1: Write the failing tests**

```tsx
renderAt('/en/services'); expect(screen.getAllByRole('article')).toHaveLength(5)
renderAt('/en/fleet')
const isuzu = screen.getByRole('article', { name: 'Isuzu FRR 33' })
expect(within(isuzu).getByText('Payload').nextElementSibling).toHaveTextContent('[to be confirmed]')   // Review Focus 5
expect(within(isuzu).queryByText(/\d+\s*(t|tons|tonnes|kg)\b/i)).toBeNull()
```

- [ ] **Step 2: Run the tests.** Expected: FAIL.
- [ ] **Step 3: Implement.** Each article is named by its `<h2>` through `aria-labelledby`. When `site.fleet[i].payload` is `null`, render `<Pending kind="confirm"/>`.
- [ ] **Step 4: Run `npm test`, then `npm run check`.** Expected: PASS.
- [ ] **Step 5: Commit.** `git commit -m "feat(pages): services and fleet"`

---

### Task 8: Routes, About, Contact and Quote placeholder

**Files:**
- Modify: `src/pages/{RoutesPage,AboutPage,ContactPage,QuotePage}.tsx`, `src/i18n/en.ts`
- Create: `src/pages/{RoutesPage,AboutPage,ContactPage,QuotePage}.test.tsx`

**Interfaces:**
- Consumes: `site.longRoutes`, `site.areaGroups`, `site.pending`, `telHref`, `waHref`, `mapsHref`, `Pending`.

**Routes:**
- Each long route is a "road strip": a tarmac bar with yellow dashes and stop markers. It's built from markup, and each route is an `<ol aria-label="Nairobi to Eldoret">` of its stops.
- Below that, the four area groups, then "Going somewhere else?".

**About:**
- "Who we are" with `<Pending kind="supply"/>` for the company story.
- "What you can expect": the four commitments from the canvas.
- "Company details": the name, then `Pending` for KRA PIN, goods-in-transit cover and yard address.

**Contact:**
- Call: both numbers, as `tel:` links.
- WhatsApp: two buttons.
- Email: a `mailto:` link.
- Yard: `Pending`. The "Open in Google Maps" link renders only when `mapsHref` returns a URL; while the address is pending it doesn't render.

**Quote** (Phase 3 placeholder):
- `PageHead` "Request a quote".
- A glass sheet reading "The online quote form is coming soon. For now, call or WhatsApp us with your pickup, drop-off, load and preferred day.", with both numbers.
- If query params from Home are present, show them as a pre-filled WhatsApp link: `waHref(site.phones[0].display, text)`. The text opens with "Hello Kim's & Cargo's, I'd like a quote." and adds "Pickup: …", "Drop-off: …" and "Preferred day: …" lines for whichever params are present.

- [ ] **Step 1: Write the failing tests**

```tsx
renderAt('/en/routes'); expect(within(screen.getByRole('list', { name: 'Nairobi to Eldoret' })).getAllByRole('listitem').map(li => li.textContent)).toEqual(['Nairobi','Nakuru','Eldoret'])
renderAt('/en/contact'); expect(within(screen.getByRole('main')).getByRole('link', { name: '0783 330 889' })).toHaveAttribute('href', 'tel:+254783330889')
expect(screen.queryByRole('link', { name: 'Open in Google Maps' })).toBeNull()                     // address pending
renderAt('/en/about'); expect(screen.getAllByText('[to be supplied]').length).toBeGreaterThanOrEqual(2)
renderAt('/en/quote?pickup=Kitengela&dropoff=Westlands%2C%20Nairobi')
expect(screen.getByRole('link', { name: 'Send these details on WhatsApp' }).getAttribute('href'))
  .toBe('https://wa.me/254745822788?text=' + encodeURIComponent("Hello Kim's & Cargo's, I'd like a quote.\nPickup: Kitengela\nDrop-off: Westlands, Nairobi"))
```

- [ ] **Step 2: Run the tests.** Expected: FAIL.
- [ ] **Step 3: Implement the four pages.**
- [ ] **Step 4: Run `npm test`, then `npm run check`.** Expected: PASS.
- [ ] **Step 5: Commit.** `git commit -m "feat(pages): routes, about, contact and quote placeholder"`

---

### Task 9: Accessibility sweep and Gate 2 evidence

**Files:**
- Create: `src/pages/a11y.test.tsx`
- Modify: any page or component the sweep flags

**Interfaces:**
- Consumes: `renderAt`, `axe-core`.

- [ ] **Step 1: Write the failing test.** For each path in `['/en', '/en/services', '/en/fleet', '/en/routes', '/en/about', '/en/contact', '/en/quote', '/sw', '/en/nope']`:

```tsx
const { container } = renderAt(path)
const results = await axe.run(container, { rules: { 'color-contrast': { enabled: false } } }) // jsdom can't compute layout colour; contrast is covered by Task 1
expect(results.violations.map(v => v.id)).toEqual([])
expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
```

- [ ] **Step 2: Run `npm test`.** Expected: PASS, or a list of violations. Fix every violation in the page or component that causes it.
- [ ] **Step 3: Manual responsive and keyboard check.**
  - Run `npm run dev`. View every page at 360, 768 and 1280 px wide, and tab through each page.
  - Expected: no horizontal scroll; the focus ring is visible on every interactive element; the menu toggle works.
  - Record the results (pass or fail per page and width) in `docs/evidence/phase-2-checks.md`.
- [ ] **Step 4: Run `npm run check`.** Expected: PASS. Record the summary in the same evidence file.
- [ ] **Step 5: Commit.** `git commit -m "test(a11y): axe sweep across pages; Phase 2 evidence"`

---

## Out of scope for this plan

Each item is left for a later phase or approval:
- **Phase 3:** the real quote form, calendar and time windows, the server request number, the "Received" stamp, the Supabase function, Turnstile, Gmail and the database.
- **Phase 4:**
  - prerendering, sitemap, robots and social meta;
  - the privacy notice page;
  - Vercel deployment and Web Analytics;
  - the keep-alive schedule;
  - the photo swap when the client supplies photos.
- **Founder/client:** Swahili translations (D-29).
