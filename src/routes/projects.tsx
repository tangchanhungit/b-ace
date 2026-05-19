import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "@/components/app-shell";

export const Route = createFileRoute("/projects")({
  component: () => <PlaceholderPage title="Projects" description="Internal and client projects." />,
  head: () => ({ meta: [{ title: "Projects — Tag-Driven CRM" }] }),
});
