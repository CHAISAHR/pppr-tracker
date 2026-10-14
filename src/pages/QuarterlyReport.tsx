import { useEffect, useMemo, useState } from "react";
import * as XLSX from "xlsx";
import { toast } from "sonner";
import { ClipboardCheck, Plus, Send, Save, Download, Trash2, Eye, EyeOff, Lock, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/services/api";
import {
  QUARTERLY_QUESTIONS, FOCUS_GROUPS, optionsFor, wordCount, hintLimit, type Answers,
} from "@/lib/quarterlyReport";

interface Report { id: string; title: string; quarter?: string; dueDate?: string | null; status: "Draft" | "Published" | "Closed"; publishedAt?: string | null }
interface ResponseRec { id: string; reportId: string; organisation: string; answers: Answers; status: string; submittedBy?: string; submittedAt?: string | null }

const statusVariant = (s: string) => (s === "Published" || s === "Submitted" ? "default" : s === "Closed" ? "outline" : "secondary") as any;

export default function QuarterlyReport() {
  const { user, isAdmin } = useAuth();
  const admin = isAdmin();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState<Report | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState({ title: "", quarter: "", dueDate: "" });

  const load = async () => {
    try { setReports(await api.getQuarterlyReports(admin)); }
    catch (e: any) { toast.error(e.message || "Failed to load reports"); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [admin]);

  const create = async () => {
    if (!form.title.trim()) return toast.error("Please enter a title");
    try {
      await api.createQuarterlyReport({ ...form, title: form.title.trim() });
      toast.success("Report created as a draft — publish it when ready");
      setCreateOpen(false); setForm({ title: "", quarter: "", dueDate: "" }); load();
    } catch (e: any) { toast.error(e.message); }
  };

  const setStatus = async (r: Report, status: Report["status"]) => {
    try {
      await api.updateQuarterlyReport(r.id, { status });
      toast.success(status === "Published" ? "Report published — users can now see it" : status === "Closed" ? "Report closed" : "Report unpublished");
      load();
    } catch (e: any) { toast.error(e.message); }
  };

  const remove = async (r: Report) => {
    if (!confirm(`Delete "${r.title}" and all its responses?`)) return;
    try { await api.deleteQuarterlyReport(r.id); load(); } catch (e: any) { toast.error(e.message); }
  };

  if (active) return <ReportWorkspace report={active} onBack={() => setActive(null)} admin={admin} userName={user?.name || user?.email || ""} organisation={user?.organization} />;

  return (
    <div className="min-h-full bg-background">
      <div className="container mx-auto py-8 px-4 sm:px-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center"><ClipboardCheck className="h-6 w-6 text-primary" /></div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Quarterly Report</h1>
              <p className="text-sm text-muted-foreground mt-0.5">Each organisation submits its quarterly update, consolidated into one report</p>
            </div>
          </div>
          {admin && <Button onClick={() => setCreateOpen(true)} className="gap-2"><Plus className="h-4 w-4" />New Report</Button>}
        </div>

        {admin && !loading && <SubmissionDashboard reports={reports.filter((r) => r.status === "Published")} onOpen={setActive} />}

        {loading ? <p className="text-muted-foreground">Loading…</p> : reports.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-10 text-center text-muted-foreground">
            {admin ? "No quarterly reports yet. Create one, then publish it so organisations can respond." : "No quarterly report has been published yet."}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {reports.map((r) => (
              <div key={r.id} className="rounded-xl border border-border bg-card p-5 shadow-card flex flex-col gap-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold text-foreground">{r.title}</h3>
                    {r.quarter && <p className="text-sm text-muted-foreground">{r.quarter}</p>}
                  </div>
                  <Badge variant={statusVariant(r.status)}>{r.status}</Badge>
                </div>
                {r.dueDate && <p className="text-xs text-muted-foreground">Due {new Date(r.dueDate).toLocaleDateString()}</p>}
                <div className="flex flex-wrap gap-2 mt-auto">
                  <Button size="sm" onClick={() => setActive(r)}>Open</Button>
                  {admin && r.status !== "Published" && <Button size="sm" variant="outline" className="gap-1" onClick={() => setStatus(r, "Published")}><Eye className="h-3.5 w-3.5" />Publish</Button>}
                  {admin && r.status === "Published" && <>
                    <Button size="sm" variant="outline" className="gap-1" onClick={() => setStatus(r, "Draft")}><EyeOff className="h-3.5 w-3.5" />Unpublish</Button>
                    <Button size="sm" variant="outline" className="gap-1" onClick={() => setStatus(r, "Closed")}><Lock className="h-3.5 w-3.5" />Close</Button>
                  </>}
                  {admin && <Button size="sm" variant="ghost" onClick={() => remove(r)} aria-label="Delete"><Trash2 className="h-4 w-4 text-destructive" /></Button>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>New Quarterly Report</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Title *</Label><Input value={form.title} maxLength={255} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Quarterly Report – Q3 2026" /></div>
            <div className="space-y-2"><Label>Reporting quarter</Label><Input value={form.quarter} maxLength={100} onChange={(e) => setForm({ ...form, quarter: e.target.value })} placeholder="July – September 2026" /></div>
            <div className="space-y-2"><Label>Due date</Label><Input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} /></div>
            <p className="text-xs text-muted-foreground">The report stays hidden from users until you publish it.</p>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button><Button onClick={create}>Create</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ReportWorkspace({ report, onBack, admin, userName, organisation }: { report: Report; onBack: () => void; admin: boolean; userName: string; organisation?: string }) {
  const [responses, setResponses] = useState<ResponseRec[]>([]);
  const [answers, setAnswers] = useState<Answers>({});
  const [mine, setMine] = useState<ResponseRec | null>(null);
  const [saving, setSaving] = useState(false);
  const readOnly = report.status === "Closed" || (!admin && report.status !== "Published");

  const load = async () => {
    try {
      const all: ResponseRec[] = await api.getQuarterlyResponses(report.id, admin, organisation);
      setResponses(all);
      const own = all.find((r) => r.organisation === (organisation || "My organisation")) || (!admin ? all[0] : undefined) || null;
      setMine(own); setAnswers(own?.answers || {});
    } catch (e: any) { toast.error(e.message); }
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [report.id]);

  const setA = (id: string, patch: { select?: string; comment?: string }) =>
    setAnswers((a) => ({ ...a, [id]: { ...a[id], ...patch } }));

  const save = async (status: "Draft" | "Submitted") => {
    if (status === "Submitted") {
      const missing = QUARTERLY_QUESTIONS.filter((q) => (q.select !== "none" && !answers[q.id]?.select) || (q.comment && !answers[q.id]?.comment?.trim()));
      if (missing.length) return toast.error(`Please answer all questions (${missing.length} left)`);
    }
    setSaving(true);
    try {
      await api.saveQuarterlyResponse(report.id, { organisation, answers, status, submittedBy: userName });
      toast.success(status === "Submitted" ? "Report submitted" : "Draft saved");
      load();
    } catch (e: any) { toast.error(e.message); } finally { setSaving(false); }
  };

  const exportExcel = () => {
    const rows: any[] = [];
    responses.forEach((r) => QUARTERLY_QUESTIONS.forEach((q) => rows.push({
      Organisation: r.organisation, Status: r.status, Focus: q.focus, Questions: q.question,
      "Persons Responsible": q.responsible, Select: r.answers?.[q.id]?.select || "",
      "Comments (Please provide details)": r.answers?.[q.id]?.comment || "",
    })));
    const ws = XLSX.utils.json_to_sheet(rows);
    ws["!cols"] = [{ wch: 28 }, { wch: 12 }, { wch: 28 }, { wch: 60 }, { wch: 30 }, { wch: 28 }, { wch: 70 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Consolidated");
    XLSX.writeFile(wb, `${report.title.replace(/[^\w-]+/g, "_")}_consolidated.xlsx`);
  };

  const form = (
    <div className="space-y-6">
      {mine && <p className="text-sm text-muted-foreground">Status: <Badge variant={statusVariant(mine.status)}>{mine.status}</Badge>{mine.submittedBy && ` · last saved by ${mine.submittedBy}`}</p>}
      {FOCUS_GROUPS.map((focus) => (
        <section key={focus} className="rounded-xl border border-border bg-card shadow-card overflow-hidden">
          <h2 className="px-5 py-3 bg-table-header text-table-header-foreground font-semibold text-sm tracking-wide">{focus}</h2>
          <div className="divide-y divide-border">
            {QUARTERLY_QUESTIONS.filter((q) => q.focus === focus).map((q) => {
              const limit = hintLimit(q.hint);
              const wc = wordCount(answers[q.id]?.comment);
              return (
                <div key={q.id} className="p-5 grid gap-4 lg:grid-cols-[1fr_1.4fr]">
                  <div>
                    <p className="font-medium text-foreground">{q.question}</p>
                    {q.hint && <p className="text-xs text-muted-foreground mt-1">{q.hint}</p>}
                    {q.id === "q1" ? <p className="text-xs text-muted-foreground mt-2">Person responsible</p> : q.id !== "q2" && q.id !== "q3" && q.id !== "q4" && q.id !== "q5" && q.id !== "q6" ? <p className="text-xs text-muted-foreground mt-2"><span className="font-medium">Person responsible:</span> {q.responsible}</p> : <p className="text-xs text-muted-foreground mt-2" />}
                  </div>
                  <div className="space-y-3">
                    {q.select !== "none" && (
                      <div className="space-y-1.5">
                        <Label className="text-xs">What is the likelihood of meeting this quarter's milestone?</Label>
                        <Select value={answers[q.id]?.select || undefined} onValueChange={(v) => setA(q.id, { select: v })} disabled={readOnly}>
                          <SelectTrigger><SelectValue placeholder="Choose a response" /></SelectTrigger>
                          <SelectContent>{optionsFor(q.select).map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                    )}
                    {q.comment && (
                      <div className="space-y-1.5">
                        <Label className="text-xs">{q.commentLabel || "Comments (Please provide details)"}</Label>
                        {q.commentLabel ? (
                          <Input value={answers[q.id]?.comment || ""} maxLength={100} disabled={readOnly} onChange={(e) => setA(q.id, { comment: e.target.value })} placeholder="e.g. 25000" />
                        ) : (
                          <Textarea rows={4} maxLength={5000} disabled={readOnly} value={answers[q.id]?.comment || ""} onChange={(e) => setA(q.id, { comment: e.target.value })} />
                        )}
                        {limit && <p className={`text-xs ${wc > limit ? "text-destructive" : "text-muted-foreground"}`}>{wc} / {limit} words</p>}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      ))}
      {!readOnly && (
        <div className="flex justify-end gap-2">
          <Button variant="outline" disabled={saving} onClick={() => save("Draft")} className="gap-2"><Save className="h-4 w-4" />Save draft</Button>
          <Button disabled={saving} onClick={() => save("Submitted")} className="gap-2"><Send className="h-4 w-4" />Submit</Button>
        </div>
      )}
    </div>
  );

  const consolidated = useMemo(() => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{responses.length} organisation(s) responded · {responses.filter((r) => r.status === "Submitted").length} submitted</p>
        <Button variant="outline" className="gap-2" onClick={exportExcel} disabled={!responses.length}><Download className="h-4 w-4" />Export consolidated</Button>
      </div>
      {QUARTERLY_QUESTIONS.map((q) => (
        <div key={q.id} className="rounded-xl border border-border bg-card shadow-card">
          <div className="px-5 py-3 bg-table-header text-table-header-foreground rounded-t-xl">
            <p className="text-[11px] uppercase tracking-wider opacity-80">{q.focus}</p>
            <p className="font-medium">{q.question}</p>
          </div>
          <div className="divide-y divide-border">
            {responses.length === 0 && <p className="p-4 text-sm text-muted-foreground">No responses yet.</p>}
            {responses.map((r) => (
              <div key={r.id} className="p-4 grid gap-2 md:grid-cols-[200px_180px_1fr] text-sm">
                <span className="font-medium text-foreground">{r.organisation}</span>
                <span>{r.answers?.[q.id]?.select ? <Badge variant="secondary">{r.answers[q.id].select}</Badge> : <span className="text-muted-foreground">—</span>}</span>
                <span className="whitespace-pre-wrap text-foreground">{r.answers?.[q.id]?.comment || <span className="text-muted-foreground">—</span>}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
    // eslint-disable-next-line react-hooks/exhaustive-deps
  ), [responses]);

  return (
    <div className="min-h-full bg-background">
      <div className="container mx-auto py-8 px-4 sm:px-6 space-y-6">
        <Button variant="ghost" className="gap-2 -ml-2" onClick={onBack}><ArrowLeft className="h-4 w-4" />All reports</Button>
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-2xl font-bold text-foreground">{report.title}</h1>
          <Badge variant={statusVariant(report.status)}>{report.status}</Badge>
          {report.quarter && <span className="text-muted-foreground">{report.quarter}</span>}
        </div>
        {!admin && !organisation && <p className="text-sm text-destructive">Your account has no organisation, so you can't submit a response.</p>}
        {admin ? (
          <Tabs defaultValue="consolidated">
            <TabsList><TabsTrigger value="consolidated">Consolidated report</TabsTrigger><TabsTrigger value="mine">Individual responses</TabsTrigger></TabsList>
            <TabsContent value="consolidated" className="mt-4">{consolidated}</TabsContent>
            <TabsContent value="mine" className="mt-4">{form}</TabsContent>
          </Tabs>
        ) : form}
      </div>
    </div>
  );
}

type Progress = "Not started" | "Draft" | "Submitted";
function SubmissionDashboard({ reports, onOpen }: { reports: Report[]; onOpen: (r: Report) => void }) {
  const [orgs, setOrgs] = useState<string[]>([]);
  const [byReport, setByReport] = useState<Record<string, ResponseRec[]>>({});
  useEffect(() => {
    api.getOrganisations().then((o) => setOrgs(Array.from(new Set(o.map((x: any) => x.name).filter(Boolean))).sort() as string[])).catch(() => {});
  }, []);
  useEffect(() => {
    Promise.all(reports.map((r) => api.getQuarterlyResponses(r.id, true).then((x) => [r.id, x] as const).catch(() => [r.id, []] as const)))
      .then((pairs) => setByReport(Object.fromEntries(pairs)));
  }, [reports.map((r) => r.id).join()]);

  if (!reports.length) return null;
  const cols: { key: Progress; tone: string }[] = [
    { key: "Not started", tone: "bg-destructive/10 text-destructive" },
    { key: "Draft", tone: "bg-accent/20 text-foreground" },
    { key: "Submitted", tone: "bg-primary/10 text-primary" },
  ];
  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold text-foreground">Submission dashboard</h2>
      {reports.map((r) => {
        const resp = byReport[r.id] || [];
        const all = Array.from(new Set([...orgs, ...resp.map((x) => x.organisation)])).sort();
        const statusOf = (o: string): Progress => { const x = resp.find((y) => y.organisation === o); return x ? (x.status === "Submitted" ? "Submitted" : "Draft") : "Not started"; };
        const groups = Object.fromEntries(cols.map((c) => [c.key, all.filter((o) => statusOf(o) === c.key)])) as Record<Progress, string[]>;
        const pct = all.length ? Math.round((groups.Submitted.length / all.length) * 100) : 0;
        return (
          <div key={r.id} className="rounded-xl border border-border bg-card p-5 shadow-card space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="font-semibold text-foreground">{r.title}</h3>
                <p className="text-xs text-muted-foreground">{groups.Submitted.length} of {all.length} organisations submitted{r.dueDate ? ` · due ${new Date(r.dueDate).toLocaleDateString()}` : ""}</p>
              </div>
              <Button size="sm" variant="outline" onClick={() => onOpen(r)}>View responses</Button>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden"><div className="h-full bg-primary" style={{ width: `${pct}%` }} /></div>
            <div className="grid gap-3 md:grid-cols-3">
              {cols.map((c) => (
                <div key={c.key} className="rounded-lg border border-border">
                  <div className={`px-3 py-2 rounded-t-lg text-sm font-medium flex justify-between ${c.tone}`}><span>{c.key}</span><span>{groups[c.key].length}</span></div>
                  <ul className="p-3 space-y-1 text-sm max-h-48 overflow-y-auto">
                    {groups[c.key].length ? groups[c.key].map((o) => <li key={o} className="text-foreground">{o}</li>) : <li className="text-muted-foreground">None</li>}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </section>
  );
}
