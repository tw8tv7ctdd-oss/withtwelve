import { createFileRoute } from "@tanstack/react-router";

import { AppShell, ScreenHeading } from "@/components/AppShell";

const title = "Conversation — WithTwelve";
const description = "A conversation with one of the twelve disciples.";

export const Route = createFileRoute("/_authenticated/chat/$id")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: ChatPage,
});

function ChatPage() {
  const { id } = Route.useParams();

  return (
    <AppShell withNav>
      <ScreenHeading title="Conversation" subtitle="Read slowly." />
      <div className="rounded-2xl bg-surface p-6 shadow-sm">
        <p className="text-sm leading-relaxed text-muted-foreground">
          Messages for conversation <span className="text-foreground">{id}</span> load in the
          final step.
        </p>
      </div>
    </AppShell>
  );
}