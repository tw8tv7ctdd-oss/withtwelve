import { Link, useLocation } from "@tanstack/react-router";

import { hasBottomNav, secondaryLinks } from "@/lib/nav";

/** Quiet site footer with the secondary links. Hidden on authenticated app screens. */
export function SiteFooter() {
  const { pathname } = useLocation();

  if (hasBottomNav(pathname)) return null;

  return (
    <footer className="w-full border-t border-border bg-background">
      <div className="mx-auto max-w-md px-5 pt-8 pb-8">
        <nav
          aria-label="Secondary"
          className="flex flex-wrap items-center justify-center gap-x-5 gap-y-3"
        >
          {secondaryLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <p className="mt-6 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} WithTwelve
        </p>
      </div>
    </footer>
  );
}
