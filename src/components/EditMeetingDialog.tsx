import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import type { Meeting } from "./MeetingDetailsDialog";

interface EditMeetingDialogProps {
  meeting: Meeting | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (meeting: Meeting) => void;
}

export const EditMeetingDialog = ({ meeting, open, onOpenChange, onSave }: EditMeetingDialogProps) => {
  const [formData, setFormData] = useState<Meeting>({
    id: "",
    quarter: "",
    meetingDate: "",
    focusArea: "",
    implementingEntities: [],
    deliveryPartners: [],
    keyObjectives: "",
    format: "Virtual",
  });

  useEffect(() => {
    if (meeting) {
      setFormData(meeting);
    }
  }, [meeting]);

  const handleSave = () => {
    if (!formData.quarter || !formData.meetingDate || !formData.focusArea) {
      toast.error("Please fill in all required fields");
      return;
    }

    onSave(formData);
    onOpenChange(false);
    toast.success("Meeting updated successfully");
  };

  const handleImplementingEntitiesChange = (value: string) => {
    const entities = value.split(';').map(e => e.trim()).filter(e => e);
    setFormData({ ...formData, implementingEntities: entities });
  };

  const handleDeliveryPartnersChange = (value: string) => {
    const partners = value.split(';').map(p => p.trim()).filter(p => p);
    setFormData({ ...formData, deliveryPartners: partners });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Meeting</DialogTitle>
          <DialogDescription>
            Update the meeting details below
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quarter">Quarter *</Label>
              <Input
                id="quarter"
                placeholder="Q1 2025"
                value={formData.quarter}
                onChange={(e) => setFormData({ ...formData, quarter: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="meetingDate">Meeting Date *</Label>
              <Input
                id="meetingDate"
                type="date"
                value={formData.meetingDate}
                onChange={(e) => setFormData({ ...formData, meetingDate: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="focusArea">Focus Area *</Label>
            <Input
              id="focusArea"
              placeholder="Project Kickoff Meeting"
              value={formData.focusArea}
              onChange={(e) => setFormData({ ...formData, focusArea: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="format">Format *</Label>
            <Select
              value={formData.format}
              onValueChange={(value: "Virtual" | "Hybrid" | "In-Person") => 
                setFormData({ ...formData, format: value })
              }
            >
              <SelectTrigger id="format">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Virtual">Virtual</SelectItem>
                <SelectItem value="Hybrid">Hybrid</SelectItem>
                <SelectItem value="In-Person">In-Person</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="implementingEntities">Implementing Entities (separate with ;)</Label>
            <Input
              id="implementingEntities"
              placeholder="Entity 1; Entity 2; Entity 3"
              value={formData.implementingEntities.join('; ')}
              onChange={(e) => handleImplementingEntitiesChange(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="deliveryPartners">Delivery Partners (separate with ;)</Label>
            <Input
              id="deliveryPartners"
              placeholder="Partner 1; Partner 2; Partner 3"
              value={formData.deliveryPartners.join('; ')}
              onChange={(e) => handleDeliveryPartnersChange(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="keyObjectives">Key Objectives</Label>
            <Textarea
              id="keyObjectives"
              placeholder="Enter the key objectives for this meeting"
              value={formData.keyObjectives}
              onChange={(e) => setFormData({ ...formData, keyObjectives: e.target.value })}
              rows={4}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
