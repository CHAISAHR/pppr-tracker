import { useEffect, useState } from "react";
import { Check, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/services/api";

const TYPE_LABEL: Record<string, string> = {
  project: "Activity Tracker", indicator: "Indicator Tracker", risk: "Risk Register", meeting: "Event Schedule",
};

/** Admin list of pending deletion requests: approve deletes the record, reject keeps it. */
export function DeletionRequestsPanel() {
  const [items, setItems] = useState<any[]>([]);
  const [busy, setBusy] = useState<string | null>(null);

  const load = () => api.getDeletionRequests().then(setItems).catch(() => setItems([]));
  useEffect(() => { load(); }, []);

  const review = async (id: string, action: "approve" | "reject") => {
    setBusy(id);
    try {
      await api.reviewDeletionRequest(id, action);
      toast.success(action === "approve" ? "Record deleted" : "Request rejected — record kept");
      setItems((p) => p.filter((r) => r.id !== id));
    } catch (e: any) {
      toast.error(e.message || "Failed");
    } finally {
      setBusy(null);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Trash2 className="h-5 w-5 text-destructive" /> Deletion requests
          {items.length > 0 && <Badge variant="destructive">{items.length}</Badge>}
        </CardTitle>
        <CardDescription>Users can ask for records to be deleted. Approving deletes the record permanently.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">No pending deletion requests.</p>
        ) : items.map((r) => (
          <div key={r.id} className="rounded-lg border border-border p-3 flex flex-col sm:flex-row sm:items-start gap-3">
            <div className="flex-1 min-w-0 space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline">{TYPE_LABEL[r.recordType] || r.recordType}</Badge>
                <span className="font-medium truncate">{r.recordLabel || r.recordId}</span>
              </div>
              <p className="text-sm whitespace-pre-wrap"><span className="text-muted-foreground">Reason: </span>{r.reason}</p>
              <p className="text-xs text-muted-foreground">
                {r.requestedByName || "Unknown user"}{r.organisation ? ` · ${r.organisation}` : ""}
                {r.requestedAt ? ` · ${new Date(r.requestedAt).toLocaleString()}` : ""}
              </p>
            </div>
            <div className="flex gap-2 shrink-0">
              <Button size="sm" variant="destructive" disabled={busy === r.id} onClick={() => review(r.id, "approve")} className="gap-1">
                <Check className="h-4 w-4" /> Delete
              </Button>
              <Button size="sm" variant="outline" disabled={busy === r.id} onClick={() => review(r.id, "reject")} className="gap-1">
                <X className="h-4 w-4" /> Keep
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
