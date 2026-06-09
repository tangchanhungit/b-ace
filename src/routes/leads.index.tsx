import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowDownUp, Plus, Search, AlertTriangle, Flame, Users, UserPlus, Crown,
  Repeat, Clock, TrendingUp, Filter, ChevronDown, ChevronRight, Download,
  X, Bookmark, Save, Trash2, MoreHorizontal, Phone, Mail, Building2,
  Tag as TagIcon, CheckCircle2, Activity as ActivityIcon, MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from "@/components/ui/sheet";
import {
  Collapsible, CollapsibleContent, CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useStore, leadActions } from "@/lib/store";
import type { Lead } from "@/lib/types";
import { derive, daysSince, type LeadTier } from "@/lib/leads-logic";
import { PageHeader } from "@/components/app-shell";
import { fmtVND, fmtDate, fmtDateTime } from "@/lib/format";

export const Route = createFileRoute("/leads/")({
  component: LeadsPage,
  head: () => ({ meta: [{ title: "All Leads — Tag-Driven CRM" }] }),
});

// ============ Tag taxonomy ============
const TAG_META: Record<string, { label: string; cat: "source" | "learning" | "program" | "purchase" | "tier" | "other"; cls: string }> = {
  // source
  facebook: { label: "Facebook", cat: "source", cls: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300" },
  tiktok: { label: "TikTok", cat: "source", cls: "bg-pink-100 text-pink-700 border-pink-200 dark:bg-pink-950/40 dark:text-pink-300" },
  website: { label: "Website", cat: "source", cls: "bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300" },
  zalo: { label: "Zalo", cat: "source", cls: "bg-sky-100 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300" },
  other: { label: "Khác", cat: "source", cls: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800/60 dark:text-slate-300" },
  // learning
  chua_hoc: { label: "Chưa học", cat: "learning", cls: "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300" },
  da_hoc: { label: "Đã học", cat: "learning", cls: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300" },
  // program
  mien_phi_online: { label: "Free Online", cat: "program", cls: "bg-cyan-100 text-cyan-700 border-cyan-200 dark:bg-cyan-950/40 dark:text-cyan-300" },
  mien_phi_offline: { label: "Free Offline", cat: "program", cls: "bg-teal-100 text-teal-700 border-teal-200 dark:bg-teal-950/40 dark:text-teal-300" },
  pcth: { label: "PCTH", cat: "program", cls: "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300" },
  van_hanh: { label: "Vận hành", cat: "program", cls: "bg-violet-100 text-violet-700 border-violet-200 dark:bg-violet-950/40 dark:text-violet-300" },
  mkt: { label: "Marketing", cat: "program", cls: "bg-fuchsia-100 text-fuchsia-700 border-fuchsia-200 dark:bg-fuchsia-950/40 dark:text-fuchsia-300" },
  lop_khac: { label: "Lớp khác", cat: "program", cls: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800/60 dark:text-slate-300" },
  nhuong_quyen: { label: "Nhượng quyền", cat: "program", cls: "bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300" },
  // purchase
  mua_lan_dau: { label: "Mua lần đầu", cat: "purchase", cls: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300" },
  mua_lai: { label: "Mua lại", cat: "purchase", cls: "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300" },
  khong_mua: { label: "Không mua", cat: "purchase", cls: "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-950/40 dark:text-orange-300" },
  ngung_mua: { label: "Ngưng mua", cat: "purchase", cls: "bg-red-100 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300" },
  // tier
  vang: { label: "Gold", cat: "tier", cls: "tier-gold-bg tier-gold-fg" },
  bac: { label: "Silver", cat: "tier", cls: "tier-silver-bg tier-silver-fg" },
  dong: { label: "Bronze", cat: "tier", cls: "tier-bronze-bg tier-bronze-fg" },
  stale: { label: "Stale", cat: "other", cls: "bg-red-100 text-red-700 border-red-200" },
};
const tagMeta = (t: string) => TAG_META[t] ?? { label: t, cat: "other" as const, cls: "bg-muted text-foreground border-transparent" };
const SOURCE_TAGS = ["facebook", "tiktok", "website", "zalo", "other"];
const PROGRAM_TAGS = ["mien_phi_online", "mien_phi_offline", "pcth", "van_hanh", "mkt", "lop_khac", "nhuong_quyen"];
const PURCHASE_TAGS = ["mua_lan_dau", "mua_lai", "khong_mua", "ngung_mua"];
const TIER_TAGS = ["vang", "bac", "dong"];

// Customer segments (Vietnamese)
const SEGMENT_LABELS: Record<NonNullable<Lead["segment"]>, string> = {
  gia_dinh: "Gia đình",
  chuan_bi_mo: "Chuẩn bị mở",
  co_quan: "Có quán",
};
const SEGMENT_OPTIONS: [string, string][] = [
  ["gia_dinh", "Gia đình"],
  ["chuan_bi_mo", "Chuẩn bị mở"],
  ["co_quan", "Có quán"],
];

// ============ Helpers ============
const ANY = "__any__";
const PAGE_SIZE = 15;
const SEGMENTS_KEY = "bace_lead_segments_v1";

type SortKey = "name" | "value" | "last_touch" | null;
type DateFilter = "any" | "7d" | "30d" | "90d";

type FilterState = {
  search: string;
  source: string;
  program: string;
  purchase: string;
  tier: string;
  owner: string;
  area: string;
  segment: string;
  createdRange: DateFilter;
  touchRange: DateFilter;
  staleOnly: boolean;
  hasNextAction: boolean;
  hasOpenTicket: boolean;
};

const EMPTY_FILTERS: FilterState = {
  search: "", source: ANY, program: ANY, purchase: ANY, tier: ANY, owner: ANY,
  area: ANY, segment: ANY,
  createdRange: "any", touchRange: "any",
  staleOnly: false, hasNextAction: false, hasOpenTicket: false,
};

const PRESET_SEGMENTS: { id: string; name: string; filters: Partial<FilterState> }[] = [
  { id: "new", name: "Khách mới", filters: { purchase: "mua_lan_dau" } },
  { id: "gold", name: "Khách vàng", filters: { tier: "vang" } },
  { id: "repeat", name: "Khách mua lại", filters: { purchase: "mua_lai" } },
  { id: "nobuy", name: "Khách không mua", filters: { purchase: "khong_mua" } },
  { id: "chain", name: "Khách chuỗi (PCTH)", filters: { program: "pcth" } },
  { id: "franchise", name: "Khách nhượng quyền", filters: { program: "nhuong_quyen" } },
  { id: "cskh", name: "Khách cần CSKH", filters: { staleOnly: true } },
];

function tierClasses(tier: LeadTier) {
  if (tier === "Gold") return "tier-gold-bg tier-gold-fg border-transparent";
  if (tier === "Silver") return "tier-silver-bg tier-silver-fg border-transparent";
  if (tier === "Bronze") return "tier-bronze-bg tier-bronze-fg border-transparent";
  return "bg-muted text-muted-foreground border-transparent";
}

const initials = (n: string) =>
  n.trim().split(/\s+/).slice(-2).map((p) => p[0]?.toUpperCase() ?? "").join("");

const OWNER_COLOR: Record<string, string> = {
  Linh: "bg-violet-500", Minh: "bg-emerald-500", Hà: "bg-orange-500",
};
const ownerColor = (n: string) => OWNER_COLOR[n] ?? "bg-slate-500";

function leadExportRows(rows: Lead[]) {
  return rows.map((l) => {
    const d = derive(l);
    const sourceTag = l.tags.find((t) => SOURCE_TAGS.includes(t));
    return {
      ID: l.id, Name: l.name, Phone: l.phone, Email: l.email ?? "",
      Area: l.area ?? "", Source: sourceTag ? tagMeta(sourceTag).label : "",
      Status: d.stage,
      CustomerType: l.segment ? SEGMENT_LABELS[l.segment] : (l.customerType ?? ""),
      Owner: l.owner, Value: l.value, LastTouch: l.last_touch, NextAction: l.next_action,
      Tags: l.tags.join("|"), Tier: d.tier ?? "",
    };
  });
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

function downloadCSV(rows: Lead[]) {
  const data = leadExportRows(rows);
  const headers = Object.keys(data[0] ?? { ID: "" });
  const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const lines = [headers.join(","), ...data.map((r) => headers.map((h) => esc((r as Record<string, unknown>)[h])).join(","))];
  triggerDownload(
    new Blob(["\uFEFF" + lines.join("\n")], { type: "text/csv;charset=utf-8" }),
    `leads-${new Date().toISOString().slice(0, 10)}.csv`,
  );
}

function downloadExcel(rows: Lead[]) {
  // SpreadsheetML 2003 XML — opens natively in Excel as .xls
  const data = leadExportRows(rows);
  const headers = Object.keys(data[0] ?? { ID: "" });
  const esc = (v: unknown) => String(v ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const cell = (v: unknown) => {
    const isNum = typeof v === "number";
    return `<Cell><Data ss:Type="${isNum ? "Number" : "String"}">${esc(v)}</Data></Cell>`;
  };
  const xml = `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
<Worksheet ss:Name="Leads"><Table>
<Row>${headers.map((h) => `<Cell><Data ss:Type="String">${esc(h)}</Data></Cell>`).join("")}</Row>
${data.map((r) => `<Row>${headers.map((h) => cell((r as Record<string, unknown>)[h])).join("")}</Row>`).join("\n")}
</Table></Worksheet></Workbook>`;
  triggerDownload(
    new Blob([xml], { type: "application/vnd.ms-excel" }),
    `leads-${new Date().toISOString().slice(0, 10)}.xls`,
  );
}

function downloadPDF(rows: Lead[]) {
  const data = leadExportRows(rows);
  const headers = ["Name", "Phone", "Area", "Source", "Status", "CustomerType", "Owner", "NextAction"];
  const esc = (v: unknown) => String(v ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const html = `<!doctype html><html><head><meta charset="utf-8"><title>Leads Export</title>
<style>
body{font-family:-apple-system,Segoe UI,Roboto,sans-serif;padding:24px;color:#111}
h1{font-size:18px;margin:0 0 12px}
.meta{color:#666;font-size:11px;margin-bottom:16px}
table{width:100%;border-collapse:collapse;font-size:11px}
th,td{border:1px solid #ddd;padding:6px 8px;text-align:left;vertical-align:top}
th{background:#f5f5f5;font-weight:600}
tr:nth-child(even) td{background:#fafafa}
@media print{@page{size:A4 landscape;margin:12mm}}
</style></head><body>
<h1>Lead List Export</h1>
<div class="meta">${new Date().toLocaleString()} · ${data.length} leads</div>
<table><thead><tr>${headers.map((h) => `<th>${h}</th>`).join("")}</tr></thead>
<tbody>${data.map((r) => `<tr>${headers.map((h) => `<td>${esc((r as Record<string, unknown>)[h])}</td>`).join("")}</tr>`).join("")}</tbody>
</table>
<script>window.onload=()=>{setTimeout(()=>window.print(),300)}</script>
</body></html>`;
  const w = window.open("", "_blank");
  if (!w) return;
  w.document.open(); w.document.write(html); w.document.close();
}

// ============ Main page ============
function LeadsPage() {
  const navigate = useNavigate();
  const leads = useStore((s) => s.leads);
  const tickets = useStore((s) => s.tickets);
  const contacts = useStore((s) => s.contacts);
  const organizations = useStore((s) => s.organizations);

  const [filters, setFilters] = useState<FilterState>(EMPTY_FILTERS);
  const [sortKey, setSortKey] = useState<SortKey>("last_touch");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [filterOpen, setFilterOpen] = useState(true);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [drawerLeadId, setDrawerLeadId] = useState<string | null>(null);
  const [savedSegments, setSavedSegments] = useState<{ id: string; name: string; filters: FilterState }[]>([]);
  const [activeSegment, setActiveSegment] = useState<string | null>(null);

  // Load saved segments (client only)
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(SEGMENTS_KEY);
      if (raw) setSavedSegments(JSON.parse(raw));
    } catch { /* ignore */ }
  }, []);

  const persistSegments = (next: typeof savedSegments) => {
    setSavedSegments(next);
    try { localStorage.setItem(SEGMENTS_KEY, JSON.stringify(next)); } catch { /* ignore */ }
  };

  const setF = <K extends keyof FilterState>(k: K, v: FilterState[K]) => {
    setFilters((p) => ({ ...p, [k]: v }));
    setActiveSegment(null);
    setPage(1);
  };

  const owners = useMemo(
    () => Array.from(new Set(leads.map((l) => l.owner))).sort(),
    [leads],
  );
  const areas = useMemo(
    () => Array.from(new Set(leads.map((l) => l.area).filter((a): a is string => !!a))).sort(),
    [leads],
  );

  const orgById = useMemo(() => new Map(organizations.map((o) => [o.id, o])), [organizations]);
  const ticketsByOrg = useMemo(() => {
    const m = new Map<string, number>();
    tickets.forEach((t) => {
      if (t.orgId && (t.status === "open" || t.status === "in_progress")) {
        m.set(t.orgId, (m.get(t.orgId) ?? 0) + 1);
      }
    });
    return m;
  }, [tickets]);

  const inWindow = (iso: string, range: DateFilter): boolean => {
    if (range === "any") return true;
    const days = (Date.now() - new Date(iso).getTime()) / 86_400_000;
    return days <= { "7d": 7, "30d": 30, "90d": 90 }[range];
  };

  const rows = useMemo(() => {
    const q = filters.search.trim().toLowerCase();
    let list = leads.filter((l) => {
      if (q) {
        const orgName = l.orgId ? orgById.get(l.orgId)?.name ?? "" : l.companyName ?? "";
        const hay = [l.name, l.phone, l.email ?? "", orgName].join(" ").toLowerCase().replace(/\s+/g, " ");
        if (!hay.includes(q)) return false;
      }
      if (filters.source !== ANY && !l.tags.includes(filters.source)) return false;
      if (filters.program !== ANY && !l.tags.includes(filters.program)) return false;
      if (filters.purchase !== ANY && !l.tags.includes(filters.purchase)) return false;
      if (filters.tier !== ANY && !l.tags.includes(filters.tier)) return false;
      if (filters.owner !== ANY && l.owner !== filters.owner) return false;
      if (filters.area !== ANY && (l.area ?? "") !== filters.area) return false;
      if (filters.segment !== ANY && (l.segment ?? "") !== filters.segment) return false;
      if (!inWindow(l.last_touch, filters.touchRange)) return false;
      if (filters.staleOnly && !derive(l).stale) return false;
      if (filters.hasNextAction && !l.next_action) return false;
      if (filters.hasOpenTicket && !(l.orgId && (ticketsByOrg.get(l.orgId) ?? 0) > 0)) return false;
      return true;
    });

    if (sortKey) {
      list = [...list].sort((a, b) => {
        let av: number | string, bv: number | string;
        if (sortKey === "name") { av = a.name; bv = b.name; }
        else if (sortKey === "value") { av = a.value; bv = b.value; }
        else { av = new Date(a.last_touch).getTime(); bv = new Date(b.last_touch).getTime(); }
        const cmp = av < bv ? -1 : av > bv ? 1 : 0;
        return sortDir === "asc" ? cmp : -cmp;
      });
    }
    return list;
  }, [leads, filters, sortKey, sortDir, orgById, ticketsByOrg]);

  // KPIs
  const kpis = useMemo(() => {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const isToday = (iso: string) => new Date(iso).getTime() >= today.getTime();
    const newToday = leads.filter((l) => isToday(l.last_touch)).length;
    const qualified = leads.filter((l) => l.tags.includes("mua_lan_dau") || l.tags.includes("mua_lai")).length;
    const repeat = leads.filter((l) => l.tags.includes("mua_lai")).length;
    const gold = leads.filter((l) => l.tags.includes("vang")).length;
    const stale = leads.filter((l) => derive(l).stale).length;
    const buyers = leads.filter((l) => l.tags.includes("mua_lan_dau") || l.tags.includes("mua_lai")).length;
    const conv = leads.length ? Math.round((buyers / leads.length) * 100) : 0;
    return { total: leads.length, newToday, qualified, repeat, gold, stale, conv };
  }, [leads]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const pageRows = rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  useEffect(() => { if (page > totalPages) setPage(1); }, [page, totalPages]);

  // Selection
  const allSelected = pageRows.length > 0 && pageRows.every((r) => selected.has(r.id));
  const toggleAll = () => {
    const s = new Set(selected);
    if (allSelected) pageRows.forEach((r) => s.delete(r.id));
    else pageRows.forEach((r) => s.add(r.id));
    setSelected(s);
  };
  const toggleOne = (id: string) => {
    const s = new Set(selected);
    s.has(id) ? s.delete(id) : s.add(id);
    setSelected(s);
  };
  const clearSelection = () => setSelected(new Set());

  // Filter helpers
  const toggleSort = (k: NonNullable<SortKey>) => {
    if (sortKey === k) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(k); setSortDir("desc"); }
  };
  const resetFilters = () => { setFilters(EMPTY_FILTERS); setActiveSegment(null); setPage(1); };

  const applySegment = (id: string, f: Partial<FilterState>) => {
    setFilters({ ...EMPTY_FILTERS, ...f });
    setActiveSegment(id);
    setPage(1);
  };

  const activeFilterCount = useMemo(() => {
    let n = 0;
    if (filters.source !== ANY) n++;
    if (filters.program !== ANY) n++;
    if (filters.purchase !== ANY) n++;
    if (filters.tier !== ANY) n++;
    if (filters.owner !== ANY) n++;
    if (filters.area !== ANY) n++;
    if (filters.segment !== ANY) n++;
    if (filters.createdRange !== "any") n++;
    if (filters.touchRange !== "any") n++;
    if (filters.staleOnly) n++;
    if (filters.hasNextAction) n++;
    if (filters.hasOpenTicket) n++;
    return n;
  }, [filters]);

  // Bulk action handlers
  const bulkAssign = (owner: string) => {
    selected.forEach((id) => leadActions.update(id, { owner }));
    clearSelection();
  };
  const bulkAddTag = (tag: string) => {
    selected.forEach((id) => leadActions.addTag(id, tag));
    clearSelection();
  };
  const bulkRemoveTag = (tag: string) => {
    selected.forEach((id) => leadActions.removeTag(id, tag));
    clearSelection();
  };
  const bulkArchive = () => {
    if (!confirm(`Archive ${selected.size} leads? This cannot be undone.`)) return;
    selected.forEach((id) => leadActions.remove(id));
    clearSelection();
  };
  const bulkExport = () => {
    const set = selected.size ? rows.filter((r) => selected.has(r.id)) : rows;
    downloadCSV(set);
  };

  const saveCurrentSegment = () => {
    const name = prompt("Segment name");
    if (!name) return;
    persistSegments([
      ...savedSegments,
      { id: `seg_${Date.now()}`, name, filters: { ...filters } },
    ]);
  };
  const deleteSegment = (id: string) => persistSegments(savedSegments.filter((s) => s.id !== id));

  const drawerLead = drawerLeadId ? leads.find((l) => l.id === drawerLeadId) ?? null : null;

  return (
    <TooltipProvider delayDuration={200}>
      <PageHeader
        title="All Leads"
        description="Tag-driven CRM workspace — manage, segment, and accelerate every conversation."
        actions={
          <>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1.5">
                  <Download className="h-4 w-4" /> Export <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  {selected.size ? `${selected.size} selected` : `${rows.length} filtered`}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => downloadExcel(selected.size ? rows.filter((r) => selected.has(r.id)) : rows)}>
                  Excel (.xls)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => downloadPDF(selected.size ? rows.filter((r) => selected.has(r.id)) : rows)}>
                  PDF (print)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => downloadCSV(selected.size ? rows.filter((r) => selected.has(r.id)) : rows)}>
                  CSV
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Link to="/leads/create">
              <Button size="sm" className="gap-1.5"><Plus className="h-4 w-4" /> Create Lead</Button>
            </Link>
          </>
        }
      />

      <div className="mx-auto max-w-7xl px-6 py-6 space-y-5">
        {/* ============ KPI BAR ============ */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          <KPI icon={<Users className="h-4 w-4" />} label="Total Leads" value={kpis.total} trend="+8%" trendUp />
          <KPI icon={<UserPlus className="h-4 w-4" />} label="New Today" value={kpis.newToday} trend="+12%" trendUp />
          <KPI icon={<CheckCircle2 className="h-4 w-4" />} label="Qualified" value={kpis.qualified} trend="+5%" trendUp />
          <KPI icon={<Repeat className="h-4 w-4" />} label="Repeat" value={kpis.repeat} trend="+3%" trendUp />
          <KPI icon={<Crown className="h-4 w-4 text-amber-500" />} label="Gold" value={kpis.gold} trend="+2" trendUp />
          <KPI icon={<Clock className="h-4 w-4 text-destructive" />} label="Stale" value={kpis.stale} trend="-4%" trendUp={false} />
          <KPI icon={<TrendingUp className="h-4 w-4 text-emerald-500" />} label="Conv. Rate" value={`${kpis.conv}%`} trend="+1.4%" trendUp />
        </div>

        {/* ============ SAVED SEGMENTS ============ */}
        <Card>
          <CardContent className="p-3 flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 pr-2 border-r mr-1 text-xs font-medium text-muted-foreground">
              <Bookmark className="h-3.5 w-3.5" /> Segments
            </div>
            {PRESET_SEGMENTS.map((s) => (
              <Button
                key={s.id}
                variant={activeSegment === s.id ? "default" : "outline"}
                size="sm"
                className="h-7 text-xs"
                onClick={() => applySegment(s.id, s.filters)}
              >
                {s.name}
              </Button>
            ))}
            {savedSegments.map((s) => (
              <div key={s.id} className="inline-flex items-center gap-0.5">
                <Button
                  variant={activeSegment === s.id ? "default" : "outline"}
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => applySegment(s.id, s.filters)}
                >
                  {s.name}
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => deleteSegment(s.id)}>
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
            <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 ml-auto" onClick={saveCurrentSegment}>
              <Save className="h-3 w-3" /> Save current
            </Button>
          </CardContent>
        </Card>

        {/* ============ SEARCH + FILTER PANEL ============ */}
        <Card>
          <CardContent className="p-3 space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative flex-1 min-w-[260px]">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={filters.search}
                  onChange={(e) => setF("search", e.target.value)}
                  placeholder="Search by name, phone, email, or company…"
                  className="pl-8"
                />
              </div>
              <Collapsible open={filterOpen} onOpenChange={setFilterOpen}>
                <CollapsibleTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-1.5">
                    <Filter className="h-4 w-4" /> Filters
                    {activeFilterCount > 0 && (
                      <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">{activeFilterCount}</Badge>
                    )}
                    {filterOpen ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                  </Button>
                </CollapsibleTrigger>
              </Collapsible>
              {activeFilterCount > 0 && (
                <Button variant="ghost" size="sm" onClick={resetFilters}>Reset</Button>
              )}
              <div className="text-xs text-muted-foreground ml-auto">
                {rows.length} of {leads.length} leads
              </div>
            </div>

            <Collapsible open={filterOpen} onOpenChange={setFilterOpen}>
              <CollapsibleContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 pt-2 border-t">
                  <FilterField label="Source">
                    <FilterSelect value={filters.source} onChange={(v) => setF("source", v)}
                      options={SOURCE_TAGS.map((t) => [t, tagMeta(t).label])} />
                  </FilterField>
                  <FilterField label="Program">
                    <FilterSelect value={filters.program} onChange={(v) => setF("program", v)}
                      options={PROGRAM_TAGS.map((t) => [t, tagMeta(t).label])} />
                  </FilterField>
                  <FilterField label="Purchase status">
                    <FilterSelect value={filters.purchase} onChange={(v) => setF("purchase", v)}
                      options={PURCHASE_TAGS.map((t) => [t, tagMeta(t).label])} />
                  </FilterField>
                  <FilterField label="Tier">
                    <FilterSelect value={filters.tier} onChange={(v) => setF("tier", v)}
                      options={TIER_TAGS.map((t) => [t, tagMeta(t).label])} />
                  </FilterField>
                  <FilterField label="Owner">
                    <FilterSelect value={filters.owner} onChange={(v) => setF("owner", v)}
                      options={owners.map((o) => [o, o])} />
                  </FilterField>
                  <FilterField label="Area">
                    <FilterSelect value={filters.area} onChange={(v) => setF("area", v)}
                      options={areas.map((a) => [a, a])} />
                  </FilterField>
                  <FilterField label="Customer Type">
                    <FilterSelect value={filters.segment} onChange={(v) => setF("segment", v)}
                      options={SEGMENT_OPTIONS} />
                  </FilterField>
                  <FilterField label="Last touch">
                    <Select value={filters.touchRange} onValueChange={(v) => setF("touchRange", v as DateFilter)}>
                      <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="any">Anytime</SelectItem>
                        <SelectItem value="7d">Last 7 days</SelectItem>
                        <SelectItem value="30d">Last 30 days</SelectItem>
                        <SelectItem value="90d">Last 90 days</SelectItem>
                      </SelectContent>
                    </Select>
                  </FilterField>
                  <FilterField label="Created date">
                    <Select value={filters.createdRange} onValueChange={(v) => setF("createdRange", v as DateFilter)}>
                      <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="any">Anytime</SelectItem>
                        <SelectItem value="7d">Last 7 days</SelectItem>
                        <SelectItem value="30d">Last 30 days</SelectItem>
                        <SelectItem value="90d">Last 90 days</SelectItem>
                      </SelectContent>
                    </Select>
                  </FilterField>
                  <div className="flex flex-col gap-2 justify-end">
                    <ToggleRow label="Stale only" icon={<AlertTriangle className="h-3.5 w-3.5 text-destructive" />}
                      checked={filters.staleOnly} onChange={(v) => setF("staleOnly", v)} />
                    <ToggleRow label="Has next action"
                      checked={filters.hasNextAction} onChange={(v) => setF("hasNextAction", v)} />
                    <ToggleRow label="Has open ticket"
                      checked={filters.hasOpenTicket} onChange={(v) => setF("hasOpenTicket", v)} />
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </CardContent>
        </Card>

        {/* ============ BULK ACTION BAR ============ */}
        {selected.size > 0 && (
          <div className="rounded-xl border bg-primary/5 px-4 py-2.5 flex items-center gap-2 sticky top-14 z-20 backdrop-blur">
            <Checkbox checked onCheckedChange={clearSelection} />
            <span className="text-sm font-medium">{selected.size} selected</span>
            <div className="h-4 w-px bg-border mx-2" />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="outline" className="h-8">Assign owner</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {owners.map((o) => (
                  <DropdownMenuItem key={o} onClick={() => bulkAssign(o)}>{o}</DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="outline" className="h-8">Add tag</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>Add tag</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {Object.entries(TAG_META).filter(([, m]) => m.cat !== "other").map(([k, m]) => (
                  <DropdownMenuItem key={k} onClick={() => bulkAddTag(k)}>
                    <span className={cn("inline-block h-2 w-2 rounded-full mr-2", m.cls)} />
                    {m.label} <span className="text-muted-foreground ml-auto text-[10px] uppercase">{m.cat}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="outline" className="h-8">Remove tag</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {Object.entries(TAG_META).filter(([, m]) => m.cat !== "other").map(([k, m]) => (
                  <DropdownMenuItem key={k} onClick={() => bulkRemoveTag(k)}>{m.label}</DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Button size="sm" variant="outline" className="h-8" onClick={bulkExport}>
              <Download className="h-3.5 w-3.5 mr-1.5" /> Export
            </Button>
            <Button size="sm" variant="outline" className="h-8 text-destructive hover:text-destructive" onClick={bulkArchive}>
              <Trash2 className="h-3.5 w-3.5 mr-1.5" /> Archive
            </Button>
            <Button size="sm" variant="ghost" className="h-8 ml-auto" onClick={clearSelection}>Clear</Button>
          </div>
        )}

        {/* ============ TABLE ============ */}
        <div className="rounded-xl border bg-card overflow-hidden">
          <div className="overflow-auto max-h-[70vh]">
            <Table>
              <TableHeader className="sticky top-0 z-10 bg-muted/80 backdrop-blur">
                <TableRow className="hover:bg-muted/80">
                  <TableHead className="w-10 pl-4">
                    <Checkbox checked={allSelected} onCheckedChange={toggleAll} />
                  </TableHead>
                  <TableHead>
                    <button onClick={() => toggleSort("name")} className="inline-flex items-center gap-1 hover:text-foreground">
                      Lead <ArrowDownUp className="h-3 w-3" />
                    </button>
                  </TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Area</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Customer Type</TableHead>
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
                  <TableHead>Tags</TableHead>
                  <TableHead>Support</TableHead>
                  <TableHead className="text-center pr-4">Stale</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pageRows.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={15} className="text-center py-16 text-sm text-muted-foreground">
                      No leads match these filters.
                    </TableCell>
                  </TableRow>
                )}
                {pageRows.map((l) => {
                  const d = derive(l);
                  const days = daysSince(l.last_touch);
                  const sourceTag = l.tags.find((t) => SOURCE_TAGS.includes(t));
                  const openTickets = l.orgId ? ticketsByOrg.get(l.orgId) ?? 0 : 0;
                  const isSelected = selected.has(l.id);
                  const overdue = d.stale && !!l.next_action;
                  const company = l.orgId ? orgById.get(l.orgId)?.name : l.companyName;
                  return (
                    <TableRow
                      key={l.id}
                      className={cn(
                        "cursor-pointer group",
                        d.high && "bg-destructive/5 hover:bg-destructive/10",
                        isSelected && "bg-primary/5 hover:bg-primary/10",
                      )}
                      onClick={() => setDrawerLeadId(l.id)}
                    >
                      <TableCell className="pl-4" onClick={(e) => e.stopPropagation()}>
                        <Checkbox checked={isSelected} onCheckedChange={() => toggleOne(l.id)} />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {d.high && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="inline-flex items-center rounded-md bg-destructive/10 text-destructive px-1.5 py-0.5 text-[10px] font-bold uppercase">
                                  <Flame className="h-3 w-3" />
                                </span>
                              </TooltipTrigger>
                              <TooltipContent>High priority</TooltipContent>
                            </Tooltip>
                          )}
                          <div className="min-w-0">
                            <div className="font-medium text-sm truncate max-w-[180px]">{l.name}</div>
                            {company && <div className="text-[11px] text-muted-foreground truncate max-w-[180px] flex items-center gap-1"><Building2 className="h-3 w-3" />{company}</div>}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs tabular-nums">{l.phone}</TableCell>
                      <TableCell className="text-xs">
                        {l.area ? <span className="text-foreground">{l.area}</span> : <span className="text-muted-foreground">—</span>}
                      </TableCell>
                      <TableCell>
                        {sourceTag ? <TagBadge tag={sourceTag} /> : <span className="text-xs text-muted-foreground">—</span>}
                      </TableCell>
                      <TableCell>
                        {l.segment ? (
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900">{SEGMENT_LABELS[l.segment]}</Badge>
                        ) : (
                          <Badge variant="outline" className="bg-muted text-muted-foreground border-transparent">{d.type}</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-900">{d.stage}</Badge>
                      </TableCell>
                      <TableCell>
                        {d.tier ? <Badge className={cn("font-semibold", tierClasses(d.tier))}>{d.tier}</Badge> : <span className="text-xs text-muted-foreground">—</span>}
                      </TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <OwnerPicker owner={l.owner} owners={owners} onChange={(o) => leadActions.update(l.id, { owner: o })} />
                      </TableCell>
                      <TableCell className="text-xs">
                        <span className={cn(d.stale && "text-destructive font-medium")}>
                          {days === 0 ? "Today" : `${days}d ago`}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground max-w-[180px] truncate">
                        <span className={cn(overdue && "text-destructive font-medium")}>{l.next_action || "—"}</span>
                      </TableCell>
                      <TableCell className="text-right tabular-nums text-sm">{fmtVND(l.value)}</TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <TagCell lead={l} />
                      </TableCell>
                      <TableCell>
                        {openTickets > 0 ? (
                          <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/40 dark:text-orange-300">
                            {openTickets} open
                          </Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </TableCell>
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

          {/* Pagination */}
          <div className="flex items-center justify-between border-t px-4 py-2.5 bg-muted/30">
            <div className="text-xs text-muted-foreground">
              Showing {pageRows.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}–{(page - 1) * PAGE_SIZE + pageRows.length} of {rows.length}
            </div>
            <div className="flex items-center gap-1">
              <Button variant="outline" size="sm" className="h-7" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>Prev</Button>
              <span className="text-xs px-2 tabular-nums">{page} / {totalPages}</span>
              <Button variant="outline" size="sm" className="h-7" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Next</Button>
            </div>
          </div>
        </div>
      </div>

      {/* ============ QUICK DRAWER ============ */}
      <Sheet open={!!drawerLead} onOpenChange={(o) => !o && setDrawerLeadId(null)}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
          {drawerLead && (
            <LeadDrawer
              lead={drawerLead}
              orgName={drawerLead.orgId ? orgById.get(drawerLead.orgId)?.name : drawerLead.companyName}
              openTickets={drawerLead.orgId ? ticketsByOrg.get(drawerLead.orgId) ?? 0 : 0}
              tickets={tickets.filter((t) => drawerLead.orgId && t.orgId === drawerLead.orgId)}
              contacts={contacts.filter((c) => drawerLead.orgId && c.orgId === drawerLead.orgId)}
              onOpenFull={() => {
                const id = drawerLead.id;
                setDrawerLeadId(null);
                navigate({ to: "/leads/$leadId", params: { leadId: id } });
              }}
            />
          )}
        </SheetContent>
      </Sheet>
    </TooltipProvider>
  );
}

// ============ Sub components ============
function KPI({ icon, label, value, trend, trendUp }: { icon: React.ReactNode; label: string; value: number | string; trend?: string; trendUp?: boolean }) {
  return (
    <Card>
      <CardContent className="p-3">
        <div className="flex items-center justify-between text-muted-foreground text-xs">
          <span className="flex items-center gap-1.5">{icon}{label}</span>
          {trend && (
            <span className={cn("text-[10px] font-medium", trendUp ? "text-emerald-600" : "text-destructive")}>{trend}</span>
          )}
        </div>
        <div className="text-2xl font-semibold mt-1 tabular-nums">{value}</div>
      </CardContent>
    </Card>
  );
}

function FilterField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <Label className="text-[11px] uppercase text-muted-foreground tracking-wide">{label}</Label>
      {children}
    </div>
  );
}

function FilterSelect({
  value, onChange, options,
}: { value: string; onChange: (v: string) => void; options: [string, string][] }) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="h-9"><SelectValue placeholder="All" /></SelectTrigger>
      <SelectContent>
        <SelectItem value={ANY}>All</SelectItem>
        {options.map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}
      </SelectContent>
    </Select>
  );
}

function ToggleRow({ label, icon, checked, onChange }: { label: string; icon?: React.ReactNode; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center gap-2 rounded-md border h-9 px-3">
      {icon}
      <span className="text-xs font-medium flex-1">{label}</span>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

function TagBadge({ tag, onRemove }: { tag: string; onRemove?: () => void }) {
  const m = tagMeta(tag);
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] font-medium", m.cls)}>
      {m.label}
      {onRemove && (
        <button onClick={onRemove} className="hover:opacity-70" aria-label={`Remove ${m.label}`}>
          <X className="h-2.5 w-2.5" />
        </button>
      )}
    </span>
  );
}

function TagCell({ lead }: { lead: Lead }) {
  const visible = lead.tags.slice(0, 3);
  const extra = lead.tags.length - visible.length;
  return (
    <Popover>
      <div className="flex items-center gap-1 flex-wrap max-w-[200px]">
        {visible.map((t) => <TagBadge key={t} tag={t} />)}
        {extra > 0 && (
          <span className="text-[10px] text-muted-foreground">+{extra}</span>
        )}
        <PopoverTrigger asChild>
          <Button size="icon" variant="ghost" className="h-5 w-5 opacity-0 group-hover:opacity-100">
            <TagIcon className="h-3 w-3" />
          </Button>
        </PopoverTrigger>
      </div>
      <PopoverContent className="w-64 p-3" align="start">
        <div className="text-xs font-semibold mb-2">Tags on {lead.name}</div>
        <div className="flex flex-wrap gap-1 mb-3">
          {lead.tags.length === 0 && <span className="text-xs text-muted-foreground">No tags yet.</span>}
          {lead.tags.map((t) => <TagBadge key={t} tag={t} onRemove={() => leadActions.removeTag(lead.id, t)} />)}
        </div>
        <div className="text-xs font-semibold mb-1.5 text-muted-foreground">Add tag</div>
        <div className="max-h-48 overflow-auto space-y-1">
          {(["source", "learning", "program", "purchase", "tier"] as const).map((cat) => (
            <div key={cat}>
              <div className="text-[10px] uppercase text-muted-foreground mt-1.5 mb-0.5">{cat}</div>
              <div className="flex flex-wrap gap-1">
                {Object.entries(TAG_META).filter(([, m]) => m.cat === cat).map(([k, m]) => {
                  const has = lead.tags.includes(k);
                  return (
                    <button
                      key={k}
                      onClick={() => has ? leadActions.removeTag(lead.id, k) : leadActions.addTag(lead.id, k)}
                      className={cn(
                        "inline-flex items-center rounded-md border px-1.5 py-0.5 text-[10px] font-medium transition",
                        has ? m.cls : "bg-background text-muted-foreground hover:bg-muted",
                      )}
                    >
                      {m.label}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

function OwnerPicker({ owner, owners, onChange }: { owner: string; owners: string[]; onChange: (o: string) => void }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="inline-flex items-center gap-1.5 rounded-md hover:bg-muted px-1.5 py-1 transition">
          <span className={cn("inline-flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-semibold text-white", ownerColor(owner))}>
            {initials(owner)}
          </span>
          <span className="text-xs">{owner}</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel className="text-[10px] uppercase">Reassign</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {owners.map((o) => (
          <DropdownMenuItem key={o} onClick={() => onChange(o)}>
            <span className={cn("inline-flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-semibold text-white mr-2", ownerColor(o))}>
              {initials(o)}
            </span>
            {o}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function LeadDrawer({
  lead, orgName, openTickets, tickets, contacts, onOpenFull,
}: {
  lead: Lead;
  orgName?: string;
  openTickets: number;
  tickets: { id: string; subject: string; status: string; priority: string; createdAt: string }[];
  contacts: { id: string; name: string; email?: string; jobTitle?: string }[];
  onOpenFull: () => void;
}) {
  const d = derive(lead);
  return (
    <>
      <SheetHeader className="text-left space-y-2">
        <div className="flex items-center gap-3">
          <span className={cn("inline-flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold text-white", ownerColor(lead.owner))}>
            {initials(lead.name)}
          </span>
          <div className="min-w-0">
            <SheetTitle className="truncate">{lead.name}</SheetTitle>
            <SheetDescription className="flex items-center gap-2 text-xs">
              <Phone className="h-3 w-3" /> {lead.phone}
              {lead.email && <><Mail className="h-3 w-3 ml-2" /> {lead.email}</>}
            </SheetDescription>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline">{d.type}</Badge>
          <Badge variant="outline">{d.stage}</Badge>
          {d.tier && <Badge className={cn(tierClasses(d.tier))}>{d.tier}</Badge>}
          {d.high && <Badge variant="destructive"><Flame className="h-3 w-3 mr-0.5" /> High</Badge>}
          {d.stale && <Badge variant="outline" className="text-destructive border-destructive/40">Stale</Badge>}
        </div>
      </SheetHeader>

      <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
        <Info label="Owner" value={lead.owner} />
        <Info label="Value" value={fmtVND(lead.value)} />
        <Info label="Company" value={orgName || "—"} />
        <Info label="Last touch" value={fmtDate(lead.last_touch)} />
        <Info label="Next action" value={lead.next_action || "—"} full />
      </div>

      <Tabs defaultValue="timeline" className="mt-5">
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="tags">Tags</TabsTrigger>
          <TabsTrigger value="tickets">Tickets {openTickets > 0 && <Badge variant="secondary" className="ml-1 h-4 px-1 text-[10px]">{openTickets}</Badge>}</TabsTrigger>
          <TabsTrigger value="contacts">Contacts</TabsTrigger>
        </TabsList>

        <TabsContent value="timeline" className="mt-3 space-y-2">
          {lead.activities.length === 0 && <p className="text-xs text-muted-foreground">No activities yet.</p>}
          {lead.activities.slice(0, 6).map((a) => (
            <div key={a.id} className="rounded-md border p-2.5 text-xs">
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium flex items-center gap-1.5">
                  <ActivityIcon className="h-3 w-3 text-muted-foreground" />
                  {a.type}
                </span>
                <span className="text-[10px] text-muted-foreground">{fmtDateTime(a.created_at)}</span>
              </div>
              <p className="text-muted-foreground">{a.content}</p>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="tags" className="mt-3">
          <TagCell lead={lead} />
          <div className="mt-3 text-[11px] text-muted-foreground">
            Type, Stage, Tier are computed from tags in real time.
          </div>
        </TabsContent>

        <TabsContent value="tickets" className="mt-3 space-y-2">
          {tickets.length === 0 && <p className="text-xs text-muted-foreground">No support tickets.</p>}
          {tickets.map((t) => (
            <div key={t.id} className="rounded-md border p-2.5 text-xs flex items-center justify-between">
              <div className="min-w-0">
                <div className="font-medium truncate flex items-center gap-1.5"><MessageSquare className="h-3 w-3" />{t.subject}</div>
                <div className="text-[10px] text-muted-foreground">{fmtDate(t.createdAt)} · {t.priority}</div>
              </div>
              <Badge variant="outline">{t.status}</Badge>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="contacts" className="mt-3 space-y-2">
          {contacts.length === 0 && <p className="text-xs text-muted-foreground">No related contacts.</p>}
          {contacts.map((c) => (
            <div key={c.id} className="rounded-md border p-2.5 text-xs">
              <div className="font-medium">{c.name}</div>
              <div className="text-[10px] text-muted-foreground">{c.jobTitle || "—"} · {c.email || "—"}</div>
            </div>
          ))}
        </TabsContent>
      </Tabs>

      <div className="mt-6 flex items-center gap-2">
        <Button className="flex-1" onClick={onOpenFull}>Open full profile</Button>
        <Button variant="outline" size="icon">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </div>
    </>
  );
}

function Info({ label, value, full }: { label: string; value: string; full?: boolean }) {
  return (
    <div className={cn("rounded-md border bg-muted/30 px-2.5 py-1.5", full && "col-span-2")}>
      <div className="text-[10px] uppercase text-muted-foreground tracking-wide">{label}</div>
      <div className="text-xs font-medium truncate">{value}</div>
    </div>
  );
}
