import { FilterBar } from "@/components/FilterBar";
import { StatsBar } from "@/components/StatsBar";
import { TaskList } from "@/components/TaskList";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Textarea } from "@/components/ui/textarea";
import {
  useCreateTask,
  useDeleteTask,
  useMarkComplete,
  useMarkIncomplete,
  useTasks,
  useUpdateTask,
  useUpdateTaskOrder,
} from "@/hooks/useTasks";
import {
  getPriorityKey,
  getStatusKey,
  getTagKey,
  makePriority,
  makeTag,
} from "@/types/task";
import type {
  FilterTab,
  PriorityKey,
  SortKey,
  TagKey,
  Task,
  TaskOrderEntry,
} from "@/types/task";
import { Plus } from "lucide-react";
import { useCallback, useDeferredValue, useMemo, useState } from "react";
import { toast } from "sonner";

// --- Smart suggestion engine ---
const SUGGESTION_TEMPLATES = [
  { trigger: "math", suggestion: "Complete math assignment" },
  { trigger: "meeting", suggestion: "Prepare for team meeting" },
  { trigger: "email", suggestion: "Reply to pending emails" },
  { trigger: "report", suggestion: "Finalize quarterly report" },
  { trigger: "code", suggestion: "Code review for PR #" },
  { trigger: "review", suggestion: "Review project documentation" },
  { trigger: "call", suggestion: "Schedule follow-up call" },
  { trigger: "design", suggestion: "Design mockup for new feature" },
  { trigger: "test", suggestion: "Write unit tests for module" },
  { trigger: "deploy", suggestion: "Deploy latest build to staging" },
  { trigger: "read", suggestion: "Read chapter in current book" },
  { trigger: "exercise", suggestion: "Exercise for 30 minutes" },
  { trigger: "budget", suggestion: "Review monthly budget" },
  { trigger: "plan", suggestion: "Plan sprint tasks for next week" },
  { trigger: "doc", suggestion: "Document API endpoints" },
  { trigger: "fix", suggestion: "Fix reported bug in dashboard" },
  { trigger: "updat", suggestion: "Update dependencies to latest" },
  { trigger: "present", suggestion: "Prepare presentation slides" },
  { trigger: "research", suggestion: "Research competitor features" },
  { trigger: "sync", suggestion: "Sync with project stakeholders" },
];

function getSmartSuggestion(input: string): string | null {
  if (input.length < 2) return null;
  const lower = input.toLowerCase();
  const match = SUGGESTION_TEMPLATES.find((s) => lower.includes(s.trigger));
  if (!match) return null;
  // Only suggest if the suggestion is different from current input
  if (match.suggestion.toLowerCase().startsWith(lower)) return match.suggestion;
  if (
    lower.length < match.suggestion.length &&
    match.suggestion.toLowerCase().includes(lower)
  )
    return match.suggestion;
  return null;
}

// --- Task form state ---
interface TaskFormState {
  title: string;
  description: string;
  dueDate: string;
  priority: PriorityKey;
  tags: TagKey[];
}

const DEFAULT_FORM: TaskFormState = {
  title: "",
  description: "",
  dueDate: "",
  priority: "Medium",
  tags: [],
};

const TAG_OPTIONS: TagKey[] = ["Work", "Study", "Personal"];
const PRIORITY_OPTIONS: PriorityKey[] = ["Low", "Medium", "High"];

