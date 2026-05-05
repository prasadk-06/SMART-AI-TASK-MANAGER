import { EmptyState } from "@/components/EmptyState";
import { TaskCard } from "@/components/TaskCard";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { Task, TaskOrderEntry } from "@/types/task";
import {
  PRIORITY_ORDER,
  getPriorityKey,
  getStatusKey,
  isOverdue,
} from "@/types/task";
import type { FilterTab, SortKey } from "@/types/task";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import type { DragEndEvent } from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { arrayMove } from "@dnd-kit/sortable";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useMemo } from "react";

interface TaskListProps {
  tasks: Task[];
  isLoading: boolean;
  activeFilter: FilterTab;
  sortKey: SortKey;
  search: string;
  onToggleComplete: (taskId: string, completed: boolean) => void;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onReorder: (entries: TaskOrderEntry[]) => void;
  togglingId?: string | null;
  deletingId?: string | null;
  onCreateTask?: () => void;
}

export function TaskList({
  tasks,
  isLoading,
  activeFilter,
  sortKey,
  search,
  onToggleComplete,
  onEdit,
  onDelete,
  onReorder,
  togglingId,
  deletingId,
  onCreateTask,
}: TaskListProps) {
  const isDraggable = sortKey === "order" && !search;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  // Filtered tasks
  const filtered = useMemo(() => {
    let result = [...tasks];

    // Filter by tab
    switch (activeFilter) {
      case "Pending":
        result = result.filter(
          (t) => getStatusKey(t.status) === "Pending" && !isOverdue(t),
        );
        break;
      case "Completed":
        result = result.filter((t) => getStatusKey(t.status) === "Completed");
        break;
      case "Overdue":
        result = result.filter(isOverdue);
        break;
      default:
        break;
    }

    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.description?.toLowerCase().includes(q),
      );
    }

    // Sort
    switch (sortKey) {
      case "date":
        result.sort((a, b) => {
          const da =
            a.dueDate !== undefined && a.dueDate !== null
              ? Number(a.dueDate)
              : Number.POSITIVE_INFINITY;
          const db =
            b.dueDate !== undefined && b.dueDate !== null
              ? Number(b.dueDate)
              : Number.POSITIVE_INFINITY;
          return da - db;
        });
        break;
      case "priority":
        result.sort(
          (a, b) =>
            PRIORITY_ORDER[getPriorityKey(b.priority)] -
            PRIORITY_ORDER[getPriorityKey(a.priority)],
        );
        break;
      default:
        result.sort((a, b) => Number(a.order) - Number(b.order));
        break;
    }

    return result;
  }, [tasks, activeFilter, sortKey, search]);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const oldIndex = filtered.findIndex((t) => t.id === active.id);
      const newIndex = filtered.findIndex((t) => t.id === over.id);
      if (oldIndex === -1 || newIndex === -1) return;

      const reordered = arrayMove(filtered, oldIndex, newIndex);
      const entries: TaskOrderEntry[] = reordered.map((t, i) => ({
        id: t.id,
        order: BigInt(i),
      }));
      onReorder(entries);
    },
    [filtered, onReorder],
  );

  if (isLoading) {
    return (
      <div className="space-y-3">
        {(["sk-a", "sk-b", "sk-c", "sk-d"] as const).map((id, i) => (
          <Skeleton
            key={id}
            className={cn(
              "h-24 w-full rounded-xl",
              i % 2 === 0 ? "opacity-70" : "opacity-40",
            )}
          />
        ))}
      </div>
    );
  }

  if (filtered.length === 0) {
    return (
      <EmptyState
        title={search ? "No results found" : "No tasks here"}
        description={
          search
            ? `No tasks match "${search}". Try a different search term.`
            : activeFilter === "All"
              ? "Create your first task to get started."
              : `No ${activeFilter.toLowerCase()} tasks right now.`
        }
        isSearch={!!search}
        ctaLabel={!search && activeFilter === "All" ? "Create task" : undefined}
        onCta={!search && activeFilter === "All" ? onCreateTask : undefined}
      />
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={filtered.map((t) => t.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-2.5">
          <AnimatePresence initial={false} mode="popLayout">
            {filtered.map((task, index) => (
              <motion.div
                key={task.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8, scale: 0.98 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
                <TaskCard
                  task={task}
                  index={index + 1}
                  isDraggable={isDraggable}
                  onToggleComplete={onToggleComplete}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  isToggling={togglingId === task.id}
                  isDeleting={deletingId === task.id}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </SortableContext>
    </DndContext>
  );
}
