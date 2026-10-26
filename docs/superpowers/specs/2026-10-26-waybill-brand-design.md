# Waybill: brand and visual design

**Status:** brand direction approved by the founder on 26 Oct 2026 (D-35). This spec is awaiting approval before implementation planning.
**Reference board:** "Tailgate + Delivery Note, with the client logo" on the Round 2 canvas (https://claude.ai/artifact/Uw19nNK6esbABJ1M1eLBK5).

## 1. Intent

A waybill is the document that travels with every load. The theme joins two things the client's customers already trust:

- **The road (from Tailgate):** a dark tarmac background, red-and-white reflective chevrons, the yellow rear plate, and signwriting.
- **The paperwork (from Delivery Note):** a numbered request sheet, ballpoint-style entries, a "Received" stamp, and carbon-copy colours.

The site has to win over two audiences at once:
- **Local contractors and farmers:** it should feel familiar and capable.
- **Corporate and procurement buyers:** it should feel organised and accountable.

## 2. Goals, non-goals, anti-goals

**Goals**
- A look recognisably made for this company, built from its own world (lorries, roads, delivery books) rather than a generic logistics template.
- One system across the website, the quote form, WhatsApp and the lorry signwriting.
- Readable and accessible: WCAG 2.1 AA contrast, 44 px touch targets, visible focus.

**Non-goals**
- A new logo. The client's logo is used, with "&" added.
- Illustration or photography production. The client supplies photos.

**Anti-goals** (failures even if everything technically works)
- Anything implying live availability, an automatic booking or a guaranteed price. The stamp and request number must never read as a confirmed booking.
- Glass so heavy that text becomes hard to read over a photo.
- Drifting back to generic patterns:
  - all-caps labels above every section;
  - text joined with dots;
  - identical card grids;
  - gradients used as decoration.

## 3. Approaches considered

| Approach | Outcome |
|---|---|
| Option 1: three directions shown in use (Tailgate, Delivery Note, Murram and Tarp) | Explored. Tailgate and Delivery Note chosen to combine. |
| Option 2: Signwriter script hybrid | Explored, not chosen. |
| Option 3: the two ends (Duka local, Procurement corporate) | Explored, not chosen. Kept as the boundaries the theme sits between. |
| Combination, with glass, with the client logo | **Chosen ("Waybill").** |

## 4. Logo

- **Files**, in `public/brand/`:
  - `logo-dark.png`: charcoal, full lockup.
  - `logo-light.png`: white, full lockup.
  - `mark-dark.png` and `mark-light.png`: truck emblem only.
- **Source:** raster rebuilt from the client JPEG (`public/LOGO`). The background checkerboard was removed and an "&" in Poppins Bold was added, sitting on the logo's baseline.
- **Usage:**
  - Light version on Tarmac or Road backgrounds; dark version on white or Cab white.
  - Full lockup: at least 96 px tall on screen.
  - Emblem only: menu bars and small headers, 28–40 px tall.
- **Clear space:** at least the height of the "LOGISTICS" line on all sides.
- **Don'ts:** never recolour the logo into yellow, red or blue; never place it on glass over a busy photo; never stretch it.
- **Open:**
  - The client must approve the "&" edit.
  - A vector original is wanted before any large-format print or signwriting.

## 5. Colour

| Token | Hex | Use |
|---|---|---|
| `tarmac` | `#26292B` | Dark surfaces, primary text on light, text on yellow |
| `road` | `#2B2E30` / `#34383A` | Hero scene background planes |
| `cab-white` | `#FBFBF9` | Light surfaces, text on dark |
| `plate-yellow` | `#F6C400` | Main action button, selected time window, phone panels. **Fill only, always with tarmac text; never yellow text on white.** |
| `chevron-red` | `#C8102E` | Chevron band, request number, "Received" stamp, tail lights. Text use limited to short, bold items. |
| `carbon-blue` | `#2B3990` | Handwritten-style entries, pinstripe, letterhead box |
| `ink` | `#1D1D1F` | Body text on white and on the quote sheet |
| `muted` | `#454A57` | Secondary text and field labels on light |
| `muted-on-dark` | `#C3C8CA` / `#D3D7D8` | Secondary text on tarmac |
| `rule` | `#C9CCD6` | Ruled lines and dividers |
| `copy-yellow` / `copy-pink` | `#FFF3B0` / `#F8D7E3` | The carbon copies behind the quote sheet (decorative) |

**Contrast** (to be verified with a checker during the build):
- tarmac on plate-yellow, cab-white on tarmac, ink on white and carbon-blue on white all pass AA comfortably;
- chevron-red on white passes AA for normal text.

## 6. Type

| Family | Weights | Role |
|---|---|---|
| **Kanit** | 600, 700 | Headings, fleet names, the "Received" stamp. Geometric, so it sits beside the logo's lettering. |
| **Libre Franklin** | 400–900 | Body, navigation, labels, buttons, the request number |
| **Kalam** | 400 | Only the text a customer types into the quote sheet's single-line fields, and the sample entries. Not for messages, long notes or anything a person must read carefully. |

- All three are free Google Fonts; self-host them in the build.
- Sentence case everywhere except the logo and signwriting.
- Body text 16–18 px, with a line length under 75 characters.

## 7. Glass (glassmorphism)

**Where glass is used:**
- the sticky menu bar;
- the quote request sheet, on desktop and phone;
- the secondary "WhatsApp" button on dark backgrounds;
- the WhatsApp message preview.

**Recipes:**
- **Sheet:** `background: rgb(255 255 255 / 0.82–0.86)`, `backdrop-filter: blur(22px) saturate(160%)`, `border: 1px solid rgb(255 255 255 / 0.7)`.
- **Bar:** `background: rgb(38 41 43 / 0.55)`, `backdrop-filter: blur(16px) saturate(140%)`, a 1 px bottom border at `rgb(255 255 255 / 0.14)`.

**Rules:**
- Body text only sits on near-opaque glass (≥0.8) or on solid surfaces.
- **Fallbacks:**
  - `@supports not (backdrop-filter: blur(1px))` switches to solid tarmac or white.
  - `prefers-reduced-transparency: reduce` also switches to solid.
- Glass over a real photo must still pass AA. If it doesn't, raise the opacity rather than adding a text shadow.

## 8. Signature elements

- **Chevron band:** 16 px red-and-white diagonal stripes (8 px on mobile). Used as a section divider below the hero and under the phone header. Decorative, so `aria-hidden`.
- **Road scene:** flat tarmac planes with yellow lane dashes behind the hero. It works without a photo; a client photo can replace it later.
- **Quote sheet:**
  - ruled single-line fields, and a stack of pink and yellow copies behind it;
  - the request number in chevron red;
  - a "Received" stamp, **shown only after a successful submission**.
- **Request number:**
  - assigned by the server when an enquiry is saved;
  - shown on the success screen and in the pre-filled WhatsApp message (D-19);
  - **never shown before submission**.
  - Wording: "Request No. 0412". Never "booking" or "order".
- **Time windows:** four buttons (6 to 9 am, 9 am to 12, 12 to 3 pm, 3 to 7 pm, per D-31). The selected one is plate yellow with a tarmac border. On the phone they form a 2×2 grid.
- **Preference wording:** "Your chosen day is a request, not a booking. We'll call to confirm." This sits right above the submit button.

## 9. Layout and components

- **Pages:** Home, About, Services, Fleet, Routes, Request a Quote, Contact, in English and Swahili (`/en`, `/sw`), per D-13.
- **Home:**
  - glass menu bar over the road scene;
  - full logo, headline and two buttons on the left, the quote sheet preview on the right;
  - chevron band;
  - a ruled three-column strip (two lorries, routes) on cab white.
- **Mobile:**
  - The quote sheet is a full-width glass panel over the road scene.
  - The menu becomes a toggle button.
  - The chevron band shrinks to 8 px.
- **Buttons:**
  - Primary: plate yellow with tarmac text, 4 px radius, at least 52 px tall.
  - Secondary on dark: glass with a white border.
  - Secondary on light: tarmac outline.
- **Focus:** a 3 px plate-yellow outline on dark surfaces and a carbon-blue outline on light, with a 2 px offset.
- **Motion:** one moment only. The "Received" stamp lands once on success, and is skipped under `prefers-reduced-motion`.

## 10. Lorry signwriting

Painted by hand from the reference board:
- **Cab door:**
  - the logo in charcoal inside a double carbon-blue pinstripe frame;
  - both phone numbers on a plate-yellow panel with a tarmac outline.
- **Rear doors (Fuso box body):**
  - the logo at the top, then a full-width yellow band with both phone numbers;
  - red-and-white reflective chevrons along the bottom edge.
- **Isuzu canopy:** not yet designed. Same system; to follow if wanted.
- **Prerequisite:** the vector logo is needed before painting.

## 11. Constraints

- Within the KES 50,000 scope (D-34). No paid fonts or assets.
- Only confirmed facts appear in copy:
  - payload figures are excluded until corrected;
  - photos stay as placeholders until supplied;
  - Swahili text comes only from translations the founder supplies (D-29).
- The site keeps the robots `noindex` setting until launch approval.

## 12. Left to the builder

- Exact type scale and spacing steps (keep to the board's proportions).
- Tailwind theme token names that follow §5 and §6.
- The SVG for the road scene and chevrons as reusable components.
- Contrast verification for every text and background pair actually used.
