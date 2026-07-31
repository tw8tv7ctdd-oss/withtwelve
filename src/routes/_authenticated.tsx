import { Outlet, createFileRoute } from "@tanstack/react-router";

import { BottomNav } from "@/components/BottomNav";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ChatStreamProvider } from "@/contexts/ChatStreamProvider";

export const Route = createFileRoute("/_authenticated")({
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  return (
    <ProtectedRoute>
      <ChatStreamProvider>
        <div className="min-h-dvh bg-background">
          <Outlet />
          <BottomNav />
        </div>
      </ChatStreamProvider>
    </ProtectedRoute>
  );
}