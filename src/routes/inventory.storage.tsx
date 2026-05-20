import { createFileRoute } from "@tanstack/react-router";
import { Warehouse } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/app-shell";
import { useStore, stockOf } from "@/lib/store";

export const Route = createFileRoute("/inventory/storage")({
  component: StoragePage,
  head: () => ({ meta: [{ title: "Storage — Tag-Driven CRM" }] }),
});

function StoragePage() {
  const products = useStore((s) => s.products.filter((p) => p.trackInventory));
  // Subscribe to movements so stock updates trigger re-render
  useStore((s) => s.movements);
  const LOW = 10;

  return (
    <>
      <PageHeader title="Storage" description="Current stock per product. Low stock highlighted." />
      <div className="mx-auto max-w-7xl px-6 py-6">
        <div className="rounded-xl border bg-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead className="pl-4">Product</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead className="text-right">On hand</TableHead>
                <TableHead className="text-center">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((p) => {
                const s = stockOf(p.id);
                const low = s < LOW;
                return (
                  <TableRow key={p.id} className={low ? "bg-amber-50/40 dark:bg-amber-950/10" : ""}>
                    <TableCell className="pl-4 font-medium"><span className="inline-flex items-center gap-2"><Warehouse className="h-3.5 w-3.5 text-muted-foreground" /> {p.name}</span></TableCell>
                    <TableCell className="text-sm text-muted-foreground">{p.sku}</TableCell>
                    <TableCell className="text-right tabular-nums font-semibold">{s}</TableCell>
                    <TableCell className="text-center">{low ? <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200">Low stock</Badge> : <Badge variant="outline" className="bg-emerald-100 text-emerald-700 border-emerald-200">OK</Badge>}</TableCell>
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
