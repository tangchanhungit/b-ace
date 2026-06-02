import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  PackagePlus, PackageMinus, Warehouse, ShieldCheck, UserCog,
  CheckCircle2, XCircle, Clock, FileText, Plus, AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/warehouse-prototype")({
  component: WarehousePrototype,
  head: () => ({
    meta: [
      { title: "Prototype — Quản lý kho theo vai trò | B-ACE" },
      { name: "description", content: "Prototype chức năng quản lý kho: Thủ kho, QC, Quản lý kho với phiếu nhập/xuất, QC, tồn kho theo SKU/lô/hạn dùng." },
    ],
  }),
});

/* ============================================================
   TYPES
============================================================ */
type Role = "keeper" | "qc" | "manager";

type ReceiptStatus = "draft" | "pending_qc" | "qc_passed" | "qc_failed" | "approved" | "stored";
type IssueStatus = "draft" | "pending_approval" | "approved" | "picking" | "shipped" | "rejected";
type QCResult = "pass" | "fail" | "partial";

interface TimelineEvent {
  at: string;
  by: string;
  role: Role;
  action: string;
  note?: string;
}

interface ReceiptLine {
  sku: string;
  name: string;
  lot: string;
  expiry: string; // YYYY-MM-DD
  qty: number;
  qcResult?: QCResult;
  qcNote?: string;
  passedQty?: number;
}

interface Receipt {
  id: string;
  supplier: string;
  poRef: string;
  createdAt: string;
  createdBy: string;
  status: ReceiptStatus;
  lines: ReceiptLine[];
  timeline: TimelineEvent[];
}

interface IssueLine {
  sku: string;
  name: string;
  lot: string;
  qty: number;
}

interface Issue {
  id: string;
  customer: string;
  soRef: string;
  createdAt: string;
  createdBy: string;
  status: IssueStatus;
  lines: IssueLine[];
  timeline: TimelineEvent[];
}

interface StockLot {
  sku: string;
  name: string;
  lot: string;
  expiry: string;
  qty: number;
  location: string;
}

/* ============================================================
   SEED
============================================================ */
const nowISO = () => new Date().toISOString();
const fmt = (iso: string) =>
  new Date(iso).toLocaleString("vi-VN", { dateStyle: "short", timeStyle: "short" });

const SEED_RECEIPTS: Receipt[] = [
  {
    id: "GRN-0001", supplier: "CTY Dược Hậu Giang", poRef: "PO-2026-0142",
    createdAt: "2026-05-28T08:30:00Z", createdBy: "Thủ kho Hà", status: "stored",
    lines: [
      { sku: "MED-001", name: "Paracetamol 500mg", lot: "LOT-2605A", expiry: "2027-05-01", qty: 1000, qcResult: "pass", passedQty: 1000 },
      { sku: "MED-002", name: "Amoxicillin 250mg", lot: "LOT-2605B", expiry: "2027-03-15", qty: 500, qcResult: "pass", passedQty: 500 },
    ],
    timeline: [
      { at: "2026-05-28T08:30:00Z", by: "Thủ kho Hà", role: "keeper", action: "Tạo phiếu nhập" },
      { at: "2026-05-28T09:15:00Z", by: "QC Minh", role: "qc", action: "QC đạt", note: "Đầy đủ chứng từ, đúng quy cách" },
      { at: "2026-05-28T10:00:00Z", by: "QL Tuấn", role: "manager", action: "Duyệt phiếu" },
      { at: "2026-05-28T10:30:00Z", by: "Thủ kho Hà", role: "keeper", action: "Đã nhập kho", note: "Vị trí: A1-02" },
    ],
  },
  {
    id: "GRN-0002", supplier: "Vinamilk Logistics", poRef: "PO-2026-0151",
    createdAt: "2026-06-01T07:20:00Z", createdBy: "Thủ kho Hà", status: "pending_qc",
    lines: [
      { sku: "FMC-010", name: "Sữa tươi 1L", lot: "LOT-0106", expiry: "2026-08-30", qty: 300 },
    ],
    timeline: [
      { at: "2026-06-01T07:20:00Z", by: "Thủ kho Hà", role: "keeper", action: "Tạo phiếu nhập" },
      { at: "2026-06-01T07:45:00Z", by: "Thủ kho Hà", role: "keeper", action: "Gửi QC kiểm tra" },
    ],
  },
  {
    id: "GRN-0003", supplier: "Nhà cung cấp ABC", poRef: "PO-2026-0155",
    createdAt: "2026-06-02T09:00:00Z", createdBy: "Thủ kho Hà", status: "draft",
    lines: [
      { sku: "MED-003", name: "Vitamin C 1000mg", lot: "LOT-0206", expiry: "2027-06-01", qty: 200 },
    ],
    timeline: [
      { at: "2026-06-02T09:00:00Z", by: "Thủ kho Hà", role: "keeper", action: "Tạo phiếu nhập (nháp)" },
    ],
  },
];

