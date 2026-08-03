# Visual QA & consistency pass

A small polish pass only. No redesign, no routing/auth/backend/content changes, no new UI patterns. Navigation stays exactly as it is (shared header + burger, no footer, bottom nav on authenticated screens only, items Chat/History/Account).

## What the review found

Reading every page and the shared components, the app is already close. The inconsistencies are these:

1. **Column alignment between header and page.** The header's inner container is fixed at `max-w-md`, but the public informational pages use a wider `max-w-lg` column. On desktop the burger icon sits inset from the left edge of the body text, so the header looks off-grid on About/Pricing/Privacy/Terms/Safety/Contact.
2. **Landing page is visually heavier than everything else.** Its hero uses a 30px title inside a `p-8` surface, while every other screen uses the shared 22px heading in a `p-6` surface. Its eyebrow and scripture note use the gold `secondary` token where the rest of the app uses the muted/accent tokens.
3. **Button radii drift.** Home's two large actions are `rounded-3xl`; the landing CTA, Account sign-out and History empty-state CTA are `rounded-2xl`.
4. **Button text sizes drift.** Home's actions are 16px, the landing primary CTA is 14px.
5. **Heading spacing drift.** Home hand-rolls its greeting header with the subtitle at `mt-1.5`, while the shared `ScreenHeading` used by History, Account and Chat uses `mt-2`.
6. **One-off surface copies.** The landing feature rows and the Contact "Email us" block re-declare surface styling inline instead of using the shared tokens, so their padding, radius and shadow drift slightly from every other card.
7. **Landing shell duplication.** `AppShell` already sets `min-h-dvh`; the landing passes it again.

## What will be adjusted

- **SiteHeader**: accept an optional container width so it matches the page column beneath it (`max-w-md` on app and landing screens, `max-w-lg` on informational pages). Burger, wordmark and body text then share one left edge and one centre line.
- **Landing (`/`)**: hero title down to the shared display size and the surface back to the standard `p-6`; eyebrow switched to the shared eyebrow token; scripture attribution to the accent token; primary CTA to 16px and the same radius as other primary actions; drop the duplicated `min-h-dvh`. Copy and layout unchanged.
- **Home**: greeting header adopts the shared heading rhythm (subtitle `mt-2`); the two action buttons move to the app-standard radius.
- **Account / History**: sign-out button and empty-state CTA aligned to the same radius, height and text size as other primary/secondary buttons.
- **Feature rows and Contact block**: reuse the shared surface and eyebrow tokens so padding, radius and shadow match the rest of the app. The Contact block stays raised and keeps its icon.
- **Closing footnotes**: the quiet one-line notes on Home, History and Account settle on the same `mt-8`, centred, 12px muted treatment.

Everything else — the public page type scale (21px serif title, 15px body, relaxed line-height), the flat single-column informational layout, colour tokens, bottom nav, and all copy — stays exactly as it is.

## Technical notes

- Files touched: `src/components/SiteHeader.tsx`, `src/components/InfoPage.tsx`, `src/components/AppShell.tsx` (heading spacing only), `src/routes/index.tsx`, `src/routes/_authenticated.home.tsx`, `src/routes/_authenticated.account.tsx`, `src/routes/_authenticated.history.tsx`, `src/routes/contact.tsx`.
- Class-level edits only: no new components, no new tokens in `src/styles.css`, no changes to data fetching, hooks, or route definitions.
- Verification: typecheck, then screenshot the public and authenticated screens at mobile and desktop widths to confirm alignment and rhythm.