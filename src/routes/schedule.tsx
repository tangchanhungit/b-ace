import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { PageHeader } from "@/components/app-shell";
import { useStore, eventActions } from "@/lib/store";
import { fmtDateTime } from "@/lib/format";

export const Route = createFileRoute("/schedule")({
  component: SchedulePage,
  head: () => ({ meta: [{ title: "Schedule — Tag-Driven CRM" }] }),
});

function SchedulePage() {
  const events = useStore((s) => s.events);
  const leads = useStore((s) => s.leads);
  const opps = useStore((s) => s.opportunities);
  const tickets = useStore((s) => s.tickets);

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", when: new Date().toISOString().slice(0, 16), entityType: "" as "" | "lead" | "opportunity" | "ticket", entityId: "" });

  const sorted = [...events].sort((a, b) => new Date(a.when).getTime() - new Date(b.when).getTime());

  const submit = () => {
    if (!form.title.trim()) return toast.error("Title required");
    eventActions.create({
      title: form.title.trim(),
      when: new Date(form.when).toISOString(),
      entityType: form.entityType || undefined,
      entityId: form.entityId || undefined,
    });
    toast.success("Event created");
    setOpen(false); setForm({ title: "", when: new Date().toISOString().slice(0, 16), entityType: "", entityId: "" });
  };

  const options = form.entityType === "lead" ? leads.map((l) => ({ id: l.id, label: l.name }))
    : form.entityType === "opportunity" ? opps.map((o) => ({ id: o.id, label: o.name }))
    : form.entityType === "ticket" ? tickets.map((t) => ({ id: t.id, label: t.subject }))
    : [];

  return (
    <>
      <PageHeader
        title="Schedule"
        description={`${events.length} upcoming events`}
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button className="gap-2"><Plus className="h-4 w-4" /> New Event</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Create Event</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div><Label>Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
                <div><Label>When</Label><Input type="datetime-local" value={form.when} onChange={(e) => setForm({ ...form, when: e.target.value })} /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Linked to</Label>
                    <Select value={form.entityType} onValueChange={(v) => setForm({ ...form, entityType: v as any, entityId: "" })}>
                      <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="lead">Lead</SelectItem>
                        <SelectItem value="opportunity">Opportunity</SelectItem>
                        <SelectItem value="ticket">Ticket</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div><Label>Record</Label>
                    <Select value={form.entityId} onValueChange={(v) => setForm({ ...form, entityId: v })} disabled={!form.entityType}>
                      <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                      <SelectContent>{options.map((o) => <SelectItem key={o.id} value={o.id}>{o.label}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <DialogFooter><Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={submit}>Create</Button></DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />
      <div className="mx-auto max-w-7xl px-6 py-6">
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-sm">Upcoming</CardTitle></CardHeader>
          <CardContent className="divide-y">
            {sorted.length === 0 && <p className="text-sm text-muted-foreground py-4 text-center">No events.</p>}
            {sorted.map((e) => {
              const href =
                e.entityType === "lead" ? { to: "/leads/$leadId", params: { leadId: e.entityId! } } :
                e.entityType === "opportunity" ? { to: "/opportunities/$oppId", params: { oppId: e.entityId! } } :
                e.entityType === "ticket" ? { to: "/tickets/$ticketId", params: { ticketId: e.entityId! } } : null;
              return (
                <div key={e.id} className="flex items-center justify-between gap-3 py-3">
                  <div>
                    <div className="text-sm font-medium">{e.title}</div>
                    <div className="text-xs text-muted-foreground">{fmtDateTime(e.when)}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    {e.entityType && <Badge variant="outline">{e.entityType}</Badge>}
                    {href && <Link to={href.to as any} params={href.params as any} className="text-xs text-primary">Open</Link>}
                    <Button variant="ghost" size="icon" onClick={() => eventActions.remove(e.id)}><Trash2 className="h-4 w-4 text-muted-foreground" /></Button>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
