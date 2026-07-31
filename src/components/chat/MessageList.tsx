import { MessageBubble } from "@/components/chat/MessageBubble";
import type { Disciple, Message } from "@/integrations/supabase/db-types";
import { ORPHANED_STREAM_MS } from "@/lib/chat-contract";
import type { ChatStreamState } from "@/hooks/useChatStream";

function isOrphaned(message: Message, now: number): boolean {
  if (message.status !== "streaming") return false;
  return now - new Date(message.created_at).getTime() > ORPHANED_STREAM_MS;
}

/**
 * Renders durable rows from the database first, then the in-flight exchange
 * held only in local stream state (never persisted from the client).
 */
export function MessageList({
  messages,
  disciples,
  stream,
  now = Date.now(),
}: {
  messages: Message[];
  disciples: Disciple[];
  stream: ChatStreamState;
  now?: number;
}) {
  const nameFor = (id: string | null) =>
    id ? (disciples.find((d) => d.id === id)?.name ?? null) : null;

  const persistedIds = new Set(messages.map((m) => m.id));
  const live = stream.phase === "pending" || stream.phase === "streaming";
  const replyId = stream.systemMessageId ?? stream.assistantMessageId;
  const replyPersisted = !!replyId && persistedIds.has(replyId);
  const settledUnpersisted =
    (stream.phase === "completed" || stream.phase === "error") &&
    !!stream.assistantText &&
    !replyPersisted;

  const showPendingUser =
    stream.pendingUserText !== null &&
    (!stream.userMessageId || !persistedIds.has(stream.userMessageId));
  const showLiveAssistant = live || settledUnpersisted;

  const liveStalled =
    live && stream.startedAt !== null && now - stream.startedAt > ORPHANED_STREAM_MS;

  return (
    <div className="flex flex-col gap-4" aria-live="polite">
      {messages.map((message) => (
        <MessageBubble
          key={message.id}
          role={message.role}
          content={message.content ?? ""}
          discipleName={nameFor(message.disciple_id)}
          isCrisis={!!message.is_crisis_flag}
          isOrphaned={isOrphaned(message, now)}
        />
      ))}

      {showPendingUser ? (
        <MessageBubble role="user" content={stream.pendingUserText ?? ""} />
      ) : null}

      {showLiveAssistant ? (
        <MessageBubble
          role={stream.isCrisis ? "system" : "assistant"}
          content={stream.assistantText}
          discipleName={stream.isCrisis ? null : nameFor(stream.discipleId)}
          isCrisis={stream.isCrisis}
          isStreaming={live && !liveStalled}
          isOrphaned={liveStalled && !stream.assistantText}
        />
      ) : null}
    </div>
  );
}
