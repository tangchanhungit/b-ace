import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Plus, Search, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { PageHeader } from "@/components/app-shell";
import { useStore, orgActions } from "@/lib/store";

export const Route = createFileRoute("/organizations")({
  component: OrganizationsPage,
  head: () => ({ meta: [{ title: "Organizations — Tag-Driven CRM" }] }),
});

function OrganizationsPage() {
  const orgs = useStore((s) => s.organizations);
  const contacts = useStore((s) => s.contacts);
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", industry: "", taxCode: "", phone: "", website: "" });

  const rows = useMemo(() =>
    orgs.filter((o) => o.name.toLowerCase().includes(q.toLowerCase())),
    [orgs, q],
  );

  const submit = () => {
    if (!form.name.trim()) return toast.error("Name is required");
    const o = orgActions.create({ ...form, name: form.name.trim() });
    toast.success("Organization created", { description: o.name });
    setOpen(false); setForm({ name: "", industry: "", taxCode: "", phone: "", website: "" });
  };

  return (
    <>
      <PageHeader
        title="Organizations"
        description={`${rows.length} of ${orgs.length} accounts`}
        actions={
          <>
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search organizations…" className="pl-8 w-64" />
            </div>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild><Button className="gap-2"><Plus className="h-4 w-4" /> New Org</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Create Organization</DialogTitle></DialogHeader>
                <div className="space-y-3">
                  <div><Label>Name *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label>Industry</Label><Input value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })} /></div>
                    <div><Label>Tax code</Label><Input value={form.taxCode} onChange={(e) => setForm({ ...form, taxCode: e.target.value })} /></div>
                    <div><Label>Phone</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
                    <div><Label>Website</Label><Input value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} /></div>
                  </div>
                </div>
                <DialogFooter><Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={submit}>Create</Button></DialogFooter>
              </DialogContent>
            </Dialog>
          </>
        }
      />
      <div className="mx-auto max-w-7xl px-6 py-6">
        <div className="rounded-xl border bg-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead className="pl-4">Name</TableHead>
                <TableHead>Industry</TableHead>
                <TableHead>Tax code</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead className="text-right">Contacts</TableHead>
                <TableHead className="w-12 text-right pr-4"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 && <TableRow><TableCell colSpan={6} className="text-center py-12 text-sm text-muted-foreground">No organizations yet.</TableCell></TableRow>}
              {rows.map((o) => {
                const n = contacts.filter((c) => c.orgId === o.id).length;
                return (
                  <TableRow key={o.id} className="cursor-pointer" onClick={() => navigate({ to: "/organizations/$orgId", params: { orgId: o.id } })}>
                    <TableCell className="pl-4 font-medium">{o.name}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{o.industry ?? "—"}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{o.taxCode ?? "—"}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{o.phone ?? "—"}</TableCell>
                    <TableCell className="text-right tabular-nums">{n}</TableCell>
                    <TableCell className="text-right pr-4">
                      <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); orgActions.remove(o.id); toast.success("Deleted"); }}>
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
