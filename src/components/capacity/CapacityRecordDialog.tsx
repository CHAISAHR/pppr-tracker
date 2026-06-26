import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { saveEventCapacity, type EventCapacity } from "@/lib/capacity";
import type { Meeting } from "../MeetingDetailsDialog";

interface ParticipantDraft {
  key: string;
  participantName: string;
  preScores: Record<string, string>;
  postScores: Record<string, string>;
}

interface Props {
  mode: "create" | "edit";
  open: boolean;
  onOpenChange: (open: boolean) => void;
  events: Meeting[];
  existing?: EventCapacity;
  existingRowIds?: string[];
}

const clamp = (v: string): number | null => {
  if (v === "") return null;
  const n = Math.round(Number(v));
  if (Number.isNaN(n)) return null;
  return Math.max(1, Math.min(5, n));
};

const newParticipant = (): ParticipantDraft => ({
  key: crypto.randomUUID(),
  participantName: "",
  preScores: {},
  postScores: {},
});

export const CapacityRecordDialog = ({
  mode,
  open,
  onOpenChange,
  events,
  existing,
  existingRowIds = [],
}: Props) => {
  const [eventSelection, setEventSelection] = useState<string>("");
  const [manualLabel, setManualLabel] = useState("");
  const [manualDate, setManualDate] = useState("");
  const [focusArea, setFocusArea] = useState("");
  const [sector, setSector] = useState("");
  const [competenciesInput, setCompetenciesInput] = useState("");
  const [participants, setParticipants] = useState<ParticipantDraft[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (existing) {
      setEventSelection(existing.eventId ?? "__custom__");
      setManualLabel(existing.eventFocusArea);
      setManualDate(existing.eventDate ?? "");
      setFocusArea(existing.focusArea ?? "");
      setSector(existing.sector ?? "");
      setCompetenciesInput(existing.competencies.join("; "));
      setParticipants(
        existing.participants.map((p) => {
          const preScores: Record<string, string> = {};
          const postScores: Record<string, string> = {};
          for (const c of existing.competencies) {
            const s = p.scores[c];
            preScores[c] = s?.pre != null ? String(s.pre) : "";
            postScores[c] = s?.post != null ? String(s.post) : "";
          }
          return {
            key: crypto.randomUUID(),
            participantName: p.participantName,
            preScores,
            postScores,
          };
        }),
      );
    } else {
      setEventSelection("");
      setManualLabel("");
      setManualDate("");
      setFocusArea("");
      setSector("");
      setCompetenciesInput("");
      setParticipants([newParticipant()]);
    }
  }, [open, existing]);

  const competencies = useMemo(
    () => competenciesInput.split(";").map((c) => c.trim()).filter(Boolean),
    [competenciesInput],
  );

  const updateScore = (
    key: string,
    phase: "preScores" | "postScores",
    comp: string,
    value: string,
  ) => {
    setParticipants((prev) =>
      prev.map((p) =>
        p.key === key ? { ...p, [phase]: { ...p[phase], [comp]: value } } : p,
      ),
    );
  };

  const handleSave = async () => {
    let eventId: string | null = null;
    let eventName = manualLabel.trim();
    let date: string | null = manualDate || null;

    if (eventSelection && eventSelection !== "__custom__") {
      const meeting = events.find((m) => m.id === eventSelection);
      if (!meeting) {
        toast.error("Selected event not found");
        return;
      }
      eventId = meeting.id;
      eventName = meeting.focusArea;
      date = meeting.meetingDateFrom || meeting.meetingDate || null;
    }

    if (!eventName) {
      toast.error("Please select an event or enter an event name");
      return;
    }
    if (competencies.length === 0) {
      toast.error("Add at least one competency");
      return;
    }
    const cleanParticipants = participants
      .filter((p) => p.participantName.trim())
      .map((p) => ({
        participantName: p.participantName.trim(),
        preScores: Object.fromEntries(
          competencies.map((c) => [c, clamp(p.preScores[c] ?? "")]),
        ),
        postScores: Object.fromEntries(
          competencies.map((c) => [c, clamp(p.postScores[c] ?? "")]),
        ),
      }));
    if (cleanParticipants.length === 0) {
      toast.error("Add at least one participant");
      return;
    }

    setSaving(true);
    try {
      await saveEventCapacity(
        {
          eventId,
          eventFocusArea: eventName,
          eventDate: date,
          focusArea: focusArea.trim() || null,
          sector: sector.trim() || null,
          competencies,
          participants: cleanParticipants,
        },
        existingRowIds,
      );
      toast.success(mode === "create" ? "Capacity record added" : "Capacity record updated");
      onOpenChange(false);
    } catch (err) {
      console.error(err);
      toast.error("Failed to save capacity record");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Add capacity record" : "Edit capacity record"}
          </DialogTitle>
          <DialogDescription>
            Track participant capacity scores (1-5) before and after training.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Event</Label>
              <Select
                value={eventSelection}
                onValueChange={(v) => {
                  setEventSelection(v);
                  if (v && v !== "__custom__") {
                    const m = events.find((e) => e.id === v);
                    if (m) {
                      setManualLabel(m.focusArea);
                      setManualDate(m.meetingDateFrom || m.meetingDate || "");
                    }
                  }
                }}
                disabled={mode === "edit"}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pick an event from Event Schedule" />
                </SelectTrigger>
                <SelectContent>
                  {events.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.focusArea}
                      {(m.meetingDateFrom || m.meetingDate) ? ` — ${m.meetingDateFrom || m.meetingDate}` : ""}
                    </SelectItem>
                  ))}
                  <SelectItem value="__custom__">Other / not in list…</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {eventSelection === "__custom__" && (
              <>
                <div className="space-y-2">
                  <Label>Event name</Label>
                  <Input
                    value={manualLabel}
                    onChange={(e) => setManualLabel(e.target.value)}
                    placeholder="Training name"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Event date</Label>
                  <Input
                    type="date"
                    value={manualDate}
                    onChange={(e) => setManualDate(e.target.value)}
                  />
                </div>
              </>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="capacity-focus-area">Focus Area</Label>
              <Input
                id="capacity-focus-area"
                placeholder="e.g. Climate adaptation"
                value={focusArea}
                onChange={(e) => setFocusArea(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="capacity-sector">Sector</Label>
              <Input
                id="capacity-sector"
                placeholder="e.g. Agriculture"
                value={sector}
                onChange={(e) => setSector(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="capacity-competencies">Competencies (separate with ;)</Label>
            <Input
              id="capacity-competencies"
              placeholder="Knowledge; Confidence; Skills"
              value={competenciesInput}
              onChange={(e) => setCompetenciesInput(e.target.value)}
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Participants</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setParticipants((p) => [...p, newParticipant()])}
                className="gap-2"
              >
                <Plus className="h-4 w-4" /> Add participant
              </Button>
            </div>

            {competencies.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                Add at least one competency above to record scores.
              </p>
            ) : (
              participants.map((p) => (
                <div key={p.key} className="border rounded-md p-3 space-y-3">
                  <div className="flex items-end gap-2">
                    <div className="flex-1 space-y-1">
                      <Label className="text-xs">Participant name</Label>
                      <Input
                        value={p.participantName}
                        onChange={(e) =>
                          setParticipants((prev) =>
                            prev.map((x) =>
                              x.key === p.key ? { ...x, participantName: e.target.value } : x,
                            ),
                          )
                        }
                        placeholder="Jane Doe"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setParticipants((prev) => prev.filter((x) => x.key !== p.key))
                      }
                    >
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
                        {competencies.map((c) => {
                          const pre = clamp(p.preScores[c] ?? "");
                          const post = clamp(p.postScores[c] ?? "");
                          const delta = pre != null && post != null ? post - pre : null;
                          return (
                            <tr key={c} className="border-t">
                              <td className="py-1.5 pr-2">{c}</td>
                              <td className="py-1.5 pr-2">
                                <Input
                                  type="number"
                                  min={1}
                                  max={5}
                                  className="h-8"
                                  value={p.preScores[c] ?? ""}
                                  onChange={(e) => updateScore(p.key, "preScores", c, e.target.value)}
                                />
                              </td>
                              <td className="py-1.5 pr-2">
                                <Input
                                  type="number"
                                  min={1}
                                  max={5}
                                  className="h-8"
                                  value={p.postScores[c] ?? ""}
                                  onChange={(e) => updateScore(p.key, "postScores", c, e.target.value)}
                                />
                              </td>
                              <td
                                className={`py-1.5 text-right font-medium ${
                                  delta == null
                                    ? "text-muted-foreground"
                                    : delta > 0
                                    ? "text-primary"
                                    : delta < 0
                                    ? "text-destructive"
                                    : ""
                                }`}
                              >
                                {delta == null ? "—" : delta > 0 ? `+${delta}` : delta}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving…" : mode === "create" ? "Add record" : "Save changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
