import type { Task, backendInterface } from "../backend";
import { Priority, Status, Tag } from "../backend";

const mockPrincipalObj = { toText: () => "mock-user" };

const now = BigInt(Date.now()) * 1_000_000n;
const dayMs = BigInt(86_400_000) * 1_000_000n;

const sampleTasks: Task[] = [
  {
    id: "task-1",
    title: "Finalize Q4 Marketing Report",
    description: "Review analytics data, update slides, and share with team for feedback",
    status: Status.Pending,
    priority: Priority.High,
    tags: [Tag.Work, Tag.Study, Tag.Personal],
    dueDate: now - dayMs * 2n,
    userId: mockPrincipalObj as unknown as import("@icp-sdk/core/principal").Principal,
    createdAt: now - dayMs * 5n,
    updatedAt: now - dayMs * 1n,
    order: 1n,
  },
  {
    id: "task-2",
    title: "Finalize Reenside Report",
    description: "Review analytics data, update slides, and share with team for feedback",
    status: Status.Completed,
    priority: Priority.Medium,
    tags: [Tag.Work, Tag.Study],
    dueDate: now + dayMs * 3n,
    userId: mockPrincipalObj as unknown as import("@icp-sdk/core/principal").Principal,
    createdAt: now - dayMs * 4n,
    updatedAt: now - dayMs * 1n,
    order: 2n,
  },
  {
    id: "task-3",
    title: "Task Q1 Marketing Report",
    description: "Review analytics data, update slides, and share with team for feedback",
    status: Status.Pending,
    priority: Priority.Medium,
    tags: [Tag.Work, Tag.Personal],
    dueDate: now - dayMs * 1n,
    userId: mockPrincipalObj as unknown as import("@icp-sdk/core/principal").Principal,
    createdAt: now - dayMs * 3n,
    updatedAt: now,
    order: 3n,
  },
  {
    id: "task-4",
    title: "Teamiliate State Report",
    description: "Review analytics data, update slides, and share with team for feedback",
    status: Status.Completed,
    priority: Priority.Medium,
    tags: [Tag.Work, Tag.Study],
    dueDate: now + dayMs * 7n,
    userId: mockPrincipalObj as unknown as import("@icp-sdk/core/principal").Principal,
    createdAt: now - dayMs * 6n,
    updatedAt: now - dayMs * 2n,
    order: 4n,
  },
  {
    id: "task-5",
    title: "Finalize Q4 Marketing Report",
    description: "Review analytics data, update slides, and share with team for feedback",
    status: Status.Pending,
    priority: Priority.Low,
    tags: [Tag.Work, Tag.Study],
    dueDate: now + dayMs * 2n,
    userId: mockPrincipalObj as unknown as import("@icp-sdk/core/principal").Principal,
    createdAt: now - dayMs * 2n,
    updatedAt: now,
    order: 5n,
  },
  {
    id: "task-6",
    title: "Finalize Finance Report",
    description: "Review analytics data, update slides, and share with team for feedback",
    status: Status.Pending,
    priority: Priority.High,
    tags: [Tag.Work, Tag.Study],
    dueDate: now - dayMs * 3n,
    userId: mockPrincipalObj as unknown as import("@icp-sdk/core/principal").Principal,
    createdAt: now - dayMs * 7n,
    updatedAt: now - dayMs * 1n,
    order: 6n,
  },
  {
    id: "task-7",
    title: "Finalize 3 Marketing Report",
    description: "Review analytics data, update slides, and share with team for feedback",
    status: Status.Completed,
    priority: Priority.Low,
    tags: [Tag.Work, Tag.Personal],
    dueDate: now + dayMs * 5n,
    userId: mockPrincipalObj as unknown as import("@icp-sdk/core/principal").Principal,
    createdAt: now - dayMs * 8n,
    updatedAt: now - dayMs * 3n,
    order: 7n,
  },
  {
    id: "task-8",
    title: "Finalize I3 Marketing Report",
    description: "Review analytics data, update slides, and share with team for feedback",
    status: Status.Completed,
    priority: Priority.Medium,
    tags: [Tag.Work, Tag.Study],
    dueDate: now + dayMs * 4n,
    userId: mockPrincipalObj as unknown as import("@icp-sdk/core/principal").Principal,
    createdAt: now - dayMs * 9n,
    updatedAt: now - dayMs * 4n,
    order: 8n,
  },
  {
    id: "task-9",
    title: "Finalize Marketing Report",
    description: "Review analytics data, update slides, and share with team for feedback",
    status: Status.Pending,
    priority: Priority.Medium,
    tags: [Tag.Work, Tag.Study, Tag.Personal],
    dueDate: now - dayMs * 4n,
    userId: mockPrincipalObj as unknown as import("@icp-sdk/core/principal").Principal,
    createdAt: now - dayMs * 10n,
    updatedAt: now - dayMs * 5n,
    order: 9n,
  },
];

let tasks: Task[] = [...sampleTasks];

export const mockBackend: backendInterface = {
  getTasks: async () => tasks,

  createTask: async (input) => {
    const newTask: Task = {
      id: `task-${Date.now()}`,
      status: Status.Pending,
      title: input.title,
      order: BigInt(tasks.length + 1),
      userId: mockPrincipalObj as unknown as import("@icp-sdk/core/principal").Principal,
      createdAt: BigInt(Date.now()) * 1_000_000n,
      updatedAt: BigInt(Date.now()) * 1_000_000n,
      tags: input.tags,
      dueDate: input.dueDate,
      description: input.description,
      priority: input.priority,
    };
    tasks = [...tasks, newTask];
    return { __kind__: "ok", ok: newTask };
  },

  deleteTask: async (taskId) => {
    const before = tasks.length;
    tasks = tasks.filter((t) => t.id !== taskId);
    if (tasks.length < before) return { __kind__: "ok", ok: null };
    return { __kind__: "err", err: "Task not found" };
  },

  markComplete: async (taskId) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return { __kind__: "err", err: "Task not found" };
    const updated = { ...task, status: Status.Completed, updatedAt: BigInt(Date.now()) * BigInt(1_000_000) };
    tasks = tasks.map((t) => (t.id === taskId ? updated : t));
    return { __kind__: "ok", ok: updated };
  },

  markIncomplete: async (taskId) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return { __kind__: "err", err: "Task not found" };
    const updated = { ...task, status: Status.Pending, updatedAt: BigInt(Date.now()) * BigInt(1_000_000) };
    tasks = tasks.map((t) => (t.id === taskId ? updated : t));
    return { __kind__: "ok", ok: updated };
  },

  updateTask: async (input) => {
    const task = tasks.find((t) => t.id === input.id);
    if (!task) return { __kind__: "err", err: "Task not found" };
    const updated: Task = {
      ...task,
      title: input.title,
      tags: input.tags,
      dueDate: input.dueDate,
      description: input.description,
      priority: input.priority,
      updatedAt: BigInt(Date.now()) * BigInt(1_000_000),
    };
    tasks = tasks.map((t) => (t.id === input.id ? updated : t));
    return { __kind__: "ok", ok: updated };
  },

  updateTaskOrder: async (entries) => {
    entries.forEach((entry) => {
      const task = tasks.find((t) => t.id === entry.id);
      if (task) {
        (task as any).order = entry.order;
      }
    });
    return { __kind__: "ok", ok: null };
  },
};
