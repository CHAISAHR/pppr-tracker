import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Users, Building2, Edit } from "lucide-react";
import { MeetingDetailsDialog, type Meeting } from "@/components/MeetingDetailsDialog";
import { EditMeetingDialog } from "@/components/EditMeetingDialog";
import { AddMeetingDialog } from "@/components/AddMeetingDialog";
import { MeetingExcelTemplate } from "@/components/MeetingExcelTemplate";
import { MeetingExcelUpload } from "@/components/MeetingExcelUpload";
import { MeetingExcelExport } from "@/components/MeetingExcelExport";
import { useAuth } from "@/contexts/AuthContext";

const Meetings = () => {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [editingMeeting, setEditingMeeting] = useState<Meeting | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const { user, isAdmin } = useAuth();

  useEffect(() => {
    const savedMeetings = localStorage.getItem("meetings");
    if (savedMeetings) {
      setMeetings(JSON.parse(savedMeetings));
    }
  }, []);

  useEffect(() => {
    if (meetings.length > 0) {
      localStorage.setItem("meetings", JSON.stringify(meetings));
    }
  }, [meetings]);

  const handleMeetingClick = (meeting: Meeting) => {
    setSelectedMeeting(meeting);
    setDetailsOpen(true);
  };

  const handleEditClick = (meeting: Meeting, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingMeeting(meeting);
    setEditOpen(true);
  };

  const handleSaveMeeting = (updatedMeeting: Meeting) => {
    setMeetings(meetings.map(m => m.id === updatedMeeting.id ? updatedMeeting : m));
  };

  const handleAddMeeting = (newMeeting: Meeting) => {
    setMeetings(prev => [...prev, newMeeting]);
  };

  const handleUploadMeetings = (uploadedMeetings: Meeting[]) => {
    setMeetings(prev => [...prev, ...uploadedMeetings]);
  };

  const sortedMeetings = [...meetings].sort((a, b) =>
    new Date(a.meetingDate).getTime() - new Date(b.meetingDate).getTime()
  );

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 text-foreground">Meeting Schedule</h1>
            <p className="text-muted-foreground text-lg">View and manage your scheduled meetings</p>
          </div>
          <div className="flex gap-2">
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
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-1">No meetings scheduled</h3>
              <p className="text-sm text-muted-foreground">Click "Add Meeting" to schedule your first meeting.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {sortedMeetings.map((meeting) => (
              <Card
                key={meeting.id}
                className="group hover:shadow-lg transition-all duration-200 cursor-pointer border hover:border-primary/40"
                onClick={() => handleMeetingClick(meeting)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <CardTitle className="text-xl group-hover:text-primary transition-colors">
                          {meeting.focusArea}
                        </CardTitle>
                        {isAdmin() && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => handleEditClick(meeting, e)}
                            className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      <CardDescription className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(meeting.meetingDate).toLocaleDateString('en-US', {
                            weekday: 'short', year: 'numeric', month: 'long', day: 'numeric',
                          })}
                        </span>
                        <span className="font-medium">{meeting.quarter}</span>
                      </CardDescription>
                    </div>
                    <Badge variant={meeting.format === "Virtual" ? "secondary" : meeting.format === "Hybrid" ? "outline" : "default"}>
                      {meeting.format}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-2">
                    <Building2 className="h-4 w-4 mt-0.5 text-muted-foreground" />
                    <div className="flex flex-wrap gap-2">
                      {meeting.implementingEntities.slice(0, 3).map((entity, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">{entity}</Badge>
                      ))}
                      {meeting.implementingEntities.length > 3 && (
                        <Badge variant="outline" className="text-xs">+{meeting.implementingEntities.length - 3} more</Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Users className="h-4 w-4 mt-0.5 text-muted-foreground" />
                    <div className="flex flex-wrap gap-2">
                      {meeting.deliveryPartners.slice(0, 3).map((partner, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">{partner}</Badge>
                      ))}
                      {meeting.deliveryPartners.length > 3 && (
                        <Badge variant="secondary" className="text-xs">+{meeting.deliveryPartners.length - 3} more</Badge>
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
