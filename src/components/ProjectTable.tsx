import { summarizeComments } from "@/lib/comments";
import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useTableSort } from "@/components/SortableTableHead";
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
  challenges?: string;
  dataLinks?: string;
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
  const { canEditProject } = useAuth();
  const { sorted: sortedProjects, SortHead } = useTableSort<Project>(projects);

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
            <TableRow>
              <SortHead sortKey="activityId" className="font-semibold">Activity ID</SortHead>
              <SortHead sortKey="activityDescription" className="font-semibold">Activity Description</SortHead>
              <SortHead sortKey="subActivityId" className="font-semibold">Sub-Activity ID</SortHead>
              <SortHead sortKey="subActivityDescription" className="font-semibold">Sub-Activity Description</SortHead>
              <SortHead sortKey="implementingEntity" className="font-semibold">Implementing Entity</SortHead>
              <SortHead sortKey="deliveryPartner" className="font-semibold">Delivery Partner</SortHead>
              <SortHead sortKey="status" className="font-semibold">Status</SortHead>
              <SortHead sortKey="startDate" className="font-semibold">Start Date</SortHead>
              <SortHead sortKey="endDate" className="font-semibold">End Date</SortHead>
              <SortHead sortKey="comments" className="font-semibold">Comments</SortHead>
              <SortHead sortKey="modifiedBy" className="font-semibold">Modified By</SortHead>
              <SortHead sortKey="modifiedAt" className="font-semibold">Modified Date</SortHead>
              {!readOnly && <TableHead className="font-semibold">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedProjects.length === 0 ? (
              <TableRow>
                <TableCell colSpan={13} className="text-center text-muted-foreground py-8">
                  No projects found matching your filters
                </TableCell>
              </TableRow>
            ) : (
              sortedProjects.map((project) => (
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
                  <TableCell className="max-w-xs truncate">{summarizeComments(project.comments)}</TableCell>
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
        canUpdate={
          !readOnly &&
          !!viewingProject &&
          canEditProject(viewingProject.deliveryPartner.split(';').map((p) => p.trim()))
        }
        onUpdate={() => {
          if (!viewingProject) return;
          setEditingProject(viewingProject);
          setViewingProject(null);
        }}
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
