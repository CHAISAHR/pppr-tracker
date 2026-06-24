import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import { api } from "@/services/api";

interface OrganisationExcelUploadProps {
  onComplete: () => void;
}

const ALLOWED_TYPES = ["Funder", "Implementing Entity", "Delivery Partner"];

export const OrganisationExcelUpload = ({ onComplete }: OrganisationExcelUploadProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.match(/\.(xlsx|xls|csv)$/i)) {
      toast.error("Please upload a valid Excel file (.xlsx, .xls, or .csv)");
      return;
    }

    setUploading(true);
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]) as any[];

      if (rows.length === 0) {
        toast.error("The Excel file is empty");
        return;
      }

      let created = 0;
      let failed = 0;
      const errors: string[] = [];

      for (const row of rows) {
        const name = String(row["Name"] || row["name"] || "").trim();
        if (!name) {
          failed++;
          continue;
        }
        const description = String(row["Description"] || row["description"] || "").trim();
        const typesRaw = String(row["Types"] || row["types"] || "");
        const types = typesRaw
          .split(/[;,]/)
          .map((t) => t.trim())
          .filter((t) => t)
          .filter((t) => ALLOWED_TYPES.includes(t));

        try {
          await api.createOrganisation({ name, description, types });
          created++;
        } catch (e: any) {
          failed++;
          errors.push(`${name}: ${e?.message || "failed"}`);
        }
      }

      if (created > 0) toast.success(`Imported ${created} organisation(s)`);
      if (failed > 0) toast.error(`${failed} row(s) failed${errors[0] ? ` — ${errors[0]}` : ""}`);
      onComplete();
    } catch (error) {
      console.error("Error parsing Excel file:", error);
      toast.error("Failed to parse Excel file. Please check the format.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
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
        id="organisation-excel-upload"
      />
      <Button
        onClick={() => fileInputRef.current?.click()}
        variant="outline"
        className="gap-2"
        disabled={uploading}
      >
        <Upload className="h-4 w-4" />
        {uploading ? "Importing..." : "Import from Excel"}
      </Button>
    </div>
  );
};
