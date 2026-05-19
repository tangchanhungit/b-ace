import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "@/components/app-shell";

export const Route = createFileRoute("/rules")({
  component: () => <PlaceholderPage title="Rules" description="Automation rules and triggers." />,
  head: () => ({ meta: [{ title: "Rules — Tag-Driven CRM" }] }),
});
