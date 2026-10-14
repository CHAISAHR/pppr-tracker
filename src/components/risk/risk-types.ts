export interface Risk {
  id: string;
  riskId?: string;
  organisation?: string;
  description: string;
  likelihood?: number | null;
  impact?: number | null;
  riskScore?: number | null;
  mitigation?: string;
  owner?: string;
  status?: string;
  dateIdentified?: string | null;
}

export const RISK_STATUSES = ["Open", "In Progress", "Mitigated", "Closed"] as const;

export const scoreLevel = (score?: number | null): { label: string; className: string } => {
  if (!score) return { label: "—", className: "bg-muted text-muted-foreground" };
  if (score >= 50) return { label: "Critical", className: "bg-destructive text-destructive-foreground" };
  if (score >= 26) return { label: "High", className: "bg-orange-500 text-white" };
  if (score >= 11) return { label: "Medium", className: "bg-yellow-500 text-black" };
  return { label: "Low", className: "bg-primary/20 text-primary" };
};
