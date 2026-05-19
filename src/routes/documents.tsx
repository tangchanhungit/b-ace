import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "@/components/app-shell";

export const Route = createFileRoute("/documents")({
  component: () => <PlaceholderPage title="Documents" description="Files attached across the CRM." />,
  head: () => ({ meta: [{ title: "Documents — Tag-Driven CRM" }] }),
});
