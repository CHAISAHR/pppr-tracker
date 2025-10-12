import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import * as XLSX from "xlsx";
import { toast } from "sonner";

export const ExcelTemplate = () => {
  const downloadTemplate = () => {
    // Create template data
    const templateData = [
      {
        "Activity ID": "ACT-001",
        "Activity Description": "Example activity description",
        "Sub-Activity ID": "SUB-001",
        "Sub-Activity Description": "Example sub-activity description",
        "Implementing Entity": "Example Entity",
        "Delivery Partner": "Example Partner",
        "Status": "Pending",
        "Start Date": "2025-01-01",
        "End Date": "2025-03-31",
        "Comments": "Example comments",
      },
    ];

    // Create workbook and worksheet
    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Projects");

    // Set column widths
    const columnWidths = [
      { wch: 12 }, // Activity ID
      { wch: 30 }, // Activity Description
      { wch: 15 }, // Sub-Activity ID
      { wch: 30 }, // Sub-Activity Description
      { wch: 20 }, // Implementing Entity
      { wch: 20 }, // Delivery Partner
      { wch: 15 }, // Status
      { wch: 15 }, // Start Date
      { wch: 15 }, // End Date
      { wch: 30 }, // Comments
    ];
    worksheet["!cols"] = columnWidths;

    // Generate Excel file
    XLSX.writeFile(workbook, "project_template.xlsx");
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
