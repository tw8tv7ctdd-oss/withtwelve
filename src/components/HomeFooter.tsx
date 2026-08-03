import { Link } from "@tanstack/react-router";

import { secondaryLinks } from "@/lib/nav";

/**
 * Homepage-only footer.
 * Replaces the shared header on the landing page with a calm, focused
 * closing section that carries essential links and a path back into the app.
 */
export function HomeFooter({ isAuthenticated }: { isAuthenticated: boolean }) {
  const appLink = isAuthenticated ? { label: "Open WithTwelve", to: "/home" } : { label: "Sign in", to: "/auth" };

  return (
    <footer className="mt-8 border-t border-border pt-8">
      <div className="rounded-2xl bg-surface p-6 shadow-sm">
        <p className="text-center text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
          WithTwelve
        </p>

        <nav
          aria-label="Footer"
          className="mt-5 grid grid-cols-2 gap-x-4 gap-y-1 text-center sm:grid-cols-3"
        >
          {[...secondaryLinks, appLink].map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="flex min-h-10 items-center justify-center rounded-2xl text-sm text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <p className="mt-6 text-center text-xs leading-relaxed text-muted-foreground">
          A calm place to bring your questions to Scripture.
        </p>
        <p className="mt-1 text-center text-[11px] text-muted-foreground/70">
          © {new Date().getFullYear()} WithTwelve. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
