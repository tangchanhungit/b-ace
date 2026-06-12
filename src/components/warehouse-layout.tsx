// Reusable warehouse UI. Renders the same inbound/QC/stock/outbound flow
// as the original prototype, but isolated per warehouseId.
import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  PackagePlus, PackageMinus, Warehouse as WarehouseIcon, ShieldCheck, UserCog,
  CheckCircle2, XCircle, Clock, FileText, Plus, AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import {
  useWarehouseStore, warehouseDataActions,
  type Role, type Receipt, type Issue, type StockLot, type QCResult,
  type TimelineEvent, type ReceiptStatus, type IssueStatus,
} from "@/lib/warehouse-store";

const nowISO = () => new Date().toISOString();
const fmt = (iso: string) => new Date(iso).toLocaleString("vi-VN", { dateStyle: "short", timeStyle: "short" });

const ROLES: Record<Role, { label: string; user: string; color: string; perms: string[] }> = {
  keeper: { label: "Thủ kho", user: "Thủ kho Hà", color: "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/30",
    perms: ["Tạo/sửa phiếu nhập", "Gửi QC", "Soạn & giao hàng", "Tạo phiếu xuất"] },
  qc: { label: "QC", user: "QC Minh", color: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30",
    perms: ["Ghi nhận kết quả QC", "Ghi chú kiểm tra"] },
  manager: { label: "Quản lý kho", user: "QL Tuấn", color: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
    perms: ["Duyệt phiếu nhập", "Duyệt/Từ chối phiếu xuất", "Xem toàn bộ tồn kho"] },
  admin: { label: "Admin", user: "Admin", color: "bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/30",
    perms: ["Quản lý kho", "Toàn quyền"] },
};