// --- Main page ---
export default function DashboardPage() {
  const { data: allTasks = [], isLoading } = useTasks();
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  const markComplete = useMarkComplete();
  const markIncomplete = useMarkIncomplete();
  const updateOrder = useUpdateTaskOrder();

  const [activeFilter, setActiveFilter] = useState<FilterTab>("All");
  const [sortKey, setSortKey] = useState<SortKey>("order");
  const [searchRaw, setSearchRaw] = useState("");
  const search = useDeferredValue(searchRaw);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [form, setForm] = useState<TaskFormState>(DEFAULT_FORM);
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Task counts per filter
  const taskCounts = useMemo<Record<FilterTab, number>>(() => {
    const { getStatusKey: gsk, isOverdue: io } = {
      getStatusKey,
      isOverdue: (t: Task) => {
        if (gsk(t.status) === "Completed") return false;
        if (t.dueDate === undefined || t.dueDate === null) return false;
        return Number(t.dueDate) / 1_000_000 < Date.now();
      },
    };
    return {
      All: allTasks.length,
      Pending: allTasks.filter((t) => gsk(t.status) === "Pending" && !io(t))
        .length,
      Completed: allTasks.filter((t) => gsk(t.status) === "Completed").length,
      Overdue: allTasks.filter(io).length,
    };
  }, [allTasks]);

  // Open create modal
  const openCreate = useCallback(() => {
    setEditingTask(null);
    setForm(DEFAULT_FORM);
    setSuggestion(null);
    setModalOpen(true);
  }, []);

  // Open edit modal
  const openEdit = useCallback((task: Task) => {
    setEditingTask(task);
    const dueDateMs =
      task.dueDate !== undefined && task.dueDate !== null
        ? Number(task.dueDate) / 1_000_000
        : null;
    setForm({
      title: task.title,
      description: task.description ?? "",
      dueDate: dueDateMs ? new Date(dueDateMs).toISOString().split("T")[0] : "",
      priority: getPriorityKey(task.priority),
      tags: task.tags.map(getTagKey),
    });
    setSuggestion(null);
    setModalOpen(true);
  }, []);

  // Handle title input + smart suggestions
  const handleTitleChange = (v: string) => {
    setForm((f) => ({ ...f, title: v }));
    setSuggestion(getSmartSuggestion(v));
  };

  const applySuggestion = () => {
    if (suggestion) {
      setForm((f) => ({ ...f, title: suggestion }));
      setSuggestion(null);
    }
  };

  // Toggle tag
  const toggleTag = (key: TagKey) => {
    setForm((f) => ({
      ...f,
      tags: f.tags.includes(key)
        ? f.tags.filter((t) => t !== key)
        : [...f.tags, key],
    }));
  };

  // Submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      toast.error("Title is required");
      return;
    }

    const tags = form.tags.map(makeTag);
    const priority = makePriority(form.priority);
    const dueDate = form.dueDate
      ? BigInt(new Date(form.dueDate).getTime()) * 1_000_000n
      : undefined;
    const description = form.description.trim() || undefined;

    if (editingTask) {
      await updateTask.mutateAsync({
        id: editingTask.id,
        title: form.title.trim(),
        description,
        dueDate,
        priority,
        tags,
      });
    } else {
      await createTask.mutateAsync({
        title: form.title.trim(),
        description,
        dueDate,
        priority,
        tags,
      });
    }
    setModalOpen(false);
  };

  // Toggle complete
  const handleToggle = useCallback(
    async (taskId: string, completed: boolean) => {
      setTogglingId(taskId);
      try {
        if (completed) {
          await markComplete.mutateAsync(taskId);
          toast.success("Task completed! ✅");
        } else {
          await markIncomplete.mutateAsync(taskId);
          toast.info("Task marked as pending");
        }
      } finally {
        setTogglingId(null);
      }
    },
    [markComplete, markIncomplete],
  );

  // Delete
  const handleDelete = useCallback(
    async (taskId: string) => {
      setDeletingId(taskId);
      try {
        await deleteTask.mutateAsync(taskId);
      } finally {
        setDeletingId(null);
      }
    },
    [deleteTask],
  );

  // Reorder
  const handleReorder = useCallback(
    (entries: TaskOrderEntry[]) => {
      updateOrder.mutate(entries);
    },
    [updateOrder],
  );

  const isSaving = createTask.isPending || updateTask.isPending;

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-4xl mx-auto">
      {/* Page header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground tracking-tight">
            Smart AI Task Manager
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {isLoading
              ? "Loading your tasks…"
              : `${allTasks.length} task${allTasks.length !== 1 ? "s" : ""} in your workspace`}
          </p>
        </div>
        <Button
          onClick={openCreate}
          className="shrink-0"
          data-ocid="dashboard.create_task_button"
        >
          <Plus className="h-4 w-4 mr-1.5" />
          New task
        </Button>
      </div>

      {/* Stats */}
      <StatsBar tasks={allTasks} isLoading={isLoading} />

      {/* Filter + Search + Sort */}
      <FilterBar
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        sortKey={sortKey}
        onSortChange={setSortKey}
        search={searchRaw}
        onSearchChange={setSearchRaw}
        taskCounts={taskCounts}
      />

      {/* Task list */}
      <TaskList
        tasks={allTasks}
        isLoading={isLoading}
        activeFilter={activeFilter}
        sortKey={sortKey}
        search={search}
        onToggleComplete={handleToggle}
        onEdit={openEdit}
        onDelete={handleDelete}
        onReorder={handleReorder}
        togglingId={togglingId}
        deletingId={deletingId}
        onCreateTask={openCreate}
      />

      {/* Create / Edit task modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent
          className="max-w-lg"
          data-ocid={editingTask ? "task_edit.dialog" : "task_create.dialog"}
        >
          <DialogHeader>
            <DialogTitle className="font-display">
              {editingTask ? "Edit task" : "Create new task"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            {/* Title with smart suggestion */}
            <div className="space-y-1.5">
              <Label htmlFor="task-title">
                Title <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="task-title"
                  placeholder="e.g. Complete math assignment…"
                  value={form.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  autoComplete="off"
                  data-ocid="task_form.title_input"
                />
                {suggestion && (
                  <button
                    type="button"
                    onClick={applySuggestion}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-primary/70 hover:text-primary border border-primary/20 hover:border-primary/40 bg-primary/5 hover:bg-primary/10 rounded px-2 py-0.5 transition-colors"
                    data-ocid="task_form.suggestion_button"
                  >
                    → {suggestion}
                  </button>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label htmlFor="task-desc">Description</Label>
              <Textarea
                id="task-desc"
                placeholder="Optional details…"
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                rows={3}
                className="resize-none"
                data-ocid="task_form.description_textarea"
              />
            </div>

            {/* Due date + Priority row */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="task-due">Due date</Label>
                <Input
                  id="task-due"
                  type="date"
                  value={form.dueDate}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, dueDate: e.target.value }))
                  }
                  data-ocid="task_form.due_date_input"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="task-priority">Priority</Label>
                <Select
                  value={form.priority}
                  onValueChange={(v) =>
                    setForm((f) => ({ ...f, priority: v as PriorityKey }))
                  }
                >
                  <SelectTrigger
                    id="task-priority"
                    data-ocid="task_form.priority_select"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PRIORITY_OPTIONS.map((p) => (
                      <SelectItem key={p} value={p}>
                        {p}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Tags */}
            <div className="space-y-1.5">
              <Label>Tags</Label>
              <div className="flex gap-3">
                {TAG_OPTIONS.map((tag) => (
                  <div key={tag} className="flex items-center gap-1.5">
                    <Checkbox
                      id={`tag-${tag}`}
                      checked={form.tags.includes(tag)}
                      onCheckedChange={() => toggleTag(tag)}
                      data-ocid={`task_form.tag_${tag.toLowerCase()}_checkbox`}
                    />
                    <Label
                      htmlFor={`tag-${tag}`}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {tag}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setModalOpen(false)}
                data-ocid="task_form.cancel_button"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSaving || !form.title.trim()}
                data-ocid="task_form.submit_button"
              >
                {isSaving
                  ? "Saving…"
                  : editingTask
                    ? "Save changes"
                    : "Create task"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
