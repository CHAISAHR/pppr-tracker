import { useEffect, useState } from "react";
import { Bell, Check, X, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/services/api";
import { useNavigate } from "react-router-dom";

interface UserRequest {
  id: string;
  name: string;
  email: string;
  organization?: string | null;
  requested_at?: string;
}

export function PendingRequestsBell() {
  const [requests, setRequests] = useState<UserRequest[]>([]);
  const [count, setCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const loadCount = async () => {
    try {
      const c = await api.getUserRequestsCount();
      setCount(c);
    } catch { /* silent */ }
  };

  const loadList = async () => {
    try {
      const data = await api.getUserRequests();
      setRequests(data);
      setCount(data.length);
    } catch { /* silent */ }
  };

  useEffect(() => {
    loadCount();
    const interval = setInterval(loadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (open) loadList();
  }, [open]);

  const handleApprove = async (id: string) => {
    setBusy(id);
    try {
      await api.approveUserRequest(id, 'user');
      toast({ title: "Approved", description: "User account has been created." });
      setRequests(prev => prev.filter(r => r.id !== id));
      setCount(c => Math.max(0, c - 1));
    } catch (e: any) {
      toast({ title: "Error", description: e.message || "Failed to approve", variant: "destructive" });
    } finally {
      setBusy(null);
    }
  };

  const handleReject = async (id: string) => {
    setBusy(id);
    try {
      await api.rejectUserRequest(id);
      toast({ title: "Rejected", description: "Request has been declined." });
      setRequests(prev => prev.filter(r => r.id !== id));
      setCount(c => Math.max(0, c - 1));
    } catch (e: any) {
      toast({ title: "Error", description: e.message || "Failed to reject", variant: "destructive" });
    } finally {
      setBusy(null);
    }
  };

  const badgeText = count > 9 ? "9+" : String(count);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative hover:bg-muted" aria-label="User requests">
          <Bell className="h-5 w-5" />
          {count > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center ring-2 ring-card">
              {badgeText}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-96 p-0">
        <div className="px-4 py-3 border-b flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserPlus className="h-4 w-4 text-primary" />
            <h3 className="font-semibold text-sm">User Requests</h3>
          </div>
          {count > 0 && <Badge variant="secondary">{count} pending</Badge>}
        </div>
        <ScrollArea className="max-h-80">
          {requests.length === 0 ? (
            <div className="py-10 text-center text-sm text-muted-foreground">
              No pending requests
            </div>
          ) : (
            <ul className="divide-y">
              {requests.map(r => (
                <li key={r.id} className="px-4 py-3 hover:bg-muted/40">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm truncate">{r.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{r.email}</p>
                      {r.organization && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          <span className="text-foreground/60">Org:</span> {r.organization}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 text-green-600 hover:text-green-700 hover:bg-green-50"
                        onClick={() => handleApprove(r.id)}
                        disabled={busy === r.id}
                        aria-label="Approve"
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => handleReject(r.id)}
                        disabled={busy === r.id}
                        aria-label="Reject"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </ScrollArea>
        <div className="border-t px-3 py-2">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-center text-xs"
            onClick={() => { setOpen(false); navigate('/administration'); }}
          >
            View all in Administration
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