const RECEIPT_STATUS: Record<ReceiptStatus, { label: string; cls: string }> = {
  draft: { label: "Nháp", cls: "bg-muted text-muted-foreground" },
  pending_qc: { label: "Chờ QC", cls: "bg-amber-500/15 text-amber-700 dark:text-amber-300" },
  qc_passed: { label: "QC đạt", cls: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300" },
  qc_failed: { label: "QC không đạt", cls: "bg-rose-500/15 text-rose-700 dark:text-rose-300" },
  approved: { label: "Đã duyệt", cls: "bg-sky-500/15 text-sky-700 dark:text-sky-300" },
  stored: { label: "Đã nhập kho", cls: "bg-primary/15 text-primary" },
};
const ISSUE_STATUS: Record<IssueStatus, { label: string; cls: string }> = {
  draft: { label: "Nháp", cls: "bg-muted text-muted-foreground" },
  pending_approval: { label: "Chờ duyệt", cls: "bg-amber-500/15 text-amber-700 dark:text-amber-300" },
  approved: { label: "Đã duyệt", cls: "bg-sky-500/15 text-sky-700 dark:text-sky-300" },
  picking: { label: "Đang soạn", cls: "bg-violet-500/15 text-violet-700 dark:text-violet-300" },
  shipped: { label: "Đã giao", cls: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300" },
  rejected: { label: "Bị từ chối", cls: "bg-rose-500/15 text-rose-700 dark:text-rose-300" },
};

export function WarehouseLayout({ warehouseId, warehouseName }: { warehouseId: string; warehouseName?: string }) {
  const data = useWarehouseStore((s) => s.data[warehouseId] ?? { receipts: [], issues: [], stock: [] });
  const receipts = data.receipts;
  const issues = data.issues;
  const stock = data.stock;

  const [role, setRole] = useState<Role>("keeper");
  const [openReceipt, setOpenReceipt] = useState<Receipt | null>(null);
  const [openIssue, setOpenIssue] = useState<Issue | null>(null);
  const [newReceiptOpen, setNewReceiptOpen] = useState(false);
  const [newIssueOpen, setNewIssueOpen] = useState(false);

  const me = ROLES[role];

  const setReceipts = (fn: (rs: Receipt[]) => Receipt[]) => warehouseDataActions.setReceipts(warehouseId, fn(receipts));
  const setIssues = (fn: (xs: Issue[]) => Issue[]) => warehouseDataActions.setIssues(warehouseId, fn(issues));
  const setStock = (fn: (st: StockLot[]) => StockLot[]) => warehouseDataActions.setStock(warehouseId, fn(stock));

  const addReceiptEvent = (id: string, ev: Omit<TimelineEvent, "at" | "by" | "role">) => {
    setReceipts((rs) => rs.map((r) => r.id === id ? { ...r, timeline: [...r.timeline, { ...ev, at: nowISO(), by: me.user, role }] } : r));
  };
  const addIssueEvent = (id: string, ev: Omit<TimelineEvent, "at" | "by" | "role">) => {
    setIssues((rs) => rs.map((r) => r.id === id ? { ...r, timeline: [...r.timeline, { ...ev, at: nowISO(), by: me.user, role }] } : r));
  };

  const sendToQC = (r: Receipt) => { setReceipts((rs) => rs.map((x) => x.id === r.id ? { ...x, status: "pending_qc" } : x)); addReceiptEvent(r.id, { action: "Gửi QC kiểm tra" }); toast.success(`${r.id}: đã chuyển QC`); };
  const recordQC = (r: Receipt, result: QCResult, note: string) => {
    setReceipts((rs) => rs.map((x) => x.id === r.id ? { ...x, status: result === "fail" ? "qc_failed" : "qc_passed",
      lines: x.lines.map((l) => ({ ...l, qcResult: result, qcNote: note, passedQty: result === "fail" ? 0 : l.qty })) } : x));
    addReceiptEvent(r.id, { action: result === "pass" ? "QC đạt" : "QC không đạt", note });
    toast.success(`${r.id}: kết quả QC đã ghi nhận`);
  };
  const approveReceipt = (r: Receipt) => { setReceipts((rs) => rs.map((x) => x.id === r.id ? { ...x, status: "approved" } : x)); addReceiptEvent(r.id, { action: "Duyệt phiếu nhập" }); toast.success(`${r.id}: đã duyệt`); };
  const storeReceipt = (r: Receipt) => {
    setStock((st) => {
      const next = [...st];
      r.lines.forEach((l) => {
        const passed = l.passedQty ?? l.qty; if (passed <= 0) return;
        const idx = next.findIndex((s) => s.sku === l.sku && s.lot === l.lot);
        if (idx >= 0) next[idx] = { ...next[idx], qty: next[idx].qty + passed };
        else next.push({ sku: l.sku, name: l.name, lot: l.lot, expiry: l.expiry, qty: passed, location: "A-NEW" });
      });
      return next;
    });
    setReceipts((rs) => rs.map((x) => x.id === r.id ? { ...x, status: "stored" } : x));
    addReceiptEvent(r.id, { action: "Đã nhập kho thực tế" });
    toast.success(`${r.id}: hàng đã vào kho`);
  };

  const submitIssue = (i: Issue) => { setIssues((xs) => xs.map((x) => x.id === i.id ? { ...x, status: "pending_approval" } : x)); addIssueEvent(i.id, { action: "Gửi duyệt phiếu xuất" }); toast.success(`${i.id}: đã gửi duyệt`); };
  const approveIssue = (i: Issue) => { setIssues((xs) => xs.map((x) => x.id === i.id ? { ...x, status: "approved" } : x)); addIssueEvent(i.id, { action: "Duyệt phiếu xuất" }); toast.success(`${i.id}: đã duyệt`); };
  const rejectIssue = (i: Issue, reason: string) => { setIssues((xs) => xs.map((x) => x.id === i.id ? { ...x, status: "rejected" } : x)); addIssueEvent(i.id, { action: "Từ chối phiếu", note: reason }); toast.error(`${i.id}: đã từ chối`); };
  const shipIssue = (i: Issue) => {
    setStock((st) => st.map((s) => {
      const m = i.lines.find((l) => l.sku === s.sku && l.lot === s.lot);
      return m ? { ...s, qty: Math.max(0, s.qty - m.qty) } : s;
    }));
    setIssues((xs) => xs.map((x) => x.id === i.id ? { ...x, status: "shipped" } : x));
    addIssueEvent(i.id, { action: "Soạn hàng & giao thành công" });
    toast.success(`${i.id}: đã giao hàng`);
  };

  const stats = useMemo(() => ({
    pendingQC: receipts.filter((r) => r.status === "pending_qc").length,
    pendingApproval: issues.filter((i) => i.status === "pending_approval").length,
    totalSKU: new Set(stock.map((s) => s.sku)).size,
    expiringSoon: stock.filter((s) => {
      const days = (new Date(s.expiry).getTime() - Date.now()) / 86400000;
      return days < 90 && s.qty > 0;
    }).length,
  }), [receipts, issues, stock]);

  return (
    <div className="space-y-6">
      {/* Role switcher */}
      <Card>
        <CardContent className="p-3 flex flex-wrap items-center gap-3">
          <UserCog className="h-5 w-5 text-muted-foreground shrink-0" />
          <div className="flex-1 min-w-[220px]">
            <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Vai trò đang đăng nhập</Label>
            <Select value={role} onValueChange={(v) => setRole(v as Role)}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="keeper">Thủ kho — {ROLES.keeper.user}</SelectItem>
                <SelectItem value="qc">QC — {ROLES.qc.user}</SelectItem>
                <SelectItem value="manager">Quản lý kho — {ROLES.manager.user}</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <Badge className={me.color} variant="outline">{me.label}</Badge>
            {me.perms.map((p) => <Badge key={p} variant="secondary" className="font-normal">{p}</Badge>)}
          </div>
        </CardContent>
      </Card>

      {/* KPI */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard icon={<Clock className="h-4 w-4" />} label="Phiếu chờ QC" value={stats.pendingQC} />
        <KpiCard icon={<FileText className="h-4 w-4" />} label="Phiếu xuất chờ duyệt" value={stats.pendingApproval} />
        <KpiCard icon={<WarehouseIcon className="h-4 w-4" />} label="SKU đang lưu kho" value={stats.totalSKU} />
        <KpiCard icon={<AlertTriangle className="h-4 w-4" />} label="Lô sắp hết hạn (<90 ngày)" value={stats.expiringSoon} warn />
      </div>

      <Tabs defaultValue="inbound" className="w-full">
        <TabsList className="grid grid-cols-4 w-full md:w-auto">
          <TabsTrigger value="inbound" className="gap-1"><PackagePlus className="h-4 w-4" />Nhập kho</TabsTrigger>
          <TabsTrigger value="qc" className="gap-1"><ShieldCheck className="h-4 w-4" />QC</TabsTrigger>
          <TabsTrigger value="stock" className="gap-1"><WarehouseIcon className="h-4 w-4" />Tồn kho</TabsTrigger>
          <TabsTrigger value="outbound" className="gap-1"><PackageMinus className="h-4 w-4" />Xuất kho</TabsTrigger>
        </TabsList>

        <TabsContent value="inbound" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Phiếu nhập kho {warehouseName ? `— ${warehouseName}` : ""}</CardTitle>
              <Button size="sm" disabled={role !== "keeper"} onClick={() => setNewReceiptOpen(true)}>
                <Plus className="h-4 w-4 mr-1" /> Tạo phiếu nhập
              </Button>
            </CardHeader>
            <CardContent>
              {receipts.length === 0 ? <Empty text="Chưa có phiếu nhập nào." /> : (
                <Table>
                  <TableHeader><TableRow>
                    <TableHead>Mã phiếu</TableHead><TableHead>Nhà cung cấp</TableHead>
                    <TableHead>PO</TableHead><TableHead>Dòng</TableHead>
                    <TableHead>Ngày tạo</TableHead><TableHead>Trạng thái</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow></TableHeader>
                  <TableBody>
                    {receipts.map((r) => (
                      <TableRow key={r.id} className="cursor-pointer" onClick={() => setOpenReceipt(r)}>
                        <TableCell className="font-medium">{r.id}</TableCell>
                        <TableCell>{r.supplier}</TableCell>
                        <TableCell className="text-muted-foreground">{r.poRef}</TableCell>
                        <TableCell>{r.lines.length}</TableCell>
                        <TableCell className="text-muted-foreground">{fmt(r.createdAt)}</TableCell>
                        <TableCell><Badge className={RECEIPT_STATUS[r.status].cls} variant="outline">{RECEIPT_STATUS[r.status].label}</Badge></TableCell>
                        <TableCell className="text-right"><Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setOpenReceipt(r); }}>Mở</Button></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="qc" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Hàng đợi QC</CardTitle></CardHeader>
            <CardContent>
              {receipts.filter((r) => r.status === "pending_qc").length === 0
                ? <Empty text="Không có phiếu nào chờ QC." />
                : <Table>
                  <TableHeader><TableRow>
                    <TableHead>Mã phiếu</TableHead><TableHead>NCC</TableHead><TableHead>Mặt hàng</TableHead>
                    <TableHead>Lô</TableHead><TableHead>HSD</TableHead><TableHead>SL</TableHead>
                    <TableHead className="text-right">QC</TableHead>
                  </TableRow></TableHeader>
                  <TableBody>
                    {receipts.filter((r) => r.status === "pending_qc").flatMap((r) =>
                      r.lines.map((l, idx) => (
                        <TableRow key={r.id + idx}>
                          <TableCell className="font-medium">{r.id}</TableCell>
                          <TableCell>{r.supplier}</TableCell>
                          <TableCell>{l.name} <span className="text-muted-foreground">({l.sku})</span></TableCell>
                          <TableCell>{l.lot}</TableCell><TableCell>{l.expiry}</TableCell><TableCell>{l.qty}</TableCell>
                          <TableCell className="text-right">
                            <Button size="sm" variant="outline" onClick={() => setOpenReceipt(r)} disabled={role !== "qc"}>
                              {role === "qc" ? "Ghi nhận QC" : "Chỉ QC"}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stock" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Tồn kho theo SKU / Lô / HSD</CardTitle></CardHeader>
            <CardContent>
              {stock.length === 0 ? <Empty text="Kho rỗng." /> : (
                <Table>
                  <TableHeader><TableRow>
                    <TableHead>SKU</TableHead><TableHead>Tên hàng</TableHead><TableHead>Lô</TableHead>
                    <TableHead>HSD</TableHead><TableHead>Vị trí</TableHead><TableHead className="text-right">Tồn</TableHead>
                  </TableRow></TableHeader>
                  <TableBody>
                    {stock.map((s, i) => {
                      const days = Math.round((new Date(s.expiry).getTime() - Date.now()) / 86400000);
                      const warn = days < 90;
                      return (
                        <TableRow key={i}>
                          <TableCell className="font-mono text-xs">{s.sku}</TableCell>
                          <TableCell>{s.name}</TableCell><TableCell>{s.lot}</TableCell>
                          <TableCell className={warn ? "text-rose-600 font-medium" : ""}>{s.expiry} <span className="text-xs text-muted-foreground">({isNaN(days) ? "—" : `${days}d`})</span></TableCell>
                          <TableCell>{s.location}</TableCell>
                          <TableCell className="text-right font-semibold">{s.qty}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="outbound" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Phiếu xuất kho</CardTitle>
              <Button size="sm" disabled={role !== "keeper"} onClick={() => setNewIssueOpen(true)}>
                <Plus className="h-4 w-4 mr-1" /> Tạo phiếu xuất
              </Button>
            </CardHeader>
            <CardContent>
              {issues.length === 0 ? <Empty text="Chưa có phiếu xuất nào." /> : (
                <Table>
                  <TableHeader><TableRow>
                    <TableHead>Mã phiếu</TableHead><TableHead>Khách hàng</TableHead><TableHead>SO</TableHead>
                    <TableHead>Dòng</TableHead><TableHead>Ngày tạo</TableHead><TableHead>Trạng thái</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow></TableHeader>
                  <TableBody>
                    {issues.map((i) => (
                      <TableRow key={i.id} className="cursor-pointer" onClick={() => setOpenIssue(i)}>
                        <TableCell className="font-medium">{i.id}</TableCell>
                        <TableCell>{i.customer}</TableCell>
                        <TableCell className="text-muted-foreground">{i.soRef}</TableCell>
                        <TableCell>{i.lines.length}</TableCell>
                        <TableCell className="text-muted-foreground">{fmt(i.createdAt)}</TableCell>
                        <TableCell><Badge className={ISSUE_STATUS[i.status].cls} variant="outline">{ISSUE_STATUS[i.status].label}</Badge></TableCell>
                        <TableCell className="text-right"><Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setOpenIssue(i); }}>Mở</Button></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {openReceipt && (
        <ReceiptDetailDialog
          receipt={receipts.find((r) => r.id === openReceipt.id) ?? openReceipt}
          role={role} onClose={() => setOpenReceipt(null)}
          onSendQC={sendToQC} onRecordQC={recordQC} onApprove={approveReceipt} onStore={storeReceipt}
        />
      )}
      {openIssue && (
        <IssueDetailDialog
          issue={issues.find((i) => i.id === openIssue.id) ?? openIssue}
          role={role} stock={stock} onClose={() => setOpenIssue(null)}
          onSubmit={submitIssue} onApprove={approveIssue} onReject={rejectIssue} onShip={shipIssue}
        />
      )}
      {newReceiptOpen && (
        <NewReceiptDialog
          onClose={() => setNewReceiptOpen(false)}
          onCreate={(r) => {
            setReceipts((rs) => [{ ...r, timeline: [{ at: nowISO(), by: me.user, role, action: "Tạo phiếu nhập" }] }, ...rs]);
            setNewReceiptOpen(false); toast.success(`${r.id}: đã tạo phiếu nhập`);
          }}
        />
      )}
      {newIssueOpen && (
        <NewIssueDialog
          stock={stock} onClose={() => setNewIssueOpen(false)}
          onCreate={(i) => {
            setIssues((xs) => [{ ...i, timeline: [{ at: nowISO(), by: me.user, role, action: "Tạo phiếu xuất" }] }, ...xs]);
            setNewIssueOpen(false); toast.success(`${i.id}: đã tạo phiếu xuất`);
          }}
        />
      )}
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return <p className="text-sm text-muted-foreground text-center py-8">{text}</p>;
}
function KpiCard({ icon, label, value, warn }: { icon: React.ReactNode; label: string; value: number; warn?: boolean }) {
  return (
    <Card><CardContent className="p-4">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">{icon}{label}</div>
      <div className={`text-2xl font-bold mt-1 ${warn && value > 0 ? "text-rose-600" : ""}`}>{value}</div>
    </CardContent></Card>
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

function ReceiptDetailDialog({ receipt, role, onClose, onSendQC, onRecordQC, onApprove, onStore }: {
  receipt: Receipt; role: Role; onClose: () => void;
  onSendQC: (r: Receipt) => void; onRecordQC: (r: Receipt, result: QCResult, note: string) => void;
  onApprove: (r: Receipt) => void; onStore: (r: Receipt) => void;
}) {
  const [qcNote, setQcNote] = useState("");
  const s = RECEIPT_STATUS[receipt.status];
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">Phiếu nhập {receipt.id} <Badge className={s.cls} variant="outline">{s.label}</Badge></DialogTitle>
          <DialogDescription>NCC: {receipt.supplier} · PO: {receipt.poRef}</DialogDescription>
        </DialogHeader>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <h4 className="text-sm font-semibold">Chi tiết hàng hóa</h4>
            <Table>
              <TableHeader><TableRow><TableHead>SKU</TableHead><TableHead>Lô / HSD</TableHead><TableHead className="text-right">SL</TableHead><TableHead>QC</TableHead></TableRow></TableHeader>
              <TableBody>
                {receipt.lines.map((l, idx) => (
                  <TableRow key={idx}>
                    <TableCell><div className="font-medium">{l.name}</div><div className="text-xs text-muted-foreground font-mono">{l.sku}</div></TableCell>
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
                <Textarea placeholder="Ghi chú kiểm tra..." value={qcNote} onChange={(e) => setQcNote(e.target.value)} />
                <div className="flex gap-2">
                  <Button size="sm" className="flex-1" onClick={() => onRecordQC(receipt, "pass", qcNote || "Đạt yêu cầu")}><CheckCircle2 className="h-4 w-4 mr-1" />Đạt</Button>
                  <Button size="sm" variant="destructive" className="flex-1" onClick={() => onRecordQC(receipt, "fail", qcNote || "Không đạt")}><XCircle className="h-4 w-4 mr-1" />Không đạt</Button>
                </div>
              </div>
            )}
          </div>
          <div><h4 className="text-sm font-semibold mb-3">Timeline</h4><Timeline events={receipt.timeline} /></div>
        </div>
        <Separator />
        <DialogFooter className="flex-wrap gap-2">
          {role === "keeper" && receipt.status === "draft" && <Button size="sm" onClick={() => onSendQC(receipt)}>Gửi QC</Button>}
          {role === "manager" && receipt.status === "qc_passed" && <Button size="sm" onClick={() => onApprove(receipt)}>Duyệt phiếu</Button>}
          {role === "keeper" && receipt.status === "approved" && <Button size="sm" onClick={() => onStore(receipt)}>Nhập vào kho</Button>}
          <Button size="sm" variant="outline" onClick={onClose}>Đóng</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function IssueDetailDialog({ issue, role, stock, onClose, onSubmit, onApprove, onReject, onShip }: {
  issue: Issue; role: Role; stock: StockLot[]; onClose: () => void;
  onSubmit: (i: Issue) => void; onApprove: (i: Issue) => void;
  onReject: (i: Issue, reason: string) => void; onShip: (i: Issue) => void;
}) {
  const [reason, setReason] = useState("");
  const s = ISSUE_STATUS[issue.status];
  const stockWarn = issue.lines.some((l) => {
    const inStock = stock.find((s) => s.sku === l.sku && s.lot === l.lot);
    return !inStock || inStock.qty < l.qty;
  });
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">Phiếu xuất {issue.id} <Badge className={s.cls} variant="outline">{s.label}</Badge></DialogTitle>
          <DialogDescription>Khách hàng: {issue.customer} · SO: {issue.soRef}</DialogDescription>
        </DialogHeader>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <h4 className="text-sm font-semibold">Chi tiết xuất hàng</h4>
            <Table>
              <TableHeader><TableRow><TableHead>SKU</TableHead><TableHead>Lô</TableHead><TableHead className="text-right">SL xuất</TableHead><TableHead className="text-right">Tồn</TableHead></TableRow></TableHeader>
              <TableBody>
                {issue.lines.map((l, idx) => {
                  const inStock = stock.find((s) => s.sku === l.sku && s.lot === l.lot);
                  const ok = inStock && inStock.qty >= l.qty;
                  return (
                    <TableRow key={idx}>
                      <TableCell><div className="font-medium">{l.name}</div><div className="text-xs font-mono text-muted-foreground">{l.sku}</div></TableCell>
                      <TableCell className="text-xs">{l.lot}</TableCell>
                      <TableCell className="text-right">{l.qty}</TableCell>
                      <TableCell className={`text-right ${ok ? "" : "text-rose-600 font-medium"}`}>{inStock?.qty ?? 0}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            {stockWarn && <div className="text-xs text-rose-600 flex items-center gap-1"><AlertTriangle className="h-3 w-3" /> Tồn kho không đủ.</div>}
            {role === "manager" && issue.status === "pending_approval" && (
              <div className="space-y-2 border rounded-md p-3 bg-amber-500/5">
                <Label className="text-xs font-semibold">Lý do (nếu từ chối)</Label>
                <Textarea value={reason} onChange={(e) => setReason(e.target.value)} />
              </div>
            )}
          </div>
          <div><h4 className="text-sm font-semibold mb-3">Timeline</h4><Timeline events={issue.timeline} /></div>
        </div>
        <Separator />
        <DialogFooter className="flex-wrap gap-2">
          {role === "keeper" && issue.status === "draft" && <Button size="sm" onClick={() => onSubmit(issue)}>Gửi duyệt</Button>}
          {role === "manager" && issue.status === "pending_approval" && (
            <>
              <Button size="sm" variant="destructive" onClick={() => onReject(issue, reason || "Không nêu")}>Từ chối</Button>
              <Button size="sm" onClick={() => onApprove(issue)} disabled={stockWarn}>Duyệt</Button>
            </>
          )}
          {role === "keeper" && issue.status === "approved" && <Button size="sm" onClick={() => onShip(issue)}>Soạn & giao</Button>}
          <Button size="sm" variant="outline" onClick={onClose}>Đóng</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function NewReceiptDialog({ onClose, onCreate }: { onClose: () => void; onCreate: (r: Receipt) => void }) {
  const [supplier, setSupplier] = useState("");
  const [poRef, setPoRef] = useState("");
  const [sku, setSku] = useState(""); const [name, setName] = useState("");
  const [lot, setLot] = useState(""); const [expiry, setExpiry] = useState("");
  const [qty, setQty] = useState(0);
  const submit = () => {
    if (!supplier || !sku || !name || !lot || !expiry || qty <= 0) { toast.error("Vui lòng nhập đủ thông tin"); return; }
    const id = `GRN-${String(Math.floor(Math.random() * 9000) + 1000)}`;
    onCreate({ id, supplier, poRef: poRef || "—", createdAt: nowISO(), createdBy: "Thủ kho Hà",
      status: "draft", lines: [{ sku, name, lot, expiry, qty }], timeline: [] });
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
        <DialogFooter><Button variant="outline" onClick={onClose}>Hủy</Button><Button onClick={submit}>Tạo phiếu</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function NewIssueDialog({ stock, onClose, onCreate }: { stock: StockLot[]; onClose: () => void; onCreate: (i: Issue) => void }) {
  const [customer, setCustomer] = useState(""); const [soRef, setSoRef] = useState("");
  const [lotKey, setLotKey] = useState(""); const [qty, setQty] = useState(0);
  const submit = () => {
    if (!customer || !lotKey || qty <= 0) { toast.error("Vui lòng nhập đủ thông tin"); return; }
    const [sku, lot] = lotKey.split("|");
    const s = stock.find((x) => x.sku === sku && x.lot === lot);
    if (!s) return;
    const id = `GIN-${String(Math.floor(Math.random() * 9000) + 1000)}`;
    onCreate({ id, customer, soRef: soRef || "—", createdAt: nowISO(), createdBy: "Thủ kho Hà",
      status: "draft", lines: [{ sku: s.sku, name: s.name, lot: s.lot, qty }], timeline: [] });
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
                  <SelectItem key={s.sku + s.lot} value={`${s.sku}|${s.lot}`}>{s.name} · {s.lot} · còn {s.qty}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="col-span-2"><Label>Số lượng *</Label><Input type="number" value={qty || ""} onChange={(e) => setQty(Number(e.target.value))} /></div>
        </div>
        <DialogFooter><Button variant="outline" onClick={onClose}>Hủy</Button><Button onClick={submit}>Tạo phiếu</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
