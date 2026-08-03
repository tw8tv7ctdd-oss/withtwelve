# Fix: Rename "Safety & safeguarding" to "Safeguarding"

The previous change did not persist. This plan updates both occurrences of the old label to "Safeguarding".

## Changes

1. **src/routes/safety.tsx**
   - Change the `InfoPage` `title` prop from `"Safety & safeguarding"` to `"Safeguarding"`.
   - Keep the `<title>` tag and description unchanged (still "Safety — WithTwelve" for SEO).

2. **src/lib/nav.ts**
   - Change the secondary link `label` from `"Safety & safeguarding"` to `"Safeguarding"`.

## Verification

- Search for any remaining `"Safety & safeguarding"` strings in `src/` after editing.
- Confirm the page heading and burger menu both read "Safeguarding".
