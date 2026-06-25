import { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";
import { Edit2 } from "lucide-react";
import { StatusBadge } from "./StatusBadge";
import { EditProjectDialog } from "./EditProjectDialog";
import { ProjectDetailsDialog } from "./ProjectDetailsDialog";
import { useAuth } from "@/contexts/AuthContext";

export type Status = "Completed" | "In Progress" | "Not Yet Started";

export interface Project {
  id: string;
  activityId: string;
  activityDescription: string;
  subActivityId: string;
  subActivityDescription: string;
  implementingEntity: string;
  deliveryPartner: string;
  status: Status;
  startDate: string;
  endDate: string;
  comments: string;
  modifiedBy?: string;
  modifiedAt?: string;
}

interface ProjectTableProps {
  projects: Project[];
  onUpdateProject: (id: string, updates: Partial<Project>) => void;
  readOnly?: boolean;
}

export const ProjectTable = ({ projects, onUpdateProject, readOnly = false }: ProjectTableProps) => {
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [viewingProject, setViewingProject] = useState<Project | null>(null);
  const [sortKey, setSortKey] = useState<"modifiedBy" | "modifiedAt" | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const { canEditProject } = useAuth();

  const toggleSort = (key: "modifiedBy" | "modifiedAt") => {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const sortedProjects = useMemo(() => {
    if (!sortKey) return projects;
    const copy = [...projects];
    copy.sort((a, b) => {
      const av = a[sortKey] || "";
      const bv = b[sortKey] || "";
      if (sortKey === "modifiedAt") {
        const at = av ? new Date(av).getTime() : 0;
        const bt = bv ? new Date(bv).getTime() : 0;
        return sortDir === "asc" ? at - bt : bt - at;
      }
      return sortDir === "asc"
        ? String(av).localeCompare(String(bv))
        : String(bv).localeCompare(String(av));
    });
    return copy;
  }, [projects, sortKey, sortDir]);

  const SortIcon = ({ k }: { k: "modifiedBy" | "modifiedAt" }) => {
    if (sortKey !== k) return <ArrowUpDown className="h-3 w-3 inline ml-1 opacity-50" />;
    return sortDir === "asc"
      ? <ArrowUp className="h-3 w-3 inline ml-1" />
      : <ArrowDown className="h-3 w-3 inline ml-1" />;
  };

  const handleEditClick = (project: Project, e: React.MouseEvent) => {
    e.stopPropagation();
    if (readOnly) return;
    const deliveryPartners = project.deliveryPartner.split(';').map(p => p.trim());
    if (canEditProject(deliveryPartners)) {
      setEditingProject(project);
    }
  };

  return (
    <>
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <TableHead className="font-semibold">Activity ID</TableHead>
              <TableHead className="font-semibold">Activity Description</TableHead>
              <TableHead className="font-semibold">Sub-Activity ID</TableHead>
              <TableHead className="font-semibold">Sub-Activity Description</TableHead>
              <TableHead className="font-semibold">Implementing Entity</TableHead>
              <TableHead className="font-semibold">Delivery Partner</TableHead>
              <TableHead className="font-semibold">Status</TableHead>
              <TableHead className="font-semibold">Start Date</TableHead>
              <TableHead className="font-semibold">End Date</TableHead>
              <TableHead className="font-semibold">Comments</TableHead>
              <TableHead
                className="font-semibold cursor-pointer select-none hover:text-primary"
                onClick={() => toggleSort("modifiedBy")}
              >
                Modified By<SortIcon k="modifiedBy" />
              </TableHead>
              <TableHead
                className="font-semibold cursor-pointer select-none hover:text-primary"
                onClick={() => toggleSort("modifiedAt")}
              >
                Modified Date<SortIcon k="modifiedAt" />
              </TableHead>
              {!readOnly && <TableHead className="font-semibold">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {projects.length === 0 ? (
              <TableRow>
                <TableCell colSpan={13} className="text-center text-muted-foreground py-8">
                  No projects found matching your filters
                </TableCell>
              </TableRow>
            ) : (
              projects.map((project) => (
                <TableRow 
                  key={project.id} 
                  className="hover:bg-primary/5 cursor-pointer transition-all duration-200 group"
                  onClick={() => setViewingProject(project)}
                >
                  <TableCell className="font-medium group-hover:text-primary transition-colors">{project.activityId}</TableCell>
                  <TableCell className="max-w-xs truncate">{project.activityDescription}</TableCell>
                  <TableCell>{project.subActivityId}</TableCell>
                  <TableCell className="max-w-xs truncate">{project.subActivityDescription}</TableCell>
                  <TableCell>{project.implementingEntity}</TableCell>
                  <TableCell>{project.deliveryPartner}</TableCell>
                  <TableCell>
                    <StatusBadge status={project.status} />
                  </TableCell>
                  <TableCell>{project.startDate ? new Date(project.startDate).toLocaleDateString() : '-'}</TableCell>
                  <TableCell>{project.endDate ? new Date(project.endDate).toLocaleDateString() : '-'}</TableCell>
                  <TableCell className="max-w-xs truncate">{project.comments}</TableCell>
                  <TableCell className="text-muted-foreground">{project.modifiedBy || '-'}</TableCell>
                  <TableCell className="text-muted-foreground">{project.modifiedAt ? new Date(project.modifiedAt).toLocaleString() : '-'}</TableCell>
                  <TableCell>
                    {!readOnly && (() => {
                      const deliveryPartners = project.deliveryPartner.split(';').map(p => p.trim());
                      const canEdit = canEditProject(deliveryPartners);
                      
                      return (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => handleEditClick(project, e)}
                          className={canEdit ? "hover:bg-primary/10 hover:text-primary transition-colors" : "opacity-50 cursor-not-allowed"}
                          disabled={!canEdit}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                      );
                    })()}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <ProjectDetailsDialog
        project={viewingProject}
        open={!!viewingProject}
        onOpenChange={(open) => !open && setViewingProject(null)}
      />

      {editingProject && (
        <EditProjectDialog
          project={editingProject}
          open={!!editingProject}
          onOpenChange={(open) => !open && setEditingProject(null)}
          onSave={(updates) => {
            onUpdateProject(editingProject.id, updates);
            setEditingProject(null);
          }}
        />
      )}
    </>
  );
};
