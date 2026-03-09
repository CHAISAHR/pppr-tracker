import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface AddIndicatorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function AddIndicatorDialog({ open, onOpenChange, onSuccess }: AddIndicatorDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    workstream: "",
    organisation: "",
    activity_id: "",
    subactivity_id: "",
    core_indicators: "",
    name: "",
    description: "",
    unit: "",
    year: "",
    target: "",
    q1: "",
    q2: "",
    q3: "",
    q4: "",
    evidence: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const q1 = formData.q1 ? Number(formData.q1) : null;
      const q2 = formData.q2 ? Number(formData.q2) : null;
      const q3 = formData.q3 ? Number(formData.q3) : null;
      const q4 = formData.q4 ? Number(formData.q4) : null;
      const annual_performance = [q1, q2, q3, q4].filter(v => v !== null).reduce((a, b) => a + b, 0) || null;

      const { error } = await supabase
        .from("indicators")
        .insert([{
          workstream: formData.workstream || null,
          organisation: formData.organisation || null,
          activity_id: formData.activity_id || null,
          subactivity_id: formData.subactivity_id || null,
          core_indicators: formData.core_indicators || null,
          name: formData.name,
          description: formData.description || null,
          unit: formData.unit,
          year: formData.year ? Number(formData.year) : null,
          target: formData.target ? Number(formData.target) : null,
          q1, q2, q3, q4,
          annual_performance,
          evidence: formData.evidence || null,
        }] as any);

      if (error) throw error;

      toast.success("Indicator created successfully");
      setFormData({
        workstream: "", organisation: "", activity_id: "", subactivity_id: "",
        core_indicators: "", name: "", description: "", unit: "",
        year: "", target: "", q1: "", q2: "", q3: "", q4: "", evidence: "",
      });
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error("Error creating indicator:", error);
      toast.error("Failed to create indicator");
    } finally {
      setLoading(false);
    }
  };

  const update = (field: string, value: string) => setFormData(prev => ({ ...prev, [field]: value }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Add New Indicator</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[70vh] pr-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Workstream</Label>
                <Input value={formData.workstream} onChange={e => update("workstream", e.target.value)} placeholder="e.g., Capacity Building" />
              </div>
              <div className="space-y-2">
                <Label>Organisation</Label>
                <Input value={formData.organisation} onChange={e => update("organisation", e.target.value)} placeholder="e.g., UNDP" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Activity ID</Label>
                <Input value={formData.activity_id} onChange={e => update("activity_id", e.target.value)} placeholder="e.g., ACT-001" />
              </div>
              <div className="space-y-2">
                <Label>Subactivity ID</Label>
                <Input value={formData.subactivity_id} onChange={e => update("subactivity_id", e.target.value)} placeholder="e.g., SUB-001" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Core Indicators</Label>
                <Input value={formData.core_indicators} onChange={e => update("core_indicators", e.target.value)} placeholder="e.g., Output 1.1" />
              </div>
              <div className="space-y-2">
                <Label>Indicator Name *</Label>
                <Input value={formData.name} onChange={e => update("name", e.target.value)} placeholder="e.g., Participants Reached" required />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Unit *</Label>
                <Input value={formData.unit} onChange={e => update("unit", e.target.value)} placeholder="e.g., %" required />
              </div>
              <div className="space-y-2">
                <Label>Year</Label>
                <Input type="number" value={formData.year} onChange={e => update("year", e.target.value)} placeholder="e.g., 2026" />
              </div>
              <div className="space-y-2">
                <Label>Target</Label>
                <Input type="number" value={formData.target} onChange={e => update("target", e.target.value)} placeholder="e.g., 100" />
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>Q1</Label>
                <Input type="number" value={formData.q1} onChange={e => update("q1", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Q2</Label>
                <Input type="number" value={formData.q2} onChange={e => update("q2", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Q3</Label>
                <Input type="number" value={formData.q3} onChange={e => update("q3", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Q4</Label>
                <Input type="number" value={formData.q4} onChange={e => update("q4", e.target.value)} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Evidence (URL)</Label>
              <Input type="url" value={formData.evidence} onChange={e => update("evidence", e.target.value)} placeholder="https://drive.google.com/..." />
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={formData.description} onChange={e => update("description", e.target.value)} placeholder="Brief description" rows={2} />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Indicator
              </Button>
            </div>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
