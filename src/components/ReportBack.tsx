import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { DataLinksEditor } from "@/components/DataLinksEditor";
import { DataLinksList } from "@/components/DataLinksList";
import { ClipboardCheck } from "lucide-react";
import type { Meeting } from "./MeetingDetailsDialog";

export interface ReportBack {
  totalAttendees?: number | null;
  female?: number | null;
  male?: number | null;
  other?: number | null;
  engagement?: number | null;
  engagementNotes?: string;
  trainerPerformance?: number | null;
  trainerNotes?: string;
  outcomes?: string;
  challenges?: string;
  nextSteps?: string;
  links?: string;
  submittedBy?: string;
  submittedAt?: string;
  reviewed?: boolean;
  reviewedBy?: string;
  reviewedAt?: string;
}

export type ReportStatus = "Upcoming" | "Report due" | "Submitted" | "Reviewed";

export const parseReportBack = (raw: unknown): ReportBack | null => {
  if (!raw) return null;
  if (typeof raw === "object") return raw as ReportBack;
  try { return JSON.parse(String(raw)); } catch { return null; }
};

export const reportStatus = (m: Meeting): ReportStatus => {
  const r = m.reportBack;
  if (r?.reviewed) return "Reviewed";
  if (r?.submittedAt) return "Submitted";
  const end = m.meetingDateTo || m.meetingDateFrom || m.meetingDate;
  if (end && new Date(end) <= new Date()) return "Report due";
  return "Upcoming";
};

export const genderSum = (r?: ReportBack | null) =>
  (r?.female || 0) + (r?.male || 0) + (r?.other || 0);

export const totalAttendees = (r?: ReportBack | null) =>
  r?.totalAttendees ?? (genderSum(r) || null);

export const ReportStatusBadge = ({ status }: { status: ReportStatus }) => {
  const variant =
    status === "Reviewed" ? "default" : status === "Submitted" ? "secondary" : status === "Report due" ? "destructive" : "outline";
  return <Badge variant={variant} className="text-[11px]">{status}</Badge>;
};

const num = (v: string) => (v === "" ? null : Math.max(0, Math.floor(Number(v))) || 0);

const RATING_LABELS = ["", "Poor", "Fair", "Good", "Very good", "Excellent"];

