import { createFileRoute, Link } from "@tanstack/react-router";
import { Activity as ActIcon, PhoneCall, StickyNote, CalendarDays, CheckSquare, MessageCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/app-shell";
import { useStore } from "@/lib/store";
import { fmtDateTime } from "@/lib/format";

export const Route = createFileRoute("/activities")({
  component: ActivitiesPage,
  head: () => ({ meta: [{ title: "Activities — Tag-Driven CRM" }] }),
});

type Item = { id: string; when: string; title: string; type: string; href?: { to: string; params?: any } };

function ActivitiesPage() {
  const leads = useStore((s) => s.leads);
  const tickets = useStore((s) => s.tickets);
  const opps = useStore((s) => s.opportunities);

  const items: Item[] = [];
  leads.forEach((l) => l.activities.forEach((a) => items.push({ id: a.id, when: a.created_at, title: `${l.name}: ${a.content}`, type: a.type, href: { to: "/leads/$leadId", params: { leadId: l.id } } })));
  tickets.forEach((t) => {
    items.push({ id: `${t.id}-c`, when: t.createdAt, title: `Ticket opened: ${t.subject}`, type: "ticket", href: { to: "/tickets/$ticketId", params: { ticketId: t.id } } });
    t.replies.forEach((r) => items.push({ id: r.id, when: r.createdAt, title: `${t.subject}: ${r.content}`, type: r.kind, href: { to: "/tickets/$ticketId", params: { ticketId: t.id } } }));
  });
  opps.forEach((o) => items.push({ id: o.id, when: o.createdAt, title: `Opportunity created: ${o.name}`, type: "opportunity", href: { to: "/opportunities/$oppId", params: { oppId: o.id } } }));
  items.sort((a, b) => new Date(b.when).getTime() - new Date(a.when).getTime());

  const icon = (t: string) =>
    t === "call" ? <PhoneCall className="h-4 w-4" /> :
    t === "meeting" ? <CalendarDays className="h-4 w-4" /> :
    t === "task" ? <CheckSquare className="h-4 w-4" /> :
    t === "ticket" || t === "reply" ? <MessageCircle className="h-4 w-4" /> :
    t === "opportunity" ? <ActIcon className="h-4 w-4" /> :
    <StickyNote className="h-4 w-4" />;

  return (
    <>
      <PageHeader title="Activities" description={`${items.length} events across Leads, Opportunities and Tickets`} />
      <div className="mx-auto max-w-7xl px-6 py-6">
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-sm">Recent activity</CardTitle></CardHeader>
          <CardContent>
            <ol className="relative border-l border-border ml-3 space-y-4">
              {items.slice(0, 100).map((a) => (
                <li key={a.id} className="ml-6">
                  <span className="absolute -left-3 flex h-6 w-6 items-center justify-center rounded-full ring-4 ring-card bg-muted text-muted-foreground">{icon(a.type)}</span>
                  <div className="flex items-center gap-2 mb-1 text-xs text-muted-foreground">
                    <span className="uppercase">{a.type}</span> · {fmtDateTime(a.when)}
                  </div>
                  {a.href ? <Link to={a.href.to as any} params={a.href.params} className="text-sm hover:underline">{a.title}</Link> : <p className="text-sm">{a.title}</p>}
                </li>
              ))}
              {items.length === 0 && <p className="text-sm text-muted-foreground">No activities yet.</p>}
            </ol>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
