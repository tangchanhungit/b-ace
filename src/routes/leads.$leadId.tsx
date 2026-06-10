import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Phone, Mail, PhoneCall, StickyNote, CalendarDays, CheckSquare,
  Flame, AlertTriangle, X, Plus, Clock, Target, FileText, Building2, UserCircle,
  ArrowRight, CheckCircle2, Circle, ArrowRightLeft, Sparkles, Send, User, Tag as TagIcon, Pencil,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { type Activity, type ActivityType, type Lead } from "@/lib/leads-mock";
import { useStore, leadActions, opportunityActions, orgActions } from "@/lib/store";
import { derive, daysSince, type LeadTier } from "@/lib/leads-logic";
import { PageHeader } from "@/components/app-shell";
import { fmtVND, fmtDate, fmtDateTime, OWNERS } from "@/lib/format";
import { toast } from "sonner";

export const Route = createFileRoute("/leads/$leadId")({
  component: LeadDetailPage,
  head: ({ params }) => ({ meta: [{ title: `Lead ${params.leadId} — Tag-Driven CRM` }] }),
});

function tierClasses(tier: LeadTier) {
  if (tier === "Gold") return "tier-gold-bg tier-gold-fg border-transparent";
  if (tier === "Silver") return "tier-silver-bg tier-silver-fg border-transparent";
  if (tier === "Bronze") return "tier-bronze-bg tier-bronze-fg border-transparent";
  return "bg-muted text-muted-foreground border-transparent";
}

function activityIcon(type: ActivityType) {
  switch (type) {
    case "call": return <PhoneCall className="h-4 w-4" />;
    case "meeting": return <CalendarDays className="h-4 w-4" />;
    case "task": return <CheckSquare className="h-4 w-4" />;
    default: return <StickyNote className="h-4 w-4" />;
  }
}
function activityColor(type: ActivityType) {
  switch (type) {
    case "call": return "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300";
    case "meeting": return "bg-indigo-100 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300";
    case "task": return "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300";
    default: return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300";
  }
}

