import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "@/components/app-shell";

export const Route = createFileRoute("/activities")({
  component: () => <PlaceholderPage title="Activities" description="Calls, emails and tasks across the team." />,
  head: () => ({ meta: [{ title: "Activities — Tag-Driven CRM" }] }),
});
