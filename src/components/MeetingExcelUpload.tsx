import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import type { Meeting } from "./MeetingDetailsDialog";

interface MeetingExcelUploadProps {
  onUpload: (meetings: Meeting[]) => void;
}

export const MeetingExcelUpload = ({ onUpload }: MeetingExcelUploadProps) => {
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

      // Map Excel data to Meeting format
      const meetings: Meeting[] = jsonData.map((row, index) => {
        const format = (row["Format"] || row["format"] || "Virtual") as "Virtual" | "Hybrid" | "In-Person";
        const validFormats: Array<"Virtual" | "Hybrid" | "In-Person"> = ["Virtual", "Hybrid", "In-Person"];
        const finalFormat = validFormats.includes(format) ? format : "Virtual";

        // Parse semicolon-separated values
        const implementingEntities = String(row["Implementing Entities"] || row["implementing_entities"] || "")
          .split(';')
          .map(e => e.trim())
          .filter(e => e);

        const deliveryPartners = String(row["Delivery Partners"] || row["delivery_partners"] || "")
          .split(';')
          .map(p => p.trim())
          .filter(p => p);

        // Parse date
        let meetingDate = "";
        const dateValue = row["Meeting Date"] || row["meeting_date"];
        if (dateValue) {
          // Handle Excel date serial number
          if (typeof dateValue === 'number') {
            const excelDate = new Date((dateValue - 25569) * 86400 * 1000);
            meetingDate = excelDate.toISOString().split('T')[0];
          } else {
            // Handle string date
            const parsedDate = new Date(dateValue);
            if (!isNaN(parsedDate.getTime())) {
              meetingDate = parsedDate.toISOString().split('T')[0];
            }
          }
        }

        return {
          id: `${Date.now()}-${index}`,
          activityId: String(row["Activity ID"] || row["activity_id"] || ""),
          subActivityId: String(row["Sub-Activity ID"] || row["sub_activity_id"] || ""),
          quarter: String(row["Quarter"] || row["quarter"] || ""),
          meetingDate: meetingDate,
          focusArea: String(row["Focus Area"] || row["focus_area"] || ""),
          implementingEntities: implementingEntities,
          deliveryPartners: deliveryPartners,
          keyObjectives: String(row["Key Objectives"] || row["key_objectives"] || ""),
          format: finalFormat,
        };
      });

      onUpload(meetings);
      toast.success(`Successfully imported ${meetings.length} meetings`);
      
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
        id="meeting-excel-upload"
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
