import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import * as XLSX from "xlsx";
import { toast } from "sonner";
import { api } from "@/services/api";
import { useState } from "react";

export function WorkshopExportAll() {
  const [exporting, setExporting] = useState(false);

  const exportAllWorkshops = async () => {
    try {
      setExporting(true);
      const allResponses = await api.getWorkshopAttendance();
      
      if (allResponses.length === 0) {
        toast.error("No workshop responses to export");
        return;
      }

      const excelData = allResponses.map(response => ({
        "Workshop Name": response.workshopName,
        "Workshop Date": response.workshopDate,
        "Participant Name": response.name,
        "Email": response.email,
        "Organization": response.organization,
        "Phone Number": response.phoneNumber,
        "Submitted At": new Date(response.submittedAt).toLocaleString(),
      }));

      const worksheet = XLSX.utils.json_to_sheet(excelData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "All Workshops");

      const columnWidths = [
        { wch: 30 }, // Workshop Name
        { wch: 15 }, // Workshop Date
        { wch: 20 }, // Participant Name
        { wch: 25 }, // Email
        { wch: 25 }, // Organization
        { wch: 15 }, // Phone Number
        { wch: 20 }, // Submitted At
      ];
      worksheet["!cols"] = columnWidths;

      const timestamp = new Date().toISOString().split('T')[0];
      XLSX.writeFile(workbook, `all_workshops_consolidated_${timestamp}.xlsx`);
      toast.success(`Exported ${allResponses.length} responses from all workshops`);
    } catch (error) {
      toast.error("Failed to export workshop data");
    } finally {
      setExporting(false);
    }
  };

  return (
    <Button
      onClick={exportAllWorkshops}
      variant="outline"
      className="gap-2"
      disabled={exporting}
    >
      <Download className="h-4 w-4" />
      {exporting ? "Exporting..." : "Export All Workshops"}
    </Button>
  );
}
