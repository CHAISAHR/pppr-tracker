import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload, Loader2 } from "lucide-react";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import { supabase } from "@/integrations/supabase/client";

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

      const indicators = jsonData.map((row) => {
        const responsibility = String(row["Responsibility for Implementation"] || row["responsibility"] || "");
        
        return {
          country: String(row["Country"] || "") || null,
          activity_id: String(row["Activity ID"] || row["activity_id"] || "") || null,
          activity: String(row["Activity"] || "") || null,
          long_term_outcome: String(row["Long-term Outcome"] || row["Long-term outcome"] || "") || null,
          core_indicators: String(row["Core Indicator"] || row["Core indicator"] || row["core_indicators"] || "") || null,
          workstream: String(row["Workstream"] || row["workstream"] || "") || null,
          indicator_type: String(row["Indicator Type"] || row["Indicator type"] || "") || null,
          name: String(row["Indicator Name"] || row["Indicator name"] || row["name"] || "Unnamed"),
          indicator_definition: String(row["Indicator Definition"] || row["Indicator definition"] || "") || null,
          naphs: String(row["NAPHS"] || row["naphs"] || "") || null,
          responsibility: responsibility || null,
          organisation: String(row["Organisation Name"] || row["Organisation name"] || row["organisation"] || "") || null,
          cost_usd: row["Cost US$"] || row["Cost USD"] ? Number(row["Cost US$"] || row["Cost USD"]) : null,
          implementing_entity: String(row["Implementing Entity"] || row["Implementing entity"] || "") || null,
          data_source: String(row["Data Source"] || row["Data source"] || "") || null,
          unit: String(row["Unit"] || row["unit"] || "Number"),
          baseline_proposal_year: row["Baseline Proposal Year"] ? Number(row["Baseline Proposal Year"]) : null,
          quarter_3: row["Quarter 3"] ? Number(row["Quarter 3"]) : null,
          target_year_1: row["Target Year 1"] || row["Target Year 1 (proposal year)"] ? Number(row["Target Year 1"] || row["Target Year 1 (proposal year)"]) : null,
          target_year_2: row["Target Year 2"] ? Number(row["Target Year 2"]) : null,
          target_year_3: row["Target Year 3"] ? Number(row["Target Year 3"]) : null,
        };
      });

      const { error } = await supabase.from("indicators").insert(indicators as any);

      if (error) throw error;

      toast.success(`Successfully imported ${indicators.length} indicators`);
      onSuccess();
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      console.error("Error importing indicators:", error);
      toast.error("Failed to import indicators. Please check the format.");
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
