import { Link } from "@tanstack/react-router";
import { Home, MessageSquareText, User } from "lucide-react";

const items = [
  { to: "/home", label: "Home", icon: Home },
  { to: "/history", label: "History", icon: MessageSquareText },
  { to: "/account", label: "Account", icon: User },
] as const;

export function BottomNav() {
  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-surface/95 backdrop-blur"
    >
      <ul className="mx-auto flex w-full max-w-md items-stretch justify-around px-2 pt-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        {items.map(({ to, label, icon: Icon }) => (
          <li key={to} className="flex-1">
            <Link
              to={to}
              className="flex min-h-11 flex-col items-center justify-center gap-1 rounded-2xl px-3 py-2 text-xs text-muted-foreground transition-colors hover:text-foreground data-[status=active]:text-primary"
              activeProps={{ className: "font-medium" }}
            >
              <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden="true" />
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
