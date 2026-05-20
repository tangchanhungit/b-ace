import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { PageHeader } from "@/components/app-shell";
import { useStore, ruleActions } from "@/lib/store";

export const Route = createFileRoute("/rules")({
  component: RulesPage,
  head: () => ({ meta: [{ title: "Rules — Tag-Driven CRM" }] }),
});

function RulesPage() {
  const rules = useStore((s) => s.rules);

  const runStale = () => {
    const n = ruleActions.applyStaleTags();
    toast.success(`Tagged ${n} stale lead${n === 1 ? "" : "s"}`);
  };

  return (
    <>
      <PageHeader title="Rules" description="Simple automation. Toggle to enable, run manually when needed." />
      <div className="mx-auto max-w-7xl px-6 py-6 space-y-4">
        {rules.map((r) => (
          <Card key={r.id}>
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm">{r.name}</CardTitle>
                <p className="text-xs text-muted-foreground mt-1">{r.kind === "stale_tag" ? "Adds the 'stale' tag to leads with last_touch > 7 days." : "When a ticket is created with priority=urgent, assign it to the configured owner."}</p>
              </div>
              <Switch checked={r.enabled} onCheckedChange={() => { ruleActions.toggle(r.id); toast.success(r.enabled ? "Disabled" : "Enabled"); }} />
            </CardHeader>
            <CardContent className="space-y-3">
              {r.kind === "urgent_assign" && (
                <div className="flex items-center gap-2">
                  <Label className="text-xs">Assign to:</Label>
                  <Input className="w-40 h-8" value={r.param ?? ""} onChange={(e) => ruleActions.update(r.id, { param: e.target.value })} />
                </div>
              )}
              {r.kind === "stale_tag" && (
                <Button size="sm" variant="outline" onClick={runStale}>Run now</Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
