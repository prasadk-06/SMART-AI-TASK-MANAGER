import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { useCreateTask, useUpdateTask } from "@/hooks/useTasks";
import { cn } from "@/lib/utils";
import type { PriorityKey, TagKey, Task } from "@/types/task";
import { getPriorityKey, getTagKey, makePriority, makeTag } from "@/types/task";
import { format } from "date-fns";
import { CalendarIcon, Loader2, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { SmartSuggestions } from "./SmartSuggestions";

interface FormValues {
  title: string;
  description: string;
  dueDate: Date | string | undefined;
  priority: PriorityKey;
  tags: TagKey[];
}

const PRIORITY_CONFIG: Record<
  PriorityKey,
  { label: string; color: string; bg: string }
> = {
  Low: {
    label: "Low",
    color: "text-success",
    bg: "bg-success/15 border-success/40",
  },
  Medium: {
    label: "Medium",
    color: "text-warning",
    bg: "bg-warning/15 border-warning/40",
  },
  High: {
    label: "High",
    color: "text-destructive",
    bg: "bg-destructive/15 border-destructive/40",
  },
};

const TAG_CONFIG: Record<TagKey, { label: string; color: string; bg: string }> =
  {
    Work: {
      label: "Work",
      color: "text-primary",
      bg: "bg-primary/15 border-primary/40",
    },
    Study: {
      label: "Study",
      color: "text-accent",
      bg: "bg-accent/15 border-accent/40",
    },
    Personal: {
      label: "Personal",
      color: "text-muted-foreground",
      bg: "bg-muted border-border",
    },
  };

interface TaskFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task?: Task;
}

