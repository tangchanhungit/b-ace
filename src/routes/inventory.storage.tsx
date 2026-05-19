import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "@/components/app-shell";

export const Route = createFileRoute("/inventory/storage")({
  component: () => <PlaceholderPage title="Storage" description="Warehouse stock and bin locations." />,
  head: () => ({ meta: [{ title: "Storage — Tag-Driven CRM" }] }),
});
