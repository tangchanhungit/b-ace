import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "@/components/app-shell";

export const Route = createFileRoute("/service-contracts")({
  component: () => <PlaceholderPage title="Service Contracts" description="Manage recurring service agreements." />,
  head: () => ({ meta: [{ title: "Service Contracts — Tag-Driven CRM" }] }),
});
