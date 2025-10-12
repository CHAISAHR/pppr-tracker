import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Users, Building2, Edit, Shield } from "lucide-react";
import { MeetingDetailsDialog, type Meeting } from "@/components/MeetingDetailsDialog";
import { EditMeetingDialog } from "@/components/EditMeetingDialog";
import { MeetingExcelTemplate } from "@/components/MeetingExcelTemplate";
import { MeetingExcelUpload } from "@/components/MeetingExcelUpload";
import { toast } from "sonner";

// Simulated admin check - replace with your Railway backend authentication
const isAdmin = true;

const Meetings = () => {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [editingMeeting, setEditingMeeting] = useState<Meeting | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  // Load meetings from localStorage on mount
  useEffect(() => {
    const savedMeetings = localStorage.getItem("meetings");
    if (savedMeetings) {
      setMeetings(JSON.parse(savedMeetings));
    } else {
      // Initialize with sample data
      const initialMeetings: Meeting[] = [
        {
          id: "1",
          quarter: "Q4 2025",
          meetingDate: "2025-10-15",
          focusArea: "Project Kickoff Meeting",
          implementingEntities: ["Tech Solutions Inc", "Global Systems"],
          deliveryPartners: ["Consulting Partners", "Implementation Team"],
          keyObjectives: "Define project scope, deliverables, and timeline for the upcoming quarter",
          format: "In-Person",
        },
        {
          id: "2",
          quarter: "Q4 2025",
          meetingDate: "2025-10-18",
          focusArea: "Sprint Planning Session",
          implementingEntities: ["Digital Innovations"],
          deliveryPartners: ["Development Team"],
          keyObjectives: "Plan sprint activities and prioritize backlog items",
          format: "Virtual",
        },
        {
          id: "3",
          quarter: "Q4 2025",
          meetingDate: "2025-10-22",
          focusArea: "Quarterly Review",
          implementingEntities: ["All Stakeholders", "Management Team"],
          deliveryPartners: ["Finance", "Operations"],
          keyObjectives: "Review quarterly performance and plan for next quarter",
          format: "Hybrid",
        },
      ];
      setMeetings(initialMeetings);
      localStorage.setItem("meetings", JSON.stringify(initialMeetings));
    }
  }, []);

  // Save meetings to localStorage whenever they change
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

  const handleUploadMeetings = (uploadedMeetings: Meeting[]) => {
    setMeetings([...meetings, ...uploadedMeetings]);
  };

  // Sort meetings by date
  const sortedMeetings = [...meetings].sort((a, b) => 
    new Date(a.meetingDate).getTime() - new Date(b.meetingDate).getTime()
  );

  return (
    <div className="min-h-screen bg-gradient-subtle p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-start justify-between animate-slide-up">
          <div>
            <h1 className="text-4xl font-bold mb-2 bg-gradient-primary bg-clip-text text-transparent">
              Upcoming Meetings
            </h1>
            <p className="text-muted-foreground text-lg">
              View and manage your scheduled meetings
            </p>
          </div>
          {isAdmin && (
            <div className="flex gap-2">
              <MeetingExcelTemplate />
              <MeetingExcelUpload onUpload={handleUploadMeetings} />
            </div>
          )}
        </div>

        <div className="grid gap-4">
          {sortedMeetings.map((meeting, index) => (
            <Card 
              key={meeting.id} 
              className="group hover:shadow-2xl hover:shadow-primary/20 transition-all duration-300 cursor-pointer border-2 hover:border-primary/50 hover:scale-[1.02] animate-fade-in bg-card/80 backdrop-blur-sm"
              style={{ animationDelay: `${index * 100}ms` }}
              onClick={() => handleMeetingClick(meeting)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle className="text-xl group-hover:text-primary transition-colors duration-300">
                        {meeting.focusArea}
                      </CardTitle>
                      {isAdmin && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => handleEditClick(meeting, e)}
                          className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-primary/10 hover:text-primary"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <CardDescription className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(meeting.meetingDate).toLocaleDateString('en-US', {
                          weekday: 'short',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </span>
                      <span className="font-medium">{meeting.quarter}</span>
                    </CardDescription>
                  </div>
                  <Badge 
                    className={
                      meeting.format === "Virtual" 
                        ? "bg-accent text-accent-foreground hover:bg-accent/90 shadow-lg shadow-accent/20" 
                        : meeting.format === "Hybrid" 
                        ? "bg-secondary text-secondary-foreground hover:bg-secondary/90 shadow-lg shadow-secondary/20" 
                        : "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20"
                    }
                  >
                    {meeting.format}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-2">
                  <Building2 className="h-4 w-4 mt-0.5 text-muted-foreground" />
                  <div className="flex flex-wrap gap-2">
                    {meeting.implementingEntities.slice(0, 3).map((entity, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {entity}
                      </Badge>
                    ))}
                    {meeting.implementingEntities.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{meeting.implementingEntities.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Users className="h-4 w-4 mt-0.5 text-muted-foreground" />
                  <div className="flex flex-wrap gap-2">
                    {meeting.deliveryPartners.slice(0, 3).map((partner, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {partner}
                      </Badge>
                    ))}
                    {meeting.deliveryPartners.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{meeting.deliveryPartners.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <MeetingDetailsDialog
        meeting={selectedMeeting}
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
      />

      <EditMeetingDialog
        meeting={editingMeeting}
        open={editOpen}
        onOpenChange={setEditOpen}
        onSave={handleSaveMeeting}
      />
    </div>
  );
};

export default Meetings;
