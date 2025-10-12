import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Project, Status } from "@/components/ProjectTable";

interface AddProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (project: Omit<Project, "id">) => void;
}

export const AddProjectDialog = ({ open, onOpenChange, onAdd }: AddProjectDialogProps) => {
  const [formData, setFormData] = useState({
    activityId: "",
    activityDescription: "",
    subActivityId: "",
    subActivityDescription: "",
    implementingEntity: "",
    deliveryPartner: "",
    status: "Pending" as Status,
    startDate: "",
    endDate: "",
    comments: "",
  });

  const handleSubmit = () => {
    // Validate required fields
    if (!formData.activityId || !formData.activityDescription) {
      toast.error("Please fill in required fields");
      return;
    }

    onAdd(formData);
    toast.success("Project added successfully");
    onOpenChange(false);
    
    // Reset form
    setFormData({
      activityId: "",
      activityDescription: "",
      subActivityId: "",
      subActivityDescription: "",
      implementingEntity: "",
      deliveryPartner: "",
      status: "Pending" as Status,
      startDate: "",
      endDate: "",
      comments: "",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Project Activity</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="activityId">Activity ID *</Label>
              <Input
                id="activityId"
                value={formData.activityId}
                onChange={(e) => setFormData({ ...formData, activityId: e.target.value })}
                placeholder="ACT-001"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subActivityId">Sub-Activity ID</Label>
              <Input
                id="subActivityId"
                value={formData.subActivityId}
                onChange={(e) => setFormData({ ...formData, subActivityId: e.target.value })}
                placeholder="SUB-001"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="activityDescription">Activity Description *</Label>
            <Input
              id="activityDescription"
              value={formData.activityDescription}
              onChange={(e) => setFormData({ ...formData, activityDescription: e.target.value })}
              placeholder="Enter activity description"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="subActivityDescription">Sub-Activity Description</Label>
            <Input
              id="subActivityDescription"
              value={formData.subActivityDescription}
              onChange={(e) => setFormData({ ...formData, subActivityDescription: e.target.value })}
              placeholder="Enter sub-activity description"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="implementingEntity">Implementing Entity</Label>
              <Input
                id="implementingEntity"
                value={formData.implementingEntity}
                onChange={(e) => setFormData({ ...formData, implementingEntity: e.target.value })}
                placeholder="Organization name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="deliveryPartner">Delivery Partner</Label>
              <Input
                id="deliveryPartner"
                value={formData.deliveryPartner}
                onChange={(e) => setFormData({ ...formData, deliveryPartner: e.target.value })}
                placeholder="Partner name"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value as Status })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="comments">Comments</Label>
            <Textarea
              id="comments"
              value={formData.comments}
              onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
              placeholder="Add any comments or notes"
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Add Project</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
