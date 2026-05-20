import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { PageHeader } from "@/components/app-shell";
import { useStore, productActions, stockOf } from "@/lib/store";
import { fmtVND } from "@/lib/format";

export const Route = createFileRoute("/products")({
  component: ProductsPage,
  head: () => ({ meta: [{ title: "Products & Services — Tag-Driven CRM" }] }),
});

function ProductsPage() {
  const products = useStore((s) => s.products);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", sku: "", price: 0, type: "product" as "product" | "service", trackInventory: true });

  const submit = () => {
    if (!form.name.trim()) return toast.error("Name required");
    productActions.create({ ...form });
    toast.success("Product created");
    setOpen(false); setForm({ name: "", sku: "", price: 0, type: "product", trackInventory: true });
  };

  return (
    <>
      <PageHeader
        title="Products & Services"
        description={`${products.length} items`}
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button className="gap-2"><Plus className="h-4 w-4" /> New Product</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Create Product / Service</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div><Label>Name *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>SKU</Label><Input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} /></div>
                  <div><Label>Price</Label><Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} /></div>
                  <div><Label>Type</Label>
                    <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as "product" | "service" })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent><SelectItem value="product">Product</SelectItem><SelectItem value="service">Service</SelectItem></SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end gap-2">
                    <Switch checked={form.trackInventory} onCheckedChange={(v) => setForm({ ...form, trackInventory: v })} />
                    <Label className="text-xs">Track inventory</Label>
                  </div>
                </div>
              </div>
              <DialogFooter><Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={submit}>Create</Button></DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />
      <div className="mx-auto max-w-7xl px-6 py-6">
        <div className="rounded-xl border bg-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead className="pl-4">Name</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Track</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-right">Stock</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="pl-4 font-medium">{p.name}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{p.sku}</TableCell>
                  <TableCell><Badge variant="outline">{p.type}</Badge></TableCell>
                  <TableCell>{p.trackInventory ? "Yes" : "—"}</TableCell>
                  <TableCell className="text-right tabular-nums">{fmtVND(p.price)}</TableCell>
                  <TableCell className="text-right tabular-nums">{p.trackInventory ? stockOf(p.id) : "—"}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" onClick={() => { productActions.remove(p.id); toast.success("Deleted"); }}>
                      <Trash2 className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </>
  );
}
