import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";

import { AppShell, ScreenHeading } from "@/components/AppShell";
import { ErrorState, LoadingCard, QuietState } from "@/components/common/States";
import { Composer } from "@/components/chat/Composer";
import { DisciplePicker } from "@/components/chat/DisciplePicker";
import { MessageList } from "@/components/chat/MessageList";
import { useChatStreamContext } from "@/contexts/ChatStreamProvider";
import { useAuth } from "@/hooks/useAuth";
import { useDisciples, useMessages } from "@/hooks/useChatData";
import { initialChatStreamState } from "@/hooks/useChatStream";
import type { Message } from "@/integrations/supabase/db-types";
import { chatErrorCopy } from "@/lib/chat-contract";
import { isEntitlementBlocked } from "@/lib/entitlements";
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
  const { data: disciples = [], isLoading: disciplesLoading } = useDisciples();
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

  // Once the durable rows for a finished exchange arrive, drop the local copy
  // in the same commit the rows render in, so nothing flickers or doubles up.
  const replyId = stream.systemMessageId ?? stream.assistantMessageId;
  useEffect(() => {
    if (stream.phase !== "completed" || !replyId) return;
    if (messages.some((message) => message.id === replyId)) reset();
  }, [stream.phase, replyId, messages, reset]);

  const status = profile?.subscription_status;
  const entitlementBlocked = isEntitlementBlocked(status);
  const streamBlocked = !!stream.errorCode && BLOCKED_CODES.has(stream.errorCode);
  const locked = entitlementBlocked || streamBlocked;

  const routedDiscipleId = resolveDiscipleId(selectedDiscipleId, text, disciples);

  const helperText = entitlementBlocked
    ? "New questions are paused for now."
    : streamBlocked
      ? chatErrorCopy(stream.errorCode!)
      : isBusy
        ? "Waiting quietly for the reply."
        : selectedDiscipleId
          ? "Asked of the one you chose."
          : routedDiscipleId
            ? "We noticed a mention in your question."
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
            <div className="ml-auto h-14 w-3/5 animate-pulse rounded-2xl bg-primary/10" />
            <LoadingCard lines={3} />
          </div>
        ) : conversationId && isError ? (
          <ErrorState body="We couldn't open this conversation just now. Your words are safe — please try again in a moment." />
        ) : messages.length === 0 && stream.phase === "idle" ? (
          <QuietState
            title="Begin whenever you're ready"
            body="Write what is on your heart, in your own words. One of the twelve will answer."
          />
        ) : (
          <MessageList messages={messages} disciples={disciples} stream={stream} now={now} />
        )}
        <div ref={bottomRef} />
      </div>

      {stream.errorCode ? (
        <div
          role="status"
          aria-live="polite"
          className="mt-6 rounded-2xl border border-border bg-surface p-4"
        >
          <p className="text-sm leading-relaxed text-foreground">
            {chatErrorCopy(stream.errorCode)}
          </p>
          <div className="mt-3 flex flex-wrap gap-4 text-xs">
            {streamBlocked ? (
              <Link
                to="/account"
                className="inline-flex min-h-9 items-center text-primary underline-offset-4 hover:underline"
              >
                View your account
              </Link>
            ) : (
              <button
                type="button"
                onClick={reset}
                className="inline-flex min-h-9 items-center text-primary underline-offset-4 hover:underline"
              >
                Dismiss
              </button>
            )}
          </div>
        </div>
      ) : null}

      <div className="mt-6 space-y-2.5">
        <DisciplePicker
          disciples={disciples}
          selectedId={selectedDiscipleId}
          onSelect={setSelectedDiscipleId}
          disabled={locked || isBusy}
          loading={disciplesLoading}
        />
        <Composer
          value={text}
          onChange={setText}
          onSend={onSend}
          disabled={locked}
          busy={isBusy}
          placeholder={placeholder}
          helperText={helperText}
          disciples={disciples}
          onMentionSelect={setSelectedDiscipleId}
        />
      </div>

      <p className="mt-8 text-center text-xs leading-relaxed text-muted-foreground">
        Need help?{" "}
        <Link to="/contact" className="underline underline-offset-4 hover:text-foreground">
          Contact us
        </Link>{" "}
        or{" "}
        <Link to="/safeguarding" className="underline underline-offset-4 hover:text-foreground">
          view safeguarding
        </Link>.
      </p>
    </AppShell>
  );
}
