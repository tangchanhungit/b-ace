import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { MessageCircle, StickyNote } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { PageHeader } from "@/components/app-shell";
import { useStore, ticketActions } from "@/lib/store";
import type { TicketStatus, TicketPriority } from "@/lib/types";
import { fmtDateTime, OWNERS } from "@/lib/format";

export const Route = createFileRoute("/tickets/$ticketId")({
  component: TicketDetail,
  head: ({ params }) => ({ meta: [{ title: `Ticket ${params.ticketId}` }] }),
});

const STATUSES: TicketStatus[] = ["open", "in_progress", "resolved", "closed"];
const PRIORITIES: TicketPriority[] = ["low", "normal", "high", "urgent"];

function TicketDetail() {
  const { ticketId } = Route.useParams();
  const ticket = useStore((s) => s.tickets.find((t) => t.id === ticketId));
  const orgs = useStore((s) => s.organizations);
  const contacts = useStore((s) => s.contacts);
  const [composer, setComposer] = useState("");

  if (!ticket) return <div className="p-8">Not found. <Link to="/tickets" className="underline">Back</Link></div>;
  const org = orgs.find((o) => o.id === ticket.orgId);
  const contact = contacts.find((c) => c.id === ticket.contactId);

  const send = (kind: "reply" | "note") => {
    if (!composer.trim()) return;
    ticketActions.addReply(ticket.id, composer.trim(), kind);
    setComposer("");
    toast.success(kind === "reply" ? "Reply sent" : "Note added");
  };

  return (
    <>
      <PageHeader
        title={ticket.subject}
        breadcrumb={<><Link to="/tickets" className="hover:text-foreground">Tickets</Link> / {ticket.id}</>}
        description={`${org?.name ?? "—"} · ${contact?.name ?? "—"}`}
        actions={
          <>
            <Select value={ticket.priority} onValueChange={(v) => ticketActions.update(ticket.id, { priority: v as TicketPriority })}>
              <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
              <SelectContent>{PRIORITIES.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={ticket.status} onValueChange={(v) => { ticketActions.setStatus(ticket.id, v as TicketStatus); toast.success(`Status: ${v}`); }}>
              <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
              <SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={ticket.owner} onValueChange={(v) => ticketActions.update(ticket.id, { owner: v })}>
              <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
              <SelectContent>{OWNERS.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
            </Select>
          </>
        }
      />
      <div className="mx-auto max-w-7xl px-6 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm">Description</CardTitle></CardHeader>
            <CardContent><p className="text-sm">{ticket.description ?? <span className="text-muted-foreground">No description.</span>}</p></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm">Conversation</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <Textarea rows={3} value={composer} onChange={(e) => setComposer(e.target.value)} placeholder="Reply or add internal note…" />
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="gap-2" onClick={() => send("note")}><StickyNote className="h-3.5 w-3.5" /> Add Note</Button>
                <Button size="sm" className="gap-2 ml-auto" onClick={() => send("reply")}><MessageCircle className="h-3.5 w-3.5" /> Send Reply</Button>
              </div>
              <ol className="space-y-3 pt-2">
                {ticket.replies.length === 0 && <p className="text-xs text-muted-foreground">No messages yet.</p>}
                {[...ticket.replies].reverse().map((r) => (
                  <li key={r.id} className={`rounded-md border p-3 ${r.kind === "note" ? "bg-amber-50/40 border-amber-200 dark:bg-amber-950/10" : "bg-card"}`}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-medium">{r.author}</span>
                      <span className="text-muted-foreground">{fmtDateTime(r.createdAt)} · {r.kind}</span>
                    </div>
                    <p className="text-sm">{r.content}</p>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        </div>
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-sm">Info</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <Row label="Status"><Badge variant="outline">{ticket.status}</Badge></Row>
            <Row label="Priority"><Badge variant="outline">{ticket.priority}</Badge></Row>
            <Row label="Owner">{ticket.owner}</Row>
            <Row label="Organization">{org ? <Link to="/organizations/$orgId" params={{ orgId: org.id }} className="text-primary">{org.name}</Link> : "—"}</Row>
            <Row label="Contact">{contact?.name ?? "—"}</Row>
            <Row label="Created">{fmtDateTime(ticket.createdAt)}</Row>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="flex justify-between gap-3"><span className="text-muted-foreground">{label}</span><span>{children}</span></div>;
}
