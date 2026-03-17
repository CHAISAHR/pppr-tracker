import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/services/api";
import { Settings, Plus, Edit2, Trash2, Activity, TrendingUp, Calendar, Search } from "lucide-react";

// ============= Activities Admin Tab =============
function ActivitiesAdmin() {
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [search, setSearch] = useState("");
  const { toast } = useToast();

  const [form, setForm] = useState({
    activityId: "", subActivityId: "", activityDescription: "", subActivityDescription: "",
    implementingEntity: "", deliveryPartner: "", status: "Pending", startDate: "", endDate: "", comments: ""
  });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const data = await api.getProjects();
      setActivities(data);
    } catch { toast({ title: "Error", description: "Failed to load activities", variant: "destructive" }); }
    finally { setLoading(false); }
  };

  const openCreate = () => {
    setEditingItem(null);
    setForm({ activityId: "", subActivityId: "", activityDescription: "", subActivityDescription: "", implementingEntity: "", deliveryPartner: "", status: "Pending", startDate: "", endDate: "", comments: "" });
    setDialogOpen(true);
  };

  const openEdit = (item: any) => {
    setEditingItem(item);
    setForm({
      activityId: item.activityId || "", subActivityId: item.subActivityId || "",
      activityDescription: item.activityDescription || "", subActivityDescription: item.subActivityDescription || "",
      implementingEntity: item.implementingEntity || "", deliveryPartner: item.deliveryPartner || "",
      status: item.status || "Pending", startDate: item.startDate || "", endDate: item.endDate || "", comments: item.comments || ""
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      if (editingItem) {
        await api.updateProject(editingItem.id, form);
        setActivities(prev => prev.map(a => a.id === editingItem.id ? { ...a, ...form } : a));
        toast({ title: "Success", description: "Activity updated" });
      } else {
        const created = await api.createProject(form);
        setActivities(prev => [created, ...prev]);
        toast({ title: "Success", description: "Activity created" });
      }
      setDialogOpen(false);
    } catch { toast({ title: "Error", description: "Failed to save activity", variant: "destructive" }); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this activity?")) return;
    try {
      await api.deleteProject(id);
      setActivities(prev => prev.filter(a => a.id !== id));
      toast({ title: "Success", description: "Activity deleted" });
    } catch { toast({ title: "Error", description: "Failed to delete activity", variant: "destructive" }); }
  };

  const filtered = activities.filter(a =>
    !search || Object.values(a).some(v => String(v).toLowerCase().includes(search.toLowerCase()))
  );

  if (loading) return <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search activities..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Button onClick={openCreate} className="gap-2"><Plus className="h-4 w-4" />Add Activity</Button>
      </div>

      <div className="rounded-lg border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Activity ID</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Implementing Entity</TableHead>
              <TableHead>Delivery Partner</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Dates</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No activities found</TableCell></TableRow>
            ) : filtered.map(item => (
              <TableRow key={item.id} className="hover:bg-primary/5">
                <TableCell className="font-medium">{item.activityId}</TableCell>
                <TableCell className="max-w-[200px] truncate">{item.activityDescription}</TableCell>
                <TableCell>{item.implementingEntity}</TableCell>
                <TableCell>{item.deliveryPartner}</TableCell>
                <TableCell>
                  <Badge variant={item.status === "Completed" ? "default" : item.status === "In Progress" ? "secondary" : "outline"}>
                    {item.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{item.startDate} — {item.endDate}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => openEdit(item)}><Edit2 className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(item.id)} className="hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingItem ? "Edit Activity" : "Create Activity"}</DialogTitle>
            <DialogDescription>Fill in the activity details below</DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            <div className="grid grid-cols-2 gap-4 p-1">
              <div><Label>Activity ID</Label><Input value={form.activityId} onChange={e => setForm({...form, activityId: e.target.value})} /></div>
              <div><Label>Sub-Activity ID</Label><Input value={form.subActivityId} onChange={e => setForm({...form, subActivityId: e.target.value})} /></div>
              <div className="col-span-2"><Label>Activity Description</Label><Input value={form.activityDescription} onChange={e => setForm({...form, activityDescription: e.target.value})} /></div>
              <div className="col-span-2"><Label>Sub-Activity Description</Label><Input value={form.subActivityDescription} onChange={e => setForm({...form, subActivityDescription: e.target.value})} /></div>
              <div><Label>Implementing Entity</Label><Input value={form.implementingEntity} onChange={e => setForm({...form, implementingEntity: e.target.value})} /></div>
              <div><Label>Delivery Partner</Label><Input value={form.deliveryPartner} onChange={e => setForm({...form, deliveryPartner: e.target.value})} /></div>
              <div>
                <Label>Status</Label>
                <Select value={form.status} onValueChange={v => setForm({...form, status: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Start Date</Label><Input type="date" value={form.startDate} onChange={e => setForm({...form, startDate: e.target.value})} /></div>
              <div><Label>End Date</Label><Input type="date" value={form.endDate} onChange={e => setForm({...form, endDate: e.target.value})} /></div>
              <div className="col-span-2"><Label>Comments</Label><Textarea value={form.comments} onChange={e => setForm({...form, comments: e.target.value})} /></div>
            </div>
          </ScrollArea>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>{editingItem ? "Update" : "Create"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ============= Indicators Admin Tab =============
function IndicatorsAdmin() {
  const [indicators, setIndicators] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [search, setSearch] = useState("");
  const { toast } = useToast();

  const [form, setForm] = useState({
    name: "", unit: "", country: "", activity: "", activity_id: "", workstream: "", organisation: "",
    indicator_type: "", indicator_definition: "", long_term_outcome: "", core_indicators: "",
    naphs: "", responsibility: "", cost_usd: "", implementing_entity: "", data_source: "",
    baseline_proposal_year: "", target_year_1: "", target_year_2: "", target_year_3: "",
    q1: "", q2: "", q3: "", q4: "", evidence: ""
  });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const data = await api.getIndicators();
      setIndicators(data);
    } catch { toast({ title: "Error", description: "Failed to load indicators", variant: "destructive" }); }
    finally { setLoading(false); }
  };

  const openCreate = () => {
    setEditingItem(null);
    setForm({ name: "", unit: "", country: "", activity: "", activity_id: "", workstream: "", organisation: "",
      indicator_type: "", indicator_definition: "", long_term_outcome: "", core_indicators: "",
      naphs: "", responsibility: "", cost_usd: "", implementing_entity: "", data_source: "",
      baseline_proposal_year: "", target_year_1: "", target_year_2: "", target_year_3: "",
      q1: "", q2: "", q3: "", q4: "", evidence: "" });
    setDialogOpen(true);
  };

  const openEdit = (item: any) => {
    setEditingItem(item);
    setForm({
      name: item.name || "", unit: item.unit || "", country: item.country || "",
      activity: item.activity || "", activity_id: item.activity_id || "", workstream: item.workstream || "",
      organisation: item.organisation || "", indicator_type: item.indicator_type || "",
      indicator_definition: item.indicator_definition || "", long_term_outcome: item.long_term_outcome || "",
      core_indicators: item.core_indicators || "", naphs: item.naphs || "",
      responsibility: item.responsibility || "", cost_usd: String(item.cost_usd ?? ""),
      implementing_entity: item.implementing_entity || "", data_source: item.data_source || "",
      baseline_proposal_year: String(item.baseline_proposal_year ?? ""),
      target_year_1: String(item.target_year_1 ?? ""), target_year_2: String(item.target_year_2 ?? ""),
      target_year_3: String(item.target_year_3 ?? ""),
      q1: String(item.q1 ?? ""), q2: String(item.q2 ?? ""), q3: String(item.q3 ?? ""), q4: String(item.q4 ?? ""),
      evidence: item.evidence || ""
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.unit) {
      toast({ title: "Validation", description: "Name and Unit are required", variant: "destructive" });
      return;
    }
    const payload = {
      ...form,
      cost_usd: form.cost_usd ? Number(form.cost_usd) : null,
      baseline_proposal_year: form.baseline_proposal_year ? Number(form.baseline_proposal_year) : null,
      target_year_1: form.target_year_1 ? Number(form.target_year_1) : null,
      target_year_2: form.target_year_2 ? Number(form.target_year_2) : null,
      target_year_3: form.target_year_3 ? Number(form.target_year_3) : null,
      q1: form.q1 ? Number(form.q1) : null, q2: form.q2 ? Number(form.q2) : null,
      q3: form.q3 ? Number(form.q3) : null, q4: form.q4 ? Number(form.q4) : null,
    };
    try {
      if (editingItem) {
        await api.updateIndicator(editingItem.id, payload);
        setIndicators(prev => prev.map(i => i.id === editingItem.id ? { ...i, ...payload } : i));
        toast({ title: "Success", description: "Indicator updated" });
      } else {
        const created = await api.createIndicator(payload);
        setIndicators(prev => [created, ...prev]);
        toast({ title: "Success", description: "Indicator created" });
      }
      setDialogOpen(false);
    } catch { toast({ title: "Error", description: "Failed to save indicator", variant: "destructive" }); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this indicator?")) return;
    try {
      await api.deleteIndicator(id);
      setIndicators(prev => prev.filter(i => i.id !== id));
      toast({ title: "Success", description: "Indicator deleted" });
    } catch { toast({ title: "Error", description: "Failed to delete indicator", variant: "destructive" }); }
  };

  const filtered = indicators.filter(i =>
    !search || [i.name, i.country, i.workstream, i.organisation, i.activity].some(v => String(v || "").toLowerCase().includes(search.toLowerCase()))
  );

  if (loading) return <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search indicators..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Button onClick={openCreate} className="gap-2"><Plus className="h-4 w-4" />Add Indicator</Button>
      </div>

      <div className="rounded-lg border bg-card overflow-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Country</TableHead>
              <TableHead>Indicator Name</TableHead>
              <TableHead>Organisation</TableHead>
              <TableHead>Workstream</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Unit</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No indicators found</TableCell></TableRow>
            ) : filtered.map(item => (
              <TableRow key={item.id} className="hover:bg-primary/5">
                <TableCell>{item.country || "-"}</TableCell>
                <TableCell className="font-medium max-w-[200px] truncate">{item.name}</TableCell>
                <TableCell>{item.organisation || "-"}</TableCell>
                <TableCell>{item.workstream || "-"}</TableCell>
                <TableCell><Badge variant="outline">{item.indicator_type || "-"}</Badge></TableCell>
                <TableCell>{item.unit}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => openEdit(item)}><Edit2 className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(item.id)} className="hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{editingItem ? "Edit Indicator" : "Create Indicator"}</DialogTitle>
            <DialogDescription>Fill in the indicator details</DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            <div className="grid grid-cols-2 gap-4 p-1">
              <div><Label>Country</Label><Input value={form.country} onChange={e => setForm({...form, country: e.target.value})} /></div>
              <div><Label>Activity ID</Label><Input value={form.activity_id} onChange={e => setForm({...form, activity_id: e.target.value})} /></div>
              <div className="col-span-2"><Label>Activity</Label><Input value={form.activity} onChange={e => setForm({...form, activity: e.target.value})} /></div>
              <div className="col-span-2"><Label>Long-term Outcome</Label><Input value={form.long_term_outcome} onChange={e => setForm({...form, long_term_outcome: e.target.value})} /></div>
              <div><Label>Core Indicators</Label><Input value={form.core_indicators} onChange={e => setForm({...form, core_indicators: e.target.value})} /></div>
              <div><Label>Workstream</Label><Input value={form.workstream} onChange={e => setForm({...form, workstream: e.target.value})} /></div>
              <div><Label>Indicator Type</Label><Input value={form.indicator_type} onChange={e => setForm({...form, indicator_type: e.target.value})} /></div>
              <div><Label>Indicator Name *</Label><Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} /></div>
              <div className="col-span-2"><Label>Indicator Definition</Label><Textarea value={form.indicator_definition} onChange={e => setForm({...form, indicator_definition: e.target.value})} /></div>
              <div><Label>Unit *</Label><Input value={form.unit} onChange={e => setForm({...form, unit: e.target.value})} /></div>
              <div>
                <Label>NAPHS</Label>
                <Select value={form.naphs} onValueChange={v => setForm({...form, naphs: v})}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent><SelectItem value="Yes">Yes</SelectItem><SelectItem value="No">No</SelectItem></SelectContent>
                </Select>
              </div>
              <div><Label>Responsibility</Label><Input value={form.responsibility} onChange={e => setForm({...form, responsibility: e.target.value})} /></div>
              <div><Label>Organisation</Label><Input value={form.organisation} onChange={e => setForm({...form, organisation: e.target.value})} /></div>
              <div><Label>Cost (USD)</Label><Input type="number" value={form.cost_usd} onChange={e => setForm({...form, cost_usd: e.target.value})} /></div>
              <div><Label>Implementing Entity</Label><Input value={form.implementing_entity} onChange={e => setForm({...form, implementing_entity: e.target.value})} /></div>
              <div><Label>Data Source</Label><Input value={form.data_source} onChange={e => setForm({...form, data_source: e.target.value})} /></div>
              <div><Label>Baseline Proposal Year</Label><Input type="number" value={form.baseline_proposal_year} onChange={e => setForm({...form, baseline_proposal_year: e.target.value})} /></div>
              <div><Label>Target Year 1</Label><Input type="number" value={form.target_year_1} onChange={e => setForm({...form, target_year_1: e.target.value})} /></div>
              <div><Label>Target Year 2</Label><Input type="number" value={form.target_year_2} onChange={e => setForm({...form, target_year_2: e.target.value})} /></div>
              <div><Label>Target Year 3</Label><Input type="number" value={form.target_year_3} onChange={e => setForm({...form, target_year_3: e.target.value})} /></div>
              <div><Label>Q1</Label><Input type="number" value={form.q1} onChange={e => setForm({...form, q1: e.target.value})} /></div>
              <div><Label>Q2</Label><Input type="number" value={form.q2} onChange={e => setForm({...form, q2: e.target.value})} /></div>
              <div><Label>Q3</Label><Input type="number" value={form.q3} onChange={e => setForm({...form, q3: e.target.value})} /></div>
              <div><Label>Q4</Label><Input type="number" value={form.q4} onChange={e => setForm({...form, q4: e.target.value})} /></div>
              <div className="col-span-2"><Label>Evidence URL</Label><Input value={form.evidence} onChange={e => setForm({...form, evidence: e.target.value})} /></div>
            </div>
          </ScrollArea>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>{editingItem ? "Update" : "Create"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ============= Meetings Admin Tab =============
function MeetingsAdmin() {
  const [meetings, setMeetings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [search, setSearch] = useState("");
  const { toast } = useToast();

  const [form, setForm] = useState({
    quarter: "", meetingDate: "", focusArea: "", implementingEntities: "",
    deliveryPartners: "", keyObjectives: "", format: "Virtual",
    organizerName: "", organizerEmail: "", organizerPhone: "",
    preSurveyLink: "", postSurveyLink: ""
  });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const data = await api.getMeetings();
      setMeetings(data);
    } catch { toast({ title: "Error", description: "Failed to load meetings", variant: "destructive" }); }
    finally { setLoading(false); }
  };

  const openCreate = () => {
    setEditingItem(null);
    setForm({ quarter: "", meetingDate: "", focusArea: "", implementingEntities: "", deliveryPartners: "", keyObjectives: "", format: "Virtual", organizerName: "", organizerEmail: "", organizerPhone: "", preSurveyLink: "", postSurveyLink: "" });
    setDialogOpen(true);
  };

  const openEdit = (item: any) => {
    setEditingItem(item);
    setForm({
      quarter: item.quarter || "", meetingDate: item.meetingDate || "", focusArea: item.focusArea || "",
      implementingEntities: Array.isArray(item.implementingEntities) ? item.implementingEntities.join(", ") : item.implementingEntities || "",
      deliveryPartners: Array.isArray(item.deliveryPartners) ? item.deliveryPartners.join(", ") : item.deliveryPartners || "",
      keyObjectives: item.keyObjectives || "", format: item.format || "Virtual",
      organizerName: item.organizerName || "", organizerEmail: item.organizerEmail || "",
      organizerPhone: item.organizerPhone || "", preSurveyLink: item.preSurveyLink || "",
      postSurveyLink: item.postSurveyLink || ""
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    const payload = {
      ...form,
      implementingEntities: form.implementingEntities.split(",").map(s => s.trim()).filter(Boolean),
      deliveryPartners: form.deliveryPartners.split(",").map(s => s.trim()).filter(Boolean),
    };
    try {
      if (editingItem) {
        await api.updateMeeting(editingItem.id, payload);
        setMeetings(prev => prev.map(m => m.id === editingItem.id ? { ...m, ...payload } : m));
        toast({ title: "Success", description: "Meeting updated" });
      } else {
        const created = await api.createMeeting(payload);
        setMeetings(prev => [created, ...prev]);
        toast({ title: "Success", description: "Meeting created" });
      }
      setDialogOpen(false);
    } catch { toast({ title: "Error", description: "Failed to save meeting", variant: "destructive" }); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this meeting?")) return;
    try {
      await api.deleteMeeting(id);
      setMeetings(prev => prev.filter(m => m.id !== id));
      toast({ title: "Success", description: "Meeting deleted" });
    } catch { toast({ title: "Error", description: "Failed to delete meeting", variant: "destructive" }); }
  };

  const filtered = meetings.filter(m =>
    !search || [m.focusArea, m.quarter, m.format].some(v => String(v || "").toLowerCase().includes(search.toLowerCase()))
  );

  if (loading) return <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search meetings..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Button onClick={openCreate} className="gap-2"><Plus className="h-4 w-4" />Add Meeting</Button>
      </div>

      <div className="rounded-lg border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Quarter</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Focus Area</TableHead>
              <TableHead>Format</TableHead>
              <TableHead>Organizer</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No meetings found</TableCell></TableRow>
            ) : filtered.map(item => (
              <TableRow key={item.id} className="hover:bg-primary/5">
                <TableCell>{item.quarter || "-"}</TableCell>
                <TableCell>{item.meetingDate ? new Date(item.meetingDate).toLocaleDateString() : "-"}</TableCell>
                <TableCell className="font-medium max-w-[200px] truncate">{item.focusArea}</TableCell>
                <TableCell><Badge variant={item.format === "Virtual" ? "secondary" : "default"}>{item.format}</Badge></TableCell>
                <TableCell>{item.organizerName || "-"}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => openEdit(item)}><Edit2 className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(item.id)} className="hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingItem ? "Edit Meeting" : "Create Meeting"}</DialogTitle>
            <DialogDescription>Fill in the meeting details</DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            <div className="grid grid-cols-2 gap-4 p-1">
              <div><Label>Quarter</Label><Input value={form.quarter} onChange={e => setForm({...form, quarter: e.target.value})} placeholder="e.g. Q1 2025" /></div>
              <div><Label>Meeting Date</Label><Input type="date" value={form.meetingDate} onChange={e => setForm({...form, meetingDate: e.target.value})} /></div>
              <div className="col-span-2"><Label>Focus Area</Label><Input value={form.focusArea} onChange={e => setForm({...form, focusArea: e.target.value})} /></div>
              <div className="col-span-2"><Label>Implementing Entities (comma-separated)</Label><Input value={form.implementingEntities} onChange={e => setForm({...form, implementingEntities: e.target.value})} /></div>
              <div className="col-span-2"><Label>Delivery Partners (comma-separated)</Label><Input value={form.deliveryPartners} onChange={e => setForm({...form, deliveryPartners: e.target.value})} /></div>
              <div className="col-span-2"><Label>Key Objectives</Label><Textarea value={form.keyObjectives} onChange={e => setForm({...form, keyObjectives: e.target.value})} /></div>
              <div>
                <Label>Format</Label>
                <Select value={form.format} onValueChange={v => setForm({...form, format: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Virtual">Virtual</SelectItem>
                    <SelectItem value="Hybrid">Hybrid</SelectItem>
                    <SelectItem value="In-person">In-person</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Organizer Name</Label><Input value={form.organizerName} onChange={e => setForm({...form, organizerName: e.target.value})} /></div>
              <div><Label>Organizer Email</Label><Input type="email" value={form.organizerEmail} onChange={e => setForm({...form, organizerEmail: e.target.value})} /></div>
              <div><Label>Organizer Phone</Label><Input value={form.organizerPhone} onChange={e => setForm({...form, organizerPhone: e.target.value})} /></div>
              <div><Label>Pre-Survey Link</Label><Input value={form.preSurveyLink} onChange={e => setForm({...form, preSurveyLink: e.target.value})} /></div>
              <div><Label>Post-Survey Link</Label><Input value={form.postSurveyLink} onChange={e => setForm({...form, postSurveyLink: e.target.value})} /></div>
            </div>
          </ScrollArea>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>{editingItem ? "Update" : "Create"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ============= Main Administration Page =============
export default function Administration() {
  const { isAdmin } = useAuth();

  if (!isAdmin()) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>You don't have permission to view this page. Only administrators can access the Administration module.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4 space-y-6">
      <div className="flex items-center gap-3">
        <Settings className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold text-foreground">Administration</h1>
          <p className="text-muted-foreground">Create, update, and delete records across all modules</p>
        </div>
      </div>

      <Tabs defaultValue="activities" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="activities" className="gap-2">
            <Activity className="h-4 w-4" />
            Activities
          </TabsTrigger>
          <TabsTrigger value="indicators" className="gap-2">
            <TrendingUp className="h-4 w-4" />
            Indicators
          </TabsTrigger>
          <TabsTrigger value="meetings" className="gap-2">
            <Calendar className="h-4 w-4" />
            Meetings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="activities">
          <Card>
            <CardHeader>
              <CardTitle>Activity Management</CardTitle>
              <CardDescription>Manage all activity tracker records</CardDescription>
            </CardHeader>
            <CardContent><ActivitiesAdmin /></CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="indicators">
          <Card>
            <CardHeader>
              <CardTitle>Indicator Management</CardTitle>
              <CardDescription>Manage all performance indicator records</CardDescription>
            </CardHeader>
            <CardContent><IndicatorsAdmin /></CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="meetings">
          <Card>
            <CardHeader>
              <CardTitle>Meeting Management</CardTitle>
              <CardDescription>Manage all meeting schedule records</CardDescription>
            </CardHeader>
            <CardContent><MeetingsAdmin /></CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
