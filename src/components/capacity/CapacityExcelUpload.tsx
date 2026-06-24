import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import { importCapacityRows } from "@/lib/capacity";

const parseDate = (value: unknown): string | null => {
  if (value == null || value === "") return null;
  if (typeof value === "number") {
    const d = new Date((value - 25569) * 86400 * 1000);
    return isNaN(d.getTime()) ? null : d.toISOString().split("T")[0];
  }
  const d = new Date(String(value));
  return isNaN(d.getTime()) ? null : d.toISOString().split("T")[0];
};

const parseNum = (value: unknown): number | null => {
  if (value == null || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
};

export const CapacityExcelUpload = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.match(/\.(xlsx|xls|csv)$/i)) {
      toast.error("Please upload a valid Excel file (.xlsx, .xls, or .csv)");
      return;
    }

    try {
      const data = await file.arrayBuffer();
      const wb = XLSX.read(data, { type: "array" });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(ws) as Record<string, unknown>[];

      if (!rows.length) {
        toast.error("The Excel file is empty");
        return;
      }

      const mapped = rows.map((r) => ({
        event_focus_area: String(r["Event Name"] ?? r["Event Focus Area"] ?? r["event_focus_area"] ?? "").trim(),
        event_date: parseDate(r["Event Date"] ?? r["event_date"]),
        focus_area: String(r["Focus Area"] ?? r["focus_area"] ?? "").trim() || null,
        sector: String(r["Sector"] ?? r["sector"] ?? "").trim() || null,
        participant_name: String(r["Participant Name"] ?? r["participant_name"] ?? "").trim(),
        competency: String(r["Competency"] ?? r["competency"] ?? "").trim(),
        pre_score: parseNum(r["Score Before"] ?? r["pre_score"] ?? r["Pre Score"]),
        post_score: parseNum(r["Score After"] ?? r["post_score"] ?? r["Post Score"]),
      }));

      const count = await importCapacityRows(mapped);
      toast.success(`Imported ${count} capacity row${count === 1 ? "" : "s"}`);
    } catch (err) {
      console.error("Error parsing Excel file:", err);
      toast.error("Failed to import file");
    } finally {
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
        id="capacity-excel-upload"
      />
      <Button onClick={() => fileInputRef.current?.click()} variant="outline" className="gap-2">
        <Upload className="h-4 w-4" />
        Import from Excel
      </Button>
    </div>
  );
};
