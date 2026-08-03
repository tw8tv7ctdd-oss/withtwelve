import { Link } from "@tanstack/react-router";
import { Menu } from "lucide-react";
import { useState } from "react";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { eyebrowClass } from "@/components/common/Surface";
import { useAuth } from "@/hooks/useAuth";
import { secondaryLinks } from "@/lib/nav";

const itemClass =
  "flex min-h-11 items-center rounded-2xl px-3 text-sm text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground data-[status=active]:bg-muted/50 data-[status=active]:font-medium data-[status=active]:text-foreground";

/** App-wide top header: secondary-links menu on the left, wordmark centered. */
export function SiteHeader() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur">
      <div className="relative mx-auto flex w-full max-w-md items-center px-3 py-2">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger
            aria-label="Open menu"
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <Menu className="h-5 w-5" strokeWidth={1.75} aria-hidden="true" />
          </SheetTrigger>
          <SheetContent side="left" className="w-[17rem] border-border bg-surface px-5">
            <SheetHeader className="px-0 pt-2 pb-0">
              <SheetTitle className={eyebrowClass}>WithTwelve</SheetTitle>
            </SheetHeader>

            <nav aria-label="Menu" className="mt-5 flex flex-col gap-0.5">
              <Link to={user ? "/home" : "/"} onClick={close} className={itemClass}>
                Home
              </Link>
              <span className="my-2 h-px bg-border" aria-hidden="true" />
              {secondaryLinks.map((link) => (
                <Link key={link.to} to={link.to} onClick={close} className={itemClass}>
                  {link.label}
                </Link>
              ))}
            </nav>
          </SheetContent>
        </Sheet>

        <Link
          to={user ? "/home" : "/"}
          className="absolute left-1/2 -translate-x-1/2 text-[13px] font-medium tracking-[0.18em] text-foreground uppercase"
        >
          WithTwelve
        </Link>

        <span className="ml-auto h-11 w-11" aria-hidden="true" />
      </div>
    </header>
  );
}
