import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "@/components/app-shell";

export const Route = createFileRoute("/organizations")({
  component: () => <PlaceholderPage title="Organizations" description="Companies and accounts." />,
  head: () => ({ meta: [{ title: "Organizations — Tag-Driven CRM" }] }),
});
