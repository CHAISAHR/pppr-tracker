import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  const [formData, setFormData] = useState(mapIndicatorToForm(indicator));

  function mapIndicatorToForm(ind: Indicator) {
    return {
      country: ind.country || "", activity_id: ind.activity_id || "",
      activity: ind.activity || "", long_term_outcome: ind.long_term_outcome || "",
      core_indicators: ind.core_indicators || "", workstream: ind.workstream || "",
      indicator_type: ind.indicator_type || "", name: ind.name,
      indicator_definition: ind.indicator_definition || "",
      naphs: ind.naphs || "", responsibility: ind.responsibility || "",
      organisation: ind.organisation || "", cost_usd: ind.cost_usd?.toString() || "",
      implementing_entity: ind.implementing_entity || "",
      data_source: ind.data_source || "", unit: ind.unit,
      subactivity_id: ind.subactivity_id || "", description: ind.description || "",
      baseline_proposal_year: ind.baseline_proposal_year?.toString() || "",
      quarter_3: ind.quarter_3?.toString() || "",
      target_year_1: ind.target_year_1?.toString() || "",
      target_year_2: ind.target_year_2?.toString() || "",
      target_year_3: ind.target_year_3?.toString() || "",
      year: ind.year?.toString() || "", target: ind.target?.toString() || "",
      q1: ind.q1?.toString() || "", q2: ind.q2?.toString() || "",
      q3: ind.q3?.toString() || "", q4: ind.q4?.toString() || "",
      evidence: ind.evidence || "",
    };
  }

  useEffect(() => {
    setFormData(mapIndicatorToForm(indicator));
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

      const { error } = await supabase.from("indicators").update({
        country: formData.country || null, activity_id: formData.activity_id || null,
        activity: formData.activity || null, long_term_outcome: formData.long_term_outcome || null,
        core_indicators: formData.core_indicators || null, workstream: formData.workstream || null,
        indicator_type: formData.indicator_type || null, name: formData.name,
        indicator_definition: formData.indicator_definition || null,
        naphs: formData.naphs || null, responsibility: formData.responsibility || null,
        organisation: formData.organisation || null,
        cost_usd: formData.cost_usd ? Number(formData.cost_usd) : null,
        implementing_entity: formData.implementing_entity || null,
        data_source: formData.data_source || null, unit: formData.unit,
        subactivity_id: formData.subactivity_id || null, description: formData.description || null,
        baseline_proposal_year: formData.baseline_proposal_year ? Number(formData.baseline_proposal_year) : null,
        quarter_3: formData.quarter_3 ? Number(formData.quarter_3) : null,
        target_year_1: formData.target_year_1 ? Number(formData.target_year_1) : null,
        target_year_2: formData.target_year_2 ? Number(formData.target_year_2) : null,
        target_year_3: formData.target_year_3 ? Number(formData.target_year_3) : null,
        year: formData.year ? Number(formData.year) : null,
        target: formData.target ? Number(formData.target) : null,
        q1, q2, q3, q4, annual_performance,
        evidence: formData.evidence || null,
      } as any).eq("id", indicator.id);

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
              <div className="space-y-2"><Label>Country</Label><Input value={formData.country} onChange={e => update("country", e.target.value)} /></div>
              <div className="space-y-2"><Label>Activity ID</Label><Input value={formData.activity_id} onChange={e => update("activity_id", e.target.value)} /></div>
            </div>
            <div className="space-y-2"><Label>Activity</Label><Input value={formData.activity} onChange={e => update("activity", e.target.value)} /></div>
            <div className="space-y-2"><Label>Long-term Outcome</Label><Input value={formData.long_term_outcome} onChange={e => update("long_term_outcome", e.target.value)} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Core Indicator</Label><Input value={formData.core_indicators} onChange={e => update("core_indicators", e.target.value)} /></div>
              <div className="space-y-2"><Label>Workstream</Label><Input value={formData.workstream} onChange={e => update("workstream", e.target.value)} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Indicator Type</Label><Input value={formData.indicator_type} onChange={e => update("indicator_type", e.target.value)} /></div>
              <div className="space-y-2"><Label>Indicator Name *</Label><Input value={formData.name} onChange={e => update("name", e.target.value)} required /></div>
            </div>
            <div className="space-y-2"><Label>Indicator Definition</Label><Textarea value={formData.indicator_definition} onChange={e => update("indicator_definition", e.target.value)} rows={2} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>NAPHS</Label>
                <Select value={formData.naphs} onValueChange={v => update("naphs", v)}>
                  <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Yes">Yes</SelectItem>
                    <SelectItem value="No">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Responsibility</Label>
                <Select value={formData.responsibility} onValueChange={v => update("responsibility", v)}>
                  <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Delivery Partner">Delivery Partner</SelectItem>
                    <SelectItem value="Beneficiary">Beneficiary</SelectItem>
                    <SelectItem value="Implementing Entity">Implementing Entity</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Organisation Name</Label><Input value={formData.organisation} onChange={e => update("organisation", e.target.value)} /></div>
              <div className="space-y-2"><Label>Cost US$</Label><Input type="number" value={formData.cost_usd} onChange={e => update("cost_usd", e.target.value)} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Implementing Entity</Label><Input value={formData.implementing_entity} onChange={e => update("implementing_entity", e.target.value)} /></div>
              <div className="space-y-2"><Label>Data Source</Label><Input value={formData.data_source} onChange={e => update("data_source", e.target.value)} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Unit *</Label><Input value={formData.unit} onChange={e => update("unit", e.target.value)} required /></div>
              <div className="space-y-2"><Label>Subactivity ID</Label><Input value={formData.subactivity_id} onChange={e => update("subactivity_id", e.target.value)} /></div>
            </div>

            <div className="grid grid-cols-4 gap-4">
              <div className="space-y-2"><Label>Baseline Yr</Label><Input type="number" value={formData.baseline_proposal_year} onChange={e => update("baseline_proposal_year", e.target.value)} /></div>
              <div className="space-y-2"><Label>Quarter 3</Label><Input type="number" value={formData.quarter_3} onChange={e => update("quarter_3", e.target.value)} /></div>
              <div className="space-y-2"><Label>Target Y1</Label><Input type="number" value={formData.target_year_1} onChange={e => update("target_year_1", e.target.value)} /></div>
              <div className="space-y-2"><Label>Target Y2</Label><Input type="number" value={formData.target_year_2} onChange={e => update("target_year_2", e.target.value)} /></div>
            </div>
            <div className="space-y-2"><Label>Target Year 3</Label><Input type="number" value={formData.target_year_3} onChange={e => update("target_year_3", e.target.value)} /></div>

            <hr className="border-border" />
            <p className="text-sm font-medium text-muted-foreground">Performance Tracking</p>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2"><Label>Year</Label><Input type="number" value={formData.year} onChange={e => update("year", e.target.value)} /></div>
              <div className="space-y-2"><Label>Target</Label><Input type="number" value={formData.target} onChange={e => update("target", e.target.value)} /></div>
              <div className="space-y-2"><Label>Evidence (URL)</Label><Input type="url" value={formData.evidence} onChange={e => update("evidence", e.target.value)} /></div>
            </div>
            <div className="grid grid-cols-4 gap-4">
              <div className="space-y-2"><Label>Q1</Label><Input type="number" value={formData.q1} onChange={e => update("q1", e.target.value)} /></div>
              <div className="space-y-2"><Label>Q2</Label><Input type="number" value={formData.q2} onChange={e => update("q2", e.target.value)} /></div>
              <div className="space-y-2"><Label>Q3</Label><Input type="number" value={formData.q3} onChange={e => update("q3", e.target.value)} /></div>
              <div className="space-y-2"><Label>Q4</Label><Input type="number" value={formData.q4} onChange={e => update("q4", e.target.value)} /></div>
            </div>
            <div className="space-y-2"><Label>Description</Label><Textarea value={formData.description} onChange={e => update("description", e.target.value)} rows={2} /></div>

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
