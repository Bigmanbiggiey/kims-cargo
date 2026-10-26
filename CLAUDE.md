# Claude Code Instructions — KIM'S & CARGO'S LOGISTICS COMPANY

## Team operating model

This is a three-person team:
1. **Founder/client decision-maker:** owns product decisions, budget, scope, credentials, and approvals.
2. **ChatGPT:** supports discovery, research, requirements, architecture, documentation, and review.
3. **Claude Code:** performs repository inspection, implementation, local verification, and evidence-based reporting from approved instructions.

The founder and ChatGPT do planning and make decisions in the ChatGPT conversation. Claude Code executes approved tasks; it must not silently make material product, budget, architecture, or scope decisions.

## Project facts

- Client: KIM'S & CARGO'S LOGISTICS COMPANY
- Project reference: TBG-KCLC-001
- Delivery partner: TECHBIGGIEY
- Approved project price: KES 50,000
- Target delivery estimate: 15–20 working days, dependent on client feedback, assets, access, and approvals.
- Core scope includes the website, quote enquiry workflow, and preferred-date/time calendar.
- Quarterly maintenance, if contracted, is KES 5,000 every three months. It is not automatically included in the build price.
- The project is new. Inspect the actual workspace and available tooling before selecting a stack or creating implementation files.

## Required workflow

1. Read this file and all relevant files in `docs/` before acting.
2. Start with Phase 0 discovery only: inspect the environment, parent folder, available runtimes/tools, and repository state.
3. Do not overwrite, delete, or modify existing user data. If the target directory unexpectedly exists or contains files, stop and report before proceeding.
4. Report current facts separately from assumptions and recommendations.
5. Do not choose a framework, hosting provider, database, email service, or third-party integration without recording the rationale and unresolved costs/risks.
6. Do not start feature implementation or install dependencies during Phase 0 unless explicitly approved.
7. Produce the Phase 0 report requested in `prompts/CLAUDE_PHASE_0_PROMPT.md`.
8. Stop at the approval gate. Do not continue to Phase 1 until the founder explicitly approves the Phase 0 findings and architecture.
9. For every later phase, follow its scope, acceptance criteria, and verification requirements. Stop and report if a requirement conflicts with approved documents.
10. Never claim tests, deployment, email delivery, security, or production readiness without evidence.

## Scope protection

The KES 50,000 core scope must retain:
- Responsive corporate logistics website.
- Home, About, Services, Fleet, Service Areas/Routes, Request a Quote, and Contact content/pages or equivalent agreed page structure.
- English and Swahili content structure; client-supplied or client-approved translations are required before publication.
- Fleet presentation for the Mitsubishi Fuso FH closed-box lorry and Isuzu FRR 33 dropside lorry with canopy; specifications must be verified by the client before publication.
- Quote enquiry form including pickup/drop-off, cargo information, estimated weight/dimensions where applicable, and preferred date/time.
- Calendar/date-time selection as part of the enquiry workflow.
- Validation, appropriate spam mitigation, safe handling of form submissions, email notifications, and customer acknowledgement where technically feasible within the approved architecture.
- Mobile-first responsive design, basic SEO, accessibility/performance checks, testing, deployment support, and handover.

The calendar is a **preferred date/time request**, not live fleet availability, a dispatch scheduler, a conflict-free booking engine, or automatic booking confirmation.

Do not silently add: customer accounts, staff dashboard, vehicle/driver management, live GPS, automatic pricing, M-Pesa checkout, SMS/WhatsApp API automation, or operational scheduling. Raise these as separate options.

## Security and privacy

- Never hard-code API keys, SMTP credentials, tokens, passwords, or private client data.
- Use environment variables for secrets and provide an `.env.example` with placeholders only.
- Do not commit `.env` files, credentials, or personal data.
- Validate form input server-side if a server endpoint exists; client-side validation alone is insufficient.
- Use spam/rate limiting appropriate to the chosen platform, without promising perfect prevention.
- Avoid collecting unnecessary personal information. Explain the purpose of collected fields and recommend a privacy notice before launch.
- Protect against injection, abuse, unsafe redirects, and untrusted HTML where relevant.
- Do not expose private submissions in public logs or analytics.
- Confirm data retention, notification recipients, consent language, and applicable legal requirements with the founder/client.

## Reporting format

At the end of each authorized task, report:
- What changed (file paths).
- Decisions made and why.
- Commands/tests run and their actual results.
- Outstanding issues and risks.
- Any cost/credential/client dependency.
- Whether acceptance criteria pass, fail, or remain unverified.
- The exact approval needed next.

## Git

Use Git if available and approved. Never rewrite shared history, force-push, or commit secrets. Do not initialize or push to a remote repository without approval if that would create external side effects.
