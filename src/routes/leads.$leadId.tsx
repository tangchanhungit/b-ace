import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ArrowLeft, Phone, Mail, PhoneCall, StickyNote, CalendarDays, CheckSquare,
  Flame, AlertTriangle, X, Plus, Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { MOCK_LEADS, type Activity, type ActivityType, type Lead } from "@/lib/leads-mock";
import { derive, daysSince, type LeadTier } from "@/lib/leads-logic";

export const Route = createFileRoute("/leads/$leadId")({
  component: LeadDetailPage,
  head: ({ params }) => ({ meta: [{ title: `Lead ${params.leadId} — Tag-Driven CRM` }] }),
});

const OWNERS = ["Linh", "Minh", "Hà"];

function tierClasses(tier: LeadTier) {
  if (tier === "Gold") return "tier-gold-bg tier-gold-fg border-transparent";
  if (tier === "Silver") return "tier-silver-bg tier-silver-fg border-transparent";
  if (tier === "Bronze") return "tier-bronze-bg tier-bronze-fg border-transparent";
  return "bg-muted text-muted-foreground border-transparent";
}

const fmtVND = (n: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(n);

const fmtDateTime = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
};

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
  const initial = useMemo(() => MOCK_LEADS.find((l) => l.id === leadId), [leadId]);

  if (!initial) {
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

  const [lead, setLead] = useState<Lead>(initial);
  const [composer, setComposer] = useState("");
  const [tagInput, setTagInput] = useState("");

  const d = useMemo(() => derive(lead), [lead]);

  const addActivity = (type: ActivityType) => {
    const content = composer.trim();
    if (!content) return;
    const a: Activity = {
      id: `${lead.id}-a${Date.now()}`,
      type,
      content,
      created_at: new Date().toISOString(),
    };
    setLead((l) => ({ ...l, activities: [a, ...l.activities], last_touch: a.created_at }));
    setComposer("");
  };

  const addTag = () => {
    const t = tagInput.trim().toLowerCase().replace(/\s+/g, "_");
    if (!t || lead.tags.includes(t)) { setTagInput(""); return; }
    setLead((l) => ({ ...l, tags: [...l.tags, t] }));
    setTagInput("");
  };

  const removeTag = (t: string) =>
    setLead((l) => ({ ...l, tags: l.tags.filter((x) => x !== t) }));

  const sortedActivities = useMemo(
    () => [...lead.activities].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()),
    [lead.activities],
  );

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="mx-auto max-w-7xl px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link to="/leads"><Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button></Link>
            <div>
              <div className="text-xs text-muted-foreground">Lead · {lead.id}</div>
              <div className="text-sm font-medium">{lead.name}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2"><Phone className="h-3.5 w-3.5" /> Call</Button>
            <Button variant="outline" size="sm" className="gap-2"><Mail className="h-3.5 w-3.5" /> Email</Button>
            <Button size="sm" onClick={() => navigate({ to: "/leads" })}>Save</Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-6 grid grid-cols-1 lg:grid-cols-10 gap-6">
        {/* LEFT 70% */}
        <section className="lg:col-span-7 space-y-6">
          {/* Header card */}
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <h1 className="text-2xl font-semibold tracking-tight">{lead.name}</h1>
                  <div className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5" /> {lead.phone}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-muted-foreground">Deal value</div>
                  <div className="text-xl font-semibold tabular-nums">{fmtVND(lead.value)}</div>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t">
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900">
                  {d.type}
                </Badge>
                <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-900">
                  {d.stage}
                </Badge>
                {d.tier && <Badge className={cn("font-semibold", tierClasses(d.tier))}>{d.tier}</Badge>}
                {d.high && (
                  <Badge className="bg-destructive text-destructive-foreground gap-1">
                    <Flame className="h-3 w-3" /> HIGH
                  </Badge>
                )}
                {d.stale && (
                  <Badge variant="outline" className="border-destructive/40 text-destructive gap-1">
                    <AlertTriangle className="h-3 w-3" /> Stale · {daysSince(lead.last_touch)}d
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Composer */}
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm">Log activity</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <Textarea
                value={composer}
                onChange={(e) => setComposer(e.target.value)}
                placeholder="Add note / log call / add task…"
                rows={3}
              />
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="outline" className="gap-2" onClick={() => addActivity("note")}>
                  <StickyNote className="h-3.5 w-3.5" /> Add Note
                </Button>
                <Button size="sm" variant="outline" className="gap-2" onClick={() => addActivity("call")}>
                  <PhoneCall className="h-3.5 w-3.5" /> Log Call
                </Button>
                <Button size="sm" variant="outline" className="gap-2" onClick={() => addActivity("meeting")}>
                  <CalendarDays className="h-3.5 w-3.5" /> Log Meeting
                </Button>
                <Button size="sm" className="gap-2 ml-auto" onClick={() => addActivity("task")}>
                  <CheckSquare className="h-3.5 w-3.5" /> Create Task
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-sm">Activity timeline</CardTitle>
              <span className="text-xs text-muted-foreground">{sortedActivities.length} items</span>
            </CardHeader>
            <CardContent>
              {sortedActivities.length === 0 ? (
                <div className="text-sm text-muted-foreground text-center py-8">No activities yet.</div>
              ) : (
                <ol className="relative border-l border-border ml-3 space-y-5">
                  {sortedActivities.map((a) => (
                    <li key={a.id} className="ml-6">
                      <span className={cn("absolute -left-3 flex h-6 w-6 items-center justify-center rounded-full ring-4 ring-card", activityColor(a.type))}>
                        {activityIcon(a.type)}
                      </span>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{a.type}</span>
                        <span className="text-xs text-muted-foreground inline-flex items-center gap-1">
                          <Clock className="h-3 w-3" /> {fmtDateTime(a.created_at)}
                        </span>
                      </div>
                      <p className="text-sm leading-relaxed">{a.content}</p>
                    </li>
                  ))}
                </ol>
              )}
            </CardContent>
          </Card>
        </section>

        {/* RIGHT 30% */}
        <aside className="lg:col-span-3 space-y-6 lg:sticky lg:top-20 self-start">
          {/* Lead info */}
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm">Lead info</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <Field label="Owner">
                <Select value={lead.owner} onValueChange={(v) => setLead((l) => ({ ...l, owner: v }))}>
                  <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {OWNERS.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Value (VND)">
                <Input
                  type="number"
                  value={lead.value}
                  onChange={(e) => setLead((l) => ({ ...l, value: Number(e.target.value) || 0 }))}
                />
              </Field>
              <Field label="Last touch">
                <div className="text-sm">{fmtDateTime(lead.last_touch)} · <span className="text-muted-foreground">{daysSince(lead.last_touch)}d ago</span></div>
              </Field>
              <Field label="Next action">
                <Input
                  value={lead.next_action}
                  onChange={(e) => setLead((l) => ({ ...l, next_action: e.target.value }))}
                />
              </Field>
            </CardContent>
          </Card>

          {/* Tag manager */}
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
                    <button
                      onClick={() => removeTag(t)}
                      className="hover:bg-background/60 rounded-full p-0.5"
                      aria-label={`Remove ${t}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
                  placeholder="Add new tag (e.g. vang)"
                  className="h-9"
                />
                <Button size="sm" onClick={addTag} className="gap-1"><Plus className="h-3.5 w-3.5" /> Add</Button>
              </div>
            </CardContent>
          </Card>

          {/* Quick insights */}
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm">Quick insights</CardTitle></CardHeader>
            <CardContent className="space-y-2.5 text-sm">
              <InsightRow label="Type" value={
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900">{d.type}</Badge>
              } />
              <InsightRow label="Stage" value={
                <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-900">{d.stage}</Badge>
              } />
              <InsightRow label="Tier" value={
                d.tier ? <Badge className={cn("font-semibold", tierClasses(d.tier))}>{d.tier}</Badge>
                       : <span className="text-muted-foreground text-xs">—</span>
              } />
              <InsightRow label="Priority" value={
                d.high
                  ? <Badge className="bg-destructive text-destructive-foreground gap-1"><Flame className="h-3 w-3" /> HIGH</Badge>
                  : <span className="text-muted-foreground text-xs">Normal</span>
              } />
              <InsightRow label="Stale" value={
                d.stale
                  ? <span className="inline-flex items-center gap-1 text-destructive text-xs font-medium"><AlertTriangle className="h-3 w-3" /> Yes</span>
                  : <span className="text-emerald-600 text-xs font-medium">No</span>
              } />
              <p className="text-[11px] text-muted-foreground pt-2 border-t">Read-only · computed from tags.</p>
            </CardContent>
          </Card>
        </aside>
      </main>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      {children}
    </div>
  );
}

function InsightRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-muted-foreground">{label}</span>
      <div>{value}</div>
    </div>
  );
}
