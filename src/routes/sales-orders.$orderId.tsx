import { createFileRoute, Link } from "@tanstack/react-router";
import { PackageMinus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { PageHeader } from "@/components/app-shell";
import { useStore, orderActions, inventoryActions, stockOf } from "@/lib/store";
import type { OrderStatus } from "@/lib/types";
import { fmtVND, fmtDate } from "@/lib/format";

export const Route = createFileRoute("/sales-orders/$orderId")({
  component: OrderDetail,
  head: ({ params }) => ({ meta: [{ title: `Order ${params.orderId}` }] }),
});

const STATUSES: OrderStatus[] = ["pending", "confirmed", "fulfilled"];

function OrderDetail() {
  const { orderId } = Route.useParams();
  const order = useStore((s) => s.orders.find((o) => o.id === orderId));
  const products = useStore((s) => s.products);

  if (!order) return <div className="p-8">Not found. <Link to="/sales-orders" className="underline">Back</Link></div>;

  const total = order.lines.reduce((s, l) => s + l.qty * l.price, 0);

  const fulfill = () => {
    if (order.status !== "confirmed") return toast.error("Confirm the order first.");
    try {
      for (const line of order.lines) {
        const p = products.find((x) => x.id === line.productId);
        if (p?.trackInventory) inventoryActions.outbound(line.productId, line.qty, `Outbound ${order.id}`, order.id);
      }
      orderActions.setStatus(order.id, "fulfilled");
      toast.success("Order fulfilled — inventory updated");
    } catch (e: any) {
      toast.error(e?.message ?? "Fulfillment failed");
    }
  };

  return (
    <>
      <PageHeader
        title={`Order ${order.id}`}
        breadcrumb={<><Link to="/sales-orders" className="hover:text-foreground">Sales Orders</Link> / {order.id}</>}
        description={`Created ${fmtDate(order.createdAt)}`}
        actions={
          <>
            <Select value={order.status} onValueChange={(v) => { orderActions.setStatus(order.id, v as OrderStatus); toast.success(`Status: ${v}`); }}>
              <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
              <SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
            <Button className="gap-2" onClick={fulfill} disabled={order.status !== "confirmed"}>
              <PackageMinus className="h-4 w-4" /> Fulfill (deduct stock)
            </Button>
          </>
        }
      />
      <div className="mx-auto max-w-7xl px-6 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3"><CardTitle className="text-sm">Line items</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow><TableHead>Product</TableHead><TableHead>Qty</TableHead><TableHead>Stock</TableHead><TableHead className="text-right">Price</TableHead><TableHead className="text-right">Total</TableHead></TableRow>
              </TableHeader>
              <TableBody>
                {order.lines.map((l, i) => {
                  const p = products.find((x) => x.id === l.productId);
                  const stock = p?.trackInventory ? stockOf(l.productId) : null;
                  return (
                    <TableRow key={i}>
                      <TableCell>{p?.name ?? l.productId}</TableCell>
                      <TableCell className="tabular-nums">{l.qty}</TableCell>
                      <TableCell className="text-sm">{stock === null ? "—" : <span className={stock < l.qty ? "text-destructive font-medium" : ""}>{stock}</span>}</TableCell>
                      <TableCell className="text-right tabular-nums">{fmtVND(l.price)}</TableCell>
                      <TableCell className="text-right tabular-nums">{fmtVND(l.qty * l.price)}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-sm">Summary</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Total</span><span className="tabular-nums font-semibold">{fmtVND(total)}</span></div>
            <div className="pt-2"><Badge variant="outline">{order.status}</Badge></div>
            {order.quoteId && <Link to="/quotes/$quoteId" params={{ quoteId: order.quoteId }} className="text-xs text-primary block">View source quote</Link>}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
