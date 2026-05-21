import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { FileText, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { PageHeader } from "@/components/app-shell";
import { useStore, opportunityActions, quoteActions } from "@/lib/store";
import { fmtVND, fmtDate, OWNERS } from "@/lib/format";

export const Route = createFileRoute("/opportunities/$oppId")({
  component: OppDetail,
  head: ({ params }) => ({ meta: [{ title: `Opp ${params.oppId}` }] }),
});

function OppDetail() {
  const { oppId } = Route.useParams();
  const navigate = useNavigate();
  const opp = useStore((s) => s.opportunities.find((o) => o.id === oppId));
  const orgs = useStore((s) => s.organizations);
  const contacts = useStore((s) => s.contacts);
  const lead = useStore((s) => s.leads.find((l) => l.id === opp?.leadId));
  const quotes = useStore((s) => s.quotes.filter((q) => q.oppId === oppId));
  const orders = useStore((s) => s.orders.filter((o) => o.oppId === oppId));
  const contracts = useStore((s) => s.serviceContracts.filter((c) => c.oppId === oppId));

  if (!opp) return <div className="p-8">Not found. <Link to="/opportunities" className="underline">Back</Link></div>;

  const createQuote = () => {
    if (opp.status !== "won") return toast.error("Mark as Won before creating a quote.");
    const q = quoteActions.create({ oppId: opp.id, lines: [] });
    toast.success("Quote created");
    navigate({ to: "/quotes/$quoteId", params: { quoteId: q.id } });
  };

  return (
    <>
      <PageHeader
        title={opp.name}
        breadcrumb={<><Link to="/opportunities" className="hover:text-foreground">Opportunities</Link> / {opp.id}</>}
        description={`${fmtVND(opp.value)} · close ${fmtDate(opp.closeDate)}`}
        actions={
          <>
            {opp.status === "open" && <>
              <Button variant="outline" onClick={() => { opportunityActions.setStatus(opp.id, "lost"); toast.success("Marked lost"); }}>Mark Lost</Button>
              <Button onClick={() => { opportunityActions.setStatus(opp.id, "won"); toast.success("Marked won — you can now create a quote"); }}>Mark Won</Button>
            </>}
            <Button className="gap-2" onClick={createQuote} disabled={opp.status !== "won"}>
              <FileText className="h-4 w-4" /> Create Quote
            </Button>
          </>
        }
      />
      <div className="mx-auto max-w-7xl px-6 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {lead && (
          <Card className="lg:col-span-3">
            <CardContent className="p-4 flex items-center justify-between flex-wrap gap-3">
              <div className="text-sm">
                <span className="text-muted-foreground">Linked Lead:</span>{" "}
                <Link to="/leads/$leadId" params={{ leadId: lead.id }} className="font-medium hover:underline">{lead.name}</Link>
                <span className="text-muted-foreground"> · {lead.phone}</span>
              </div>
              <Link to="/leads/$leadId" params={{ leadId: lead.id }} className="text-xs text-primary hover:underline">Open lead →</Link>
            </CardContent>
          </Card>
        )}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3"><CardTitle className="text-sm">Details</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <F label="Name"><Input value={opp.name} onChange={(e) => opportunityActions.update(opp.id, { name: e.target.value })} /></F>
            <F label="Value"><Input type="number" value={opp.value} onChange={(e) => opportunityActions.update(opp.id, { value: Number(e.target.value) || 0 })} /></F>
            <F label="Organization">
              <Select value={opp.orgId ?? ""} onValueChange={(v) => opportunityActions.update(opp.id, { orgId: v })}>
                <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                <SelectContent>{orgs.map((o) => <SelectItem key={o.id} value={o.id}>{o.name}</SelectItem>)}</SelectContent>
              </Select>
            </F>
            <F label="Contact">
              <Select value={opp.contactId ?? ""} onValueChange={(v) => opportunityActions.update(opp.id, { contactId: v })}>
                <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                <SelectContent>{contacts.filter(c => !opp.orgId || c.orgId === opp.orgId).map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
              </Select>
            </F>
            <F label="Owner">
              <Select value={opp.owner} onValueChange={(v) => opportunityActions.update(opp.id, { owner: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{OWNERS.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
              </Select>
            </F>
            <F label="Close date"><Input type="date" value={opp.closeDate.slice(0, 10)} onChange={(e) => opportunityActions.update(opp.id, { closeDate: new Date(e.target.value).toISOString() })} /></F>
            <F label="Status">
              <Badge variant="outline">{opp.status}</Badge>
            </F>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-sm">Quotes</CardTitle></CardHeader>
          <CardContent className="divide-y">
            {quotes.length === 0 && <p className="text-xs text-muted-foreground">No quotes.</p>}
            {quotes.map((q) => (
              <Link key={q.id} to="/quotes/$quoteId" params={{ quoteId: q.id }} className="flex justify-between items-center py-2 hover:bg-muted/40 -mx-2 px-2 rounded text-sm">
                <span>{q.id}</span>
                <Badge variant="outline">{q.status}</Badge>
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader className="pb-3"><CardTitle className="text-sm">Sales Orders</CardTitle></CardHeader>
          <CardContent className="divide-y">
            {orders.length === 0 && <p className="text-xs text-muted-foreground">No orders.</p>}
            {orders.map((o) => (
              <Link key={o.id} to="/sales-orders/$orderId" params={{ orderId: o.id }} className="flex justify-between items-center py-2 hover:bg-muted/40 -mx-2 px-2 rounded text-sm">
                <span>{o.id}</span>
                <Badge variant="outline">{o.status}</Badge>
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>
    </>
  );
}

function F({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1.5"><Label className="text-xs">{label}</Label>{children}</div>;
}
