import { createFileRoute } from "@tanstack/react-router";

import { ChatScreen } from "@/components/chat/ChatScreen";

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
  return (
    <ChatScreen
      conversationId={null}
      title="New conversation"
      subtitle="Ask what's on your heart."
      placeholder="Ask what's on your heart…"
    />
  );
}
