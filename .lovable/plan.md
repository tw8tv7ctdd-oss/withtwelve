WithTwelve — Homepage footer lightening pass

## Goal
Make the homepage footer feel transparent, subtle, and integrated into the page — not like a boxed card. Keep it centered, keep the links and wording unchanged, and do not touch any other page or the homepage header.

## Current state
`src/components/HomeFooter.tsx` wraps the footer in a rounded, white card (`rounded-2xl bg-surface p-6 shadow-sm`) with a top border and a grid of pill-shaped link buttons. The card treatment dominates the bottom of the page and feels heavy.

## Plan
1. Strip the card treatment from `HomeFooter`:
   - Remove `rounded-2xl`, `bg-surface`, `shadow-sm`, and `p-6`.
   - Remove the heavy top border (`border-t border-border pt-8`) and rely on generous spacing to separate the footer from the main content.
2. Simplify the link list:
   - Replace the `grid` layout with a centered, wrapping flex or inline list.
   - Remove `rounded-2xl` hover backgrounds and `min-h-10` button sizing.
   - Keep links as plain text with a subtle hover color change only.
   - Ensure each wrapped line remains centered (`justify-center`, `text-center`, `flex-wrap`).
3. Tone down the typography:
   - Keep the wordmark small and quiet (`text-[11px] uppercase tracking-widest text-muted-foreground/80`).
   - Keep the supporting line and copyright in `text-xs` or `text-[11px]` with reduced opacity (`text-muted-foreground/60`).
4. Preserve the prop contract:
   - `HomeFooter` still receives `isAuthenticated` and still renders the correct "Open WithTwelve" / "Sign in" link.
   - Do not change the link labels or destinations.
5. Verify on the homepage:
   - The footer no longer looks like a card.
   - It sits flush against the page background (`bg-background`).
   - It feels calm, quiet, and centered.

## Files to change
- `src/components/HomeFooter.tsx` (only file)

## What will be removed
- White filled background (`bg-surface`).
- Rounded container (`rounded-2xl`).
- Shadow (`shadow-sm`).
- Top border line.
- Pill-shaped link hover backgrounds.
- Grid-based link layout.

## What will be adjusted
- Outer spacing will be increased (top padding) to compensate for the loss of the border.
- Link list will become a centered, wrapping inline list with simple text styling.
- Wordmark and copyright will be made slightly more muted.
