import { Link, createFileRoute } from "@tanstack/react-router";

import { AppShell } from "@/components/AppShell";
import { useAuth } from "@/hooks/useAuth";

const title = "WithTwelve — Walk with the twelve disciples";
const description =
  "A quiet place to bring your questions to Scripture and hear from the disciples who walked with Jesus.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: Landing,
});

function Landing() {
  const { session, loading } = useAuth();

  return (
    <AppShell className="min-h-dvh justify-center gap-10">
      <div className="rounded-3xl bg-surface p-8 text-center shadow-sm">
        <p className="text-xs tracking-[0.2em] text-secondary uppercase">WithTwelve</p>
        <h1 className="mt-4 text-3xl leading-tight font-semibold tracking-tight text-balance">
          Bring your question. Sit with the twelve.
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{description}</p>

        <Link
          to={session ? "/home" : "/auth"}
          className="mt-8 inline-flex w-full items-center justify-center rounded-2xl bg-primary px-5 py-3.5 text-sm font-medium text-primary-foreground shadow-sm transition-opacity hover:opacity-90"
        >
          {loading ? "…" : session ? "Continue" : "Begin"}
        </Link>
      </div>

      <p className="text-center text-xs leading-relaxed text-muted-foreground">
        A seven-day trial, then a simple subscription. No noise, no feeds — just Scripture and
        honest conversation.
      </p>
    </AppShell>
  );
}
