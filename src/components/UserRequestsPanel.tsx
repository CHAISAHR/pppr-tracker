import { useEffect, useState } from "react";
import { api } from "@/services/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Check, X, UserPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface UserRequest {
  id: string;
  name: string;
  email: string;
  organization?: string | null;
  requested_at?: string;
}

export function UserRequestsPanel() {
  const [requests, setRequests] = useState<UserRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [roleSelections, setRoleSelections] = useState<Record<string, 'admin' | 'user'>>({});
  const { toast } = useToast();

  const load = async () => {
    try {
      setLoading(true);
      const data = await api.getUserRequests();
      setRequests(data);
    } catch {
      toast({ title: "Error", description: "Failed to load requests", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const approve = async (id: string) => {
    setBusy(id);
    try {
      await api.approveUserRequest(id, roleSelections[id] || 'user');
      toast({ title: "Approved", description: "User account created." });
      setRequests(prev => prev.filter(r => r.id !== id));
    } catch (e: any) {
      toast({ title: "Error", description: e.message || "Failed to approve", variant: "destructive" });
    } finally { setBusy(null); }
  };

  const reject = async (id: string) => {
    setBusy(id);
    try {
      await api.rejectUserRequest(id);
      toast({ title: "Rejected", description: "Request declined." });
      setRequests(prev => prev.filter(r => r.id !== id));
    } catch (e: any) {
      toast({ title: "Error", description: e.message || "Failed to reject", variant: "destructive" });
    } finally { setBusy(null); }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-primary" />
              User Access Requests
            </CardTitle>
            <CardDescription>Approve or reject new sign-up requests</CardDescription>
          </div>
          {requests.length > 0 && <Badge variant="secondary">{requests.length} pending</Badge>}
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-6 text-muted-foreground text-sm">Loading…</div>
        ) : requests.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground text-sm">No pending requests</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Organisation</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map(r => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">{r.name}</TableCell>
                  <TableCell>{r.email}</TableCell>
                  <TableCell className="text-muted-foreground">{r.organization || '—'}</TableCell>
                  <TableCell>
                    <Select
                      value={roleSelections[r.id] || 'user'}
                      onValueChange={(v: 'admin' | 'user') => setRoleSelections(s => ({ ...s, [r.id]: v }))}
                    >
                      <SelectTrigger className="h-8 w-28"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">User</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Button size="sm" variant="outline" disabled={busy === r.id} onClick={() => approve(r.id)} className="gap-1">
                        <Check className="h-4 w-4" /> Approve
                      </Button>
                      <Button size="sm" variant="ghost" disabled={busy === r.id} onClick={() => reject(r.id)} className="gap-1 text-destructive hover:text-destructive">
                        <X className="h-4 w-4" /> Reject
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
