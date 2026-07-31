import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import type { Conversation, Disciple, Message } from "@/integrations/supabase/db-types";

/** Read-only: the twelve, for the picker and @mention hinting. */
export function useDisciples() {
  return useQuery({
    queryKey: ["disciples"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("disciples")
        .select("id, name, slug, persona_card, routing_weight, is_active, created_at")
        .eq("is_active", true)
        .order("name", { ascending: true });
      if (error) throw error;
      return (data ?? []) as Disciple[];
    },
    staleTime: 1000 * 60 * 10,
  });
}

/** Read-only: one conversation's header row. */
export function useConversation(conversationId: string | null) {
  return useQuery({
    queryKey: ["conversation", conversationId],
    enabled: !!conversationId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("conversations")
        .select("id, user_id, title, last_message_at, created_at")
        .eq("id", conversationId!)
        .maybeSingle();
      if (error) throw error;
      return (data as Conversation | null) ?? null;
    },
  });
}

/** Read-only: durable message history, oldest first. */
export function useMessages(conversationId: string | null) {
  return useQuery({
    queryKey: ["messages", conversationId],
    enabled: !!conversationId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conversationId!)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data ?? []) as Message[];
    },
    staleTime: 1000 * 5,
  });
}
