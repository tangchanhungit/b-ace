import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "@/components/app-shell";

export const Route = createFileRoute("/inventory/inbound")({
  component: () => <PlaceholderPage title="Inbound" description="Goods received and pending receipt." />,
  head: () => ({ meta: [{ title: "Inbound — Tag-Driven CRM" }] }),
});
