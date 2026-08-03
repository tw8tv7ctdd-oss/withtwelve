# Fix: Homepage "WithTwelve" eyebrow color should match icon accent

## Current state
- `src/routes/index.tsx` line 35 applies `text-accent` to the eyebrow label in addition to `eyebrowClass`.
- `eyebrowClass` is defined in `src/components/common/Surface.tsx` as `text-muted-foreground`.
- The user reports the color has not visibly changed, likely because the two `text-*` utilities conflict and source-order/CSS precedence is letting `text-muted-foreground` win.

## Goal
Make the homepage "WithTwelve" wordmark render in the same accent color (`#c9a96e`) as the Lucide icons below it, without changing the eyebrow style on other pages.

## Plan
1. Inspect the rendered element in the browser to confirm which utility class is winning and why.
2. Update the homepage eyebrow markup so the accent color takes precedence, e.g. by avoiding the conflicting `text-muted-foreground` in the same element (use a dedicated class string or an explicit override) rather than concatenating two `text-*` utilities.
3. Verify the change visually in the preview, ensuring other eyebrow uses (SiteHeader, Contact, etc.) remain unchanged.

## Files expected to change
- `src/routes/index.tsx` (the homepage eyebrow markup)
- Possibly `src/components/common/Surface.tsx` if a reusable accent-eyebrow variant is cleaner.

## Notes
- Keep all other pages unchanged.
- No backend or route changes.
