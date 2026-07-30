/**
 * Minimal hand-written types for the existing WithTwelve Supabase backend.
 * These mirror the canonical schema; they do not define or change it.
 */

export type SubscriptionStatus = "trial" | "active" | "expired" | "cancelled";
export type MessageRole = "user" | "assistant" | "system";
export type MessageStatus = "streaming" | "sent" | "error";

export interface Profile {
  id: string;
  display_name: string | null;
  subscription_status: SubscriptionStatus;
  trial_started_at: string | null;
  created_at: string;
}

export interface Conversation {
  id: string;
  user_id: string;
  title: string | null;
  last_message_at: string | null;
  created_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  role: MessageRole;
  content: string;
  status: MessageStatus | null;
  disciple_id: string | null;
  is_crisis_flag: boolean | null;
  is_second_view: boolean | null;
  created_at: string;
}

export interface Disciple {
  id: string;
  name: string;
  slug: string | null;
  short_description: string | null;
}