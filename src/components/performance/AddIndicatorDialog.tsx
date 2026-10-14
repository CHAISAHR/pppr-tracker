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
import { YearlyPerformanceEditor, parseYearly, serializeYearly } from "./yearlyPerformance";
import { DataLinksEditor } from "@/components/DataLinksEditor";
import { useAuth } from "@/contexts/AuthContext";

interface AddIndicatorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const initialFormData = {
  country: "", activity_id: "", activity: "", long_term_outcome: "",
  core_indicators: "", workstream: "", indicator_type: "", name: "",
  indicator_definition: "", naphs: "", responsibility: "", organisation: "",
  cost_usd: "", implementing_entity: "", comments: "", data_links: "",
  baseline_proposal_year: "", target_year_1: "", target_year_2: "",
  target_year_3: "", target_year_4: "", target_year_5: "", target_year_6: "",
};

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground pt-2 border-t border-border">
      {children}
    </p>
  );
}

export function AddIndicatorDialog({ open, onOpenChange, onSuccess }: AddIndicatorDialogProps) {
  const [loading, setLoading] = useState(false);
  const { user, isAdmin } = useAuth();
  const lockedOrg = !isAdmin() ? user?.organization || "" : null;
  const [formData, setFormData] = useState(initialFormData);
  const [yearly, setYearly] = useState(parseYearly(null));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
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
        organisation: (lockedOrg ?? formData.organisation) || null,
        cost_usd: formData.cost_usd ? Number(formData.cost_usd) : null,
        implementing_entity: formData.implementing_entity || null,
        comments: formData.comments || null,
        data_links: formData.data_links || null,
        baseline_proposal_year: formData.baseline_proposal_year || null,
        target_year_1: formData.target_year_1 || null,
        target_year_2: formData.target_year_2 || null,
        target_year_3: formData.target_year_3 || null,
        target_year_4: formData.target_year_4 || null,
        target_year_5: formData.target_year_5 || null,
        target_year_6: formData.target_year_6 || null,
        yearly_performance: serializeYearly(yearly),
      });

      toast.success("Indicator created successfully");
      setFormData(initialFormData);
      setYearly(parseYearly(null));
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
            <SectionTitle>Activity Context</SectionTitle>
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

            <SectionTitle>Indicator</SectionTitle>
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

            <SectionTitle>Partners & Budget</SectionTitle>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Delivery Partner</Label>
                <Input value={lockedOrg ?? formData.organisation} disabled={lockedOrg !== null} onChange={e => update("organisation", e.target.value)} placeholder="e.g., UNDP" />
              </div>
              <div className="space-y-2">
                <Label>Implementing Entity</Label>
                <Input value={formData.implementing_entity} onChange={e => update("implementing_entity", e.target.value)} placeholder="e.g., Ministry of Health" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Budget US$</Label>
                <Input type="number" value={formData.cost_usd} onChange={e => update("cost_usd", e.target.value)} placeholder="e.g., 50000" />
              </div>
            </div>

            <SectionTitle>Baseline &amp; Targets</SectionTitle>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Baseline / Proposal Year</Label><Input value={formData.baseline_proposal_year} onChange={e => update("baseline_proposal_year", e.target.value)} /></div>
            </div>
            <YearlyPerformanceEditor
              targets={{ 1: formData.target_year_1, 2: formData.target_year_2, 3: formData.target_year_3, 4: formData.target_year_4, 5: formData.target_year_5, 6: formData.target_year_6 }}
              onTargetChange={(y, v) => update(`target_year_${y}`, v)}
              value={yearly}
              onChange={setYearly}
            />


            <SectionTitle>Notes & Links</SectionTitle>
            <div className="space-y-2">
              <Label>Comments</Label>
              <Textarea value={formData.comments} onChange={e => update("comments", e.target.value)} placeholder="Add any comments or notes" rows={2} />
            </div>

            <DataLinksEditor value={formData.data_links} onChange={v => update("data_links", v)} />

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
