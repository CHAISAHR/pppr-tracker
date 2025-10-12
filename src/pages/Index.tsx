import { useState, useMemo } from "react";
import { ProjectTable, type Project } from "@/components/ProjectTable";
import { ProjectFilters } from "@/components/ProjectFilters";
import { ClipboardList } from "lucide-react";
import { toast } from "sonner";

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
    timeline: "Q4 2024",
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
    timeline: "Q3 2024",
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
    timeline: "Q1 2025",
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
    timeline: "Q4 2024",
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
    timeline: "Q2 2024",
    comments: "All data successfully migrated and validated",
  },
];

const Index = () => {
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [entityFilter, setEntityFilter] = useState("all");
  const [partnerFilter, setPartnerFilter] = useState("all");

  // Get unique entities and partners for filters
  const implementingEntities = useMemo(
    () => Array.from(new Set(projects.map((p) => p.implementingEntity))),
    [projects]
  );

  const deliveryPartners = useMemo(
    () => Array.from(new Set(projects.map((p) => p.deliveryPartner))),
    [projects]
  );

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

      return matchesSearch && matchesStatus && matchesEntity && matchesPartner;
    });
  }, [projects, searchTerm, statusFilter, entityFilter, partnerFilter]);

  const handleUpdateProject = (id: string, updates: Partial<Project>) => {
    setProjects((prev) =>
      prev.map((project) =>
        project.id === id ? { ...project, ...updates } : project
      )
    );
    toast.success("Project updated successfully");
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setEntityFilter("all");
    setPartnerFilter("all");
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 rounded-lg bg-primary/10">
            <ClipboardList className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Project Management Dashboard</h1>
            <p className="text-muted-foreground">
              Track and manage all project activities
            </p>
          </div>
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
          onClearFilters={handleClearFilters}
          implementingEntities={implementingEntities}
          deliveryPartners={deliveryPartners}
        />

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-card rounded-lg border border-border p-4">
            <div className="text-sm text-muted-foreground mb-1">Total Projects</div>
            <div className="text-2xl font-bold">{filteredProjects.length}</div>
          </div>
          <div className="bg-card rounded-lg border border-border p-4">
            <div className="text-sm text-muted-foreground mb-1">Completed</div>
            <div className="text-2xl font-bold text-success">
              {filteredProjects.filter((p) => p.status === "Completed").length}
            </div>
          </div>
          <div className="bg-card rounded-lg border border-border p-4">
            <div className="text-sm text-muted-foreground mb-1">In Progress</div>
            <div className="text-2xl font-bold text-warning">
              {filteredProjects.filter((p) => p.status === "In Progress").length}
            </div>
          </div>
          <div className="bg-card rounded-lg border border-border p-4">
            <div className="text-sm text-muted-foreground mb-1">Pending</div>
            <div className="text-2xl font-bold text-muted-foreground">
              {filteredProjects.filter((p) => p.status === "Pending").length}
            </div>
          </div>
        </div>

        {/* Table */}
        <ProjectTable
          projects={filteredProjects}
          onUpdateProject={handleUpdateProject}
        />
      </div>
    </div>
  );
};

export default Index;
