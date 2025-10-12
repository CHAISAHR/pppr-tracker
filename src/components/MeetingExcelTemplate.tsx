import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import * as XLSX from "xlsx";
import { toast } from "sonner";

export const MeetingExcelTemplate = () => {
  const downloadTemplate = () => {
    // Create template data
    const templateData = [
      {
        "Quarter": "Q1 2025",
        "Meeting Date": "2025-01-15",
        "Focus Area": "Project Kickoff Meeting",
        "Implementing Entities": "Entity 1; Entity 2; Entity 3",
        "Delivery Partners": "Partner 1; Partner 2",
        "Key Objectives": "Define project scope and deliverables",
        "Format": "Virtual",
      },
    ];

    // Create workbook and worksheet
    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Meetings");

    // Set column widths
    const columnWidths = [
      { wch: 12 }, // Quarter
      { wch: 15 }, // Meeting Date
      { wch: 30 }, // Focus Area
      { wch: 30 }, // Implementing Entities
      { wch: 30 }, // Delivery Partners
      { wch: 40 }, // Key Objectives
      { wch: 12 }, // Format
    ];
    worksheet["!cols"] = columnWidths;

    // Generate Excel file
    XLSX.writeFile(workbook, "meetings_template.xlsx");
    toast.success("Template downloaded successfully");
  };

  return (
    <Button
      onClick={downloadTemplate}
      variant="outline"
      className="gap-2"
    >
      <Download className="h-4 w-4" />
      Download Template
    </Button>
  );
};
