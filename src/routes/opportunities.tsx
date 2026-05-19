import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "@/components/app-shell";

export const Route = createFileRoute("/opportunities")({
  component: () => <PlaceholderPage title="Opportunities" description="Track open deals and forecast revenue." />,
  head: () => ({ meta: [{ title: "Opportunities — Tag-Driven CRM" }] }),
});
