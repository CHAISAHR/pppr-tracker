import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Users, Building2, Edit } from "lucide-react";
import { MeetingDetailsDialog, type Meeting, formatMeetingDateRange } from "@/components/MeetingDetailsDialog";
import { EditMeetingDialog } from "@/components/EditMeetingDialog";
import { AddMeetingDialog } from "@/components/AddMeetingDialog";
import { MeetingExcelTemplate } from "@/components/MeetingExcelTemplate";
import { MeetingExcelUpload } from "@/components/MeetingExcelUpload";
import { MeetingExcelExport } from "@/components/MeetingExcelExport";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/services/api";
import { toast } from "sonner";

const Meetings = () => {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [editingMeeting, setEditingMeeting] = useState<Meeting | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const { user, isAdmin } = useAuth();

  const loadMeetings = async () => {
    try {
      const data = await api.getMeetings();
      setMeetings(data as Meeting[]);
    } catch (err) {
      console.error("Failed to load meetings", err);
      toast.error("Failed to load events from the server");
    }
  };

  useEffect(() => {
    loadMeetings();
  }, []);

  const handleMeetingClick = (meeting: Meeting) => {
    setSelectedMeeting(meeting);
    setDetailsOpen(true);
  };

  const handleEditClick = (meeting: Meeting, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingMeeting(meeting);
    setEditOpen(true);
  };

  const handleSaveMeeting = async (updatedMeeting: Meeting) => {
    try {
      const saved = await api.updateMeeting(updatedMeeting.id, updatedMeeting);
      setMeetings(meetings.map(m => m.id === updatedMeeting.id ? (saved as Meeting) : m));
      toast.success("Event updated");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update event");
    }
  };

  const handleAddMeeting = async (newMeeting: Meeting) => {
    try {
      const saved = await api.createMeeting(newMeeting);
      setMeetings(prev => [...prev, saved as Meeting]);
    } catch (err) {
      console.error(err);
      toast.error("Failed to save event");
    }
  };

  const handleUploadMeetings = async (uploadedMeetings: Meeting[]) => {
    try {
      const { inserted, errors } = await api.bulkCreateMeetings(uploadedMeetings);
      setMeetings(prev => [...prev, ...(inserted as Meeting[])]);
      if (errors.length) {
        toast.warning(`${inserted.length} added, ${errors.length} failed. First error: ${errors[0].message}`);
      } else {
        toast.success(`${inserted.length} events uploaded`);
      }
    } catch (err) {
      console.error(err);
      toast.error("Bulk upload failed");
    }
  };


  const sortKey = (m: Meeting) => m.meetingDateFrom || m.meetingDate || m.meetingDateTo || "";
  const sortedMeetings = [...meetings].sort((a, b) =>
    new Date(sortKey(a)).getTime() - new Date(sortKey(b)).getTime()
  );

  return (
    <div className="min-h-full bg-background">
      <div className="container mx-auto py-8 px-4 sm:px-6 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Calendar className="h-6 w-6 text-primary" />
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl font-bold text-foreground">Event Schedule</h1>
              <p className="text-sm text-muted-foreground mt-0.5">View and manage your scheduled events</p>
            </div>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            {user && <AddMeetingDialog onAdd={handleAddMeeting} />}
            {isAdmin() && (
              <>
                <MeetingExcelExport meetings={meetings} />
                <MeetingExcelTemplate />
                <MeetingExcelUpload onUpload={handleUploadMeetings} />
              </>
            )}
          </div>
        </div>

        {sortedMeetings.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <div className="h-14 w-14 rounded-2xl bg-muted flex items-center justify-center mb-4">
                <Calendar className="h-7 w-7 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-1">No events scheduled</h3>
              <p className="text-sm text-muted-foreground max-w-sm">Click "Add Event" to schedule your first event.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-start">
            {sortedMeetings.map((meeting) => (
              <Card
                key={meeting.id}
                className="group hover:shadow-md transition-all duration-200 cursor-pointer border-border/60 hover:border-primary/30"
                onClick={() => handleMeetingClick(meeting)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <CardTitle className="text-lg group-hover:text-primary transition-colors truncate">
                          {meeting.focusArea}
                        </CardTitle>
                        {user && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => handleEditClick(meeting, e)}
                            className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                      <CardDescription className="flex items-center gap-3 text-xs">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          {formatMeetingDateRange(meeting)}
                        </span>
                        <span className="font-medium text-foreground/60">{meeting.quarter}</span>
                      </CardDescription>
                    </div>
                    <Badge 
                      variant={meeting.format === "Virtual" ? "secondary" : meeting.format === "Hybrid" ? "outline" : "default"}
                      className="flex-shrink-0 text-xs"
                    >
                      {meeting.format}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0 space-y-2">
                  <div className="flex items-start gap-2">
                    <Building2 className="h-3.5 w-3.5 mt-0.5 text-muted-foreground flex-shrink-0" />
                    <div className="flex flex-wrap gap-1.5">
                      {meeting.implementingEntities.slice(0, 3).map((entity, idx) => (
                        <Badge key={idx} variant="outline" className="text-[11px] font-normal">{entity}</Badge>
                      ))}
                      {meeting.implementingEntities.length > 3 && (
                        <Badge variant="outline" className="text-[11px] font-normal">+{meeting.implementingEntities.length - 3}</Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Users className="h-3.5 w-3.5 mt-0.5 text-muted-foreground flex-shrink-0" />
                    <div className="flex flex-wrap gap-1.5">
                      {meeting.deliveryPartners.slice(0, 3).map((partner, idx) => (
                        <Badge key={idx} variant="secondary" className="text-[11px] font-normal">{partner}</Badge>
                      ))}
                      {meeting.deliveryPartners.length > 3 && (
                        <Badge variant="secondary" className="text-[11px] font-normal">+{meeting.deliveryPartners.length - 3}</Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <MeetingDetailsDialog meeting={selectedMeeting} open={detailsOpen} onOpenChange={setDetailsOpen} />
      <EditMeetingDialog meeting={editingMeeting} open={editOpen} onOpenChange={setEditOpen} onSave={handleSaveMeeting} />
    </div>
  );
};

export default Meetings;
