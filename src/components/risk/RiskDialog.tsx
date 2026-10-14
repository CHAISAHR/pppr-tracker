import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { Risk, RISK_STATUSES, scoreLevel } from "./risk-types";
import { Badge } from "@/components/ui/badge";
import { api } from "@/services/api";

interface Props {
  risk?: Risk | null;
  open?: boolean;
  onOpenChange?: (o: boolean) => void;
  onSave: (r: Risk) => Promise<void> | void;
  trigger?: React.ReactNode;
}

const empty: Risk = {
  id: "",
  riskId: "",
  organisation: "",
  description: "",
  likelihood: null,
  impact: null,
  mitigation: "",
  owner: "",
  status: "Open",
  dateIdentified: new Date().toISOString().split("T")[0],
};

export const RiskDialog = ({ risk, open, onOpenChange, onSave, trigger }: Props) => {
  const controlled = open !== undefined;
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = controlled ? open! : internalOpen;
  const setOpen = (o: boolean) => (controlled ? onOpenChange?.(o) : setInternalOpen(o));

  const [form, setForm] = useState<Risk>(empty);
  const [saving, setSaving] = useState(false);
  const [orgs, setOrgs] = useState<string[]>([]);

  useEffect(() => {
    if (!isOpen) return;
    api
      .getOrganisations()
      .then((list) => setOrgs(Array.from(new Set((list || []).map((o: any) => o.name).filter(Boolean))).sort()))
      .catch(() => setOrgs([]));
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) setForm(risk ? { ...empty, ...risk } : { ...empty });
  }, [isOpen, risk]);


  const score =
    form.likelihood && form.impact ? Number(form.likelihood) * Number(form.impact) : null;
  const level = scoreLevel(score);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave(form);
      setOpen(false);
    } finally {
      setSaving(false);
    }
  };

  const set = <K extends keyof Risk>(k: K, v: Risk[K]) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      {trigger !== undefined ? (
        <DialogTrigger asChild>{trigger}</DialogTrigger>
      ) : !controlled ? (
        <DialogTrigger asChild>
          <Button className="gap-2"><Plus className="h-4 w-4" />Add Risk</Button>
        </DialogTrigger>
      ) : null}
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{risk ? "Edit Risk" : "Add Risk"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Risk ID</Label>
              <Input value={form.riskId || ""} readOnly disabled placeholder="Auto-generated (PF-01)" className="font-mono" />
            </div>
            <div className="space-y-2">
              <Label>Organisation</Label>
              <Select value={form.organisation || ""} onValueChange={(v) => set("organisation", v)}>
                <SelectTrigger><SelectValue placeholder="Select organisation" /></SelectTrigger>
                <SelectContent>
                  {orgs.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Date Identified</Label>
              <Input type="date" value={form.dateIdentified || ""} onChange={(e) => set("dateIdentified", e.target.value)} />
            </div>
          </div>


          <div className="space-y-2">
            <Label>Description *</Label>
            <Textarea required rows={3} value={form.description} onChange={(e) => set("description", e.target.value)} />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                Likelihood
                <span className="text-[10px] font-semibold text-primary bg-primary/10 rounded-full px-1.5 py-0.5">scale 1–10</span>
              </Label>
              <Select value={form.likelihood?.toString() || ""} onValueChange={(v) => set("likelihood", Number(v))}>
                <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                <SelectContent>{[1,2,3,4,5,6,7,8,9,10].map(n => <SelectItem key={n} value={String(n)}>{n}</SelectItem>)}</SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">1 = very unlikely · 10 = almost certain</p>
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                Impact
                <span className="text-[10px] font-semibold text-primary bg-primary/10 rounded-full px-1.5 py-0.5">scale 1–10</span>
              </Label>
              <Select value={form.impact?.toString() || ""} onValueChange={(v) => set("impact", Number(v))}>
                <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                <SelectContent>{[1,2,3,4,5,6,7,8,9,10].map(n => <SelectItem key={n} value={String(n)}>{n}</SelectItem>)}</SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">1 = negligible · 10 = severe</p>
            </div>
            <div className="space-y-2">
              <Label>Risk Score</Label>
              <div className="h-10 flex items-center gap-2">
                <span className="text-2xl font-semibold tabular-nums">{score ?? "—"}</span>
                <Badge className={level.className}>{level.label}</Badge>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Mitigation</Label>
            <Textarea rows={3} value={form.mitigation || ""} onChange={(e) => set("mitigation", e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Owner</Label>
              <Input value={form.owner || ""} onChange={(e) => set("owner", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={form.status || "Open"} onValueChange={(v) => set("status", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{RISK_STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={saving}>{saving ? "Saving..." : "Save Risk"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
