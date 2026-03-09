import { useState } from "react";
import { Plus, Target, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { IndicatorsTab } from "@/components/performance/IndicatorsTab";
import { SubActivitiesTab } from "@/components/performance/SubActivitiesTab";
import { PerformanceDataTab } from "@/components/performance/PerformanceDataTab";
import { AddIndicatorDialog } from "@/components/performance/AddIndicatorDialog";
import { useAuth } from "@/contexts/AuthContext";

export default function Performance() {
  const { user } = useAuth();
  const [addIndicatorOpen, setAddIndicatorOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <TrendingUp className="h-8 w-8 text-primary" />
            Indicator Reporting
          </h1>
          <p className="text-muted-foreground mt-1">
            Track performance indicators for activities and sub-activities
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" />
              Indicators
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Track metrics</div>
            <p className="text-xs text-muted-foreground mt-1">
              Define and manage performance indicators
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Sub-Activities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Task breakdown</div>
            <p className="text-xs text-muted-foreground mt-1">
              Create sub-activities for detailed tracking
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Performance Data</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Target vs Actual</div>
            <p className="text-xs text-muted-foreground mt-1">
              Record and compare performance metrics
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="indicators" className="space-y-4">
        <TabsList>
          <TabsTrigger value="indicators">Indicators</TabsTrigger>
          <TabsTrigger value="sub-activities">Sub-Activities</TabsTrigger>
          <TabsTrigger value="data">Performance Data</TabsTrigger>
        </TabsList>

        <TabsContent value="indicators" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold">Performance Indicators</h2>
              <p className="text-sm text-muted-foreground">
                Define metrics to track across your activities
              </p>
            </div>
            {user && (
              <Button onClick={() => setAddIndicatorOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Indicator
              </Button>
            )}
          </div>
          <IndicatorsTab key={`indicators-${refreshKey}`} onUpdate={handleRefresh} />
        </TabsContent>

        <TabsContent value="sub-activities" className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold">Sub-Activities</h2>
            <p className="text-sm text-muted-foreground">
              Break down activities into manageable tasks
            </p>
          </div>
          <SubActivitiesTab key={`sub-${refreshKey}`} onUpdate={handleRefresh} />
        </TabsContent>

        <TabsContent value="data" className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold">Performance Data</h2>
            <p className="text-sm text-muted-foreground">
              Track targets and actual achievements for your indicators
            </p>
          </div>
          <PerformanceDataTab key={`data-${refreshKey}`} onUpdate={handleRefresh} />
        </TabsContent>
      </Tabs>

      {user && (
        <AddIndicatorDialog
          open={addIndicatorOpen}
          onOpenChange={setAddIndicatorOpen}
          onSuccess={handleRefresh}
        />
      )}
    </div>
  );
}