const SEED_ISSUES: Issue[] = [
  {
    id: "GIN-0001", customer: "Bệnh viện Bạch Mai", soRef: "SO-2026-0088",
    createdAt: "2026-05-30T14:00:00Z", createdBy: "Thủ kho Hà", status: "shipped",
    lines: [{ sku: "MED-001", name: "Paracetamol 500mg", lot: "LOT-2605A", qty: 200 }],
    timeline: [
      { at: "2026-05-30T14:00:00Z", by: "Thủ kho Hà", role: "keeper", action: "Tạo phiếu xuất" },
      { at: "2026-05-30T14:30:00Z", by: "QL Tuấn", role: "manager", action: "Duyệt phiếu" },
      { at: "2026-05-30T15:00:00Z", by: "Thủ kho Hà", role: "keeper", action: "Soạn hàng & giao" },
    ],
  },
  {
    id: "GIN-0002", customer: "Nhà thuốc Long Châu", soRef: "SO-2026-0091",
    createdAt: "2026-06-02T10:15:00Z", createdBy: "Thủ kho Hà", status: "pending_approval",
    lines: [{ sku: "MED-002", name: "Amoxicillin 250mg", lot: "LOT-2605B", qty: 100 }],
    timeline: [
      { at: "2026-06-02T10:15:00Z", by: "Thủ kho Hà", role: "keeper", action: "Tạo phiếu xuất" },
      { at: "2026-06-02T10:20:00Z", by: "Thủ kho Hà", role: "keeper", action: "Gửi duyệt" },
    ],
  },
];

const SEED_STOCK: StockLot[] = [
  { sku: "MED-001", name: "Paracetamol 500mg", lot: "LOT-2605A", expiry: "2027-05-01", qty: 800, location: "A1-02" },
  { sku: "MED-002", name: "Amoxicillin 250mg", lot: "LOT-2605B", expiry: "2027-03-15", qty: 400, location: "A1-03" },
  { sku: "MED-004", name: "Aspirin 100mg",     lot: "LOT-2504X", expiry: "2026-07-10", qty: 150, location: "A2-01" },
  { sku: "FMC-010", name: "Sữa tươi 1L",        lot: "LOT-0506",  expiry: "2026-06-15", qty: 50,  location: "B1-01" },
];

/* ============================================================
   ROLE CONFIG
============================================================ */
const ROLES: Record<Role, { label: string; user: string; color: string; perms: string[] }> = {
  keeper: {
    label: "Thủ kho", user: "Thủ kho Hà",
    color: "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/30",
    perms: ["Tạo/sửa phiếu nhập", "Gửi QC", "Soạn & giao hàng", "Tạo phiếu xuất"],
  },
  qc: {
    label: "QC", user: "QC Minh",
    color: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30",
    perms: ["Ghi nhận kết quả QC (Đạt/Không đạt)", "Ghi chú kiểm tra"],
  },
  manager: {
    label: "Quản lý kho", user: "QL Tuấn",
    color: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
    perms: ["Duyệt phiếu nhập sau QC", "Duyệt/Từ chối phiếu xuất", "Xem toàn bộ tồn kho"],
  },
};

