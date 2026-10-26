# Requirements and Scope Baseline

Status: planning baseline; confirm unresolved items before implementation.

## 1. In-scope functional requirements

### FR-01 — Company information
Display company overview, services, contact details, and clear calls to action.

### FR-02 — Service catalogue
Describe, at minimum, closed-box commercial distribution, construction/industrial haulage, agricultural logistics, and general/on-demand or contract haulage, subject to client confirmation.

### FR-03 — Fleet
Present the Mitsubishi Fuso FH closed-box lorry and Isuzu FRR 33 dropside lorry with canopy. Use client-approved photos and verified specifications only.

### FR-04 — Service areas/routes
Present approved service areas and routes using a map or clear equivalent. A map embed must not be allowed to compromise mobile performance or block core content.

### FR-05 — Quote enquiry
Collect the following, with required/optional status to be finalized in design:
- Customer or business name.
- Phone number and optionally email.
- Pickup location and destination/drop-off.
- Cargo category and description.
- Estimated weight and, where relevant, dimensions/volume/number of items.
- Preferred date and time or time window.
- Handling notes and additional instructions.

### FR-06 — Calendar/date-time preference
Allow a user to select a preferred date and time/time window and include that selection in the quote enquiry. Block invalid/past dates where appropriate and display the selected value clearly before submission.

This is a **request only**. It does not represent live fleet availability or confirm a booking.

### FR-07 — Validation and abuse mitigation
Provide understandable client-side validation and server-side validation wherever data reaches a server endpoint. Include proportionate spam mitigation/rate limiting based on platform capabilities.

### FR-08 — Notifications and acknowledgement
Notify the agreed business recipient of a successful enquiry and provide the customer with a submission acknowledgement where supported. Do not expose credentials or submission contents publicly. Exact provider, delivery guarantees, and fallback behaviour require architecture approval.

### FR-09 — Contact actions
Include click-to-call and WhatsApp links only after the client supplies and verifies the numbers. Do not invent phone numbers.

### FR-10 — Language
Support English and Swahili content structure. Client must approve translations and terminology before publication; do not machine-translate high-impact business/legal claims without review.

## 2. Non-functional requirements

- Mobile-first responsive layout.
- Good performance on typical mobile connections; optimize images and avoid unnecessary scripts.
- Semantic HTML, keyboard usability, visible focus states, accessible labels and error messages, and appropriate contrast.
- Basic technical SEO: meaningful page titles/descriptions, indexability where intended, sitemap/robots configuration as appropriate, and social preview metadata.
- Privacy-conscious analytics only if approved and correctly configured.
- Secure handling of environment variables and form data.
- Graceful handling of network/service failures.
- Maintainable code and documented setup/deployment.
- Cross-browser smoke checks on current mainstream browsers where feasible.

## 3. Explicit exclusions unless separately approved

- Live GPS tracking.
- Staff/admin dashboard.
- Customer accounts or driver portals.
- Fleet, driver, or dispatch management.
- Real-time vehicle availability or booking conflict controls.
- Automatic quote pricing.
- M-Pesa checkout or payment processing.
- SMS or WhatsApp Business API automation.
- Guaranteed availability or automatic booking confirmation.
- Photography, logo/brand identity work, professional translation, paid third-party subscriptions, domain and hosting fees unless agreed separately.

## 4. Client dependencies

Before launch, client should provide/approve:
- Official company name and preferred logo/brand assets.
- Correct phone, WhatsApp, email, and physical/business address if published.
- Service descriptions, coverage areas, route claims, operating hours.
- Fleet photos and verified specifications.
- English and Swahili copy/translation approval.
- Quote enquiry notification recipient(s).
- Domain/hosting ownership and access.
- Privacy notice and data retention decisions.
- Confirmation of any insurance, licensing, safety, or compliance claims.

## 5. Change control

Any request that adds a major feature, third-party recurring fee, or significant work beyond this baseline must be documented with impact on price, schedule, security, and support. Do not implement it until the founder approves the change.
