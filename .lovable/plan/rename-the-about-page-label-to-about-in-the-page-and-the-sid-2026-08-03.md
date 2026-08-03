Rename the About page label to "About" in the page and the side menu.

Current state
- `src/routes/about.tsx` displays the title "About WithTwelve" in both the page `<InfoPage title="..." />` and the route head metadata.
- `src/lib/nav.ts` defines `secondaryLinks`, which includes the side-menu label `{ label: "About WithTwelve", to: "/about" }`.

Changes to make
1. `src/routes/about.tsx`
   - Change `const title = "About WithTwelve"` to `const title = "About"`.
   - Change `<InfoPage title="About WithTwelve" ... />` to `<InfoPage title="About" ... />`.
2. `src/lib/nav.ts`
   - Change the secondary link label from `"About WithTwelve"` to `"About"`.

Invariants
- Keep the route path `/about` unchanged.
- Keep the page description and body content unchanged.
- Do not touch other secondary links or the menu structure.

Acceptance
- The page heading and browser tab title read "About".
- The side menu shows "About" instead of "About WithTwelve".
