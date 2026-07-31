import { useCallback, useEffect, useMemo, useReducer, useRef } from "react";

import { supabase } from "@/integrations/supabase/client";
import type { ChatRequestBody, ChatSseEnvelope } from "@/lib/chat-contract";
import { ChatRequestError, streamChat } from "@/lib/chat-client";

/**
 * Local, render-only state for one in-flight exchange.
 * The database remains authoritative; this exists purely so the screen can
 * respond immediately while the Edge Function streams.
 */

export type StreamPhase = "idle" | "pending" | "streaming" | "completed" | "error";

export interface ChatStreamState {
  phase: StreamPhase;
  /** Optimistic user bubble text, shown before message.user.persisted. */
  pendingUserText: string | null;
  conversationId: string | null;
  userMessageId: string | null;
  assistantMessageId: string | null;
  /** Accumulated deltas; one large delta renders the same as many small ones. */
  assistantText: string;
  /** Disciple attributed by the backend on message.assistant.started. */
  disciple: unknown | null;
  /** Disciple id from the backend's own attribution, when it sends one. */
  discipleId: string | null;
  /** Set when the reply came back as a neutral system/crisis message. */
  systemMessageId: string | null;
  isCrisis: boolean;
  errorCode: string | null;
  errorMessage: string | null;
  /** When the current exchange started, for the unfinished-generation state. */
  startedAt: number | null;
}

export const initialChatStreamState: ChatStreamState = {
  phase: "idle",
  pendingUserText: null,
  conversationId: null,
  userMessageId: null,
  assistantMessageId: null,
  assistantText: "",
  disciple: null,
  discipleId: null,
  systemMessageId: null,
  isCrisis: false,
  errorCode: null,
  errorMessage: null,
  startedAt: null,
};

export type ChatStreamAction =
  | { type: "send"; text: string; conversationId: string | null }
  | { type: "sse"; envelope: ChatSseEnvelope }
  | { type: "fail"; code: string; message?: string }
  | { type: "reset" };

function discipleIdOf(disciple: unknown): string | null {
  if (disciple && typeof disciple === "object") {
    const id = (disciple as { id?: unknown }).id;
    if (typeof id === "string") return id;
  }
  if (typeof disciple === "string") return disciple;
  return null;
}

export function chatStreamReducer(
  state: ChatStreamState,
  action: ChatStreamAction,
): ChatStreamState {
  switch (action.type) {
    case "send":
      return {
        ...initialChatStreamState,
        phase: "pending",
        pendingUserText: action.text,
        conversationId: action.conversationId,
        startedAt: Date.now(),
      };

    case "fail":
      return {
        ...state,
        phase: "error",
        errorCode: action.code,
        errorMessage: action.message ?? null,
      };

    case "reset":
      return initialChatStreamState;

    case "sse": {
      const { event, payload } = action.envelope;
      switch (event) {
        case "conversation.created":
          return { ...state, conversationId: payload.conversation_id };
        case "message.user.persisted":
          return { ...state, userMessageId: payload.user_message_id };
        case "message.assistant.started":
          return {
            ...state,
            phase: "streaming",
            assistantMessageId: payload.assistant_message_id,
            disciple: payload.disciple ?? null,
            discipleId: discipleIdOf(payload.disciple),
            assistantText: "",
          };
        case "message.assistant.delta":
          return {
            ...state,
            phase: "streaming",
            assistantText: state.assistantText + (payload.delta ?? ""),
          };
        case "message.assistant.completed":
          return {
            ...state,
            phase: "completed",
            assistantMessageId: payload.assistant_message_id,
          };
        case "message.system.completed":
          return {
            ...state,
            phase: "completed",
            isCrisis: true,
            disciple: null,
            discipleId: null,
            systemMessageId: payload.system_message_id,
          };
        case "error":
          return {
            ...state,
            phase: "error",
            errorCode: payload.code,
            errorMessage: payload.message ?? null,
          };
        case "done":
          return state.phase === "error" ? state : { ...state, phase: "completed" };
        default:
          return state;
      }
    }

    default:
      return state;
  }
}

export interface SendArgs {
  text: string;
  conversationId: string | null;
  selectedDiscipleId: string | null;
  clientContext?: Record<string, unknown>;
}

export interface UseChatStreamOptions {
  /** Fired once when the backend creates a conversation (new reflection). */
  onConversationCreated?: (conversationId: string) => void;
  /** Fired after the stream finishes (success or error) so reads can refetch. */
  onSettled?: (conversationId: string | null) => void;
}

/**
 * Owns local exchange state and runs the real send + SSE read loop.
 * The client never writes assistant or system rows; it only renders what the
 * Edge Function reports.
 */
export function useChatStream(options: UseChatStreamOptions = {}) {
  const [state, dispatch] = useReducer(chatStreamReducer, initialChatStreamState);
  const abortRef = useRef<AbortController | null>(null);
  const busyRef = useRef(false);
  const optionsRef = useRef(options);
  optionsRef.current = options;

  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  const reset = useCallback(() => dispatch({ type: "reset" }), []);

  const send = useCallback(async (args: SendArgs) => {
    const text = args.text.trim();
    if (!text || busyRef.current) return;
    busyRef.current = true;

    const controller = new AbortController();
    abortRef.current?.abort();
    abortRef.current = controller;

    dispatch({ type: "send", text, conversationId: args.conversationId });

    let conversationId = args.conversationId;
    let notifiedCreated = false;

    try {
      const { data, error } = await supabase.auth.getSession();
      const accessToken = data.session?.access_token;
      if (error || !accessToken) throw new ChatRequestError("unauthenticated");

      const body: ChatRequestBody = {
        conversation_id: args.conversationId,
        text,
        selected_disciple_id: args.selectedDiscipleId,
        client_context: {
          timezone:
            typeof Intl !== "undefined"
              ? Intl.DateTimeFormat().resolvedOptions().timeZone
              : null,
          client: "web",
          ...(args.clientContext ?? {}),
        },
      };

      await streamChat({
        body,
        accessToken,
        signal: controller.signal,
        onEnvelope: (envelope) => {
          dispatch({ type: "sse", envelope });
          if (envelope.event === "conversation.created") {
            conversationId = envelope.payload.conversation_id;
            if (!notifiedCreated) {
              notifiedCreated = true;
              optionsRef.current.onConversationCreated?.(conversationId);
            }
          }
        },
      });
    } catch (err) {
      if ((err as Error)?.name === "AbortError") {
        busyRef.current = false;
        return;
      }
      const code = err instanceof ChatRequestError ? err.code : "usage_check_failed";
      const message = err instanceof ChatRequestError ? err.message : undefined;
      dispatch({ type: "fail", code, message });
    } finally {
      busyRef.current = false;
      optionsRef.current.onSettled?.(conversationId);
    }
  }, []);

  const isBusy = state.phase === "pending" || state.phase === "streaming";

  return useMemo(
    () => ({ state, dispatch, reset, send, isBusy }),
    [state, reset, send, isBusy],
  );
}
