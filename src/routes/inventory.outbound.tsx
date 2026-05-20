import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { PackageMinus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { PageHeader } from "@/components/app-shell";
import { useStore, inventoryActions, stockOf } from "@/lib/store";
import { fmtDateTime } from "@/lib/format";

export const Route = createFileRoute("/inventory/outbound")({
  component: OutboundPage,
  head: () => ({ meta: [{ title: "Outbound — Tag-Driven CRM" }] }),
});

function OutboundPage() {
  const products = useStore((s) => s.products.filter((p) => p.trackInventory));
  const movements = useStore((s) => s.movements.filter((m) => m.qty < 0));
  const orders = useStore((s) => s.orders.filter((o) => o.status === "confirmed"));
  const [productId, setProductId] = useState("");
  const [qty, setQty] = useState(0);
  const [reason, setReason] = useState("Manual outbound");

  const submit = () => {
    if (!productId) return toast.error("Pick a product");
    if (qty <= 0) return toast.error("Qty must be > 0");
    try {
      inventoryActions.outbound(productId, qty, reason);
      toast.success("Stock deducted");
      setQty(0);
    } catch (e: any) { toast.error(e?.message ?? "Failed"); }
  };

  return (
    <>
      <PageHeader title="Outbound" description="Deduct stock. Linked to confirmed sales orders." />
      <div className="mx-auto max-w-7xl px-6 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><PackageMinus className="h-4 w-4" /> Manual outbound</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div><Label>Product</Label>
              <Select value={productId} onValueChange={setProductId}>
                <SelectTrigger><SelectValue placeholder="Pick product" /></SelectTrigger>
                <SelectContent>{products.map((p) => <SelectItem key={p.id} value={p.id}>{p.name} ({stockOf(p.id)} in stock)</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Quantity</Label><Input type="number" value={qty} onChange={(e) => setQty(Number(e.target.value))} /></div>
            <div><Label>Reason</Label><Input value={reason} onChange={(e) => setReason(e.target.value)} /></div>
            <Button className="w-full" onClick={submit}>Deduct stock</Button>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="pb-3"><CardTitle className="text-sm">Confirmed orders awaiting fulfillment</CardTitle></CardHeader>
          <CardContent className="divide-y">
            {orders.length === 0 && <p className="text-xs text-muted-foreground">No confirmed orders.</p>}
            {orders.map((o) => (
              <Link key={o.id} to="/sales-orders/$orderId" params={{ orderId: o.id }} className="flex justify-between items-center py-2 hover:bg-muted/40 -mx-2 px-2 rounded text-sm">
                <span>{o.id} · {o.lines.length} lines</span>
                <Badge variant="outline">go to fulfill</Badge>
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader className="pb-3"><CardTitle className="text-sm">Outbound history</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader><TableRow><TableHead>When</TableHead><TableHead>Product</TableHead><TableHead className="text-right">Qty</TableHead><TableHead>Reason</TableHead><TableHead>Ref order</TableHead></TableRow></TableHeader>
              <TableBody>
                {movements.length === 0 && <TableRow><TableCell colSpan={5} className="text-center py-8 text-sm text-muted-foreground">No outbound movements.</TableCell></TableRow>}
                {movements.map((m) => {
                  const p = products.find((x) => x.id === m.productId);
                  return <TableRow key={m.id}><TableCell className="text-sm text-muted-foreground">{fmtDateTime(m.at)}</TableCell><TableCell>{p?.name ?? m.productId}</TableCell><TableCell className="text-right tabular-nums text-destructive">{m.qty}</TableCell><TableCell className="text-sm">{m.reason}</TableCell><TableCell className="text-sm text-muted-foreground">{m.refOrderId ?? "—"}</TableCell></TableRow>;
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
