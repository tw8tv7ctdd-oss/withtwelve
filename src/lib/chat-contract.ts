/**
 * Frontend-side mirror of the existing chat Edge Function contract.
 * This file describes the backend; it does not define or change it.
 * No request field, event, or error code here is invented.
 */

/** Pre-stream JSON error codes returned before any SSE bytes are written. */
export type ChatErrorCode =
  | "invalid_payload"
  | "unauthenticated"
  | "subscription_required"
  | "trial_limit_reached"
  | "usage_check_failed"
  | "profile_missing";

export interface ChatErrorBody {
  error: { code: ChatErrorCode | string; message?: string };
}

/** Exact request body accepted by the chat function. Nothing else is sent. */
export interface ChatRequestBody {
  conversation_id: string | null;
  text: string;
  selected_disciple_id: string | null;
  client_context: ChatClientContext;
}

export interface ChatClientContext {
  source?: "chat_input" | "starter_prompt" | "daily_prompt";
  locale?: string | null;
  app_version?: string | null;
  timezone?: string | null;
  client?: string | null;
}

export type ChatSseEventName =
  | "conversation.created"
  | "message.user.persisted"
  | "message.assistant.started"
  | "message.assistant.delta"
  | "message.assistant.completed"
  | "message.system.completed"
  | "error"
  | "done";

export type ChatSseEnvelope =
  | { event: "conversation.created"; payload: { conversation_id: string } }
  | { event: "message.user.persisted"; payload: { user_message_id: string } }
  | {
      event: "message.assistant.started";
      payload: {
  assistant_message_id: string;
  disciple_id?: string;
  disciple_name?: string;
  scripture_reference?: string | null;
  display_title?: string;
};
    }
  | { event: "message.assistant.delta"; payload: { delta: string } }
  | { event: "message.assistant.completed"; payload: { assistant_message_id: string } }
  | { event: "message.system.completed"; payload: { system_message_id: string } }
  | { event: "error"; payload: { code: string; message?: string } }
  | { event: "done"; payload: Record<string, never> };

/** Calm, user-facing copy for each pre-stream failure. */
export function chatErrorCopy(code: string): string {
  switch (code) {
    case "subscription_required":
      return "Your trial has ended. Upgrade to continue your reflections.";
    case "trial_limit_reached":
      return "That's five questions for today. Five more open up at midnight Hong Kong time (UTC+8).";
    case "unauthenticated":
      return "Your session has expired. Please sign in again.";
    case "invalid_payload":
      return "That question couldn't be sent. Try rewording it.";
    case "profile_missing":
      return "We couldn't find your profile. Please sign in again.";
    case "usage_check_failed":
    default:
      return "Something interrupted this reflection. Please try again in a moment.";
  }
}

/**
 * Splits a raw SSE text buffer on blank lines and returns parsed envelopes plus
 * the unconsumed remainder. Single-chunk (pseudo-streamed) bodies parse fine.
 */
export function parseSseBuffer(buffer: string): {
  envelopes: ChatSseEnvelope[];
  rest: string;
} {
  const parts = buffer.split("\n\n");
  const rest = parts.pop() ?? "";
  const envelopes: ChatSseEnvelope[] = [];

  for (const block of parts) {
    let sawData = false;
    for (const line of block.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed.startsWith("data:")) continue;
      sawData = true;
      const raw = trimmed.slice(5).trim();
      if (!raw) continue;
      try {
        envelopes.push(JSON.parse(raw) as ChatSseEnvelope);
      } catch {
        // Ignore malformed frames rather than tearing down the stream.
      }
    }

    // Tolerate bare JSON-line framing (no `data:` prefix) from the function.
    if (!sawData) {
      const raw = block.trim();
      if (raw.startsWith("{")) {
        try {
          envelopes.push(JSON.parse(raw) as ChatSseEnvelope);
        } catch {
          // ignore
        }
      }
    }
  }

  return { envelopes, rest };
}

/** Assistant rows still `streaming` after this long are treated as orphaned. */
export const ORPHANED_STREAM_MS = 3 * 60 * 1000;