const RatingPicker = ({ label, value, onChange }: { label: string; value?: number | null; onChange: (v: number | null) => void }) => (
  <div className="space-y-1.5">
    <Label className="text-xs">{label}</Label>
    <div className="flex flex-wrap gap-1.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(value === n ? null : n)}
          className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
            value === n
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border bg-card text-muted-foreground hover:bg-muted/50"
          }`}
        >
          {n} · {RATING_LABELS[n]}
        </button>
      ))}
    </div>
  </div>
);

interface DialogProps {
  meeting: Meeting | null;
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onSave: (m: Meeting) => Promise<void> | void;
  isAdmin: boolean;
  userName: string;
}

export const ReportBackDialog = ({ meeting, open, onOpenChange, onSave, isAdmin, userName }: DialogProps) => {
  const [r, setR] = useState<ReportBack>({});
  const [pre, setPre] = useState("");
  const [post, setPost] = useState("");
  const [totalTouched, setTotalTouched] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (meeting && open) {
      setR(meeting.reportBack || {});
      setPre(meeting.preSurveyLink || "");
      setPost(meeting.postSurveyLink || "");
      setTotalTouched(meeting.reportBack?.totalAttendees != null);
    }
  }, [meeting, open]);

  if (!meeting) return null;

  const setGender = (k: "female" | "male" | "other", v: string) => {
    const next = { ...r, [k]: num(v) };
    if (!totalTouched) next.totalAttendees = genderSum(next) || null;
    setR(next);
  };

  const sum = genderSum(r);
  const mismatch = r.totalAttendees != null && sum > 0 && sum !== r.totalAttendees;

  const save = async () => {
    setSaving(true);
    const now = new Date().toISOString();
    const report: ReportBack = {
      ...r,
      submittedBy: r.submittedBy || userName,
      submittedAt: r.submittedAt || now,
    };
    if (isAdmin && report.reviewed && !meeting.reportBack?.reviewed) {
      report.reviewedBy = userName;
      report.reviewedAt = now;
    }
    if (!report.reviewed) { report.reviewedBy = undefined; report.reviewedAt = undefined; }
    try {
      await onSave({ ...meeting, reportBack: report, preSurveyLink: pre || undefined, postSurveyLink: post || undefined });
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  };

  const field = (id: keyof ReportBack, label: string, onChange?: (v: string) => void) => (
    <div className="space-y-1.5">
      <Label htmlFor={`rb-${id}`} className="text-xs">{label}</Label>
      <Input
        id={`rb-${id}`}
        type="number"
        min={0}
        value={(r[id] as number | null | undefined) ?? ""}
        onChange={(e) => (onChange ? onChange(e.target.value) : setR({ ...r, [id]: num(e.target.value) }))}
      />
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><ClipboardCheck className="h-5 w-5 text-primary" />Report Back</DialogTitle>
          <DialogDescription>{meeting.eventTitle}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <section className="space-y-3 rounded-xl border border-border bg-card p-4">
            <h4 className="text-sm font-semibold">Attendance</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {field("female", "Female", (v) => setGender("female", v))}
              {field("male", "Male", (v) => setGender("male", v))}
              {field("other", "Other / Prefer not to say", (v) => setGender("other", v))}
              {field("totalAttendees", "Total attendees", (v) => { setTotalTouched(v !== ""); setR({ ...r, totalAttendees: v === "" ? (genderSum(r) || null) : num(v) }); })}
            </div>
            {mismatch && (
              <p className="text-xs text-destructive">Gender split adds up to {sum}, which differs from the total.</p>
            )}
          </section>

          <section className="space-y-4 rounded-xl border border-border bg-card p-4">
            <h4 className="text-sm font-semibold">Engagement & Trainer</h4>
            <RatingPicker
              label="Participant engagement"
              value={r.engagement}
              onChange={(v) => setR({ ...r, engagement: v })}
            />
            <div className="space-y-1.5">
              <Label htmlFor="rb-engagementNotes" className="text-xs">Engagement notes (optional)</Label>
              <Textarea id="rb-engagementNotes" rows={2} value={r.engagementNotes || ""} onChange={(e) => setR({ ...r, engagementNotes: e.target.value.slice(0, 2000) })} />
            </div>
            <RatingPicker
              label="Trainer performance"
              value={r.trainerPerformance}
              onChange={(v) => setR({ ...r, trainerPerformance: v })}
            />
            <div className="space-y-1.5">
              <Label htmlFor="rb-trainerNotes" className="text-xs">Trainer notes (optional)</Label>
              <Textarea id="rb-trainerNotes" rows={2} value={r.trainerNotes || ""} onChange={(e) => setR({ ...r, trainerNotes: e.target.value.slice(0, 2000) })} />
            </div>
          </section>

          <section className="space-y-3 rounded-xl border border-border bg-card p-4">
            <h4 className="text-sm font-semibold">Summary</h4>
            {(["outcomes", "challenges", "nextSteps"] as const).map((k) => (
              <div key={k} className="space-y-1.5">
                <Label htmlFor={`rb-${k}`} className="text-xs">
                  {k === "outcomes" ? "Key outcomes" : k === "challenges" ? "Challenges" : "Next steps"}
                </Label>
                <Textarea id={`rb-${k}`} rows={3} value={r[k] || ""} onChange={(e) => setR({ ...r, [k]: e.target.value.slice(0, 5000) })} />
              </div>
            ))}
          </section>

          <section className="space-y-3 rounded-xl border border-border bg-card p-4">
            <h4 className="text-sm font-semibold">Surveys, links & documents</h4>
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="rb-pre" className="text-xs">Pre-survey link</Label>
                <Input id="rb-pre" type="url" placeholder="https://..." value={pre} onChange={(e) => setPre(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="rb-post" className="text-xs">Post-survey link</Label>
                <Input id="rb-post" type="url" placeholder="https://..." value={post} onChange={(e) => setPost(e.target.value)} />
              </div>
            </div>
            <DataLinksEditor
              label="Attendance register, photos, reports"
              value={r.links}
              onChange={(v) => setR({ ...r, links: v })}
            />
          </section>

          {isAdmin && (
            <label className="flex items-center gap-3 rounded-xl border border-border bg-muted/30 p-4 cursor-pointer">
              <Checkbox checked={!!r.reviewed} onCheckedChange={(c) => setR({ ...r, reviewed: !!c })} />
              <span className="text-sm">
                <span className="font-medium">Mark as reviewed</span>
                <span className="block text-xs text-muted-foreground">Admin sign-off that this report back has been checked.</span>
              </span>
            </label>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={save} disabled={saving}>{saving ? "Saving..." : "Save Report Back"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export const ReportBackView = ({ meeting }: { meeting: Meeting }) => {
  const r = meeting.reportBack;
  const status = reportStatus(meeting);
  const total = totalAttendees(r) || 0;
  const parts = [
    { label: "Female", v: r?.female || 0, cls: "bg-primary" },
    { label: "Male", v: r?.male || 0, cls: "bg-accent" },
    { label: "Other", v: r?.other || 0, cls: "bg-muted-foreground" },
  ];
  const split = genderSum(r);
  const fmt = (d?: string) => (d ? new Date(d).toLocaleDateString() : "");

  return (
    <div className="space-y-3 rounded-xl border border-border bg-muted/20 p-4">
      <div className="flex items-center justify-between">
        <p className="font-medium text-sm flex items-center gap-2"><ClipboardCheck className="h-4 w-4 text-primary" />Report Back</p>
        <ReportStatusBadge status={status} />
      </div>
      {!r?.submittedAt ? (
        <p className="text-sm text-muted-foreground">No report back submitted yet.</p>
      ) : (
        <>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold">{total}</span>
            <span className="text-sm text-muted-foreground">attendees</span>
          </div>
          {split > 0 && (
            <div className="space-y-1.5">
              <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-muted">
                {parts.map((p) => p.v > 0 && <div key={p.label} className={p.cls} style={{ width: `${(p.v / split) * 100}%` }} />)}
              </div>
              <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                {parts.map((p) => (
                  <span key={p.label} className="flex items-center gap-1.5">
                    <span className={`h-2 w-2 rounded-full ${p.cls}`} />{p.label}: {p.v}
                  </span>
                ))}
              </div>
            </div>
          )}
          {(r.engagement != null || r.trainerPerformance != null) && (
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                ["Participant engagement", r.engagement, r.engagementNotes],
                ["Trainer performance", r.trainerPerformance, r.trainerNotes],
              ].map(([label, rating, notes]) =>
                rating != null ? (
                  <div key={label as string} className="rounded-lg border border-border bg-card p-3 space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">{label}</p>
                    <div className="flex items-center gap-2">
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((n) => (
                          <span key={n} className={`h-2 w-4 rounded-full ${n <= (rating as number) ? "bg-primary" : "bg-muted"}`} />
                        ))}
                      </div>
                      <span className="text-sm font-medium">{rating}/5 · {RATING_LABELS[rating as number]}</span>
                    </div>
                    {notes ? <p className="text-xs text-muted-foreground whitespace-pre-wrap break-words">{notes}</p> : null}
                  </div>
                ) : null
              )}
            </div>
          )}
          {[["Key outcomes", r.outcomes], ["Challenges", r.challenges], ["Next steps", r.nextSteps]].map(([l, v]) =>
            v ? (
              <div key={l}>
                <p className="text-xs font-medium text-muted-foreground">{l}</p>
                <p className="text-sm whitespace-pre-wrap break-words">{v}</p>
              </div>
            ) : null
          )}
          {r.links && <DataLinksList value={r.links} title="Attendance register, photos, reports" />}
          <p className="text-xs text-muted-foreground">
            Submitted by {r.submittedBy || "—"} on {fmt(r.submittedAt)}
            {r.reviewed && ` · Reviewed by ${r.reviewedBy || "—"} on ${fmt(r.reviewedAt)}`}
          </p>
        </>
      )}
    </div>
  );
};
