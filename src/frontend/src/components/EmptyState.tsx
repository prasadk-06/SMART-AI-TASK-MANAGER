import { Button } from "@/components/ui/button";
import { motion } from "motion/react";

interface EmptyStateProps {
  title: string;
  description: string;
  ctaLabel?: string;
  onCta?: () => void;
  isSearch?: boolean;
}

export function EmptyState({
  title,
  description,
  ctaLabel,
  onCta,
  isSearch,
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      data-ocid="tasklist.empty_state"
      className="flex flex-col items-center justify-center py-20 px-6 text-center"
    >
      {/* Illustration */}
      <div className="mb-6 relative">
        <div className="h-24 w-24 rounded-2xl bg-muted/60 border border-border flex items-center justify-center">
          {isSearch ? (
            <svg
              viewBox="0 0 48 48"
              fill="none"
              className="h-12 w-12"
              aria-hidden="true"
            >
              <circle
                cx="21"
                cy="21"
                r="13"
                stroke="oklch(var(--muted-foreground))"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <path
                d="M34 34l6 6"
                stroke="oklch(var(--muted-foreground))"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <path
                d="M16 21h10M21 16v10"
                stroke="oklch(var(--primary))"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          ) : (
            <svg
              viewBox="0 0 48 48"
              fill="none"
              className="h-12 w-12"
              aria-hidden="true"
            >
              <rect
                x="8"
                y="12"
                width="32"
                height="6"
                rx="3"
                fill="oklch(var(--muted-foreground) / 0.3)"
              />
              <rect
                x="8"
                y="22"
                width="24"
                height="6"
                rx="3"
                fill="oklch(var(--muted-foreground) / 0.2)"
              />
              <rect
                x="8"
                y="32"
                width="28"
                height="6"
                rx="3"
                fill="oklch(var(--muted-foreground) / 0.1)"
              />
              <circle
                cx="38"
                cy="35"
                r="7"
                fill="oklch(var(--primary) / 0.15)"
                stroke="oklch(var(--primary))"
                strokeWidth="1.5"
              />
              <path
                d="M35.5 35h5M38 32.5v5"
                stroke="oklch(var(--primary))"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          )}
        </div>
        {/* Subtle glow ring */}
        <div
          className="absolute inset-0 rounded-2xl bg-primary/5 scale-125 blur-xl"
          aria-hidden="true"
        />
      </div>

      <h3 className="text-base font-display font-semibold text-foreground">
        {title}
      </h3>
      <p className="text-sm text-muted-foreground mt-1.5 max-w-xs">
        {description}
      </p>

      {onCta && ctaLabel && (
        <Button
          onClick={onCta}
          className="mt-6"
          data-ocid="tasklist.empty_state_cta_button"
        >
          {ctaLabel}
        </Button>
      )}
    </motion.div>
  );
}
