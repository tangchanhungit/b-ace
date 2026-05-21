import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ShoppingCart, Trash2, Plus, FileSignature } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { PageHeader } from "@/components/app-shell";
import { useStore, quoteActions, orderActions, contractActions, quoteSubtotal, quoteTax, quoteTotal } from "@/lib/store";
import type { QuoteStatus } from "@/lib/types";
import { fmtVND } from "@/lib/format";

export const Route = createFileRoute("/quotes/$quoteId")({
  component: QuoteDetail,
  head: ({ params }) => ({ meta: [{ title: `Quote ${params.quoteId}` }] }),
});

const STATUSES: QuoteStatus[] = ["draft", "sent", "accepted", "rejected"];

function QuoteDetail() {
  const { quoteId } = Route.useParams();
  const navigate = useNavigate();
  const quote = useStore((s) => s.quotes.find((q) => q.id === quoteId));
  const products = useStore((s) => s.products);
  const opp = useStore((s) => s.opportunities.find((o) => o.id === quote?.oppId));

  if (!quote) return <div className="p-8">Not found. <Link className="underline" to="/quotes">Back</Link></div>;

  const addLine = (productId: string) => {
    const p = products.find((x) => x.id === productId);
    if (!p) return;
    quoteActions.update(quote.id, { lines: [...quote.lines, { productId, qty: 1, price: p.price }] });
  };
  const updateLine = (idx: number, patch: Partial<{ qty: number; price: number }>) => {
    const lines = quote.lines.map((l, i) => i === idx ? { ...l, ...patch } : l);
    quoteActions.update(quote.id, { lines });
  };
  const removeLine = (idx: number) => quoteActions.update(quote.id, { lines: quote.lines.filter((_, i) => i !== idx) });

  const createOrder = () => {
    if (quote.status !== "accepted") return toast.error("Accept the quote first.");
    if (quote.lines.length === 0) return toast.error("Quote has no lines.");
    const o = orderActions.createFromQuote(quote.id);
    if (o) { toast.success("Sales Order created"); navigate({ to: "/sales-orders/$orderId", params: { orderId: o.id } }); }
  };

  const createContract = () => {
    if (quote.status !== "accepted") return toast.error("Accept the quote first.");
    const c = contractActions.createFromQuote(quote.id, opp?.leadId);
    if (c) { toast.success("Contract created"); navigate({ to: "/service-contracts" }); }
  };

  return (
    <>
      <PageHeader
        title={`Quote ${quote.id}`}
        breadcrumb={<><Link to="/quotes" className="hover:text-foreground">Quotes</Link> / {quote.id}</>}
        description={opp ? `For: ${opp.name}` : ""}
        actions={
          <>
            <Select value={quote.status} onValueChange={(v) => { quoteActions.setStatus(quote.id, v as QuoteStatus); toast.success(`Status: ${v}`); }}>
              <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
              <SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
            <Button variant="outline" className="gap-2" onClick={createContract} disabled={quote.status !== "accepted"}>
              <FileSignature className="h-4 w-4" /> Create Contract
            </Button>
            <Button className="gap-2" onClick={createOrder} disabled={quote.status !== "accepted"}>
              <ShoppingCart className="h-4 w-4" /> Create Sales Order
            </Button>
          </>
        }
      />

      <div className="mx-auto max-w-7xl px-6 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-sm">Line items</CardTitle>
            <AddLineButton onAdd={addLine} products={products} />
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead className="w-20">Qty</TableHead>
                  <TableHead className="w-40">Price</TableHead>
                  <TableHead className="text-right">Line total</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {quote.lines.length === 0 && <TableRow><TableCell colSpan={5} className="text-center py-8 text-sm text-muted-foreground">No items yet.</TableCell></TableRow>}
                {quote.lines.map((l, i) => {
                  const p = products.find((x) => x.id === l.productId);
                  return (
                    <TableRow key={i}>
                      <TableCell>{p?.name ?? l.productId}</TableCell>
                      <TableCell><Input type="number" value={l.qty} onChange={(e) => updateLine(i, { qty: Number(e.target.value) || 0 })} className="h-8" /></TableCell>
                      <TableCell><Input type="number" value={l.price} onChange={(e) => updateLine(i, { price: Number(e.target.value) || 0 })} className="h-8" /></TableCell>
                      <TableCell className="text-right tabular-nums">{fmtVND(l.qty * l.price)}</TableCell>
                      <TableCell><Button variant="ghost" size="icon" onClick={() => removeLine(i)}><Trash2 className="h-4 w-4 text-muted-foreground" /></Button></TableCell>
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
            <Row label="Subtotal" value={fmtVND(quoteSubtotal(quote))} />
            <div className="flex items-center justify-between">
              <Label className="text-xs text-muted-foreground">Tax rate</Label>
              <Input className="h-8 w-24 text-right" type="number" step="0.01" value={quote.taxRate} onChange={(e) => quoteActions.update(quote.id, { taxRate: Number(e.target.value) || 0 })} />
            </div>
            <Row label="Tax" value={fmtVND(quoteTax(quote))} />
            <div className="flex justify-between items-center pt-2 border-t font-semibold">
              <span>Total</span><span className="tabular-nums">{fmtVND(quoteTotal(quote))}</span>
            </div>
            <div className="pt-2"><Badge variant="outline">{quote.status}</Badge></div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return <div className="flex justify-between"><span className="text-muted-foreground">{label}</span><span className="tabular-nums">{value}</span></div>;
}

function AddLineButton({ products, onAdd }: { products: { id: string; name: string }[]; onAdd: (id: string) => void }) {
  return (
    <Select onValueChange={onAdd}>
      <SelectTrigger className="h-8 w-48">
        <Plus className="h-3 w-3 mr-1" />
        <SelectValue placeholder="Add item" />
      </SelectTrigger>
      <SelectContent>{products.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
    </Select>
  );
}
