import { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Plus, Edit, Trash2, Users } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  averagesPerCompetency,
  deleteEventCapacity,
  getAllRows,
  groupByEvent,
  loadCapacity,
  rowIdsForEvent,
  type EventCapacity,
} from "@/lib/capacity";
import { CapacityRecordDialog } from "@/components/capacity/CapacityRecordDialog";
import { CapacityDetailsDialog } from "@/components/capacity/CapacityDetailsDialog";
import { CapacityExcelExport } from "@/components/capacity/CapacityExcelExport";
import { CapacityExcelTemplate } from "@/components/capacity/CapacityExcelTemplate";
import { CapacityExcelUpload } from "@/components/capacity/CapacityExcelUpload";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import type { Meeting } from "@/components/MeetingDetailsDialog";

const Capacity = () => {
  const { user, isAdmin } = useAuth();
  const [, setTick] = useState(0);
  const [events, setEvents] = useState<EventCapacity[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [search, setSearch] = useState("");
  const [eventFilter, setEventFilter] = useState<string>("__all__");
  const [addOpen, setAddOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<EventCapacity | null>(null);
  const [detailsTarget, setDetailsTarget] = useState<EventCapacity | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<EventCapacity | null>(null);

  useEffect(() => {
    void loadCapacity().then(() => {
      setEvents(groupByEvent());
    });
    const saved = localStorage.getItem("meetings");
    if (saved) {
      try {
        setMeetings(JSON.parse(saved));
      } catch {/* ignore */}
    }
    const onChange = () => setEvents(groupByEvent(getAllRows()));
    window.addEventListener("capacity-changed", onChange);
    return () => window.removeEventListener("capacity-changed", onChange);
  }, []);

  const filtered = useMemo(() => {
    return events.filter((e) => {
      if (eventFilter !== "__all__" && (e.eventId ?? "") !== eventFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        if (
          !e.eventFocusArea.toLowerCase().includes(q) &&
          !e.participants.some((p) => p.participantName.toLowerCase().includes(q))
        ) return false;
      }
      return true;
    });
  }, [events, eventFilter, search]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteEventCapacity(rowIdsForEvent(deleteTarget));
      toast.success("Capacity record deleted");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete record");
    } finally {
      setDeleteTarget(null);
    }
  };

  // re-render hook for child events
  void setTick;

  return (
    <div className="min-h-full bg-background">
      <div className="container mx-auto py-8 px-4 sm:px-6 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <TrendingUp className="h-6 w-6 text-primary" />
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl font-bold text-foreground">Capacity Tracker</h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                Track participant capacity outcomes before and after training
              </p>
            </div>
          </div>
          <div className="flex gap-2 flex-shrink-0 flex-wrap">
            {isAdmin() && <CapacityExcelTemplate />}
            {isAdmin() && <CapacityExcelUpload />}
            {user && (
              <Button onClick={() => setAddOpen(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Add record
              </Button>
            )}
            {isAdmin() && <CapacityExcelExport rows={getAllRows()} />}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <Input
            placeholder="Search by event or participant…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="sm:max-w-xs"
          />
          <Select value={eventFilter} onValueChange={setEventFilter}>
            <SelectTrigger className="sm:max-w-xs">
              <SelectValue placeholder="Filter by event" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">All events</SelectItem>
              {events.map((e) => (
                <SelectItem key={e.eventId ?? e.eventFocusArea} value={e.eventId ?? ""}>
                  {e.eventFocusArea}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {filtered.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <div className="h-14 w-14 rounded-2xl bg-muted flex items-center justify-center mb-4">
                <TrendingUp className="h-7 w-7 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-1">No capacity records</h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                {user
                  ? "Click 'Add record' to capture participant scores before and after training."
                  : "Sign in to add capacity records."}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {filtered.map((evt) => {
              const averages = averagesPerCompetency(evt);
              const overall = averages.filter((a) => a.change != null);
              const overallAvg = overall.length
                ? overall.reduce((s, a) => s + (a.change ?? 0), 0) / overall.length
                : null;
              return (
                <Card
                  key={(evt.eventId ?? evt.eventFocusArea) + (evt.eventDate ?? "")}
                  className="hover:border-primary/30 transition-colors cursor-pointer"
                  onClick={() => setDetailsTarget(evt)}
                >
                  <CardContent className="py-4 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="font-semibold text-foreground truncate">{evt.eventFocusArea}</h3>
                        <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-3">
                          {evt.eventDate && (
                            <span>
                              {new Date(evt.eventDate).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })}
                            </span>
                          )}
                          <span className="inline-flex items-center gap-1">
                            <Users className="h-3.5 w-3.5" />
                            {evt.participants.length} participant
                            {evt.participants.length === 1 ? "" : "s"}
                          </span>
                          {overallAvg != null && (
                            <span
                              className={`font-medium ${
                                overallAvg > 0
                                  ? "text-primary"
                                  : overallAvg < 0
                                  ? "text-destructive"
                                  : ""
                              }`}
                            >
                              {overallAvg > 0 ? "+" : ""}
                              {overallAvg.toFixed(2)} avg change
                            </span>
                          )}
                        </p>
                      </div>
                      {user && (
                        <div className="flex gap-1 flex-shrink-0">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditTarget(evt);
                            }}
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </Button>
                          {isAdmin() && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeleteTarget(evt);
                              }}
                            >
                              <Trash2 className="h-3.5 w-3.5 text-destructive" />
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {averages.map(({ competency, change }) => (
                        <Badge key={competency} variant="outline" className="text-[11px] font-normal">
                          {competency}
                          {change != null && (
                            <span
                              className={
                                change > 0
                                  ? "ml-1 text-primary"
                                  : change < 0
                                  ? "ml-1 text-destructive"
                                  : "ml-1"
                              }
                            >
                              {change > 0 ? `+${change.toFixed(2)}` : change.toFixed(2)}
                            </span>
                          )}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <CapacityRecordDialog
        mode="create"
        open={addOpen}
        onOpenChange={setAddOpen}
        events={meetings}
      />
      <CapacityRecordDialog
        mode="edit"
        open={!!editTarget}
        onOpenChange={(o) => !o && setEditTarget(null)}
        events={meetings}
        existing={editTarget ?? undefined}
        existingRowIds={editTarget ? rowIdsForEvent(editTarget) : []}
      />
      <CapacityDetailsDialog
        record={detailsTarget}
        open={!!detailsTarget}
        onOpenChange={(o) => !o && setDetailsTarget(null)}
      />
      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete capacity record?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes all participant scores for {deleteTarget?.eventFocusArea}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Capacity;
