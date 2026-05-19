import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "@/components/app-shell";

export const Route = createFileRoute("/reports")({
  component: () => <PlaceholderPage title="Reports" description="Pipeline, performance and tag analytics." />,
  head: () => ({ meta: [{ title: "Reports — Tag-Driven CRM" }] }),
});
