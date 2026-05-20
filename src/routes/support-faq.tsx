import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Trash2, Pencil } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { PageHeader } from "@/components/app-shell";
import { useStore, faqActions } from "@/lib/store";

export const Route = createFileRoute("/support-faq")({
  component: FAQPage,
  head: () => ({ meta: [{ title: "Support FAQ — Tag-Driven CRM" }] }),
});

function FAQPage() {
  const faqs = useStore((s) => s.faqs);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState({ question: "", answer: "", category: "General" });

  const startCreate = () => { setEditing(null); setForm({ question: "", answer: "", category: "General" }); setOpen(true); };
  const startEdit = (id: string) => {
    const f = faqs.find((x) => x.id === id);
    if (!f) return;
    setEditing(id); setForm({ question: f.question, answer: f.answer, category: f.category }); setOpen(true);
  };

  const submit = () => {
    if (!form.question.trim() || !form.answer.trim()) return toast.error("Question & Answer required");
    if (editing) { faqActions.update(editing, form); toast.success("Updated"); }
    else { faqActions.create(form); toast.success("Added"); }
    setOpen(false);
  };

  return (
    <>
      <PageHeader
        title="Support FAQ"
        description={`${faqs.length} entries`}
        actions={<Button className="gap-2" onClick={startCreate}><Plus className="h-4 w-4" /> New FAQ</Button>}
      />
      <div className="mx-auto max-w-7xl px-6 py-6 space-y-3">
        {faqs.length === 0 && <p className="text-sm text-muted-foreground">No FAQ yet.</p>}
        {faqs.map((f) => (
          <Card key={f.id}>
            <CardContent className="p-4">
              <div className="flex justify-between gap-3">
                <div>
                  <div className="text-xs text-muted-foreground">{f.category}</div>
                  <div className="text-sm font-semibold mt-0.5">{f.question}</div>
                  <p className="text-sm mt-1 text-muted-foreground">{f.answer}</p>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={() => startEdit(f.id)}><Pencil className="h-4 w-4 text-muted-foreground" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => { faqActions.remove(f.id); toast.success("Deleted"); }}><Trash2 className="h-4 w-4 text-muted-foreground" /></Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent>
            <DialogHeader><DialogTitle>{editing ? "Edit FAQ" : "Create FAQ"}</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Category</Label><Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} /></div>
              <div><Label>Question</Label><Input value={form.question} onChange={(e) => setForm({ ...form, question: e.target.value })} /></div>
              <div><Label>Answer</Label><Textarea rows={4} value={form.answer} onChange={(e) => setForm({ ...form, answer: e.target.value })} /></div>
            </div>
            <DialogFooter><Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={submit}>Save</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
