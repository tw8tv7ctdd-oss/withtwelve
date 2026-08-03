import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/safety")({
  beforeLoad: () => {
    throw redirect({ to: "/safeguarding", replace: true });
  },
});
