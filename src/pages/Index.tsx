import { useState, useMemo } from "react";
import { ProjectTable, type Project } from "@/components/ProjectTable";
import { ProjectFilters } from "@/components/ProjectFilters";
import { ExcelUpload } from "@/components/ExcelUpload";
import { ExcelTemplate } from "@/components/ExcelTemplate";
import { ExcelExport } from "@/components/ExcelExport";
import { AddProjectDialog } from "@/components/AddProjectDialog";
import { Plus, Activity, CheckCircle2, Clock, Hourglass } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import logo from "@/assets/logo.png";
import { useAuth } from "@/contexts/AuthContext";

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
    status: "Not Yet Started",
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

  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const matchesSearch =
        searchTerm === "" ||
        Object.values(project).some((value) =>
          value.toString().toLowerCase().includes(searchTerm.toLowerCase())
        );
      const matchesStatus = statusFilter === "all" || project.status === statusFilter;
      const matchesEntity = entityFilter === "all" || project.implementingEntity === entityFilter;
      const matchesPartner = partnerFilter === "all" || project.deliveryPartner === partnerFilter;
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

  const completedCount = filteredProjects.filter((p) => p.status === "Completed").length;
  const inProgressCount = filteredProjects.filter((p) => p.status === "In Progress").length;
  const pendingCount = filteredProjects.filter((p) => p.status === "Not Yet Started").length;

  const stats = [
    { label: "Total Activities", value: filteredProjects.length, icon: Activity, color: "primary" as const },
    { label: "Completed", value: completedCount, icon: CheckCircle2, color: "success" as const },
    { label: "In Progress", value: inProgressCount, icon: Clock, color: "warning" as const },
    { label: "Pending", value: pendingCount, icon: Hourglass, color: "muted" as const },
  ];

  const colorMap = {
    primary: { bg: "bg-primary/8", text: "text-primary", border: "border-primary/15", icon: "text-primary" },
    success: { bg: "bg-success/8", text: "text-success", border: "border-success/15", icon: "text-success" },
    warning: { bg: "bg-warning/8", text: "text-warning", border: "border-warning/15", icon: "text-warning" },
    muted: { bg: "bg-muted", text: "text-muted-foreground", border: "border-border", icon: "text-muted-foreground" },
  };

  return (
    <div className="min-h-full bg-background">
      <div className="container mx-auto py-8 px-4 sm:px-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <img src={logo} alt="Logo" className="h-8 w-8 rounded-lg" />
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl font-bold text-foreground">
                Activity Tracker
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                Track and manage all project activities
              </p>
            </div>
          </div>
          {user && (
            <div className="flex flex-wrap gap-2 flex-shrink-0">
              <Button onClick={() => setAddDialogOpen(true)} className="gap-2 shadow-sm">
                <Plus className="h-4 w-4" />
                Add Activity
              </Button>
              <ExcelTemplate />
              <ExcelUpload onUpload={handleExcelUpload} />
              <ExcelExport projects={filteredProjects} />
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {stats.map((stat, i) => {
            const colors = colorMap[stat.color];
            return (
              <div
                key={stat.label}
                className={`rounded-xl border ${colors.border} ${colors.bg} p-4 transition-all duration-200 hover:shadow-md`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-xs font-medium ${colors.text} uppercase tracking-wide`}>
                    {stat.label}
                  </span>
                  <stat.icon className={`h-4 w-4 ${colors.icon} opacity-60`} />
                </div>
                <div className={`text-2xl font-bold ${colors.text}`}>
                  {stat.value}
                </div>
              </div>
            );
          })}
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

        {/* Project Table */}
        <div className="rounded-xl border border-border/60 bg-card shadow-sm overflow-hidden">
          <ProjectTable
            projects={filteredProjects}
            onUpdateProject={handleUpdateProject}
            readOnly={!user}
          />
        </div>

        {user && (
          <AddProjectDialog
            open={addDialogOpen}
            onOpenChange={setAddDialogOpen}
            onAdd={handleAddProject}
          />
        )}
      </div>
    </div>
  );
};

export default Index;
