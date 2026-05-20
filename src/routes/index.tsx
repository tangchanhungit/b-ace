import { createFileRoute, Link } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Plus, Flame, AlertTriangle, ArrowUpRight } from "lucide-react";
import { PageHeader } from "@/components/app-shell";
import { useStore } from "@/lib/store";
import { derive } from "@/lib/leads-logic";

export const Route = createFileRoute("/")({
  component: Dashboard,
  head: () => ({ meta: [{ title: "Dashboard — Tag-Driven CRM" }] }),
});

function Dashboard() {
  const leads = useStore((s) => s.leads);
  const total = leads.length;
  const derived = leads.map((l) => ({ l, d: derive(l) }));
  const high = derived.filter((x) => x.d.high).length;
  const stale = derived.filter((x) => x.d.stale).length;
  const gold = derived.filter((x) => x.d.tier === "Gold").length;
  const fmt = (n: number) => new Intl.NumberFormat("vi-VN").format(n);
  const totalValue = leads.reduce((s, l) => s + l.value, 0);

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Tag-driven CRM overview · pipeline computed from tags in real time."
        actions={
          <>
            <Link to="/leads"><Button variant="outline" className="gap-2"><Users className="h-4 w-4" /> All Leads</Button></Link>
            <Link to="/leads/create"><Button className="gap-2"><Plus className="h-4 w-4" /> Create Lead</Button></Link>
          </>
        }
      />
      <div className="mx-auto max-w-7xl px-6 py-6 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Stat label="Total leads" value={fmt(total)} />
          <Stat label="Gold tier" value={fmt(gold)} accent="tier-gold-bg tier-gold-fg" />
          <Stat label="High priority" value={fmt(high)} icon={<Flame className="h-4 w-4 text-destructive" />} />
          <Stat label="Stale (>7d)" value={fmt(stale)} icon={<AlertTriangle className="h-4 w-4 text-destructive" />} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-sm">Pipeline value</CardTitle>
              <Link to="/leads" className="text-xs text-primary inline-flex items-center gap-1">Open <ArrowUpRight className="h-3 w-3" /></Link>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold tabular-nums">
                {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(totalValue)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Sum of all open lead values across the pipeline.</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm">Quick start</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              <Link to="/leads/create"><Button variant="outline" className="w-full justify-start gap-2"><Plus className="h-4 w-4" /> Create new lead</Button></Link>
              <Link to="/leads"><Button variant="outline" className="w-full justify-start gap-2"><Users className="h-4 w-4" /> Browse all leads</Button></Link>
              <div className="text-[11px] text-muted-foreground pt-2">Tip: tags drive Type, Stage, Tier, Priority and Stale flags automatically.</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-sm">Recent leads</CardTitle>
            <Link to="/leads" className="text-xs text-primary">View all</Link>
          </CardHeader>
          <CardContent className="divide-y">
            {derived.slice(0, 5).map(({ l, d }) => (
              <Link key={l.id} to="/leads/$leadId" params={{ leadId: l.id }} className="flex items-center justify-between gap-3 py-2.5 hover:bg-muted/40 -mx-2 px-2 rounded-md">
                <div className="min-w-0">
                  <div className="text-sm font-medium truncate">{l.name}</div>
                  <div className="text-xs text-muted-foreground">{l.phone} · {l.owner}</div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900">{d.type}</Badge>
                  <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-900">{d.stage}</Badge>
                  {d.high && <Badge className="bg-destructive text-destructive-foreground gap-1"><Flame className="h-3 w-3" /> HIGH</Badge>}
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>
    </>
  );
}

function Stat({ label, value, icon, accent }: { label: string; value: string; icon?: React.ReactNode; accent?: string }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="text-xs text-muted-foreground">{label}</div>
          {icon}
        </div>
        <div className={`mt-2 inline-flex items-center rounded-md px-2 py-1 text-2xl font-semibold tabular-nums ${accent ?? ""}`}>{value}</div>
      </CardContent>
    </Card>
  );
}
