import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "@/components/app-shell";

export const Route = createFileRoute("/schedule")({
  component: () => <PlaceholderPage title="Schedule" description="Service appointments and dispatching." />,
  head: () => ({ meta: [{ title: "Schedule — Tag-Driven CRM" }] }),
});
