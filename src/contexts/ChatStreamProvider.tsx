import { createContext, useContext, type ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";

import { useChatStream } from "@/hooks/useChatStream";

type ChatStreamContextValue = ReturnType<typeof useChatStream>;

const ChatStreamContext = createContext<ChatStreamContextValue | null>(null);

/**
 * Held above the chat routes so an exchange survives the /chat -> /chat/:id
 * navigation that happens on `conversation.created`.
 */
export function ChatStreamProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const value = useChatStream({
    onConversationCreated: (conversationId) => {
      void navigate({
        to: "/chat/$id",
        params: { id: conversationId },
        replace: true,
      });
    },
    onSettled: (conversationId) => {
      void queryClient.invalidateQueries({ queryKey: ["conversations"] });
      void queryClient.invalidateQueries({ queryKey: ["usage-daily"] });
      if (conversationId) {
        void queryClient.invalidateQueries({ queryKey: ["messages", conversationId] });
        void queryClient.invalidateQueries({ queryKey: ["conversation", conversationId] });
      }
    },
  });

  return <ChatStreamContext.Provider value={value}>{children}</ChatStreamContext.Provider>;
}

export function useChatStreamContext(): ChatStreamContextValue {
  const ctx = useContext(ChatStreamContext);
  if (!ctx) throw new Error("useChatStreamContext must be used within a ChatStreamProvider");
  return ctx;
}
