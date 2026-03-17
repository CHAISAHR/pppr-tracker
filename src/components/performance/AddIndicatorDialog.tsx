import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { api } from "@/services/api";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface AddIndicatorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const initialFormData = {
  country: "", activity_id: "", activity: "", long_term_outcome: "",
  core_indicators: "", workstream: "", indicator_type: "", name: "",
  indicator_definition: "", naphs: "", responsibility: "", organisation: "",
  cost_usd: "", implementing_entity: "", data_source: "", unit: "",
  baseline_proposal_year: "", target_year_1: "",
  target_year_2: "", target_year_3: "", target_year_4: "",
  target_year_5: "", target_year_6: "", year: "", target: "",
  q1: "", q2: "", q3: "", q4: "", evidence: "", description: "",
  subactivity_id: "",
};

export function AddIndicatorDialog({ open, onOpenChange, onSuccess }: AddIndicatorDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(initialFormData);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const q1 = formData.q1 ? Number(formData.q1) : null;
      const q2 = formData.q2 ? Number(formData.q2) : null;
      const q3 = formData.q3 ? Number(formData.q3) : null;
      const q4 = formData.q4 ? Number(formData.q4) : null;
      const annual_performance = [q1, q2, q3, q4].filter(v => v !== null).reduce((a, b) => a + b, 0) || null;

      await api.createIndicator({
        country: formData.country || null,
        activity_id: formData.activity_id || null,
        activity: formData.activity || null,
        long_term_outcome: formData.long_term_outcome || null,
        core_indicators: formData.core_indicators || null,
        workstream: formData.workstream || null,
        indicator_type: formData.indicator_type || null,
        name: formData.name,
        indicator_definition: formData.indicator_definition || null,
        naphs: formData.naphs || null,
        responsibility: formData.responsibility || null,
        organisation: formData.organisation || null,
        cost_usd: formData.cost_usd ? Number(formData.cost_usd) : null,
        implementing_entity: formData.implementing_entity || null,
        data_source: formData.data_source || null,
        unit: formData.unit || "Number",
        subactivity_id: formData.subactivity_id || null,
        description: formData.description || null,
        baseline_proposal_year: formData.baseline_proposal_year ? Number(formData.baseline_proposal_year) : null,
        target_year_1: formData.target_year_1 ? Number(formData.target_year_1) : null,
        target_year_2: formData.target_year_2 ? Number(formData.target_year_2) : null,
        target_year_3: formData.target_year_3 ? Number(formData.target_year_3) : null,
        target_year_4: formData.target_year_4 ? Number(formData.target_year_4) : null,
        target_year_5: formData.target_year_5 ? Number(formData.target_year_5) : null,
        target_year_6: formData.target_year_6 ? Number(formData.target_year_6) : null,
        year: formData.year ? Number(formData.year) : null,
        target: formData.target ? Number(formData.target) : null,
        q1, q2, q3, q4, annual_performance,
        evidence: formData.evidence || null,
      });

      toast.success("Indicator created successfully");
      setFormData(initialFormData);
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
                <Label>Country</Label>
                <Input value={formData.country} onChange={e => update("country", e.target.value)} placeholder="e.g., Kenya" />
              </div>
              <div className="space-y-2">
                <Label>Activity ID</Label>
                <Input value={formData.activity_id} onChange={e => update("activity_id", e.target.value)} placeholder="e.g., ACT-001" />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Activity</Label>
              <Input value={formData.activity} onChange={e => update("activity", e.target.value)} placeholder="Activity description" />
            </div>

            <div className="space-y-2">
              <Label>Long-term Outcome</Label>
              <Input value={formData.long_term_outcome} onChange={e => update("long_term_outcome", e.target.value)} placeholder="e.g., Improved health security" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Core Indicator</Label>
                <Input value={formData.core_indicators} onChange={e => update("core_indicators", e.target.value)} placeholder="e.g., Output 1.1" />
              </div>
              <div className="space-y-2">
                <Label>Workstream</Label>
                <Input value={formData.workstream} onChange={e => update("workstream", e.target.value)} placeholder="e.g., Capacity Building" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Indicator Type</Label>
                <Input value={formData.indicator_type} onChange={e => update("indicator_type", e.target.value)} placeholder="e.g., Output" />
              </div>
              <div className="space-y-2">
                <Label>Indicator Name *</Label>
                <Input value={formData.name} onChange={e => update("name", e.target.value)} placeholder="e.g., Participants Reached" required />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Indicator Definition</Label>
              <Textarea value={formData.indicator_definition} onChange={e => update("indicator_definition", e.target.value)} placeholder="Detailed definition of the indicator" rows={2} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>NAPHS (Yes/No)</Label>
                <Select value={formData.naphs} onValueChange={v => update("naphs", v)}>
                  <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Yes">Yes</SelectItem>
                    <SelectItem value="No">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Responsibility for Implementation</Label>
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
              <div className="space-y-2">
                <Label>Delivery Partner</Label>
                <Input value={formData.organisation} onChange={e => update("organisation", e.target.value)} placeholder="e.g., UNDP" />
              </div>
              <div className="space-y-2">
                <Label>Cost US$</Label>
                <Input type="number" value={formData.cost_usd} onChange={e => update("cost_usd", e.target.value)} placeholder="e.g., 50000" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Implementing Entity</Label>
                <Input value={formData.implementing_entity} onChange={e => update("implementing_entity", e.target.value)} placeholder="e.g., Ministry of Health" />
              </div>
              <div className="space-y-2">
                <Label>Data Source</Label>
                <Input value={formData.data_source} onChange={e => update("data_source", e.target.value)} placeholder="e.g., Training records" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Unit *</Label>
                <Input value={formData.unit} onChange={e => update("unit", e.target.value)} placeholder="e.g., %" required />
              </div>
              <div className="space-y-2">
                <Label>Subactivity ID</Label>
                <Input value={formData.subactivity_id} onChange={e => update("subactivity_id", e.target.value)} placeholder="e.g., SUB-001" />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Baseline Proposal Year</Label>
                <Input type="number" value={formData.baseline_proposal_year} onChange={e => update("baseline_proposal_year", e.target.value)} placeholder="2025" />
              </div>
              <div className="space-y-2">
                <Label>Target Year 1</Label>
                <Input type="number" value={formData.target_year_1} onChange={e => update("target_year_1", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Target Year 2</Label>
                <Input type="number" value={formData.target_year_2} onChange={e => update("target_year_2", e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>Target Year 3</Label>
                <Input type="number" value={formData.target_year_3} onChange={e => update("target_year_3", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Target Year 4</Label>
                <Input type="number" value={formData.target_year_4} onChange={e => update("target_year_4", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Target Year 5</Label>
                <Input type="number" value={formData.target_year_5} onChange={e => update("target_year_5", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Target Year 6</Label>
                <Input type="number" value={formData.target_year_6} onChange={e => update("target_year_6", e.target.value)} />
              </div>
            </div>

            <hr className="border-border" />
            <p className="text-sm font-medium text-muted-foreground">Performance Tracking</p>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Year</Label>
                <Input type="number" value={formData.year} onChange={e => update("year", e.target.value)} placeholder="e.g., 2026" />
              </div>
              <div className="space-y-2">
                <Label>Target</Label>
                <Input type="number" value={formData.target} onChange={e => update("target", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Evidence (URL)</Label>
                <Input type="url" value={formData.evidence} onChange={e => update("evidence", e.target.value)} placeholder="https://..." />
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4">
              <div className="space-y-2"><Label>Q1</Label><Input type="number" value={formData.q1} onChange={e => update("q1", e.target.value)} /></div>
              <div className="space-y-2"><Label>Q2</Label><Input type="number" value={formData.q2} onChange={e => update("q2", e.target.value)} /></div>
              <div className="space-y-2"><Label>Q3</Label><Input type="number" value={formData.q3} onChange={e => update("q3", e.target.value)} /></div>
              <div className="space-y-2"><Label>Q4</Label><Input type="number" value={formData.q4} onChange={e => update("q4", e.target.value)} /></div>
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
