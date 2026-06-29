import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload, Loader2 } from "lucide-react";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import { api } from "@/services/api";

interface IndicatorExcelUploadProps {
  onSuccess: () => void;
}

export const IndicatorExcelUpload = ({ onSuccess }: IndicatorExcelUploadProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.match(/\.(xlsx|xls|csv)$/i)) {
      toast.error("Please upload a valid Excel file (.xlsx, .xls, or .csv)");
      return;
    }

    setLoading(true);
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: "array" });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet) as any[];

      if (jsonData.length === 0) {
        toast.error("The Excel file is empty");
        return;
      }

      const toStr = (v: any) => {
        if (v === undefined || v === null) return null;
        const s = String(v).trim();
        return s === "" ? null : s;
      };
      const toNum = (v: any) => {
        if (v === undefined || v === null || v === "") return null;
        const n = typeof v === "number" ? v : Number(String(v).replace(/[,\s$]/g, ""));
        return Number.isFinite(n) ? n : null;
      };

      const indicators = jsonData.map((row) => {
        const responsibility = toStr(row["Responsibility for Implementation (Delivery Entity/Implementing Entity)"] ?? row["Responsibility for Implementation"] ?? row["responsibility"]);
        return {
          country: toStr(row["Country"]),
          activity_id: toStr(row["Activity ID"] ?? row["activity_id"]),
          activity: toStr(row["Activity"]),
          long_term_outcome: toStr(row["Long-term Outcome"] ?? row["Long-term outcome"]),
          core_indicators: toStr(row["Core Indicator"] ?? row["Core indicator"] ?? row["core_indicators"]),
          workstream: toStr(row["Workstream"] ?? row["workstream"]),
          indicator_type: toStr(row["Indicator Type"] ?? row["Indicator type"]),
          name: toStr(row["Indicator Name"] ?? row["Indicator name"] ?? row["name"]) ?? "Unnamed",
          indicator_definition: toStr(row["Indicator Definition"] ?? row["Indicator definition"]),
          naphs: toStr(row["NAPHS (Yes/No)"] ?? row["NAPHS"] ?? row["naphs"]),
          responsibility,
          organisation: toStr(row["Delivery Partner"] ?? row["Organisation Name"] ?? row["Organisation name"] ?? row["organisation"]),
          cost_usd: toNum(row["Cost US$"] ?? row["Cost USD"]),
          implementing_entity: toStr(row["Implementing Entity"] ?? row["Implementing entity"]),
          data_source: toStr(row["Data Source"] ?? row["Data source"]),
          unit: toStr(row["Unit"] ?? row["unit"]) ?? "Number",
          baseline_proposal_year: toStr(row["Baseline Proposal Year"]),
          target_year_1: toStr(row["Target Year 1"] ?? row["Target Year 1 (proposal year)"]),
          target_year_2: toStr(row["Target Year 2"]),
          target_year_3: toStr(row["Target Year 3"]),
          target_year_4: toStr(row["Target Year 4"]),
          target_year_5: toStr(row["Target Year 5"]),
          target_year_6: toStr(row["Target Year 6"]),
        };
      });

      await api.createIndicatorsBulk(indicators);

      toast.success(`Successfully imported ${indicators.length} indicators`);
      onSuccess();
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error: any) {
      console.error("Error importing indicators:", error);
      toast.error(error?.message || "Failed to import indicators. Please check the format.");
    } finally {
      setLoading(false);
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
        id="indicator-excel-upload"
      />
      <Button
        onClick={() => fileInputRef.current?.click()}
        variant="outline"
        className="gap-2"
        disabled={loading}
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
        Import from Excel
      </Button>
    </div>
  );
};
