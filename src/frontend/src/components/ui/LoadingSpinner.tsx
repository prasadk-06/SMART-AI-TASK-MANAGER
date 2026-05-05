import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeMap = {
  sm: "h-4 w-4 border-2",
  md: "h-8 w-8 border-2",
  lg: "h-12 w-12 border-[3px]",
};

export function LoadingSpinner({
  size = "md",
  className,
}: LoadingSpinnerProps) {
  return (
    <div
      role="status"
      aria-label="Loading"
      className={cn(
        "animate-spin rounded-full border-transparent border-t-primary",
        sizeMap[size],
        className,
      )}
    />
  );
}

export function FullPageLoader() {
  return (
    <div
      data-ocid="app.loading_state"
      className="flex min-h-screen items-center justify-center bg-background"
    >
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center">
            <LoadingSpinner size="lg" />
          </div>
        </div>
        <p className="text-sm text-muted-foreground font-body animate-pulse">
          Loading Smart AI Task Manager…
        </p>
      </div>
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="rounded-lg border border-border bg-card p-4 space-y-3 animate-pulse">
      <div className="h-4 w-3/4 rounded bg-muted" />
      <div className="h-3 w-full rounded bg-muted" />
      <div className="h-3 w-1/2 rounded bg-muted" />
      <div className="flex gap-2 mt-2">
        <div className="h-5 w-14 rounded-full bg-muted" />
        <div className="h-5 w-12 rounded-full bg-muted" />
      </div>
    </div>
  );
}
