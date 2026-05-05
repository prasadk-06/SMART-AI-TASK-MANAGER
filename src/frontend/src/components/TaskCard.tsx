import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import type { Task } from "@/types/task";
import {
  getPriorityKey,
  getStatusKey,
  getTagKey,
  isOverdue,
} from "@/types/task";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  AlertTriangle,
  Calendar,
  GripVertical,
  Pencil,
  Trash2,
} from "lucide-react";
import { useState } from "react";

const PRIORITY_STYLES: Record<string, string> = {
  High: "bg-destructive/10 text-destructive border-destructive/30",
  Medium: "bg-warning/10 text-warning border-warning/30",
  Low: "bg-success-light text-success border-success/30",
};

const TAG_STYLES: Record<string, string> = {
  Work: "bg-primary/10 text-primary border-primary/20",
  Study: "bg-accent/10 text-accent border-accent/20",
  Personal: "bg-chart-4/10 text-chart-4 border-chart-4/20",
};

const PRIORITY_BORDER: Record<string, string> = {
  High: "border-l-destructive",
  Medium: "border-l-warning",
  Low: "border-l-success",
};

interface TaskCardProps {
  task: Task;
  index: number;
  isDraggable: boolean;
  onToggleComplete: (taskId: string, completed: boolean) => void;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  isToggling?: boolean;
  isDeleting?: boolean;
}

export function TaskCard({
  task,
  index,
  isDraggable,
  onToggleComplete,
  onEdit,
  onDelete,
  isToggling,
  isDeleting,
}: TaskCardProps) {
  const overdue = isOverdue(task);
  const completed = getStatusKey(task.status) === "Completed";
  const priorityKey = getPriorityKey(task.priority);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id, disabled: !isDraggable });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const dueDateMs =
    task.dueDate !== undefined && task.dueDate !== null
      ? Number(task.dueDate) / 1_000_000
      : null;
  const dueDateLabel = dueDateMs
    ? new Date(dueDateMs).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : null;

  return (
    <div
      ref={setNodeRef}
      style={style}
      data-ocid={`tasklist.item.${index}`}
      className={cn(
        "group relative rounded-xl border-l-[3px] border border-border bg-card p-4 hover-lift select-none",
        overdue
          ? "border-l-destructive bg-destructive/[0.03]"
          : completed
            ? "border-l-success/50 opacity-70"
            : PRIORITY_BORDER[priorityKey],
        isDragging &&
          "opacity-40 shadow-2xl ring-2 ring-primary/30 scale-[1.02]",
        isDeleting && "opacity-50 pointer-events-none",
      )}
    >
      <div className="flex items-start gap-3">
        {/* Drag handle */}
        {isDraggable && (
          <button
            type="button"
            {...attributes}
            {...listeners}
            className="mt-0.5 text-muted-foreground/40 hover:text-muted-foreground cursor-grab active:cursor-grabbing transition-colors shrink-0"
            aria-label="Drag to reorder"
            data-ocid={`tasklist.drag_handle.${index}`}
          >
            <GripVertical className="h-4 w-4" />
          </button>
        )}

        {/* Checkbox */}
        <Checkbox
          checked={completed}
          disabled={isToggling}
          onCheckedChange={(checked) => onToggleComplete(task.id, !!checked)}
          data-ocid={`tasklist.checkbox.${index}`}
          className={cn(
            "mt-0.5 shrink-0",
            completed
              ? "data-[state=checked]:bg-success data-[state=checked]:border-success"
              : "",
          )}
        />

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0 flex-wrap">
              <p
                className={cn(
                  "text-sm font-display font-semibold text-foreground leading-snug",
                  completed && "line-through text-muted-foreground",
                )}
              >
                {task.title}
              </p>
              {overdue && (
                <Badge
                  variant="outline"
                  className="text-[9px] px-1.5 py-0 font-body border-destructive/40 bg-destructive/10 text-destructive uppercase tracking-wide shrink-0"
                >
                  <AlertTriangle className="h-2.5 w-2.5 mr-0.5" />
                  Overdue
                </Badge>
              )}
            </div>

            {/* Action buttons — visible on hover */}
            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150 shrink-0">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground hover:text-foreground"
                onClick={() => onEdit(task)}
                aria-label="Edit task"
                data-ocid={`tasklist.edit_button.${index}`}
              >
                <Pencil className="h-3.5 w-3.5" />
              </Button>
              <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                    data-ocid={`tasklist.delete_button.${index}`}
                    aria-label="Delete task"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent
                  data-ocid={`tasklist.delete_dialog.${index}`}
                >
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete task?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete{" "}
                      <strong className="text-foreground">{task.title}</strong>.
                      This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel
                      data-ocid={`tasklist.delete_cancel_button.${index}`}
                    >
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => {
                        onDelete(task.id);
                        setDeleteOpen(false);
                      }}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      data-ocid={`tasklist.delete_confirm_button.${index}`}
                    >
                      Delete task
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>

          {task.description && (
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
              {task.description}
            </p>
          )}

          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
            {/* Priority badge */}
            <Badge
              variant="outline"
              className={cn(
                "text-[10px] px-1.5 py-0 font-body border h-5",
                PRIORITY_STYLES[priorityKey],
              )}
            >
              {priorityKey}
            </Badge>

            {/* Tag badges */}
            {task.tags.map((tag) => {
              const tagKey = getTagKey(tag);
              return (
                <Badge
                  key={tagKey}
                  variant="outline"
                  className={cn(
                    "text-[10px] px-1.5 py-0 font-body border h-5",
                    TAG_STYLES[tagKey],
                  )}
                >
                  {tagKey}
                </Badge>
              );
            })}

            {/* Due date */}
            {dueDateLabel && (
              <span
                className={cn(
                  "flex items-center gap-1 text-[10px] font-body ml-auto",
                  overdue ? "text-destructive" : "text-muted-foreground",
                )}
              >
                <Calendar className="h-3 w-3" />
                {dueDateLabel}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
