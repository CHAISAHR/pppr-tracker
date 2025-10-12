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
import { Edit2 } from "lucide-react";
import { StatusBadge } from "./StatusBadge";
import { EditProjectDialog } from "./EditProjectDialog";
import { ProjectDetailsDialog } from "./ProjectDetailsDialog";

export type Status = "Completed" | "In Progress" | "Pending";

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
}

interface ProjectTableProps {
  projects: Project[];
  onUpdateProject: (id: string, updates: Partial<Project>) => void;
}

export const ProjectTable = ({ projects, onUpdateProject }: ProjectTableProps) => {
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [viewingProject, setViewingProject] = useState<Project | null>(null);

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
              <TableHead className="font-semibold">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {projects.length === 0 ? (
              <TableRow>
                <TableCell colSpan={11} className="text-center text-muted-foreground py-8">
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
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingProject(project);
                      }}
                      className="hover:bg-primary/10 hover:text-primary transition-colors"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
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
