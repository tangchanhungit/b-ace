import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "@/components/app-shell";

export const Route = createFileRoute("/contacts")({
  component: () => <PlaceholderPage title="Contacts" description="All individual contacts across accounts." />,
  head: () => ({ meta: [{ title: "Contacts — Tag-Driven CRM" }] }),
});
