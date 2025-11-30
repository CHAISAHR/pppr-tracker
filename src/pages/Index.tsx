import { useState, useMemo } from "react";
import { ProjectTable, type Project } from "@/components/ProjectTable";
import { ProjectFilters } from "@/components/ProjectFilters";
import { ExcelUpload } from "@/components/ExcelUpload";
import { ExcelTemplate } from "@/components/ExcelTemplate";
import { ExcelExport } from "@/components/ExcelExport";
import { AddProjectDialog } from "@/components/AddProjectDialog";
import { ClipboardList, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { IndicatorsTab } from "@/components/performance/IndicatorsTab";
import { SubActivitiesTab } from "@/components/performance/SubActivitiesTab";
import { PerformanceDataTab } from "@/components/performance/PerformanceDataTab";
import { AddIndicatorDialog } from "@/components/performance/AddIndicatorDialog";
import { toast } from "sonner";
import logo from "@/assets/logo.png";
import { useAuth } from "@/contexts/AuthContext";

// Sample data
const initialProjects: Project[] = [
  {
    id: "1",
    activityId: "ACT-001",
    activityDescription: "Infrastructure Development",
    subActivityId: "SUB-001",
    subActivityDescription: "Build network backbone",
    implementingEntity: "Tech Solutions Inc",
    deliveryPartner: "Global Systems",
    status: "In Progress",
    startDate: "2024-10-01",
    endDate: "2024-12-31",
    comments: "On track, awaiting vendor approval",
  },
  {
    id: "2",
    activityId: "ACT-002",
    activityDescription: "Software Deployment",
    subActivityId: "SUB-002",
    subActivityDescription: "Deploy CRM system",
    implementingEntity: "Digital Innovations",
    deliveryPartner: "Cloud Services Ltd",
    status: "Completed",
    startDate: "2024-07-01",
    endDate: "2024-09-30",
    comments: "Successfully deployed ahead of schedule",
  },
  {
    id: "3",
    activityId: "ACT-003",
    activityDescription: "User Training Program",
    subActivityId: "SUB-003",
    subActivityDescription: "Conduct system training",
    implementingEntity: "Learning Corp",
    deliveryPartner: "Training Partners",
    status: "Pending",
    startDate: "2025-01-01",
    endDate: "2025-03-31",
    comments: "Waiting for resource allocation",
  },
  {
    id: "4",
    activityId: "ACT-004",
    activityDescription: "Security Audit",
    subActivityId: "SUB-004",
    subActivityDescription: "Perform comprehensive security assessment",
    implementingEntity: "SecureIT",
    deliveryPartner: "Audit Associates",
    status: "In Progress",
    startDate: "2024-10-15",
    endDate: "2024-12-15",
    comments: "Phase 1 completed, moving to phase 2",
  },
  {
    id: "5",
    activityId: "ACT-005",
    activityDescription: "Data Migration",
    subActivityId: "SUB-005",
    subActivityDescription: "Migrate legacy data to new platform",
    implementingEntity: "Tech Solutions Inc",
    deliveryPartner: "Data Systems Co",
    status: "Completed",
    startDate: "2024-04-01",
    endDate: "2024-06-30",
    comments: "All data successfully migrated and validated",
  },
];

const Index = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [entityFilter, setEntityFilter] = useState("all");
  const [partnerFilter, setPartnerFilter] = useState("all");
  const [periodFilter, setPeriodFilter] = useState("all");
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [addIndicatorOpen, setAddIndicatorOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  // Get unique entities and partners for filters
  const implementingEntities = useMemo(
    () => Array.from(new Set(projects.map((p) => p.implementingEntity))),
    [projects]
  );

  const deliveryPartners = useMemo(
    () => Array.from(new Set(projects.map((p) => p.deliveryPartner))),
    [projects]
  );

  const periods = useMemo(() => {
    const periodSet = new Set<string>();
    projects.forEach((p) => {
      if (p.startDate) {
        const date = new Date(p.startDate);
        const quarter = Math.floor(date.getMonth() / 3) + 1;
        const year = date.getFullYear();
        periodSet.add(`Q${quarter} ${year}`);
      }
    });
    return Array.from(periodSet).sort();
  }, [projects]);

  // Filter projects
  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const matchesSearch =
        searchTerm === "" ||
        Object.values(project).some((value) =>
          value.toString().toLowerCase().includes(searchTerm.toLowerCase())
        );

      const matchesStatus =
        statusFilter === "all" || project.status === statusFilter;

      const matchesEntity =
        entityFilter === "all" || project.implementingEntity === entityFilter;

      const matchesPartner =
        partnerFilter === "all" || project.deliveryPartner === partnerFilter;

      const matchesPeriod =
        periodFilter === "all" || (() => {
          if (!project.startDate) return false;
          const date = new Date(project.startDate);
          const quarter = Math.floor(date.getMonth() / 3) + 1;
          const year = date.getFullYear();
          return `Q${quarter} ${year}` === periodFilter;
        })();

      return matchesSearch && matchesStatus && matchesEntity && matchesPartner && matchesPeriod;
    });
  }, [projects, searchTerm, statusFilter, entityFilter, partnerFilter, periodFilter]);

  const handleUpdateProject = (id: string, updates: Partial<Project>) => {
    if (!user) {
      toast.error("Please log in to update projects");
      return;
    }
    setProjects((prev) =>
      prev.map((project) =>
        project.id === id ? { ...project, ...updates } : project
      )
    );
    toast.success("Project updated successfully");
  };

  const handleExcelUpload = (newProjects: Project[]) => {
    setProjects((prev) => [...prev, ...newProjects]);
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setEntityFilter("all");
    setPartnerFilter("all");
    setPeriodFilter("all");
  };

  const handleAddProject = (projectData: Omit<Project, "id">) => {
    const newProject: Project = {
      ...projectData,
      id: Date.now().toString(),
    };
    setProjects((prev) => [...prev, newProject]);
  };

  return (
    <div className="bg-gradient-subtle min-h-screen">
      <div className="container mx-auto py-8 px-4 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 animate-fade-in">
          <div className="flex items-center gap-3">
            <img src={logo} alt="Project Management Logo" className="h-12 w-12 rounded-lg animate-float" />
            <div>
            <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Pandemic Fund Activity Tracker
            </h1>
              <p className="text-muted-foreground">
                Track and manage all project activities
              </p>
            </div>
          </div>
          {user && (
            <div className="flex gap-2">
              <Button onClick={() => setAddDialogOpen(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Add Activity
              </Button>
              <ExcelTemplate />
              <ExcelUpload onUpload={handleExcelUpload} />
              <ExcelExport projects={filteredProjects} />
            </div>
          )}
        </div>

        {/* Filters */}
        <ProjectFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          entityFilter={entityFilter}
          onEntityFilterChange={setEntityFilter}
          partnerFilter={partnerFilter}
          onPartnerFilterChange={setPartnerFilter}
          periodFilter={periodFilter}
          onPeriodFilterChange={setPeriodFilter}
          onClearFilters={handleClearFilters}
          implementingEntities={implementingEntities}
          deliveryPartners={deliveryPartners}
          periods={periods}
        />

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-card/80 backdrop-blur-sm rounded-lg border-2 border-primary/20 p-6 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 hover:scale-105 animate-fade-in">
            <div className="text-sm font-medium text-primary mb-2">Total Projects</div>
            <div className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              {filteredProjects.length}
            </div>
          </div>
          <div className="bg-card/80 backdrop-blur-sm rounded-lg border-2 border-success/20 p-6 hover:shadow-lg hover:shadow-success/10 transition-all duration-300 hover:scale-105 animate-fade-in" style={{ animationDelay: '100ms' }}>
            <div className="text-sm font-medium text-success mb-2">Completed</div>
            <div className="text-3xl font-bold text-success">
              {filteredProjects.filter((p) => p.status === "Completed").length}
            </div>
          </div>
          <div className="bg-card/80 backdrop-blur-sm rounded-lg border-2 border-warning/20 p-6 hover:shadow-lg hover:shadow-warning/10 transition-all duration-300 hover:scale-105 animate-fade-in" style={{ animationDelay: '200ms' }}>
            <div className="text-sm font-medium text-warning mb-2">In Progress</div>
            <div className="text-3xl font-bold text-warning">
              {filteredProjects.filter((p) => p.status === "In Progress").length}
            </div>
          </div>
          <div className="bg-card/80 backdrop-blur-sm rounded-lg border-2 border-border p-6 hover:shadow-lg hover:shadow-muted/10 transition-all duration-300 hover:scale-105 animate-fade-in" style={{ animationDelay: '300ms' }}>
            <div className="text-sm font-medium text-muted-foreground mb-2">Pending</div>
            <div className="text-3xl font-bold text-muted-foreground">
              {filteredProjects.filter((p) => p.status === "Pending").length}
            </div>
          </div>
        </div>

        {/* Tabs: Activities and Performance */}
        <Tabs defaultValue="activities" className="space-y-4">
          <TabsList>
            <TabsTrigger value="activities">Activity Tracker</TabsTrigger>
            <TabsTrigger value="performance">Performance Tracking</TabsTrigger>
          </TabsList>

          <TabsContent value="activities" className="space-y-4">
            <ProjectTable
              projects={filteredProjects}
              onUpdateProject={handleUpdateProject}
              readOnly={!user}
            />
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <div className="space-y-4">
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
            </div>

            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-semibold">Sub-Activities</h2>
                <p className="text-sm text-muted-foreground">
                  Break down activities into manageable tasks
                </p>
              </div>
              <SubActivitiesTab key={`sub-${refreshKey}`} onUpdate={handleRefresh} />
            </div>

            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-semibold">Performance Data</h2>
                <p className="text-sm text-muted-foreground">
                  Track targets and actual achievements for your indicators
                </p>
              </div>
              <PerformanceDataTab key={`data-${refreshKey}`} onUpdate={handleRefresh} />
            </div>
          </TabsContent>
        </Tabs>

        {/* Add Project Dialog */}
        {user && (
          <>
            <AddProjectDialog
              open={addDialogOpen}
              onOpenChange={setAddDialogOpen}
              onAdd={handleAddProject}
            />
            <AddIndicatorDialog
              open={addIndicatorOpen}
              onOpenChange={setAddIndicatorOpen}
              onSuccess={handleRefresh}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default Index;
