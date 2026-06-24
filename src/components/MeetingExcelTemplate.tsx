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
        "Date From": "2025-01-15",
        "Date To": "2025-01-16",
        "Focus Area": "Project Kickoff Meeting",
        "Implementing Entities": "Entity 1; Entity 2; Entity 3",
        "Delivery Partners": "Partner 1; Partner 2",
        "Key Objectives": "Define project scope and deliverables",
        "Format": "Virtual",
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Events");

    worksheet["!cols"] = [
      { wch: 12 }, { wch: 14 }, { wch: 14 }, { wch: 30 },
      { wch: 30 }, { wch: 30 }, { wch: 40 }, { wch: 12 },
    ];

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