/* ============================================================
   STATUS BADGE
============================================================ */
const RECEIPT_STATUS: Record<ReceiptStatus, { label: string; cls: string }> = {
  draft:       { label: "Nháp",         cls: "bg-muted text-muted-foreground" },
  pending_qc:  { label: "Chờ QC",       cls: "bg-amber-500/15 text-amber-700 dark:text-amber-300" },
  qc_passed:   { label: "QC đạt",       cls: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300" },
  qc_failed:   { label: "QC không đạt", cls: "bg-rose-500/15 text-rose-700 dark:text-rose-300" },
  approved:    { label: "Đã duyệt",     cls: "bg-sky-500/15 text-sky-700 dark:text-sky-300" },
  stored:      { label: "Đã nhập kho",  cls: "bg-primary/15 text-primary" },
};

const ISSUE_STATUS: Record<IssueStatus, { label: string; cls: string }> = {
  draft:              { label: "Nháp",       cls: "bg-muted text-muted-foreground" },
  pending_approval:   { label: "Chờ duyệt",  cls: "bg-amber-500/15 text-amber-700 dark:text-amber-300" },
  approved:           { label: "Đã duyệt",   cls: "bg-sky-500/15 text-sky-700 dark:text-sky-300" },
  picking:            { label: "Đang soạn",  cls: "bg-violet-500/15 text-violet-700 dark:text-violet-300" },
  shipped:            { label: "Đã giao",    cls: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300" },
  rejected:           { label: "Bị từ chối", cls: "bg-rose-500/15 text-rose-700 dark:text-rose-300" },
};

/* ============================================================
   MAIN COMPONENT
============================================================ */
function WarehousePrototype() {
  const [role, setRole] = useState<Role>("keeper");
  const [receipts, setReceipts] = useState<Receipt[]>(SEED_RECEIPTS);
  const [issues, setIssues] = useState<Issue[]>(SEED_ISSUES);
  const [stock, setStock] = useState<StockLot[]>(SEED_STOCK);

  const [openReceipt, setOpenReceipt] = useState<Receipt | null>(null);
  const [openIssue, setOpenIssue] = useState<Issue | null>(null);
  const [newReceiptOpen, setNewReceiptOpen] = useState(false);
  const [newIssueOpen, setNewIssueOpen] = useState(false);

  const me = ROLES[role];

  const addReceiptEvent = (id: string, ev: Omit<TimelineEvent, "at" | "by" | "role">) => {
    setReceipts((rs) =>
      rs.map((r) =>
        r.id === id
          ? { ...r, timeline: [...r.timeline, { ...ev, at: nowISO(), by: me.user, role }] }
          : r
      )
    );
  };
  const addIssueEvent = (id: string, ev: Omit<TimelineEvent, "at" | "by" | "role">) => {
    setIssues((rs) =>
      rs.map((r) =>
        r.id === id
          ? { ...r, timeline: [...r.timeline, { ...ev, at: nowISO(), by: me.user, role }] }
          : r
      )
    );
  };

  /* ----- Receipt actions ----- */
  const sendToQC = (r: Receipt) => {
    setReceipts((rs) => rs.map((x) => (x.id === r.id ? { ...x, status: "pending_qc" } : x)));
    addReceiptEvent(r.id, { action: "Gửi QC kiểm tra" });
    toast.success(`${r.id}: đã chuyển QC`);
  };
  const recordQC = (r: Receipt, result: QCResult, note: string) => {
    setReceipts((rs) =>
      rs.map((x) =>
        x.id === r.id
          ? {
              ...x,
              status: result === "fail" ? "qc_failed" : "qc_passed",
              lines: x.lines.map((l) => ({ ...l, qcResult: result, qcNote: note, passedQty: result === "fail" ? 0 : l.qty })),
            }
          : x
      )
    );
    addReceiptEvent(r.id, {
      action: result === "pass" ? "QC đạt" : result === "fail" ? "QC không đạt" : "QC đạt 1 phần",
      note,
    });
    toast.success(`${r.id}: kết quả QC đã ghi nhận`);
  };
  const approveReceipt = (r: Receipt) => {
    setReceipts((rs) => rs.map((x) => (x.id === r.id ? { ...x, status: "approved" } : x)));
    addReceiptEvent(r.id, { action: "Duyệt phiếu nhập" });
    toast.success(`${r.id}: đã duyệt`);
  };
  const storeReceipt = (r: Receipt) => {
    // Add stock
    setStock((st) => {
      const next = [...st];
      r.lines.forEach((l) => {
        const passed = l.passedQty ?? l.qty;
        if (passed <= 0) return;
        const idx = next.findIndex((s) => s.sku === l.sku && s.lot === l.lot);
        if (idx >= 0) next[idx] = { ...next[idx], qty: next[idx].qty + passed };
        else next.push({ sku: l.sku, name: l.name, lot: l.lot, expiry: l.expiry, qty: passed, location: "A-NEW" });
      });
      return next;
    });
    setReceipts((rs) => rs.map((x) => (x.id === r.id ? { ...x, status: "stored" } : x)));
    addReceiptEvent(r.id, { action: "Đã nhập kho thực tế" });
    toast.success(`${r.id}: hàng đã vào kho`);
  };

  /* ----- Issue actions ----- */
  const submitIssue = (i: Issue) => {
    setIssues((xs) => xs.map((x) => (x.id === i.id ? { ...x, status: "pending_approval" } : x)));
    addIssueEvent(i.id, { action: "Gửi duyệt phiếu xuất" });
    toast.success(`${i.id}: đã gửi duyệt`);
  };
  const approveIssue = (i: Issue) => {
    setIssues((xs) => xs.map((x) => (x.id === i.id ? { ...x, status: "approved" } : x)));
    addIssueEvent(i.id, { action: "Duyệt phiếu xuất" });
    toast.success(`${i.id}: đã duyệt`);
  };
  const rejectIssue = (i: Issue, reason: string) => {
    setIssues((xs) => xs.map((x) => (x.id === i.id ? { ...x, status: "rejected" } : x)));
    addIssueEvent(i.id, { action: "Từ chối phiếu", note: reason });
    toast.error(`${i.id}: đã từ chối`);
  };
  const shipIssue = (i: Issue) => {
    // Deduct stock
    setStock((st) => {
      const next = [...st];
      i.lines.forEach((l) => {
        const idx = next.findIndex((s) => s.sku === l.sku && s.lot === l.lot);
        if (idx >= 0) next[idx] = { ...next[idx], qty: Math.max(0, next[idx].qty - l.qty) };
      });
      return next;
    });
    setIssues((xs) => xs.map((x) => (x.id === i.id ? { ...x, status: "shipped" } : x)));
    addIssueEvent(i.id, { action: "Soạn hàng & giao thành công" });
    toast.success(`${i.id}: đã giao hàng`);
  };

  /* ----- Stats ----- */
  const stats = useMemo(() => {
    const pendingQC = receipts.filter((r) => r.status === "pending_qc").length;
    const pendingApproval = issues.filter((i) => i.status === "pending_approval").length;
    const totalSKU = new Set(stock.map((s) => s.sku)).size;
    const expiringSoon = stock.filter((s) => {
      const days = (new Date(s.expiry).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
      return days < 90 && s.qty > 0;
    }).length;
    return { pendingQC, pendingApproval, totalSKU, expiringSoon };
  }, [receipts, issues, stock]);

  return (
    <div className="container mx-auto max-w-7xl p-4 md:p-6 space-y-6">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Prototype — Quản lý kho theo vai trò
          </h1>
          <p className="text-muted-foreground mt-1">
            Mô phỏng luồng nghiệp vụ: Thủ kho → QC → Quản lý kho. Phiếu nhập, QC, tồn kho, phiếu xuất.
          </p>
        </div>

        {/* Role switcher */}
        <Card className="md:w-[360px]">
          <CardContent className="p-3 flex items-center gap-3">
            <UserCog className="h-5 w-5 text-muted-foreground shrink-0" />
            <div className="flex-1">
              <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Đang đăng nhập với vai trò</Label>
              <Select value={role} onValueChange={(v) => setRole(v as Role)}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="keeper">Thủ kho — {ROLES.keeper.user}</SelectItem>
                  <SelectItem value="qc">QC — {ROLES.qc.user}</SelectItem>
                  <SelectItem value="manager">Quản lý kho — {ROLES.manager.user}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* PERMISSIONS BANNER */}
      <Card className={`border ${me.color}`}>
        <CardContent className="p-3 flex flex-wrap items-center gap-2 text-sm">
          <Badge className={me.color} variant="outline">{me.label}</Badge>
          <span className="text-muted-foreground">Quyền:</span>
          {me.perms.map((p) => (
            <Badge key={p} variant="secondary" className="font-normal">{p}</Badge>
          ))}
        </CardContent>
      </Card>

      {/* KPI */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard icon={<Clock className="h-4 w-4" />} label="Phiếu chờ QC" value={stats.pendingQC} />
        <KpiCard icon={<FileText className="h-4 w-4" />} label="Phiếu xuất chờ duyệt" value={stats.pendingApproval} />
        <KpiCard icon={<Warehouse className="h-4 w-4" />} label="SKU đang lưu kho" value={stats.totalSKU} />
        <KpiCard icon={<AlertTriangle className="h-4 w-4" />} label="Lô sắp hết hạn (<90 ngày)" value={stats.expiringSoon} warn />
      </div>

      {/* MAIN TABS */}
      <Tabs defaultValue="inbound" className="w-full">
        <TabsList className="grid grid-cols-4 w-full md:w-auto">
          <TabsTrigger value="inbound" className="gap-1"><PackagePlus className="h-4 w-4" />Nhập kho</TabsTrigger>
          <TabsTrigger value="qc" className="gap-1"><ShieldCheck className="h-4 w-4" />QC</TabsTrigger>
          <TabsTrigger value="stock" className="gap-1"><Warehouse className="h-4 w-4" />Tồn kho</TabsTrigger>
          <TabsTrigger value="outbound" className="gap-1"><PackageMinus className="h-4 w-4" />Xuất kho</TabsTrigger>
        </TabsList>

        {/* INBOUND */}
        <TabsContent value="inbound" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Danh sách phiếu nhập kho</CardTitle>
              <Button size="sm" disabled={role !== "keeper"} onClick={() => setNewReceiptOpen(true)}>
                <Plus className="h-4 w-4 mr-1" /> Tạo phiếu nhập
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mã phiếu</TableHead>
                    <TableHead>Nhà cung cấp</TableHead>
                    <TableHead>PO</TableHead>
                    <TableHead>Số dòng</TableHead>
                    <TableHead>Ngày tạo</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {receipts.map((r) => (
                    <TableRow key={r.id} className="cursor-pointer" onClick={() => setOpenReceipt(r)}>
                      <TableCell className="font-medium">{r.id}</TableCell>
                      <TableCell>{r.supplier}</TableCell>
                      <TableCell className="text-muted-foreground">{r.poRef}</TableCell>
                      <TableCell>{r.lines.length}</TableCell>
                      <TableCell className="text-muted-foreground">{fmt(r.createdAt)}</TableCell>
                      <TableCell><Badge className={RECEIPT_STATUS[r.status].cls} variant="outline">{RECEIPT_STATUS[r.status].label}</Badge></TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setOpenReceipt(r); }}>Mở</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* QC */}
        <TabsContent value="qc" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Hàng đợi QC</CardTitle></CardHeader>
            <CardContent>
              {receipts.filter((r) => r.status === "pending_qc").length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">Không có phiếu nào chờ QC.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Mã phiếu</TableHead>
                      <TableHead>NCC</TableHead>
                      <TableHead>Mặt hàng</TableHead>
                      <TableHead>Lô</TableHead>
                      <TableHead>HSD</TableHead>
                      <TableHead>SL</TableHead>
                      <TableHead className="text-right">QC</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {receipts.filter((r) => r.status === "pending_qc").flatMap((r) =>
                      r.lines.map((l, idx) => (
                        <TableRow key={r.id + idx}>
                          <TableCell className="font-medium">{r.id}</TableCell>
                          <TableCell>{r.supplier}</TableCell>
                          <TableCell>{l.name} <span className="text-muted-foreground">({l.sku})</span></TableCell>
                          <TableCell>{l.lot}</TableCell>
                          <TableCell>{l.expiry}</TableCell>
                          <TableCell>{l.qty}</TableCell>
                          <TableCell className="text-right">
                            <Button size="sm" variant="outline" onClick={() => setOpenReceipt(r)} disabled={role !== "qc"}>
                              {role === "qc" ? "Ghi nhận QC" : "Chỉ QC được phép"}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* STOCK */}
        <TabsContent value="stock" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Tồn kho theo SKU / Lô / Hạn dùng</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>SKU</TableHead>
                    <TableHead>Tên hàng</TableHead>
                    <TableHead>Lô</TableHead>
                    <TableHead>HSD</TableHead>
                    <TableHead>Vị trí</TableHead>
                    <TableHead className="text-right">Tồn</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stock.map((s, i) => {
                    const days = Math.round((new Date(s.expiry).getTime() - Date.now()) / 86400000);
                    const expWarn = days < 90;
                    return (
                      <TableRow key={i}>
                        <TableCell className="font-mono text-xs">{s.sku}</TableCell>
                        <TableCell>{s.name}</TableCell>
                        <TableCell>{s.lot}</TableCell>
                        <TableCell className={expWarn ? "text-rose-600 font-medium" : ""}>
                          {s.expiry} <span className="text-xs text-muted-foreground">({days}d)</span>
                        </TableCell>
                        <TableCell>{s.location}</TableCell>
                        <TableCell className="text-right font-semibold">{s.qty}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* OUTBOUND */}
        <TabsContent value="outbound" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Danh sách phiếu xuất kho</CardTitle>
              <Button size="sm" disabled={role !== "keeper"} onClick={() => setNewIssueOpen(true)}>
                <Plus className="h-4 w-4 mr-1" /> Tạo phiếu xuất
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mã phiếu</TableHead>
                    <TableHead>Khách hàng</TableHead>
                    <TableHead>SO</TableHead>
                    <TableHead>Số dòng</TableHead>
                    <TableHead>Ngày tạo</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {issues.map((i) => (
                    <TableRow key={i.id} className="cursor-pointer" onClick={() => setOpenIssue(i)}>
                      <TableCell className="font-medium">{i.id}</TableCell>
                      <TableCell>{i.customer}</TableCell>
                      <TableCell className="text-muted-foreground">{i.soRef}</TableCell>
                      <TableCell>{i.lines.length}</TableCell>
                      <TableCell className="text-muted-foreground">{fmt(i.createdAt)}</TableCell>
                      <TableCell><Badge className={ISSUE_STATUS[i.status].cls} variant="outline">{ISSUE_STATUS[i.status].label}</Badge></TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setOpenIssue(i); }}>Mở</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* RECEIPT DETAIL */}
      {openReceipt && (
        <ReceiptDetailDialog
          receipt={receipts.find((r) => r.id === openReceipt.id) ?? openReceipt}
          role={role}
          onClose={() => setOpenReceipt(null)}
          onSendQC={sendToQC}
          onRecordQC={recordQC}
          onApprove={approveReceipt}
          onStore={storeReceipt}
        />
      )}

      {/* ISSUE DETAIL */}
      {openIssue && (
        <IssueDetailDialog
          issue={issues.find((i) => i.id === openIssue.id) ?? openIssue}
          role={role}
          stock={stock}
          onClose={() => setOpenIssue(null)}
          onSubmit={submitIssue}
          onApprove={approveIssue}
          onReject={rejectIssue}
          onShip={shipIssue}
        />
      )}

      {/* NEW RECEIPT */}
      {newReceiptOpen && (
        <NewReceiptDialog
          onClose={() => setNewReceiptOpen(false)}
          onCreate={(r) => {
            setReceipts((rs) => [{ ...r, timeline: [{ at: nowISO(), by: me.user, role, action: "Tạo phiếu nhập" }] }, ...rs]);
            setNewReceiptOpen(false);
            toast.success(`${r.id}: đã tạo phiếu nhập`);
          }}
        />
      )}

      {/* NEW ISSUE */}
      {newIssueOpen && (
        <NewIssueDialog
          stock={stock}
          onClose={() => setNewIssueOpen(false)}
          onCreate={(i) => {
            setIssues((xs) => [{ ...i, timeline: [{ at: nowISO(), by: me.user, role, action: "Tạo phiếu xuất" }] }, ...xs]);
            setNewIssueOpen(false);
            toast.success(`${i.id}: đã tạo phiếu xuất`);
          }}
        />
      )}
    </div>
  );
}

/* ============================================================
   SUBCOMPONENTS
============================================================ */
function KpiCard({ icon, label, value, warn }: { icon: React.ReactNode; label: string; value: number; warn?: boolean }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">{icon}{label}</div>
        <div className={`text-2xl font-bold mt-1 ${warn && value > 0 ? "text-rose-600" : ""}`}>{value}</div>
      </CardContent>
    </Card>
  );
}

function Timeline({ events }: { events: TimelineEvent[] }) {
  return (
    <ol className="relative border-l pl-4 space-y-3">
      {events.map((e, idx) => (
        <li key={idx} className="relative">
          <span className="absolute -left-[21px] top-1 h-3 w-3 rounded-full bg-primary border-2 border-background" />
          <div className="flex items-center gap-2 text-sm">
            <span className="font-medium">{e.action}</span>
            <Badge variant="outline" className={ROLES[e.role].color}>{ROLES[e.role].label}</Badge>
          </div>
          <div className="text-xs text-muted-foreground">{e.by} · {fmt(e.at)}</div>
          {e.note && <div className="text-xs mt-0.5 text-muted-foreground italic">"{e.note}"</div>}
        </li>
      ))}
    </ol>
  );
}

function ReceiptDetailDialog({
  receipt, role, onClose, onSendQC, onRecordQC, onApprove, onStore,
}: {
  receipt: Receipt; role: Role; onClose: () => void;
  onSendQC: (r: Receipt) => void;
  onRecordQC: (r: Receipt, result: QCResult, note: string) => void;
  onApprove: (r: Receipt) => void;
  onStore: (r: Receipt) => void;
}) {
  const [qcNote, setQcNote] = useState("");
  const s = RECEIPT_STATUS[receipt.status];
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Phiếu nhập {receipt.id} <Badge className={s.cls} variant="outline">{s.label}</Badge>
          </DialogTitle>
          <DialogDescription>NCC: {receipt.supplier} · PO: {receipt.poRef}</DialogDescription>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <h4 className="text-sm font-semibold">Chi tiết hàng hóa</h4>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>SKU</TableHead>
                  <TableHead>Lô / HSD</TableHead>
                  <TableHead className="text-right">SL</TableHead>
                  <TableHead>QC</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {receipt.lines.map((l, idx) => (
                  <TableRow key={idx}>
                    <TableCell>
                      <div className="font-medium">{l.name}</div>
                      <div className="text-xs text-muted-foreground font-mono">{l.sku}</div>
                    </TableCell>
                    <TableCell className="text-xs">{l.lot}<br /><span className="text-muted-foreground">{l.expiry}</span></TableCell>
                    <TableCell className="text-right">{l.qty}</TableCell>
                    <TableCell>
                      {l.qcResult === "pass" && <Badge variant="outline" className="bg-emerald-500/15 text-emerald-700"><CheckCircle2 className="h-3 w-3 mr-1" />Đạt</Badge>}
                      {l.qcResult === "fail" && <Badge variant="outline" className="bg-rose-500/15 text-rose-700"><XCircle className="h-3 w-3 mr-1" />Không đạt</Badge>}
                      {!l.qcResult && <span className="text-xs text-muted-foreground">—</span>}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {role === "qc" && receipt.status === "pending_qc" && (
              <div className="space-y-2 border rounded-md p-3 bg-amber-500/5">
                <Label className="text-xs font-semibold">Ghi nhận kết quả QC</Label>
                <Textarea placeholder="Ghi chú kiểm tra (cảm quan, chứng từ, bao bì...)" value={qcNote} onChange={(e) => setQcNote(e.target.value)} />
                <div className="flex gap-2">
                  <Button size="sm" className="flex-1" onClick={() => onRecordQC(receipt, "pass", qcNote || "Đạt yêu cầu")}>
                    <CheckCircle2 className="h-4 w-4 mr-1" />Đạt
                  </Button>
                  <Button size="sm" variant="destructive" className="flex-1" onClick={() => onRecordQC(receipt, "fail", qcNote || "Không đạt")}>
                    <XCircle className="h-4 w-4 mr-1" />Không đạt
                  </Button>
                </div>
              </div>
            )}
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-3">Timeline trạng thái</h4>
            <Timeline events={receipt.timeline} />
          </div>
        </div>

        <Separator />

        <DialogFooter className="flex-wrap gap-2">
          {role === "keeper" && receipt.status === "draft" && (
            <Button size="sm" onClick={() => onSendQC(receipt)}>Gửi QC</Button>
          )}
          {role === "manager" && receipt.status === "qc_passed" && (
            <Button size="sm" onClick={() => onApprove(receipt)}>Duyệt phiếu</Button>
          )}
          {role === "keeper" && receipt.status === "approved" && (
            <Button size="sm" onClick={() => onStore(receipt)}>Nhập vào kho</Button>
          )}
          <Button size="sm" variant="outline" onClick={onClose}>Đóng</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function IssueDetailDialog({
  issue, role, stock, onClose, onSubmit, onApprove, onReject, onShip,
}: {
  issue: Issue; role: Role; stock: StockLot[]; onClose: () => void;
  onSubmit: (i: Issue) => void;
  onApprove: (i: Issue) => void;
  onReject: (i: Issue, reason: string) => void;
  onShip: (i: Issue) => void;
}) {
  const [reason, setReason] = useState("");
  const s = ISSUE_STATUS[issue.status];

  // Stock check
  const stockWarn = issue.lines.some((l) => {
    const inStock = stock.find((s) => s.sku === l.sku && s.lot === l.lot);
    return !inStock || inStock.qty < l.qty;
  });

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Phiếu xuất {issue.id} <Badge className={s.cls} variant="outline">{s.label}</Badge>
          </DialogTitle>
          <DialogDescription>Khách hàng: {issue.customer} · SO: {issue.soRef}</DialogDescription>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <h4 className="text-sm font-semibold">Chi tiết xuất hàng</h4>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>SKU</TableHead>
                  <TableHead>Lô</TableHead>
                  <TableHead className="text-right">SL xuất</TableHead>
                  <TableHead className="text-right">Tồn hiện tại</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {issue.lines.map((l, idx) => {
                  const inStock = stock.find((s) => s.sku === l.sku && s.lot === l.lot);
                  const ok = inStock && inStock.qty >= l.qty;
                  return (
                    <TableRow key={idx}>
                      <TableCell>
                        <div className="font-medium">{l.name}</div>
                        <div className="text-xs font-mono text-muted-foreground">{l.sku}</div>
                      </TableCell>
                      <TableCell className="text-xs">{l.lot}</TableCell>
                      <TableCell className="text-right">{l.qty}</TableCell>
                      <TableCell className={`text-right ${ok ? "" : "text-rose-600 font-medium"}`}>{inStock?.qty ?? 0}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            {stockWarn && (
              <div className="text-xs text-rose-600 flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" /> Cảnh báo: tồn kho không đủ cho ít nhất 1 dòng.
              </div>
            )}

            {role === "manager" && issue.status === "pending_approval" && (
              <div className="space-y-2 border rounded-md p-3 bg-amber-500/5">
                <Label className="text-xs font-semibold">Lý do (nếu từ chối)</Label>
                <Textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="VD: vượt hạn mức tín dụng" />
              </div>
            )}
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-3">Timeline trạng thái</h4>
            <Timeline events={issue.timeline} />
          </div>
        </div>

        <Separator />

        <DialogFooter className="flex-wrap gap-2">
          {role === "keeper" && issue.status === "draft" && (
            <Button size="sm" onClick={() => onSubmit(issue)}>Gửi duyệt</Button>
          )}
          {role === "manager" && issue.status === "pending_approval" && (
            <>
              <Button size="sm" variant="destructive" onClick={() => onReject(issue, reason || "Không nêu")}>Từ chối</Button>
              <Button size="sm" onClick={() => onApprove(issue)} disabled={stockWarn}>Duyệt</Button>
            </>
          )}
          {role === "keeper" && issue.status === "approved" && (
            <Button size="sm" onClick={() => onShip(issue)}>Soạn & giao hàng</Button>
          )}
          <Button size="sm" variant="outline" onClick={onClose}>Đóng</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function NewReceiptDialog({
  onClose, onCreate,
}: { onClose: () => void; onCreate: (r: Receipt) => void }) {
  const [supplier, setSupplier] = useState("");
  const [poRef, setPoRef] = useState("");
  const [sku, setSku] = useState("");
  const [name, setName] = useState("");
  const [lot, setLot] = useState("");
  const [expiry, setExpiry] = useState("");
  const [qty, setQty] = useState(0);

  const submit = () => {
    if (!supplier || !sku || !name || !lot || !expiry || qty <= 0) {
      toast.error("Vui lòng nhập đủ thông tin"); return;
    }
    const id = `GRN-${String(Math.floor(Math.random() * 9000) + 1000)}`;
    onCreate({
      id, supplier, poRef: poRef || "—",
      createdAt: nowISO(), createdBy: "Thủ kho Hà",
      status: "draft",
      lines: [{ sku, name, lot, expiry, qty }],
      timeline: [],
    });
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader><DialogTitle>Tạo phiếu nhập kho</DialogTitle></DialogHeader>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2"><Label>Nhà cung cấp *</Label><Input value={supplier} onChange={(e) => setSupplier(e.target.value)} /></div>
          <div className="col-span-2"><Label>Mã PO</Label><Input value={poRef} onChange={(e) => setPoRef(e.target.value)} /></div>
          <div><Label>SKU *</Label><Input value={sku} onChange={(e) => setSku(e.target.value)} /></div>
          <div><Label>Tên hàng *</Label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
          <div><Label>Lô *</Label><Input value={lot} onChange={(e) => setLot(e.target.value)} /></div>
          <div><Label>HSD *</Label><Input type="date" value={expiry} onChange={(e) => setExpiry(e.target.value)} /></div>
          <div className="col-span-2"><Label>Số lượng *</Label><Input type="number" value={qty || ""} onChange={(e) => setQty(Number(e.target.value))} /></div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Hủy</Button>
          <Button onClick={submit}>Tạo phiếu</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function NewIssueDialog({
  stock, onClose, onCreate,
}: { stock: StockLot[]; onClose: () => void; onCreate: (i: Issue) => void }) {
  const [customer, setCustomer] = useState("");
  const [soRef, setSoRef] = useState("");
  const [lotKey, setLotKey] = useState<string>("");
  const [qty, setQty] = useState(0);

  const submit = () => {
    if (!customer || !lotKey || qty <= 0) { toast.error("Vui lòng nhập đủ thông tin"); return; }
    const [sku, lot] = lotKey.split("|");
    const s = stock.find((x) => x.sku === sku && x.lot === lot);
    if (!s) return;
    const id = `GIN-${String(Math.floor(Math.random() * 9000) + 1000)}`;
    onCreate({
      id, customer, soRef: soRef || "—",
      createdAt: nowISO(), createdBy: "Thủ kho Hà",
      status: "draft",
      lines: [{ sku: s.sku, name: s.name, lot: s.lot, qty }],
      timeline: [],
    });
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader><DialogTitle>Tạo phiếu xuất kho</DialogTitle></DialogHeader>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2"><Label>Khách hàng *</Label><Input value={customer} onChange={(e) => setCustomer(e.target.value)} /></div>
          <div className="col-span-2"><Label>Mã SO</Label><Input value={soRef} onChange={(e) => setSoRef(e.target.value)} /></div>
          <div className="col-span-2">
            <Label>Chọn lô hàng *</Label>
            <Select value={lotKey} onValueChange={setLotKey}>
              <SelectTrigger><SelectValue placeholder="Chọn SKU + Lô" /></SelectTrigger>
              <SelectContent>
                {stock.filter((s) => s.qty > 0).map((s) => (
                  <SelectItem key={s.sku + s.lot} value={`${s.sku}|${s.lot}`}>
                    {s.name} · {s.lot} · còn {s.qty}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="col-span-2"><Label>Số lượng *</Label><Input type="number" value={qty || ""} onChange={(e) => setQty(Number(e.target.value))} /></div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Hủy</Button>
          <Button onClick={submit}>Tạo phiếu</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
