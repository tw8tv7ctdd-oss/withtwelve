import { MessageBubble } from "@/components/chat/MessageBubble";
import type { Disciple, Message } from "@/integrations/supabase/db-types";
import { ORPHANED_STREAM_MS } from "@/lib/chat-contract";
import type { ChatStreamState } from "@/hooks/useChatStream";

function isOrphaned(message: Message): boolean {
  if (message.status !== "streaming") return false;
  return Date.now() - new Date(message.created_at).getTime() > ORPHANED_STREAM_MS;
}

/**
 * Renders durable rows from the database first, then the in-flight exchange
 * held only in local stream state (never persisted from the client).
 */
export function MessageList({
  messages,
  disciples,
  stream,
}: {
  messages: Message[];
  disciples: Disciple[];
  stream: ChatStreamState;
}) {
  const nameFor = (id: string | null) =>
    id ? (disciples.find((d) => d.id === id)?.name ?? null) : null;

  const persistedIds = new Set(messages.map((m) => m.id));
  const showPendingUser =
    stream.pendingUserText !== null &&
    (!stream.userMessageId || !persistedIds.has(stream.userMessageId));
  const showLiveAssistant =
    (stream.phase === "streaming" || stream.phase === "pending") &&
    (!stream.assistantMessageId || !persistedIds.has(stream.assistantMessageId));

  return (
    <div className="flex flex-col gap-4">
      {messages.map((message) => (
        <MessageBubble
          key={message.id}
          role={message.role}
          content={message.content ?? ""}
          discipleName={nameFor(message.disciple_id)}
          isCrisis={!!message.is_crisis_flag}
          isOrphaned={isOrphaned(message)}
        />
      ))}

      {showPendingUser ? (
        <MessageBubble role="user" content={stream.pendingUserText ?? ""} />
      ) : null}

      {showLiveAssistant ? (
        <MessageBubble
          role="assistant"
          content={stream.assistantText || "Listening…"}
          discipleName={null}
          isStreaming
        />
      ) : null}
    </div>
  );
}