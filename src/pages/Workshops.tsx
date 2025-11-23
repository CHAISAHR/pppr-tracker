import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus } from "lucide-react";
import { WorkshopTable } from "@/components/WorkshopTable";
import { AddWorkshopDialog } from "@/components/AddWorkshopDialog";
import { WorkshopAttendanceForm } from "@/components/WorkshopAttendanceForm";

export default function Workshops() {
  const { isAdmin, user } = useAuth();
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Workshops & Trainings</h1>
          <p className="text-muted-foreground mt-1">
            {user ? 'Manage and register for workshops' : 'Register for workshops'}
          </p>
        </div>
        {isAdmin() && (
          <Button onClick={() => setAddDialogOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Workshop
          </Button>
        )}
      </div>

      <Tabs defaultValue={isAdmin() ? "manage" : "register"} className="w-full">
        <TabsList className="grid w-full max-w-md" style={{ gridTemplateColumns: isAdmin() ? '1fr 1fr' : '1fr' }}>
          {isAdmin() && <TabsTrigger value="manage">Manage Workshops</TabsTrigger>}
          <TabsTrigger value="register">Register Attendance</TabsTrigger>
        </TabsList>

        {isAdmin() && (
          <TabsContent value="manage">
            <Card>
              <CardHeader>
                <CardTitle>Workshop Management</CardTitle>
                <CardDescription>Create and manage workshops and training sessions</CardDescription>
              </CardHeader>
              <CardContent>
                <WorkshopTable />
              </CardContent>
            </Card>
          </TabsContent>
        )}

        <TabsContent value="register">
          <Card>
            <CardHeader>
              <CardTitle>Register for Workshop</CardTitle>
              <CardDescription>Select a workshop and register your attendance</CardDescription>
            </CardHeader>
            <CardContent>
              <WorkshopAttendanceForm />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {isAdmin() && (
        <AddWorkshopDialog open={addDialogOpen} onOpenChange={setAddDialogOpen} />
      )}
    </div>
  );
}
