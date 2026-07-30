import { createFileRoute } from "@tanstack/react-router";

import { AppShell, ScreenHeading } from "@/components/AppShell";

const title = "Today — WithTwelve";
const description = "Your daily prompt and a quiet place to begin a conversation.";

export const Route = createFileRoute("/_authenticated/home")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  return (
    <AppShell withNav>
      <ScreenHeading title="Today" subtitle="Begin where you are." />
      <div className="rounded-2xl bg-surface p-6 shadow-sm">
        <p className="text-sm leading-relaxed text-muted-foreground">
          The daily prompt and ask box arrive in a later step.
        </p>
      </div>
    </AppShell>
  );
}