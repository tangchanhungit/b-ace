import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Tags, Save, User, Target, Route as RouteIcon, ShoppingBag, Crown, Facebook, Music2, Globe, MessageCircle, MoreHorizontal, Building2, UserCircle } from "lucide-react";
import { PageHeader } from "@/components/app-shell";

export const Route = createFileRoute("/leads/create")({
  component: CreateLeadPage,
  head: () => ({
    meta: [
      { title: "Create Lead — Tag-Driven CRM" },
      { name: "description", content: "Create a new lead. Every field assigns workflow tags that drive automation, journey, and sales scripts." },
    ],
  }),
});

type SourceVal = "facebook" | "tiktok" | "website" | "zalo" | "other";
type IntentVal = "chua_hoc" | "da_hoc" | "nguyen_lieu_chuoi";
type EntryVal = "mien_phi_online" | "mien_phi_offline" | "pcth";
type PcthBranch = "van_hanh" | "mkt" | "lop_khac" | "nhuong_quyen";
type PurchaseVal = "mua_lan_dau" | "mua_lai" | "khong_mua" | "ngung_mua";
type TierVal = "vang" | "bac" | "dong";

const sourceOptions: { value: SourceVal; label: string; icon: React.ReactNode }[] = [
  { value: "facebook", label: "Facebook", icon: <Facebook className="h-4 w-4" /> },
  { value: "tiktok", label: "TikTok", icon: <Music2 className="h-4 w-4" /> },
  { value: "website", label: "Website", icon: <Globe className="h-4 w-4" /> },
  { value: "zalo", label: "Zalo", icon: <MessageCircle className="h-4 w-4" /> },
  { value: "other", label: "Khác", icon: <MoreHorizontal className="h-4 w-4" /> },
];

const intentOptions: { value: IntentVal; label: string }[] = [
  { value: "chua_hoc", label: "Nguyên liệu chưa học" },
  { value: "da_hoc", label: "Nguyên liệu đã học" },
  { value: "nguyen_lieu_chuoi", label: "Nguyên liệu chuỗi" },
];

const entryOptions: { value: EntryVal; label: string }[] = [
  { value: "mien_phi_online", label: "Pha chế miễn phí Online" },
  { value: "mien_phi_offline", label: "Pha chế miễn phí Offline" },
  { value: "pcth", label: "Pha chế tổng hợp (PCTH)" },
];

const pcthBranchOptions: { value: PcthBranch; label: string }[] = [
  { value: "van_hanh", label: "Vận hành" },
  { value: "mkt", label: "Marketing" },
  { value: "lop_khac", label: "Lớp học khác" },
  { value: "nhuong_quyen", label: "Nhượng quyền" },
];

const purchaseOptions: { value: PurchaseVal; label: string }[] = [
  { value: "mua_lan_dau", label: "Mua lần đầu" },
  { value: "mua_lai", label: "Mua lại" },
  { value: "khong_mua", label: "Không mua" },
  { value: "ngung_mua", label: "Ngưng mua" },
];

const tierOptions: { value: TierVal; label: string; ring: string }[] = [
  { value: "vang", label: "Vàng", ring: "ring-tier-gold" },
  { value: "bac", label: "Bạc", ring: "ring-tier-silver" },
  { value: "dong", label: "Đồng", ring: "ring-tier-bronze" },
];

