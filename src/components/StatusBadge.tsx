import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type Status = "Completed" | "In Progress" | "Pending";

interface StatusBadgeProps {
  status: Status;
}

export const StatusBadge = ({ status }: StatusBadgeProps) => {
  const variants = {
    Completed: "bg-success text-success-foreground hover:bg-success/90",
    "In Progress": "bg-warning text-warning-foreground hover:bg-warning/90",
    Pending: "bg-muted text-muted-foreground hover:bg-muted/90",
  };

  return (
    <Badge className={cn("font-medium", variants[status])}>
      {status}
    </Badge>
  );
};
