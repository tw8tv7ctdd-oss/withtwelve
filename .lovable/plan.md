# Correct the email field spacing

## Confirmed issue
The rendered `/auth` form currently measures:

- Label to input: **3px**
- Input to helper text: **8px**

Although all three elements are inside `space-y-2`, the shared `Label` renders inline. Its inline line box and baseline prevent the first gap from visually measuring as the intended 8px.

## Change
- Update the email label in `src/routes/auth.tsx` with `className="block"`.
- Keep the existing `space-y-2` group and the helper text's `leading-snug` styling unchanged.
- Limit the change to this auth form rather than altering labels throughout the app.

## Verification
- Reload `/auth` and measure both rendered gaps again.
- Confirm label-to-input and input-to-helper are both 8px and look evenly spaced at the current viewport.