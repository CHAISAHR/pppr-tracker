import { useState } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/services/api";

interface Props {
  recordType: "project" | "indicator" | "risk" | "meeting";
  recordId: string;
  recordLabel: string;
  className?: string;
}

/** For general users: asks an admin to delete a record, with a reason. */
export function RequestDeletionButton({ recordType, recordId, recordLabel, className }: Props) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!reason.trim()) { toast.error("Please give a reason"); return; }
    setSaving(true);
    try {
      await api.requestDeletion({ recordType, recordId, recordLabel, reason: reason.trim() });
      toast.success("Deletion request sent to an admin");
      setOpen(false);
      setReason("");
    } catch (e: any) {
      toast.error(e.message || "Failed to send request");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Button
        variant="ghost" size="sm" title="Request deletion"
        className={className ?? "h-8 w-8 p-0 text-muted-foreground hover:text-destructive"}
        onClick={(e) => { e.stopPropagation(); setOpen(true); }}
      >
        <Trash2 className="h-3.5 w-3.5" />
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md" onClick={(e) => e.stopPropagation()}>
          <DialogHeader>
            <DialogTitle>Request deletion</DialogTitle>
            <DialogDescription>
              Only admins can delete records. Tell them why “{recordLabel || "this record"}” should be removed.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="del-reason">Reason *</Label>
            <Textarea id="del-reason" rows={4} maxLength={2000} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Duplicate of another entry" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={submit} disabled={saving}>{saving ? "Sending..." : "Send request"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
