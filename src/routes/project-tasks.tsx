import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "@/components/app-shell";

export const Route = createFileRoute("/project-tasks")({
  component: () => <PlaceholderPage title="Project Tasks" description="All tasks across active projects." />,
  head: () => ({ meta: [{ title: "Project Tasks — Tag-Driven CRM" }] }),
});
