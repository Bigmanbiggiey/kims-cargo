# Phase 2 checks: evidence for Gate 2

Date: 26 Oct 2026. Branch `phase-2-pages`. Plan: `docs/superpowers/plans/2026-10-26-phase-2-waybill-pages.md`.

## Automated (`npm run check`)

| Check | Result |
|---|---|
| Lint (oxlint) | Pass, 0 warnings |
| Type check (`tsc -b`) | Pass |
| Tests (Vitest) | **83 passed / 83**, 16 files |
| Production build (Vite) | Pass |

The tests cover:
- **Colour contrast:** all 8 text/background pairs from spec §5 pass WCAG AA, which is 4.5:1 (`src/brand.tokens.test.ts`).
- **Links and routing:**
  - phone and WhatsApp link formatting, including `&`, apostrophes and newlines;
  - an unknown language prefix, or a page with no prefix, redirects to English;
  - unknown pages show a 404.
- **Swahili:** missing Swahili text falls back to English.
- **Mobile menu:** opening it, Escape closing it and returning focus, and choosing a link closing it.
- **No invented facts:**
  - Fleet payload shows "[to be confirmed]", with no made-up tonnage;
  - no request number appears before submission.
- **axe-core accessibility sweep:** no violations on `/en`, `/en/services`, `/en/fleet`, `/en/routes`, `/en/about`, `/en/contact`, `/en/quote`, `/sw` and `/en/nope`, and exactly one h1 per page. Colour contrast is excluded because jsdom has no layout; the token test covers it instead.
- **The axe sweep can fail:** a probe with a missing `alt` and an unlabelled input made axe report `image-alt` and `label`. The probe was then removed.

## Responsive check (dev server, Chrome)

Each page was loaded in a same-origin frame at three widths, and `scrollWidth` was compared with the frame width. The vertical scrollbar takes 15 px, so on scrolling pages `scrollWidth` reads the width minus 15.

| Page | 360 px | 768 px | 1280 px |
|---|---|---|---|
| /en | ok | ok | ok |
| /en/services | ok | ok | ok |
| /en/fleet | ok | ok | ok |
| /en/routes | ok | ok | ok |
| /en/about | ok | ok | ok |
| /en/contact | ok | ok | ok |
| /en/quote | ok | ok | ok |
| /sw | ok | ok | ok |
| /en/nope | ok | ok | ok |

No horizontal scroll at any width.

## Keyboard focus

Every visible link, button and field was focused by script at 1280 px, and its outline was checked to be at least 2 px.

| Page | Focusable elements | Without a visible ring |
|---|---|---|
| /en | 30 | 0 |
| /en/contact | 22 | 0 |
| /en/quote | 20 | 0 |

## Not verified here

- **Visual screenshots:** the browser's screenshot call timed out twice, so there is no visual capture in this record. Layout matches the canvas by construction, but a human look on a real phone is still recommended at Gate 2.
- **Real-device testing:** iOS Safari and Android Chrome, including how the glass effect renders. That's a Phase 4 QA item.
- **Swahili pages:** they currently show English fallback text until translations are supplied (D-29).
