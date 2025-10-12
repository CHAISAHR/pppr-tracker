import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import * as XLSX from "xlsx";
import { toast } from "sonner";
import type { Project } from "./ProjectTable";

interface ExcelExportProps {
  projects: Project[];
}

export const ExcelExport = ({ projects }: ExcelExportProps) => {
  const exportData = () => {
    // Transform projects to Excel format
    const excelData = projects.map(project => ({
      "Activity ID": project.activityId,
      "Activity Description": project.activityDescription,
      "Sub-Activity ID": project.subActivityId,
      "Sub-Activity Description": project.subActivityDescription,
      "Implementing Entity": project.implementingEntity,
      "Delivery Partner": project.deliveryPartner,
      "Status": project.status,
      "Start Date": project.startDate,
      "End Date": project.endDate,
      "Comments": project.comments,
    }));

    // Create workbook and worksheet
    const worksheet = XLSX.utils.json_to_sheet(excelData);
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

    // Generate Excel file with timestamp
    const timestamp = new Date().toISOString().split('T')[0];
    XLSX.writeFile(workbook, `projects_export_${timestamp}.xlsx`);
    toast.success(`Exported ${projects.length} projects successfully`);
  };

  return (
    <Button
      onClick={exportData}
      variant="default"
      className="gap-2"
    >
      <Download className="h-4 w-4" />
      Export Data
    </Button>
  );
};
