# Decisions, Assumptions, and Open Questions

## Confirmed decisions

| ID | Decision | Status |
|---|---|---|
| D-01 | Total project price is KES 50,000 | Confirmed |
| D-02 | Create a new project workspace | Confirmed |
| D-03 | Planning and architecture happen with the founder + ChatGPT before Claude Code executes | Confirmed |
| D-04 | Use documentation-first workflow | Confirmed |
| D-05 | Require explicit approval gates between major phases | Confirmed |
| D-06 | Quote enquiry workflow is part of core scope | Confirmed |
| D-07 | Preferred-date/time calendar is part of core scope | Confirmed |
| D-08 | Calendar captures a preference; it does not provide live availability or confirm a booking | Confirmed |
| D-09 | Optional maintenance rate is KES 5,000 every three months, subject to agreed terms | Confirmed |
| D-10 | The initial target is 15–20 working days | Planning estimate |

## Working assumptions to validate

- English and Swahili are desired languages.
- Website sections include Home, About, Services, Fleet, Service Areas/Routes, Request a Quote, and Contact.
- Quote enquiries will be notified by email.
- The client wants call and WhatsApp contact links.
- A lightweight managed hosting solution is preferred.
- No account system, dispatch system, or custom dashboard is needed for the initial release.

These assumptions must not be treated as client-confirmed if not explicitly approved.

## Open questions for founder/client

1. What exact local parent folder should contain the new project? - answered
2. What is the client's official domain, and is it already registered? - ask before launch
3. Who owns the domain, hosting, email, and deployment accounts? - client
4. What verified business phone/WhatsApp number and public email should appear? - 0745822788/0783330889
5. Which email address(es) should receive enquiries? - kimsandcargos1@gmail.com
6. Does the client have an approved logo, colours, photos, and existing brand guide? - no, were supposed to do that for the client and I need serious help here.
7. Who will supply and approve Swahili translations? - i will
8. Are the proposed areas/routes current and operationally accurate? - yes
9. What exact vehicle specs are verified and approved for publication? -  Fleet & Vehicle Specifications
* Vehicle Fleet:Primary vehicle is Isuzu FRR 33 Commercial Cargo Lorry.
* Payload Capacity: 8 – 10 Tons (11,000 KG Gross Vehicle Weight)
* Body Configurations:
* Dropside Body with Canopy: High wooden/steel dropsides with heavy-duty tarpaulin protection for construction materials, timber, hardware, and agricultural freight.
10. What are business operating hours and the earliest acceptable enquiry date/time? - Monday to Saturday: 6AM to 7PM (Dispatch & Loading)>>>>>Sunday:On-Request/Priority Corporate Bookings
11. Should the customer acknowledgement be on-screen only, or also via email? - let's do screen only at the moment but we will add email confirmation later
12. Is persistent enquiry storage required, or is email notification sufficient? - yes
13. Is analytics wanted? If yes, which provider and privacy/consent approach? - yes, recommend
14. Has the client approved the payment milestones and scope exclusions in writing? - yes 

## Decision log — Gate 0 (recorded 26 October 2026, decision owner: founder)

