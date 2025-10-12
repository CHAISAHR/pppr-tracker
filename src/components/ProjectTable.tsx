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
  timeline: string;
  comments: string;
}

interface ProjectTableProps {
  projects: Project[];
  onUpdateProject: (id: string, updates: Partial<Project>) => void;
}

export const ProjectTable = ({ projects, onUpdateProject }: ProjectTableProps) => {
  const [editingProject, setEditingProject] = useState<Project | null>(null);

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
              <TableHead className="font-semibold">Timeline</TableHead>
              <TableHead className="font-semibold">Comments</TableHead>
              <TableHead className="font-semibold">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {projects.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center text-muted-foreground py-8">
                  No projects found matching your filters
                </TableCell>
              </TableRow>
            ) : (
              projects.map((project) => (
                <TableRow key={project.id} className="hover:bg-muted/30">
                  <TableCell className="font-medium">{project.activityId}</TableCell>
                  <TableCell className="max-w-xs truncate">{project.activityDescription}</TableCell>
                  <TableCell>{project.subActivityId}</TableCell>
                  <TableCell className="max-w-xs truncate">{project.subActivityDescription}</TableCell>
                  <TableCell>{project.implementingEntity}</TableCell>
                  <TableCell>{project.deliveryPartner}</TableCell>
                  <TableCell>
                    <StatusBadge status={project.status} />
                  </TableCell>
                  <TableCell>{project.timeline}</TableCell>
                  <TableCell className="max-w-xs truncate">{project.comments}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingProject(project)}
                      className="hover:bg-accent hover:text-accent-foreground"
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
