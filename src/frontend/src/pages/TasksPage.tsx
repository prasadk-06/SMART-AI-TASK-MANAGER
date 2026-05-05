import { SkeletonCard } from "@/components/ui/LoadingSpinner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  useCreateTask,
  useDeleteTask,
  useMarkComplete,
  useMarkIncomplete,
  useTasks,
  useUpdateTask,
} from "@/hooks/useTasks";
import { cn } from "@/lib/utils";
import {
  type CreateTaskInput,
  type FilterTab,
  PRIORITY_ORDER,
  type PriorityKey,
  type SortKey,
  type TagKey,
  type Task,
  type UpdateTaskInput,
  getPriorityKey,
  getStatusKey,
  getTagKey,
  isOverdue,
  makePriority,
  makeTag,
} from "@/types/task";
import {
  AlertTriangle,
  CheckCircle2,
  Circle,
  GripVertical,
  Pencil,
  Plus,
  Search,
  SortAsc,
  Trash2,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";

// Smart suggestions
const SUGGESTIONS: Record<string, string[]> = {
  math: [
    "Complete math assignment",
    "Math exam revision",
    "Math homework chapter 5",
  ],
  read: [
    "Read chapter 3 of textbook",
    "Read project documentation",
    "Read industry newsletter",
  ],
  write: ["Write project report", "Write blog post", "Write meeting notes"],
  meet: [
    "Meeting prep: agenda and slides",
    "Meeting follow-up actions",
    "Meet with team for sprint review",
  ],
  buy: [
    "Buy groceries for the week",
    "Buy new headphones",
    "Buy birthday gift",
  ],
  call: [
    "Call client for feedback",
    "Call team standup",
    "Call doctor appointment",
  ],
  review: [
    "Review pull request",
    "Review project proposal",
    "Review quarterly goals",
  ],
  plan: ["Plan weekly schedule", "Plan project milestones", "Plan team outing"],
  fix: ["Fix login bug", "Fix CSS styling issue", "Fix broken tests"],
  test: ["Test new feature", "Test API endpoints", "Test UI on mobile devices"],
  design: [
    "Design landing page mockup",
    "Design database schema",
    "Design system components",
  ],
  update: [
    "Update project dependencies",
    "Update documentation",
    "Update user profile",
  ],
  email: [
    "Email project update to stakeholders",
    "Email client proposal",
    "Email weekly summary",
  ],
  research: [
    "Research competitor analysis",
    "Research new technologies",
    "Research market trends",
  ],
  prepare: [
    "Prepare presentation slides",
    "Prepare interview questions",
    "Prepare sprint demo",
  ],
};

function getSuggestions(input: string): string[] {
  if (!input || input.length < 2) return [];
  const lower = input.toLowerCase();
  for (const [key, values] of Object.entries(SUGGESTIONS)) {
    if (lower.includes(key)) return values.slice(0, 4);
  }
  // Generic suggestions based on first word
  const firstWord = lower.split(" ")[0];
  return Object.keys(SUGGESTIONS)
    .filter((k) => k.startsWith(firstWord))
    .flatMap((k) => SUGGESTIONS[k])
    .slice(0, 4);
}

const PRIORITY_COLORS: Record<string, string> = {
  High: "bg-destructive/15 text-destructive border-destructive/30",
  Medium: "bg-warning/15 text-warning border-warning/30",
  Low: "bg-success/15 text-success border-success/30",
};

const TAG_COLORS: Record<string, string> = {
  Work: "bg-primary/10 text-primary border-primary/20",
  Study: "bg-accent/10 text-accent border-accent/20",
  Personal: "bg-chart-4/10 text-chart-4 border-chart-4/20",
};

export default function TasksPage() {
  const { data: tasks, isLoading } = useTasks();
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  const markComplete = useMarkComplete();
  const markIncomplete = useMarkIncomplete();

  const [filter, setFilter] = useState<FilterTab>("All");
  const [sort, setSort] = useState<SortKey>("order");
  const [search, setSearch] = useState("");
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [dragId, setDragId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (!tasks) return [];
    let result = [...tasks];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.description?.toLowerCase().includes(q),
      );
    }
    switch (filter) {
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
    }
    switch (sort) {
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
    }
    return result;
  }, [tasks, filter, sort, search]);

  const handleToggle = (task: Task) => {
    if (getStatusKey(task.status) === "Completed") {
      markIncomplete.mutate(task.id, {
        onSuccess: () => toast.info("Task marked as pending"),
      });
    } else {
      markComplete.mutate(task.id, {
        onSuccess: () => toast.success("Task completed! ✅"),
      });
    }
  };

  const handleDelete = (id: string) => deleteTask.mutate(id);

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground tracking-tight">
            My Tasks
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {tasks?.length ?? 0} tasks total
          </p>
        </div>
        <Button
          data-ocid="tasks.add_button"
          onClick={() => setShowCreate(true)}
          className="gap-2 font-display"
        >
          <Plus className="h-4 w-4" /> New Task
        </Button>
      </div>

      {/* Search + sort bar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            data-ocid="tasks.search_input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tasks…"
            className="pl-9 bg-card border-border"
          />
        </div>
        <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
          <SelectTrigger
            data-ocid="tasks.sort_select"
            className="w-36 bg-card border-border"
          >
            <SortAsc className="h-3.5 w-3.5 text-muted-foreground mr-1" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="order">Default order</SelectItem>
            <SelectItem value="date">By due date</SelectItem>
            <SelectItem value="priority">By priority</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Filter tabs */}
      <Tabs value={filter} onValueChange={(v) => setFilter(v as FilterTab)}>
        <TabsList className="bg-muted/50">
          {(["All", "Pending", "Completed", "Overdue"] as FilterTab[]).map(
            (tab) => (
              <TabsTrigger
                key={tab}
                value={tab}
                data-ocid={`tasks.filter.${tab.toLowerCase()}.tab`}
                className="text-xs font-body"
              >
                {tab}
              </TabsTrigger>
            ),
          )}
        </TabsList>
      </Tabs>

      {/* Task list */}
      {isLoading ? (
        <div className="space-y-3">
          {["s1", "s2", "s3", "s4"].map((k) => (
            <SkeletonCard key={k} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div
          data-ocid="tasks.empty_state"
          className="rounded-2xl border border-dashed border-border bg-card/50 p-12 text-center"
        >
          <div className="h-12 w-12 rounded-xl bg-muted mx-auto mb-4 flex items-center justify-center">
            <CheckCircle2 className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="font-display font-semibold text-foreground">
            No tasks found
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Create a task to get started
          </p>
          <Button
            onClick={() => setShowCreate(true)}
            className="mt-4 gap-2"
            size="sm"
            data-ocid="tasks.empty.add_button"
          >
            <Plus className="h-3.5 w-3.5" /> New Task
          </Button>
        </div>
      ) : (
        <ul className="space-y-2">
          <AnimatePresence mode="popLayout">
            {filtered.map((task, idx) => (
              <motion.li
                key={task.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ delay: idx * 0.03, duration: 0.25 }}
              >
                <TaskRow
                  task={task}
                  index={idx + 1}
                  onToggle={() => handleToggle(task)}
                  onEdit={() => setEditTask(task)}
                  onDelete={() => handleDelete(task.id)}
                  isDragging={dragId === task.id}
                  onDragStart={() => setDragId(task.id)}
                  onDragEnd={() => setDragId(null)}
                />
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}

      {/* Create dialog */}
      <TaskFormDialog
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onSave={async (data) => {
          await createTask.mutateAsync(data as CreateTaskInput);
          setShowCreate(false);
        }}
        isSaving={createTask.isPending}
      />

      {/* Edit dialog */}
      <TaskFormDialog
        open={!!editTask}
        onClose={() => setEditTask(null)}
        initialTask={editTask ?? undefined}
        onSave={async (data) => {
          if (!editTask) return;
          await updateTask.mutateAsync({
            id: editTask.id,
            ...(data as Omit<UpdateTaskInput, "id">),
          });
          setEditTask(null);
        }}
        isSaving={updateTask.isPending}
      />
    </div>
  );
}

function TaskRow({
  task,
  index,
  onToggle,
  onEdit,
  onDelete,
  isDragging,
  onDragStart,
  onDragEnd,
}: {
  task: Task;
  index: number;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
  isDragging: boolean;
  onDragStart: () => void;
  onDragEnd: () => void;
}) {
  const overdue = isOverdue(task);
  const completed = getStatusKey(task.status) === "Completed";
  const priorityKey = getPriorityKey(task.priority);

  return (
    <div
      data-ocid={`tasks.item.${index}`}
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      className={cn(
        "group flex items-start gap-3 rounded-xl border border-border bg-card p-4 hover-lift transition-smooth",
        overdue ? "task-overdue" : `priority-${priorityKey.toLowerCase()}`,
        completed && "task-completed",
        isDragging && "opacity-50",
      )}
    >
      <div className="mt-0.5 cursor-grab opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </div>

      <button
        type="button"
        onClick={onToggle}
        data-ocid={`tasks.checkbox.${index}`}
        className="mt-0.5 shrink-0 transition-smooth hover:scale-110"
        aria-label={completed ? "Mark incomplete" : "Mark complete"}
      >
        {completed ? (
          <CheckCircle2 className="h-5 w-5 text-success" />
        ) : (
          <Circle className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
        )}
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-start gap-2">
          <p
            className={cn(
              "text-sm font-display font-semibold text-foreground leading-snug flex-1",
              completed && "line-through text-muted-foreground",
            )}
          >
            {task.title}
          </p>
          {overdue && (
            <span className="shrink-0 flex items-center gap-1 text-[10px] text-destructive font-body">
              <AlertTriangle className="h-3 w-3" />
              Overdue
            </span>
          )}
        </div>

        {task.description && (
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
            {task.description}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-2 mt-2">
          {task.dueDate !== undefined && task.dueDate !== null && (
            <span
              className={cn(
                "text-[10px] font-body",
                overdue ? "text-destructive" : "text-muted-foreground",
              )}
            >
              Due{" "}
              {new Date(Number(task.dueDate) / 1_000_000).toLocaleDateString(
                "en-US",
                { month: "short", day: "numeric" },
              )}
            </span>
          )}
          <Badge
            variant="outline"
            className={cn(
              "text-[10px] px-1.5 py-0 border",
              PRIORITY_COLORS[priorityKey],
            )}
          >
            {priorityKey}
          </Badge>
          {task.tags.map((tag) => {
            const tagKey = getTagKey(tag);
            return (
              <Badge
                key={tagKey}
                variant="outline"
                className={cn(
                  "text-[10px] px-1.5 py-0 border",
                  TAG_COLORS[tagKey],
                )}
              >
                {tagKey}
              </Badge>
            );
          })}
        </div>
      </div>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
        <Button
          variant="ghost"
          size="icon"
          onClick={onEdit}
          data-ocid={`tasks.edit_button.${index}`}
          className="h-7 w-7 text-muted-foreground hover:text-foreground"
          aria-label="Edit task"
        >
          <Pencil className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onDelete}
          data-ocid={`tasks.delete_button.${index}`}
          className="h-7 w-7 text-muted-foreground hover:text-destructive"
          aria-label="Delete task"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}

type FormData = {
  title: string;
  description: string;
  dueDate: string;
  priority: PriorityKey;
  tags: TagKey[];
};

function TaskFormDialog({
  open,
  onClose,
  initialTask,
  onSave,
  isSaving,
}: {
  open: boolean;
  onClose: () => void;
  initialTask?: Task;
  onSave: (data: Partial<CreateTaskInput>) => Promise<void>;
  isSaving: boolean;
}) {
  const isEdit = !!initialTask;
  const inputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<FormData>({
    title: initialTask?.title ?? "",
    description: initialTask?.description ?? "",
    dueDate:
      initialTask?.dueDate !== undefined && initialTask.dueDate !== null
        ? new Date(Number(initialTask.dueDate) / 1_000_000)
            .toISOString()
            .split("T")[0]
        : "",
    priority: getPriorityKey(initialTask?.priority ?? makePriority("Medium")),
    tags: initialTask?.tags.map(getTagKey) ?? [],
  });

  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleTitleChange = (val: string) => {
    setForm((f) => ({ ...f, title: val }));
    const s = getSuggestions(val);
    setSuggestions(s);
    setShowSuggestions(s.length > 0 && val.length > 0);
  };

  const applySuggestion = (s: string) => {
    setForm((f) => ({ ...f, title: s }));
    setSuggestions([]);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const toggleTag = (tag: TagKey) => {
    setForm((f) => ({
      ...f,
      tags: f.tags.includes(tag)
        ? f.tags.filter((t) => t !== tag)
        : [...f.tags, tag],
    }));
  };

  const handleSubmit = async () => {
    if (!form.title.trim()) {
      toast.error("Title is required");
      return;
    }
    const input: CreateTaskInput = {
      title: form.title.trim(),
      description: form.description.trim() || undefined,
      dueDate: form.dueDate
        ? BigInt(new Date(form.dueDate).getTime()) * 1_000_000n
        : undefined,
      priority: makePriority(form.priority),
      tags: form.tags.map(makeTag),
    };
    await onSave(input);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        data-ocid="tasks.dialog"
        className="bg-card border-border max-w-lg"
      >
        <DialogHeader>
          <DialogTitle className="font-display">
            {isEdit ? "Edit Task" : "Create New Task"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Title with smart suggestions */}
          <div className="space-y-1.5 relative">
            <Label htmlFor="task-title" className="font-body text-xs">
              Task title *
            </Label>
            <Input
              ref={inputRef}
              id="task-title"
              data-ocid="tasks.input"
              value={form.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              onFocus={() =>
                form.title && setShowSuggestions(suggestions.length > 0)
              }
              onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
              placeholder="e.g. Complete math assignment…"
              className="bg-background border-input"
            />
            {showSuggestions && (
              <ul className="absolute z-50 top-full mt-1 w-full rounded-lg border border-border bg-popover shadow-lg overflow-hidden">
                {suggestions.map((s) => (
                  <li key={s}>
                    <button
                      type="button"
                      onMouseDown={() => applySuggestion(s)}
                      className="w-full text-left px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors font-body"
                    >
                      <span className="text-primary mr-1.5">↩</span> {s}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="task-desc" className="font-body text-xs">
              Description
            </Label>
            <Textarea
              id="task-desc"
              data-ocid="tasks.textarea"
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
              placeholder="Add details…"
              rows={3}
              className="bg-background border-input resize-none text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Due date */}
            <div className="space-y-1.5">
              <Label htmlFor="task-due" className="font-body text-xs">
                Due date
              </Label>
              <Input
                id="task-due"
                type="date"
                data-ocid="tasks.due_date_input"
                value={form.dueDate}
                onChange={(e) =>
                  setForm((f) => ({ ...f, dueDate: e.target.value }))
                }
                className="bg-background border-input text-sm"
              />
            </div>

            {/* Priority */}
            <div className="space-y-1.5">
              <Label className="font-body text-xs">Priority</Label>
              <Select
                value={form.priority}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, priority: v as PriorityKey }))
                }
              >
                <SelectTrigger
                  data-ocid="tasks.priority_select"
                  className="bg-background border-input text-sm"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Low">🟢 Low</SelectItem>
                  <SelectItem value="Medium">🟡 Medium</SelectItem>
                  <SelectItem value="High">🔴 High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-1.5">
            <Label className="font-body text-xs">Tags</Label>
            <div className="flex gap-2">
              {(["Work", "Study", "Personal"] as TagKey[]).map((tag) => (
                <button
                  key={tag}
                  type="button"
                  data-ocid={`tasks.tag.${tag.toLowerCase()}.toggle`}
                  onClick={() => toggleTag(tag)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-body border transition-smooth",
                    form.tags.includes(tag)
                      ? `${TAG_COLORS[tag]} border-current`
                      : "bg-muted/50 text-muted-foreground border-border hover:bg-muted",
                  )}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            data-ocid="tasks.cancel_button"
            className="font-body"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSaving}
            data-ocid="tasks.submit_button"
            className="font-display gap-2"
          >
            {isSaving ? "Saving…" : isEdit ? "Save Changes" : "Create Task"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
