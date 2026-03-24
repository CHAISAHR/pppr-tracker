import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Building2, Plus, Edit2, Trash2 } from "lucide-react";

interface Organisation {
  id: string | null;
  name: string;
  description?: string | null;
  attendee_count?: number;
  count?: number;
}

const Organisations = () => {
  const { isAdmin } = useAuth();
  const { toast } = useToast();
  const [organisations, setOrganisations] = useState<Organisation[]>([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [editOrg, setEditOrg] = useState<Organisation | null>(null);
  const [formData, setFormData] = useState({ name: "", description: "" });

  useEffect(() => {
    loadOrganisations();
  }, []);

  const loadOrganisations = async () => {
    try {
      setLoading(true);
      const data = await api.getOrganisations();
      setOrganisations(data);
    } catch (error) {
      console.error('Failed to load organisations:', error);
      toast({
        title: "Error",
        description: "Failed to load organisations. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!formData.name) {
      toast({ title: "Error", description: "Name is required", variant: "destructive" });
      return;
    }
    try {
      const newOrg = await api.createOrganisation(formData);
      setOrganisations([...organisations, newOrg]);
      setAddOpen(false);
      setFormData({ name: "", description: "" });
      toast({ title: "Success", description: "Organisation created successfully" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to create organisation", variant: "destructive" });
    }
  };

  const handleUpdate = async () => {
    if (!editOrg?.id) return;
    try {
      await api.updateOrganisation(editOrg.id, formData);
      setOrganisations(organisations.map(o => o.id === editOrg.id ? { ...o, ...formData } : o));
      setEditOrg(null);
      setFormData({ name: "", description: "" });
      toast({ title: "Success", description: "Organisation updated successfully" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to update organisation", variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.deleteOrganisation(id);
      setOrganisations(organisations.filter(o => o.id !== id));
      toast({ title: "Success", description: "Organisation deleted successfully" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete organisation", variant: "destructive" });
    }
  };

  const openEdit = (org: Organisation) => {
    setEditOrg(org);
    setFormData({ name: org.name, description: org.description || "" });
  };

  if (!isAdmin()) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>You don't have permission to view this page.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Building2 className="h-8 w-8" />
            Organisations
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage organisations and view attendee data
          </p>
        </div>
        <Button className="gap-2" onClick={() => { setFormData({ name: "", description: "" }); setAddOpen(true); }}>
          <Plus className="h-4 w-4" />
          Add Organisation
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Organisations</CardTitle>
          <CardDescription>
            {organisations.length} organisation(s) found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading organisations...</div>
          ) : organisations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No organisations found. Click "Add Organisation" to create one.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Organisation Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Attendees</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {organisations.map((org, index) => (
                  <TableRow key={org.id || index}>
                    <TableCell className="font-medium">{org.name}</TableCell>
                    <TableCell className="text-muted-foreground">{org.description || '-'}</TableCell>
                    <TableCell className="text-right">{org.attendee_count ?? org.count ?? 0}</TableCell>
                    <TableCell>
                      {org.id && (
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEdit(org)}
                            className="hover:bg-primary/10 hover:text-primary transition-colors"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              if (confirm(`Are you sure you want to delete ${org.name}?`)) {
                                handleDelete(org.id!);
                              }
                            }}
                            className="hover:bg-destructive/10 hover:text-destructive transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Add Organisation Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Organisation</DialogTitle>
            <DialogDescription>Create a new organisation</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="org-name">Name</Label>
              <Input
                id="org-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Organisation name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="org-desc">Description</Label>
              <Input
                id="org-desc"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Optional description"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Organisation Dialog */}
      <Dialog open={!!editOrg} onOpenChange={(open) => !open && setEditOrg(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Organisation</DialogTitle>
            <DialogDescription>Update organisation details</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-org-name">Name</Label>
              <Input
                id="edit-org-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-org-desc">Description</Label>
              <Input
                id="edit-org-desc"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOrg(null)}>Cancel</Button>
            <Button onClick={handleUpdate}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Organisations;