export function TaskFormModal({
  open,
  onOpenChange,
  task,
}: TaskFormModalProps) {
  const isEditing = !!task;
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const isPending = createTask.isPending || updateTask.isPending;

  const [suggestionsVisible, setSuggestionsVisible] = useState(false);
  const titleInputRef = useRef<HTMLInputElement | null>(null);

  const buildDefaults = useCallback((): FormValues => {
    if (!task) {
      return {
        title: "",
        description: "",
        dueDate: undefined,
        priority: "Medium",
        tags: [],
      };
    }
    const priorityKey: PriorityKey = getPriorityKey(task.priority);
    const tagKeys: TagKey[] = task.tags.map(getTagKey);
    const dueDate =
      task.dueDate !== undefined && task.dueDate !== null
        ? new Date(Number(task.dueDate) / 1_000_000)
        : undefined;
    return {
      title: task.title,
      description: task.description ?? "",
      dueDate,
      priority: priorityKey,
      tags: tagKeys,
    };
  }, [task]);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: buildDefaults(),
  });

  useEffect(() => {
    if (open) reset(buildDefaults());
  }, [open, reset, buildDefaults]);

  const titleValue = watch("title");
  const selectedTags = watch("tags");
  const selectedPriority = watch("priority");

  const handleSuggestionSelect = (suggestion: string) => {
    setValue("title", suggestion, { shouldValidate: true });
    setSuggestionsVisible(false);
    titleInputRef.current?.focus();
  };

  const onSubmit = async (values: FormValues) => {
    const description: string | undefined =
      values.description.trim() || undefined;
    let dueDate: bigint | undefined = undefined;
    if (values.dueDate) {
      const ms =
        values.dueDate instanceof Date
          ? values.dueDate.getTime()
          : new Date(String(values.dueDate)).getTime();
      dueDate = BigInt(ms) * 1_000_000n;
    }
    const priority = makePriority(values.priority);
    const tags = values.tags.map(makeTag);

    if (isEditing && task) {
      await updateTask.mutateAsync({
        id: task.id,
        title: values.title,
        description,
        dueDate,
        priority,
        tags,
      });
    } else {
      await createTask.mutateAsync({
        title: values.title,
        description,
        dueDate,
        priority,
        tags,
      });
    }
    onOpenChange(false);
  };

  const toggleTag = (tag: TagKey) => {
    const current = selectedTags ?? [];
    if (current.includes(tag)) {
      setValue(
        "tags",
        current.filter((t) => t !== tag),
      );
    } else {
      setValue("tags", [...current, tag]);
    }
  };

  const { ref: titleFormRef, ...titleRest } = register("title", {
    required: "Title is required",
    minLength: { value: 2, message: "Title must be at least 2 characters" },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto border-border bg-card"
        data-ocid="task_form.dialog"
      >
        <DialogHeader>
          <DialogTitle className="font-display text-xl">
            {isEditing ? "Edit Task" : "Create New Task"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 pt-1">
          {/* Title + Smart Suggestions */}
          <div className="space-y-1.5">
            <Label htmlFor="task-title" className="text-sm font-medium">
              Title <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <Input
                id="task-title"
                data-ocid="task_form.title.input"
                placeholder="What needs to be done?"
                autoComplete="off"
                {...titleRest}
                ref={(el) => {
                  titleFormRef(el);
                  titleInputRef.current = el;
                }}
                onFocus={() =>
                  titleValue.length >= 2 && setSuggestionsVisible(true)
                }
                onChange={(e) => {
                  titleRest.onChange(e);
                  setSuggestionsVisible(e.target.value.length >= 2);
                }}
                className={cn(
                  "h-10 border-input bg-background pr-3 transition-colors focus:border-primary",
                  errors.title && "border-destructive focus:border-destructive",
                )}
              />
              <SmartSuggestions
                value={titleValue}
                visible={suggestionsVisible}
                onSelect={handleSuggestionSelect}
                onClose={() => setSuggestionsVisible(false)}
              />
            </div>
            <AnimatePresence>
              {errors.title && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="text-xs text-destructive"
                  data-ocid="task_form.title.field_error"
                >
                  {errors.title.message}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="task-description" className="text-sm font-medium">
              Description
              <span className="ml-1.5 text-xs text-muted-foreground">
                (optional)
              </span>
            </Label>
            <Textarea
              id="task-description"
              data-ocid="task_form.description.textarea"
              placeholder="Add more details…"
              rows={3}
              {...register("description")}
              className="resize-none border-input bg-background transition-colors focus:border-primary"
            />
          </div>

          {/* Due Date */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">
              Due Date
              <span className="ml-1.5 text-xs text-muted-foreground">
                (optional)
              </span>
            </Label>
            <Controller
              name="dueDate"
              control={control}
              render={({ field }) => (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      data-ocid="task_form.due_date.button"
                      className={cn(
                        "h-10 w-full justify-start gap-2 border-input bg-background text-left font-normal transition-colors hover:border-primary",
                        !field.value && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="h-4 w-4 shrink-0" />
                      {field.value ? format(field.value, "PPP") : "Pick a date"}
                      {field.value && (
                        <button
                          type="button"
                          data-ocid="task_form.due_date.clear_button"
                          onClick={(e) => {
                            e.stopPropagation();
                            field.onChange(undefined);
                          }}
                          className="ml-auto rounded p-0.5 hover:text-destructive"
                          aria-label="Clear date"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-auto border-border bg-popover p-0"
                    align="start"
                    data-ocid="task_form.due_date.popover"
                  >
                    <Calendar
                      mode="single"
                      selected={
                        field.value instanceof Date ? field.value : undefined
                      }
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date < new Date(new Date().setHours(0, 0, 0, 0))
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              )}
            />
          </div>

          {/* Priority */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Priority</Label>
            <div className="flex gap-2" data-ocid="task_form.priority.select">
              {(["Low", "Medium", "High"] as PriorityKey[]).map((key) => {
                const cfg = PRIORITY_CONFIG[key];
                const isActive = selectedPriority === key;
                return (
                  <button
                    key={key}
                    type="button"
                    data-ocid={`task_form.priority.${key.toLowerCase()}`}
                    onClick={() => setValue("priority", key)}
                    className={cn(
                      "flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-all duration-150",
                      isActive
                        ? `${cfg.bg} ${cfg.color} ring-1 ring-current/40`
                        : "border-border bg-background text-muted-foreground hover:bg-muted",
                    )}
                  >
                    {cfg.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">
              Tags
              <span className="ml-1.5 text-xs text-muted-foreground">
                (select multiple)
              </span>
            </Label>
            <div className="flex gap-2" data-ocid="task_form.tags.select">
              {(["Work", "Study", "Personal"] as TagKey[]).map((key) => {
                const cfg = TAG_CONFIG[key];
                const isActive = (selectedTags ?? []).includes(key);
                return (
                  <button
                    key={key}
                    type="button"
                    data-ocid={`task_form.tag.${key.toLowerCase()}`}
                    onClick={() => toggleTag(key)}
                    className={cn(
                      "flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-all duration-150",
                      isActive
                        ? `${cfg.bg} ${cfg.color} ring-1 ring-current/40`
                        : "border-border bg-background text-muted-foreground hover:bg-muted",
                    )}
                  >
                    {cfg.label}
                  </button>
                );
              })}
            </div>
          </div>

          <DialogFooter className="gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              data-ocid="task_form.cancel_button"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              data-ocid="task_form.submit_button"
              disabled={isPending}
              className="min-w-[120px]"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEditing ? "Saving…" : "Creating…"}
                </>
              ) : isEditing ? (
                "Save Changes"
              ) : (
                "Create Task"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
