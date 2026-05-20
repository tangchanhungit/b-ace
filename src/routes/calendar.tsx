import { createFileRoute, Link } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/app-shell";
import { useStore } from "@/lib/store";
import { fmtDateTime } from "@/lib/format";

export const Route = createFileRoute("/calendar")({
  component: CalendarPage,
  head: () => ({ meta: [{ title: "Calendar — Tag-Driven CRM" }] }),
});

function CalendarPage() {
  const events = useStore((s) => s.events);
  const sorted = [...events].sort((a, b) => new Date(a.when).getTime() - new Date(b.when).getTime());
  const groups: Record<string, typeof sorted> = {};
  for (const e of sorted) {
    const k = new Date(e.when).toLocaleDateString("vi-VN", { weekday: "long", day: "2-digit", month: "long", year: "numeric" });
    (groups[k] ||= []).push(e);
  }

  return (
    <>
      <PageHeader title="Calendar" description={`${events.length} scheduled events`} />
      <div className="mx-auto max-w-7xl px-6 py-6 space-y-4">
        {Object.entries(groups).length === 0 && <p className="text-sm text-muted-foreground">No events. Add some on the Schedule page.</p>}
        {Object.entries(groups).map(([day, items]) => (
          <Card key={day}>
            <CardHeader className="pb-3"><CardTitle className="text-sm">{day}</CardTitle></CardHeader>
            <CardContent className="divide-y">
              {items.map((e) => {
                const href =
                  e.entityType === "lead" ? { to: "/leads/$leadId", params: { leadId: e.entityId! } } :
                  e.entityType === "opportunity" ? { to: "/opportunities/$oppId", params: { oppId: e.entityId! } } :
                  e.entityType === "ticket" ? { to: "/tickets/$ticketId", params: { ticketId: e.entityId! } } : null;
                return (
                  <div key={e.id} className="flex items-center justify-between py-2">
                    <div>
                      <div className="text-sm font-medium">{e.title}</div>
                      <div className="text-xs text-muted-foreground">{fmtDateTime(e.when)}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      {e.entityType && <Badge variant="outline">{e.entityType}</Badge>}
                      {href && <Link to={href.to as any} params={href.params as any} className="text-xs text-primary">Open</Link>}
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
