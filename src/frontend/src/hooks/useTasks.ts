import { createActor } from "@/backend";
import { mockBackend } from "@/mocks/backend";
import type {
  CreateTaskInput,
  Task,
  TaskOrderEntry,
  UpdateTaskInput,
} from "@/types/task";
import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const TASKS_KEY = ["tasks"] as const;

export function useTasks() {
  const { actor, isFetching } = useActor(createActor);
  const backend = actor ?? mockBackend;

  return useQuery<Task[]>({
    queryKey: TASKS_KEY,
    queryFn: async () => {
      return backend.getTasks() as Promise<Task[]>;
    },
    enabled: !isFetching || !actor,
    staleTime: 1000 * 30,
  });
}

export function useCreateTask() {
  const { actor } = useActor(createActor);
  const backend = actor ?? mockBackend;
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateTaskInput) => {
      const res = await backend.createTask(input);
      if (res.__kind__ === "err") throw new Error(res.err);
      return res.ok;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: TASKS_KEY });
      toast.success("Task created");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useUpdateTask() {
  const { actor } = useActor(createActor);
  const backend = actor ?? mockBackend;
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdateTaskInput) => {
      const res = await backend.updateTask(input);
      if (res.__kind__ === "err") throw new Error(res.err);
      return res.ok;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: TASKS_KEY });
      toast.success("Task updated");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeleteTask() {
  const { actor } = useActor(createActor);
  const backend = actor ?? mockBackend;
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (taskId: string) => {
      const res = await backend.deleteTask(taskId);
      if (res.__kind__ === "err") throw new Error(res.err);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: TASKS_KEY });
      toast.success("Task deleted");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useMarkComplete() {
  const { actor } = useActor(createActor);
  const backend = actor ?? mockBackend;
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (taskId: string) => {
      const res = await backend.markComplete(taskId);
      if (res.__kind__ === "err") throw new Error(res.err);
      return res.ok;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: TASKS_KEY }),
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useMarkIncomplete() {
  const { actor } = useActor(createActor);
  const backend = actor ?? mockBackend;
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (taskId: string) => {
      const res = await backend.markIncomplete(taskId);
      if (res.__kind__ === "err") throw new Error(res.err);
      return res.ok;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: TASKS_KEY }),
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useUpdateTaskOrder() {
  const { actor } = useActor(createActor);
  const backend = actor ?? mockBackend;
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (entries: TaskOrderEntry[]) => {
      const res = await backend.updateTaskOrder(entries);
      if (res.__kind__ === "err") throw new Error(res.err);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: TASKS_KEY }),
    onError: (e: Error) => toast.error(e.message),
  });
}
