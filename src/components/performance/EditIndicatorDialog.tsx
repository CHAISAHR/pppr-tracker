import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Indicator } from "./IndicatorsTab";

interface EditIndicatorDialogProps {
  indicator: Indicator;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function EditIndicatorDialog({ indicator, open, onOpenChange, onSuccess }: EditIndicatorDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    workstream: indicator.workstream || "",
    organisation: indicator.organisation || "",
    activity_id: indicator.activity_id || "",
    subactivity_id: indicator.subactivity_id || "",
    core_indicators: indicator.core_indicators || "",
    name: indicator.name,
    description: indicator.description || "",
    unit: indicator.unit,
    year: indicator.year?.toString() || "",
    target: indicator.target?.toString() || "",
    q1: indicator.q1?.toString() || "",
    q2: indicator.q2?.toString() || "",
    q3: indicator.q3?.toString() || "",
    q4: indicator.q4?.toString() || "",
    evidence: indicator.evidence || "",
  });

  useEffect(() => {
    setFormData({
      workstream: indicator.workstream || "",
      organisation: indicator.organisation || "",
      activity_id: indicator.activity_id || "",
      subactivity_id: indicator.subactivity_id || "",
      core_indicators: indicator.core_indicators || "",
      name: indicator.name,
      description: indicator.description || "",
      unit: indicator.unit,
      year: indicator.year?.toString() || "",
      target: indicator.target?.toString() || "",
      q1: indicator.q1?.toString() || "",
      q2: indicator.q2?.toString() || "",
      q3: indicator.q3?.toString() || "",
      q4: indicator.q4?.toString() || "",
      evidence: indicator.evidence || "",
    });
  }, [indicator]);

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
        .update({
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
        } as any)
        .eq("id", indicator.id);

      if (error) throw error;

      toast.success("Indicator updated successfully");
      onSuccess();
    } catch (error) {
      console.error("Error updating indicator:", error);
      toast.error("Failed to update indicator");
    } finally {
      setLoading(false);
    }
  };

  const update = (field: string, value: string) => setFormData(prev => ({ ...prev, [field]: value }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Edit Indicator</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[70vh] pr-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Workstream</Label>
                <Input value={formData.workstream} onChange={e => update("workstream", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Organisation</Label>
                <Input value={formData.organisation} onChange={e => update("organisation", e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Activity ID</Label>
                <Input value={formData.activity_id} onChange={e => update("activity_id", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Subactivity ID</Label>
                <Input value={formData.subactivity_id} onChange={e => update("subactivity_id", e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Core Indicators</Label>
                <Input value={formData.core_indicators} onChange={e => update("core_indicators", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Indicator Name *</Label>
                <Input value={formData.name} onChange={e => update("name", e.target.value)} required />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Unit *</Label>
                <Input value={formData.unit} onChange={e => update("unit", e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Year</Label>
                <Input type="number" value={formData.year} onChange={e => update("year", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Target</Label>
                <Input type="number" value={formData.target} onChange={e => update("target", e.target.value)} />
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
              <Input type="url" value={formData.evidence} onChange={e => update("evidence", e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={formData.description} onChange={e => update("description", e.target.value)} rows={2} />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </div>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
