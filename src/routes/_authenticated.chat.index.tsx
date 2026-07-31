import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";

import { AppShell, ScreenHeading } from "@/components/AppShell";
import { Composer } from "@/components/chat/Composer";
import { DisciplePicker } from "@/components/chat/DisciplePicker";
import { MessageList } from "@/components/chat/MessageList";
import { useAuth } from "@/hooks/useAuth";
import { useDisciples } from "@/hooks/useChatData";
import { useChatStream } from "@/hooks/useChatStream";

const title = "New conversation — WithTwelve";
const description = "Start a new conversation with one of the twelve disciples.";

export const Route = createFileRoute("/_authenticated/chat/")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: NewChatPage,
});

function NewChatPage() {
  const { profile } = useAuth();
  const { data: disciples = [] } = useDisciples();
  const { state, isBusy } = useChatStream();
  const [text, setText] = useState("");
  const [selectedDiscipleId, setSelectedDiscipleId] = useState<string | null>(null);

  const locked =
    profile?.subscription_status === "expired" || profile?.subscription_status === "cancelled";

  return (
    <AppShell withNav>
      <ScreenHeading title="New conversation" subtitle="Ask what's on your heart." />

      <div className="flex-1">
        <MessageList messages={[]} disciples={disciples} stream={state} />
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