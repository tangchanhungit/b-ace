import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { PageHeader } from "@/components/app-shell";
import { useStore, opportunityActions } from "@/lib/store";
import { fmtVND, fmtDate, OWNERS } from "@/lib/format";

export const Route = createFileRoute("/opportunities")({
  component: OpportunitiesPage,
  head: () => ({ meta: [{ title: "Opportunities — Tag-Driven CRM" }] }),
});

function OpportunitiesPage() {
  const opps = useStore((s) => s.opportunities);
  const orgs = useStore((s) => s.organizations);
  const contacts = useStore((s) => s.contacts);
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", orgId: "", contactId: "", value: 0, owner: "Linh", closeDate: new Date().toISOString().slice(0, 10) });

  const submit = () => {
    if (!form.name.trim()) return toast.error("Name required");
    const o = opportunityActions.create({ ...form, name: form.name.trim(), closeDate: new Date(form.closeDate).toISOString(), value: Number(form.value) || 0 });
    toast.success("Opportunity created");
    setOpen(false);
    navigate({ to: "/opportunities/$oppId", params: { oppId: o.id } });
  };

  const statusColor = (s: string) =>
    s === "won" ? "bg-emerald-100 text-emerald-700 border-emerald-200" :
    s === "lost" ? "bg-rose-100 text-rose-700 border-rose-200" :
    "bg-blue-100 text-blue-700 border-blue-200";

  return (
    <>
      <PageHeader
        title="Opportunities"
        description={`${opps.length} opportunities · Pipeline ${fmtVND(opps.filter(o => o.status === "open").reduce((s, o) => s + o.value, 0))}`}
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button className="gap-2"><Plus className="h-4 w-4" /> New Opportunity</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Create Opportunity</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div><Label>Name *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
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
                  <div><Label>Value (VND)</Label><Input type="number" value={form.value} onChange={(e) => setForm({ ...form, value: Number(e.target.value) })} /></div>
                  <div><Label>Close date</Label><Input type="date" value={form.closeDate} onChange={(e) => setForm({ ...form, closeDate: e.target.value })} /></div>
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
                <TableHead className="pl-4">Name</TableHead>
                <TableHead>Organization</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Close date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Value</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {opps.length === 0 && <TableRow><TableCell colSpan={7} className="text-center py-12 text-sm text-muted-foreground">No opportunities.</TableCell></TableRow>}
              {opps.map((o) => {
                const org = orgs.find((x) => x.id === o.orgId);
                return (
                  <TableRow key={o.id} className="cursor-pointer" onClick={() => navigate({ to: "/opportunities/$oppId", params: { oppId: o.id } })}>
                    <TableCell className="pl-4 font-medium">{o.name}</TableCell>
                    <TableCell className="text-sm">{org?.name ?? "—"}</TableCell>
                    <TableCell className="text-sm">{o.owner}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{fmtDate(o.closeDate)}</TableCell>
                    <TableCell><Badge variant="outline" className={statusColor(o.status)}>{o.status}</Badge></TableCell>
                    <TableCell className="text-right tabular-nums">{fmtVND(o.value)}</TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="icon" onClick={() => { opportunityActions.remove(o.id); toast.success("Deleted"); }}>
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
