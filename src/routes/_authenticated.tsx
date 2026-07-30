import { Outlet, createFileRoute } from "@tanstack/react-router";

import { BottomNav } from "@/components/BottomNav";
import { ProtectedRoute } from "@/components/ProtectedRoute";

export const Route = createFileRoute("/_authenticated")({
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  return (
    <ProtectedRoute>
      <div className="min-h-dvh bg-background">
        <Outlet />
        <BottomNav />
      </div>
    </ProtectedRoute>
  );
}