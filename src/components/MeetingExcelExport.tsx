import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import * as XLSX from "xlsx";
import { toast } from "sonner";
import type { Meeting } from "./MeetingDetailsDialog";

interface MeetingExcelExportProps {
  meetings: Meeting[];
}

export const MeetingExcelExport = ({ meetings }: MeetingExcelExportProps) => {
  const exportData = () => {
    if (meetings.length === 0) {
      toast.error("No meetings to export");
      return;
    }

    const excelData = meetings.map(meeting => ({
      "Activity ID": meeting.activityId || "",
      "Sub-Activity ID": meeting.subActivityId || "",
      "Quarter": meeting.quarter,
      "Meeting Date": meeting.meetingDate,
      "Focus Area": meeting.focusArea,
      "Format": meeting.format,
      "Implementing Entities": meeting.implementingEntities.join("; "),
      "Delivery Partners": meeting.deliveryPartners.join("; "),
      "Key Objectives": meeting.keyObjectives,
      "Organiser Name": meeting.organiserName || "",
      "Organiser Email": meeting.organiserEmail || "",
      "Organiser Phone": meeting.organiserPhone || "",
      "Pre-Survey Link": meeting.preSurveyLink || "",
      "Post-Survey Link": meeting.postSurveyLink || "",
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Meetings");

    worksheet["!cols"] = [
      { wch: 12 }, { wch: 15 }, { wch: 10 }, { wch: 14 }, { wch: 25 },
      { wch: 12 }, { wch: 30 }, { wch: 30 }, { wch: 35 },
      { wch: 20 }, { wch: 25 }, { wch: 18 }, { wch: 35 }, { wch: 35 },
    ];

    const timestamp = new Date().toISOString().split('T')[0];
    XLSX.writeFile(workbook, `meetings_export_${timestamp}.xlsx`);
    toast.success(`Exported ${meetings.length} meetings successfully`);
  };

  return (
    <Button onClick={exportData} variant="default" className="gap-2">
      <Download className="h-4 w-4" />
      Export Meetings
    </Button>
  );
};