function CreateLeadPage() {
  const navigate = useNavigate();
  const [customerType, setCustomerType] = useState<"individual" | "company">("individual");
  const [companyName, setCompanyName] = useState("");
  const [taxCode, setTaxCode] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [industry, setIndustry] = useState("");
  const [source, setSource] = useState<SourceVal | "">("");
  const [intent, setIntent] = useState<IntentVal | "">("");
  const [entry, setEntry] = useState<EntryVal | "">("");
  const [pcthBranch, setPcthBranch] = useState<PcthBranch | "">("");
  const [purchase, setPurchase] = useState<PurchaseVal | "">("");
  const [noBuyReason, setNoBuyReason] = useState("");
  const [tier, setTier] = useState<TierVal | "">("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [owner, setOwner] = useState("Linh");
  const [note, setNote] = useState("");

  const tags = useMemo(() => {
    const t: string[] = [];
    if (source) t.push(source);
    if (intent) t.push(intent);
    if (entry) t.push(entry);
    if (entry === "pcth" && pcthBranch) t.push(pcthBranch);
    if (purchase) t.push(purchase);
    if (tier) t.push(tier);
    return t;
  }, [source, intent, entry, pcthBranch, purchase, tier]);

  const requireReason = purchase === "khong_mua" || purchase === "ngung_mua";

  const handleSave = () => {
    if (!name.trim()) return toast.error("Vui lòng nhập họ tên");
    if (!/^[0-9+\-\s]{6,20}$/.test(phone.trim())) return toast.error("SĐT không hợp lệ");
    if (!source) return toast.error("Chọn Lead Source");
    if (!intent) return toast.error("Chọn Customer Intent");
    if (!entry) return toast.error("Chọn Entry Program");
    if (entry === "pcth" && !pcthBranch) return toast.error("Chọn Nhánh lớp PCTH");
    if (!purchase) return toast.error("Chọn Purchase Status");
    if (requireReason && !noBuyReason.trim()) return toast.error("Nhập lý do không mua / ngưng mua");
    if (!tier) return toast.error("Chọn Customer Tier");

    toast.success("Lead đã được tạo", { description: `Tags: ${tags.join(", ")}` });
    setTimeout(() => navigate({ to: "/" }), 800);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/60 backdrop-blur sticky top-0 z-10">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="h-4 w-4" /> Lead List
            </Link>
            <span className="text-muted-foreground/40">/</span>
            <h1 className="text-base font-semibold">Create Lead</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={() => navigate({ to: "/" })}>Cancel</Button>
            <Button onClick={handleSave} className="gap-2"><Save className="h-4 w-4" /> Save Lead</Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold tracking-tight">Tạo Lead mới</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Mỗi lựa chọn dưới đây sẽ tự động gán <span className="font-medium text-foreground">tag</span> để hệ thống chạy đúng workflow, journey & script bán hàng.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT — 2 columns of sections */}
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Section 1 */}
            <SectionCard
              index="01"
              accent="ring-1 ring-primary/20"
              icon={<Target className="h-4 w-4" />}
              title="Lead Source"
              subtitle="QUAN TRỌNG NHẤT — quyết định kênh"
              className="md:col-span-2"
            >
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {sourceOptions.map((o) => {
                  const active = source === o.value;
                  return (
                    <button
                      key={o.value}
                      type="button"
                      onClick={() => setSource(o.value)}
                      className={`group flex flex-col items-center gap-1.5 rounded-lg border px-3 py-3 text-xs font-medium transition-all
                        ${active
                          ? "border-primary bg-primary/10 text-foreground shadow-sm"
                          : "border-border bg-card hover:border-primary/40 hover:bg-accent text-muted-foreground"}`}
                    >
                      <span className={`${active ? "text-primary" : ""}`}>{o.icon}</span>
                      {o.label}
                    </button>
                  );
                })}
              </div>
              {source && <TagPreview tags={[source]} />}
            </SectionCard>

            {/* Section 2 */}
            <SectionCard index="02" icon={<RouteIcon className="h-4 w-4" />} title="Customer Intent" subtitle="Nhóm nhu cầu khách">
              <DSelect value={intent} onChange={(v) => setIntent(v as IntentVal)} placeholder="Chọn nhóm nhu cầu" options={intentOptions} />
              {intent && <TagPreview tags={[intent]} />}
            </SectionCard>

            {/* Section 3 */}
            <SectionCard index="03" icon={<RouteIcon className="h-4 w-4" />} title="Entry Program" subtitle="Khách vào từ đâu trong hành trình">
              <DSelect value={entry} onChange={(v) => { setEntry(v as EntryVal); if (v !== "pcth") setPcthBranch(""); }} placeholder="Chọn entry program" options={entryOptions} />
              {entry === "pcth" && (
                <div className="mt-3 rounded-md border border-dashed border-primary/40 bg-primary/5 p-3">
                  <Label className="text-xs font-medium text-muted-foreground mb-2 block">Nhánh lớp PCTH</Label>
                  <DSelect value={pcthBranch} onChange={(v) => setPcthBranch(v as PcthBranch)} placeholder="Chọn nhánh lớp" options={pcthBranchOptions} />
                </div>
              )}
              {entry && <TagPreview tags={entry === "pcth" && pcthBranch ? [entry, pcthBranch] : entry ? [entry] : []} />}
            </SectionCard>

            {/* Section 4 */}
            <SectionCard index="04" icon={<ShoppingBag className="h-4 w-4" />} title="Purchase Status" subtitle="Xương sống của flow" className="md:col-span-2">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {purchaseOptions.map((o) => {
                  const active = purchase === o.value;
                  const danger = o.value === "khong_mua" || o.value === "ngung_mua";
                  return (
                    <button
                      key={o.value}
                      type="button"
                      onClick={() => setPurchase(o.value)}
                      className={`rounded-lg border px-3 py-2.5 text-sm font-medium transition-all text-left
                        ${active
                          ? danger
                            ? "border-destructive bg-destructive/10 text-destructive"
                            : "border-primary bg-primary/10 text-foreground"
                          : "border-border bg-card hover:border-primary/40 text-muted-foreground hover:text-foreground"}`}
                    >
                      {o.label}
                    </button>
                  );
                })}
              </div>
              {requireReason && (
                <div className="mt-3">
                  <Label htmlFor="reason" className="text-xs font-medium">Lý do không mua <span className="text-destructive">*</span></Label>
                  <Textarea id="reason" rows={3} value={noBuyReason} onChange={(e) => setNoBuyReason(e.target.value)} placeholder="Mô tả lý do để team chăm sóc có script phù hợp..." className="mt-1.5" />
                </div>
              )}
              {purchase && <TagPreview tags={[purchase]} />}
            </SectionCard>

            {/* Section 5 */}
            <SectionCard index="05" icon={<Crown className="h-4 w-4" />} title="Customer Tier" subtitle="Vàng / Bạc / Đồng" className="md:col-span-2">
              <div className="grid grid-cols-3 gap-3">
                {tierOptions.map((o) => {
                  const active = tier === o.value;
                  const colorClass =
                    o.value === "vang" ? "tier-gold"
                    : o.value === "bac" ? "tier-silver"
                    : "tier-bronze";
                  return (
                    <button
                      key={o.value}
                      type="button"
                      onClick={() => setTier(o.value)}
                      className={`relative rounded-xl border px-4 py-4 transition-all text-left overflow-hidden
                        ${active ? `border-transparent shadow-md ${colorClass}-bg` : "border-border bg-card hover:border-border/80"}`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Crown className={`h-5 w-5 ${active ? colorClass + "-fg" : "text-muted-foreground"}`} />
                        <div>
                          <div className={`text-sm font-semibold ${active ? colorClass + "-fg" : "text-foreground"}`}>{o.label}</div>
                          <div className={`text-[11px] ${active ? colorClass + "-fg opacity-80" : "text-muted-foreground"}`}>tag: {o.value}</div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </SectionCard>

            {/* Section 6 */}
            <SectionCard index="06" icon={<User className="h-4 w-4" />} title="Thông tin cơ bản" subtitle="Hồ sơ liên hệ" className="md:col-span-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name" className="text-xs">Họ tên <span className="text-destructive">*</span></Label>
                  <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nguyễn Văn A" className="mt-1.5" />
                </div>
                <div>
                  <Label htmlFor="phone" className="text-xs">SĐT (unique) <span className="text-destructive">*</span></Label>
                  <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="09xxxxxxxx" className="mt-1.5" />
                </div>
                <div>
                  <Label htmlFor="email" className="text-xs">Email</Label>
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@email.com" className="mt-1.5" />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="note" className="text-xs">Ghi chú</Label>
                  <Textarea id="note" rows={3} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Ghi chú nội bộ cho team sales..." className="mt-1.5" />
                </div>
              </div>
            </SectionCard>
          </div>

          {/* RIGHT — Tag preview rail */}
          <aside className="lg:col-span-1">
            <div className="sticky top-24 space-y-4">
              <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <div className="rounded-md bg-primary/10 p-1.5">
                      <Tags className="h-4 w-4 text-primary" />
                    </div>
                    <CardTitle className="text-base">Tags sẽ được gán</CardTitle>
                  </div>
                  <CardDescription>Tự động sinh từ các lựa chọn ở form. Đây là đầu vào duy nhất của workflow CRM.</CardDescription>
                </CardHeader>
                <CardContent>
                  {tags.length === 0 ? (
                    <div className="rounded-md border border-dashed border-border p-6 text-center text-xs text-muted-foreground">
                      Chưa có tag. Hãy chọn ở các section bên trái.
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {tags.map((t) => (
                        <Badge key={t} variant="secondary" className="font-mono text-[11px] bg-primary/10 text-primary border border-primary/20 hover:bg-primary/15">
                          #{t}
                        </Badge>
                      ))}
                    </div>
                  )}
                  <div className="mt-4 pt-4 border-t border-border">
                    <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2">Workflow trigger</div>
                    <div className="text-xs text-foreground/80 leading-relaxed">
                      {tags.length === 0
                        ? "Sẽ kích hoạt journey & script bán hàng tương ứng khi đủ tag."
                        : `${tags.length} tag(s) → khớp script & automation tương ứng.`}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Button onClick={handleSave} className="w-full gap-2" size="lg">
                <Save className="h-4 w-4" /> Save Lead & Apply Tags
              </Button>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

function SectionCard({
  index, icon, title, subtitle, children, className, accent,
}: {
  index: string;
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  accent?: string;
}) {
  return (
    <Card className={`${className ?? ""} ${accent ?? ""}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          <div className="rounded-md bg-muted text-muted-foreground p-2 mt-0.5">{icon}</div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-muted-foreground tracking-widest">{index}</span>
              <CardTitle className="text-base">{title}</CardTitle>
            </div>
            {subtitle && <CardDescription className="text-xs mt-0.5">{subtitle}</CardDescription>}
          </div>
        </div>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function DSelect<T extends string>({
  value, onChange, placeholder, options,
}: {
  value: string;
  onChange: (v: T) => void;
  placeholder: string;
  options: { value: T; label: string }[];
}) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v as T)}>
      <SelectTrigger><SelectValue placeholder={placeholder} /></SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            <span className="flex items-center gap-2">
              {o.label}
              <span className="font-mono text-[10px] text-muted-foreground">#{o.value}</span>
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function TagPreview({ tags }: { tags: string[] }) {
  if (!tags.length) return null;
  return (
    <div className="mt-3 flex flex-wrap gap-1.5">
      {tags.map((t) => (
        <Badge key={t} variant="outline" className="font-mono text-[10px] border-primary/30 text-primary">
          #{t}
        </Badge>
      ))}
    </div>
  );
}
