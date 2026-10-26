# Architecture Proposal — Not Yet Approved

## Status

**Update 26 October 2026:** the founder approved Option B (React + TypeScript + Tailwind with Vite, hosted on Vercel; Supabase Edge Function + Postgres; Gmail SMTP; Turnstile). See decisions D-11 to D-33 in `DECISIONS_AND_ASSUMPTIONS.md`. The original proposal text below is kept for the record.

This is a proposal for discussion, not an instruction to install dependencies or implement. Claude Code must inspect available tooling and report evidence before recommending a final stack.

## 1. Architecture goals

- Keep operating costs low and predictable.
- Deliver a fast, responsive marketing website.
- Implement a safe and reliable quote enquiry path.
- Avoid building a custom backend unless the chosen form/notification needs justify it.
- Make ownership and handover straightforward for the client.
- Avoid vendor lock-in where practical.

## 2. Candidate approach

A static or server-rendered frontend deployed on a low-cost managed platform, with a small server-side form endpoint or a reputable form service for validated submissions and email notifications. Use a date/time input or accessible calendar component for preferred-time requests.

This is intentionally stack-neutral. The final choice depends on:
- Developer tooling available on the actual machine.
- Hosting/domain access and account ownership.
- Email delivery and notification needs.
- Form abuse protection and data retention.
- Client's recurring-cost tolerance.
- Accessibility, maintainability, and time budget.

## 3. Decisions required before implementation

1. Frontend framework and build tool.
2. Hosting and deployment target.
3. Whether form submissions use a minimal serverless endpoint or an external form service.
4. Email delivery provider, sender-domain setup, recipient, and delivery failure handling.
5. Whether submissions need persistent storage. Do not add a database unless a clear requirement exists.
6. Calendar implementation and minimum/maximum date rules.
7. Map implementation: lightweight link/static route content versus third-party embedded map.
8. Analytics and consent/privacy approach.
9. Domain and account ownership/access.
10. Git repository/remote policy.

## 4. Data flow proposal

1. Visitor fills in quote form and preferred date/time.
2. Browser validates fields for usability.
3. Submission is sent over HTTPS to the approved endpoint/provider.
4. Endpoint/provider validates again, applies proportionate spam controls, and sends an email notification or records the submission according to the approved design.
5. User sees a clear success or failure message.
6. Customer acknowledgement is shown or sent only if the submission succeeds.

Do not claim delivery merely because the browser received an HTTP response. The final implementation should make the outcome clear and log operational failures without exposing sensitive enquiry details.

## 5. Security considerations

- Server-side validation for any server-received data.
- Rate limiting or other proportionate anti-abuse controls.
- Secret management via environment variables.
- No secret values in source control, browser bundles, screenshots, or logs.
- Safe output encoding and no rendering of untrusted HTML.
- HTTPS for deployed submission paths.
- Minimal collection and retention of personal data.
- Clear handling of provider outage, duplicate submissions, and invalid requests.
- Access controls and client-owned accounts for domain/hosting/email.
- No database or admin dashboard unless explicitly approved.

## 6. Cost guardrail

Before recommending a provider, list any free-tier limits, likely recurring costs, email/domain prerequisites, and failure modes. Third-party recurring costs are not assumed to be covered by the KES 50,000 build fee.
