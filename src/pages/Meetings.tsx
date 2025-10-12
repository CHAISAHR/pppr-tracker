import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Users, MapPin } from "lucide-react";

interface Meeting {
  id: string;
  title: string;
  date: string;
  time: string;
  participants: string[];
  location: string;
  type: "In-Person" | "Virtual";
}

const upcomingMeetings: Meeting[] = [
  {
    id: "1",
    title: "Project Kickoff Meeting",
    date: "2025-10-15",
    time: "10:00 AM",
    participants: ["Tech Solutions Inc", "Global Systems", "Project Team"],
    location: "Conference Room A",
    type: "In-Person",
  },
  {
    id: "2",
    title: "Sprint Planning Session",
    date: "2025-10-18",
    time: "2:00 PM",
    participants: ["Digital Innovations", "Development Team"],
    location: "Zoom Meeting",
    type: "Virtual",
  },
  {
    id: "3",
    title: "Quarterly Review",
    date: "2025-10-22",
    time: "9:00 AM",
    participants: ["All Stakeholders", "Management Team"],
    location: "Main Hall",
    type: "In-Person",
  },
  {
    id: "4",
    title: "Security Audit Discussion",
    date: "2025-10-25",
    time: "3:00 PM",
    participants: ["SecureIT", "Audit Associates", "IT Team"],
    location: "Teams Meeting",
    type: "Virtual",
  },
  {
    id: "5",
    title: "Training Workshop",
    date: "2025-10-28",
    time: "11:00 AM",
    participants: ["Learning Corp", "Training Partners", "End Users"],
    location: "Training Center",
    type: "In-Person",
  },
];

const Meetings = () => {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Upcoming Meetings</h1>
          <p className="text-muted-foreground">
            View and manage your scheduled meetings
          </p>
        </div>

        <div className="grid gap-4">
          {upcomingMeetings.map((meeting) => (
            <Card key={meeting.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl">{meeting.title}</CardTitle>
                    <CardDescription className="flex items-center gap-4 mt-2">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(meeting.date).toLocaleDateString('en-US', {
                          weekday: 'short',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {meeting.time}
                      </span>
                    </CardDescription>
                  </div>
                  <Badge variant={meeting.type === "Virtual" ? "secondary" : "default"}>
                    {meeting.type}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                  <span className="text-sm">{meeting.location}</span>
                </div>
                <div className="flex items-start gap-2">
                  <Users className="h-4 w-4 mt-0.5 text-muted-foreground" />
                  <div className="flex flex-wrap gap-2">
                    {meeting.participants.map((participant, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {participant}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Meetings;
