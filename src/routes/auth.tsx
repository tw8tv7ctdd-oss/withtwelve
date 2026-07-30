import { createFileRoute } from "@tanstack/react-router";

import { AppShell, ScreenHeading } from "@/components/AppShell";

const title = "Sign in — WithTwelve";
const description = "Sign in to WithTwelve with a magic link sent to your email.";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  return (
    <AppShell className="justify-center">
      <ScreenHeading
        title="Sign in"
        subtitle="We'll email you a magic link — no password to remember."
      />
      <div className="rounded-2xl bg-surface p-6 shadow-sm">
        <p className="text-sm leading-relaxed text-muted-foreground">
          The magic-link form arrives in the next step of the build.
        </p>
      </div>
    </AppShell>
  );
}