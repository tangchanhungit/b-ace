import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";
import { WarehouseLayout } from "@/components/warehouse-layout";
import { useWarehouseStore } from "@/lib/warehouse-store";

export const Route = createFileRoute("/warehouses/$warehouseId")({
  component: WarehouseDetail,
  head: ({ params }) => ({
    meta: [{ title: `Kho ${params.warehouseId} | B-ACE` }],
  }),
});

function WarehouseDetail() {
  const { warehouseId } = Route.useParams();
  const warehouse = useWarehouseStore((s) => s.warehouses.find((w) => w.id === warehouseId));

  if (!warehouse) {
    return (
      <>
        <PageHeader title="Không tìm thấy kho" />
        <div className="mx-auto max-w-7xl px-6 py-12 text-center">
          <p className="text-muted-foreground">Kho "{warehouseId}" không tồn tại.</p>
          <Button asChild className="mt-4"><Link to="/warehouses">Về danh sách kho</Link></Button>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title={warehouse.name}
        description={`${warehouse.code} · ${warehouse.address} · QL: ${warehouse.manager}`}
        breadcrumb={
          <Link to="/warehouses" className="hover:underline inline-flex items-center gap-1">
            <ArrowLeft className="h-3 w-3" /> Danh sách kho
          </Link>
        }
        actions={
          <>
            <Badge variant="outline">
              {warehouse.status === "active" ? "Hoạt động" : warehouse.status === "archived" ? "Lưu trữ" : "Tạm dừng"}
            </Badge>
            <Button asChild variant="outline" size="sm">
              <Link to="/warehouses/transfers">Chuyển kho</Link>
            </Button>
          </>
        }
      />
      <div className="mx-auto max-w-7xl px-6 py-6">
        <WarehouseLayout warehouseId={warehouseId} warehouseName={warehouse.name} />
      </div>
    </>
  );
}
