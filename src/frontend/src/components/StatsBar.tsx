import { cn } from "@/lib/utils";
import type { Task } from "@/types/task";
import { getStatusKey, isOverdue } from "@/types/task";
import { AlertTriangle, CheckCircle2, Clock, ListTodo } from "lucide-react";
import { motion } from "motion/react";

interface StatsBarProps {
  tasks: Task[];
  isLoading?: boolean;
}

interface StatItem {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  valueColor: string;
  iconBg: string;
  iconColor: string;
}

export function StatsBar({ tasks, isLoading }: StatsBarProps) {
  const total = tasks.length;
  const completed = tasks.filter(
    (t) => getStatusKey(t.status) === "Completed",
  ).length;
  const overdue = tasks.filter(isOverdue).length;
  const pending = tasks.filter(
    (t) => getStatusKey(t.status) === "Pending" && !isOverdue(t),
  ).length;

  const stats: StatItem[] = [
    {
      label: "Total Tasks",
      value: total,
      icon: ListTodo,
      valueColor: "text-foreground",
      iconBg: "bg-muted",
      iconColor: "text-muted-foreground",
    },
    {
      label: "Completed",
      value: completed,
      icon: CheckCircle2,
      valueColor: "text-success",
      iconBg: "bg-success-light",
      iconColor: "text-success",
    },
    {
      label: "Pending",
      value: pending,
      icon: Clock,
      valueColor: "text-warning",
      iconBg: "bg-warning/10",
      iconColor: "text-warning",
    },
    {
      label: "Overdue",
      value: overdue,
      icon: AlertTriangle,
      valueColor: "text-destructive",
      iconBg: "bg-destructive/10",
      iconColor: "text-destructive",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.07, duration: 0.4, ease: "easeOut" }}
          data-ocid={`stats.${stat.label.toLowerCase().replace(" ", "_")}.card`}
        >
          <StatCard stat={stat} isLoading={isLoading} />
        </motion.div>
      ))}
    </div>
  );
}

function StatCard({
  stat,
  isLoading,
}: { stat: StatItem; isLoading?: boolean }) {
  const Icon = stat.icon;
  return (
    <div className="rounded-xl border border-border bg-card p-5 flex items-center justify-between hover-lift group">
      <div className="min-w-0">
        {isLoading ? (
          <>
            <div className="h-8 w-10 rounded-md bg-muted animate-pulse" />
            <div className="h-3 w-16 rounded bg-muted animate-pulse mt-2" />
          </>
        ) : (
          <>
            <p
              className={cn(
                "text-3xl font-display font-bold leading-none",
                stat.valueColor,
              )}
            >
              {stat.value}
            </p>
            <p className="text-xs text-muted-foreground mt-1.5 font-body">
              {stat.label}
            </p>
          </>
        )}
      </div>
      <div
        className={cn(
          "h-11 w-11 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-110",
          stat.iconBg,
        )}
      >
        <Icon className={cn("h-5 w-5", stat.iconColor)} />
      </div>
    </div>
  );
}
