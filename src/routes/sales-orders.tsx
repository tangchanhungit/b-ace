import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "@/components/app-shell";

export const Route = createFileRoute("/sales-orders")({
  component: () => <PlaceholderPage title="Sales Orders" description="Confirmed orders pending fulfillment." />,
  head: () => ({ meta: [{ title: "Sales Orders — Tag-Driven CRM" }] }),
});
