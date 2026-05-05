import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { Mail, UserPlus } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";

export default function LoginPage() {
  const { loginWithEmail, signupWithEmail, loginWithGoogle, isLoading } =
    useAuth();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const handleEmailAuth = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextEmail = email.trim();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(nextEmail)) {
      setError("Enter a valid email address.");
      return;
    }

    setError("");
    if (mode === "login") {
      loginWithEmail(nextEmail);
    } else {
      signupWithEmail(nextEmail);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 h-96 w-96 rounded-full bg-primary/8 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 h-64 w-64 rounded-full bg-accent/6 blur-2xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        className="relative w-full max-w-md"
      >
        <div
          data-ocid="login.card"
          className="rounded-2xl border border-border bg-card shadow-xl shadow-black/20 p-8 space-y-8"
        >
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="h-14 w-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <svg
                viewBox="0 0 32 32"
                fill="none"
                className="h-8 w-8"
                aria-hidden="true"
              >
                <rect
                  x="4"
                  y="8"
                  width="24"
                  height="3"
                  rx="1.5"
                  fill="oklch(var(--primary))"
                />
                <rect
                  x="4"
                  y="14.5"
                  width="16"
                  height="3"
                  rx="1.5"
                  fill="oklch(var(--primary) / 0.7)"
                />
                <rect
                  x="4"
                  y="21"
                  width="20"
                  height="3"
                  rx="1.5"
                  fill="oklch(var(--primary) / 0.4)"
                />
                <circle cx="26" cy="22.5" r="4" fill="oklch(var(--success))" />
                <path
                  d="M24 22.5l1.5 1.5 2.5-2.5"
                  stroke="oklch(var(--card))"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-display font-bold tracking-tight text-foreground">
                Smart AI Task Manager
              </h1>
              <p className="text-sm text-muted-foreground mt-1 font-body">
                Pro - intelligent task management for modern teams
              </p>
            </div>
          </div>

          <ul className="grid grid-cols-2 gap-2">
            {[
              { label: "Smart Suggestions" },
              { label: "Priority System" },
              { label: "Tag Filters" },
              { label: "Dashboard Stats" },
            ].map((feature) => (
              <li
                key={feature.label}
                className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2 text-xs text-muted-foreground"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                <span className="font-body">{feature.label}</span>
              </li>
            ))}
          </ul>

          <div className="space-y-4">
            <div className="grid grid-cols-2 rounded-lg border border-border bg-muted/40 p-1">
              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setError("");
                }}
                className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  mode === "login"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode("signup");
                  setError("");
                }}
                className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  mode === "signup"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Sign up
              </button>
            </div>

            <Button
              data-ocid="login.google_button"
              type="button"
              variant="outline"
              onClick={loginWithGoogle}
              disabled={isLoading}
              className="w-full h-11 font-display font-semibold text-sm gap-2"
            >
              <span className="flex h-5 w-5 items-center justify-center rounded-full border border-border text-xs font-bold">
                G
              </span>
              Continue with Google
            </Button>

            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-border" />
              <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
                or
              </span>
              <div className="h-px flex-1 bg-border" />
            </div>

            <form onSubmit={handleEmailAuth} className="space-y-3">
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  className="h-11 pl-9"
                  autoComplete="email"
                  data-ocid="login.email_input"
                />
              </div>
              {error && (
                <p className="text-xs text-destructive" role="alert">
                  {error}
                </p>
              )}
              <Button
                data-ocid="login.submit_button"
                type="submit"
                disabled={isLoading}
                className="w-full h-11 font-display font-semibold text-sm gap-2"
              >
                {isLoading ? (
                  <>
                    <LoadingSpinner size="sm" />
                    Signing in...
                  </>
                ) : mode === "login" ? (
                  <>
                    <Mail className="h-4 w-4" />
                    Login with email
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4" />
                    Create account
                  </>
                )}
              </Button>
            </form>

            <p className="text-center text-xs text-muted-foreground">
              {mode === "login"
                ? "Use your email or Google to access your task manager."
                : "Create an account with email or continue with Google."}
            </p>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          created by prasad-06
        </p>
      </motion.div>
    </div>
  );
}
