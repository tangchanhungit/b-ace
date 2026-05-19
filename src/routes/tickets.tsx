import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "@/components/app-shell";

export const Route = createFileRoute("/tickets")({
  component: () => <PlaceholderPage title="Tickets" description="Customer support cases." />,
  head: () => ({ meta: [{ title: "Tickets — Tag-Driven CRM" }] }),
});
