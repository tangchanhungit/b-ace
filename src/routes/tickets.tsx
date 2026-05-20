import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { PageHeader } from "@/components/app-shell";
import { useStore, ticketActions } from "@/lib/store";
import type { TicketPriority } from "@/lib/types";
import { fmtDate, OWNERS } from "@/lib/format";

export const Route = createFileRoute("/tickets")({
  component: TicketsPage,
  head: () => ({ meta: [{ title: "Tickets — Tag-Driven CRM" }] }),
});

const PRIORITIES: TicketPriority[] = ["low", "normal", "high", "urgent"];

function TicketsPage() {
  const tickets = useStore((s) => s.tickets);
  const orgs = useStore((s) => s.organizations);
  const contacts = useStore((s) => s.contacts);
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ subject: "", description: "", orgId: "", contactId: "", priority: "normal" as TicketPriority, owner: "Linh" });

  const submit = () => {
    if (!form.subject.trim()) return toast.error("Subject required");
    const t = ticketActions.create({ ...form, subject: form.subject.trim() });
    toast.success(`Ticket created${t.priority === "urgent" ? ` — auto-assigned to ${t.owner}` : ""}`);
    setOpen(false); setForm({ subject: "", description: "", orgId: "", contactId: "", priority: "normal", owner: "Linh" });
  };

  const sColor = (s: string) => s === "open" ? "bg-blue-100 text-blue-700 border-blue-200" : s === "in_progress" ? "bg-amber-100 text-amber-800 border-amber-200" : s === "resolved" ? "bg-emerald-100 text-emerald-700 border-emerald-200" : "bg-slate-100 text-slate-700 border-slate-200";
  const pColor = (p: string) => p === "urgent" ? "bg-destructive text-destructive-foreground" : p === "high" ? "bg-rose-100 text-rose-700 border-rose-200" : "bg-muted text-muted-foreground";

  return (
    <>
      <PageHeader
        title="Tickets"
        description={`${tickets.length} tickets`}
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button className="gap-2"><Plus className="h-4 w-4" /> New Ticket</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Create Ticket</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div><Label>Subject *</Label><Input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} /></div>
                <div><Label>Description</Label><Textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Organization</Label>
                    <Select value={form.orgId} onValueChange={(v) => setForm({ ...form, orgId: v })}>
                      <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                      <SelectContent>{orgs.map((o) => <SelectItem key={o.id} value={o.id}>{o.name}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div><Label>Contact</Label>
                    <Select value={form.contactId} onValueChange={(v) => setForm({ ...form, contactId: v })}>
                      <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                      <SelectContent>{contacts.filter((c) => !form.orgId || c.orgId === form.orgId).map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div><Label>Priority</Label>
                    <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v as TicketPriority })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{PRIORITIES.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div><Label>Owner</Label>
                    <Select value={form.owner} onValueChange={(v) => setForm({ ...form, owner: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{OWNERS.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
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
        <div className="rounded-xl border bg-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead className="pl-4">Subject</TableHead>
                <TableHead>Org</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tickets.length === 0 && <TableRow><TableCell colSpan={7} className="text-center py-12 text-sm text-muted-foreground">No tickets.</TableCell></TableRow>}
              {tickets.map((t) => {
                const o = orgs.find((x) => x.id === t.orgId);
                return (
                  <TableRow key={t.id} className="cursor-pointer" onClick={() => navigate({ to: "/tickets/$ticketId", params: { ticketId: t.id } })}>
                    <TableCell className="pl-4 font-medium">{t.subject}</TableCell>
                    <TableCell className="text-sm">{o?.name ?? "—"}</TableCell>
                    <TableCell><Badge variant="outline" className={pColor(t.priority)}>{t.priority}</Badge></TableCell>
                    <TableCell><Badge variant="outline" className={sColor(t.status)}>{t.status}</Badge></TableCell>
                    <TableCell className="text-sm">{t.owner}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{fmtDate(t.createdAt)}</TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="icon" onClick={() => { ticketActions.remove(t.id); toast.success("Deleted"); }}>
                        <Trash2 className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </>
  );
}
