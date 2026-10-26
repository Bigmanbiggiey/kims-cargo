# Kims Cargo & Logistics — Website

Corporate website with a quote enquiry form and preferred date/time request, built by TECHBIGGIEY (project ref TBG-KCLC-001).

Scope, decisions and approval gates live in [`docs/`](docs/) — read [`CLAUDE.md`](CLAUDE.md) and [`docs/DECISIONS_AND_ASSUMPTIONS.md`](docs/DECISIONS_AND_ASSUMPTIONS.md) first.

## Stack (approved Option B, see D-12 to D-14)

| Part | Technology |
|---|---|
| Frontend | React 19 + TypeScript + Tailwind CSS 4, built with Vite |
| Hosting | Vercel (Hobby) |
| Backend | Supabase Edge Function `submit-quote` (added in Phase 3) |
| Database | Supabase Postgres, row-level security on, no public table access |
| Email | Gmail SMTP (port 465) from the client's Gmail |
| Spam protection | Cloudflare Turnstile + spam-trap field + hashed-IP rate limit |
| Analytics | Vercel Web Analytics (cookieless) |

## Prerequisites

- Node.js 24+ and npm 11+
- Docker Desktop (running) — only for the local Supabase stack
- The Supabase CLI is a dev dependency; run it with `npm run supabase -- <command>` (no global install).

## Local development

```bash
npm install
cp .env.example .env.local                                  # frontend public config
cp supabase/functions/.env.example supabase/functions/.env  # server secrets (never commit)

npm run supabase -- start      # local Supabase in Docker; prints the local URL and anon key
npm run dev                    # http://localhost:5173
```

Put the local anon key printed by `supabase start` (or `npm run supabase -- status`) into `.env.local`. Local Supabase Studio is at http://127.0.0.1:54323. Stop the stack with `npm run supabase -- stop`.

### Quote form locally (Phase 3)

```bash
npm run supabase -- migration up --local     # creates quote_requests (safe on an existing local DB)
npm run supabase -- functions serve --env-file supabase/functions/.env
```

- Without a Gmail App Password, send email to the local test inbox (http://127.0.0.1:54324) using the commented "Local testing" block in `supabase/functions/.env.example`. Inside Docker, nodemailer could not resolve the inbox's container name (`EDNS`), so use its IP: `docker inspect supabase_inbucket_kims-cargo --format '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}'`.
- `ALLOWED_ORIGINS` must list the exact dev-server address (for example `http://localhost:5173`), or the function refuses the request.
- The Turnstile test keys in the example files always pass. Production needs real keys from the Cloudflare dashboard.
- `npm run e2e:quote` runs the server-side checks (validation, spam controls, rate limit, duplicates, email) against the local stack. See the header of `scripts/e2e-quote.mjs`.
- Enquiries are in the `quote_requests` table (Studio → Table Editor). The request number is the row `id`.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Dev server |
| `npm run lint` | oxlint |
| `npm run typecheck` | TypeScript project build check |
| `npm run test` | Vitest (jsdom + Testing Library) |
| `npm run build` | Typecheck + production build to `dist/` |
| `npm run check` | All of the above, in order — run before every commit |
| `npm run e2e:quote` | End-to-end checks of `submit-quote` against the local Supabase stack |

## Environment variables and secrets

- `VITE_*` variables are **public**: they are bundled into the website. Only the Supabase URL, the Supabase anon key and the Turnstile **site** key belong there.
- Server secrets (Gmail App Password, Turnstile **secret**, IP hash salt) live only in Supabase Edge Function secrets — see `supabase/functions/.env.example`. The service-role key is injected by Supabase and must never appear in frontend code.
- `.env`, `.env.local` and `supabase/functions/.env` are git-ignored. Only the `.example` files are committed, with placeholder values.

## Deployment (not yet performed — needs approval in Phase 4)

**Supabase (founder-owned account, transferable to the client after full payment — D-24):**
1. Create the project in the Supabase dashboard; disable public sign-ups (Authentication settings).
2. `npm run supabase -- link --project-ref <ref>`
3. `npm run supabase -- db push` (migrations), `npm run supabase -- functions deploy submit-quote`
4. `npm run supabase -- secrets set --env-file <path-to-production-secrets>`, with `ALLOWED_ORIGINS` set to the production and preview site addresses

**Vercel (founder-owned, Hobby plan — see accepted risk D-15):**
1. Import the git repository; framework preset **Vite**, build `npm run build`, output `dist`.
2. Set `VITE_SUPABASE_URL` and `VITE_TURNSTILE_SITE_KEY` for Production and Preview. (`VITE_SUPABASE_ANON_KEY` is not used by the quote form: `submit-quote` has `verify_jwt = false`.)
3. Enable Web Analytics.

**Free-plan operations (D-22, D-23):** a daily keep-alive stops the free Supabase project from pausing, and the owner should export enquiries to CSV periodically as a backup. Both are set up and documented in later phases.

## Project status

Phase 3 (quote form and preferred-date/time calendar) built on branch `phase-3-quote`, awaiting Gate 3. See `docs/ROADMAP_AND_GATES.md` and `docs/evidence/`.
