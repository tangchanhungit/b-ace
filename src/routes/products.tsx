import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "@/components/app-shell";

export const Route = createFileRoute("/products")({
  component: () => <PlaceholderPage title="Products & Services" description="Catalog of items and pricing." />,
  head: () => ({ meta: [{ title: "Products & Services — Tag-Driven CRM" }] }),
});
