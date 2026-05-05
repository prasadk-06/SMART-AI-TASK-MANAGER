import { SkeletonCard } from "@/components/ui/LoadingSpinner";
import { useTasks } from "@/hooks/useTasks";
import { cn } from "@/lib/utils";
import { getStatusKey, getTagKey, isOverdue } from "@/types/task";
import type { TagKey, Task } from "@/types/task";
import { motion } from "motion/react";

const TAG_META: Record<
  TagKey,
  { color: string; bg: string; emoji: string; desc: string }
> = {
  Work: {
    color: "text-primary",
    bg: "bg-primary/10 border-primary/20",
    emoji: "💼",
    desc: "Professional and work-related tasks",
  },
  Study: {
    color: "text-accent",
    bg: "bg-accent/10 border-accent/20",
    emoji: "📚",
    desc: "Learning, courses, and academic tasks",
  },
  Personal: {
    color: "text-chart-4",
    bg: "bg-chart-4/10 border-chart-4/20",
    emoji: "🌱",
    desc: "Personal goals and everyday tasks",
  },
};

export default function TagsPage() {
  const { data: tasks, isLoading } = useTasks();

  const tagGroups: Record<TagKey, Task[]> = {
    Work: [],
    Study: [],
    Personal: [],
  };

  for (const task of tasks ?? []) {
    for (const tag of task.tags) {
      const key = getTagKey(tag);
      tagGroups[key].push(task);
    }
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground tracking-tight">
          Tags
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Browse tasks organized by tag
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[0, 1, 2].map((i) => (
            <SkeletonCard key={i.toString()} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {(
            Object.entries(TAG_META) as [TagKey, (typeof TAG_META)[TagKey]][]
          ).map(([key, meta], idx) => {
            const group = tagGroups[key];
            const completed = group.filter(
              (t) => getStatusKey(t.status) === "Completed",
            ).length;
            const overdue = group.filter(isOverdue).length;
            return (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1, duration: 0.4 }}
                className={cn(
                  "rounded-2xl border p-5 bg-card space-y-4 hover-lift",
                  meta.bg,
                )}
                data-ocid={`tags.${key.toLowerCase()}.card`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{meta.emoji}</span>
                  <div>
                    <p
                      className={cn(
                        "font-display font-bold text-lg",
                        meta.color,
                      )}
                    >
                      {key}
                    </p>
                    <p className="text-xs text-muted-foreground">{meta.desc}</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <Stat
                    label="Total"
                    value={group.length}
                    className="text-foreground"
                  />
                  <Stat
                    label="Done"
                    value={completed}
                    className="text-success"
                  />
                  <Stat
                    label="Overdue"
                    value={overdue}
                    className="text-destructive"
                  />
                </div>
                {group.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-4">
                    No tasks with this tag yet
                  </p>
                ) : (
                  <ul className="space-y-1.5">
                    {group.slice(0, 4).map((t) => (
                      <li
                        key={t.id}
                        className="flex items-center gap-2 text-xs"
                      >
                        <span
                          className={cn(
                            "h-1.5 w-1.5 rounded-full shrink-0",
                            getStatusKey(t.status) === "Completed"
                              ? "bg-success"
                              : isOverdue(t)
                                ? "bg-destructive"
                                : "bg-muted-foreground",
                          )}
                        />
                        <span
                          className={cn(
                            "truncate text-foreground",
                            getStatusKey(t.status) === "Completed" &&
                              "line-through text-muted-foreground",
                          )}
                        >
                          {t.title}
                        </span>
                      </li>
                    ))}
                    {group.length > 4 && (
                      <p className="text-[10px] text-muted-foreground text-center">
                        +{group.length - 4} more
                      </p>
                    )}
                  </ul>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  className,
}: { label: string; value: number; className: string }) {
  return (
    <div>
      <p className={cn("text-xl font-display font-bold", className)}>{value}</p>
      <p className="text-[10px] text-muted-foreground">{label}</p>
    </div>
  );
}
