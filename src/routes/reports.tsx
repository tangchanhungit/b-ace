import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/app-shell";
import { useStore, stockOf } from "@/lib/store";
import { fmtVND } from "@/lib/format";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

export const Route = createFileRoute("/reports")({
  component: ReportsPage,
  head: () => ({ meta: [{ title: "Reports — Tag-Driven CRM" }] }),
});

const SOURCE_TAGS = ["facebook", "tiktok", "website", "zalo", "other"];
const COLORS = ["#3b82f6", "#ec4899", "#10b981", "#f59e0b", "#8b5cf6"];

function ReportsPage() {
  const leads = useStore((s) => s.leads);
  const opps = useStore((s) => s.opportunities);
  const tickets = useStore((s) => s.tickets);
  const products = useStore((s) => s.products);

  const leadsBySource = SOURCE_TAGS.map((t) => ({ name: t, value: leads.filter((l) => l.tags.includes(t)).length }));
  const revenueData = [
    { name: "Won", value: opps.filter((o) => o.status === "won").reduce((s, o) => s + o.value, 0) },
    { name: "Open", value: opps.filter((o) => o.status === "open").reduce((s, o) => s + o.value, 0) },
    { name: "Lost", value: opps.filter((o) => o.status === "lost").reduce((s, o) => s + o.value, 0) },
  ];
  const ticketByStatus = ["open", "in_progress", "resolved", "closed"].map((s) => ({ name: s, value: tickets.filter((t) => t.status === s).length }));
  const inventory = products.filter((p) => p.trackInventory).map((p) => ({ name: p.name, stock: stockOf(p.id) }));

  return (
    <>
      <PageHeader title="Reports" description="Pipeline, tickets and inventory at a glance." />
      <div className="mx-auto max-w-7xl px-6 py-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-sm">Leads by source (tags)</CardTitle></CardHeader>
          <CardContent style={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={leadsBySource} dataKey="value" nameKey="name" outerRadius={90} label>
                  {leadsBySource.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-sm">Revenue (opportunities)</CardTitle></CardHeader>
          <CardContent style={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData}>
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(v) => `${(v / 1_000_000).toFixed(0)}M`} />
                <Tooltip formatter={(v: number) => fmtVND(v)} />
                <Bar dataKey="value" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-sm">Tickets by status</CardTitle></CardHeader>
          <CardContent style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ticketByStatus}>
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-sm">Inventory on hand</CardTitle></CardHeader>
          <CardContent style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={inventory} layout="vertical">
                <XAxis type="number" allowDecimals={false} />
                <YAxis type="category" dataKey="name" width={140} />
                <Tooltip />
                <Bar dataKey="stock" fill="#f59e0b" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
