import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Plus, Tags } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/60 backdrop-blur">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="rounded-md bg-primary/10 p-1.5"><Tags className="h-4 w-4 text-primary" /></div>
            <h1 className="text-base font-semibold">Tag-Driven CRM — Leads</h1>
          </div>
          <Link to="/leads/create">
            <Button className="gap-2"><Plus className="h-4 w-4" /> Create Lead</Button>
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-6 py-16 text-center">
        <h2 className="text-2xl font-semibold">Lead List</h2>
        <p className="text-sm text-muted-foreground mt-2">Bấm <span className="font-medium text-foreground">Create Lead</span> để tạo lead mới theo logic tag.</p>
      </main>
    </div>
  );
}
