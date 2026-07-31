import { useContext } from "react";

import { AuthContext } from "@/contexts/AuthProvider";
import type { AuthContextValue } from "@/contexts/AuthProvider";

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
