import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { PageHeader } from "@/components/app-shell";
import { useStore, taskActions } from "@/lib/store";
import type { TaskStatus } from "@/lib/types";
import { OWNERS } from "@/lib/format";

export const Route = createFileRoute("/project-tasks")({
  component: TasksPage,
  head: () => ({ meta: [{ title: "Project Tasks — Tag-Driven CRM" }] }),
});

const COLUMNS: { key: TaskStatus; title: string }[] = [
  { key: "todo", title: "To do" },
  { key: "doing", title: "Doing" },
  { key: "done", title: "Done" },
];

function TasksPage() {
  const tasks = useStore((s) => s.tasks);
  const projects = useStore((s) => s.projects);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", projectId: "", assignee: "Linh" });

  const submit = () => {
    if (!form.title.trim()) return toast.error("Title required");
    taskActions.create({ title: form.title.trim(), projectId: form.projectId || undefined, assignee: form.assignee });
    toast.success("Task created");
    setOpen(false); setForm({ title: "", projectId: "", assignee: "Linh" });
  };

  const move = (id: string, status: TaskStatus) => { taskActions.setStatus(id, status); };

  return (
    <>
      <PageHeader
        title="Project Tasks"
        description={`${tasks.length} tasks · Kanban`}
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button className="gap-2"><Plus className="h-4 w-4" /> New Task</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Create Task</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div><Label>Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Project</Label>
                    <Select value={form.projectId} onValueChange={(v) => setForm({ ...form, projectId: v })}>
                      <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                      <SelectContent>{projects.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div><Label>Assignee</Label>
                    <Select value={form.assignee} onValueChange={(v) => setForm({ ...form, assignee: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{OWNERS.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <DialogFooter><Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={submit}>Create</Button></DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />
      <div className="mx-auto max-w-7xl px-6 py-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        {COLUMNS.map((col) => {
          const items = tasks.filter((t) => t.status === col.key);
          return (
            <Card key={col.key}>
              <CardHeader className="pb-3"><CardTitle className="text-sm">{col.title} <span className="text-muted-foreground font-normal">({items.length})</span></CardTitle></CardHeader>
              <CardContent className="space-y-2 min-h-32">
                {items.length === 0 && <p className="text-xs text-muted-foreground">No tasks.</p>}
                {items.map((t) => {
                  const p = projects.find((x) => x.id === t.projectId);
                  return (
                    <div key={t.id} className="rounded-md border bg-card p-3 text-sm space-y-2">
                      <div className="flex justify-between gap-2">
                        <div className="font-medium">{t.title}</div>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => taskActions.remove(t.id)}><Trash2 className="h-3 w-3 text-muted-foreground" /></Button>
                      </div>
                      <div className="text-xs text-muted-foreground">{p?.name ?? "No project"} · {t.assignee ?? "—"}</div>
                      <Select value={t.status} onValueChange={(v) => move(t.id, v as TaskStatus)}>
                        <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>{COLUMNS.map((c) => <SelectItem key={c.key} value={c.key}>{c.title}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </>
  );
}
