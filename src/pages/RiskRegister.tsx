import { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useTableSort } from "@/components/SortableTableHead";
import { ShieldAlert, Edit, Trash2, Search } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import { Risk, RISK_STATUSES, scoreLevel } from "@/components/risk/risk-types";
import { RiskDialog } from "@/components/risk/RiskDialog";
import { RiskExcelTemplate, RiskExcelUpload } from "@/components/risk/RiskExcel";
import { RiskExcelExport } from "@/components/risk/RiskExcelExport";

const RiskRegister = () => {
  const { user, isAdmin } = useAuth();
  const [risks, setRisks] = useState<Risk[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Risk | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const load = async () => {
    setLoading(true);
    try {
      const data = await api.getRisks();
      setRisks(data as Risk[]);
    } catch (e) {
      console.error(e);
      toast.error("Failed to load risks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleAdd = async (r: Risk) => {
    try {
      const saved = await api.createRisk(r);
      setRisks((prev) => [saved as Risk, ...prev]);
      toast.success("Risk added");
    } catch (e) {
      console.error(e);
      toast.error("Failed to add risk");
    }
  };

  const handleUpdate = async (r: Risk) => {
    try {
      const saved = await api.updateRisk(r.id, r);
      setRisks((prev) => prev.map((x) => (x.id === r.id ? (saved as Risk) : x)));
      toast.success("Risk updated");
    } catch (e) {
      console.error(e);
      toast.error("Failed to update risk");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this risk?")) return;
    try {
      await api.deleteRisk(id);
      setRisks((prev) => prev.filter((r) => r.id !== id));
      toast.success("Risk deleted");
    } catch (e) {
      console.error(e);
      toast.error("Failed to delete risk");
    }
  };

  const handleBulk = async (uploaded: Risk[]) => {
    try {
      const { inserted, errors } = await api.bulkCreateRisks(uploaded);
      setRisks((prev) => [...(inserted as Risk[]), ...prev]);
      if (errors.length) toast.warning(`${inserted.length} added, ${errors.length} failed: ${errors[0].message}`);
      else toast.success(`${inserted.length} risks uploaded`);
    } catch (e) {
      console.error(e);
      toast.error("Bulk upload failed");
    }
  };

  const filtered = useMemo(() => {
    return risks.filter((r) => {
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      if (!search.trim()) return true;
      const s = search.toLowerCase();
      return (
        (r.description || "").toLowerCase().includes(s) ||
        (r.organisation || "").toLowerCase().includes(s) ||
        (r.riskId || "").toLowerCase().includes(s) ||
        (r.owner || "").toLowerCase().includes(s) ||
        (r.mitigation || "").toLowerCase().includes(s)
      );
    });
  }, [risks, search, statusFilter]);

  const { sorted: sortedRisks, SortHead } = useTableSort<Risk>(filtered);

  const stats = useMemo(() => {
    const counts = { total: risks.length, critical: 0, high: 0, medium: 0, low: 0 };
    risks.forEach((r) => {
      const s = (r.likelihood || 0) * (r.impact || 0);
      if (s >= 15) counts.critical++;
      else if (s >= 8) counts.high++;
      else if (s >= 4) counts.medium++;
      else if (s > 0) counts.low++;
    });
    return counts;
  }, [risks]);

  return (
    <div className="min-h-full bg-background">
      <div className="container mx-auto py-8 px-4 sm:px-6 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <ShieldAlert className="h-6 w-6 text-primary" />
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl font-bold text-foreground">Risk Register</h1>
              <p className="text-sm text-muted-foreground mt-0.5">Identify, assess and track programme risks</p>
            </div>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            {user && <RiskDialog onSave={handleAdd} />}
            {isAdmin() && (
              <>
                <RiskExcelExport risks={sortedRisks} />
                <RiskExcelTemplate />
                <RiskExcelUpload onUpload={handleBulk} />
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <StatCard label="Total" value={stats.total} className="bg-muted text-foreground" />
          <StatCard label="Critical" value={stats.critical} className="bg-destructive/10 text-destructive" />
          <StatCard label="High" value={stats.high} className="bg-orange-500/10 text-orange-600" />
          <StatCard label="Medium" value={stats.medium} className="bg-yellow-500/10 text-yellow-700" />
          <StatCard label="Low" value={stats.low} className="bg-primary/10 text-primary" />
        </div>

        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search description, owner, ID..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-48"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  {RISK_STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <p className="text-xs text-muted-foreground">
              Likelihood and Impact are each rated <span className="font-semibold text-primary">1–10</span> — the score is Likelihood × Impact, so it runs from 1 to 100.
            </p>

            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <SortHead sortKey="riskId" className="w-24">Risk ID</SortHead>
                    <SortHead sortKey="organisation" className="w-40">Organisation</SortHead>
                    <SortHead sortKey="description" className="min-w-[240px]">Description</SortHead>
                    <SortHead sortKey="likelihood" className="w-28 text-center">
                      <span className="inline-flex flex-col items-center leading-tight">
                        <span>Likelihood</span>
                        <span className="text-[10px] font-semibold text-primary">scale 1–10</span>
                      </span>
                    </SortHead>
                    <SortHead sortKey="impact" className="w-28 text-center">
                      <span className="inline-flex flex-col items-center leading-tight">
                        <span>Impact</span>
                        <span className="text-[10px] font-semibold text-primary">scale 1–10</span>
                      </span>
                    </SortHead>
                    <SortHead sortKey="riskScore" className="w-28 text-center">Score</SortHead>
                    <SortHead sortKey="mitigation" className="min-w-[200px]">Mitigation</SortHead>
                    <SortHead sortKey="owner" className="w-40">Owner</SortHead>
                    <SortHead sortKey="status" className="w-32">Status</SortHead>
                    <SortHead sortKey="dateIdentified" className="w-32">Identified</SortHead>
                    <TableHead className="w-28 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow><TableCell colSpan={11} className="text-center py-8 text-muted-foreground">Loading...</TableCell></TableRow>
                  ) : sortedRisks.length === 0 ? (
                    <TableRow><TableCell colSpan={11} className="text-center py-8 text-muted-foreground">No risks found</TableCell></TableRow>
                  ) : sortedRisks.map((r) => {
                    const score = (r.likelihood || 0) * (r.impact || 0) || null;
                    const level = scoreLevel(score);
                    return (
                      <TableRow key={r.id}>
                        <TableCell className="font-mono text-xs">{r.riskId || "—"}</TableCell>
                        <TableCell className="text-sm">{r.organisation || "—"}</TableCell>
                        <TableCell className="whitespace-pre-wrap text-sm">{r.description}</TableCell>
                        <TableCell className="text-center">{r.likelihood ?? "—"}</TableCell>
                        <TableCell className="text-center">{r.impact ?? "—"}</TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <span className="font-semibold tabular-nums">{score ?? "—"}</span>
                            {score && <Badge className={`${level.className} text-[10px] px-1.5`}>{level.label}</Badge>}
                          </div>
                        </TableCell>
                        <TableCell className="whitespace-pre-wrap text-sm text-muted-foreground">{r.mitigation || "—"}</TableCell>
                        <TableCell className="text-sm">{r.owner || "—"}</TableCell>
                        <TableCell><Badge variant="outline">{r.status || "Open"}</Badge></TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {r.dateIdentified ? new Date(r.dateIdentified).toLocaleDateString() : "—"}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            {user && (
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => { setEditing(r); setEditOpen(true); }}>
                                <Edit className="h-3.5 w-3.5" />
                              </Button>
                            )}
                            {isAdmin() && (
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive hover:text-destructive" onClick={() => handleDelete(r.id)}>
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      <RiskDialog risk={editing} open={editOpen} onOpenChange={setEditOpen} onSave={handleUpdate} />
    </div>
  );
};

const StatCard = ({ label, value, className }: { label: string; value: number; className: string }) => (
  <div className={`rounded-lg p-4 ${className}`}>
    <div className="text-2xl font-bold tabular-nums">{value}</div>
    <div className="text-xs uppercase tracking-wide opacity-80 mt-1">{label}</div>
  </div>
);

export default RiskRegister;
