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
import { Building2, Plus, Edit2, Trash2, Upload, X } from "lucide-react";
import { getLogo, setLogo, removeLogo, fileToDataUrl, loadLogos } from "@/lib/orgLogos";

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
  const [logoPreview, setLogoPreview] = useState<string | undefined>(undefined);
  const [logoTick, setLogoTick] = useState(0);

  const handleLogoChange = async (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast({ title: "Invalid file", description: "Please choose an image.", variant: "destructive" });
      return;
    }
    if (file.size > 1024 * 1024) {
      toast({ title: "File too large", description: "Logo must be under 1 MB.", variant: "destructive" });
      return;
    }
    const dataUrl = await fileToDataUrl(file);
    setLogoPreview(dataUrl);
  };

  const persistLogo = async (name: string) => {
    if (logoPreview === undefined) return;
    try {
      if (logoPreview === "") await removeLogo(name);
      else await setLogo(name, logoPreview);
      setLogoTick((t) => t + 1);
    } catch (e: any) {
      toast({ title: "Logo not saved", description: e?.message || "Sign in required to upload logos.", variant: "destructive" });
    }
  };

  useEffect(() => {
    loadOrganisations();
    loadLogos();
    const onChange = () => setLogoTick((t) => t + 1);
    window.addEventListener("org-logos-changed", onChange);
    return () => window.removeEventListener("org-logos-changed", onChange);
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
      await persistLogo(formData.name);
      setOrganisations([...organisations, newOrg]);
      setAddOpen(false);
      setFormData({ name: "", description: "" });
      setLogoPreview(undefined);
      toast({ title: "Success", description: "Organisation created successfully" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to create organisation", variant: "destructive" });
    }
  };

  const handleUpdate = async () => {
    if (!editOrg?.id) return;
    try {
      await api.updateOrganisation(editOrg.id, formData);
      // If the name changed, move the logo across
      if (editOrg.name !== formData.name) {
        const existing = getLogo(editOrg.name);
        if (existing) {
          removeLogo(editOrg.name);
          if (logoPreview === undefined) setLogo(formData.name, existing);
        }
      }
      persistLogo(formData.name);
      setOrganisations(organisations.map(o => o.id === editOrg.id ? { ...o, ...formData } : o));
      setEditOrg(null);
      setFormData({ name: "", description: "" });
      setLogoPreview(undefined);
      toast({ title: "Success", description: "Organisation updated successfully" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to update organisation", variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const org = organisations.find(o => o.id === id);
      await api.deleteOrganisation(id);
      if (org?.name) removeLogo(org.name);
      setOrganisations(organisations.filter(o => o.id !== id));
      setLogoTick(t => t + 1);
      toast({ title: "Success", description: "Organisation deleted successfully" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete organisation", variant: "destructive" });
    }
  };

  const openEdit = (org: Organisation) => {
    setEditOrg(org);
    setFormData({ name: org.name, description: org.description || "" });
    setLogoPreview(undefined);
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
        <Button className="gap-2" onClick={() => { setFormData({ name: "", description: "" }); setLogoPreview(undefined); setAddOpen(true); }}>
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
                  <TableHead className="w-16">Logo</TableHead>
                  <TableHead>Organisation Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Attendees</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {organisations.map((org, index) => {
                  // logoTick forces re-render when logos change
                  void logoTick;
                  const logo = getLogo(org.name);
                  return (
                  <TableRow key={org.id || index}>
                    <TableCell>
                      {logo ? (
                        <img src={logo} alt={org.name} className="h-10 w-10 rounded-md object-contain bg-muted border border-border" />
                      ) : (
                        <div className="h-10 w-10 rounded-md bg-muted border border-border flex items-center justify-center text-[10px] text-muted-foreground">
                          —
                        </div>
                      )}
                    </TableCell>
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
                  );
                })}
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
            <LogoField
              currentName={formData.name}
              preview={logoPreview}
              onFile={handleLogoChange}
              onClear={() => setLogoPreview("")}
            />
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
            <LogoField
              currentName={formData.name}
              preview={logoPreview}
              onFile={handleLogoChange}
              onClear={() => setLogoPreview("")}
            />
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

function LogoField({
  currentName,
  preview,
  onFile,
  onClear,
}: {
  currentName: string;
  preview: string | undefined;
  onFile: (file: File | undefined) => void;
  onClear: () => void;
}) {
  // Show: staged preview > saved logo > placeholder
  const saved = currentName ? getLogo(currentName) : undefined;
  const shown = preview !== undefined ? (preview || undefined) : saved;
  return (
    <div className="space-y-2">
      <Label>Logo</Label>
      <div className="flex items-center gap-3">
        <div className="h-14 w-14 rounded-md border border-border bg-muted flex items-center justify-center overflow-hidden">
          {shown ? (
            <img src={shown} alt="Logo preview" className="h-full w-full object-contain" />
          ) : (
            <Building2 className="h-5 w-5 text-muted-foreground" />
          )}
        </div>
        <div className="flex items-center gap-2">
          <label className="inline-flex">
            <input
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(e) => onFile(e.target.files?.[0])}
            />
            <span className="inline-flex items-center gap-2 h-9 px-3 rounded-md border border-input bg-background text-sm hover:bg-accent cursor-pointer">
              <Upload className="h-4 w-4" /> Upload
            </span>
          </label>
          {shown && (
            <Button type="button" variant="ghost" size="sm" onClick={onClear} className="gap-1">
              <X className="h-4 w-4" /> Remove
            </Button>
          )}
        </div>
      </div>
      <p className="text-xs text-muted-foreground">PNG, JPG or SVG. Max 1 MB.</p>
    </div>
  );
}
