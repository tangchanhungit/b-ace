import { createFileRoute, Link } from "@tanstack/react-router";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageHeader } from "@/components/app-shell";
import { useStore, contractActions } from "@/lib/store";
import { fmtVND, fmtDate } from "@/lib/format";
import type { ContractStatus } from "@/lib/types";

export const Route = createFileRoute("/service-contracts")({
  component: ContractsList,
  head: () => ({ meta: [{ title: "Service Contracts — Tag-Driven CRM" }] }),
});

const STATUSES: ContractStatus[] = ["draft", "active", "completed", "cancelled"];

function ContractsList() {
  const contracts = useStore((s) => s.serviceContracts);
  const orgs = useStore((s) => s.organizations);

  return (
    <>
      <PageHeader title="Service Contracts" breadcrumb="Sales / Contracts" description={`${contracts.length} contracts`} />
      <div className="mx-auto max-w-7xl px-6 py-6">
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Organization</TableHead>
                  <TableHead>Quote</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead className="text-right">Value</TableHead>
                  <TableHead className="w-36">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contracts.length === 0 && (
                  <TableRow><TableCell colSpan={6} className="text-center py-10 text-sm text-muted-foreground">No contracts yet. Create one from an accepted quote.</TableCell></TableRow>
                )}
                {contracts.map((c) => {
                  const org = orgs.find((o) => o.id === c.orgId);
                  return (
                    <TableRow key={c.id}>
                      <TableCell className="font-mono text-xs">{c.id}</TableCell>
                      <TableCell>{org ? <Link to="/organizations/$orgId" params={{ orgId: org.id }} className="hover:underline">{org.name}</Link> : "—"}</TableCell>
                      <TableCell>{c.quoteId ? <Link to="/quotes/$quoteId" params={{ quoteId: c.quoteId }} className="hover:underline font-mono text-xs">{c.quoteId}</Link> : "—"}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{fmtDate(c.startDate)} → {fmtDate(c.endDate)}</TableCell>
                      <TableCell className="text-right tabular-nums">{fmtVND(c.value)}</TableCell>
                      <TableCell>
                        <Select value={c.status} onValueChange={(v) => contractActions.setStatus(c.id, v as ContractStatus)}>
                          <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                          <SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

function _badge(s: ContractStatus) { // kept for potential reuse
  const map: Record<ContractStatus, string> = { draft: "bg-muted", active: "bg-emerald-100 text-emerald-700", completed: "bg-blue-100 text-blue-700", cancelled: "bg-destructive/10 text-destructive" };
  return <Badge variant="outline" className={map[s]}>{s}</Badge>;
}
