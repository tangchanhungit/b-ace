import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Warehouse as WarehouseIcon, Plus, Pencil, Archive, Trash2, ArrowRight, MapPin,
} from "lucide-react";
import { toast } from "sonner";
import {
  useWarehouseStore, warehouseActions,
  type Warehouse, type WarehouseType, type WarehouseStatus,
} from "@/lib/warehouse-store";

export const Route = createFileRoute("/warehouses/")({
  component: WarehousesIndex,
  head: () => ({
    meta: [
      { title: "Danh sách kho — Quản lý nhiều kho | B-ACE" },
      { name: "description", content: "Quản lý nhiều kho hàng song song: thông tin, tồn kho, trạng thái và truy cập nhanh từng kho." },
    ],
  }),
});

const TYPE_LABEL: Record<WarehouseType, string> = {
  central: "Kho trung tâm", branch: "Kho chi nhánh",
  transit: "Kho trung chuyển", cold: "Kho lạnh",
};
const STATUS_CLS: Record<WarehouseStatus, string> = {
  active: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  inactive: "bg-muted text-muted-foreground",
  archived: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
};

function WarehousesIndex() {
  const warehouses = useWarehouseStore((s) => s.warehouses);
  const data = useWarehouseStore((s) => s.data);
  const [editing, setEditing] = useState<Warehouse | null>(null);
  const [creating, setCreating] = useState(false);

  const totalStockOf = (id: string) =>
    (data[id]?.stock ?? []).reduce((sum, s) => sum + s.qty, 0);
  const skuCountOf = (id: string) =>
    new Set((data[id]?.stock ?? []).map((s) => s.sku)).size;

  return (
    <>
      <PageHeader
        title="Danh sách kho"
        description="Quản lý nhiều kho — mỗi kho có tồn kho và quy trình độc lập."
        actions={
          <>
            <Button asChild variant="outline" size="sm">
              <Link to="/warehouses/dashboard">Dashboard tổng</Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link to="/warehouses/transfers">Chuyển kho</Link>
            </Button>
            <Button size="sm" onClick={() => setCreating(true)}>
              <Plus className="h-4 w-4 mr-1" /> Tạo kho mới
            </Button>
          </>
        }
      />

      <div className="mx-auto max-w-7xl px-6 py-6 space-y-6">
        {/* Card grid view */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {warehouses.map((w) => (
            <Card key={w.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-5 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-xs font-mono text-muted-foreground">{w.code}</div>
                    <div className="font-semibold flex items-center gap-2">
                      <WarehouseIcon className="h-4 w-4" /> {w.name}
                    </div>
                  </div>
                  <Badge variant="outline" className={STATUS_CLS[w.status]}>
                    {w.status === "active" ? "Hoạt động" : w.status === "archived" ? "Lưu trữ" : "Tạm dừng"}
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground space-y-1">
                  <div>{TYPE_LABEL[w.type]}</div>
                  <div className="flex items-center gap-1"><MapPin className="h-3 w-3" />{w.address}</div>
                  <div>QL: {w.manager}</div>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-2 border-t">
                  <div><div className="text-[10px] uppercase text-muted-foreground">SKU</div><div className="font-semibold">{skuCountOf(w.id)}</div></div>
                  <div><div className="text-[10px] uppercase text-muted-foreground">Tồn</div><div className="font-semibold">{totalStockOf(w.id).toLocaleString()}</div></div>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button asChild size="sm" className="flex-1">
                    <Link to="/warehouses/$warehouseId" params={{ warehouseId: w.id }}>
                      Vào kho <ArrowRight className="h-3 w-3 ml-1" />
                    </Link>
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setEditing(w)}>
                    <Pencil className="h-3 w-3" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => { warehouseActions.archive(w.id); toast.success("Đã lưu trữ kho"); }}>
                    <Archive className="h-3 w-3" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => {
                    if (confirm(`Xóa ${w.name}?`)) { warehouseActions.remove(w.id); toast.success("Đã xóa kho"); }
                  }}>
                    <Trash2 className="h-3 w-3 text-rose-600" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Compact table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mã</TableHead><TableHead>Tên kho</TableHead><TableHead>Loại</TableHead>
                  <TableHead>Địa chỉ</TableHead><TableHead>Quản lý</TableHead>
                  <TableHead className="text-right">SKU</TableHead><TableHead className="text-right">Tồn</TableHead>
                  <TableHead>Trạng thái</TableHead><TableHead>Ngày tạo</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {warehouses.map((w) => (
                  <TableRow key={w.id}>
                    <TableCell className="font-mono text-xs">{w.code}</TableCell>
                    <TableCell className="font-medium">{w.name}</TableCell>
                    <TableCell>{TYPE_LABEL[w.type]}</TableCell>
                    <TableCell className="text-muted-foreground text-xs">{w.address}</TableCell>
                    <TableCell>{w.manager}</TableCell>
                    <TableCell className="text-right">{skuCountOf(w.id)}</TableCell>
                    <TableCell className="text-right">{totalStockOf(w.id).toLocaleString()}</TableCell>
                    <TableCell><Badge variant="outline" className={STATUS_CLS[w.status]}>
                      {w.status === "active" ? "Hoạt động" : w.status === "archived" ? "Lưu trữ" : "Tạm dừng"}
                    </Badge></TableCell>
                    <TableCell className="text-xs text-muted-foreground">{new Date(w.createdAt).toLocaleDateString("vi-VN")}</TableCell>
                    <TableCell className="text-right">
                      <Button asChild size="sm" variant="ghost">
                        <Link to="/warehouses/$warehouseId" params={{ warehouseId: w.id }}>Vào</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {(creating || editing) && (
        <WarehouseFormDialog
          initial={editing ?? undefined}
          onClose={() => { setCreating(false); setEditing(null); }}
          onSubmit={(payload) => {
            if (editing) {
              warehouseActions.update(editing.id, payload);
              toast.success("Đã cập nhật kho");
            } else {
              warehouseActions.create(payload);
              toast.success("Đã tạo kho mới");
            }
            setCreating(false); setEditing(null);
          }}
        />
      )}
    </>
  );
}

function WarehouseFormDialog({
  initial, onClose, onSubmit,
}: {
  initial?: Warehouse;
  onClose: () => void;
  onSubmit: (p: Omit<Warehouse, "id" | "createdAt" | "status"> & { status?: WarehouseStatus }) => void;
}) {
  const [code, setCode] = useState(initial?.code ?? "");
  const [name, setName] = useState(initial?.name ?? "");
  const [type, setType] = useState<WarehouseType>(initial?.type ?? "branch");
  const [address, setAddress] = useState(initial?.address ?? "");
  const [manager, setManager] = useState(initial?.manager ?? "");
  const [status, setStatus] = useState<WarehouseStatus>(initial?.status ?? "active");

  const submit = () => {
    if (!name || !code) { toast.error("Vui lòng nhập mã và tên kho"); return; }
    onSubmit({ code, name, type, address, manager, status });
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader><DialogTitle>{initial ? "Sửa kho" : "Tạo kho mới"}</DialogTitle></DialogHeader>
        <div className="grid grid-cols-2 gap-3">
          <div><Label>Mã kho *</Label><Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="WH-004" /></div>
          <div><Label>Tên kho *</Label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Kho Đà Nẵng" /></div>
          <div>
            <Label>Loại kho</Label>
            <Select value={type} onValueChange={(v) => setType(v as WarehouseType)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="central">Kho trung tâm</SelectItem>
                <SelectItem value="branch">Kho chi nhánh</SelectItem>
                <SelectItem value="transit">Kho trung chuyển</SelectItem>
                <SelectItem value="cold">Kho lạnh</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Trạng thái</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as WarehouseStatus)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Hoạt động</SelectItem>
                <SelectItem value="inactive">Tạm dừng</SelectItem>
                <SelectItem value="archived">Lưu trữ</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="col-span-2"><Label>Địa chỉ</Label><Input value={address} onChange={(e) => setAddress(e.target.value)} /></div>
          <div className="col-span-2"><Label>Quản lý kho</Label><Input value={manager} onChange={(e) => setManager(e.target.value)} /></div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Hủy</Button>
          <Button onClick={submit}>{initial ? "Lưu" : "Tạo"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
