import { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useTableSort } from "@/components/SortableTableHead";
import { ClipboardList, Edit, Trash2, Search } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/services/api";
import { MEActivity, ME_STATUSES } from "@/components/me-activity/me-activity-types";
import { MEActivityDialog } from "@/components/me-activity/MEActivityDialog";

const fmtDate = (d?: string | null) => (d ? new Date(d).toLocaleDateString() : "—");

const MEActivityTracker = () => {
  const [rows, setRows] = useState<MEActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<MEActivity | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const load = async () => {
    setLoading(true);
    try {
      setRows((await api.getMEActivities()) as MEActivity[]);
    } catch (e) {
      console.error(e);
      toast.error("Failed to load M&E activities");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleAdd = async (r: MEActivity) => {
    try {
      const saved = await api.createMEActivity(r);
      setRows((prev) => [saved as MEActivity, ...prev]);
      toast.success("Record added");
    } catch (e) {
      console.error(e);
      toast.error("Failed to add record");
    }
  };

  const handleUpdate = async (r: MEActivity) => {
    try {
      const saved = await api.updateMEActivity(r.id, r);
      setRows((prev) => prev.map((x) => (x.id === r.id ? (saved as MEActivity) : x)));
      toast.success("Record updated");
    } catch (e) {
      console.error(e);
      toast.error("Failed to update record");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this record?")) return;
    try {
      await api.deleteMEActivity(id);
      setRows((prev) => prev.filter((r) => r.id !== id));
      toast.success("Record deleted");
    } catch (e) {
      console.error(e);
      toast.error("Failed to delete record");
    }
  };

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      if (!search.trim()) return true;
      const s = search.toLowerCase();
      return [
        r.activity, r.keyProjectActivity, r.subActivities, r.task, r.indicator,
        r.responsible, r.implementingEntity, r.deliveryPartner, r.outputs, r.comments,
      ].some((v) => (v || "").toLowerCase().includes(s));
    });
  }, [rows, search, statusFilter]);

  const { sorted: sortedRows, SortHead } = useTableSort<MEActivity>(filtered);

  return (
    <div className="min-h-full bg-background">
      <div className="container mx-auto py-8 px-4 sm:px-6 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <ClipboardList className="h-6 w-6 text-primary" />
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl font-bold text-foreground">M&amp;E Activity Tracker</h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                Detailed tasks, outputs and performance against targets
              </p>
            </div>
          </div>
          <MEActivityDialog onSave={handleAdd} />
        </div>

        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search activity, task, indicator, responsible..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-52"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  {ME_STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <SortHead sortKey="activity" className="min-w-[200px]">Activity</SortHead>
                    <SortHead sortKey="implementingEntity" className="min-w-[160px]">Implementing Entity</SortHead>
                    <SortHead sortKey="deliveryPartner" className="min-w-[160px]">Delivery Partner</SortHead>
                    <SortHead sortKey="responsible" className="min-w-[140px]">Responsible</SortHead>
                    <SortHead sortKey="keyProjectActivity" className="min-w-[200px]">Key Project Activity</SortHead>
                    <SortHead sortKey="subActivityNo" className="w-24">Sub-Act #</SortHead>
                    <SortHead sortKey="subActivities" className="min-w-[200px]">Sub-Activities</SortHead>
                    <SortHead sortKey="inputsResources" className="min-w-[180px]">Inputs / Resources</SortHead>
                    <SortHead sortKey="taskNo" className="w-20">Task #</SortHead>
                    <SortHead sortKey="task" className="min-w-[180px]">Task</SortHead>
                    <SortHead sortKey="status" className="w-36">Status</SortHead>
                    <SortHead sortKey="startDate" className="w-28">Start</SortHead>
                    <SortHead sortKey="endDate" className="w-28">End</SortHead>
                    <SortHead sortKey="outputs" className="min-w-[180px]">Outputs</SortHead>
                    <SortHead sortKey="indicator" className="min-w-[180px]">Indicator</SortHead>
                    <SortHead sortKey="baseline" className="w-24">Baseline</SortHead>
                    <SortHead sortKey="target" className="w-24">Target</SortHead>
                    <SortHead sortKey="achieved" className="w-24">Achieved</SortHead>
                    <SortHead sortKey="variance" className="w-24">Variance</SortHead>
                    <SortHead sortKey="meansOfVerification" className="min-w-[180px]">Means of Verification</SortHead>
                    <SortHead sortKey="deliveryPartnerResponsible" className="min-w-[200px]">Delivery Partner Responsible</SortHead>
                    <SortHead sortKey="comments" className="min-w-[180px]">Comments</SortHead>
                    <TableHead className="w-24 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow><TableCell colSpan={23} className="text-center py-8 text-muted-foreground">Loading...</TableCell></TableRow>
                  ) : filtered.length === 0 ? (
                    <TableRow><TableCell colSpan={23} className="text-center py-8 text-muted-foreground">No records found</TableCell></TableRow>
                  ) : filtered.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="text-sm whitespace-pre-wrap">{r.activity || "—"}</TableCell>
                      <TableCell className="text-sm">{r.implementingEntity || "—"}</TableCell>
                      <TableCell className="text-sm">{r.deliveryPartner || "—"}</TableCell>
                      <TableCell className="text-sm">{r.responsible || "—"}</TableCell>
                      <TableCell className="text-sm whitespace-pre-wrap">{r.keyProjectActivity || "—"}</TableCell>
                      <TableCell className="font-mono text-xs">{r.subActivityNo || "—"}</TableCell>
                      <TableCell className="text-sm whitespace-pre-wrap">{r.subActivities || "—"}</TableCell>
                      <TableCell className="text-sm text-muted-foreground whitespace-pre-wrap">{r.inputsResources || "—"}</TableCell>
                      <TableCell className="font-mono text-xs">{r.taskNo || "—"}</TableCell>
                      <TableCell className="text-sm whitespace-pre-wrap">{r.task || "—"}</TableCell>
                      <TableCell><Badge variant="outline">{r.status || "Not Yet Started"}</Badge></TableCell>
                      <TableCell className="text-xs text-muted-foreground">{fmtDate(r.startDate)}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{fmtDate(r.endDate)}</TableCell>
                      <TableCell className="text-sm whitespace-pre-wrap">{r.outputs || "—"}</TableCell>
                      <TableCell className="text-sm whitespace-pre-wrap">{r.indicator || "—"}</TableCell>
                      <TableCell className="text-sm tabular-nums">{r.baseline || "—"}</TableCell>
                      <TableCell className="text-sm tabular-nums">{r.target || "—"}</TableCell>
                      <TableCell className="text-sm tabular-nums">{r.achieved || "—"}</TableCell>
                      <TableCell className="text-sm tabular-nums font-medium">{r.variance || "—"}</TableCell>
                      <TableCell className="text-sm whitespace-pre-wrap">{r.meansOfVerification || "—"}</TableCell>
                      <TableCell className="text-sm">{r.deliveryPartnerResponsible || "—"}</TableCell>
                      <TableCell className="text-sm text-muted-foreground whitespace-pre-wrap">{r.comments || "—"}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => { setEditing(r); setEditOpen(true); }}>
                            <Edit className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive hover:text-destructive" onClick={() => handleDelete(r.id)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      <MEActivityDialog record={editing} open={editOpen} onOpenChange={setEditOpen} onSave={handleUpdate} />
    </div>
  );
};

export default MEActivityTracker;
