import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2 } from "lucide-react";
import type { CapacityAssessment } from "./MeetingDetailsDialog";

interface Props {
  competencies: string[];
  assessments: CapacityAssessment[];
  onChange: (assessments: CapacityAssessment[]) => void;
}

const clampScore = (v: string): number | null => {
  if (v === "") return null;
  const n = Number(v);
  if (Number.isNaN(n)) return null;
  return Math.max(1, Math.min(5, Math.round(n)));
};

export const CapacityAssessmentsEditor = ({ competencies, assessments, onChange }: Props) => {
  const cleanCompetencies = competencies.filter(Boolean);

  const addRow = () => {
    onChange([
      ...assessments,
      { id: crypto.randomUUID(), participantName: "", preScores: {}, postScores: {} },
    ]);
  };

  const updateRow = (id: string, patch: Partial<CapacityAssessment>) => {
    onChange(assessments.map(a => (a.id === id ? { ...a, ...patch } : a)));
  };

  const updateScore = (id: string, phase: "preScores" | "postScores", comp: string, v: string) => {
    const score = clampScore(v);
    onChange(assessments.map(a => {
      if (a.id !== id) return a;
      const next = { ...a[phase] };
      if (score === null) delete next[comp];
      else next[comp] = score;
      return { ...a, [phase]: next };
    }));
  };

  const removeRow = (id: string) => onChange(assessments.filter(a => a.id !== id));

  if (cleanCompetencies.length === 0) {
    return (
      <p className="text-xs text-muted-foreground">
        Define at least one competency above to record participant assessments.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {assessments.length === 0 && (
        <p className="text-xs text-muted-foreground">No participants assessed yet.</p>
      )}
      {assessments.map((a) => (
        <div key={a.id} className="border rounded-md p-3 space-y-3">
          <div className="flex items-end gap-2">
            <div className="flex-1 space-y-1">
              <Label className="text-xs">Participant name</Label>
              <Input
                placeholder="Jane Doe"
                value={a.participantName}
                onChange={(e) => updateRow(a.id, { participantName: e.target.value })}
              />
            </div>
            <Button type="button" variant="ghost" size="sm" onClick={() => removeRow(a.id)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-muted-foreground">
                  <th className="text-left font-medium pb-1">Competency</th>
                  <th className="font-medium pb-1 w-24">Before (1-5)</th>
                  <th className="font-medium pb-1 w-24">After (1-5)</th>
                  <th className="font-medium pb-1 w-16 text-right">Δ</th>
                </tr>
              </thead>
              <tbody>
                {cleanCompetencies.map((comp) => {
                  const pre = a.preScores[comp];
                  const post = a.postScores[comp];
                  const delta = pre != null && post != null ? post - pre : null;
                  return (
                    <tr key={comp} className="border-t">
                      <td className="py-1.5 pr-2">{comp}</td>
                      <td className="py-1.5 pr-2">
                        <Input
                          type="number"
                          min={1}
                          max={5}
                          value={pre ?? ""}
                          onChange={(e) => updateScore(a.id, "preScores", comp, e.target.value)}
                          className="h-8"
                        />
                      </td>
                      <td className="py-1.5 pr-2">
                        <Input
                          type="number"
                          min={1}
                          max={5}
                          value={post ?? ""}
                          onChange={(e) => updateScore(a.id, "postScores", comp, e.target.value)}
                          className="h-8"
                        />
                      </td>
                      <td className={`py-1.5 text-right font-medium ${
                        delta == null ? "text-muted-foreground" : delta > 0 ? "text-primary" : delta < 0 ? "text-destructive" : ""
                      }`}>
                        {delta == null ? "—" : delta > 0 ? `+${delta}` : delta}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={addRow} className="gap-2">
        <Plus className="h-4 w-4" /> Add participant
      </Button>
    </div>
  );
};
