import type { ChatErrorBody, ChatRequestBody, ChatSseEnvelope } from "@/lib/chat-contract";
import { parseSseBuffer } from "@/lib/chat-contract";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;

/** URL of the existing chat Edge Function. Nothing about it is redefined here. */
export const CHAT_FUNCTION_URL = `${SUPABASE_URL}/functions/v1/chat`;

/** A failure raised before (or instead of) any SSE bytes. */
export class ChatRequestError extends Error {
  code: string;
  constructor(code: string, message?: string) {
    super(message ?? code);
    this.name = "ChatRequestError";
    this.code = code;
  }
}

/**
 * POSTs one exchange to the chat Edge Function and streams the response.
 *
 * Pre-stream JSON errors (invalid_payload, unauthenticated, subscription_required,
 * trial_limit_reached, usage_check_failed, profile_missing) are detected and
 * thrown as ChatRequestError *before* any reader loop starts. Once the body is
 * an SSE stream it is read with getReader() + TextDecoder and buffered so that
 * both true token streaming and single-chunk pseudo-streaming parse identically.
 */
export async function streamChat({
  body,
  accessToken,
  signal,
  onEnvelope,
}: {
  body: ChatRequestBody;
  accessToken: string;
  signal?: AbortSignal;
  onEnvelope: (envelope: ChatSseEnvelope) => void;
}): Promise<void> {
  let response: Response;
  try {
    response = await fetch(CHAT_FUNCTION_URL, {
      method: "POST",
      signal,
      headers: {
        "Content-Type": "application/json",
        Accept: "text/event-stream",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(body),
    });
  } catch (err) {
    if ((err as Error)?.name === "AbortError") throw err;
    throw new ChatRequestError("network_error");
  }

  const contentType = response.headers.get("content-type") ?? "";
  const isEventStream = contentType.includes("text/event-stream");

  // Pre-stream failure: a JSON error body, or any non-OK response.
  if (!response.ok || !isEventStream) {
    let code = response.ok ? "usage_check_failed" : `http_${response.status}`;
    let message: string | undefined;
    try {
      const parsed = (await response.json()) as ChatErrorBody & { code?: string };
      const inner = parsed?.error;
      if (inner && typeof inner === "object") {
        code = inner.code ?? code;
        message = inner.message;
      } else if (typeof (parsed as { error?: unknown }).error === "string") {
        code = (parsed as unknown as { error: string }).error;
      } else if (parsed?.code) {
        code = parsed.code;
      }
    } catch {
      // Non-JSON body; keep the status-derived code.
    }
    throw new ChatRequestError(code, message);
  }

  if (!response.body) throw new ChatRequestError("usage_check_failed");

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const { envelopes, rest } = parseSseBuffer(buffer);
      buffer = rest;
      for (const envelope of envelopes) onEnvelope(envelope);
    }
  } finally {
    try {
      reader.releaseLock();
    } catch {
      /* noop */
    }
  }

  // Flush anything left without a trailing blank line (single-chunk bodies).
  buffer += decoder.decode();
  if (buffer.trim()) {
    const { envelopes } = parseSseBuffer(`${buffer}\n\n`);
    for (const envelope of envelopes) onEnvelope(envelope);
  }
}
