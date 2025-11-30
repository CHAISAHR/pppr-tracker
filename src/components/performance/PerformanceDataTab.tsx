import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { AddPerformanceDataDialog } from "./AddPerformanceDataDialog";
import { Badge } from "@/components/ui/badge";

interface PerformanceData {
  id: string;
  project_id: string | null;
  sub_activity_id: string | null;
  indicator_id: string;
  target_value: number | null;
  actual_value: number | null;
  reporting_period: string | null;
  notes: string | null;
  created_at: string;
  indicators: { name: string; unit: string };
  sub_activities?: { name: string } | null;
}

interface PerformanceDataTabProps {
  onUpdate?: () => void;
}

export function PerformanceDataTab({ onUpdate }: PerformanceDataTabProps) {
  const { user } = useAuth();
  const [performanceData, setPerformanceData] = useState<PerformanceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  const fetchPerformanceData = async () => {
    try {
      const { data, error } = await supabase
        .from("indicator_values")
        .select(`
          *,
          indicators (name, unit),
          sub_activities (name)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPerformanceData(data || []);
    } catch (error) {
      console.error("Error fetching performance data:", error);
      toast.error("Failed to load performance data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPerformanceData();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this performance record?")) return;

    try {
      const { error } = await supabase
        .from("indicator_values")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast.success("Performance data deleted successfully");
      fetchPerformanceData();
      onUpdate?.();
    } catch (error) {
      console.error("Error deleting performance data:", error);
      toast.error("Failed to delete performance data");
    }
  };

  const handleSuccess = () => {
    setAddDialogOpen(false);
    fetchPerformanceData();
    onUpdate?.();
  };

  const getAchievementBadge = (target: number | null, actual: number | null) => {
    if (!target || !actual) return null;
    const percentage = (actual / target) * 100;
    
    if (percentage >= 100) {
      return <Badge className="bg-green-500">Achieved</Badge>;
    } else if (percentage >= 75) {
      return <Badge className="bg-yellow-500">On Track</Badge>;
    } else {
      return <Badge variant="destructive">Behind</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <>
      <div className="flex justify-end mb-4">
        {user && (
          <Button onClick={() => setAddDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Performance Data
          </Button>
        )}
      </div>

      {performanceData.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No performance data recorded yet. {user && "Click 'Add Performance Data' to create a record."}
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Indicator</TableHead>
                <TableHead>Activity/Sub-Activity</TableHead>
                <TableHead>Target</TableHead>
                <TableHead>Actual</TableHead>
                <TableHead>Period</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Notes</TableHead>
                {user && <TableHead className="text-right">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {performanceData.map((record) => (
                <TableRow key={record.id}>
                  <TableCell className="font-medium">
                    {record.indicators.name}
                  </TableCell>
                  <TableCell>
                    {record.sub_activities?.name || (
                      <span className="font-mono text-sm">{record.project_id}</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {record.target_value?.toLocaleString()} {record.indicators.unit}
                  </TableCell>
                  <TableCell>
                    {record.actual_value?.toLocaleString()} {record.indicators.unit}
                  </TableCell>
                  <TableCell>{record.reporting_period || "-"}</TableCell>
                  <TableCell>
                    {getAchievementBadge(record.target_value, record.actual_value)}
                  </TableCell>
                  <TableCell className="max-w-xs truncate">
                    {record.notes || "-"}
                  </TableCell>
                  {user && (
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(record.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {user && (
        <AddPerformanceDataDialog
          open={addDialogOpen}
          onOpenChange={setAddDialogOpen}
          onSuccess={handleSuccess}
        />
      )}
    </>
  );
}
