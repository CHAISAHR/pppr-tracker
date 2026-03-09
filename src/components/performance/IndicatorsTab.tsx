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
  country: string | null;
  activity: string | null;
  long_term_outcome: string | null;
  indicator_type: string | null;
  indicator_definition: string | null;
  naphs: string | null;
  responsibility: string | null;
  cost_usd: number | null;
  implementing_entity: string | null;
  data_source: string | null;
  baseline_proposal_year: number | null;
  quarter_3: number | null;
  target_year_1: number | null;
  target_year_2: number | null;
  target_year_3: number | null;
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
      const { error } = await supabase.from("indicators").delete().eq("id", id);
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
      "Country": ind.country || "",
      "Activity ID": ind.activity_id || "",
      "Activity": ind.activity || "",
      "Long-term Outcome": ind.long_term_outcome || "",
      "Core Indicator": ind.core_indicators || "",
      "Workstream": ind.workstream || "",
      "Indicator Type": ind.indicator_type || "",
      "Indicator Name": ind.name,
      "Indicator Definition": ind.indicator_definition || "",
      "NAPHS": ind.naphs || "",
      "Responsibility for Implementation": ind.responsibility || "",
      "Organisation Name": ind.organisation || "",
      "Cost US$": ind.cost_usd ?? "",
      "Implementing Entity": ind.implementing_entity || "",
      "Data Source": ind.data_source || "",
      "Baseline Proposal Year": ind.baseline_proposal_year ?? "",
      "Quarter 3": ind.quarter_3 ?? "",
      "Target Year 1": ind.target_year_1 ?? "",
      "Target Year 2": ind.target_year_2 ?? "",
      "Target Year 3": ind.target_year_3 ?? "",
      "Year": ind.year || "",
      "Target": ind.target ?? "",
      "Q1": ind.q1 ?? "",
      "Q2": ind.q2 ?? "",
      "Q3": ind.q3 ?? "",
      "Q4": ind.q4 ?? "",
      "Annual Performance": ind.annual_performance ?? "",
      "Evidence": ind.evidence || "",
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
        No indicators defined yet. {user && "Click 'Add Indicator' to create one or import from Excel."}
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
              <TableHead>Country</TableHead>
              <TableHead>Activity ID</TableHead>
              <TableHead>Activity</TableHead>
              <TableHead>Long-term Outcome</TableHead>
              <TableHead>Core Indicator</TableHead>
              <TableHead>Workstream</TableHead>
              <TableHead>Indicator Type</TableHead>
              <TableHead>Indicator Name</TableHead>
              <TableHead>NAPHS</TableHead>
              <TableHead>Responsibility</TableHead>
              <TableHead>Organisation</TableHead>
              <TableHead>Cost US$</TableHead>
              <TableHead>Implementing Entity</TableHead>
              <TableHead>Data Source</TableHead>
              <TableHead>Baseline Yr</TableHead>
              <TableHead>Q3</TableHead>
              <TableHead>Target Y1</TableHead>
              <TableHead>Target Y2</TableHead>
              <TableHead>Target Y3</TableHead>
              <TableHead>Year</TableHead>
              <TableHead>Target</TableHead>
              <TableHead>Q1</TableHead>
              <TableHead>Q2</TableHead>
              <TableHead>Q3</TableHead>
              <TableHead>Q4</TableHead>
              <TableHead>Annual Perf.</TableHead>
              <TableHead>Evidence</TableHead>
              {user && <TableHead className="text-right">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {indicators.map((ind) => (
              <TableRow key={ind.id}>
                <TableCell>{ind.country || "-"}</TableCell>
                <TableCell>{ind.activity_id || "-"}</TableCell>
                <TableCell>{ind.activity || "-"}</TableCell>
                <TableCell>{ind.long_term_outcome || "-"}</TableCell>
                <TableCell>{ind.core_indicators || "-"}</TableCell>
                <TableCell>{ind.workstream || "-"}</TableCell>
                <TableCell>{ind.indicator_type || "-"}</TableCell>
                <TableCell className="font-medium">{ind.name}</TableCell>
                <TableCell>{ind.naphs || "-"}</TableCell>
                <TableCell>{ind.responsibility || "-"}</TableCell>
                <TableCell>{ind.organisation || "-"}</TableCell>
                <TableCell>{ind.cost_usd != null ? `$${ind.cost_usd.toLocaleString()}` : "-"}</TableCell>
                <TableCell>{ind.implementing_entity || "-"}</TableCell>
                <TableCell>{ind.data_source || "-"}</TableCell>
                <TableCell>{ind.baseline_proposal_year ?? "-"}</TableCell>
                <TableCell>{ind.quarter_3 ?? "-"}</TableCell>
                <TableCell>{ind.target_year_1 ?? "-"}</TableCell>
                <TableCell>{ind.target_year_2 ?? "-"}</TableCell>
                <TableCell>{ind.target_year_3 ?? "-"}</TableCell>
                <TableCell>{ind.year || "-"}</TableCell>
                <TableCell>{ind.target ?? "-"}</TableCell>
                <TableCell>{ind.q1 ?? "-"}</TableCell>
                <TableCell>{ind.q2 ?? "-"}</TableCell>
                <TableCell>{ind.q3 ?? "-"}</TableCell>
                <TableCell>{ind.q4 ?? "-"}</TableCell>
                <TableCell>{ind.annual_performance ?? "-"}</TableCell>
                <TableCell>
                  {ind.evidence ? (
                    <a href={ind.evidence} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">
                      View <ExternalLink className="h-3 w-3" />
                    </a>
                  ) : "-"}
                </TableCell>
                {user && (
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => setEditingIndicator(ind)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(ind.id)}>
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
