import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { FileText, Hash, Building2, Users, Calendar, MessageSquare } from "lucide-react";
import { StatusBadge } from "./StatusBadge";
import type { Project } from "./ProjectTable";

interface ProjectDetailsDialogProps {
  project: Project | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ProjectDetailsDialog = ({ project, open, onOpenChange }: ProjectDetailsDialogProps) => {
  if (!project) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto animate-scale-in">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <DialogTitle className="text-2xl bg-gradient-primary bg-clip-text text-transparent">
                {project.activityDescription}
              </DialogTitle>
              <DialogDescription className="mt-2 flex items-center gap-2">
                <Hash className="h-4 w-4" />
                {project.activityId}
              </DialogDescription>
            </div>
            <StatusBadge status={project.status} />
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-6">
          {/* Sub-Activity Section */}
          <div className="space-y-3 p-4 rounded-lg bg-muted/30 border border-border">
            <div className="flex items-start gap-2">
              <FileText className="h-5 w-5 mt-0.5 text-primary" />
              <div className="flex-1">
                <p className="font-semibold text-sm text-muted-foreground mb-1">Sub-Activity</p>
                <p className="font-medium">{project.subActivityDescription}</p>
                <p className="text-sm text-muted-foreground mt-1">ID: {project.subActivityId}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Implementation Details */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2 p-4 rounded-lg bg-card border border-primary/20 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300">
              <div className="flex items-center gap-2 text-primary">
                <Building2 className="h-4 w-4" />
                <p className="font-semibold text-sm">Implementing Entity</p>
              </div>
              <p className="text-sm pl-6">{project.implementingEntity}</p>
            </div>

            <div className="space-y-2 p-4 rounded-lg bg-card border border-accent/20 hover:shadow-lg hover:shadow-accent/10 transition-all duration-300">
              <div className="flex items-center gap-2 text-accent">
                <Users className="h-4 w-4" />
                <p className="font-semibold text-sm">Delivery Partner</p>
              </div>
              <p className="text-sm pl-6">{project.deliveryPartner}</p>
            </div>
          </div>

          <Separator />

          {/* Timeline */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2 p-4 rounded-lg bg-muted/30 border border-border">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <p className="font-semibold text-sm">Start Date</p>
              </div>
              <p className="text-sm pl-6">
                {project.startDate ? new Date(project.startDate).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                }) : 'Not set'}
              </p>
            </div>

            <div className="space-y-2 p-4 rounded-lg bg-muted/30 border border-border">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <p className="font-semibold text-sm">End Date</p>
              </div>
              <p className="text-sm pl-6">
                {project.endDate ? new Date(project.endDate).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                }) : 'Not set'}
              </p>
            </div>
          </div>

          <Separator />

          {/* Comments */}
          {project.comments && (
            <div className="space-y-2 p-4 rounded-lg bg-muted/30 border border-border">
              <div className="flex items-start gap-2">
                <MessageSquare className="h-4 w-4 mt-1 text-muted-foreground" />
                <div className="flex-1">
                  <p className="font-semibold text-sm mb-2">Comments</p>
                  <p className="text-sm text-muted-foreground">{project.comments}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
