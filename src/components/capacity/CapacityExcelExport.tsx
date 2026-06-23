import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import * as XLSX from "xlsx";
import { toast } from "sonner";
import type { CapacityRow } from "@/lib/capacity";

interface Props {
  rows: CapacityRow[];
}

export const CapacityExcelExport = ({ rows }: Props) => {
  const onExport = () => {
    if (rows.length === 0) {
      toast.error("No capacity data to export");
      return;
    }
    const data = rows.map((r) => ({
      "Event": r.event_focus_area,
      "Event Date": r.event_date ?? "",
      "Participant": r.participant_name,
      "Competency": r.competency,
      "Score Before": r.pre_score ?? "",
      "Score After": r.post_score ?? "",
      "Change":
        r.pre_score != null && r.post_score != null ? r.post_score - r.pre_score : "",
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    ws["!cols"] = [
      { wch: 30 }, { wch: 12 }, { wch: 25 }, { wch: 20 },
      { wch: 12 }, { wch: 12 }, { wch: 10 },
    ];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Capacity");
    const stamp = new Date().toISOString().split("T")[0];
    XLSX.writeFile(wb, `capacity_export_${stamp}.xlsx`);
    toast.success(`Exported ${rows.length} rows`);
  };
  return (
    <Button onClick={onExport} variant="default" className="gap-2">
      <Download className="h-4 w-4" />
      Export
    </Button>
  );
};
