import { useCallback, useMemo, useReducer } from "react";

import type { ChatSseEnvelope } from "@/lib/chat-contract";

/**
 * Local, render-only state for one in-flight exchange.
 * The database remains authoritative; this exists purely so the screen can
 * respond immediately while the Edge Function streams.
 *
 * Planning step: the reducer and event mapping are final; the fetch/reader
 * loop that dispatches into it lands in the implementation step.
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
  /** Set when the reply came back as a neutral system/crisis message. */
  systemMessageId: string | null;
  isCrisis: boolean;
  errorCode: string | null;
  errorMessage: string | null;
}

export const initialChatStreamState: ChatStreamState = {
  phase: "idle",
  pendingUserText: null,
  conversationId: null,
  userMessageId: null,
  assistantMessageId: null,
  assistantText: "",
  disciple: null,
  systemMessageId: null,
  isCrisis: false,
  errorCode: null,
  errorMessage: null,
};

export type ChatStreamAction =
  | { type: "send"; text: string; conversationId: string | null }
  | { type: "sse"; envelope: ChatSseEnvelope }
  | { type: "fail"; code: string; message?: string }
  | { type: "reset" };

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
            assistantText: "",
          };
        case "message.assistant.delta":
          return { ...state, phase: "streaming", assistantText: state.assistantText + payload.delta };
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

/**
 * Owns local exchange state. `send` is intentionally not implemented yet —
 * the fetch + ReadableStream reader + TextDecoder loop is the next step.
 */
export function useChatStream() {
  const [state, dispatch] = useReducer(chatStreamReducer, initialChatStreamState);

  const reset = useCallback(() => dispatch({ type: "reset" }), []);
  const isBusy = state.phase === "pending" || state.phase === "streaming";

  return useMemo(() => ({ state, dispatch, reset, isBusy }), [state, reset, isBusy]);
}