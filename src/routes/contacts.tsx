import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Plus, Search, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { PageHeader } from "@/components/app-shell";
import { useStore, contactActions } from "@/lib/store";

export const Route = createFileRoute("/contacts")({
  component: ContactsPage,
  head: () => ({ meta: [{ title: "Contacts — Tag-Driven CRM" }] }),
});

function ContactsPage() {
  const contacts = useStore((s) => s.contacts);
  const orgs = useStore((s) => s.organizations);
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", jobTitle: "", orgId: "" });

  const rows = useMemo(() =>
    contacts.filter((c) => c.name.toLowerCase().includes(q.toLowerCase())),
    [contacts, q],
  );

  const submit = () => {
    if (!form.name.trim()) return toast.error("Name required");
    contactActions.create({ ...form, name: form.name.trim(), orgId: form.orgId || undefined });
    toast.success("Contact created");
    setOpen(false); setForm({ name: "", email: "", phone: "", jobTitle: "", orgId: "" });
  };

  return (
    <>
      <PageHeader
        title="Contacts"
        description={`${rows.length} of ${contacts.length}`}
        actions={
          <>
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search…" className="pl-8 w-64" />
            </div>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild><Button className="gap-2"><Plus className="h-4 w-4" /> New Contact</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Create Contact</DialogTitle></DialogHeader>
                <div className="space-y-3">
                  <div><Label>Name *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label>Email</Label><Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
                    <div><Label>Phone</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
                    <div><Label>Job title</Label><Input value={form.jobTitle} onChange={(e) => setForm({ ...form, jobTitle: e.target.value })} /></div>
                    <div>
                      <Label>Organization</Label>
                      <Select value={form.orgId} onValueChange={(v) => setForm({ ...form, orgId: v })}>
                        <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                        <SelectContent>{orgs.map((o) => <SelectItem key={o.id} value={o.id}>{o.name}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
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
                <TableHead>Job title</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Organization</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 && <TableRow><TableCell colSpan={6} className="text-center py-12 text-sm text-muted-foreground">No contacts.</TableCell></TableRow>}
              {rows.map((c) => {
                const o = orgs.find((x) => x.id === c.orgId);
                return (
                  <TableRow key={c.id}>
                    <TableCell className="pl-4 font-medium">{c.name}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{c.jobTitle ?? "—"}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{c.email ?? "—"}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{c.phone ?? "—"}</TableCell>
                    <TableCell className="text-sm">{o?.name ?? "—"}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={() => { contactActions.remove(c.id); toast.success("Deleted"); }}>
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
