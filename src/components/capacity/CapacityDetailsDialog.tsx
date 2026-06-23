import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { averagesPerCompetency, type EventCapacity } from "@/lib/capacity";
import { Calendar, TrendingUp, Users } from "lucide-react";

interface Props {
  record: EventCapacity | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CapacityDetailsDialog = ({ record, open, onOpenChange }: Props) => {
  if (!record) return null;
  const averages = averagesPerCompetency(record);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{record.eventFocusArea}</DialogTitle>
          <DialogDescription className="flex flex-wrap gap-3 items-center mt-2">
            {record.eventDate && (
              <span className="inline-flex items-center gap-1 text-xs">
                <Calendar className="h-3.5 w-3.5" />
                {new Date(record.eventDate).toLocaleDateString("en-US", {
                  weekday: "short",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            )}
            <span className="inline-flex items-center gap-1 text-xs">
              <Users className="h-3.5 w-3.5" />
              {record.participants.length} participant{record.participants.length === 1 ? "" : "s"}
            </span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <div>
            <p className="font-medium text-sm mb-2 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" /> Average change per competency
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-muted-foreground">
                    <th className="text-left font-medium pb-1">Competency</th>
                    <th className="text-right font-medium pb-1">Avg before</th>
                    <th className="text-right font-medium pb-1">Avg after</th>
                    <th className="text-right font-medium pb-1">Change</th>
                  </tr>
                </thead>
                <tbody>
                  {averages.map(({ competency, pre, post, change }) => (
                    <tr key={competency} className="border-t">
                      <td className="py-1.5">{competency}</td>
                      <td className="py-1.5 text-right">{pre?.toFixed(2) ?? "—"}</td>
                      <td className="py-1.5 text-right">{post?.toFixed(2) ?? "—"}</td>
                      <td
                        className={`py-1.5 text-right font-medium ${
                          change == null
                            ? "text-muted-foreground"
                            : change > 0
                            ? "text-primary"
                            : change < 0
                            ? "text-destructive"
                            : ""
                        }`}
                      >
                        {change == null
                          ? "—"
                          : change > 0
                          ? `+${change.toFixed(2)}`
                          : change.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <Separator />

          <div>
            <p className="font-medium text-sm mb-2">Participants</p>
            <div className="space-y-2">
              {record.participants.map((p) => (
                <div key={p.participantName} className="border rounded-md p-3">
                  <p className="font-medium text-sm mb-2">{p.participantName}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {record.competencies.map((c) => {
                      const s = p.scores[c];
                      const pre = s?.pre;
                      const post = s?.post;
                      const d = pre != null && post != null ? post - pre : null;
                      return (
                        <Badge key={c} variant="outline" className="text-[11px] font-normal">
                          {c}: {pre ?? "—"} → {post ?? "—"}
                          {d != null && (
                            <span
                              className={
                                d > 0
                                  ? "ml-1 text-primary"
                                  : d < 0
                                  ? "ml-1 text-destructive"
                                  : "ml-1"
                              }
                            >
                              ({d > 0 ? `+${d}` : d})
                            </span>
                          )}
                        </Badge>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
