Micro-polish public informational pages typography

Goal
Slightly tighten and balance the six public informational pages (About, Pricing, Privacy, Terms, Safety, Contact) without changing layout, content, navigation, or the Contact callout.

Current state
All six pages share the same `InfoPage` component in `src/components/InfoPage.tsx`. The page title, intro, and body are rendered in a single shared header and section block.

Changes to make
1. `src/components/InfoPage.tsx`
   - Reduce the page title size slightly so it feels less dominant on mobile. Change from `text-2xl` to a slightly smaller value (e.g., `text-[21px]` or `text-xl` depending on the existing token scale).
   - Reduce the gap below the header so the title, intro, and body feel more connected. Change `mb-6` to `mb-4` or `mb-5` on the header.
   - Reduce the top margin on the intro paragraph from `mt-3` to `mt-2`.
   - Slightly darken the intro text so it is more intentional and readable. Change from `text-muted-foreground` to a slightly darker muted tone (e.g., `text-foreground/80` or a custom opacity that is still distinct from body text).

Invariants
- Keep the serif title and sans-serif body pairing.
- Keep the sticky header, burger menu, and page structure unchanged.
- Do not add or remove any elements.
- Do not touch the Contact page’s raised “Email us” block.
- Do not change any page content or route files.

Acceptance
- The pages look almost identical to now, only slightly tighter and more balanced.
- Title feels a little less dominant; intro feels more connected to the title and body.
- No layout, navigation, or content regressions are introduced.
