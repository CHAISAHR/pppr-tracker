import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api, User } from "@/services/api";
import { useToast } from "@/hooks/use-toast";

interface EditUserDialogProps {
  user: User;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (updates: Partial<User>) => void;
}

export const EditUserDialog = ({
  user,
  open,
  onOpenChange,
  onSave,
}: EditUserDialogProps) => {
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    role: user.role,
    organization: user.organization || '',
  });
  const [organisations, setOrganisations] = useState<Array<{ name: string }>>([]);
  const { toast } = useToast();

  useEffect(() => {
    if (!open) return;
    api.getOrganisations()
      .then((data) => setOrganisations(data || []))
      .catch(() => setOrganisations([]));
  }, [open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email) {
      toast({
        title: "Error",
        description: "Name and email are required",
        variant: "destructive",
      });
      return;
    }

    if (!formData.organization) {
      toast({
        title: "Organisation required",
        description: "Please select an organisation for this user.",
        variant: "destructive",
      });
      return;
    }

    onSave(formData);
    toast({
      title: "Success",
      description: "User updated successfully",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
          <DialogDescription>
            Update user details and permissions
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select
              value={formData.role}
              onValueChange={(value: 'admin' | 'user') =>
                setFormData({ ...formData, role: value })
              }
            >
              <SelectTrigger id="role">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="user">User</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="organization">Organisation</Label>
            <Select
              value={formData.organization}
              onValueChange={(value) =>
                setFormData({ ...formData, organization: value })
              }
            >
              <SelectTrigger id="organization">
                <SelectValue placeholder={organisations.length ? "Select an organisation" : "Loading..."} />
              </SelectTrigger>
              <SelectContent>
                {formData.organization &&
                  !organisations.some((o) => o.name === formData.organization) && (
                    <SelectItem value={formData.organization}>
                      {formData.organization} (current)
                    </SelectItem>
                  )}
                {organisations.map((org) => (
                  <SelectItem key={org.name} value={org.name}>
                    {org.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Save Changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
