import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";

import { AppShell, ScreenHeading } from "@/components/AppShell";
import { Composer } from "@/components/chat/Composer";
import { DisciplePicker } from "@/components/chat/DisciplePicker";
import { MessageList } from "@/components/chat/MessageList";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { useConversation, useDisciples, useMessages } from "@/hooks/useChatData";
import { useChatStream } from "@/hooks/useChatStream";

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
  const { profile } = useAuth();
  const { data: conversation } = useConversation(id);
  const { data: messages = [], isLoading, isError } = useMessages(id);
  const { data: disciples = [] } = useDisciples();
  const { state, isBusy } = useChatStream();
  const [text, setText] = useState("");
  const [selectedDiscipleId, setSelectedDiscipleId] = useState<string | null>(null);

  const locked =
    profile?.subscription_status === "expired" || profile?.subscription_status === "cancelled";

  return (
    <AppShell withNav>
      <ScreenHeading
        title={conversation?.title ?? "An unnamed reflection"}
        subtitle="Read slowly."
      />

      <div className="flex-1">
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-16 rounded-2xl" />
            <Skeleton className="h-28 rounded-2xl" />
          </div>
        ) : isError ? (
          <div className="rounded-2xl bg-surface p-6 shadow-sm">
            <p className="text-sm leading-relaxed text-muted-foreground">
              We couldn't open this conversation just now. Please try again in a moment.
            </p>
          </div>
        ) : (
          <MessageList messages={messages} disciples={disciples} stream={state} />
        )}
      </div>

      <div className="mt-6 space-y-3">
        <DisciplePicker
          disciples={disciples}
          selectedId={selectedDiscipleId}
          onSelect={setSelectedDiscipleId}
          disabled={locked || isBusy}
        />
        <Composer
          value={text}
          onChange={setText}
          onSend={() => {
            /* Streaming send is wired in the next step. */
          }}
          disabled={locked}
          busy={isBusy}
          placeholder="Continue the reflection…"
          helperText={
            locked
              ? "Your trial has ended. Upgrade to continue."
              : "Sending arrives in the next step."
          }
        />
      </div>
    </AppShell>
  );
}