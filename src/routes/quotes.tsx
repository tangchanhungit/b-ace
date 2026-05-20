import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { PageHeader } from "@/components/app-shell";
import { useStore, quoteActions, quoteTotal } from "@/lib/store";
import { fmtVND, fmtDate } from "@/lib/format";

export const Route = createFileRoute("/quotes")({
  component: QuotesPage,
  head: () => ({ meta: [{ title: "Quotes — Tag-Driven CRM" }] }),
});

function QuotesPage() {
  const quotes = useStore((s) => s.quotes);
  const opps = useStore((s) => s.opportunities);
  const navigate = useNavigate();

  const statusColor = (s: string) =>
    s === "accepted" ? "bg-emerald-100 text-emerald-700 border-emerald-200" :
    s === "rejected" ? "bg-rose-100 text-rose-700 border-rose-200" :
    s === "sent" ? "bg-blue-100 text-blue-700 border-blue-200" :
    "bg-amber-100 text-amber-700 border-amber-200";

  return (
    <>
      <PageHeader title="Quotes" description={`${quotes.length} quotes · create from an Opportunity`} />
      <div className="mx-auto max-w-7xl px-6 py-6">
        <div className="rounded-xl border bg-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead className="pl-4">Quote</TableHead>
                <TableHead>Opportunity</TableHead>
                <TableHead>Lines</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {quotes.length === 0 && <TableRow><TableCell colSpan={7} className="text-center py-12 text-sm text-muted-foreground">No quotes yet. Create one from an Opportunity.</TableCell></TableRow>}
              {quotes.map((q) => {
                const opp = opps.find((o) => o.id === q.oppId);
                return (
                  <TableRow key={q.id} className="cursor-pointer" onClick={() => navigate({ to: "/quotes/$quoteId", params: { quoteId: q.id } })}>
                    <TableCell className="pl-4 font-medium">{q.id}</TableCell>
                    <TableCell className="text-sm">{opp?.name ?? "—"}</TableCell>
                    <TableCell className="text-sm tabular-nums">{q.lines.length}</TableCell>
                    <TableCell><Badge variant="outline" className={statusColor(q.status)}>{q.status}</Badge></TableCell>
                    <TableCell className="text-sm text-muted-foreground">{fmtDate(q.createdAt)}</TableCell>
                    <TableCell className="text-right tabular-nums">{fmtVND(quoteTotal(q))}</TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="icon" onClick={() => { quoteActions.remove(q.id); toast.success("Deleted"); }}>
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
