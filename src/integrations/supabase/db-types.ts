/**
 * Minimal hand-written types for the existing WithTwelve Supabase backend.
 * These mirror the canonical schema; they do not define or change it.
 */

export type SubscriptionStatus = "trial" | "active" | "expired" | "cancelled";
export type MessageRole = "user" | "assistant" | "system";
export type MessageStatus = "streaming" | "sent" | "error";

export interface Profile {
  id: string;
  email: string;
  preferred_name: string | null;
  is_admin: boolean;
  marketing_consent: boolean;
  consent_timestamp: string | null;
  trial_started_at: string | null;
  subscription_status: SubscriptionStatus;
  created_at: string;
  updated_at: string;
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
  content: string | null;
  status: MessageStatus | null;
  disciple_id: string | null;
  is_crisis_flag: boolean | null;
  is_second_view: boolean | null;
  metadata: unknown;
  created_at: string;
}

export interface Disciple {
  id: string;
  name: string;
  slug: string;
  persona_card: unknown;
  routing_weight: number;
  is_active: boolean;
  created_at: string;
}

export interface DailyPrompt {
  id: string;
  display_date: string;
  prompt_text: string;
  category: string | null;
  liturgical_season: string | null;
  follow_up_prompts: unknown;
  created_at: string;
}

export interface UsageDaily {
  id: string;
  user_id: string;
  date: string;
  question_count: number;
}
