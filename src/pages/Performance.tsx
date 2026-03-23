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
    <div className="min-h-full bg-background">
      <div className="container mx-auto py-8 px-4 sm:px-6 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <TrendingUp className="h-6 w-6 text-primary" />
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl font-bold text-foreground">
                Indicator Tracker
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                Define and track performance indicators across your activities
              </p>
            </div>
          </div>
          {user && (
            <div className="flex flex-wrap items-center gap-2 flex-shrink-0">
              <IndicatorExcelTemplate />
              <IndicatorExcelUpload onSuccess={handleRefresh} />
              <Button onClick={() => setAddIndicatorOpen(true)} className="gap-2 shadow-sm">
                <Plus className="h-4 w-4" />
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
    </div>
  );
}
