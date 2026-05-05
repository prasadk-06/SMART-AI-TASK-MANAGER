import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef } from "react";

const SUGGESTION_MAP: Record<string, string[]> = {
  math: ["Complete math assignment", "Study math chapter", "Math homework due"],
  meet: [
    "Schedule team meeting",
    "Prepare meeting agenda",
    "Follow up after meeting",
  ],
  read: [
    "Read chapter X",
    "Read and summarize article",
    "Book reading session",
  ],
  buy: ["Buy groceries", "Buy supplies for project", "Research before buying"],
  call: ["Call client", "Schedule call with team", "Return missed call"],
  study: ["Study for exam", "Study session — 2 hours", "Review study notes"],
  project: [
    "Work on project deadline",
    "Project status update",
    "Project planning session",
  ],
  exercise: ["Morning workout session", "Evening run", "Gym session"],
  email: [
    "Reply to emails",
    "Send project update email",
    "Draft email to client",
  ],
  report: [
    "Write quarterly report",
    "Review report draft",
    "Submit report by deadline",
  ],
  review: ["Code review session", "Review pull requests", "Weekly review"],
  design: [
    "Design mockup review",
    "Create design assets",
    "Design system update",
  ],
  plan: [
    "Plan sprint tasks",
    "Plan weekly schedule",
    "Plan project milestones",
  ],
  fix: ["Fix critical bug", "Fix UI issues", "Fix failing tests"],
  test: ["Write unit tests", "Run test suite", "Test new feature"],
  update: [
    "Update dependencies",
    "Update documentation",
    "Update project roadmap",
  ],
  write: ["Write blog post", "Write technical docs", "Write feature spec"],
  submit: ["Submit assignment", "Submit expense report", "Submit application"],
  finish: [
    "Finish onboarding",
    "Finish feature implementation",
    "Finish design review",
  ],
};

export function getSuggestions(value: string): string[] {
  if (value.length < 2) return [];
  const lower = value.toLowerCase();
  const matched: string[] = [];
  for (const [key, suggestions] of Object.entries(SUGGESTION_MAP)) {
    if (key.startsWith(lower) || lower.startsWith(key.slice(0, 3))) {
      matched.push(...suggestions);
    }
  }
  // Also do substring matching for partial words
  for (const [key, suggestions] of Object.entries(SUGGESTION_MAP)) {
    if (
      !matched.includes(suggestions[0]) &&
      key.includes(lower.split(" ")[0])
    ) {
      matched.push(...suggestions);
    }
  }
  return [...new Set(matched)].slice(0, 6);
}

interface SmartSuggestionsProps {
  value: string;
  onSelect: (suggestion: string) => void;
  onClose: () => void;
  visible: boolean;
}

export function SmartSuggestions({
  value,
  onSelect,
  onClose,
  visible,
}: SmartSuggestionsProps) {
  const suggestions = getSuggestions(value);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [onClose]);

  const show = visible && suggestions.length > 0;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          ref={containerRef}
          initial={{ opacity: 0, y: -6, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -4, scale: 0.98 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          className="absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-xl border border-border bg-popover shadow-2xl"
          data-ocid="smart_suggestions.popover"
        >
          <div className="px-2 py-1.5">
            <p className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Smart Suggestions
            </p>
            <ul>
              {suggestions.map((s, i) => (
                <motion.li
                  key={s}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04, duration: 0.12 }}
                >
                  <button
                    type="button"
                    data-ocid={`smart_suggestions.item.${i + 1}`}
                    onClick={() => {
                      onSelect(s);
                      onClose();
                    }}
                    className="group flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-left text-sm transition-colors duration-150 hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none"
                  >
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-primary/15 text-[10px] font-bold text-primary group-hover:bg-primary/25">
                      {i + 1}
                    </span>
                    <span className="min-w-0 truncate">{s}</span>
                  </button>
                </motion.li>
              ))}
            </ul>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
