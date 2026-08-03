# Update homepage wordmark color to secondary

## Goal
Change the homepage "WithTwelve" eyebrow/wordmark from `text-accent` to `text-secondary`, keeping the uppercase styling.

## Current state
- `src/routes/index.tsx` line 35: `<p className="text-[11px] font-medium uppercase tracking-[0.18em] text-accent">WithTwelve</p>`
- `text-accent` renders as `#c9a96e` (gold/tan).
- `text-secondary` renders as `#c9a96e` in light mode and a warm tone in dark mode (the app's secondary token).

## Plan
1. Update the className in `src/routes/index.tsx` to replace `text-accent` with `text-secondary`, preserving `uppercase`.
2. Verify the rendered wordmark color in the preview.

## Files expected to change
- `src/routes/index.tsx`

## Notes
- No other pages or components affected.
- No backend or route changes.
