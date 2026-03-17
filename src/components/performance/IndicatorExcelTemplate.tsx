import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import * as XLSX from "xlsx";
import { toast } from "sonner";

export const IndicatorExcelTemplate = () => {
  const downloadTemplate = () => {
    const templateData = [
      {
        "Country": "Example Country",
        "Activity ID": "ACT-001",
        "Activity": "Example activity description",
        "Long-term Outcome": "Improved health security",
        "Core Indicator": "Output 1.1",
        "Workstream": "Capacity Building",
        "Indicator Type": "Output",
        "Indicator Name": "Number of participants trained",
        "Indicator Definition": "Total participants completing training",
        "NAPHS (Yes/No)": "Yes",
        "Responsibility for Implementation (Delivery Entity/Implementing Entity)": "Delivery Partner",
        "Delivery Partner": "UNDP",
        "Implementing Entity": "Ministry of Health",
        "Data Source": "Training records",
        "Cost US$": 50000,
        "Baseline Proposal Year": "2025",
        "Target Year 1": "100 trained",
        "Target Year 2": "150 trained",
        "Target Year 3": "200 trained",
        "Target Year 4": "250 trained",
        "Target Year 5": "300 trained",
        "Target Year 6": "350 trained",
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Indicators");

    worksheet["!cols"] = [
      { wch: 18 }, { wch: 12 }, { wch: 30 }, { wch: 25 },
      { wch: 18 }, { wch: 18 }, { wch: 15 }, { wch: 30 },
      { wch: 35 }, { wch: 14 }, { wch: 45 }, { wch: 20 },
      { wch: 20 }, { wch: 20 }, { wch: 12 }, { wch: 20 },
      { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 },
      { wch: 15 }, { wch: 15 },
    ];

    XLSX.writeFile(workbook, "indicators_template.xlsx");
    toast.success("Template downloaded successfully");
  };

  return (
    <Button onClick={downloadTemplate} variant="outline" className="gap-2">
      <Download className="h-4 w-4" />
      Download Template
    </Button>
  );
};
