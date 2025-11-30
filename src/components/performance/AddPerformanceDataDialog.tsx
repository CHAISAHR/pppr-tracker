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
import { useAuth } from "@/contexts/AuthContext";

interface Indicator {
  id: string;
  name: string;
  unit: string;
}

interface SubActivity {
  id: string;
  name: string;
  project_id: string;
}

interface AddPerformanceDataDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function AddPerformanceDataDialog({ open, onOpenChange, onSuccess }: AddPerformanceDataDialogProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [indicators, setIndicators] = useState<Indicator[]>([]);
  const [subActivities, setSubActivities] = useState<SubActivity[]>([]);
  const [type, setType] = useState<"project" | "sub_activity">("project");
  const [formData, setFormData] = useState({
    project_id: "",
    sub_activity_id: "",
    indicator_id: "",
    target_value: "",
    actual_value: "",
    reporting_period: "",
    notes: "",
  });

  useEffect(() => {
    if (open) {
      fetchIndicators();
      fetchSubActivities();
    }
  }, [open]);

  const fetchIndicators = async () => {
    const { data } = await supabase
      .from("indicators")
      .select("id, name, unit")
      .order("name");
    
    if (data) setIndicators(data);
  };

  const fetchSubActivities = async () => {
    const { data } = await supabase
      .from("sub_activities")
      .select("id, name, project_id")
      .order("name");
    
    if (data) setSubActivities(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const dataToInsert = {
        project_id: type === "project" ? formData.project_id : null,
        sub_activity_id: type === "sub_activity" ? formData.sub_activity_id : null,
        indicator_id: formData.indicator_id,
        target_value: parseFloat(formData.target_value),
        actual_value: parseFloat(formData.actual_value),
        reporting_period: formData.reporting_period,
        notes: formData.notes || null,
        recorded_by: user?.id,
      };

      const { error } = await supabase
        .from("indicator_values")
        .insert([dataToInsert]);

      if (error) throw error;

      toast.success("Performance data recorded successfully");
      setFormData({
        project_id: "",
        sub_activity_id: "",
        indicator_id: "",
        target_value: "",
        actual_value: "",
        reporting_period: "",
        notes: "",
      });
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error("Error recording performance data:", error);
      toast.error("Failed to record performance data");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add Performance Data</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Record For *</Label>
            <Select value={type} onValueChange={(value: "project" | "sub_activity") => setType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="project">Main Activity/Project</SelectItem>
                <SelectItem value="sub_activity">Sub-Activity</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {type === "project" ? (
            <div className="space-y-2">
              <Label htmlFor="project_id">Activity/Project ID *</Label>
              <Input
                id="project_id"
                value={formData.project_id}
                onChange={(e) => setFormData({ ...formData, project_id: e.target.value })}
                placeholder="Enter activity/project ID"
                required
              />
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="sub_activity_id">Sub-Activity *</Label>
              <Select
                value={formData.sub_activity_id}
                onValueChange={(value) => setFormData({ ...formData, sub_activity_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a sub-activity" />
                </SelectTrigger>
                <SelectContent>
                  {subActivities.map((sa) => (
                    <SelectItem key={sa.id} value={sa.id}>
                      {sa.name} ({sa.project_id})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="indicator_id">Indicator *</Label>
            <Select
              value={formData.indicator_id}
              onValueChange={(value) => setFormData({ ...formData, indicator_id: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select an indicator" />
              </SelectTrigger>
              <SelectContent>
                {indicators.map((indicator) => (
                  <SelectItem key={indicator.id} value={indicator.id}>
                    {indicator.name} ({indicator.unit})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="target_value">Target Value *</Label>
              <Input
                id="target_value"
                type="number"
                step="any"
                value={formData.target_value}
                onChange={(e) => setFormData({ ...formData, target_value: e.target.value })}
                placeholder="0"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="actual_value">Actual Value *</Label>
              <Input
                id="actual_value"
                type="number"
                step="any"
                value={formData.actual_value}
                onChange={(e) => setFormData({ ...formData, actual_value: e.target.value })}
                placeholder="0"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reporting_period">Reporting Period</Label>
            <Input
              id="reporting_period"
              value={formData.reporting_period}
              onChange={(e) => setFormData({ ...formData, reporting_period: e.target.value })}
              placeholder="e.g., Q1 2024, January 2024"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Additional context or observations"
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Record Data
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
