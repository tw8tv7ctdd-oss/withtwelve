import { createFileRoute } from "@tanstack/react-router";

import { ChatScreen } from "@/components/chat/ChatScreen";
import { useConversation } from "@/hooks/useChatData";

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
  const { data: conversation } = useConversation(id);

  return (
    <ChatScreen
      key={id}
      conversationId={id}
      title={conversation?.title ?? "An unnamed reflection"}
      subtitle="Read slowly."
      placeholder="Continue the reflection…"
    />
  );
}
