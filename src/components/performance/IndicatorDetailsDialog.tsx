import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  Target,
  Globe2,
  Briefcase,
  Building2,
  Users,
  FileText,
  DollarSign,
  CalendarRange,
  ExternalLink,
  MessageSquare,
  Layers,
  Activity,
} from "lucide-react";
import type { Indicator } from "./IndicatorsTab";

interface IndicatorDetailsDialogProps {
  indicator: Indicator | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function Field({
  label,
  value,
  multiline = false,
}: {
  label: string;
  value?: string | number | null;
  multiline?: boolean;
}) {
  const display = value === null || value === undefined || value === "" ? "—" : value;
  return (
    <div className="space-y-1">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p
        className={`text-sm text-foreground ${
          multiline ? "whitespace-pre-wrap leading-relaxed" : "break-words"
        }`}
      >
        {display}
      </p>
    </div>
  );
}

function Section({
  icon: Icon,
  title,
  children,
}: {
  icon: any;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border bg-card/40 p-5 space-y-4">
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
          <Icon className="h-4 w-4 text-primary" />
        </div>
        <h3 className="text-sm font-semibold tracking-tight">{title}</h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">{children}</div>
    </section>
  );
}

export function IndicatorDetailsDialog({
  indicator,
  open,
  onOpenChange,
}: IndicatorDetailsDialogProps) {
  if (!indicator) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden gap-0">
        {/* Hero */}
        <div className="relative bg-gradient-to-br from-primary/15 via-primary/5 to-transparent px-8 pt-8 pb-6 border-b">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-xl bg-primary/15 flex items-center justify-center flex-shrink-0">
              <Target className="h-6 w-6 text-primary" />
            </div>
            <div className="min-w-0 flex-1 pr-8">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                {indicator.country && (
                  <Badge variant="secondary" className="gap-1">
                    <Globe2 className="h-3 w-3" /> {indicator.country}
                  </Badge>
                )}
                {indicator.workstream && (
                  <Badge variant="outline">{indicator.workstream}</Badge>
                )}
                {indicator.indicator_type && (
                  <Badge variant="outline">{indicator.indicator_type}</Badge>
                )}
                {indicator.naphs && (
                  <Badge
                    className={
                      indicator.naphs.toLowerCase() === "yes"
                        ? "bg-emerald-600 hover:bg-emerald-600"
                        : "bg-muted text-muted-foreground hover:bg-muted"
                    }
                  >
                    NAPHS: {indicator.naphs}
                  </Badge>
                )}
              </div>
              <h2 className="text-xl font-bold leading-tight text-foreground break-words">
                {indicator.name}
              </h2>
              {indicator.indicator_definition && (
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                  {indicator.indicator_definition}
                </p>
              )}
            </div>
          </div>
        </div>

        <ScrollArea className="max-h-[65vh]">
          <div className="p-6 space-y-5">
            <Section icon={Activity} title="Activity Context">
              <Field label="Activity ID" value={indicator.activity_id} />
              <Field label="Core Indicator" value={indicator.core_indicators} />
              <div className="sm:col-span-2">
                <Field label="Activity" value={indicator.activity} multiline />
              </div>
              <div className="sm:col-span-2">
                <Field
                  label="Long-term Outcome"
                  value={indicator.long_term_outcome}
                  multiline
                />
              </div>
            </Section>

            <Section icon={Users} title="Responsibility & Partners">
              <Field
                label="Responsibility for Implementation"
                value={indicator.responsibility}
              />
              <Field label="Delivery Partner" value={indicator.organisation} />
              <Field label="Implementing Entity" value={indicator.implementing_entity} />
              <Field label="Data Source" value={indicator.data_source} />
            </Section>

            <Section icon={DollarSign} title="Cost">
              <Field
                label="Cost (US$)"
                value={
                  indicator.cost_usd != null
                    ? `$${Number(indicator.cost_usd).toLocaleString()}`
                    : null
                }
              />
            </Section>

            <Section icon={CalendarRange} title="Targets by Year">
              <Field label="Baseline / Proposal Year" value={indicator.baseline_proposal_year} />
              <Field label="Target Year 1" value={indicator.target_year_1} />
              <Field label="Target Year 2" value={indicator.target_year_2} />
              <Field label="Target Year 3" value={indicator.target_year_3} />
              <Field label="Target Year 4" value={indicator.target_year_4} />
              <Field label="Target Year 5" value={indicator.target_year_5} />
              <Field label="Target Year 6" value={indicator.target_year_6} />
            </Section>

            {indicator.evidence && (
              <Section icon={FileText} title="Evidence">
                <div className="sm:col-span-2">
                  <a
                    href={indicator.evidence}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-primary hover:underline text-sm font-medium break-all"
                  >
                    {indicator.evidence} <ExternalLink className="h-3.5 w-3.5 flex-shrink-0" />
                  </a>
                </div>
              </Section>
            )}

            {indicator.comments && (
              <Section icon={MessageSquare} title="Comments">
                <div className="sm:col-span-2">
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">
                    {indicator.comments}
                  </p>
                </div>
              </Section>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
