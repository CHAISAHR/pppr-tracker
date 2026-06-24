import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import * as XLSX from "xlsx";
import { toast } from "sonner";

export const CapacityExcelTemplate = () => {
  const downloadTemplate = () => {
    const sample = [
      {
        "Event Focus Area": "Example training event",
        "Event Date": "2026-03-15",
        "Participant Name": "Jane Doe",
        "Competency": "Data Analysis",
        "Score Before": 3,
        "Score After": 5,
      },
      {
        "Event Focus Area": "Example training event",
        "Event Date": "2026-03-15",
        "Participant Name": "Jane Doe",
        "Competency": "Report Writing",
        "Score Before": 2,
        "Score After": 4,
      },
    ];

    const ws = XLSX.utils.json_to_sheet(sample);
    ws["!cols"] = [
      { wch: 30 }, { wch: 12 }, { wch: 25 }, { wch: 25 }, { wch: 12 }, { wch: 12 },
    ];

    const instructions = [
      ["Capacity Tracker — Bulk Upload Template"],
      [],
      ["No field is mandatory. Empty cells are allowed."],
      ["One row per participant × competency."],
      [],
      ["Columns:"],
      ["Event Focus Area", "Name / topic of the event"],
      ["Event Date", "YYYY-MM-DD format"],
      ["Participant Name", "Full name of the participant"],
      ["Competency", "The skill / competency being assessed"],
      ["Score Before", "Numeric score before the training"],
      ["Score After", "Numeric score after the training"],
    ];
    const wsInstr = XLSX.utils.aoa_to_sheet(instructions);
    wsInstr["!cols"] = [{ wch: 25 }, { wch: 50 }];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Capacity");
    XLSX.utils.book_append_sheet(wb, wsInstr, "Instructions");
    XLSX.writeFile(wb, "capacity_template.xlsx");
    toast.success("Template downloaded");
  };

  return (
    <Button onClick={downloadTemplate} variant="outline" className="gap-2">
      <Download className="h-4 w-4" />
      Download Template
    </Button>
  );
};
