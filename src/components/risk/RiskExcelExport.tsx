import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import * as XLSX from "xlsx";
import { toast } from "sonner";
import type { Risk } from "./risk-types";

interface Props {
  risks: Risk[];
}

export const RiskExcelExport = ({ risks }: Props) => {
  const onExport = () => {
    if (risks.length === 0) {
      toast.error("No risks to export");
      return;
    }
    const data = risks.map((r) => {
      const score =
        r.likelihood != null && r.impact != null
          ? r.likelihood * r.impact
          : "";
      return {
        "Risk ID": r.riskId || "",
        "Organisation": r.organisation || "",
        "Description": r.description || "",
        "Likelihood": r.likelihood ?? "",
        "Impact": r.impact ?? "",
        "Score": score,
        "Mitigation": r.mitigation || "",
        "Owner": r.owner || "",
        "Status": r.status || "Open",
        "Date Identified": r.dateIdentified ?? "",
      };
    });
    const ws = XLSX.utils.json_to_sheet(data);
    ws["!cols"] = [
      { wch: 10 }, { wch: 24 }, { wch: 40 }, { wch: 12 }, { wch: 10 },
      { wch: 8 }, { wch: 40 }, { wch: 20 }, { wch: 12 }, { wch: 14 },
    ];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Risks");
    const stamp = new Date().toISOString().split("T")[0];
    XLSX.writeFile(wb, `risk_register_export_${stamp}.xlsx`);
    toast.success(`Exported ${risks.length} risks`);
  };
  return (
    <Button onClick={onExport} variant="default" className="gap-2">
      <Download className="h-4 w-4" />
      Export
    </Button>
  );
};
