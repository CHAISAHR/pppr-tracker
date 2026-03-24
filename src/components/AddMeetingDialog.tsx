import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { toast } from "sonner";
import type { Meeting } from "./MeetingDetailsDialog";
import { Plus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface AddMeetingDialogProps {
  onAdd: (meeting: Meeting) => void;
}

interface MeetingForm {
  activityId: string;
  subActivityId: string;
  quarter: string;
  meetingDate: string;
  focusArea: string;
  implementingEntities: string;
  deliveryPartners: string;
  keyObjectives: string;
  format: Meeting["format"];
  links: string;
  organiserName: string;
  organiserEmail: string;
  organiserPhone: string;
  preSurveyLink: string;
  postSurveyLink: string;
  preSurveyQrCode: string;
  postSurveyQrCode: string;
}

const emptyForm: MeetingForm = {
  activityId: "",
  subActivityId: "",
  quarter: "",
  meetingDate: "",
  focusArea: "",
  implementingEntities: "",
  deliveryPartners: "",
  keyObjectives: "",
  format: "Virtual",
  links: "",
  organiserName: "",
  organiserEmail: "",
  organiserPhone: "",
  preSurveyLink: "",
  postSurveyLink: "",
  preSurveyQrCode: "",
  postSurveyQrCode: "",
};
export const AddMeetingDialog = ({ onAdd }: AddMeetingDialogProps) => {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ ...emptyForm });
  const { isAdmin } = useAuth();

  const handleAdd = () => {
    if (!form.quarter || !form.meetingDate || !form.focusArea) {
      toast.error("Please fill in all required fields");
      return;
    }

    const meeting: Meeting = {
      id: crypto.randomUUID(),
      activityId: form.activityId,
      subActivityId: form.subActivityId,
      quarter: form.quarter,
      meetingDate: form.meetingDate,
      focusArea: form.focusArea,
      implementingEntities: form.implementingEntities.split(';').map(e => e.trim()).filter(Boolean),
      deliveryPartners: form.deliveryPartners.split(';').map(e => e.trim()).filter(Boolean),
      keyObjectives: form.keyObjectives,
      format: form.format,
      links: form.links || undefined,
      organiserName: form.organiserName || undefined,
      organiserEmail: form.organiserEmail || undefined,
      organiserPhone: form.organiserPhone || undefined,
      preSurveyLink: form.preSurveyLink || undefined,
      postSurveyLink: form.postSurveyLink || undefined,
      preSurveyQrCode: form.preSurveyQrCode || undefined,
      postSurveyQrCode: form.postSurveyQrCode || undefined,
    };
    onAdd(meeting);
    setForm({ ...emptyForm });
    setOpen(false);
    toast.success("Meeting added successfully");
  };

  return (
    <>
      <Button onClick={() => setOpen(true)} className="gap-2">
        <Plus className="h-4 w-4" />
        Add Event
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Event</DialogTitle>
            <DialogDescription>Fill in the details to schedule a new meeting</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="add-activityId">Activity ID</Label>
                <Input id="add-activityId" placeholder="ACT-001" value={form.activityId} onChange={(e) => setForm({ ...form, activityId: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="add-subActivityId">Sub-Activity ID</Label>
                <Input id="add-subActivityId" placeholder="SUB-001" value={form.subActivityId} onChange={(e) => setForm({ ...form, subActivityId: e.target.value })} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="add-quarter">Quarter *</Label>
                <Input id="add-quarter" placeholder="Q1 2025" value={form.quarter} onChange={(e) => setForm({ ...form, quarter: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="add-meetingDate">Meeting Date *</Label>
                <Input id="add-meetingDate" type="date" value={form.meetingDate} onChange={(e) => setForm({ ...form, meetingDate: e.target.value })} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="add-focusArea">Focus Area *</Label>
              <Input id="add-focusArea" placeholder="Project Kickoff Meeting" value={form.focusArea} onChange={(e) => setForm({ ...form, focusArea: e.target.value })} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="add-format">Format *</Label>
              <Select value={form.format} onValueChange={(value: string) => setForm({ ...form, format: value as Meeting["format"] })}>
                <SelectTrigger id="add-format"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Virtual">Virtual</SelectItem>
                  <SelectItem value="Hybrid">Hybrid</SelectItem>
                  <SelectItem value="In-Person">In-Person</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="add-keyObjectives">Key Objectives</Label>
              <Textarea id="add-keyObjectives" placeholder="Enter the key objectives for this meeting" value={form.keyObjectives} onChange={(e) => setForm({ ...form, keyObjectives: e.target.value })} rows={3} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="add-links">Links</Label>
              <Textarea id="add-links" placeholder="Paste survey URLs here, one per line" value={form.links} onChange={(e) => setForm({ ...form, links: e.target.value })} rows={3} />
              <p className="text-xs text-muted-foreground">Enter one URL per line for survey or related links</p>
            </div>

            <div className="border rounded-md p-4 space-y-3">
              <p className="text-sm font-medium">Organiser Contact Details</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="add-organiserName">Name</Label>
                  <Input id="add-organiserName" placeholder="John Doe" value={form.organiserName} onChange={(e) => setForm({ ...form, organiserName: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="add-organiserEmail">Email</Label>
                  <Input id="add-organiserEmail" type="email" placeholder="john@example.com" value={form.organiserEmail} onChange={(e) => setForm({ ...form, organiserEmail: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="add-organiserPhone">Phone</Label>
                  <Input id="add-organiserPhone" placeholder="+1 234 567 890" value={form.organiserPhone} onChange={(e) => setForm({ ...form, organiserPhone: e.target.value })} />
                </div>
              </div>
            </div>

            {isAdmin() && (
              <div className="border rounded-md p-4 space-y-3">
                <p className="text-sm font-medium">Survey Links & QR Codes</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label htmlFor="add-preSurvey">Pre-Survey Link</Label>
                      <Input id="add-preSurvey" type="url" placeholder="https://..." value={form.preSurveyLink} onChange={(e) => setForm({ ...form, preSurveyLink: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="add-preQr">Pre-Survey QR Code (optional)</Label>
                      <Input id="add-preQr" type="file" accept="image/*" onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => setForm({ ...form, preSurveyQrCode: reader.result as string });
                          reader.readAsDataURL(file);
                        }
                      }} />
                      <p className="text-xs text-muted-foreground">If not provided, a QR code will be auto-generated from the link</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label htmlFor="add-postSurvey">Post-Survey Link</Label>
                      <Input id="add-postSurvey" type="url" placeholder="https://..." value={form.postSurveyLink} onChange={(e) => setForm({ ...form, postSurveyLink: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="add-postQr">Post-Survey QR Code (optional)</Label>
                      <Input id="add-postQr" type="file" accept="image/*" onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => setForm({ ...form, postSurveyQrCode: reader.result as string });
                          reader.readAsDataURL(file);
                        }
                      }} />
                      <p className="text-xs text-muted-foreground">If not provided, a QR code will be auto-generated from the link</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="add-implementingEntities">Implementing Entities (separate with ;)</Label>
              <Input id="add-implementingEntities" placeholder="Entity 1; Entity 2" value={form.implementingEntities} onChange={(e) => setForm({ ...form, implementingEntities: e.target.value })} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="add-deliveryPartners">Delivery Partners (separate with ;)</Label>
              <Input id="add-deliveryPartners" placeholder="Partner 1; Partner 2" value={form.deliveryPartners} onChange={(e) => setForm({ ...form, deliveryPartners: e.target.value })} />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleAdd}>Add Event</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
