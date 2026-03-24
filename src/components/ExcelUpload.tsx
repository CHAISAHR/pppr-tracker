import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import type { Project, Status } from "./ProjectTable";

interface ExcelUploadProps {
  onUpload: (projects: Project[]) => void;
}

export const ExcelUpload = ({ onUpload }: ExcelUploadProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = [
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "text/csv",
    ];
    
    if (!validTypes.includes(file.type) && !file.name.match(/\.(xlsx|xls|csv)$/i)) {
      toast.error("Please upload a valid Excel file (.xlsx, .xls, or .csv)");
      return;
    }

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet) as any[];

      if (jsonData.length === 0) {
        toast.error("The Excel file is empty");
        return;
      }

      // Map Excel data to Project format
      const projects: Project[] = jsonData.map((row, index) => {
        // Validate required fields
        const activityId = row["Activity ID"] || row["activity_id"] || `ACT-${Date.now()}-${index}`;
        const status = (row["Status"] || row["status"] || "Not Yet Started") as Status;
        
        // Ensure status is valid
        const validStatuses: Status[] = ["Completed", "In Progress", "Not Yet Started"];
        const finalStatus = validStatuses.includes(status) ? status : "Not Yet Started";

        // Parse dates
        const parseDate = (value: any) => {
          if (!value) return '';
          if (typeof value === 'number') {
            // Excel date serial number
            const excelDate = new Date((value - 25569) * 86400 * 1000);
            return excelDate.toISOString().split('T')[0];
          }
          // String date
          const parsedDate = new Date(value);
          if (!isNaN(parsedDate.getTime())) {
            return parsedDate.toISOString().split('T')[0];
          }
          return '';
        };

        return {
          id: `${Date.now()}-${index}`,
          activityId: String(activityId),
          activityDescription: String(row["Activity Description"] || row["activity_description"] || ""),
          subActivityId: String(row["Sub-Activity ID"] || row["sub_activity_id"] || ""),
          subActivityDescription: String(row["Sub-Activity Description"] || row["sub_activity_description"] || ""),
          implementingEntity: String(row["Implementing Entity"] || row["implementing_entity"] || ""),
          deliveryPartner: String(row["Delivery Partner"] || row["delivery_partner"] || ""),
          status: finalStatus,
          startDate: parseDate(row["Start Date"] || row["start_date"]),
          endDate: parseDate(row["End Date"] || row["end_date"]),
          comments: String(row["Comments"] || row["comments"] || ""),
        };
      });

      onUpload(projects);
      toast.success(`Successfully imported ${projects.length} projects`);
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Error parsing Excel file:", error);
      toast.error("Failed to parse Excel file. Please check the format.");
    }
  };

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls,.csv"
        onChange={handleFileUpload}
        className="hidden"
        id="excel-upload"
      />
      <Button
        onClick={() => fileInputRef.current?.click()}
        variant="outline"
        className="gap-2"
      >
        <Upload className="h-4 w-4" />
        Import from Excel
      </Button>
    </div>
  );
};
