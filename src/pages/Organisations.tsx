import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2 } from "lucide-react";

interface OrganisationData {
  name: string;
  count: number;
  attendees: string[];
}

const Organisations = () => {
  const { isAdmin } = useAuth();
  const { toast } = useToast();
  const [organisations, setOrganisations] = useState<OrganisationData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrganisations();
  }, []);

  const loadOrganisations = async () => {
    try {
      setLoading(true);
      const data = await api.getOrganisations();
      setOrganisations(data);
    } catch (error) {
      console.error('Failed to load organisations:', error);
      toast({
        title: "Error",
        description: "Failed to load organisations. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin()) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>You don't have permission to view this page.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Building2 className="h-8 w-8" />
            Organisations
          </h1>
          <p className="text-muted-foreground mt-2">
            View organisations from workshop attendance registrations
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Organisations</CardTitle>
          <CardDescription>
            {organisations.length} organisation(s) found from workshop registrations
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading organisations...</div>
          ) : organisations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No organisations found. They will appear here once users register for workshops.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Organisation Name</TableHead>
                  <TableHead className="text-right">Number of Attendees</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {organisations.map((org, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{org.name}</TableCell>
                    <TableCell className="text-right">{org.count}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Organisations;
