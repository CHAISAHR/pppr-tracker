import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { EditIndicatorDialog } from "./EditIndicatorDialog";

interface Indicator {
  id: string;
  name: string;
  description: string | null;
  unit: string;
  created_at: string;
}

interface IndicatorsTabProps {
  onUpdate?: () => void;
}

export function IndicatorsTab({ onUpdate }: IndicatorsTabProps) {
  const { user } = useAuth();
  const [indicators, setIndicators] = useState<Indicator[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingIndicator, setEditingIndicator] = useState<Indicator | null>(null);

  const fetchIndicators = async () => {
    try {
      const { data, error } = await supabase
        .from("indicators")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setIndicators(data || []);
    } catch (error) {
      console.error("Error fetching indicators:", error);
      toast.error("Failed to load indicators");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIndicators();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this indicator?")) return;

    try {
      const { error } = await supabase
        .from("indicators")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast.success("Indicator deleted successfully");
      fetchIndicators();
      onUpdate?.();
    } catch (error) {
      console.error("Error deleting indicator:", error);
      toast.error("Failed to delete indicator");
    }
  };

  const handleEditSuccess = () => {
    setEditingIndicator(null);
    fetchIndicators();
    onUpdate?.();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (indicators.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No indicators defined yet. {user && "Click 'Add Indicator' to create one."}
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Unit</TableHead>
              <TableHead>Created</TableHead>
              {user && <TableHead className="text-right">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {indicators.map((indicator) => (
              <TableRow key={indicator.id}>
                <TableCell className="font-medium">{indicator.name}</TableCell>
                <TableCell>{indicator.description || "-"}</TableCell>
                <TableCell>{indicator.unit}</TableCell>
                <TableCell>
                  {new Date(indicator.created_at).toLocaleDateString()}
                </TableCell>
                {user && (
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingIndicator(indicator)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(indicator.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {editingIndicator && (
        <EditIndicatorDialog
          indicator={editingIndicator}
          open={!!editingIndicator}
          onOpenChange={(open) => !open && setEditingIndicator(null)}
          onSuccess={handleEditSuccess}
        />
      )}
    </>
  );
}
