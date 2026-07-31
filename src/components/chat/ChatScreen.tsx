import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";

import { AppShell, ScreenHeading } from "@/components/AppShell";
import { Composer } from "@/components/chat/Composer";
import { DisciplePicker } from "@/components/chat/DisciplePicker";
import { MessageList } from "@/components/chat/MessageList";
import { Skeleton } from "@/components/ui/skeleton";
import { useChatStreamContext } from "@/contexts/ChatStreamProvider";
import { useAuth } from "@/hooks/useAuth";
import { useDisciples, useMessages } from "@/hooks/useChatData";
import { initialChatStreamState } from "@/hooks/useChatStream";
import type { Message } from "@/integrations/supabase/db-types";
import { chatErrorCopy } from "@/lib/chat-contract";
import { resolveDiscipleId } from "@/lib/mentions";

const BLOCKED_CODES = new Set(["subscription_required", "trial_limit_reached"]);

/** A ticking clock so unfinished generations can settle into a calm state. */
function useNow(intervalMs = 30_000) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), intervalMs);
    return () => window.clearInterval(timer);
  }, [intervalMs]);
  return now;
}

export function ChatScreen({
  conversationId,
  title,
  subtitle,
  placeholder,
}: {
  conversationId: string | null;
  title: string;
  subtitle?: string;
  placeholder?: string;
}) {
  const { profile } = useAuth();
  const { data: disciples = [] } = useDisciples();
  const {
    data: messages = [],
    isLoading,
    isError,
  } = useMessages(conversationId) as {
    data?: Message[];
    isLoading: boolean;
    isError: boolean;
  };

  const { state, send, isBusy, reset } = useChatStreamContext();
  const [text, setText] = useState("");
  const [selectedDiscipleId, setSelectedDiscipleId] = useState<string | null>(null);
  const now = useNow();
  const bottomRef = useRef<HTMLDivElement>(null);

  // Only render stream state that belongs to the conversation on screen.
  const stream = useMemo(() => {
    if (state.phase === "idle") return initialChatStreamState;
    if (state.conversationId && state.conversationId !== conversationId) {
      return initialChatStreamState;
    }
    if (!state.conversationId && conversationId) return initialChatStreamState;
    return state;
  }, [state, conversationId]);

  // Autoscroll while a reply arrives, and when history first loads.
  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: stream.phase === "streaming" ? "smooth" : "auto",
      block: "end",
    });
  }, [messages.length, stream.assistantText, stream.phase, stream.pendingUserText]);

  const status = profile?.subscription_status;
  const entitlementBlocked = status === "expired" || status === "cancelled";
  const streamBlocked = !!stream.errorCode && BLOCKED_CODES.has(stream.errorCode);
  const locked = entitlementBlocked || streamBlocked;

  const routedDiscipleId = resolveDiscipleId(selectedDiscipleId, text, disciples);

  const helperText = entitlementBlocked
    ? "Your subscription has ended. New questions are paused for now."
    : streamBlocked
      ? chatErrorCopy(stream.errorCode!)
      : selectedDiscipleId
        ? "Asked of the one you chose."
        : routedDiscipleId
          ? "We noticed a mention — the backend still decides."
          : "Leave it open and it will be given to one of the twelve.";

  const onSend = () => {
    const trimmed = text.trim();
    if (!trimmed || locked || isBusy) return;
    setText("");
    void send({
      text: trimmed,
      conversationId,
      selectedDiscipleId: routedDiscipleId,
    });
  };

  return (
    <AppShell withNav>
      <ScreenHeading title={title} subtitle={subtitle} />

      <div className="flex-1">
        {conversationId && isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-16 rounded-2xl" />
            <Skeleton className="h-28 rounded-2xl" />
          </div>
        ) : conversationId && isError ? (
          <div className="rounded-2xl bg-surface p-6 shadow-sm">
            <p className="text-sm leading-relaxed text-muted-foreground">
              We couldn't open this conversation just now. Please try again in a moment.
            </p>
          </div>
        ) : messages.length === 0 && stream.phase === "idle" ? (
          <div className="rounded-2xl bg-surface p-6 shadow-sm">
            <p className="text-sm leading-relaxed text-muted-foreground">
              Say what's on your heart. One of the twelve will answer.
            </p>
          </div>
        ) : (
          <MessageList messages={messages} disciples={disciples} stream={stream} now={now} />
        )}
        <div ref={bottomRef} />
      </div>

      {stream.errorCode ? (
        <div className="mt-6 rounded-2xl border border-border bg-surface p-4 shadow-sm">
          <p className="text-sm leading-relaxed text-foreground">
            {chatErrorCopy(stream.errorCode)}
          </p>
          <div className="mt-3 flex gap-4 text-xs">
            {streamBlocked ? (
              <Link to="/account" className="text-primary underline-offset-4 hover:underline">
                View your account
              </Link>
            ) : (
              <button
                type="button"
                onClick={reset}
                className="text-primary underline-offset-4 hover:underline"
              >
                Dismiss
              </button>
            )}
          </div>
        </div>
      ) : null}

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
          onSend={onSend}
          disabled={locked}
          busy={isBusy}
          placeholder={placeholder}
          helperText={helperText}
        />
      </div>
    </AppShell>
  );
}
