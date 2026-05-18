import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowDownUp, ArrowLeft, Plus, Search, AlertTriangle, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { MOCK_LEADS, type Lead } from "@/lib/leads-mock";
import { derive, daysSince, type LeadTier } from "@/lib/leads-logic";

export const Route = createFileRoute("/leads/")({
  component: LeadsPage,
  head: () => ({ meta: [{ title: "All Leads — Tag-Driven CRM" }] }),
});

type SortKey = "value" | "last_touch" | null;
const ANY = "__any__";

function tierClasses(tier: LeadTier) {
  if (tier === "Gold") return "tier-gold-bg tier-gold-fg border-transparent";
  if (tier === "Silver") return "tier-silver-bg tier-silver-fg border-transparent";
  if (tier === "Bronze") return "tier-bronze-bg tier-bronze-fg border-transparent";
  return "bg-muted text-muted-foreground border-transparent";
}

const fmtVND = (n: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(n);

function LeadsPage() {
  const [search, setSearch] = useState("");
  const [source, setSource] = useState(ANY);
  const [purchase, setPurchase] = useState(ANY);
  const [tier, setTier] = useState(ANY);
  const [program, setProgram] = useState(ANY);
  const [owner, setOwner] = useState(ANY);
  const [staleOnly, setStaleOnly] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>("last_touch");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const owners = useMemo(
    () => Array.from(new Set(MOCK_LEADS.map((l) => l.owner))).sort(),
    [],
  );

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list: Lead[] = MOCK_LEADS.filter((l) => {
      if (q && !l.name.toLowerCase().includes(q) && !l.phone.replace(/\s/g, "").includes(q.replace(/\s/g, ""))) return false;
      if (source !== ANY && !l.tags.includes(source)) return false;
      if (purchase !== ANY && !l.tags.includes(purchase)) return false;
      if (tier !== ANY && !l.tags.includes(tier)) return false;
      if (program !== ANY && !l.tags.includes(program)) return false;
      if (owner !== ANY && l.owner !== owner) return false;
      if (staleOnly && !derive(l).stale) return false;
      return true;
    });

    if (sortKey) {
      list = [...list].sort((a, b) => {
        const av = sortKey === "value" ? a.value : new Date(a.last_touch).getTime();
        const bv = sortKey === "value" ? b.value : new Date(b.last_touch).getTime();
        return sortDir === "asc" ? av - bv : bv - av;
      });
    }
    return list;
  }, [search, source, purchase, tier, program, owner, staleOnly, sortKey, sortDir]);

  const toggleSort = (k: SortKey) => {
    if (sortKey === k) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(k); setSortDir("desc"); }
  };

  const reset = () => {
    setSearch(""); setSource(ANY); setPurchase(ANY); setTier(ANY);
    setProgram(ANY); setOwner(ANY); setStaleOnly(false);
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b border-border bg-card">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link to="/"><Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button></Link>
            <div>
              <h1 className="text-lg font-semibold">All Leads</h1>
              <p className="text-xs text-muted-foreground">Tag-driven segmentation · {rows.length} of {MOCK_LEADS.length}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search name or phone…"
                className="pl-8 w-72"
              />
            </div>
            <Link to="/leads/create"><Button className="gap-2"><Plus className="h-4 w-4" /> Create Lead</Button></Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-6 space-y-4">
        {/* Filter bar */}
        <div className="rounded-xl border bg-card p-3 flex flex-wrap items-center gap-2">
          <FilterSelect label="Source" value={source} onChange={setSource} options={[
            ["facebook", "Facebook"], ["tiktok", "TikTok"], ["website", "Website"], ["zalo", "Zalo"], ["other", "Khác"],
          ]} />
          <FilterSelect label="Purchase" value={purchase} onChange={setPurchase} options={[
            ["mua_lan_dau", "Mua lần đầu"], ["mua_lai", "Mua lại"], ["khong_mua", "Không mua"], ["ngung_mua", "Ngưng mua"],
          ]} />
          <FilterSelect label="Tier" value={tier} onChange={setTier} options={[
            ["vang", "Gold"], ["bac", "Silver"], ["dong", "Bronze"],
          ]} />
          <FilterSelect label="Program" value={program} onChange={setProgram} options={[
            ["mien_phi_online", "Free Online"], ["mien_phi_offline", "Free Offline"],
            ["pcth", "PCTH"], ["nhuong_quyen", "Franchise"],
          ]} />
          <FilterSelect label="Owner" value={owner} onChange={setOwner} options={owners.map((o) => [o, o])} />
          <div className="flex items-center gap-2 ml-auto rounded-md border px-3 h-9">
            <AlertTriangle className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs font-medium">Stale only</span>
            <Switch checked={staleOnly} onCheckedChange={setStaleOnly} />
          </div>
          <Button variant="ghost" size="sm" onClick={reset}>Reset</Button>
        </div>

        {/* Table */}
        <div className="rounded-xl border bg-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead className="pl-4">Lead</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Stage</TableHead>
                <TableHead>Tier</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>
                  <button onClick={() => toggleSort("last_touch")} className="inline-flex items-center gap-1 hover:text-foreground">
                    Last touch <ArrowDownUp className="h-3 w-3" />
                  </button>
                </TableHead>
                <TableHead>Next action</TableHead>
                <TableHead className="text-right">
                  <button onClick={() => toggleSort("value")} className="inline-flex items-center gap-1 hover:text-foreground">
                    Value <ArrowDownUp className="h-3 w-3" />
                  </button>
                </TableHead>
                <TableHead className="text-center pr-4">Stale</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 && (
                <TableRow><TableCell colSpan={9} className="text-center py-12 text-sm text-muted-foreground">No leads match these filters.</TableCell></TableRow>
              )}
              {rows.map((l) => {
                const d = derive(l);
                const days = daysSince(l.last_touch);
                return (
                  <TableRow
                    key={l.id}
                    onClick={() => alert(`Open lead ${l.id} — ${l.name}`)}
                    className={cn("cursor-pointer", d.high && "bg-destructive/5 hover:bg-destructive/10")}
                  >
                    <TableCell className="pl-4">
                      <div className="flex items-center gap-2">
                        {d.high && (
                          <span title="HIGH priority" className="inline-flex items-center gap-1 rounded-md bg-destructive/10 text-destructive px-1.5 py-0.5 text-[10px] font-bold uppercase">
                            <Flame className="h-3 w-3" /> High
                          </span>
                        )}
                        <div>
                          <div className="font-medium text-sm">{l.name}</div>
                          <div className="text-xs text-muted-foreground">{l.phone}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900">
                        {d.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-900">
                        {d.stage}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {d.tier ? (
                        <Badge className={cn("font-semibold", tierClasses(d.tier))}>{d.tier}</Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm">{l.owner}</TableCell>
                    <TableCell className="text-sm">
                      <span className={cn(d.stale && "text-destructive font-medium")}>
                        {days === 0 ? "Today" : `${days}d ago`}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-[220px] truncate">{l.next_action}</TableCell>
                    <TableCell className="text-right tabular-nums text-sm">{fmtVND(l.value)}</TableCell>
                    <TableCell className="text-center pr-4">
                      {d.stale ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-destructive/10 text-destructive px-2 py-0.5 text-[10px] font-medium">
                          <span className="h-1.5 w-1.5 rounded-full bg-destructive" /> Stale
                        </span>
                      ) : (
                        <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </main>
    </div>
  );
}

function FilterSelect({
  label, value, onChange, options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: [string, string][];
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="h-9 w-[160px]">
        <SelectValue placeholder={label}>
          <span className="text-muted-foreground mr-1">{label}:</span>
          {value === ANY ? "All" : options.find(([v]) => v === value)?.[1] ?? value}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ANY}>All {label.toLowerCase()}</SelectItem>
        {options.map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}
      </SelectContent>
    </Select>
  );
}
