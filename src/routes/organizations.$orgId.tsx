import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Building2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { PageHeader } from "@/components/app-shell";
import { useStore, orgActions, contactActions } from "@/lib/store";
import { fmtVND, fmtDate } from "@/lib/format";

export const Route = createFileRoute("/organizations/$orgId")({
  component: OrgDetail,
  head: ({ params }) => ({ meta: [{ title: `Org ${params.orgId}` }] }),
});

function OrgDetail() {
  const { orgId } = Route.useParams();
  const org = useStore((s) => s.organizations.find((o) => o.id === orgId));
  const contacts = useStore((s) => s.contacts.filter((c) => c.orgId === orgId));
  const opportunities = useStore((s) => s.opportunities.filter((o) => o.orgId === orgId));
  const tickets = useStore((s) => s.tickets.filter((t) => t.orgId === orgId));
  const quotes = useStore((s) => s.quotes);
  const [newContact, setNewContact] = useState({ name: "", email: "", phone: "", jobTitle: "" });

  if (!org) return <div className="p-8">Organization not found. <Link className="underline" to="/organizations">Back</Link></div>;

  const addContact = () => {
    if (!newContact.name.trim()) return toast.error("Name required");
    contactActions.create({ ...newContact, orgId });
    toast.success("Contact added");
    setNewContact({ name: "", email: "", phone: "", jobTitle: "" });
  };

  return (
    <>
      <PageHeader
        title={org.name}
        breadcrumb={<><Link to="/organizations" className="hover:text-foreground">Organizations</Link> / {org.id}</>}
        description={org.industry ?? "—"}
      />
      <div className="mx-auto max-w-7xl px-6 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3"><CardTitle className="text-sm">Details</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <Field label="Name"><Input value={org.name} onChange={(e) => orgActions.update(org.id, { name: e.target.value })} /></Field>
            <Field label="Industry"><Input value={org.industry ?? ""} onChange={(e) => orgActions.update(org.id, { industry: e.target.value })} /></Field>
            <Field label="Tax code"><Input value={org.taxCode ?? ""} onChange={(e) => orgActions.update(org.id, { taxCode: e.target.value })} /></Field>
            <Field label="Phone"><Input value={org.phone ?? ""} onChange={(e) => orgActions.update(org.id, { phone: e.target.value })} /></Field>
            <Field label="Website"><Input value={org.website ?? ""} onChange={(e) => orgActions.update(org.id, { website: e.target.value })} /></Field>
            <Field label="Address"><Input value={org.address ?? ""} onChange={(e) => orgActions.update(org.id, { address: e.target.value })} /></Field>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><Building2 className="h-4 w-4" /> Contacts ({contacts.length})</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {contacts.length === 0 && <p className="text-xs text-muted-foreground">No contacts yet.</p>}
            {contacts.map((c) => (
              <div key={c.id} className="text-sm border-b pb-2 last:border-0">
                <div className="font-medium">{c.name}</div>
                <div className="text-xs text-muted-foreground">{c.jobTitle ?? "—"} · {c.email ?? c.phone ?? ""}</div>
              </div>
            ))}
            <div className="grid grid-cols-2 gap-2 pt-2">
              <Input placeholder="Name" value={newContact.name} onChange={(e) => setNewContact({ ...newContact, name: e.target.value })} />
              <Input placeholder="Job title" value={newContact.jobTitle} onChange={(e) => setNewContact({ ...newContact, jobTitle: e.target.value })} />
              <Input placeholder="Email" value={newContact.email} onChange={(e) => setNewContact({ ...newContact, email: e.target.value })} />
              <Input placeholder="Phone" value={newContact.phone} onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })} />
            </div>
            <Button size="sm" className="w-full" onClick={addContact}>Add contact</Button>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="pb-3"><CardTitle className="text-sm">Opportunities ({opportunities.length})</CardTitle></CardHeader>
          <CardContent className="divide-y">
            {opportunities.length === 0 && <p className="text-xs text-muted-foreground">No opportunities.</p>}
            {opportunities.map((o) => (
              <Link key={o.id} to="/opportunities/$oppId" params={{ oppId: o.id }} className="flex justify-between items-center py-2 hover:bg-muted/40 -mx-2 px-2 rounded">
                <div>
                  <div className="text-sm font-medium">{o.name}</div>
                  <div className="text-xs text-muted-foreground">Close {fmtDate(o.closeDate)} · {o.owner}</div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{o.status}</Badge>
                  <span className="text-sm tabular-nums">{fmtVND(o.value)}</span>
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-sm">Tickets ({tickets.length})</CardTitle></CardHeader>
          <CardContent className="divide-y">
            {tickets.length === 0 && <p className="text-xs text-muted-foreground">No tickets.</p>}
            {tickets.map((t) => (
              <Link key={t.id} to="/tickets/$ticketId" params={{ ticketId: t.id }} className="flex justify-between items-center py-2 hover:bg-muted/40 -mx-2 px-2 rounded text-sm">
                <span className="truncate">{t.subject}</span>
                <Badge variant="outline">{t.status}</Badge>
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader className="pb-3"><CardTitle className="text-sm">Quotes ({quotes.filter(q => opportunities.some(o => o.id === q.oppId)).length})</CardTitle></CardHeader>
          <CardContent className="divide-y">
            {quotes.filter(q => opportunities.some(o => o.id === q.oppId)).map((q) => (
              <Link key={q.id} to="/quotes/$quoteId" params={{ quoteId: q.id }} className="flex justify-between items-center py-2 hover:bg-muted/40 -mx-2 px-2 rounded text-sm">
                <span>{q.id} · {q.lines.length} items</span>
                <Badge variant="outline">{q.status}</Badge>
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1.5"><Label className="text-xs">{label}</Label>{children}</div>;
}
