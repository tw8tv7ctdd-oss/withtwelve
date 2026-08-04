// TEMPORARY PREVIEW-ONLY AUTH BYPASS — delete this file and its use in src/routes/__root.tsx.
import { useEffect, useState } from "react";

import { PREVIEW_AUTH_AVAILABLE, isPreviewAuthEnabled, setPreviewAuth } from "@/lib/preview-auth";

export function PreviewAuthToggle() {
  const [on, setOn] = useState(false);

  useEffect(() => {
    if (!PREVIEW_AUTH_AVAILABLE) return;
    const sync = () => setOn(isPreviewAuthEnabled());
    sync();
    window.addEventListener("withtwelve:preview-auth", sync);
    return () => window.removeEventListener("withtwelve:preview-auth", sync);
  }, []);

  if (!PREVIEW_AUTH_AVAILABLE) return null;

  return (
    <button
      type="button"
      onClick={() => setPreviewAuth(!on)}
      className="fixed bottom-24 left-3 z-50 rounded-2xl border border-border bg-surface px-3 py-2 text-xs font-medium text-muted-foreground shadow-sm"
    >
      {on ? "Turn off preview login" : "Preview logged-in view"}
    </button>
  );
}
