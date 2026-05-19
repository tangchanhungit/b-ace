import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "@/components/app-shell";

export const Route = createFileRoute("/support-faq")({
  component: () => <PlaceholderPage title="Support FAQ" description="Knowledge base for customer support." />,
  head: () => ({ meta: [{ title: "Support FAQ — Tag-Driven CRM" }] }),
});
