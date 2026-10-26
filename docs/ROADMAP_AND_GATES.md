# Roadmap and Approval Gates

## Phase 0 — Discovery and workspace verification

**Purpose:** Confirm environment and provide a grounded architecture recommendation without implementing features.

Tasks:
- Confirm exact target path and parent directory.
- Inspect OS, runtimes, package managers, Git, available editor/CLI, and deployment constraints.
- Check whether target path exists; if it exists, stop and report.
- Do not install packages or alter unrelated files.
- Review this pack and report contradictions/open decisions.
- Recommend architecture options, recurring costs, risks, and dependencies.

**Deliverables:** Phase 0 report and proposed ADRs/architecture revision.

**Gate 0:** Founder + ChatGPT review findings and explicitly approve architecture and implementation phase. No automatic progression.

## Phase 1 — Project scaffold and quality baseline

Only after Gate 0 approval:
- Create minimal approved scaffold.
- Add project scripts, lint/type checks/tests appropriate to stack.
- Add environment variable example and secret-safe ignore rules.
- Document local development and deployment.
- Verify a clean build.
- Report exact files/commands/results.

**Gate 1:** Approve scaffold and design direction before full implementation.

## Phase 2 — Design system and public pages

- Implement responsive shell, navigation, footer, typography, and reusable sections.
- Implement company, service, fleet, coverage, and contact content.
- Use approved assets and verified claims only.
- Add English/Swahili structure as approved.
- Check accessibility and mobile layouts.

**Gate 2:** Review working preview and content before form integration.

## Phase 3 — Quote form and preferred-date/time calendar

- Implement agreed form fields and accessible date/time selection.
- Validate user input and provide helpful error messages.
- Add approved server-side validation and anti-abuse controls.
- Add email notification and customer acknowledgement as approved.
- Test valid, invalid, duplicate, past-date, failure, and abuse scenarios.
- Ensure the UI never promises live availability or confirms a booking automatically.

**Gate 3:** Review test evidence and end-to-end submission behaviour.

## Phase 4 — SEO, hardening, QA, and launch

- Add technical SEO and social metadata.
- Optimize images and third-party embeds.
- Test mobile and desktop, keyboard navigation, form errors, links, and failure states.
- Confirm privacy notice and approved public claims.
- Deploy only with explicit approval and authorized credentials.
- Verify production URL, form workflow, domain/HTTPS, and client access.
- Deliver handover notes and known limitations.

**Gate 4:** Founder approves launch and handover.

## Timeline

Initial estimate: 15–20 working days. The schedule begins in earnest once required client content/access and Gate 0 approval are available. Waiting for content, translations, credentials, or client decisions may extend delivery.

## Stop conditions

Stop and ask for approval if:
- Target directory exists or contains unexpected files.
- A new recurring fee is required.
- Requirements exceed the KES 50,000 scope.
- A proposed service requires secrets/credentials not yet approved.
- A security/privacy issue or material architecture trade-off is discovered.
- A phase's acceptance criteria fail.
