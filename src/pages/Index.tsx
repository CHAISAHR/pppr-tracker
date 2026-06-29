import { useState, useMemo, useEffect } from "react";
import { api } from "@/services/api";

const STORAGE_KEY = "activity_tracker_projects";

const STATUS_NORMALIZE = (s: any): Project["status"] => {
  const v = String(s ?? "").toLowerCase();
  if (v === "completed") return "Completed";
  if (v === "in progress" || v === "active") return "In Progress";
  if (v === "not yet started" || v === "pending") return "Not Yet Started";
  return (s as Project["status"]) || "Not Yet Started";
};

const fromApi = (r: any): Project => {
  const dp = Array.isArray(r.delivery_partners)
    ? r.delivery_partners
    : (typeof r.delivery_partners === "string" && r.delivery_partners
        ? (() => { try { return JSON.parse(r.delivery_partners); } catch { return [r.delivery_partners]; } })()
        : []);
  return {
    id: r.id,
    activityId: r.activity_id ?? "",
    activityDescription: r.title ?? "",
    subActivityId: r.sub_activity_id ?? "",
    subActivityDescription: r.description ?? "",
    implementingEntity: r.implementing_entity ?? r.organisation ?? "",
    deliveryPartner: Array.isArray(dp) ? dp.join("; ") : String(dp ?? ""),
    status: STATUS_NORMALIZE(r.status),
    startDate: r.start_date ? String(r.start_date).slice(0, 10) : "",
    endDate: r.end_date ? String(r.end_date).slice(0, 10) : "",
    comments: r.comments ?? "",
    modifiedBy: r.modifiedBy ?? r.modified_by_name ?? undefined,
    modifiedAt: r.modifiedAt ?? r.modified_at ?? undefined,
  };
};

const toApi = (p: Partial<Project>) => ({
  title: p.activityDescription,
  description: p.subActivityDescription,
  status: p.status,
  start_date: p.startDate || null,
  end_date: p.endDate || null,
  comments: p.comments ?? null,
  activity_id: p.activityId ?? null,
  sub_activity_id: p.subActivityId ?? null,
  implementing_entity: p.implementingEntity ?? null,
  organisation: p.implementingEntity ?? null,
  delivery_partners: p.deliveryPartner
    ? p.deliveryPartner.split(";").map((s) => s.trim()).filter(Boolean)
    : [],
});
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
  const { user, isAdmin } = useAuth();
  const [projects, setProjects] = useState<Project[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as Project[];
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return initialProjects;
  });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const rows = await api.getProjects();
        if (cancelled) return;
        const mapped = (rows || []).map(fromApi);
        if (mapped.length > 0) setProjects(mapped);
      } catch (err) {
        console.error("Failed to fetch projects:", err);
      }
    })();
    return () => { cancelled = true; };
  }, [user?.id]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
    } catch {}
  }, [projects]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [entityFilter, setEntityFilter] = useState("all");
  const [partnerFilter, setPartnerFilter] = useState("all");
  const [periodFilter, setPeriodFilter] = useState("all");
  const [modifiedByFilter, setModifiedByFilter] = useState("all");
  const [modifiedDateFrom, setModifiedDateFrom] = useState("");
  const [modifiedDateTo, setModifiedDateTo] = useState("");
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

  const modifiedByOptions = useMemo(
    () => Array.from(new Set(projects.map((p) => p.modifiedBy).filter(Boolean) as string[])).sort(),
    [projects]
  );

  const filteredProjects = useMemo(() => {
    const fromTs = modifiedDateFrom ? new Date(modifiedDateFrom).getTime() : null;
    const toTs = modifiedDateTo ? new Date(modifiedDateTo).getTime() + 24 * 60 * 60 * 1000 - 1 : null;
    return projects.filter((project) => {
      const matchesSearch =
        searchTerm === "" ||
        Object.values(project).some((value) =>
          value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
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
      const matchesModifiedBy =
        modifiedByFilter === "all" || project.modifiedBy === modifiedByFilter;
      const modTs = project.modifiedAt ? new Date(project.modifiedAt).getTime() : null;
      const matchesModFrom = fromTs === null || (modTs !== null && modTs >= fromTs);
      const matchesModTo = toTs === null || (modTs !== null && modTs <= toTs);
      return (
        matchesSearch &&
        matchesStatus &&
        matchesEntity &&
        matchesPartner &&
        matchesPeriod &&
        matchesModifiedBy &&
        matchesModFrom &&
        matchesModTo
      );
    });
  }, [projects, searchTerm, statusFilter, entityFilter, partnerFilter, periodFilter, modifiedByFilter, modifiedDateFrom, modifiedDateTo]);

  const handleUpdateProject = (id: string, updates: Partial<Project>) => {
    if (!user) {
      toast.error("Please log in to update projects");
      return;
    }
    const stamped: Partial<Project> = {
      ...updates,
      modifiedBy: user.name || user.email,
      modifiedAt: new Date().toISOString(),
    };
    setProjects((prev) =>
      prev.map((project) =>
        project.id === id ? { ...project, ...stamped } : project
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
    setModifiedByFilter("all");
    setModifiedDateFrom("");
    setModifiedDateTo("");
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
    { label: "Not Yet Started", value: pendingCount, icon: Hourglass, color: "muted" as const },
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
              {isAdmin() && <ExcelTemplate />}
              {isAdmin() && <ExcelUpload onUpload={handleExcelUpload} />}
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
          modifiedByFilter={modifiedByFilter}
          onModifiedByFilterChange={setModifiedByFilter}
          modifiedDateFrom={modifiedDateFrom}
          onModifiedDateFromChange={setModifiedDateFrom}
          modifiedDateTo={modifiedDateTo}
          onModifiedDateToChange={setModifiedDateTo}
          onClearFilters={handleClearFilters}
          implementingEntities={implementingEntities}
          deliveryPartners={deliveryPartners}
          periods={periods}
          modifiedByOptions={modifiedByOptions}
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
