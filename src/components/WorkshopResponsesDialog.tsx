import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/services/api";
import * as XLSX from "xlsx";

interface WorkshopResponsesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workshopId: string;
  workshopName: string;
}

export function WorkshopResponsesDialog({ 
  open, 
  onOpenChange, 
  workshopId,
  workshopName 
}: WorkshopResponsesDialogProps) {
  const [responses, setResponses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (open) {
      loadResponses();
    }
  }, [open, workshopId]);

  const loadResponses = async () => {
    try {
      setLoading(true);
      const data = await api.getWorkshopAttendance(workshopId);
      setResponses(data);
    } catch (error) {
      toast.error("Failed to load responses");
    } finally {
      setLoading(false);
    }
  };

  const exportToExcel = () => {
    const excelData = responses.map(response => ({
      "Name": response.name,
      "Email": response.email,
      "Organization": response.organization,
      "Phone Number": response.phoneNumber,
      "Submitted At": new Date(response.submittedAt).toLocaleString(),
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Responses");

    const columnWidths = [
      { wch: 20 }, // Name
      { wch: 25 }, // Email
      { wch: 25 }, // Organization
      { wch: 15 }, // Phone Number
      { wch: 20 }, // Submitted At
    ];
    worksheet["!cols"] = columnWidths;

    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `${workshopName.replace(/[^a-z0-9]/gi, '_')}_responses_${timestamp}.xlsx`;
    XLSX.writeFile(workbook, filename);
    toast.success(`Exported ${responses.length} responses successfully`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Workshop Responses</DialogTitle>
          <DialogDescription>
            {workshopName} - {responses.length} registrations
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex justify-end">
            <Button 
              onClick={exportToExcel}
              variant="outline"
              className="gap-2"
              disabled={responses.length === 0}
            >
              <Download className="h-4 w-4" />
              Export to Excel
            </Button>
          </div>

          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading responses...</div>
          ) : responses.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No responses yet for this workshop.
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Organization</TableHead>
                    <TableHead>Phone Number</TableHead>
                    <TableHead>Submitted At</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {responses.map((response) => (
                    <TableRow key={response.id}>
                      <TableCell className="font-medium">{response.name}</TableCell>
                      <TableCell>{response.email}</TableCell>
                      <TableCell>{response.organization}</TableCell>
                      <TableCell>{response.phoneNumber}</TableCell>
                      <TableCell>
                        {new Date(response.submittedAt).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
