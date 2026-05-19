import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "@/components/app-shell";

export const Route = createFileRoute("/quotes")({
  component: () => <PlaceholderPage title="Quotes" description="Draft, send and track sales quotes." />,
  head: () => ({ meta: [{ title: "Quotes — Tag-Driven CRM" }] }),
});
