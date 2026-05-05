import { SkeletonCard } from "@/components/ui/LoadingSpinner";
import { useTasks } from "@/hooks/useTasks";
import { cn } from "@/lib/utils";
import {
  getPriorityKey,
  getStatusKey,
  getTagKey,
  isOverdue,
} from "@/types/task";
import { AlertTriangle, CheckCircle2, Clock, TrendingUp } from "lucide-react";
import { motion } from "motion/react";

export default function AnalyticsPage() {
  const { data: tasks, isLoading } = useTasks();

  const total = tasks?.length ?? 0;
  const completed =
    tasks?.filter((t) => getStatusKey(t.status) === "Completed").length ?? 0;
  const overdue = tasks?.filter(isOverdue).length ?? 0;
  const pending = total - completed;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  const byPriority = {
    High:
      tasks?.filter((t) => getPriorityKey(t.priority) === "High").length ?? 0,
    Medium:
      tasks?.filter((t) => getPriorityKey(t.priority) === "Medium").length ?? 0,
    Low: tasks?.filter((t) => getPriorityKey(t.priority) === "Low").length ?? 0,
  };

  const byTag = {
    Work:
      tasks?.filter((t) => t.tags.some((tag) => getTagKey(tag) === "Work"))
        .length ?? 0,
    Study:
      tasks?.filter((t) => t.tags.some((tag) => getTagKey(tag) === "Study"))
        .length ?? 0,
    Personal:
      tasks?.filter((t) => t.tags.some((tag) => getTagKey(tag) === "Personal"))
        .length ?? 0,
  };

  if (isLoading) {
    return (
      <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        {["s1", "s2", "s3", "s4", "s5", "s6", "s7", "s8"].map((k) => (
          <SkeletonCard key={k} />
        ))}
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground tracking-tight">
          Analytics
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Your productivity overview
        </p>
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: "Total Tasks",
            value: total,
            icon: TrendingUp,
            color: "text-foreground",
            bg: "bg-muted",
          },
          {
            label: "Completed",
            value: completed,
            icon: CheckCircle2,
            color: "text-success",
            bg: "bg-success/10",
          },
          {
            label: "Pending",
            value: pending,
            icon: Clock,
            color: "text-muted-foreground",
            bg: "bg-muted",
          },
          {
            label: "Overdue",
            value: overdue,
            icon: AlertTriangle,
            color: "text-destructive",
            bg: "bg-destructive/10",
          },
        ].map((m, i) => (
          <motion.div
            key={m.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="rounded-xl border border-border bg-card p-4 flex items-center justify-between hover-lift"
          >
            <div>
              <p className={cn("text-3xl font-display font-bold", m.color)}>
                {m.value}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">{m.label}</p>
            </div>
            <div
              className={cn(
                "h-10 w-10 rounded-lg flex items-center justify-center",
                m.bg,
              )}
            >
              <m.icon className={cn("h-5 w-5", m.color)} />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Completion rate */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="rounded-2xl border border-border bg-card p-6"
        data-ocid="analytics.completion_rate.card"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-display font-semibold text-foreground">
              Completion Rate
            </h2>
            <p className="text-sm text-muted-foreground">
              Percentage of tasks completed
            </p>
          </div>
          <span className="text-4xl font-display font-bold text-primary">
            {completionRate}%
          </span>
        </div>
        <div className="h-3 rounded-full bg-muted overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${completionRate}%` }}
            transition={{ delay: 0.5, duration: 0.8, ease: "easeOut" }}
            className="h-full rounded-full bg-primary"
          />
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Priority breakdown */}
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-2xl border border-border bg-card p-6"
        >
          <h2 className="font-display font-semibold text-foreground mb-4">
            By Priority
          </h2>
          <div className="space-y-3">
            {[
              {
                key: "High",
                color: "bg-destructive",
                labelColor: "text-destructive",
                value: byPriority.High,
              },
              {
                key: "Medium",
                color: "bg-warning",
                labelColor: "text-warning",
                value: byPriority.Medium,
              },
              {
                key: "Low",
                color: "bg-success",
                labelColor: "text-success",
                value: byPriority.Low,
              },
            ].map((item) => (
              <div key={item.key}>
                <div className="flex justify-between items-center mb-1">
                  <span
                    className={cn(
                      "text-xs font-body font-medium",
                      item.labelColor,
                    )}
                  >
                    {item.key}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {item.value} tasks
                  </span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{
                      width:
                        total > 0 ? `${(item.value / total) * 100}%` : "0%",
                    }}
                    transition={{ delay: 0.6, duration: 0.6, ease: "easeOut" }}
                    className={cn("h-full rounded-full", item.color)}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Tag breakdown */}
        <motion.div
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-2xl border border-border bg-card p-6"
        >
          <h2 className="font-display font-semibold text-foreground mb-4">
            By Tag
          </h2>
          <div className="space-y-3">
            {[
              {
                key: "Work",
                color: "bg-primary",
                labelColor: "text-primary",
                value: byTag.Work,
              },
              {
                key: "Study",
                color: "bg-accent",
                labelColor: "text-accent",
                value: byTag.Study,
              },
              {
                key: "Personal",
                color: "bg-chart-4",
                labelColor: "text-chart-4",
                value: byTag.Personal,
              },
            ].map((item) => (
              <div key={item.key}>
                <div className="flex justify-between items-center mb-1">
                  <span
                    className={cn(
                      "text-xs font-body font-medium",
                      item.labelColor,
                    )}
                  >
                    {item.key}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {item.value} tasks
                  </span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{
                      width:
                        total > 0 ? `${(item.value / total) * 100}%` : "0%",
                    }}
                    transition={{ delay: 0.6, duration: 0.6, ease: "easeOut" }}
                    className={cn("h-full rounded-full", item.color)}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
