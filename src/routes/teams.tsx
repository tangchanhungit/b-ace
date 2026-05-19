import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "@/components/app-shell";

export const Route = createFileRoute("/teams")({
  component: () => <PlaceholderPage title="Teams" description="Org chart, roles and permissions." />,
  head: () => ({ meta: [{ title: "Teams — Tag-Driven CRM" }] }),
});