| ID | Decision | Effect on scope / risk |
|---|---|---|
| D-11 | Project folder is `C:\Users\ndira\PROJECTS\KIMS CARGO`. | None. |
| D-12 | Architecture **Option B** approved: website calls a Supabase Edge Function (`submit-quote`), which checks the data, saves the enquiry and sends the notification. The browser never writes to the database; the enquiry table has row-level security (RLS) on with no public access. | Adds a database (personal data storage); justified by D-17. |
| D-13 | Frontend: React + TypeScript + Tailwind, built with **Vite**, with pages pre-built per language (`/en`, `/sw`). | None. |
| D-14 | Backend and database: **Supabase** (Postgres + Edge Functions). | None. |
| D-15 | Hosting: **Vercel Hobby (free)**. | **Accepted risk:** Vercel's Hobby terms restrict it to non-commercial use (to re-verify); the site could be suspended. Fallback: Cloudflare Pages / Netlify free, or Vercel Pro (paid). |
| D-16 | Email: **Gmail SMTP**, sent from and to the client's Gmail `kimsandcargos1@gmail.com`. | Needs a Gmail App Password (requires 2-Step Verification on the sending account). Supabase Edge Functions are understood to block SMTP ports 25/587, so use port **465** (to re-verify). Gmail daily sending limits apply (to verify). |
| D-17 | Enquiries are stored permanently in the database and **deleted only at the owner's request**. | **Privacy:** the privacy notice must say this; Kenya Data Protection Act 2019 retention principles to be confirmed by the client. Need a documented process for deleting on request. |
| D-18 | Customer confirmation: **on-screen only** for now. | Customer email optional/not required. Email confirmation is a **future change request**, not in this build. |
| D-19 | WhatsApp: a **pre-filled `wa.me` link** on the success screen opens a ready-written enquiry message to the owner's WhatsApp. The customer taps Send; it is not automated. | In scope; free. No WhatsApp API automation (still excluded). |
| D-20 | Spam protection: **Cloudflare Turnstile** + hidden spam-trap field + per-IP rate limit (IP stored hashed) + field size limits + duplicate blocking. | Free Cloudflare account needed (whose? — open). |
| D-21 | All suggested mitigations from the Phase 0 report are approved (see Phase 0 §7). | See D-22, D-23. |
| D-22 | All services use **free plans only**. | Supabase free projects pause after inactivity (to verify), so a **keep-alive** scheduled check is needed (e.g. daily Vercel cron — to verify on Hobby). |
| D-23 | Backup approach on free plan: every enquiry is also emailed (a second copy in Gmail), plus a documented periodic CSV export by the owner. | Supabase free plan backups are limited/absent (to verify). Together with D-17, data-loss risk is reduced but not eliminated. |
| D-24 | Supabase account is **owned by the founder (TECHBIGGIEY)** and can be transferred to the client on request after full payment. | Differs from Q3 ("client owns accounts") for Supabase only. Handover documentation must include the transfer steps. |
| D-25 | *Updated 26 Oct 2026:* the founder owns the Vercel, Cloudflare (Turnstile) and Supabase accounts. The Gmail account is the client's. Domain ownership is decided before launch. | Replaces Q3 for these accounts. Handover must document how to transfer them. |
| D-26 | Public contact numbers: 0745822788 and 0783330889. **Both** take calls, SMS and WhatsApp. Enquiry email: `kimsandcargos1@gmail.com`. | WhatsApp link (D-19) goes to one number — use 0745822788 (+254745822788) unless told otherwise. |
| D-27 | Fleet: **Isuzu FRR 33** dropside with canopy (main vehicle) and **Mitsubishi Fuso FH** enclosed box body. | Fuso specs not supplied; publish body type only until verified. |
| D-28 | Service areas/routes in `PROJECT_BRIEF.md` §6 are confirmed as current. | Can be published. |
| D-29 | Swahili translations supplied and approved by the founder. | None. |
| D-30 | Operating hours: Mon–Sat 6 AM–7 PM (dispatch and loading); Sunday on request / priority corporate bookings. | Calendar rules — see proposed D-31. |
| D-31 | **Approved 26 Oct 2026:** earliest date is tomorrow; latest is +90 days; time windows 6–9, 9–12, 12–3, 3–7 (Nairobi time); Sunday can be chosen but labelled "on request — subject to confirmation". | None. |
| D-32 | Analytics: **approved 26 Oct 2026** — **Vercel Web Analytics** (free on Hobby — to verify; no cookies, so no consent banner expected). Alternative: Cloudflare Web Analytics. | None. |
| D-33 | Client approved payment milestones and scope exclusions in writing (Q14). | None. |

## Issues still open

1. **Payload figure is inconsistent.** "8–10 tons payload" cannot fit within an 11,000 kg gross vehicle weight, because the empty lorry's own weight is part of the GVW. The client must correct this before it is published.
2. **Branding/logo.** Q6 says TECHBIGGIEY should create the branding, but `REQUIREMENTS.md` §3 excludes logo/brand identity work. Either a change approval (cost/time impact) or a lightweight in-scope design direction (colour palette, typography, text-based wordmark) is needed.
3. Gmail App Password for `kimsandcargos1@gmail.com` (needs 2-Step Verification on that account) — needed before Phase 3 email testing.
4. Domain — ask before launch (Q2).

Resolved 26 Oct 2026: WhatsApp/call numbers (D-26), sending Gmail (D-16), account ownership (D-25), calendar rules (D-31), analytics (D-32). **Phase 1 approved by the founder on 26 Oct 2026.**

## Required handling

Record each answer with date, decision owner, and effect on scope. If an answer changes cost, timeline, data handling, or architecture, obtain explicit approval before implementation.
