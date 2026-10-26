# Phase 3 checks: evidence for Gate 3

Date: 26 Oct 2026. Branch `phase-3-quote`, built on `phase-2-pages`. Implementation calls C-1 to C-11 are in `docs/DECISIONS_AND_ASSUMPTIONS.md`.

## What was built

- **Quote form** (`src/pages/QuotePage.tsx`), with three sections: about you, the load, and when.
  - The calendar allows tomorrow up to 90 days ahead, plus four time-window buttons.
  - A chosen Sunday shows "on request".
  - The chosen day and time are shown back to the customer before sending.
  - The preference wording sits right above the button.
- **Home page:** "Preferred day" is now a date picker, and it pre-fills the form.
- **Shared rules** (`supabase/functions/_shared/quoteRules.ts`): the browser and the server run the same validation.
- **Edge Function** `submit-quote`:
  - `handler.ts` holds the logic and is tested in Node;
  - `index.ts` connects Supabase, Cloudflare Turnstile and SMTP;
  - `email.ts` builds the plain-text notification.
- **Migration** `supabase/migrations/20261026120000_quote_requests.sql`:
  - the `quote_requests` table, with RLS on and no grants to `anon` or `authenticated`;
  - `submit_quote()`, callable by the service role only, which does the duplicate check, rate limit and insert in one transaction.

## Automated (`npm run check`)

| Check | Result |
|---|---|
| Lint (oxlint) | Pass |
| Type check (`tsc -b`, now including the function code apart from `index.ts`) | Pass |
| Tests (Vitest) | **150 passed / 150**, 19 files (Phase 2 had 90) |
| Production build | Pass |

New tests:
- **Rules** (24 tests):
  - Nairobi-time "today" and the date range;
  - Kenyan phone formats;
  - text cleaning;
  - every field rule;
  - Sundays.
- **Handler** (19 tests):
  - a valid save, with only the hashed IP stored;
  - invalid fields;
  - a missing or failed Turnstile check, and Turnstile being unavailable;
  - the honeypot;
  - the rate limit and duplicates;
  - an email failure, which saves but reports `notified: false`;
  - a database failure, which never reports success;
  - other origins, CORS preflight, wrong method, bad JSON and oversized bodies;
  - **the logs never contain customer data**;
  - the plain-text email, and the Turnstile call.
- **Quote page** (20 tests):
  - pre-fill from the home page;
  - calendar limits and the four windows;
  - the error summary, field errors and their accessible descriptions;
  - the Sunday note and the read-back of the chosen day;
  - success, with the request number shown **only after** the server confirms;
  - five failure types, none of which shows "Received";
  - server field errors;
  - double-click protection;
  - the honeypot;
  - starting another request.
- **Accessibility:** the axe sweep still passes on `/en/quote`, now with the real form.
- **Bundle:** a scan of `dist/assets/*.js` for secret names and the test secret found nothing.

## End-to-end against the local Supabase stack (`npm run e2e:quote`)

Real Edge Function (Supabase edge runtime 1.77.8, Deno 2.1.4), real Postgres and the Mailpit test inbox. All **12 / 12 PASS**:

- a valid request is saved and gets a request number;
- the email is delivered to the test inbox;
- a duplicate gets the same number, with no second row and no second email;
- today, or a date in the past, is rejected by the server;
- an invalid phone or load type is rejected by the server;
- the honeypot is rejected;
- a missing Turnstile token is rejected;
- another website (origin) is refused;
- malformed JSON is rejected;
- an oversized body is rejected;
- the sixth request in an hour from one IP gets a 429;
- a spoofed `X-Forwarded-For` doesn't get round the limit.

Also checked directly:
- **Email:** plain text only (no HTML part). Typed `<script>` arrived as inert text. The subject is the request number and route. Recipient: kimsandcargos1@gmail.com (caught by the local inbox, not sent).
- **Database:**
  - RLS is on.
  - `anon` cannot select and `authenticated` cannot insert.
  - `anon` cannot run `submit_quote`, but `service_role` can.
  - The stored `ip_hash` is 64 hex characters and `email_status = sent`.
- **Logs** show only lines like `saved request 0007; email sent`.

## Browser (Chrome, dev server, Turnstile test key)

- The full form was filled in and submitted through the real Turnstile widget, the function and the database.
- The success screen showed "Received" and focus moved to the "Thank you" heading.
- **Sideways scrolling** on `/en/quote`, `/sw/quote` and `/en` at 360, 768 and 1280 px: none.
  - The first run found the tilted carbon copies overflowing at 360 and 768 px.
  - Fixed with `overflow-x-clip`, and a test was added.
- The time-window buttons show a solid focus ring of about 3 px.

## Not verified here (blocked or deferred)

- **Real Gmail delivery (Acceptance C, "demonstrated by a real test"):** blocked until the Gmail App Password exists (Issues still open #3). Only the local test inbox was used. Gmail sending from Supabase on port 465 (D-16) is also unproven.
- **Production Turnstile:** needs real site and secret keys from the founder's Cloudflare account.
- **Production IP header:** which header Supabase's gateway sets (C-10) is still to confirm.
- **Screenshots:** the browser screenshot call timed out again (as in Phase 2), so there is no visual capture. Please look on a real phone.
- **Swahili:** form text falls back to English until translations are supplied (D-29). The date read-back follows the page language.
- **Privacy notice page:** still missing (Issues still open #5).
- **Keep-alive cron and CSV export (D-22, D-23):** Phase 4.
