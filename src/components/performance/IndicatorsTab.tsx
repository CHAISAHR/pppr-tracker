import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Loader2, ExternalLink, Download } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { EditIndicatorDialog } from "./EditIndicatorDialog";
import * as XLSX from "xlsx";

export interface Indicator {
  id: string;
  name: string;
  description: string | null;
  unit: string;
  workstream: string | null;
  organisation: string | null;
  activity_id: string | null;
  subactivity_id: string | null;
  core_indicators: string | null;
  year: number | null;
  target: number | null;
  q1: number | null;
  q2: number | null;
  q3: number | null;
  q4: number | null;
  annual_performance: number | null;
  evidence: string | null;
  created_at: string;
}

interface IndicatorsTabProps {
  onUpdate?: () => void;
}

export function IndicatorsTab({ onUpdate }: IndicatorsTabProps) {
  const { user } = useAuth();
  const [indicators, setIndicators] = useState<Indicator[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingIndicator, setEditingIndicator] = useState<Indicator | null>(null);

  const fetchIndicators = async () => {
    try {
      const { data, error } = await supabase
        .from("indicators")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setIndicators((data as any[]) || []);
    } catch (error) {
      console.error("Error fetching indicators:", error);
      toast.error("Failed to load indicators");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIndicators();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this indicator?")) return;

    try {
      const { error } = await supabase
        .from("indicators")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast.success("Indicator deleted successfully");
      fetchIndicators();
      onUpdate?.();
    } catch (error) {
      console.error("Error deleting indicator:", error);
      toast.error("Failed to delete indicator");
    }
  };

  const handleEditSuccess = () => {
    setEditingIndicator(null);
    fetchIndicators();
    onUpdate?.();
  };

  const handleExport = () => {
    if (indicators.length === 0) {
      toast.error("No indicators to export");
      return;
    }

    const excelData = indicators.map(ind => ({
      "Workstream": ind.workstream || "",
      "Organisation": ind.organisation || "",
      "Activity ID": ind.activity_id || "",
      "Subactivity ID": ind.subactivity_id || "",
      "Core Indicators": ind.core_indicators || "",
      "Indicator Name": ind.name,
      "Unit": ind.unit,
      "Year": ind.year || "",
      "Target": ind.target ?? "",
      "Q1": ind.q1 ?? "",
      "Q2": ind.q2 ?? "",
      "Q3": ind.q3 ?? "",
      "Q4": ind.q4 ?? "",
      "Annual Performance": ind.annual_performance ?? "",
      "Evidence": ind.evidence || "",
      "Description": ind.description || "",
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Indicators");

    const timestamp = new Date().toISOString().split("T")[0];
    XLSX.writeFile(workbook, `indicators_export_${timestamp}.xlsx`);
    toast.success(`Exported ${indicators.length} indicators successfully`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (indicators.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No indicators defined yet. {user && "Click 'Add Indicator' to create one."}
      </div>
    );
  }

  return (
    <>
      <div className="flex justify-end mb-4">
        <Button onClick={handleExport} variant="default" className="gap-2">
          <Download className="h-4 w-4" />
          Export Indicators
        </Button>
      </div>

      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Workstream</TableHead>
              <TableHead>Organisation</TableHead>
              <TableHead>Activity ID</TableHead>
              <TableHead>Subactivity ID</TableHead>
              <TableHead>Core Indicators</TableHead>
              <TableHead>Indicator Name</TableHead>
              <TableHead>Year</TableHead>
              <TableHead>Target</TableHead>
              <TableHead>Q1</TableHead>
              <TableHead>Q2</TableHead>
              <TableHead>Q3</TableHead>
              <TableHead>Q4</TableHead>
              <TableHead>Annual Performance</TableHead>
              <TableHead>Evidence</TableHead>
              {user && <TableHead className="text-right">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {indicators.map((indicator) => (
              <TableRow key={indicator.id}>
                <TableCell>{indicator.workstream || "-"}</TableCell>
                <TableCell>{indicator.organisation || "-"}</TableCell>
                <TableCell>{indicator.activity_id || "-"}</TableCell>
                <TableCell>{indicator.subactivity_id || "-"}</TableCell>
                <TableCell>{indicator.core_indicators || "-"}</TableCell>
                <TableCell className="font-medium">{indicator.name}</TableCell>
                <TableCell>{indicator.year || "-"}</TableCell>
                <TableCell>{indicator.target ?? "-"}</TableCell>
                <TableCell>{indicator.q1 ?? "-"}</TableCell>
                <TableCell>{indicator.q2 ?? "-"}</TableCell>
                <TableCell>{indicator.q3 ?? "-"}</TableCell>
                <TableCell>{indicator.q4 ?? "-"}</TableCell>
                <TableCell>{indicator.annual_performance ?? "-"}</TableCell>
                <TableCell>
                  {indicator.evidence ? (
                    <a
                      href={indicator.evidence}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline inline-flex items-center gap-1"
                    >
                      View <ExternalLink className="h-3 w-3" />
                    </a>
                  ) : (
                    "-"
                  )}
                </TableCell>
                {user && (
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingIndicator(indicator)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(indicator.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {editingIndicator && (
        <EditIndicatorDialog
          indicator={editingIndicator}
          open={!!editingIndicator}
          onOpenChange={(open) => !open && setEditingIndicator(null)}
          onSuccess={handleEditSuccess}
        />
      )}
    </>
  );
}
