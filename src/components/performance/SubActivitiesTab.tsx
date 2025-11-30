import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { AddSubActivityDialog } from "./AddSubActivityDialog";

interface SubActivity {
  id: string;
  project_id: string;
  name: string;
  description: string | null;
  created_at: string;
}

interface SubActivitiesTabProps {
  onUpdate?: () => void;
}

export function SubActivitiesTab({ onUpdate }: SubActivitiesTabProps) {
  const { user } = useAuth();
  const [subActivities, setSubActivities] = useState<SubActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  const fetchSubActivities = async () => {
    try {
      const { data, error } = await supabase
        .from("sub_activities")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setSubActivities(data || []);
    } catch (error) {
      console.error("Error fetching sub-activities:", error);
      toast.error("Failed to load sub-activities");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubActivities();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this sub-activity?")) return;

    try {
      const { error } = await supabase
        .from("sub_activities")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast.success("Sub-activity deleted successfully");
      fetchSubActivities();
      onUpdate?.();
    } catch (error) {
      console.error("Error deleting sub-activity:", error);
      toast.error("Failed to delete sub-activity");
    }
  };

  const handleSuccess = () => {
    setAddDialogOpen(false);
    fetchSubActivities();
    onUpdate?.();
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
            Add Sub-Activity
          </Button>
        )}
      </div>

      {subActivities.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No sub-activities created yet. {user && "Click 'Add Sub-Activity' to create one."}
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Activity ID</TableHead>
                <TableHead>Created</TableHead>
                {user && <TableHead className="text-right">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {subActivities.map((subActivity) => (
                <TableRow key={subActivity.id}>
                  <TableCell className="font-medium">{subActivity.name}</TableCell>
                  <TableCell>{subActivity.description || "-"}</TableCell>
                  <TableCell className="font-mono text-sm">{subActivity.project_id}</TableCell>
                  <TableCell>
                    {new Date(subActivity.created_at).toLocaleDateString()}
                  </TableCell>
                  {user && (
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(subActivity.id)}
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
        <AddSubActivityDialog
          open={addDialogOpen}
          onOpenChange={setAddDialogOpen}
          onSuccess={handleSuccess}
        />
      )}
    </>
  );
}
