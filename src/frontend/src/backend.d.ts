import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface TaskOrderEntry {
    id: string;
    order: bigint;
}
export interface CreateTaskInput {
    title: string;
    tags: Array<Tag>;
    dueDate?: bigint;
    description?: string;
    priority: Priority;
}
export interface Task {
    id: string;
    status: Status;
    title: string;
    order: bigint;
    userId: Principal;
    createdAt: bigint;
    tags: Array<Tag>;
    dueDate?: bigint;
    description?: string;
    updatedAt: bigint;
    priority: Priority;
}
export interface UpdateTaskInput {
    id: string;
    title: string;
    tags: Array<Tag>;
    dueDate?: bigint;
    description?: string;
    priority: Priority;
}
export enum Priority {
    Low = "Low",
    High = "High",
    Medium = "Medium"
}
export enum Status {
    Completed = "Completed",
    Pending = "Pending"
}
export enum Tag {
    Study = "Study",
    Work = "Work",
    Personal = "Personal"
}
export interface backendInterface {
    createTask(input: CreateTaskInput): Promise<{
        __kind__: "ok";
        ok: Task;
    } | {
        __kind__: "err";
        err: string;
    }>;
    deleteTask(taskId: string): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "err";
        err: string;
    }>;
    getTasks(): Promise<Array<Task>>;
    markComplete(taskId: string): Promise<{
        __kind__: "ok";
        ok: Task;
    } | {
        __kind__: "err";
        err: string;
    }>;
    markIncomplete(taskId: string): Promise<{
        __kind__: "ok";
        ok: Task;
    } | {
        __kind__: "err";
        err: string;
    }>;
    updateTask(input: UpdateTaskInput): Promise<{
        __kind__: "ok";
        ok: Task;
    } | {
        __kind__: "err";
        err: string;
    }>;
    updateTaskOrder(entries: Array<TaskOrderEntry>): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "err";
        err: string;
    }>;
}
