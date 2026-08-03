/** Shared navigation model: one source of truth for links and shell spacing. */

export const secondaryLinks = [
  { label: "About WithTwelve", to: "/about" },
  { label: "Pricing", to: "/pricing" },
  { label: "Privacy", to: "/privacy" },
  { label: "Terms", to: "/terms" },
  { label: "Safety & safeguarding", to: "/safety" },
  { label: "Contact", to: "/contact" },
] as const;

/** Routes that render the fixed bottom nav. */
const bottomNavRoutes = ["/home", "/history", "/account", "/chat"] as const;

function matches(pathname: string, base: string) {
  return pathname === base || pathname.startsWith(`${base}/`);
}

export function isChatRoute(pathname: string) {
  return matches(pathname, "/chat");
}

export function hasBottomNav(pathname: string) {
  return bottomNavRoutes.some((base) => matches(pathname, base));
}

/** Clearance so the fixed bottom nav never covers the last block of content. */
export const bottomNavClearance = "pb-[calc(6rem+env(safe-area-inset-bottom))]";
