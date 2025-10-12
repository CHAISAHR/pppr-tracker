import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";
import type { Status } from "./ProjectTable";

interface ProjectFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  entityFilter: string;
  onEntityFilterChange: (value: string) => void;
  partnerFilter: string;
  onPartnerFilterChange: (value: string) => void;
  periodFilter: string;
  onPeriodFilterChange: (value: string) => void;
  onClearFilters: () => void;
  implementingEntities: string[];
  deliveryPartners: string[];
  periods: string[];
}

export const ProjectFilters = ({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  entityFilter,
  onEntityFilterChange,
  partnerFilter,
  onPartnerFilterChange,
  periodFilter,
  onPeriodFilterChange,
  onClearFilters,
  implementingEntities,
  deliveryPartners,
  periods,
}: ProjectFiltersProps) => {
  const hasActiveFilters = searchTerm || statusFilter !== "all" || entityFilter !== "all" || partnerFilter !== "all" || periodFilter !== "all";

  return (
    <div className="bg-card/80 backdrop-blur-sm rounded-lg border-2 border-primary/20 p-4 shadow-lg animate-fade-in">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>

        <Select value={periodFilter} onValueChange={onPeriodFilterChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Periods</SelectItem>
            {periods.map((period) => (
              <SelectItem key={period} value={period}>
                {period}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={onStatusFilterChange}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="Completed">Completed</SelectItem>
            <SelectItem value="In Progress">In Progress</SelectItem>
            <SelectItem value="Pending">Pending</SelectItem>
          </SelectContent>
        </Select>

        <Select value={entityFilter} onValueChange={onEntityFilterChange}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Implementing Entity" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Entities</SelectItem>
            {implementingEntities.map((entity) => (
              <SelectItem key={entity} value={entity}>
                {entity}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={partnerFilter} onValueChange={onPartnerFilterChange}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Delivery Partner" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Partners</SelectItem>
            {deliveryPartners.map((partner) => (
              <SelectItem key={partner} value={partner}>
                {partner}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="text-muted-foreground hover:text-foreground hover:bg-destructive/10 hover:text-destructive"
          >
            <X className="h-4 w-4 mr-2" />
            Clear
          </Button>
        )}
      </div>
    </div>
  );
};
