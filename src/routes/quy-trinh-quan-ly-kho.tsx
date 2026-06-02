import { createFileRoute, Link } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  PackagePlus,
  Warehouse,
  PackageMinus,
  ClipboardList,
  CheckCircle2,
  Search,
  ShieldCheck,
  Barcode,
  MapPin,
  Timer,
  FileCheck,
  Box,
  Truck,
  Database,
  TrendingDown,
  ScanLine,
  Link2,
  ArrowRight,
  ChevronDown,
  ArrowDown,
} from "lucide-react";

export const Route = createFileRoute("/quy-trinh-quan-ly-kho")({
  component: QuyTrinhQuanLyKhoPage,
  head: () => ({
    meta: [
      { title: "Quy trình quản lý kho — B-ACE CRM" },
      { name: "description", content: "Quy trình quản lý kho chuẩn hóa: nhập kho, lưu trữ, xuất kho. Minh bạch, kiểm soát hiệu quả." },
    ],
  }),
});

/* ──────────────────────────────────────────── */

const PHASES = [
  {
    id: "nhap-kho",
    icon: PackagePlus,
    color: "text-emerald-600",
    bg: "bg-emerald-50 dark:bg-emerald-950/20",
    border: "border-emerald-200 dark:border-emerald-900",
    badge: "bg-emerald-100 text-emerald-800 border-emerald-200",
    title: "I. QUY TRÌNH NHẬP KHO",
    goal: "Đảm bảo hàng nhập đúng – đủ – đạt chất lượng.",
    steps: [
      { num: 1, title: "Lập kế hoạch nhập kho", desc: "Xác định loại hàng, số lượng dự kiến, thời gian nhập và bố trí nhân sự tiếp nhận.", icon: ClipboardList },
      { num: 2, title: "Kiểm tra & đối chiếu chứng từ", desc: "Đối chiếu PO, invoice, packing list với thực tế hàng hóa trước khi vào kho.", icon: FileCheck },
      { num: 3, title: "Kiểm định chất lượng (QC)", desc: "Kiểm tra ngoại quan, thông số kỹ thuật, độ bền, hạn sử dụng theo tiêu chuẩn công ty.", icon: ShieldCheck },
      { num: 4, title: "Xác nhận nhập kho & cập nhật hệ thống", desc: "Ghi nhận số lô, vị trí lưu trữ và cập nhật tồn kho thời gian thực trên hệ thống.", icon: Database },
    ],
  },
  {
    id: "luu-tru",
    icon: Warehouse,
    color: "text-sky-600",
    bg: "bg-sky-50 dark:bg-sky-950/20",
    border: "border-sky-200 dark:border-sky-900",
    badge: "bg-sky-100 text-sky-800 border-sky-200",
    title: "II. QUY TRÌNH LƯU TRỮ & BẢO QUẢN",
    goal: "Sắp xếp khoa học, dễ tìm kiếm và tránh hư hỏng.",
    steps: [
      { num: 5, title: "Phân loại & dán nhãn hàng hóa", desc: "Gán mã SKU, barcode và nhãn phân loại để dễ dàng nhận diện và quét mã.", icon: Barcode },
      { num: 6, title: "Xác định vị trí lưu kho", desc: "Bố trí theo khu vực chức năng: nhanh hỏng, cồng kềnh, giá trị cao, thường xuyên xuất.", icon: MapPin },
      { num: 7, title: "Áp dụng FIFO / FEFO, kiểm soát hạn sử dụng", desc: "Xuất kho theo nguyên tắc nhập trước xuất trước; cảnh báo hàng gần hết hạn.", icon: Timer },
    ],
  },
  {
    id: "xuat-kho",
    icon: PackageMinus,
    color: "text-amber-600",
    bg: "bg-amber-50 dark:bg-amber-950/20",
    border: "border-amber-200 dark:border-amber-900",
    badge: "bg-amber-100 text-amber-800 border-amber-200",
    title: "III. QUY TRÌNH XUẤT KHO",
    goal: "Xuất đúng hàng, đúng số lượng, đúng thời điểm.",
    steps: [
      { num: 8, title: "Tạo & phê duyệt yêu cầu xuất kho", desc: "Nhân viên sales hoặc kho tạo phiếu xuất, quản lý phê duyệt trước khi thực hiện.", icon: FileCheck },
      { num: 9, title: "Kiểm tra tồn kho", desc: "Hệ thống tự động kiểm tra số lượng khả dụng, đề xuất lô phù hợp để xuất.", icon: Search },
      { num: 10, title: "Soạn & chuẩn bị hàng", desc: "Nhân viên kho nhặt hàng (picking), đóng gói và dán nhãn vận chuyển.", icon: Box },
      { num: 11, title: "Giao hàng & cập nhật tồn kho trên hệ thống", desc: "Bàn giao cho đơn vị vận chuyển, quét mã và trừ tồn kho ngay trên hệ thống.", icon: Truck },
    ],
  },
];

