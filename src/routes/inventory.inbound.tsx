import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PackagePlus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { PageHeader } from "@/components/app-shell";
import { useStore, inventoryActions } from "@/lib/store";
import { fmtDateTime } from "@/lib/format";

export const Route = createFileRoute("/inventory/inbound")({
  component: InboundPage,
  head: () => ({ meta: [{ title: "Inbound — Tag-Driven CRM" }] }),
});

function InboundPage() {
  const products = useStore((s) => s.products.filter((p) => p.trackInventory));
  const movements = useStore((s) => s.movements.filter((m) => m.qty > 0));
  const [productId, setProductId] = useState("");
  const [qty, setQty] = useState(0);
  const [reason, setReason] = useState("Restock");

  const submit = () => {
    if (!productId) return toast.error("Pick a product");
    if (qty <= 0) return toast.error("Qty must be > 0");
    try {
      inventoryActions.inbound(productId, qty, reason);
      toast.success("Stock added");
      setQty(0); setReason("Restock");
    } catch (e: any) { toast.error(e?.message ?? "Failed"); }
  };

  return (
    <>
      <PageHeader title="Inbound" description="Add stock to inventory." />
      <div className="mx-auto max-w-7xl px-6 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><PackagePlus className="h-4 w-4" /> Add stock</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div><Label>Product</Label>
              <Select value={productId} onValueChange={setProductId}>
                <SelectTrigger><SelectValue placeholder="Pick product" /></SelectTrigger>
                <SelectContent>{products.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Quantity</Label><Input type="number" value={qty} onChange={(e) => setQty(Number(e.target.value))} /></div>
            <div><Label>Reason</Label><Input value={reason} onChange={(e) => setReason(e.target.value)} /></div>
            <Button className="w-full" onClick={submit}>Add to stock</Button>
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3"><CardTitle className="text-sm">Recent inbound movements</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader><TableRow><TableHead>When</TableHead><TableHead>Product</TableHead><TableHead className="text-right">Qty</TableHead><TableHead>Reason</TableHead></TableRow></TableHeader>
              <TableBody>
                {movements.length === 0 && <TableRow><TableCell colSpan={4} className="text-center py-8 text-sm text-muted-foreground">No movements.</TableCell></TableRow>}
                {movements.map((m) => {
                  const p = products.find((x) => x.id === m.productId);
                  return <TableRow key={m.id}><TableCell className="text-sm text-muted-foreground">{fmtDateTime(m.at)}</TableCell><TableCell>{p?.name ?? m.productId}</TableCell><TableCell className="text-right tabular-nums text-emerald-600">+{m.qty}</TableCell><TableCell className="text-sm">{m.reason}</TableCell></TableRow>;
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
