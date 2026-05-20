import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { PageHeader } from "@/components/app-shell";
import { useStore, orderActions } from "@/lib/store";
import { fmtVND, fmtDate } from "@/lib/format";

export const Route = createFileRoute("/sales-orders")({
  component: OrdersPage,
  head: () => ({ meta: [{ title: "Sales Orders — Tag-Driven CRM" }] }),
});

function OrdersPage() {
  const orders = useStore((s) => s.orders);
  const navigate = useNavigate();
  const color = (s: string) =>
    s === "fulfilled" ? "bg-emerald-100 text-emerald-700 border-emerald-200" :
    s === "confirmed" ? "bg-blue-100 text-blue-700 border-blue-200" :
    "bg-amber-100 text-amber-700 border-amber-200";

  return (
    <>
      <PageHeader title="Sales Orders" description={`${orders.length} orders · created from accepted quotes`} />
      <div className="mx-auto max-w-7xl px-6 py-6">
        <div className="rounded-xl border bg-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead className="pl-4">Order</TableHead>
                <TableHead>Quote</TableHead>
                <TableHead>Lines</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.length === 0 && <TableRow><TableCell colSpan={7} className="text-center py-12 text-sm text-muted-foreground">No orders.</TableCell></TableRow>}
              {orders.map((o) => {
                const total = o.lines.reduce((s, l) => s + l.qty * l.price, 0);
                return (
                  <TableRow key={o.id} className="cursor-pointer" onClick={() => navigate({ to: "/sales-orders/$orderId", params: { orderId: o.id } })}>
                    <TableCell className="pl-4 font-medium">{o.id}</TableCell>
                    <TableCell className="text-sm">{o.quoteId ?? "—"}</TableCell>
                    <TableCell className="text-sm tabular-nums">{o.lines.length}</TableCell>
                    <TableCell><Badge variant="outline" className={color(o.status)}>{o.status}</Badge></TableCell>
                    <TableCell className="text-sm text-muted-foreground">{fmtDate(o.createdAt)}</TableCell>
                    <TableCell className="text-right tabular-nums">{fmtVND(total)}</TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="icon" onClick={() => { orderActions.remove(o.id); toast.success("Deleted"); }}>
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
