import { useState, useMemo } from "react";
import { ProjectTable, type Project } from "@/components/ProjectTable";
import { ProjectFilters } from "@/components/ProjectFilters";
import { ExcelUpload } from "@/components/ExcelUpload";
import { ExcelTemplate } from "@/components/ExcelTemplate";
import { ExcelExport } from "@/components/ExcelExport";
import { AddProjectDialog } from "@/components/AddProjectDialog";
import { Plus, Activity, CheckCircle2, Clock, Hourglass, AlertTriangle, Target, MapPin, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
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

const workstreams = [
  {
    title: "Early Warning & Surveillance",
    emoji: "🔍",
    progress: 70,
    color: "hsl(var(--success))",
    description: "STAR workshops completed, One Health indicators identified",
  },
  {
    title: "Laboratory Systems",
    emoji: "🔬",
    progress: 75,
    color: "hsl(var(--primary))",
    description: "National PPPR Plan drafted, One Health frameworks advanced",
  },
  {
    title: "Human Resources",
    emoji: "👥",
    progress: 45,
    color: "hsl(var(--warning))",
    description: "Scoping mission planned, stakeholder engagements ongoing",
  },
  {
    title: "Monitoring & Evaluation",
    emoji: "📊",
    progress: 65,
    color: "hsl(var(--success))",
    description: "M&E framework developed, dashboard prototype ready",
  },
];

type DashboardTab = "overview" | "implementation" | "success" | "challenges" | "priorities";

const Index = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [entityFilter, setEntityFilter] = useState("all");
  const [partnerFilter, setPartnerFilter] = useState("all");
  const [periodFilter, setPeriodFilter] = useState("all");
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<DashboardTab>("overview");

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

  const tabs: { key: DashboardTab; label: string }[] = [
    { key: "overview", label: "Programme Overview" },
    { key: "implementation", label: "Implementation Status" },
    { key: "success", label: "Success Stories" },
    { key: "challenges", label: "Challenges & Risks" },
    { key: "priorities", label: "Next Quarter Priorities" },
  ];

  const overviewStats = [
    { label: "Total Grant Value", value: "USD 1.03M", icon: Activity },
    { label: "Workstreams", value: "4", icon: Layers },
    { label: "Priority Activities", value: "12", icon: Target },
    { label: "Provinces Covered", value: "9", icon: MapPin },
  ];

  return (
    <div className="min-h-full bg-[hsl(220,25%,14%)]">
      {/* Hero Header */}
      <div className="px-4 sm:px-6 lg:px-8 pt-8 pb-6">
        <div className="max-w-7xl mx-auto text-center space-y-3">
          <h1 className="text-3xl sm:text-4xl font-bold text-[hsl(210,30%,85%)]">
            PPPR Programme Implementation Status
          </h1>
          <p className="text-[hsl(210,20%,65%)] text-base sm:text-lg">
            Building a Resilient Future: Strengthening Pandemic Preparedness through One Health
          </p>
          <div className="inline-block">
            <span className="text-sm text-[hsl(210,20%,60%)] bg-[hsl(220,25%,20%)] px-4 py-1.5 rounded-full border border-[hsl(220,20%,25%)]">
              Reporting Period: March - December 2025
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 space-y-6">
        {/* Tab Navigation */}
        <div className="bg-[hsl(220,22%,18%)] rounded-2xl border border-[hsl(220,20%,22%)] p-1.5">
          <div className="flex flex-wrap gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 sm:px-6 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                  activeTab === tab.key
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "text-[hsl(210,20%,60%)] hover:text-[hsl(210,20%,80%)] hover:bg-[hsl(220,22%,22%)]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Programme Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {overviewStats.map((stat) => (
                <div
                  key={stat.label}
                  className="bg-[hsl(220,22%,18%)] rounded-2xl border border-[hsl(220,20%,24%)] p-5 text-center transition-all duration-200 hover:border-[hsl(220,20%,30%)]"
                >
                  <div className="text-2xl sm:text-3xl font-bold text-[hsl(210,30%,85%)] mb-1">
                    {stat.value}
                  </div>
                  <div className="text-sm text-[hsl(210,20%,55%)]">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>

            {/* Workstream Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {workstreams.map((ws) => (
                <div
                  key={ws.title}
                  className="bg-[hsl(220,22%,18%)] rounded-2xl border border-[hsl(220,20%,24%)] p-5 space-y-3 transition-all duration-200 hover:border-[hsl(220,20%,30%)]"
                >
                  <h3 className="text-lg font-semibold text-[hsl(210,30%,85%)] flex items-center gap-2">
                    <span>{ws.emoji}</span> {ws.title}
                  </h3>
                  <div className="relative h-2 w-full rounded-full bg-[hsl(220,20%,25%)] overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${ws.progress}%`,
                        background: ws.color,
                      }}
                    />
                  </div>
                  <p className="text-sm text-[hsl(210,20%,60%)]">
                    <span className="font-semibold text-[hsl(210,25%,75%)]">{ws.progress}% Progress:</span>{" "}
                    {ws.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Implementation Status Tab */}
        {activeTab === "implementation" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Activity Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { label: "Total Activities", value: filteredProjects.length, color: "hsl(var(--primary))" },
                { label: "Completed", value: completedCount, color: "hsl(var(--success))" },
                { label: "In Progress", value: inProgressCount, color: "hsl(var(--warning))" },
                { label: "Not Yet Started", value: pendingCount, color: "hsl(var(--muted-foreground))" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="bg-[hsl(220,22%,18%)] rounded-2xl border border-[hsl(220,20%,24%)] p-4 text-center"
                >
                  <div className="text-2xl font-bold mb-1" style={{ color: stat.color }}>
                    {stat.value}
                  </div>
                  <div className="text-xs text-[hsl(210,20%,55%)] uppercase tracking-wide font-medium">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>

            {/* Actions */}
            {user && (
              <div className="flex flex-wrap gap-2">
                <Button onClick={() => setAddDialogOpen(true)} className="gap-2 shadow-sm">
                  <Plus className="h-4 w-4" />
                  Add Activity
                </Button>
                <ExcelTemplate />
                <ExcelUpload onUpload={handleExcelUpload} />
                <ExcelExport projects={filteredProjects} />
              </div>
            )}

            {/* Filters */}
            <div className="bg-[hsl(220,22%,18%)] rounded-2xl border border-[hsl(220,20%,24%)] p-4">
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
            </div>

            {/* Table */}
            <div className="rounded-2xl border border-[hsl(220,20%,24%)] bg-[hsl(220,22%,18%)] overflow-hidden">
              <ProjectTable
                projects={filteredProjects}
                onUpdateProject={handleUpdateProject}
                readOnly={!user}
              />
            </div>
          </div>
        )}

        {/* Success Stories Tab */}
        {activeTab === "success" && (
          <div className="bg-[hsl(220,22%,18%)] rounded-2xl border border-[hsl(220,20%,24%)] p-8 text-center animate-in fade-in duration-300">
            <CheckCircle2 className="h-12 w-12 mx-auto mb-4 text-[hsl(var(--success))]" />
            <h2 className="text-xl font-semibold text-[hsl(210,30%,85%)] mb-2">Success Stories</h2>
            <p className="text-[hsl(210,20%,55%)]">
              Key achievements and milestones from the programme will be showcased here.
            </p>
          </div>
        )}

        {/* Challenges & Risks Tab */}
        {activeTab === "challenges" && (
          <div className="bg-[hsl(220,22%,18%)] rounded-2xl border border-[hsl(220,20%,24%)] p-8 text-center animate-in fade-in duration-300">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-[hsl(var(--warning))]" />
            <h2 className="text-xl font-semibold text-[hsl(210,30%,85%)] mb-2">Challenges & Risks</h2>
            <p className="text-[hsl(210,20%,55%)]">
              Identified challenges, risks, and mitigation strategies will be documented here.
            </p>
          </div>
        )}

        {/* Next Quarter Priorities Tab */}
        {activeTab === "priorities" && (
          <div className="bg-[hsl(220,22%,18%)] rounded-2xl border border-[hsl(220,20%,24%)] p-8 text-center animate-in fade-in duration-300">
            <Target className="h-12 w-12 mx-auto mb-4 text-[hsl(var(--primary))]" />
            <h2 className="text-xl font-semibold text-[hsl(210,30%,85%)] mb-2">Next Quarter Priorities</h2>
            <p className="text-[hsl(210,20%,55%)]">
              Priority activities and targets for the upcoming quarter will be outlined here.
            </p>
          </div>
        )}

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
