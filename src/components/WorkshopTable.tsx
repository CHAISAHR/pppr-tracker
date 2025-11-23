import { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/services/api";

export function WorkshopTable() {
  const [workshops, setWorkshops] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWorkshops();
  }, []);

  const loadWorkshops = async () => {
    try {
      const data = await api.getWorkshops();
      setWorkshops(data);
    } catch (error) {
      toast.error("Failed to load workshops");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this workshop?")) return;

    try {
      await api.deleteWorkshop(id);
      toast.success("Workshop deleted successfully");
      loadWorkshops();
    } catch (error) {
      toast.error("Failed to delete workshop");
    }
  };

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">Loading workshops...</div>;
  }

  if (workshops.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No workshops created yet. Click "Add Workshop" to create one.
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Workshop Name</TableHead>
            <TableHead>Activity</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Venue</TableHead>
            <TableHead>Days</TableHead>
            <TableHead>Registrations</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {workshops.map((workshop) => (
            <TableRow key={workshop.id}>
              <TableCell className="font-medium">{workshop.name}</TableCell>
              <TableCell>{workshop.activity}</TableCell>
              <TableCell>{workshop.date}</TableCell>
              <TableCell>{workshop.venue}</TableCell>
              <TableCell>
                <Badge variant="secondary">{workshop.numberOfDays} days</Badge>
              </TableCell>
              <TableCell>
                <Badge variant="outline">{workshop.registrations || 0}</Badge>
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(workshop.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