function LeadDetailPage() {
  const { leadId } = Route.useParams();
  const navigate = useNavigate();
  const lead = useStore((s) => s.leads.find((l) => l.id === leadId));
  const orgs = useStore((s) => s.organizations);
  const opps = useStore((s) => s.opportunities.filter((o) => o.leadId === leadId));
  const quotes = useStore((s) => s.quotes.filter((q) => opps.some((o) => o.id === q.oppId)));
  const contracts = useStore((s) => s.serviceContracts.filter((c) => c.leadId === leadId));
  const products = useStore((s) => s.products);
  const orders = useStore((s) => s.orders.filter((o) => opps.some((op) => op.id === o.oppId)));

  const [composer, setComposer] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [oppModalOpen, setOppModalOpen] = useState(false);
  const [convertOpen, setConvertOpen] = useState(false);
  const [justConverted, setJustConverted] = useState(false);
  const [convertForm, setConvertForm] = useState({ name: "", value: "", owner: "" });

  const d = useMemo(() => lead ? derive(lead) : null, [lead]);
  const org = orgs.find((o) => o.id === lead?.orgId);

  const journeyActivities: Array<{ id: string; type: ActivityType; content: string; created_at: string }> = useMemo(() => {
    if (!lead) return [];
    const items: Array<{ id: string; type: ActivityType; content: string; created_at: string }> = [
      ...lead.activities,
      ...opps.map((o) => ({ id: `op-${o.id}`, type: "note" as ActivityType, content: `Opportunity ${o.id} created — ${o.name} (${fmtVND(o.value)})`, created_at: o.createdAt })),
      ...quotes.map((q) => ({ id: `q-${q.id}`, type: "note" as ActivityType, content: `Quote ${q.id} · status: ${q.status}`, created_at: q.createdAt })),
      ...contracts.map((c) => ({ id: `c-${c.id}`, type: "meeting" as ActivityType, content: `Contract ${c.id} ${c.status} — ${fmtVND(c.value)}`, created_at: c.createdAt })),
    ];
    return items.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [lead, opps, quotes, contracts]);

  if (!lead || !d) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center space-y-4">
            <h2 className="text-lg font-semibold">Lead not found</h2>
            <p className="text-sm text-muted-foreground">No lead with id <code className="font-mono">{leadId}</code>.</p>
            <Link to="/leads"><Button>Back to All Leads</Button></Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const addActivity = (type: ActivityType) => {
    const content = composer.trim();
    if (!content) return;
    leadActions.addActivity(lead.id, { type, content });
    setComposer("");
  };
  const addTag = () => {
    const t = tagInput.trim().toLowerCase().replace(/\s+/g, "_");
    if (!t) return;
    leadActions.addTag(lead.id, t);
    setTagInput("");
  };
  const removeTag = (t: string) => leadActions.removeTag(lead.id, t);
  const setLead = (patch: Partial<Lead>) => leadActions.update(lead.id, patch);

  // Pipeline stage: derived from data existence
  const stages = [
    { key: "lead", label: "Lead", done: true },
    { key: "opp", label: "Opportunity", done: opps.length > 0 },
    { key: "quote", label: "Quote", done: quotes.length > 0 },
    { key: "contract", label: "Contract", done: contracts.length > 0 },
  ];
  const currentStageIdx = stages.reduce((acc, s, i) => s.done ? i : acc, 0);

  const totalValue = opps.reduce((s, o) => s + o.value, 0);
  const quotesSent = quotes.filter((q) => q.status === "sent" || q.status === "accepted").length;
  const contractsActive = contracts.filter((c) => c.status === "active").length;

  const hasContact = Boolean(lead.phone?.trim() || lead.email?.trim());
  const hasActivity = lead.activities.length > 0;
  const isConverted = opps.length > 0;
  const canConvert = hasContact && hasActivity;
  const disabledReason = !hasContact
    ? "Add a phone number or email before converting"
    : !hasActivity
      ? "Log at least one call, note, or meeting before converting"
      : "";

  const openConvert = () => {
    setConvertForm({
      name: `${lead.name} — Opportunity`,
      value: String(lead.value || ""),
      owner: lead.owner,
    });
    setConvertOpen(true);
  };

  const handleConvert = () => {
    const name = convertForm.name.trim() || `${lead.name} — Opportunity`;
    const value = Number(convertForm.value) || 0;
    const owner = convertForm.owner || lead.owner;
    const o = opportunityActions.create({
      name,
      leadId: lead.id,
      orgId: lead.orgId,
      value,
      owner,
      closeDate: new Date(Date.now() + 14 * 86_400_000).toISOString(),
      status: "open",
    });
    leadActions.addTag(lead.id, "converted");
    leadActions.addActivity(lead.id, { type: "note", content: `Converted to Opportunity ${o.id}` });
    setConvertOpen(false);
    setJustConverted(true);
    toast.success("Lead successfully converted", {
      description: `${name} is now in the sales pipeline.`,
    });
    setTimeout(() => navigate({ to: "/opportunities/$oppId", params: { oppId: o.id } }), 500);
  };

  return (
    <>
      <PageHeader
        title={lead.name}
        breadcrumb={<><Link to="/leads" className="hover:text-foreground">Leads</Link> <span className="px-1">/</span> {lead.id}</>}
        description={lead.phone}
        actions={
          <>
            <Badge
              variant="outline"
              className={cn(
                "transition-all duration-300 mr-1",
                isConverted
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900"
                  : "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900",
                justConverted && "ring-2 ring-emerald-400 scale-105",
              )}
            >
              {isConverted ? (<><Sparkles className="h-3 w-3 mr-1" /> Converted</>) : "Lead"}
            </Badge>
            <Button variant="outline" size="sm" className="gap-2"><Pencil className="h-3.5 w-3.5" /> Edit</Button>
            <Button variant="outline" size="sm" className="gap-2" disabled={!lead.email} onClick={() => lead.email && (window.location.href = `mailto:${lead.email}`)}><Send className="h-3.5 w-3.5" /> Email</Button>
            <Button variant="outline" size="sm" className="gap-2"><Phone className="h-3.5 w-3.5" /> Call</Button>
            <TooltipProvider delayDuration={150}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span tabIndex={canConvert ? -1 : 0}>
                    <Button
                      size="sm"
                      disabled={!canConvert}
                      onClick={openConvert}
                      className="gap-2 rounded-full bg-primary text-primary-foreground shadow-sm hover:shadow-md transition-all"
                    >
                      <ArrowRightLeft className="h-3.5 w-3.5" /> Convert to Opportunity
                    </Button>
                  </span>
                </TooltipTrigger>
                {!canConvert && (
                  <TooltipContent>
                    <p className="text-xs">{disabledReason || "Complete required information before converting"}</p>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          </>
        }
      />

      <Dialog open={convertOpen} onOpenChange={setConvertOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ArrowRightLeft className="h-4 w-4 text-primary" /> Convert Lead to Opportunity
            </DialogTitle>
            <p className="text-sm text-muted-foreground pt-1">
              This will move the lead into the sales pipeline as an opportunity.
            </p>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="opp-name">Opportunity name</Label>
              <Input
                id="opp-name"
                value={convertForm.name}
                onChange={(e) => setConvertForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Acme Corp — Annual contract"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="opp-value">Expected revenue <span className="text-muted-foreground font-normal">(optional)</span></Label>
              <Input
                id="opp-value"
                type="number"
                min={0}
                value={convertForm.value}
                onChange={(e) => setConvertForm((f) => ({ ...f, value: e.target.value }))}
                placeholder="0"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="opp-owner">Assigned sales</Label>
              <Select value={convertForm.owner} onValueChange={(v) => setConvertForm((f) => ({ ...f, owner: v }))}>
                <SelectTrigger id="opp-owner"><SelectValue placeholder="Select owner" /></SelectTrigger>
                <SelectContent>
                  {OWNERS.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="rounded-md border bg-muted/30 p-3 text-xs text-muted-foreground space-y-1">
              <div className="font-medium text-foreground">Copied from lead</div>
              <div>{lead.name} · {lead.phone}{lead.email ? ` · ${lead.email}` : ""}</div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConvertOpen(false)}>Cancel</Button>
            <Button onClick={handleConvert} className="gap-2">
              <ArrowRightLeft className="h-3.5 w-3.5" /> Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>



      <div className="mx-auto max-w-7xl px-6 py-6 space-y-6">
        {/* Header summary card */}
        <Card className="border-0 shadow-sm bg-gradient-to-br from-card to-muted/20">
          <CardContent className="p-6">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex items-start gap-4">
                <div className="h-14 w-14 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                  {lead.customerType === "company" ? <Building2 className="h-7 w-7" /> : <UserCircle className="h-7 w-7" />}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-2xl font-semibold tracking-tight">{lead.name}</h1>
                    <Badge
                      variant="outline"
                      className={cn(
                        "transition-all duration-300",
                        isConverted
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900"
                          : "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900",
                        justConverted && "ring-2 ring-emerald-400 scale-105",
                      )}
                    >
                      {isConverted ? (<><Sparkles className="h-3 w-3 mr-1" /> Converted</>) : "Lead"}
                    </Badge>
                  </div>
                  {(lead.companyName || org) && (
                    <div className="text-sm text-muted-foreground mt-1 inline-flex items-center gap-1.5">
                      <Building2 className="h-3.5 w-3.5" /> {lead.companyName ?? org?.name}
                    </div>
                  )}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground mt-2">
                    <span className="inline-flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" /> {lead.phone}</span>
                    {lead.email && <span className="inline-flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" /> {lead.email}</span>}
                    <span className="inline-flex items-center gap-1.5"><CalendarDays className="h-3.5 w-3.5" /> Created {fmtDate(lead.last_touch)}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 mt-3">
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900">{d.type}</Badge>
                    <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-900">{d.stage}</Badge>
                    {d.tier && <Badge className={cn("font-semibold", tierClasses(d.tier))}>{d.tier}</Badge>}
                    {d.high && <Badge className="bg-destructive text-destructive-foreground gap-1"><Flame className="h-3 w-3" /> HIGH</Badge>}
                    {d.stale && <Badge variant="outline" className="border-destructive/40 text-destructive gap-1"><AlertTriangle className="h-3 w-3" /> Stale · {daysSince(lead.last_touch)}d</Badge>}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-muted-foreground uppercase tracking-wide">Deal value</div>
                <div className="text-2xl font-semibold tabular-nums">{fmtVND(lead.value)}</div>
              </div>
            </div>

            {/* Pipeline progression */}
            <div className="pt-5 mt-5 border-t">
              <div className="flex items-center gap-2 flex-wrap">
                {stages.map((s, i) => (
                  <div key={s.key} className="flex items-center gap-2">
                    <div className={cn(
                      "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border",
                      s.done && i === currentStageIdx ? "bg-primary text-primary-foreground border-primary" :
                      s.done ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-900" :
                      "bg-muted text-muted-foreground border-transparent",
                    )}>
                      {s.done ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Circle className="h-3.5 w-3.5" />}
                      {s.label}
                    </div>
                    {i < stages.length - 1 && <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT — Customer Information */}
          <aside className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2"><User className="h-4 w-4 text-muted-foreground" /> Key Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <InfoRow label="Name" value={<Input value={lead.name} onChange={(e) => setLead({ name: e.target.value })} className="h-8" />} />
                <InfoRow label="Company" value={
                  <Input value={lead.companyName ?? ""} placeholder="—" onChange={(e) => setLead({ companyName: e.target.value })} className="h-8" />
                } />
                <InfoRow label="Phone" value={<Input value={lead.phone} onChange={(e) => setLead({ phone: e.target.value })} className="h-8" />} />
                <InfoRow label="Email" value={<Input value={lead.email ?? ""} placeholder="email@example.com" onChange={(e) => setLead({ email: e.target.value })} className="h-8" />} />
                <InfoRow label="Source" value={
                  <div className="flex flex-wrap gap-1">
                    {sourceTags(lead.tags).length === 0
                      ? <span className="text-muted-foreground text-xs">—</span>
                      : sourceTags(lead.tags).map((s) => <Badge key={s} variant="secondary" className="text-[10px]">{s}</Badge>)}
                  </div>
                } />
                <InfoRow label="Area" value={<Input value={lead.area ?? ""} placeholder="Khu vực" onChange={(e) => setLead({ area: e.target.value })} className="h-8" />} />
                <InfoRow label="Customer Type" value={
                  <Select value={lead.segment ?? ""} onValueChange={(v) => setLead({ segment: v as Lead["segment"] })}>
                    <SelectTrigger className="h-8"><SelectValue placeholder="—" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gia_dinh">Gia đình</SelectItem>
                      <SelectItem value="chuan_bi_mo">Chuẩn bị mở</SelectItem>
                      <SelectItem value="co_quan">Có quán</SelectItem>
                    </SelectContent>
                  </Select>
                } />
                <InfoRow label="Expected Date" value={<Input value={lead.next_action} onChange={(e) => setLead({ next_action: e.target.value })} className="h-8" />} />
                <InfoRow label="Assigned Sales" value={
                  <Select value={lead.owner} onValueChange={(v) => setLead({ owner: v })}>
                    <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                    <SelectContent>{OWNERS.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                  </Select>
                } />
                <InfoRow label="Deal Value" value={<Input type="number" value={lead.value} onChange={(e) => setLead({ value: Number(e.target.value) || 0 })} className="h-8" />} />
                <div className="text-[11px] text-muted-foreground pt-2 border-t">Last touch: {fmtDateTime(lead.last_touch)} ({daysSince(lead.last_touch)}d ago)</div>
              </CardContent>
            </Card>

            {/* Tags compact */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2"><TagIcon className="h-4 w-4 text-muted-foreground" /> Tags</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-wrap gap-1.5 min-h-[1.5rem]">
                  {lead.tags.length === 0 && <span className="text-xs text-muted-foreground">No tags.</span>}
                  {lead.tags.map((t) => (
                    <span key={t} className="inline-flex items-center gap-1 rounded-full bg-secondary text-secondary-foreground pl-2.5 pr-1 py-0.5 text-xs font-medium">
                      {t}
                      <button onClick={() => removeTag(t)} className="hover:bg-background/60 rounded-full p-0.5" aria-label={`Remove ${t}`}><X className="h-3 w-3" /></button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }} placeholder="Add tag" className="h-8" />
                  <Button size="sm" onClick={addTag} className="gap-1 h-8"><Plus className="h-3.5 w-3.5" /></Button>
                </div>
              </CardContent>
            </Card>
          </aside>

          {/* RIGHT — Activities + Purchase + Notes */}
          <section className="lg:col-span-2 space-y-6">
            {/* Activity Timeline */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">Activity Timeline</CardTitle>
                  <div className="flex gap-1.5">
                    <Button size="sm" variant="outline" className="h-7 gap-1.5" onClick={() => { setComposer(""); document.getElementById("activity-composer")?.focus(); }}>
                      <Plus className="h-3 w-3" /> Add
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg border bg-muted/20 p-3 space-y-2">
                  <Textarea id="activity-composer" value={composer} onChange={(e) => setComposer(e.target.value)} placeholder="Log an interaction… (call summary, meeting notes, follow-up)" rows={2} className="bg-background" />
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" variant="outline" className="h-8 gap-2" onClick={() => addActivity("call")}><PhoneCall className="h-3.5 w-3.5 text-emerald-600" /> Call</Button>
                    <Button size="sm" variant="outline" className="h-8 gap-2" onClick={() => addActivity("meeting")}><CalendarDays className="h-3.5 w-3.5 text-indigo-600" /> Meeting</Button>
                    <Button size="sm" variant="outline" className="h-8 gap-2" onClick={() => addActivity("note")}><StickyNote className="h-3.5 w-3.5 text-slate-600" /> Note</Button>
                    <Button size="sm" className="h-8 gap-2 ml-auto" onClick={() => addActivity(composer ? "note" : "task")} disabled={!composer.trim()}>
                      <Send className="h-3.5 w-3.5" /> Save
                    </Button>
                  </div>
                </div>

                {journeyActivities.length === 0 ? <Empty label="No activities yet. Log your first interaction above." /> : (
                  <ol className="relative border-l border-border ml-3 space-y-5">
                    {journeyActivities.map((a) => (
                      <li key={a.id} className="ml-6">
                        <span className={cn("absolute -left-3 flex h-6 w-6 items-center justify-center rounded-full ring-4 ring-card", activityColor(a.type))}>
                          {activityIcon(a.type)}
                        </span>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{a.type}</span>
                          <span className="text-xs text-muted-foreground inline-flex items-center gap-1"><Clock className="h-3 w-3" /> {fmtDateTime(a.created_at)}</span>
                        </div>
                        <p className="text-sm leading-relaxed">{a.content}</p>
                      </li>
                    ))}
                  </ol>
                )}
              </CardContent>
            </Card>

            {/* Purchase History */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Purchase History</CardTitle>
              </CardHeader>
              <CardContent>
                <PurchaseHistory orders={orders} products={products} />
              </CardContent>
            </Card>

            {/* Pipeline records */}
            <Card>
              <CardContent className="p-4">
                <Tabs defaultValue="opps">
                  <TabsList>
                    <TabsTrigger value="opps">Opportunities ({opps.length})</TabsTrigger>
                    <TabsTrigger value="quotes">Quotes ({quotes.length})</TabsTrigger>
                    <TabsTrigger value="contracts">Contracts ({contracts.length})</TabsTrigger>
                  </TabsList>
                  <TabsContent value="opps" className="mt-4 space-y-3">
                    <div className="flex justify-end">
                      <Button size="sm" className="gap-2" onClick={() => setOppModalOpen(true)}><Plus className="h-3.5 w-3.5" /> Create Opportunity</Button>
                    </div>
                    {opps.length === 0 ? <Empty label="No opportunities yet." /> :
                      <div className="divide-y rounded-lg border">
                        {opps.map((o) => (
                          <Link key={o.id} to="/opportunities/$oppId" params={{ oppId: o.id }} className="flex items-center justify-between p-3 hover:bg-muted/40 text-sm">
                            <div>
                              <div className="font-medium">{o.name}</div>
                              <div className="text-xs text-muted-foreground">{o.id} · close {fmtDate(o.closeDate)}</div>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="tabular-nums">{fmtVND(o.value)}</span>
                              <Badge variant="outline">{o.status}</Badge>
                            </div>
                          </Link>
                        ))}
                      </div>}
                  </TabsContent>
                  <TabsContent value="quotes" className="mt-4 space-y-3">
                    {quotes.length === 0 ? <Empty label="No quotes." /> :
                      <div className="divide-y rounded-lg border">
                        {quotes.map((q) => {
                          const total = q.lines.reduce((s, l) => s + l.qty * l.price, 0) * (1 + q.taxRate);
                          return (
                            <Link key={q.id} to="/quotes/$quoteId" params={{ quoteId: q.id }} className="flex items-center justify-between p-3 hover:bg-muted/40 text-sm">
                              <div>
                                <div className="font-medium font-mono">{q.id}</div>
                                <div className="text-xs text-muted-foreground">{q.lines.length} items · {fmtDate(q.createdAt)}</div>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="tabular-nums">{fmtVND(total)}</span>
                                <Badge variant="outline">{q.status}</Badge>
                              </div>
                            </Link>
                          );
                        })}
                      </div>}
                  </TabsContent>
                  <TabsContent value="contracts" className="mt-4 space-y-3">
                    {contracts.length === 0 ? <Empty label="No contracts." /> :
                      <div className="divide-y rounded-lg border">
                        {contracts.map((c) => (
                          <Link key={c.id} to="/service-contracts" className="flex items-center justify-between p-3 hover:bg-muted/40 text-sm">
                            <div>
                              <div className="font-medium font-mono">{c.id}</div>
                              <div className="text-xs text-muted-foreground">{fmtDate(c.startDate)} → {fmtDate(c.endDate)}</div>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="tabular-nums">{fmtVND(c.value)}</span>
                              <Badge variant="outline">{c.status}</Badge>
                            </div>
                          </Link>
                        ))}
                      </div>}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </section>
        </div>
      </div>

      <CreateOppModal open={oppModalOpen} onOpenChange={setOppModalOpen} lead={lead} org={org} />
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1.5"><label className="text-xs font-medium text-muted-foreground">{label}</label>{children}</div>;
}
function SnapshotCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-card p-3">
      <div className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="text-base font-semibold tabular-nums mt-1">{value}</div>
    </div>
  );
}
function Empty({ label }: { label: string }) {
  return <div className="text-sm text-muted-foreground text-center py-10 border rounded-lg border-dashed">{label}</div>;
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[110px_1fr] items-center gap-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="min-w-0">{value}</div>
    </div>
  );
}

const SOURCE_TAGS = ["zalo", "tiktok", "facebook", "shopee", "tiki", "hotline", "referral"];
function sourceTags(tags: string[]): string[] {
  return tags.filter((t) => SOURCE_TAGS.includes(t.toLowerCase()));
}

function PurchaseHistory({ orders, products }: { orders: import("@/lib/types").Order[]; products: import("@/lib/types").Product[] }) {
  const prodName = (id: string) => products.find((p) => p.id === id)?.name ?? id;
  const now = Date.now();
  const cutoff = now - 30 * 86_400_000;
  const rows = (filtered: typeof orders) => filtered.flatMap((o) =>
    o.lines.map((l, idx) => ({
      key: `${o.id}-${idx}`,
      name: prodName(l.productId),
      qty: l.qty,
      value: l.qty * l.price,
      date: o.createdAt,
    })),
  ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const last30 = rows(orders.filter((o) => new Date(o.createdAt).getTime() >= cutoff));
  const all = rows(orders);

  const Table = ({ data, totalLabel }: { data: ReturnType<typeof rows>; totalLabel: string }) => {
    const total = data.reduce((s, r) => s + r.value, 0);
    if (data.length === 0) return <Empty label="No orders in this period." />;
    return (
      <div className="rounded-lg border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-xs text-muted-foreground">
            <tr>
              <th className="text-left font-medium px-3 py-2">Product</th>
              <th className="text-right font-medium px-3 py-2 w-20">Qty</th>
              <th className="text-right font-medium px-3 py-2 w-32">Value</th>
              <th className="text-right font-medium px-3 py-2 w-28">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {data.map((r) => (
              <tr key={r.key} className="hover:bg-muted/30">
                <td className="px-3 py-2">{r.name}</td>
                <td className="px-3 py-2 text-right tabular-nums">{r.qty}</td>
                <td className="px-3 py-2 text-right tabular-nums">{fmtVND(r.value)}</td>
                <td className="px-3 py-2 text-right text-muted-foreground">{fmtDate(r.date)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-muted/30 font-semibold">
            <tr>
              <td className="px-3 py-2" colSpan={2}>{totalLabel}</td>
              <td className="px-3 py-2 text-right tabular-nums" colSpan={2}>{fmtVND(total)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    );
  };

  return (
    <Tabs defaultValue="30d">
      <TabsList>
        <TabsTrigger value="30d">Last 30 Days</TabsTrigger>
        <TabsTrigger value="all">All Time</TabsTrigger>
      </TabsList>
      <TabsContent value="30d" className="mt-4"><Table data={last30} totalLabel="Total (Last 30 days)" /></TabsContent>
      <TabsContent value="all" className="mt-4"><Table data={all} totalLabel="Total (All time)" /></TabsContent>
    </Tabs>
  );
}

function CreateOppModal({ open, onOpenChange, lead, org }: { open: boolean; onOpenChange: (v: boolean) => void; lead: Lead; org?: { id: string; name: string } }) {
  const navigate = useNavigate();
  const orgs = useStore((s) => s.organizations);
  const contacts = useStore((s) => s.contacts);
  const [name, setName] = useState(`${lead.name} — Opportunity`);
  const [orgId, setOrgId] = useState(org?.id ?? "");
  const [contactId, setContactId] = useState<string>("");
  const [value, setValue] = useState(lead.value || 0);
  const [closeDate, setCloseDate] = useState(new Date(Date.now() + 14 * 86_400_000).toISOString().slice(0, 10));
  const [owner, setOwner] = useState(lead.owner);

  const submit = () => {
    if (!name.trim()) return toast.error("Name required");
    let resolvedOrgId = orgId;
    // If company lead has no org yet, auto-create one
    if (!resolvedOrgId && lead.customerType === "company" && lead.companyName) {
      const newOrg = orgActions.create({ name: lead.companyName, taxCode: lead.taxCode, industry: lead.industry, phone: lead.phone });
      resolvedOrgId = newOrg.id;
      leadActions.update(lead.id, { orgId: newOrg.id });
    }
    const o = opportunityActions.create({
      name, leadId: lead.id, orgId: resolvedOrgId || undefined, contactId: contactId || undefined,
      value, owner, closeDate: new Date(closeDate).toISOString(), status: "open",
    });
    leadActions.addActivity(lead.id, { type: "note", content: `Created opportunity ${o.id} — ${o.name}` });
    toast.success("Opportunity created");
    onOpenChange(false);
    navigate({ to: "/opportunities/$oppId", params: { oppId: o.id } });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle className="flex items-center gap-2"><Target className="h-4 w-4" /> Create Opportunity</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5"><Label className="text-xs">Opportunity name</Label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Organization</Label>
              <Select value={orgId} onValueChange={setOrgId}>
                <SelectTrigger><SelectValue placeholder="— None —" /></SelectTrigger>
                <SelectContent>{orgs.map((o) => <SelectItem key={o.id} value={o.id}>{o.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Contact</Label>
              <Select value={contactId} onValueChange={setContactId}>
                <SelectTrigger><SelectValue placeholder="— None —" /></SelectTrigger>
                <SelectContent>{contacts.filter(c => !orgId || c.orgId === orgId).map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5"><Label className="text-xs">Value</Label><Input type="number" value={value} onChange={(e) => setValue(Number(e.target.value) || 0)} /></div>
            <div className="space-y-1.5"><Label className="text-xs">Close date</Label><Input type="date" value={closeDate} onChange={(e) => setCloseDate(e.target.value)} /></div>
            <div className="space-y-1.5 col-span-2">
              <Label className="text-xs">Owner</Label>
              <Select value={owner} onValueChange={setOwner}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{OWNERS.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={submit} className="gap-2"><FileText className="h-4 w-4" /> Create</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
