import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Phone, Mail, PhoneCall, StickyNote, CalendarDays, CheckSquare,
  Flame, AlertTriangle, X, Plus, Clock, Target, FileText, FileSignature, Building2, UserCircle,
  ArrowRight, CheckCircle2, Circle, ArrowRightLeft, Sparkles,
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
  const lead = useStore((s) => s.leads.find((l) => l.id === leadId));
  const orgs = useStore((s) => s.organizations);
  const opps = useStore((s) => s.opportunities.filter((o) => o.leadId === leadId));
  const quotes = useStore((s) => s.quotes.filter((q) => opps.some((o) => o.id === q.oppId)));
  const contracts = useStore((s) => s.serviceContracts.filter((c) => c.leadId === leadId));

  const [composer, setComposer] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [oppModalOpen, setOppModalOpen] = useState(false);
  const [convertOpen, setConvertOpen] = useState(false);
  const [justConverted, setJustConverted] = useState(false);

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

  const handleConvert = () => {
    const o = opportunityActions.create({
      name: `${lead.name} — Opportunity`,
      leadId: lead.id,
      orgId: lead.orgId,
      value: lead.value || 0,
      owner: lead.owner,
      closeDate: new Date(Date.now() + 14 * 86_400_000).toISOString(),
      status: "open",
    });
    leadActions.addActivity(lead.id, { type: "note", content: `Converted to opportunity ${o.id}` });
    setConvertOpen(false);
    setJustConverted(true);
    toast.success("Lead successfully converted to Opportunity");
    setTimeout(() => navigate({ to: "/opportunities/$oppId", params: { oppId: o.id } }), 400);
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
              {isConverted ? (<><Sparkles className="h-3 w-3 mr-1" /> Opportunity</>) : "Lead"}
            </Badge>
            <Button variant="outline" size="sm" className="gap-2"><Phone className="h-3.5 w-3.5" /> Call</Button>
            <TooltipProvider delayDuration={150}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span tabIndex={canConvert ? -1 : 0}>
                    <Button
                      size="sm"
                      disabled={!canConvert}
                      onClick={() => setConvertOpen(true)}
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

      <AlertDialog open={convertOpen} onOpenChange={setConvertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <ArrowRightLeft className="h-4 w-4 text-primary" /> Convert Lead to Opportunity
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action will move <span className="font-medium text-foreground">{lead.name}</span> into the sales pipeline as an opportunity. You can continue refining the deal afterward.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConvert} className="gap-2">
              <ArrowRightLeft className="h-3.5 w-3.5" /> Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>


      <div className="mx-auto max-w-7xl px-6 py-6 grid grid-cols-1 lg:grid-cols-10 gap-6">
        {/* LEFT 70% */}
        <section className="lg:col-span-7 space-y-6">
          {/* Customer Snapshot + Journey */}
          <Card>
            <CardContent className="p-6 space-y-5">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex items-start gap-3">
                  {lead.customerType === "company" ? <Building2 className="h-7 w-7 text-muted-foreground mt-1" /> : <UserCircle className="h-7 w-7 text-muted-foreground mt-1" />}
                  <div>
                    <h1 className="text-2xl font-semibold tracking-tight">{lead.name}</h1>
                    <div className="text-sm text-muted-foreground mt-1 flex flex-wrap items-center gap-3">
                      <span className="inline-flex items-center gap-1"><Phone className="h-3.5 w-3.5" /> {lead.phone}</span>
                      {lead.email && <span className="inline-flex items-center gap-1"><Mail className="h-3.5 w-3.5" /> {lead.email}</span>}
                      {(lead.companyName || org) && <span className="inline-flex items-center gap-1"><Building2 className="h-3.5 w-3.5" /> {lead.companyName ?? org?.name}</span>}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-muted-foreground">Deal value</div>
                  <div className="text-xl font-semibold tabular-nums">{fmtVND(lead.value)}</div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-3 border-t">
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900">{d.type}</Badge>
                <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-900">{d.stage}</Badge>
                {d.tier && <Badge className={cn("font-semibold", tierClasses(d.tier))}>{d.tier}</Badge>}
                {d.high && <Badge className="bg-destructive text-destructive-foreground gap-1"><Flame className="h-3 w-3" /> HIGH</Badge>}
                {d.stale && <Badge variant="outline" className="border-destructive/40 text-destructive gap-1"><AlertTriangle className="h-3 w-3" /> Stale · {daysSince(lead.last_touch)}d</Badge>}
              </div>

              {/* Pipeline progression */}
              <div className="pt-3 border-t">
                <div className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wide">Customer Journey</div>
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

              {/* Snapshot */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t">
                <SnapshotCell label="Opportunities" value={opps.length.toString()} />
                <SnapshotCell label="Total value" value={fmtVND(totalValue)} />
                <SnapshotCell label="Quotes sent" value={quotesSent.toString()} />
                <SnapshotCell label="Contracts active" value={contractsActive.toString()} />
              </div>
            </CardContent>
          </Card>

          {/* Tabs */}
          <Card>
            <CardContent className="p-4">
              <Tabs defaultValue="opps">
                <TabsList>
                  <TabsTrigger value="opps">Opportunities ({opps.length})</TabsTrigger>
                  <TabsTrigger value="quotes">Quotes ({quotes.length})</TabsTrigger>
                  <TabsTrigger value="contracts">Contracts ({contracts.length})</TabsTrigger>
                  <TabsTrigger value="activities">Activities ({journeyActivities.length})</TabsTrigger>
                </TabsList>

                {/* Opportunities */}
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

                {/* Quotes */}
                <TabsContent value="quotes" className="mt-4 space-y-3">
                  {quotes.length === 0 ? <Empty label="No quotes. Create one from an opportunity." /> :
                    <div className="divide-y rounded-lg border">
                      {quotes.map((q) => {
                        const total = q.lines.reduce((s, l) => s + l.qty * l.price, 0) * (1 + q.taxRate);
                        return (
                          <Link key={q.id} to="/quotes/$quoteId" params={{ quoteId: q.id }} className="flex items-center justify-between p-3 hover:bg-muted/40 text-sm">
                            <div>
                              <div className="font-medium font-mono">{q.id}</div>
                              <div className="text-xs text-muted-foreground">{q.lines.length} items · created {fmtDate(q.createdAt)}</div>
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

                {/* Contracts */}
                <TabsContent value="contracts" className="mt-4 space-y-3">
                  {contracts.length === 0 ? <Empty label="No contracts. Accept a quote, then create a contract." /> :
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

                {/* Activities */}
                <TabsContent value="activities" className="mt-4 space-y-4">
                  <div className="space-y-3">
                    <Textarea value={composer} onChange={(e) => setComposer(e.target.value)} placeholder="Add note / log call / add task…" rows={3} />
                    <div className="flex flex-wrap gap-2">
                      <Button size="sm" variant="outline" className="gap-2" onClick={() => addActivity("note")}><StickyNote className="h-3.5 w-3.5" /> Note</Button>
                      <Button size="sm" variant="outline" className="gap-2" onClick={() => addActivity("call")}><PhoneCall className="h-3.5 w-3.5" /> Call</Button>
                      <Button size="sm" variant="outline" className="gap-2" onClick={() => addActivity("meeting")}><CalendarDays className="h-3.5 w-3.5" /> Meeting</Button>
                      <Button size="sm" className="gap-2 ml-auto" onClick={() => addActivity("task")}><CheckSquare className="h-3.5 w-3.5" /> Task</Button>
                    </div>
                  </div>
                  {journeyActivities.length === 0 ? <Empty label="No activity yet." /> : (
                    <ol className="relative border-l border-border ml-3 space-y-5 mt-4">
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
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </section>

        {/* RIGHT 30% */}
        <aside className="lg:col-span-3 space-y-6 lg:sticky lg:top-20 self-start">
          {/* Customer Info */}
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm">Customer Info</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <Field label="Name"><Input value={lead.name} onChange={(e) => setLead({ name: e.target.value })} /></Field>
              <Field label="Phone"><Input value={lead.phone} onChange={(e) => setLead({ phone: e.target.value })} /></Field>
              <Field label="Email"><Input value={lead.email ?? ""} onChange={(e) => setLead({ email: e.target.value })} placeholder="email@example.com" /></Field>
              <Field label="Customer type">
                <Select value={lead.customerType ?? "individual"} onValueChange={(v) => setLead({ customerType: v as "individual" | "company" })}>
                  <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="individual">Individual</SelectItem>
                    <SelectItem value="company">Company</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              {lead.customerType === "company" && (
                <>
                  <Field label="Company name"><Input value={lead.companyName ?? ""} onChange={(e) => setLead({ companyName: e.target.value })} /></Field>
                  <Field label="Tax code"><Input value={lead.taxCode ?? ""} onChange={(e) => setLead({ taxCode: e.target.value })} /></Field>
                  <Field label="Industry"><Input value={lead.industry ?? ""} onChange={(e) => setLead({ industry: e.target.value })} /></Field>
                </>
              )}
              <Field label="Owner">
                <Select value={lead.owner} onValueChange={(v) => setLead({ owner: v })}>
                  <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                  <SelectContent>{OWNERS.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                </Select>
              </Field>
              <Field label="Value (VND)"><Input type="number" value={lead.value} onChange={(e) => setLead({ value: Number(e.target.value) || 0 })} /></Field>
              <Field label="Next action"><Input value={lead.next_action} onChange={(e) => setLead({ next_action: e.target.value })} /></Field>
              <div className="text-xs text-muted-foreground">Last touch: {fmtDateTime(lead.last_touch)} ({daysSince(lead.last_touch)}d)</div>
            </CardContent>
          </Card>

          {/* Tags */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Tags</CardTitle>
              <p className="text-xs text-muted-foreground">Tags drive Type, Stage, Tier & Priority.</p>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-wrap gap-1.5 min-h-[2rem]">
                {lead.tags.length === 0 && <span className="text-xs text-muted-foreground">No tags.</span>}
                {lead.tags.map((t) => (
                  <span key={t} className="inline-flex items-center gap-1 rounded-full bg-secondary text-secondary-foreground pl-2.5 pr-1 py-0.5 text-xs font-medium">
                    {t}
                    <button onClick={() => removeTag(t)} className="hover:bg-background/60 rounded-full p-0.5" aria-label={`Remove ${t}`}><X className="h-3 w-3" /></button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <Input value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }} placeholder="Add tag (e.g. vang)" className="h-9" />
                <Button size="sm" onClick={addTag} className="gap-1"><Plus className="h-3.5 w-3.5" /> Add</Button>
              </div>
            </CardContent>
          </Card>
        </aside>
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
