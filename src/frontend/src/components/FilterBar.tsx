import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { FilterTab, SortKey } from "@/types/task";
import { Search } from "lucide-react";
import { motion } from "motion/react";

const FILTER_TABS: { key: FilterTab; label: string }[] = [
  { key: "All", label: "All" },
  { key: "Pending", label: "Pending" },
  { key: "Completed", label: "Completed" },
  { key: "Overdue", label: "Overdue" },
];

interface FilterBarProps {
  activeFilter: FilterTab;
  onFilterChange: (f: FilterTab) => void;
  sortKey: SortKey;
  onSortChange: (s: SortKey) => void;
  search: string;
  onSearchChange: (v: string) => void;
  taskCounts: Record<FilterTab, number>;
}

export function FilterBar({
  activeFilter,
  onFilterChange,
  sortKey,
  onSortChange,
  search,
  onSearchChange,
  taskCounts,
}: FilterBarProps) {
  return (
    <div className="space-y-3">
      {/* Search + Sort row */}
      <div className="flex gap-3 flex-col sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search tasks…"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 h-9 bg-card border-border text-sm"
            data-ocid="filterbar.search_input"
          />
        </div>
        <Select
          value={sortKey}
          onValueChange={(v) => onSortChange(v as SortKey)}
        >
          <SelectTrigger
            className="w-full sm:w-44 h-9 bg-card border-border text-sm"
            data-ocid="filterbar.sort_select"
          >
            <SelectValue placeholder="Sort by…" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="order">Manual Order</SelectItem>
            <SelectItem value="date">Sort by Date</SelectItem>
            <SelectItem value="priority">Sort by Priority</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 bg-muted/50 rounded-lg p-1 w-fit relative">
        {FILTER_TABS.map((tab) => {
          const active = activeFilter === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => onFilterChange(tab.key)}
              data-ocid={`filterbar.${tab.key.toLowerCase()}.tab`}
              className={cn(
                "relative flex items-center gap-1.5 rounded-md px-3.5 py-1.5 text-xs font-body font-medium transition-colors duration-150 z-10",
                active
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {active && (
                <motion.span
                  layoutId="filter-pill"
                  className="absolute inset-0 rounded-md bg-card border border-border shadow-sm"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative">{tab.label}</span>
              <span
                className={cn(
                  "relative min-w-[18px] text-center rounded px-1 text-[10px] font-mono",
                  active
                    ? tab.key === "Overdue"
                      ? "bg-destructive/15 text-destructive"
                      : "bg-primary/15 text-primary"
                    : "bg-muted text-muted-foreground",
                )}
              >
                {taskCounts[tab.key]}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
