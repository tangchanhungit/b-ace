import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { PageHeader } from "@/components/app-shell";
import { useStore, projectActions } from "@/lib/store";

export const Route = createFileRoute("/projects")({
  component: ProjectsPage,
  head: () => ({ meta: [{ title: "Projects — Tag-Driven CRM" }] }),
});

function ProjectsPage() {
  const projects = useStore((s) => s.projects);
  const tasks = useStore((s) => s.tasks);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", description: "" });

  const submit = () => {
    if (!form.name.trim()) return toast.error("Name required");
    projectActions.create({ ...form, name: form.name.trim() });
    toast.success("Project created");
    setOpen(false); setForm({ name: "", description: "" });
  };

  return (
    <>
      <PageHeader
        title="Projects"
        description={`${projects.length} projects`}
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button className="gap-2"><Plus className="h-4 w-4" /> New Project</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Create Project</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
                <div><Label>Description</Label><Textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
              </div>
              <DialogFooter><Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={submit}>Create</Button></DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />
      <div className="mx-auto max-w-7xl px-6 py-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map((p) => {
          const t = tasks.filter((x) => x.projectId === p.id);
          const done = t.filter((x) => x.status === "done").length;
          return (
            <Card key={p.id}>
              <CardHeader className="pb-3 flex flex-row justify-between items-start">
                <div>
                  <CardTitle className="text-sm">{p.name}</CardTitle>
                  {p.description && <p className="text-xs text-muted-foreground mt-1">{p.description}</p>}
                </div>
                <Button variant="ghost" size="icon" onClick={() => { projectActions.remove(p.id); toast.success("Deleted"); }}><Trash2 className="h-4 w-4 text-muted-foreground" /></Button>
              </CardHeader>
              <CardContent className="text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Tasks</span><span>{done}/{t.length}</span></div>
                <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden"><div className="h-full bg-primary" style={{ width: t.length ? `${(done / t.length) * 100}%` : "0%" }} /></div>
              </CardContent>
            </Card>
          );
        })}
        {projects.length === 0 && <p className="text-sm text-muted-foreground">No projects.</p>}
      </div>
    </>
  );
}
