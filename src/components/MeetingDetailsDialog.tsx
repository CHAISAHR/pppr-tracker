import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Calendar, Target, Building2, Users, Mail, Phone, Link as LinkIcon, UserCircle, QrCode } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { QRCodeSVG } from "qrcode.react";

export interface Meeting {
  id: string;
  activityId: string;
  subActivityId: string;
  quarter: string;
  meetingDate: string;
  focusArea: string;
  implementingEntities: string[];
  deliveryPartners: string[];
  keyObjectives: string;
  format: "Virtual" | "Hybrid" | "In-Person";
  organiserName?: string;
  organiserEmail?: string;
  organiserPhone?: string;
  preSurveyLink?: string;
  postSurveyLink?: string;
  preSurveyQrCode?: string;
  postSurveyQrCode?: string;
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
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-muted-foreground">Activity ID:</span>
              <p>{meeting.activityId || "—"}</p>
            </div>
            <div>
              <span className="font-medium text-muted-foreground">Sub-Activity ID:</span>
              <p>{meeting.subActivityId || "—"}</p>
            </div>
          </div>

          <Separator />

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

          {(meeting.organiserName || meeting.organiserEmail || meeting.organiserPhone) && (
            <>
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <UserCircle className="h-4 w-4 mt-1 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="font-medium text-sm mb-2">Organiser Contact</p>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      {meeting.organiserName && <p>{meeting.organiserName}</p>}
                      {meeting.organiserEmail && (
                        <p className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          <a href={`mailto:${meeting.organiserEmail}`} className="text-primary hover:underline">
                            {meeting.organiserEmail}
                          </a>
                        </p>
                      )}
                      {meeting.organiserPhone && (
                        <p className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {meeting.organiserPhone}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <Separator />
            </>
          )}

          {(meeting.preSurveyLink || meeting.postSurveyLink) && (
            <>
              <div className="space-y-4">
                <div className="flex items-start gap-2">
                  <LinkIcon className="h-4 w-4 mt-1 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="font-medium text-sm mb-3">Survey Links & QR Codes</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {meeting.preSurveyLink && (
                        <div className="space-y-3 p-4 border rounded-lg bg-muted/30">
                          <p className="font-medium text-sm text-foreground">Pre-Survey</p>
                          <a href={meeting.preSurveyLink} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline break-all">
                            {meeting.preSurveyLink}
                          </a>
                          <div className="flex flex-col items-center gap-2 pt-2">
                            {meeting.preSurveyQrCode ? (
                              <img src={meeting.preSurveyQrCode} alt="Pre-Survey QR Code" className="w-40 h-40 object-contain rounded border bg-white p-1" />
                            ) : (
                              <div className="bg-white p-3 rounded border">
                                <QRCodeSVG value={meeting.preSurveyLink} size={140} />
                              </div>
                            )}
                            <p className="text-xs text-muted-foreground">Scan to open pre-survey</p>
                          </div>
                        </div>
                      )}
                      {meeting.postSurveyLink && (
                        <div className="space-y-3 p-4 border rounded-lg bg-muted/30">
                          <p className="font-medium text-sm text-foreground">Post-Survey</p>
                          <a href={meeting.postSurveyLink} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline break-all">
                            {meeting.postSurveyLink}
                          </a>
                          <div className="flex flex-col items-center gap-2 pt-2">
                            {meeting.postSurveyQrCode ? (
                              <img src={meeting.postSurveyQrCode} alt="Post-Survey QR Code" className="w-40 h-40 object-contain rounded border bg-white p-1" />
                            ) : (
                              <div className="bg-white p-3 rounded border">
                                <QRCodeSVG value={meeting.postSurveyLink} size={140} />
                              </div>
                            )}
                            <p className="text-xs text-muted-foreground">Scan to open post-survey</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <Separator />
            </>
          )}

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