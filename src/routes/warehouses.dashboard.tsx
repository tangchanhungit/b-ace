import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { PageHeader } from "@/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Warehouse as WarehouseIcon, Boxes, Clock, FileText, AlertTriangle, ArrowRight } from "lucide-react";
import { useWarehouseStore } from "@/lib/warehouse-store";

export const Route = createFileRoute("/warehouses/dashboard")({
  component: WarehousesDashboard,
  head: () => ({ meta: [{ title: "Dashboard kho — Tổng hợp đa kho | B-ACE" }] }),
});

function WarehousesDashboard() {
  const warehouses = useWarehouseStore((s) => s.warehouses);
  const data = useWarehouseStore((s) => s.data);

  const summary = useMemo(() => {
    let totalStock = 0, pendingQC = 0, pendingExport = 0, expiring = 0;
    const perWh = warehouses.map((w) => {
      const d = data[w.id] ?? { receipts: [], issues: [], stock: [] };
      const stock = d.stock.reduce((s, x) => s + x.qty, 0);
      const skus = new Set(d.stock.map((s) => s.sku)).size;
      const pQC = d.receipts.filter((r) => r.status === "pending_qc").length;
      const pEx = d.issues.filter((i) => i.status === "pending_approval").length;
      const exp = d.stock.filter((s) => {
        const days = (new Date(s.expiry).getTime() - Date.now()) / 86400000;
        return days < 90 && s.qty > 0;
      }).length;
      totalStock += stock; pendingQC += pQC; pendingExport += pEx; expiring += exp;
      return { w, stock, skus, pQC, pEx, exp };
    });
    return { perWh, totalStock, pendingQC, pendingExport, expiring };
  }, [warehouses, data]);

  return (
    <>
      <PageHeader
        title="Dashboard tất cả kho"
        description="Tổng hợp tồn kho, hàng chờ QC, phiếu xuất chờ duyệt và lô sắp hết hạn."
        breadcrumb={<Link to="/warehouses" className="hover:underline">Danh sách kho</Link>}
      />
      <div className="mx-auto max-w-7xl px-6 py-6 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <Kpi icon={<WarehouseIcon className="h-4 w-4" />} label="Tổng số kho" value={warehouses.length} />
          <Kpi icon={<Boxes className="h-4 w-4" />} label="Tổng tồn kho" value={summary.totalStock.toLocaleString()} />
          <Kpi icon={<Clock className="h-4 w-4" />} label="Chờ QC" value={summary.pendingQC} />
          <Kpi icon={<FileText className="h-4 w-4" />} label="Xuất chờ duyệt" value={summary.pendingExport} />
          <Kpi icon={<AlertTriangle className="h-4 w-4" />} label="Lô sắp hết hạn" value={summary.expiring} warn />
        </div>

        <Card>
          <CardHeader><CardTitle className="text-base">Phân tích theo kho</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Kho</TableHead><TableHead>Quản lý</TableHead>
                  <TableHead className="text-right">SKU</TableHead><TableHead className="text-right">Tồn</TableHead>
                  <TableHead className="text-right">Chờ QC</TableHead><TableHead className="text-right">Xuất chờ duyệt</TableHead>
                  <TableHead className="text-right">Sắp hết hạn</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="text-right"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {summary.perWh.map(({ w, stock, skus, pQC, pEx, exp }) => (
                  <TableRow key={w.id}>
                    <TableCell><div className="font-medium">{w.name}</div><div className="text-xs font-mono text-muted-foreground">{w.code}</div></TableCell>
                    <TableCell>{w.manager}</TableCell>
                    <TableCell className="text-right">{skus}</TableCell>
                    <TableCell className="text-right font-semibold">{stock.toLocaleString()}</TableCell>
                    <TableCell className="text-right">{pQC}</TableCell>
                    <TableCell className="text-right">{pEx}</TableCell>
                    <TableCell className={`text-right ${exp > 0 ? "text-rose-600 font-medium" : ""}`}>{exp}</TableCell>
                    <TableCell><Badge variant="outline">{w.status === "active" ? "Hoạt động" : w.status}</Badge></TableCell>
                    <TableCell className="text-right">
                      <Button asChild size="sm" variant="ghost">
                        <Link to="/warehouses/$warehouseId" params={{ warehouseId: w.id }}>
                          Vào kho <ArrowRight className="h-3 w-3 ml-1" />
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

function Kpi({ icon, label, value, warn }: { icon: React.ReactNode; label: string; value: number | string; warn?: boolean }) {
  const isWarn = warn && Number(value) > 0;
  return (
    <Card><CardContent className="p-4">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">{icon}{label}</div>
      <div className={`text-2xl font-bold mt-1 ${isWarn ? "text-rose-600" : ""}`}>{value}</div>
    </CardContent></Card>
  );
}
