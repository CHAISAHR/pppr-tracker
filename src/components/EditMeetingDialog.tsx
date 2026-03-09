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

const emptyMeeting: Meeting = {
  id: "",
  quarter: "",
  meetingDate: "",
  focusArea: "",
  implementingEntities: [],
  deliveryPartners: [],
  keyObjectives: "",
  format: "Virtual",
  organiserName: "",
  organiserEmail: "",
  organiserPhone: "",
  preSurveyLink: "",
  postSurveyLink: "",
};

export const EditMeetingDialog = ({ meeting, open, onOpenChange, onSave }: EditMeetingDialogProps) => {
  const [formData, setFormData] = useState<Meeting>({ ...emptyMeeting });

  useEffect(() => {
    if (meeting) {
      setFormData({ ...emptyMeeting, ...meeting });
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

  const handleArrayChange = (field: "implementingEntities" | "deliveryPartners", value: string) => {
    const items = value.split(';').map(e => e.trim()).filter(e => e);
    setFormData({ ...formData, [field]: items });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Meeting</DialogTitle>
          <DialogDescription>Update the meeting details below</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-quarter">Quarter *</Label>
              <Input id="edit-quarter" placeholder="Q1 2025" value={formData.quarter} onChange={(e) => setFormData({ ...formData, quarter: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-meetingDate">Meeting Date *</Label>
              <Input id="edit-meetingDate" type="date" value={formData.meetingDate} onChange={(e) => setFormData({ ...formData, meetingDate: e.target.value })} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-focusArea">Focus Area *</Label>
            <Input id="edit-focusArea" placeholder="Project Kickoff Meeting" value={formData.focusArea} onChange={(e) => setFormData({ ...formData, focusArea: e.target.value })} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-format">Format *</Label>
            <Select value={formData.format} onValueChange={(value: "Virtual" | "Hybrid" | "In-Person") => setFormData({ ...formData, format: value })}>
              <SelectTrigger id="edit-format"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Virtual">Virtual</SelectItem>
                <SelectItem value="Hybrid">Hybrid</SelectItem>
                <SelectItem value="In-Person">In-Person</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-keyObjectives">Key Objectives</Label>
            <Textarea id="edit-keyObjectives" placeholder="Enter the key objectives for this meeting" value={formData.keyObjectives} onChange={(e) => setFormData({ ...formData, keyObjectives: e.target.value })} rows={3} />
          </div>

          <div className="border rounded-md p-4 space-y-3">
            <p className="text-sm font-medium">Organiser Contact Details</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label htmlFor="edit-organiserName">Name</Label>
                <Input id="edit-organiserName" placeholder="John Doe" value={formData.organiserName || ""} onChange={(e) => setFormData({ ...formData, organiserName: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-organiserEmail">Email</Label>
                <Input id="edit-organiserEmail" type="email" placeholder="john@example.com" value={formData.organiserEmail || ""} onChange={(e) => setFormData({ ...formData, organiserEmail: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-organiserPhone">Phone</Label>
                <Input id="edit-organiserPhone" placeholder="+1 234 567 890" value={formData.organiserPhone || ""} onChange={(e) => setFormData({ ...formData, organiserPhone: e.target.value })} />
              </div>
            </div>
          </div>

          <div className="border rounded-md p-4 space-y-3">
            <p className="text-sm font-medium">Survey Links</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="edit-preSurvey">Pre-Survey Link</Label>
                <Input id="edit-preSurvey" type="url" placeholder="https://..." value={formData.preSurveyLink || ""} onChange={(e) => setFormData({ ...formData, preSurveyLink: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-postSurvey">Post-Survey Link</Label>
                <Input id="edit-postSurvey" type="url" placeholder="https://..." value={formData.postSurveyLink || ""} onChange={(e) => setFormData({ ...formData, postSurveyLink: e.target.value })} />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-implementingEntities">Implementing Entities (separate with ;)</Label>
            <Input id="edit-implementingEntities" placeholder="Entity 1; Entity 2" value={formData.implementingEntities.join('; ')} onChange={(e) => handleArrayChange("implementingEntities", e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-deliveryPartners">Delivery Partners (separate with ;)</Label>
            <Input id="edit-deliveryPartners" placeholder="Partner 1; Partner 2" value={formData.deliveryPartners.join('; ')} onChange={(e) => handleArrayChange("deliveryPartners", e.target.value)} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
