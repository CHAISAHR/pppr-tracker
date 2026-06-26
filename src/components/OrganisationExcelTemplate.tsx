import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import * as XLSX from "xlsx";
import { toast } from "sonner";

export const OrganisationExcelTemplate = () => {
  const downloadTemplate = () => {
    const templateData = [
      {
        "Name": "Example Organisation",
        "Description": "Short description of the organisation",
        "Types": "Funder; Government",
      },
      {
        "Name": "Another Organisation",
        "Description": "",
        "Types": "Government; Delivery Partner",
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Organisations");

    worksheet["!cols"] = [{ wch: 35 }, { wch: 50 }, { wch: 50 }];

    // Add a small instructions sheet
    const notes = [
      { Field: "Name", Required: "Yes", Notes: "Unique organisation name" },
      { Field: "Description", Required: "No", Notes: "Optional free text" },
      {
        Field: "Types",
        Required: "No",
        Notes:
          "Semicolon-separated. Allowed values: Funder, Government, Implementing Entity, Delivery Partner",
      },
    ];
    const notesSheet = XLSX.utils.json_to_sheet(notes);
    notesSheet["!cols"] = [{ wch: 15 }, { wch: 10 }, { wch: 70 }];
    XLSX.utils.book_append_sheet(workbook, notesSheet, "Instructions");

    XLSX.writeFile(workbook, "organisation_template.xlsx");
    toast.success("Template downloaded successfully");
  };

  return (
    <Button onClick={downloadTemplate} variant="outline" className="gap-2">
      <Download className="h-4 w-4" />
      Download Template
    </Button>
  );
};
