import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "@/components/app-shell";

export const Route = createFileRoute("/calendar")({
  component: () => <PlaceholderPage title="Calendar" description="Unified team calendar." />,
  head: () => ({ meta: [{ title: "Calendar — Tag-Driven CRM" }] }),
});
