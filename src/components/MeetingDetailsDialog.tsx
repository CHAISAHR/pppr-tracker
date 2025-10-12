import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, Target, Building2, Users } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export interface Meeting {
  id: string;
  quarter: string;
  meetingDate: string;
  focusArea: string;
  implementingEntities: string[];
  deliveryPartners: string[];
  keyObjectives: string;
  format: "Virtual" | "Hybrid" | "In-Person";
}

interface MeetingDetailsDialogProps {
  meeting: Meeting | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const MeetingDetailsDialog = ({ meeting, open, onOpenChange }: MeetingDetailsDialogProps) => {
  if (!meeting) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <DialogTitle className="text-2xl">{meeting.focusArea}</DialogTitle>
              <DialogDescription className="mt-2">
                {meeting.quarter}
              </DialogDescription>
            </div>
            <Badge variant={meeting.format === "Virtual" ? "secondary" : meeting.format === "Hybrid" ? "outline" : "default"}>
              {meeting.format}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">Meeting Date:</span>
            <span>
              {new Date(meeting.meetingDate).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
          </div>

          <Separator />

          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <Target className="h-4 w-4 mt-1 text-muted-foreground" />
              <div className="flex-1">
                <p className="font-medium text-sm mb-1">Key Objectives</p>
                <p className="text-sm text-muted-foreground">{meeting.keyObjectives}</p>
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <Building2 className="h-4 w-4 mt-1 text-muted-foreground" />
              <div className="flex-1">
                <p className="font-medium text-sm mb-2">Implementing Entities</p>
                <div className="flex flex-wrap gap-2">
                  {meeting.implementingEntities.map((entity, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {entity}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <Users className="h-4 w-4 mt-1 text-muted-foreground" />
              <div className="flex-1">
                <p className="font-medium text-sm mb-2">Delivery Partners</p>
                <div className="flex flex-wrap gap-2">
                  {meeting.deliveryPartners.map((partner, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs">
                      {partner}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
