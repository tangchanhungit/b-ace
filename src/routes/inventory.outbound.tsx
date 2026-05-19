import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "@/components/app-shell";

export const Route = createFileRoute("/inventory/outbound")({
  component: () => <PlaceholderPage title="Outbound" description="Picking, packing and shipping." />,
  head: () => ({ meta: [{ title: "Outbound — Tag-Driven CRM" }] }),
});
