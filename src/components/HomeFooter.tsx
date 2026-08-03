import { Link } from "@tanstack/react-router";

import { secondaryLinks } from "@/lib/nav";

/**
 * Homepage-only footer.
 * A quiet, transparent closing section that sits directly on the page
 * background with minimal visual treatment.
 */
export function HomeFooter({ isAuthenticated }: { isAuthenticated: boolean }) {
  const appLink = isAuthenticated ? { label: "Open WithTwelve", to: "/home" } : { label: "Sign in", to: "/auth" };

  return (
    <footer className="pt-8 pb-8 text-center">
      <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground/70">
        WithTwelve
      </p>

      <nav aria-label="Footer" className="mt-5">
        <ul className="mx-auto flex max-w-[360px] flex-wrap justify-center gap-x-5 gap-y-2 text-sm">
          {[...secondaryLinks, appLink].map((link) => (
            <li key={link.to}>
              <Link
                to={link.to}
                className="text-xs text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <p className="mt-6 text-xs leading-relaxed text-muted-foreground/60">
        A calm place to bring your questions to Scripture.
      </p>
      <p className="mt-1 text-[11px] text-muted-foreground/50">
        © {new Date().getFullYear()} WithTwelve. All rights reserved.
      </p>
    </footer>
  );
}

