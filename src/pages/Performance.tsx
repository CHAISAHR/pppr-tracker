import { useState } from "react";
import { Plus, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { IndicatorsTab } from "@/components/performance/IndicatorsTab";
import { AddIndicatorDialog } from "@/components/performance/AddIndicatorDialog";
import { IndicatorExcelTemplate } from "@/components/performance/IndicatorExcelTemplate";
import { IndicatorExcelUpload } from "@/components/performance/IndicatorExcelUpload";
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
            Define and track performance indicators across your activities
          </p>
        </div>
        {user && (
          <div className="flex items-center gap-2">
            <IndicatorExcelTemplate />
            <IndicatorExcelUpload onSuccess={handleRefresh} />
            <Button onClick={() => setAddIndicatorOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Indicator
            </Button>
          </div>
        )}
      </div>

      <IndicatorsTab key={`indicators-${refreshKey}`} onUpdate={handleRefresh} />

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
