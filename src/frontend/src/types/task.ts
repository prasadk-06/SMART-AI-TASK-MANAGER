import type { Priority, Status, Tag } from "@/backend";
export type { Priority, Status, Tag } from "@/backend";

export interface Task {
  id: string;
  userId: { toText?: () => string } | string;
  title: string;
  description?: string;
  dueDate?: bigint;
  priority: Priority;
  tags: Tag[];
  status: Status;
  order: bigint;
  createdAt: bigint;
  updatedAt: bigint;
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  dueDate?: bigint;
  priority: Priority;
  tags: Tag[];
}

export interface UpdateTaskInput {
  id: string;
  title: string;
  description?: string;
  dueDate?: bigint;
  priority: Priority;
  tags: Tag[];
}

export interface TaskOrderEntry {
  id: string;
  order: bigint;
}

export type Result<T, E> =
  | { __kind__: "ok"; ok: T }
  | { __kind__: "err"; err: E };

// Derived helpers
export type PriorityKey = "Low" | "Medium" | "High";
export type TagKey = "Work" | "Study" | "Personal";
export type StatusKey = "Pending" | "Completed";
export type FilterTab = "All" | "Pending" | "Completed" | "Overdue";
export type SortKey = "date" | "priority" | "order";

import {
  Priority as PriorityEnum,
  Status as StatusEnum,
  Tag as TagEnum,
} from "@/backend";

export function getPriorityKey(p: Priority): PriorityKey {
  if (p === PriorityEnum.Low) return "Low";
  if (p === PriorityEnum.Medium) return "Medium";
  return "High";
}

export function getTagKey(t: Tag): TagKey {
  if (t === TagEnum.Work) return "Work";
  if (t === TagEnum.Study) return "Study";
  return "Personal";
}

export function getStatusKey(s: Status): StatusKey {
  return s === StatusEnum.Pending ? "Pending" : "Completed";
}

export function isOverdue(task: Task): boolean {
  if (getStatusKey(task.status) === "Completed") return false;
  if (task.dueDate === undefined || task.dueDate === null) return false;
  const due = Number(task.dueDate) / 1_000_000; // nanoseconds → ms
  return due < Date.now();
}

export function makePriority(key: PriorityKey): Priority {
  if (key === "Low") return PriorityEnum.Low;
  if (key === "Medium") return PriorityEnum.Medium;
  return PriorityEnum.High;
}

export function makeTag(key: TagKey): Tag {
  if (key === "Work") return TagEnum.Work;
  if (key === "Study") return TagEnum.Study;
  return TagEnum.Personal;
}

export const PRIORITY_ORDER: Record<PriorityKey, number> = {
  High: 3,
  Medium: 2,
  Low: 1,
};