const BENEFITS = [
  { icon: TrendingDown, title: "Giảm sai sót tồn kho", desc: "Kiểm soát chặt chẽ tại mọi khâu giúp giảm thất thoát, nhầm lẫn xuống mức tối thiểu." },
  { icon: Timer, title: "Kiểm soát hạn sử dụng", desc: "Tự động cảnh báo hàng gần hết hạn, tránh lãng phí và đảm bảo chất lượng sản phẩm." },
  { icon: ScanLine, title: "Truy vết lô hàng nhanh chóng", desc: "Mỗi lô hàng đều có số trace duy nhất, truy xuất nguồn gốc trong vài giây." },
  { icon: Link2, title: "Sẵn sàng tích hợp ERP / DMS / CRM", desc: "Dữ liệu tồn kho đồng bộ hai chiều với các hệ thống quản lý doanh nghiệp khác." },
];

/* ──────────────────────────────────────────── */

function QuyTrinhQuanLyKhoPage() {
  return (
    <div className="min-h-full">
      {/* ── HERO ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 20% 30%, #fff 1px, transparent 1px), radial-gradient(circle at 80% 70%, #fff 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
        <div className="relative mx-auto max-w-7xl px-6 py-16 md:py-20">
          <div className="max-w-3xl">
            <Badge className="mb-4 bg-primary-foreground/15 text-primary-foreground border-primary-foreground/20 hover:bg-primary-foreground/20">
              Giải pháp quản lý kho
            </Badge>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight leading-tight">
              Quy trình quản lý kho chuẩn hóa
            </h1>
            <p className="mt-4 text-lg md:text-xl text-primary-foreground/80 leading-relaxed max-w-2xl">
              Minh bạch – Kiểm soát hiệu quả – Dễ dàng truy vết
            </p>
            <p className="mt-4 text-primary-foreground/70 leading-relaxed max-w-2xl">
              Quy trình quản lý kho giúp doanh nghiệp kiểm soát hàng hóa từ lúc nhập kho, lưu trữ cho đến xuất kho,
              đảm bảo đúng số lượng, đúng chất lượng và dễ truy vết.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/inventory/inbound">
                <Button variant="secondary" className="gap-2">
                  <PackagePlus className="h-4 w-4" />
                  Đến Nhập kho
                </Button>
              </Link>
              <Link to="/inventory/storage">
                <Button variant="outline" className="gap-2 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground">
                  <Warehouse className="h-4 w-4" />
                  Xem Tồn kho
                </Button>
              </Link>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* ── FLOW OVERVIEW ── */}
      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8">
          {PHASES.map((phase, idx) => (
            <div key={phase.id} className="flex items-center gap-4 md:gap-8 w-full md:w-auto">
              <div className={`flex-1 md:flex-none rounded-2xl border ${phase.border} ${phase.bg} px-6 py-5 text-center min-w-[240px]`}>
                <div className={`mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl ${phase.bg} border ${phase.border}`}>
                  <phase.icon className={`h-6 w-6 ${phase.color}`} />
                </div>
                <div className="text-sm font-semibold text-foreground">{phase.title.replace(/^I+\.\s*/, "")}</div>
                <div className="mt-1 text-xs text-muted-foreground">{phase.steps.length} bước</div>
              </div>
              {idx < PHASES.length - 1 && (
                <div className="hidden md:flex flex-col items-center text-muted-foreground">
                  <ArrowRight className="h-5 w-5" />
                </div>
              )}
              {idx < PHASES.length - 1 && (
                <div className="flex md:hidden items-center justify-center text-muted-foreground">
                  <ArrowDown className="h-5 w-5" />
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── DETAIL PHASES ── */}
      <section className="mx-auto max-w-7xl px-6 pb-12 space-y-12">
        {PHASES.map((phase) => (
          <PhaseSection key={phase.id} phase={phase} />
        ))}
      </section>

      {/* ── BENEFITS ── */}
      <section className="bg-muted/40 border-t">
        <div className="mx-auto max-w-7xl px-6 py-14">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Lợi ích cho doanh nghiệp</h2>
            <p className="mt-2 text-muted-foreground max-w-xl mx-auto">
              Áp dụng quy trình quản lý kho chuẩn hóa giúp doanh nghiệp vận hành hiệu quả hơn và giảm thiểu rủi ro.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {BENEFITS.map((b) => (
              <Card key={b.title} className="group hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <b.icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-semibold text-foreground">{b.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{b.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="mx-auto max-w-7xl px-6 py-14">
        <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <CardContent className="p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-xl md:text-2xl font-bold tracking-tight">Bắt đầu quản lý kho ngay hôm nay</h3>
              <p className="mt-2 text-muted-foreground max-w-lg">
                Trải nghiệm hệ thống nhập – lưu trữ – xuất kho tích hợp sẵn trong B-ACE CRM.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 shrink-0">
              <Link to="/inventory/inbound">
                <Button className="gap-2">
                  <PackagePlus className="h-4 w-4" />
                  Nhập kho
                </Button>
              </Link>
              <Link to="/inventory/outbound">
                <Button variant="outline" className="gap-2">
                  <PackageMinus className="h-4 w-4" />
                  Xuất kho
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

/* ──────────────────────────────────────────── */

function PhaseSection({ phase }: { phase: (typeof PHASES)[number] }) {
  const PhaseIcon = phase.icon;

  return (
    <div className="relative">
      {/* Phase header */}
      <div className={`flex items-center gap-3 mb-6 pb-4 border-b ${phase.border}`}>
        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${phase.bg} border ${phase.border}`}>
          <PhaseIcon className={`h-5 w-5 ${phase.color}`} />
        </div>
        <div>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight">{phase.title}</h2>
          <p className="text-sm text-muted-foreground mt-0.5">{phase.goal}</p>
        </div>
        <Badge variant="outline" className={`ml-auto hidden sm:inline-flex ${phase.badge}`}>
          {phase.steps.length} bước
        </Badge>
      </div>

      {/* Steps grid / timeline */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {phase.steps.map((step, idx) => (
          <StepCard key={step.num} step={step} phase={phase} isLast={idx === phase.steps.length - 1} />
        ))}
      </div>
    </div>
  );
}

function StepCard({
  step,
  phase,
  isLast,
}: {
  step: { num: number; title: string; desc: string; icon: typeof CheckCircle2 };
  phase: (typeof PHASES)[number];
  isLast: boolean;
}) {
  const StepIcon = step.icon;

  return (
    <div className="relative">
      <Card className={`h-full border ${phase.border} hover:shadow-sm transition-shadow`}>
        <CardContent className="p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${phase.bg} ${phase.color} border ${phase.border}`}>
              {step.num}
            </div>
            <StepIcon className={`h-4 w-4 ${phase.color} shrink-0`} />
          </div>
          <h4 className="font-semibold text-sm text-foreground leading-snug">{step.title}</h4>
          <p className="mt-2 text-xs text-muted-foreground leading-relaxed">{step.desc}</p>
        </CardContent>
      </Card>
      {/* Connector arrow between cards (desktop only, within same row) */}
      {!isLast && (
        <div className="hidden lg:flex absolute -right-2 top-1/2 -translate-y-1/2 z-10 items-center justify-center">
          <ArrowRight className={`h-4 w-4 ${phase.color} opacity-50`} />
        </div>
      )}
    </div>
  );
}
