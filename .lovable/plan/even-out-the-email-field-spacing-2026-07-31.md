# Even out the email field spacing

## Problem
The label, input, and helper text all sit in one `space-y-2` (8px) group, but the gaps
*look* uneven in the screenshot: the gap under the input reads larger than the gap under
the label. That is optical, not a bug in the value — the helper text uses
`leading-relaxed`, whose extra line-height (half-leading above the first line) adds
roughly 4-5px of visual space on top of the 8px margin.

## Change (src/routes/auth.tsx only)
- Keep the single `space-y-2` group for label, input, helper text.
- Change the helper paragraph from `leading-relaxed` to `leading-snug` so its half-leading
  no longer inflates the gap, and it stays readable when wrapping to two lines.
- Nudge the helper's own top offset so the measured gap matches the label-to-input gap
  (helper gets `mt-0.5` compensation only if the trimmed leading overshoots).

No changes to logic, tokens, or any other route.

## Verification
Measure the rendered gaps on `/auth` in the browser (label bottom to input top vs input
bottom to helper text cap height) and confirm they read as equal.
