import { useEffect, useMemo, useState } from "react";
import { api } from "@/services/api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pencil, Trash2, Loader2, ExternalLink, Download, Search, X } from "lucide-react";
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
  target_year_4: number | null;
  target_year_5: number | null;
  target_year_6: number | null;
}

interface IndicatorsTabProps {
  onUpdate?: () => void;
}

export function IndicatorsTab({ onUpdate }: IndicatorsTabProps) {
  const { user } = useAuth();
  const [indicators, setIndicators] = useState<Indicator[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingIndicator, setEditingIndicator] = useState<Indicator | null>(null);

  // Filter state
  const [searchText, setSearchText] = useState("");
  const [filterCountry, setFilterCountry] = useState("all");
  const [filterWorkstream, setFilterWorkstream] = useState("all");
  const [filterIndicatorType, setFilterIndicatorType] = useState("all");
  const [filterActivityId, setFilterActivityId] = useState("all");
  const [filterDeliveryPartner, setFilterDeliveryPartner] = useState("all");
  const [filterImplementingEntity, setFilterImplementingEntity] = useState("all");
  const [filterYear, setFilterYear] = useState("all");
  const [filterActivity, setFilterActivity] = useState("all");

  const fetchIndicators = async () => {
    try {
      const data = await api.getIndicators();
      setIndicators(data || []);
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

  // Unique filter options
  const filterOptions = useMemo(() => {
    const unique = (arr: (string | null | undefined)[]) =>
      [...new Set(arr.filter(Boolean))].sort() as string[];
    return {
      countries: unique(indicators.map(i => i.country)),
      workstreams: unique(indicators.map(i => i.workstream)),
      indicatorTypes: unique(indicators.map(i => i.indicator_type)),
      activityIds: unique(indicators.map(i => i.activity_id)),
      deliveryPartners: unique(indicators.map(i => i.organisation)),
      implementingEntities: unique(indicators.map(i => i.implementing_entity)),
      years: unique(indicators.map(i => i.year?.toString())),
      activities: unique(indicators.map(i => i.activity)),
    };
  }, [indicators]);

  // Filtered indicators
  const filteredIndicators = useMemo(() => {
    return indicators.filter(ind => {
      if (filterCountry !== "all" && ind.country !== filterCountry) return false;
      if (filterWorkstream !== "all" && ind.workstream !== filterWorkstream) return false;
      if (filterIndicatorType !== "all" && ind.indicator_type !== filterIndicatorType) return false;
      if (filterActivityId !== "all" && ind.activity_id !== filterActivityId) return false;
      if (filterDeliveryPartner !== "all" && ind.organisation !== filterDeliveryPartner) return false;
      if (filterImplementingEntity !== "all" && ind.implementing_entity !== filterImplementingEntity) return false;
      if (filterYear !== "all" && ind.year?.toString() !== filterYear) return false;
      if (filterActivity !== "all" && ind.activity !== filterActivity) return false;
      if (searchText) {
        const search = searchText.toLowerCase();
        return (
          ind.name?.toLowerCase().includes(search) ||
          ind.activity?.toLowerCase().includes(search) ||
          ind.indicator_definition?.toLowerCase().includes(search) ||
          ind.country?.toLowerCase().includes(search) ||
          ind.activity_id?.toLowerCase().includes(search) ||
          ind.organisation?.toLowerCase().includes(search) ||
          ind.implementing_entity?.toLowerCase().includes(search)
        );
      }
      return true;
    });
  }, [indicators, searchText, filterCountry, filterWorkstream, filterIndicatorType, filterActivityId, filterDeliveryPartner, filterImplementingEntity, filterYear, filterActivity]);

  const hasActiveFilters = searchText || filterCountry !== "all" || filterWorkstream !== "all" || filterIndicatorType !== "all" || filterActivityId !== "all" || filterDeliveryPartner !== "all" || filterImplementingEntity !== "all" || filterYear !== "all" || filterActivity !== "all";

  const clearFilters = () => {
    setSearchText("");
    setFilterCountry("all");
    setFilterWorkstream("all");
    setFilterIndicatorType("all");
    setFilterActivityId("all");
    setFilterDeliveryPartner("all");
    setFilterImplementingEntity("all");
    setFilterYear("all");
    setFilterActivity("all");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this indicator?")) return;
    try {
      await api.deleteIndicator(id);
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
    if (filteredIndicators.length === 0) {
      toast.error("No indicators to export");
      return;
    }

    const excelData = filteredIndicators.map(ind => ({
      "Country": ind.country || "",
      "Activity ID": ind.activity_id || "",
      "Activity": ind.activity || "",
      "Long-term Outcome": ind.long_term_outcome || "",
      "Core Indicator": ind.core_indicators || "",
      "Workstream": ind.workstream || "",
      "Indicator Type": ind.indicator_type || "",
      "Indicator Name": ind.name,
      "Indicator Definition": ind.indicator_definition || "",
      "NAPHS (Yes/No)": ind.naphs || "",
      "Responsibility for Implementation": ind.responsibility || "",
      "Delivery Partner": ind.organisation || "",
      "Implementing Entity": ind.implementing_entity || "",
      "Data Source": ind.data_source || "",
      "Cost US$": ind.cost_usd ?? "",
      "Baseline Proposal Year": ind.baseline_proposal_year ?? "",
      "Target Year 1": ind.target_year_1 ?? "",
      "Target Year 2": ind.target_year_2 ?? "",
      "Target Year 3": ind.target_year_3 ?? "",
      "Target Year 4": ind.target_year_4 ?? "",
      "Target Year 5": ind.target_year_5 ?? "",
      "Target Year 6": ind.target_year_6 ?? "",
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
    toast.success(`Exported ${filteredIndicators.length} indicators successfully`);
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
      {/* Filters */}
      <div className="space-y-3 mb-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search indicators..."
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={filterCountry} onValueChange={setFilterCountry}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Country" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Countries</SelectItem>
              {filterOptions.countries.map(c => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterWorkstream} onValueChange={setFilterWorkstream}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Workstream" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Workstreams</SelectItem>
              {filterOptions.workstreams.map(w => (
                <SelectItem key={w} value={w}>{w}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterIndicatorType} onValueChange={setFilterIndicatorType}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Indicator Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {filterOptions.indicatorTypes.map(t => (
                <SelectItem key={t} value={t}>{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterActivityId} onValueChange={setFilterActivityId}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Activity ID" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Activities</SelectItem>
              {filterOptions.activityIds.map(a => (
                <SelectItem key={a} value={a}>{a}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1">
              <X className="h-4 w-4" /> Clear
            </Button>
          )}
        </div>
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {filteredIndicators.length} of {indicators.length} indicators
            {hasActiveFilters && " (filtered)"}
          </p>
          <Button onClick={handleExport} variant="default" className="gap-2">
            <Download className="h-4 w-4" />
            Export {hasActiveFilters ? "Filtered" : "All"} ({filteredIndicators.length})
          </Button>
        </div>
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
              <TableHead>Indicator Definition</TableHead>
              <TableHead>NAPHS (Yes/No)</TableHead>
              <TableHead>Responsibility</TableHead>
              <TableHead>Delivery Partner</TableHead>
              <TableHead>Implementing Entity</TableHead>
              <TableHead>Data Source</TableHead>
              <TableHead>Cost US$</TableHead>
              <TableHead>Baseline Yr</TableHead>
              <TableHead>Target Y1</TableHead>
              <TableHead>Target Y2</TableHead>
              <TableHead>Target Y3</TableHead>
              <TableHead>Target Y4</TableHead>
              <TableHead>Target Y5</TableHead>
              <TableHead>Target Y6</TableHead>
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
            {filteredIndicators.length === 0 ? (
              <TableRow>
                <TableCell colSpan={31} className="text-center py-8 text-muted-foreground">
                  No indicators match the current filters.
                </TableCell>
              </TableRow>
            ) : (
              filteredIndicators.map((ind) => (
                <TableRow key={ind.id}>
                  <TableCell>{ind.country || "-"}</TableCell>
                  <TableCell>{ind.activity_id || "-"}</TableCell>
                  <TableCell>{ind.activity || "-"}</TableCell>
                  <TableCell>{ind.long_term_outcome || "-"}</TableCell>
                  <TableCell>{ind.core_indicators || "-"}</TableCell>
                  <TableCell>{ind.workstream || "-"}</TableCell>
                  <TableCell>{ind.indicator_type || "-"}</TableCell>
                  <TableCell className="font-medium">{ind.name}</TableCell>
                  <TableCell>{ind.indicator_definition || "-"}</TableCell>
                  <TableCell>{ind.naphs || "-"}</TableCell>
                  <TableCell>{ind.responsibility || "-"}</TableCell>
                  <TableCell>{ind.organisation || "-"}</TableCell>
                  <TableCell>{ind.implementing_entity || "-"}</TableCell>
                  <TableCell>{ind.data_source || "-"}</TableCell>
                  <TableCell>{ind.cost_usd != null ? `$${ind.cost_usd.toLocaleString()}` : "-"}</TableCell>
                  <TableCell>{ind.baseline_proposal_year ?? "-"}</TableCell>
                  <TableCell>{ind.target_year_1 ?? "-"}</TableCell>
                  <TableCell>{ind.target_year_2 ?? "-"}</TableCell>
                  <TableCell>{ind.target_year_3 ?? "-"}</TableCell>
                  <TableCell>{ind.target_year_4 ?? "-"}</TableCell>
                  <TableCell>{ind.target_year_5 ?? "-"}</TableCell>
                  <TableCell>{ind.target_year_6 ?? "-"}</TableCell>
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
              ))
            )}
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
