# WithTwelve — Frontend Build Plan (understanding summary first)

## Goal
Replace the placeholder homepage with a clean, modern landing page for the WithTwelve web app that establishes brand identity and can grow into the full product.

## Proposed first milestone
Build a frontend-only landing page at `/` that includes:

- A hero section with the WithTwelve name and a short tagline
- A concise value proposition (2–3 sentences)
- A primary call-to-action button
- A minimal features/benefits section (3 cards)
- A simple footer

## Design direction
- Tailwind v4 with the existing design tokens
- Light, professional aesthetic with subtle accent color
- Centered, readable layout
- Responsive across desktop and mobile

## Technical approach
- Update `src/routes/index.tsx` to replace the placeholder
- Add a `head()` with unique title, description, and Open Graph tags
- Keep the existing `src/routes/__root.tsx` layout intact
- No new dependencies needed
- No backend or auth for this first step

## Next steps after approval
1. Write the landing page component
2. Verify the build and preview render correctly
3. Hand back to you to define the next feature (auth, dashboard, etc.)

## Open question
The name WithTwelve could mean many things (group of 12, 12-week program, 12-item toolkit, etc.). This plan keeps the first screen generic enough to adapt once you clarify the core product.
