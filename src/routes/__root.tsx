import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
  useLocation,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { AuthProvider } from "@/contexts/AuthProvider";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md rounded-3xl bg-surface p-8 text-center shadow-sm">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          There is nothing here
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          This page has moved on, or was never here. Your conversations are safe where you left
          them.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex min-h-11 items-center justify-center rounded-2xl bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Return home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md rounded-3xl bg-surface p-8 text-center shadow-sm">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't open
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Something went quiet on our end. Nothing has been lost — you can try again in a moment.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex min-h-11 items-center justify-center rounded-2xl bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-border bg-background px-5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            Return home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "WithTwelve" },
      {
        name: "description",
        content: "A calm place to bring your questions to Scripture with the twelve disciples.",
      },
      { name: "author", content: "WithTwelve" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap",
      },
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
        <Outlet />
        <Footer />
      </AuthProvider>
    </QueryClientProvider>
  );
}

const footerLinks = [
  { label: "About WithTwelve", to: "/about" },
  { label: "Pricing", to: "/pricing" },
  { label: "Privacy", to: "/privacy" },
  { label: "Terms", to: "/terms" },
  { label: "Safety & safeguarding", to: "/safety" },
  { label: "Contact", to: "/contact" },
];

function Footer() {
  const location = useLocation();
  const pathname = location.pathname;

  if (pathname === "/chat" || pathname.startsWith("/chat/")) {
    return null;
  }

  // Routes that render the fixed bottom nav need extra clearance so the nav
  // never covers the footer or the last section of content.
  const hasBottomNav = ["/home", "/history", "/account"].some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );

  return (
    <footer className="w-full border-t border-border bg-background">
      <div
        className={`mx-auto max-w-md px-6 pt-8 ${
          hasBottomNav ? "pb-[calc(6rem+env(safe-area-inset-bottom))]" : "pb-8"
        }`}
      >
        <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-3">
          {footerLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="text-[13px] text-muted-foreground transition-colors hover:text-text"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <p className="mt-6 text-center text-[12px] text-muted-foreground">
          © {new Date().getFullYear()} WithTwelve
        </p>
      </div>
    </footer>
  );
}
