import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowRight, Plus } from "lucide-react";
import { toast } from "sonner";
import {
  useWarehouseStore, transferActions, type TransferStatus,
} from "@/lib/warehouse-store";

export const Route = createFileRoute("/warehouses/transfers")({
  component: TransfersPage,
  head: () => ({ meta: [{ title: "Chuyển kho — Multi-warehouse | B-ACE" }] }),
});

const STATUS_LABEL: Record<TransferStatus, { label: string; cls: string }> = {
  pending: { label: "Chờ duyệt", cls: "bg-amber-500/15 text-amber-700 dark:text-amber-300" },
  approved: { label: "Đã duyệt", cls: "bg-sky-500/15 text-sky-700 dark:text-sky-300" },
  in_transit: { label: "Đang vận chuyển", cls: "bg-violet-500/15 text-violet-700 dark:text-violet-300" },
  completed: { label: "Hoàn tất", cls: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300" },
  cancelled: { label: "Đã hủy", cls: "bg-rose-500/15 text-rose-700 dark:text-rose-300" },
};

function TransfersPage() {
  const warehouses = useWarehouseStore((s) => s.warehouses);
  const transfers = useWarehouseStore((s) => s.transfers);
  const data = useWarehouseStore((s) => s.data);
  const [open, setOpen] = useState(false);

  return (
    <>
      <PageHeader
        title="Chuyển kho giữa các kho"
        description="Yêu cầu, duyệt và theo dõi luồng hàng giữa các kho."
        breadcrumb={<Link to="/warehouses" className="hover:underline">Danh sách kho</Link>}
        actions={<Button size="sm" onClick={() => setOpen(true)}><Plus className="h-4 w-4 mr-1" /> Tạo yêu cầu</Button>}
      />
      <div className="mx-auto max-w-7xl px-6 py-6">
        <Card>
          <CardHeader><CardTitle className="text-base">Phiếu chuyển kho</CardTitle></CardHeader>
          <CardContent>
            {transfers.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">Chưa có phiếu chuyển nào.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mã</TableHead><TableHead>Từ kho</TableHead>
                    <TableHead></TableHead>
                    <TableHead>Đến kho</TableHead><TableHead>SKU / Lô</TableHead>
                    <TableHead className="text-right">SL</TableHead><TableHead>Lý do</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transfers.map((t) => {
                    const from = warehouses.find((w) => w.id === t.fromWarehouseId);
                    const to = warehouses.find((w) => w.id === t.toWarehouseId);
                    return (
                      <TableRow key={t.id}>
                        <TableCell className="font-mono text-xs">{t.id}</TableCell>
                        <TableCell>{from?.name ?? t.fromWarehouseId}</TableCell>
                        <TableCell><ArrowRight className="h-3 w-3 text-muted-foreground" /></TableCell>
                        <TableCell>{to?.name ?? t.toWarehouseId}</TableCell>
                        <TableCell className="text-xs"><div className="font-medium">{t.name}</div><div className="font-mono text-muted-foreground">{t.sku} · {t.lot}</div></TableCell>
                        <TableCell className="text-right font-semibold">{t.qty}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{t.reason}</TableCell>
                        <TableCell><Badge variant="outline" className={STATUS_LABEL[t.status].cls}>{STATUS_LABEL[t.status].label}</Badge></TableCell>
                        <TableCell className="text-right space-x-1">
                          {t.status === "pending" && (
                            <>
                              <Button size="sm" variant="outline" onClick={() => { transferActions.approve(t.id, "QL Tuấn"); toast.success("Đã duyệt"); }}>Duyệt</Button>
                              <Button size="sm" variant="ghost" onClick={() => transferActions.cancel(t.id)}>Hủy</Button>
                            </>
                          )}
                          {t.status === "approved" && (
                            <Button size="sm" variant="outline" onClick={() => { transferActions.ship(t.id); toast.success("Đang vận chuyển"); }}>Xuất kho nguồn</Button>
                          )}
                          {t.status === "in_transit" && (
                            <Button size="sm" onClick={() => { transferActions.complete(t.id); toast.success("Đã nhập kho đích"); }}>Hoàn tất</Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
      {open && (
        <NewTransferDialog
          onClose={() => setOpen(false)}
          warehouses={warehouses}
          data={data}
          onCreate={(p) => {
            transferActions.create(p);
            toast.success("Đã tạo phiếu chuyển kho");
            setOpen(false);
          }}
        />
      )}
    </>
  );
}

function NewTransferDialog({
  onClose, warehouses, data, onCreate,
}: {
  onClose: () => void;
  warehouses: { id: string; name: string }[];
  data: Record<string, { stock: { sku: string; name: string; lot: string; qty: number }[] }>;
  onCreate: (p: { fromWarehouseId: string; toWarehouseId: string; sku: string; name: string; lot: string; qty: number; reason: string; requestedBy: string }) => void;
}) {
  const wh = warehouses;
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [lotKey, setLotKey] = useState("");
  const [qty, setQty] = useState(0);
  const [reason, setReason] = useState("");

  const fromStock = useMemo(() => (from ? (data[from]?.stock ?? []) : []), [from, data]);

  const submit = () => {
    if (!from || !to || from === to || !lotKey || qty <= 0) {
      toast.error("Vui lòng chọn 2 kho khác nhau, lô và số lượng"); return;
    }
    const [sku, lot] = lotKey.split("|");
    const s = fromStock.find((x) => x.sku === sku && x.lot === lot);
    if (!s) return;
    if (qty > s.qty) { toast.error(`Vượt tồn (còn ${s.qty})`); return; }
    onCreate({
      fromWarehouseId: from, toWarehouseId: to,
      sku: s.sku, name: s.name, lot: s.lot, qty,
      reason: reason || "—", requestedBy: "Thủ kho Hà",
    });
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader><DialogTitle>Tạo phiếu chuyển kho</DialogTitle></DialogHeader>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Từ kho *</Label>
            <Select value={from} onValueChange={(v) => { setFrom(v); setLotKey(""); }}>
              <SelectTrigger><SelectValue placeholder="Chọn kho nguồn" /></SelectTrigger>
              <SelectContent>{wh.map((w) => <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <Label>Đến kho *</Label>
            <Select value={to} onValueChange={setTo}>
              <SelectTrigger><SelectValue placeholder="Chọn kho đích" /></SelectTrigger>
              <SelectContent>{wh.filter((w) => w.id !== from).map((w) => <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="col-span-2">
            <Label>SKU / Lô *</Label>
            <Select value={lotKey} onValueChange={setLotKey} disabled={!from}>
              <SelectTrigger><SelectValue placeholder={from ? "Chọn lô từ kho nguồn" : "Chọn kho nguồn trước"} /></SelectTrigger>
              <SelectContent>
                {fromStock.filter((s) => s.qty > 0).map((s) => (
                  <SelectItem key={s.sku + s.lot} value={`${s.sku}|${s.lot}`}>{s.name} · {s.lot} · còn {s.qty}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="col-span-2"><Label>Số lượng *</Label><Input type="number" value={qty || ""} onChange={(e) => setQty(Number(e.target.value))} /></div>
          <div className="col-span-2"><Label>Lý do</Label><Textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="VD: cân đối tồn giữa các kho" /></div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Hủy</Button>
          <Button onClick={submit}>Tạo phiếu</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
